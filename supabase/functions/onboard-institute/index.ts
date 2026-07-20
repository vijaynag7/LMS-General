// Self-serve institute signup (PRD §7.1): creates a new tenant and its first
// institute_admin account atomically. This is the one place a client is
// allowed to create a tenant row — everywhere else, tenants.insert has no
// RLS policy for authenticated users specifically to prevent a random
// student/faculty account from spinning one up.

import { createClient } from "jsr:@supabase/supabase-js@2";
import { sendNotification } from "../_shared/notify.ts";
import { corsHeaders, handlePreflight } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const body = await req.json().catch(() => null);
  const { instituteName, slug, category, adminName, adminEmail, adminPassword } = body ?? {};
  if (!instituteName || !slug || !category || !adminName || !adminEmail || !adminPassword) {
    return new Response(JSON.stringify({ error: "All fields are required" }), { status: 400, headers: corsHeaders });
  }
  if (!/^[a-z0-9-]{3,40}$/.test(slug)) {
    return new Response(JSON.stringify({ error: "Slug must be lowercase letters, numbers, and hyphens only" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);

  const { data: existing } = await admin.from("tenants").select("id").eq("slug", slug).maybeSingle();
  if (existing) {
    return new Response(JSON.stringify({ error: "That subdomain is already taken" }), { status: 409, headers: corsHeaders });
  }

  const { data: tenant, error: tenantError } = await admin
    .from("tenants")
    .insert({ name: instituteName, slug, status: "trial", subscription_plan: "trial" })
    .select("*")
    .single();
  if (tenantError) {
    return new Response(JSON.stringify({ error: tenantError.message }), { status: 400, headers: corsHeaders });
  }

  const { data: userResult, error: userError } = await admin.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: { name: adminName, role: "institute_admin", tenant_id: tenant.id },
  });

  if (userError || !userResult.user) {
    // Roll back the tenant so a failed signup doesn't leave an orphaned row a
    // retry would collide with on slug uniqueness.
    await admin.from("tenants").delete().eq("id", tenant.id);
    return new Response(JSON.stringify({ error: userError?.message ?? "Could not create admin account" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  await sendNotification({
    supabaseUrl,
    serviceRoleKey,
    userId: userResult.user.id,
    tenantId: tenant.id,
    type: "welcome",
    vars: { name: adminName, tenantName: instituteName },
  }).catch(() => {});

  return new Response(JSON.stringify({ tenant, category }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
