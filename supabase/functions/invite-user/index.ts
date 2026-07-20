// Invites a faculty or student into the caller's tenant. Runs with the
// service-role key because creating an auth.users row (and therefore, via
// the on_auth_user_created trigger, a profiles row with the right tenant_id
// and role) is not something a client-side anon/authenticated key can do.
//
// Deploy: supabase functions deploy invite-user
// Secrets required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (set automatically
// for Edge Functions), SITE_URL (used to build the invite redirect link).

import { createClient } from "jsr:@supabase/supabase-js@2";
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

  // Verify the caller and check they're institute_admin for the tenant they're inviting into.
  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
  } = await callerClient.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401, headers: corsHeaders });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);
  const { data: callerProfile } = await admin.from("profiles").select("tenant_id, role").eq("id", user.id).single();

  if (!callerProfile || callerProfile.role !== "institute_admin") {
    return new Response(JSON.stringify({ error: "Only institute admins can invite users" }), {
      status: 403,
      headers: corsHeaders,
    });
  }

  const body = await req.json().catch(() => null);
  const { email, name, role, phone } = body ?? {};
  if (!email || !name || !["faculty", "student"].includes(role)) {
    return new Response(JSON.stringify({ error: "email, name, and role ('faculty'|'student') are required" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${Deno.env.get("SITE_URL") ?? ""}/login`,
    data: { name, role, phone: phone ?? null, tenant_id: callerProfile.tenant_id },
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders });
  }

  return new Response(JSON.stringify({ user: data.user }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
