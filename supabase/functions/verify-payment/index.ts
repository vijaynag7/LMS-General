// Client-side confirmation path: after Razorpay Checkout succeeds in the
// browser, the client posts the {order_id, payment_id, signature} triple
// here. We recompute the HMAC-SHA256 signature server-side with the key
// secret — if it matches, the payment is genuine and we mark it paid,
// generate a GST invoice record, and create the enrollment.
//
// razorpay-webhook covers the case where the browser never gets to call this
// (tab closed mid-flow) — both paths converge on the same "mark paid + enroll"
// logic, idempotently (enrollments has a unique (student_id, course_id)).

import { createClient } from "jsr:@supabase/supabase-js@2";
import { sendNotification } from "../_shared/notify.ts";

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing Authorization header" }), { status: 401 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
  if (!keySecret) {
    return new Response(JSON.stringify({ error: "Razorpay is not configured on the server yet" }), { status: 503 });
  }

  const callerClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
  const {
    data: { user },
  } = await callerClient.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json().catch(() => ({}));
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return new Response(JSON.stringify({ error: "Missing Razorpay fields" }), { status: 400 });
  }

  const expected = await hmacSha256Hex(keySecret, `${razorpay_order_id}|${razorpay_payment_id}`);
  if (expected !== razorpay_signature) {
    return new Response(JSON.stringify({ error: "Signature mismatch" }), { status: 400 });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);
  const { data: payment } = await admin
    .from("payments")
    .select("*")
    .eq("gateway_order_id", razorpay_order_id)
    .eq("student_id", user.id)
    .single();

  if (!payment) {
    return new Response(JSON.stringify({ error: "Payment record not found" }), { status: 404 });
  }

  let invoiceNumber = payment.gst_invoice_number;
  if (payment.status !== "paid") {
    invoiceNumber = `INV-${payment.tenant_id.slice(0, 8).toUpperCase()}-${Date.now()}`;
    await admin
      .from("payments")
      .update({
        status: "paid",
        gateway_payment_id: razorpay_payment_id,
        gst_invoice_number: invoiceNumber,
        gst_breakup: { taxable_value: payment.amount, gst_rate_percent: 0, gst_amount: 0, total: payment.amount },
      })
      .eq("id", payment.id);
  }

  const { data: course } = await admin.from("courses").select("title, validity_days").eq("id", payment.course_id).single();
  const expiresAt = course?.validity_days
    ? new Date(Date.now() + course.validity_days * 24 * 60 * 60 * 1000).toISOString()
    : null;

  await admin.from("enrollments").upsert(
    {
      tenant_id: payment.tenant_id,
      student_id: user.id,
      course_id: payment.course_id!,
      payment_id: payment.id,
      expires_at: expiresAt,
    },
    { onConflict: "student_id,course_id", ignoreDuplicates: true },
  );

  await sendNotification({
    supabaseUrl,
    serviceRoleKey,
    userId: user.id,
    tenantId: payment.tenant_id,
    type: "payment_receipt",
    vars: {
      courseName: course?.title ?? "",
      amount: `${payment.currency} ${payment.amount}`,
      invoiceNumber: invoiceNumber ?? "",
    },
  }).catch(() => {});

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
});
