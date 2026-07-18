// Creates a Razorpay Order for a paid course and a matching `payments` row
// (status: 'created'). The client opens Razorpay Checkout with the returned
// order_id; on success it calls verify-payment to confirm and enroll.
// razorpay-webhook is the async backup path (payment captured after the
// client closed the tab, refunds, etc).
//
// Secrets required: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET.

import { createClient } from "jsr:@supabase/supabase-js@2";

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
  const keyId = Deno.env.get("RAZORPAY_KEY_ID");
  const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

  if (!keyId || !keySecret) {
    return new Response(JSON.stringify({ error: "Razorpay is not configured on the server yet" }), { status: 503 });
  }

  const callerClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
  const {
    data: { user },
  } = await callerClient.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
  }

  const { courseId } = await req.json().catch(() => ({}));
  if (!courseId) {
    return new Response(JSON.stringify({ error: "courseId is required" }), { status: 400 });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);
  const { data: course } = await admin
    .from("courses")
    .select("id, tenant_id, title, price, currency, status")
    .eq("id", courseId)
    .single();

  if (!course || course.status !== "published") {
    return new Response(JSON.stringify({ error: "Course not found" }), { status: 404 });
  }
  if (Number(course.price) <= 0) {
    return new Response(JSON.stringify({ error: "This course is free — use enroll-free instead" }), { status: 400 });
  }

  // Razorpay amounts are in the smallest currency unit (paise for INR).
  const amountInSubunits = Math.round(Number(course.price) * 100);

  const orderRes = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
    },
    body: JSON.stringify({
      amount: amountInSubunits,
      currency: course.currency,
      notes: { course_id: course.id, student_id: user.id, tenant_id: course.tenant_id },
    }),
  });

  if (!orderRes.ok) {
    const detail = await orderRes.text();
    return new Response(JSON.stringify({ error: `Razorpay order creation failed: ${detail}` }), { status: 502 });
  }
  const order = await orderRes.json();

  const { data: payment, error } = await admin
    .from("payments")
    .insert({
      tenant_id: course.tenant_id,
      student_id: user.id,
      course_id: course.id,
      gateway: "razorpay",
      gateway_order_id: order.id,
      amount: course.price,
      currency: course.currency,
      status: "created",
    })
    .select("id")
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }

  return new Response(
    JSON.stringify({
      orderId: order.id,
      amount: amountInSubunits,
      currency: course.currency,
      keyId,
      paymentId: payment.id,
      courseTitle: course.title,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
});
