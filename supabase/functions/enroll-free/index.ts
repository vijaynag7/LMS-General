// Self-serve enrollment for free (price = 0) courses. Paid courses go through
// the Razorpay checkout Edge Functions instead (see checkout-order /
// razorpay-webhook) — enrollments are never inserted directly by a client
// because that would let a client mint its own paid access for free.

import { createClient } from "jsr:@supabase/supabase-js@2";
import { sendNotification } from "../_shared/notify.ts";
import { corsHeaders, handlePreflight } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing Authorization header" }), { status: 401, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  const callerClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
  const {
    data: { user },
  } = await callerClient.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401, headers: corsHeaders });
  }

  const { courseId } = await req.json().catch(() => ({}));
  if (!courseId) {
    return new Response(JSON.stringify({ error: "courseId is required" }), { status: 400, headers: corsHeaders });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);

  const { data: course } = await admin
    .from("courses")
    .select("id, tenant_id, title, price, validity_days, status")
    .eq("id", courseId)
    .single();

  if (!course || course.status !== "published") {
    return new Response(JSON.stringify({ error: "Course not found" }), { status: 404, headers: corsHeaders });
  }
  if (Number(course.price) !== 0) {
    return new Response(JSON.stringify({ error: "This course is not free — use checkout-order instead" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const expiresAt = course.validity_days
    ? new Date(Date.now() + course.validity_days * 24 * 60 * 60 * 1000).toISOString()
    : null;

  const { data, error } = await admin
    .from("enrollments")
    .upsert(
      {
        tenant_id: course.tenant_id,
        student_id: user.id,
        course_id: course.id,
        expires_at: expiresAt,
      },
      { onConflict: "student_id,course_id", ignoreDuplicates: true },
    )
    .select("*")
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders });
  }

  await sendNotification({
    supabaseUrl,
    serviceRoleKey,
    userId: user.id,
    tenantId: course.tenant_id,
    type: "enrollment_confirmation",
    vars: { courseName: course.title },
  }).catch(() => {});

  return new Response(JSON.stringify({ enrollment: data }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
