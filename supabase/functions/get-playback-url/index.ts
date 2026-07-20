// Returns a playable URL for a lesson's video/document, after checking
// server-side that the caller is allowed to see it (free preview, enrolled,
// or tenant staff). This is the enforcement point referenced by the
// "lessons_select" RLS policy comment — the DB row is broadly readable for
// catalog browsing, but the *actual* file is only handed out here.
//
// content_ref on the lesson holds either { "path": "..." } — an object path
// in the private "lesson-content" Storage bucket, signed here on demand —
// or { "url": "..." } for an external CDN/YouTube/Vimeo link, returned as-is.
// This is the access-control model described in PRD §7.11.

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

  const { lessonId } = await req.json().catch(() => ({}));
  if (!lessonId) {
    return new Response(JSON.stringify({ error: "lessonId is required" }), { status: 400, headers: corsHeaders });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);

  const { data: lesson } = await admin
    .from("lessons")
    .select("id, content_ref, is_free_preview, modules(course_id)")
    .eq("id", lessonId)
    .single();

  if (!lesson) {
    return new Response(JSON.stringify({ error: "Lesson not found" }), { status: 404, headers: corsHeaders });
  }

  const { data: profile } = await admin.from("profiles").select("role, tenant_id").eq("id", user.id).single();
  const courseId = (lesson.modules as unknown as { course_id: string } | null)?.course_id;

  let allowed = lesson.is_free_preview || profile?.role === "institute_admin" || profile?.role === "faculty";

  if (!allowed && courseId) {
    const { data: enrollment } = await admin
      .from("enrollments")
      .select("id")
      .eq("student_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle();
    allowed = !!enrollment;
  }

  if (!allowed) {
    return new Response(JSON.stringify({ error: "Not enrolled in this course" }), { status: 403, headers: corsHeaders });
  }

  const contentRef = lesson.content_ref as { url?: string; path?: string } | null;
  let url: string | null = null;
  if (contentRef?.path) {
    const { data: signed } = await admin.storage.from("lesson-content").createSignedUrl(contentRef.path, 60 * 60);
    url = signed?.signedUrl ?? null;
  } else if (contentRef?.url) {
    url = contentRef.url;
  }

  return new Response(JSON.stringify({ url }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
