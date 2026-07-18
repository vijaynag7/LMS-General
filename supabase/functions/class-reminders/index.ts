// Meant to run on a schedule (e.g. every 5 minutes via pg_cron calling this
// URL with the service role key, or Supabase's Scheduled Functions once
// available) — not triggered by a client. Finds live_sessions starting in
// ~24h or ~15m and emails every enrolled student once per window, using the
// reminder_24h_sent / reminder_15m_sent flags to avoid duplicates.
//
// pg_cron example (run via `supabase db push` after enabling pg_cron):
//   select cron.schedule('class-reminders', '*/5 * * * *',
//     $$ select net.http_post(
//          url := 'https://<project-ref>.supabase.co/functions/v1/class-reminders',
//          headers := jsonb_build_object('Authorization', 'Bearer ' || '<service-role-key>')
//        ) $$);

import { createClient } from "jsr:@supabase/supabase-js@2";
import { sendNotification } from "../_shared/notify.ts";

const WINDOW_MINUTES = { h24: [23 * 60, 25 * 60], m15: [10, 20] } as const;

Deno.serve(async (req) => {
  const authHeader = req.headers.get("Authorization") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  if (authHeader !== `Bearer ${serviceRoleKey}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const admin = createClient(supabaseUrl, serviceRoleKey);
  const now = Date.now();

  const inWindow = (scheduledAt: string, [minMin, maxMin]: readonly [number, number]) => {
    const minutesUntil = (new Date(scheduledAt).getTime() - now) / 60_000;
    return minutesUntil >= minMin && minutesUntil <= maxMin;
  };

  const { data: sessions } = await admin
    .from("live_sessions")
    .select("*, lessons(title, module_id, modules(course_id))")
    .eq("status", "scheduled")
    .or("reminder_24h_sent.eq.false,reminder_15m_sent.eq.false");

  let sent = 0;
  for (const session of sessions ?? []) {
    const courseId = (session as unknown as { lessons?: { modules?: { course_id?: string } } }).lessons?.modules?.course_id;
    const lessonTitle = (session as unknown as { lessons?: { title?: string } }).lessons?.title ?? "your class";
    if (!courseId) continue;

    const is24h = !session.reminder_24h_sent && inWindow(session.scheduled_at, WINDOW_MINUTES.h24);
    const is15m = !session.reminder_15m_sent && inWindow(session.scheduled_at, WINDOW_MINUTES.m15);
    if (!is24h && !is15m) continue;

    const { data: enrollments } = await admin.from("enrollments").select("student_id").eq("course_id", courseId);
    for (const e of enrollments ?? []) {
      await sendNotification({
        supabaseUrl,
        serviceRoleKey,
        userId: e.student_id,
        tenantId: session.tenant_id,
        type: "class_reminder",
        vars: { lessonName: lessonTitle, scheduledAt: new Date(session.scheduled_at).toLocaleString() },
      }).catch(() => {});
      sent++;
    }

    await admin
      .from("live_sessions")
      .update({
        reminder_24h_sent: session.reminder_24h_sent || is24h,
        reminder_15m_sent: session.reminder_15m_sent || is15m,
      })
      .eq("id", session.id);
  }

  return new Response(JSON.stringify({ ok: true, remindersSent: sent }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
