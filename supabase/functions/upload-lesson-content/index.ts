// Uploads a document/video file for a lesson to the private "lesson-content"
// Storage bucket and points lessons.content_ref at it. Runs on the
// service-role key rather than relying on client-side Storage RLS, matching
// every other privileged write in this app (invite-user, checkout-order,
// etc.) — keeps the tenant/role check in one place instead of split across
// a storage.objects policy that's awkward to unit-test.
//
// Deploy: supabase functions deploy upload-lesson-content

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

  const callerClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
  const {
    data: { user },
  } = await callerClient.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401, headers: corsHeaders });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);
  const { data: profile } = await admin.from("profiles").select("tenant_id, role").eq("id", user.id).single();
  if (!profile || !["institute_admin", "faculty"].includes(profile.role)) {
    return new Response(JSON.stringify({ error: "Only institute staff can upload lesson content" }), {
      status: 403,
      headers: corsHeaders,
    });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const lessonId = form?.get("lessonId");
  if (!(file instanceof File) || typeof lessonId !== "string") {
    return new Response(JSON.stringify({ error: "file and lessonId are required" }), { status: 400, headers: corsHeaders });
  }

  const { data: lesson } = await admin.from("lessons").select("id, tenant_id").eq("id", lessonId).single();
  if (!lesson || lesson.tenant_id !== profile.tenant_id) {
    return new Response(JSON.stringify({ error: "Lesson not found" }), { status: 404, headers: corsHeaders });
  }

  const path = `${profile.tenant_id}/${lessonId}/${file.name}`;
  const { error: uploadError } = await admin.storage.from("lesson-content").upload(path, file, { upsert: true });
  if (uploadError) {
    return new Response(JSON.stringify({ error: uploadError.message }), { status: 400, headers: corsHeaders });
  }

  const { error: updateError } = await admin.from("lessons").update({ content_ref: { path } }).eq("id", lessonId);
  if (updateError) {
    return new Response(JSON.stringify({ error: updateError.message }), { status: 400, headers: corsHeaders });
  }

  return new Response(JSON.stringify({ path }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
