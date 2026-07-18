// Receives LiveKit server webhooks (room_finished, egress_ended). Configure
// this URL in your LiveKit server's webhook config alongside the same
// LIVEKIT_API_KEY/SECRET used by live-room, so signatures verify.
//
// room_finished -> marks the live_sessions row 'ended'.
// egress_ended  -> attaches the recording URL once the egress (recording)
//                  pipeline has flushed the file to storage; this is the
//                  "auto-recording published as a Recorded Class lesson"
//                  hook from PRD §7.3 — recording_url lives on live_sessions,
//                  and the course player treats an ended session with a
//                  recording as playable VOD for that same lesson.

import { createClient } from "jsr:@supabase/supabase-js@2";
import { WebhookReceiver } from "npm:livekit-server-sdk@2";

Deno.serve(async (req) => {
  const livekitApiKey = Deno.env.get("LIVEKIT_API_KEY");
  const livekitApiSecret = Deno.env.get("LIVEKIT_API_SECRET");
  if (!livekitApiKey || !livekitApiSecret) {
    return new Response(JSON.stringify({ error: "LiveKit is not configured on the server yet" }), { status: 503 });
  }

  const receiver = new WebhookReceiver(livekitApiKey, livekitApiSecret);
  const body = await req.text();
  const authHeader = req.headers.get("Authorization") ?? "";

  let event;
  try {
    event = await receiver.receive(body, authHeader);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid webhook signature" }), { status: 401 });
  }

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const roomName = event.room?.name;

  if (event.event === "room_finished" && roomName) {
    await admin
      .from("live_sessions")
      .update({ status: "ended", ended_at: new Date().toISOString() })
      .eq("livekit_room_name", roomName)
      .eq("status", "live");
  }

  if (event.event === "egress_ended" && roomName) {
    const fileUrl = event.egressInfo?.fileResults?.[0]?.location;
    if (fileUrl) {
      await admin.from("live_sessions").update({ recording_url: fileUrl }).eq("livekit_room_name", roomName);
    }
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
});
