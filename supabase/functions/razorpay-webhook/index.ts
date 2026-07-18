// Async backup confirmation path for Razorpay payments (see verify-payment
// for the primary, client-driven path). Configure this URL + a webhook
// secret in the Razorpay dashboard for the `payment.captured` event.
//
// Secrets required: RAZORPAY_WEBHOOK_SECRET (separate from RAZORPAY_KEY_SECRET).

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
  const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
  if (!webhookSecret) {
    return new Response(JSON.stringify({ error: "Webhook secret not configured" }), { status: 503 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("X-Razorpay-Signature") ?? "";
  const expected = await hmacSha256Hex(webhookSecret, rawBody);
  if (expected !== signature) {
    return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  if (event.event === "payment.captured") {
    const payload = event.payload?.payment?.entity;
    const orderId = payload?.order_id;
    if (orderId) {
      const { data: payment } = await admin.from("payments").select("*").eq("gateway_order_id", orderId).single();
      if (payment && payment.status !== "paid") {
        const invoiceNumber = `INV-${payment.tenant_id.slice(0, 8).toUpperCase()}-${Date.now()}`;
        await admin
          .from("payments")
          .update({
            status: "paid",
            gateway_payment_id: payload.id,
            gst_invoice_number: invoiceNumber,
            gst_breakup: { taxable_value: payment.amount, gst_rate_percent: 0, gst_amount: 0, total: payment.amount },
          })
          .eq("id", payment.id);

        const { data: course } = await admin.from("courses").select("title, validity_days").eq("id", payment.course_id).single();
        const expiresAt = course?.validity_days
          ? new Date(Date.now() + course.validity_days * 24 * 60 * 60 * 1000).toISOString()
          : null;

        await admin.from("enrollments").upsert(
          {
            tenant_id: payment.tenant_id,
            student_id: payment.student_id,
            course_id: payment.course_id!,
            payment_id: payment.id,
            expires_at: expiresAt,
          },
          { onConflict: "student_id,course_id", ignoreDuplicates: true },
        );

        await sendNotification({
          supabaseUrl: Deno.env.get("SUPABASE_URL")!,
          serviceRoleKey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
          userId: payment.student_id,
          tenantId: payment.tenant_id,
          type: "payment_receipt",
          vars: { courseName: course?.title ?? "", amount: `${payment.currency} ${payment.amount}`, invoiceNumber },
        }).catch(() => {});
      }
    }
  }

  if (event.event === "refund.processed") {
    const orderId = event.payload?.payment?.entity?.order_id;
    if (orderId) {
      await admin.from("payments").update({ status: "refunded" }).eq("gateway_order_id", orderId);
    }
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
});
