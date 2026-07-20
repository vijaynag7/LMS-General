// Issues a LiveKit join token for a scheduled live_sessions row, after
// checking the caller is allowed in: tenant staff can always start/join,
// students need an active enrollment in the lesson's course. Faculty
// starting the room also flips live_sessions.status to 'live' and stamps
// started_at, which is what the recording webhook later closes out.
//
// Requires LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET as function
// secrets, pointing at a self-hosted (or LiveKit Cloud, for local dev) server.

import { createClient } from "jsr:@supabase/supabase-js@2";
import { AccessToken } from "npm:livekit-server-sdk@2";
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
  const livekitUrl = Deno.env.get("LIVEKIT_URL");
  const livekitApiKey = Deno.env.get("LIVEKIT_API_KEY");
  const livekitApiSecret = Deno.env.get("LIVEKIT_API_SECRET");

  if (!livekitUrl || !livekitApiKey || !livekitApiSecret) {
    return new Response(JSON.stringify({ error: "LiveKit is not configured on the server yet" }), {
      status: 503,
      headers: corsHeaders,
    });
  }

  const callerClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
  const {
    data: { user },
  } = await callerClient.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401, headers: corsHeaders });
  }

  const { liveSessionId } = await req.json().catch(() => ({}));
  if (!liveSessionId) {
    return new Response(JSON.stringify({ error: "liveSessionId is required" }), { status: 400, headers: corsHeaders });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);

  const { data: session } = await admin
    .from("live_sessions")
    .select("id, status, lesson_id, livekit_room_name, lessons(module_id, modules(course_id))")
    .eq("id", liveSessionId)
    .single();
  if (!session) {
    return new Response(JSON.stringify({ error: "Live session not found" }), { status: 404, headers: corsHeaders });
  }

  const { data: profile } = await admin.from("profiles").select("id, role, name, tenant_id").eq("id", user.id).single();
  if (!profile) {
    return new Response(JSON.stringify({ error: "Profile not found" }), { status: 404, headers: corsHeaders });
  }

  const isStaff = profile.role === "institute_admin" || profile.role === "faculty";
  const courseId = (session.lessons as unknown as { modules?: { course_id?: string } } | null)?.modules?.course_id;

  let allowed = isStaff;
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

  const roomName = session.livekit_room_name ?? `session-${session.id}`;

  if (isStaff && session.status === "scheduled") {
    await admin
      .from("live_sessions")
      .update({ status: "live", started_at: new Date().toISOString(), livekit_room_name: roomName })
      .eq("id", session.id);
  }

  const token = new AccessToken(livekitApiKey, livekitApiSecret, {
    identity: profile.id,
    name: profile.name,
  });
  token.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: isStaff,
    canSubscribe: true,
    canPublishData: true,
  });

  return new Response(JSON.stringify({ token: await token.toJwt(), url: livekitUrl, roomName }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
