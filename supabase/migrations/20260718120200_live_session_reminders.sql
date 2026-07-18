-- Dedup flags for the class-reminders Edge Function, so a 24h/15m reminder
-- is never sent twice for the same session.

alter table public.live_sessions
  add column reminder_24h_sent boolean not null default false,
  add column reminder_15m_sent boolean not null default false;
