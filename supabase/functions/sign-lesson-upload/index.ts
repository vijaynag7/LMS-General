// Issues a signed Storage upload URL for a lesson's content, instead of
// proxying the file body through this function. Two reasons:
//
// 1. Supabase Storage object keys reject characters real-world filenames
//    routinely contain (brackets, parens, etc. from things like resume
//    exports) — sanitized here, once, server-side.
// 2. Edge Functions aren't meant to carry large request bodies (video
//    files can be hundreds of MB); a signed upload URL lets the browser
//    PUT the file straight to Storage, so only this small JSON exchange
//    goes through the function.
//
// The signed URL/token is itself the authorization for that one upload —
// it doesn't rely on storage.objects RLS evaluating correctly for the
// caller's session, which sidesteps a flaky interaction we hit trying
// that route directly.

import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders, handlePreflight } from "../_shared/cors.ts";

function sanitizeFilename(name: string): string {
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot + 1).replace(/[^a-zA-Z0-9]/g, "") : "";
  const safeBase = base.replace(/[^a-zA-Z0-9-_ ]/g, "").trim().replace(/\s+/g, "-").slice(0, 80) || "file";
  return ext ? `${safeBase}.${ext}` : safeBase;
}

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

  const { lessonId, fileName } = await req.json().catch(() => ({}));
  if (!lessonId || !fileName) {
    return new Response(JSON.stringify({ error: "lessonId and fileName are required" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const { data: lesson } = await admin.from("lessons").select("id, tenant_id").eq("id", lessonId).single();
  if (!lesson || lesson.tenant_id !== profile.tenant_id) {
    return new Response(JSON.stringify({ error: "Lesson not found" }), { status: 404, headers: corsHeaders });
  }

  const path = `${profile.tenant_id}/${lessonId}/${sanitizeFilename(fileName)}`;
  const { data: signed, error } = await admin.storage.from("lesson-content").createSignedUploadUrl(path, {
    upsert: true,
  });
  if (error || !signed) {
    return new Response(JSON.stringify({ error: error?.message ?? "Could not create upload URL" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  return new Response(JSON.stringify({ path: signed.path, token: signed.token }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
