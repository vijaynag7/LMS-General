-- EduSaaS core schema: tenants, profiles, courses, live classes, enrollment,
-- payments, assessments, certificates, notifications.
-- Multi-tenancy: every tenant-scoped table carries tenant_id + RLS (see
-- 20260718120100_rls_policies.sql for policies).

create extension if not exists pgcrypto;

create type public.role as enum ('super_admin', 'institute_admin', 'faculty', 'student', 'parent', 'support');
create type public.tenant_status as enum ('trial', 'active', 'suspended', 'cancelled');
create type public.course_status as enum ('draft', 'published', 'archived');
create type public.lesson_type as enum ('live', 'recorded', 'quiz', 'assignment', 'document');
create type public.live_session_status as enum ('scheduled', 'live', 'ended', 'cancelled');
create type public.payment_gateway as enum ('razorpay', 'stripe');
create type public.payment_status as enum ('created', 'pending', 'paid', 'failed', 'refunded');
create type public.question_type as enum ('mcq', 'true_false', 'short_answer', 'file_upload');
create type public.notification_channel as enum ('email', 'push', 'sms');
create type public.notification_status as enum ('pending', 'sent', 'failed');

-- ── Tenants & Profiles ──────────────────────────────────────────────────

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  custom_domain text unique,
  branding jsonb not null default '{}'::jsonb,
  gstin text,
  subscription_plan text not null default 'trial',
  status public.tenant_status not null default 'trial',
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  tenant_id uuid references public.tenants (id),
  role public.role not null default 'student',
  name text not null,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index profiles_tenant_id_idx on public.profiles (tenant_id);

-- ── Courses / Modules / Lessons ─────────────────────────────────────────

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id),
  title text not null,
  description text,
  thumbnail_url text,
  price numeric(10, 2) not null default 0,
  currency text not null default 'INR',
  validity_days integer not null default 365,
  status public.course_status not null default 'draft',
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index courses_tenant_id_idx on public.courses (tenant_id);

create table public.course_faculty (
  course_id uuid not null references public.courses (id) on delete cascade,
  faculty_id uuid not null references public.profiles (id) on delete cascade,
  tenant_id uuid not null references public.tenants (id),
  primary key (course_id, faculty_id)
);

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  tenant_id uuid not null references public.tenants (id),
  title text not null,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index modules_course_id_idx on public.modules (course_id);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules (id) on delete cascade,
  tenant_id uuid not null references public.tenants (id),
  title text not null,
  type public.lesson_type not null,
  order_index integer not null default 0,
  content_ref jsonb not null default '{}'::jsonb,
  drip_release_at timestamptz,
  is_free_preview boolean not null default false,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index lessons_module_id_idx on public.lessons (module_id);

-- ── Live Classes & Attendance ────────────────────────────────────────────

create table public.live_sessions (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  tenant_id uuid not null references public.tenants (id),
  scheduled_at timestamptz not null,
  started_at timestamptz,
  ended_at timestamptz,
  livekit_room_name text,
  recording_url text,
  status public.live_session_status not null default 'scheduled',
  created_at timestamptz not null default now()
);

create index live_sessions_lesson_id_idx on public.live_sessions (lesson_id);

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id),
  live_session_id uuid not null references public.live_sessions (id) on delete cascade,
  student_id uuid not null references public.profiles (id),
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  duration_seconds integer not null default 0,
  unique (live_session_id, student_id, joined_at)
);

create index attendance_live_session_id_idx on public.attendance (live_session_id);
create index attendance_student_id_idx on public.attendance (student_id);

-- ── Batches ───────────────────────────────────────────────────────────

create table public.batches (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id),
  course_id uuid not null references public.courses (id) on delete cascade,
  name text not null,
  schedule jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.batch_students (
  batch_id uuid not null references public.batches (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  tenant_id uuid not null references public.tenants (id),
  primary key (batch_id, student_id)
);

-- ── Payments & Enrollment ─────────────────────────────────────────────

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id),
  student_id uuid not null references public.profiles (id),
  course_id uuid references public.courses (id),
  gateway public.payment_gateway not null,
  gateway_order_id text,
  gateway_payment_id text,
  amount numeric(10, 2) not null,
  currency text not null default 'INR',
  status public.payment_status not null default 'created',
  gst_invoice_number text,
  gst_breakup jsonb,
  created_at timestamptz not null default now()
);

create index payments_tenant_id_idx on public.payments (tenant_id);
create index payments_student_id_idx on public.payments (student_id);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id),
  student_id uuid not null references public.profiles (id),
  course_id uuid not null references public.courses (id),
  payment_id uuid references public.payments (id),
  purchased_at timestamptz not null default now(),
  expires_at timestamptz,
  progress_percent numeric(5, 2) not null default 0,
  created_at timestamptz not null default now(),
  unique (student_id, course_id)
);

create index enrollments_tenant_id_idx on public.enrollments (tenant_id);
create index enrollments_student_id_idx on public.enrollments (student_id);

-- ── Assessments ───────────────────────────────────────────────────────

create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id),
  lesson_id uuid references public.lessons (id) on delete cascade,
  title text not null,
  time_limit_minutes integer,
  negative_marking boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id),
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  type public.question_type not null,
  prompt text not null,
  options jsonb,
  correct_option_index integer,
  marks numeric(6, 2) not null default 1,
  negative_marks numeric(6, 2) not null default 0,
  order_index integer not null default 0
);

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id),
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  student_id uuid not null references public.profiles (id),
  answers jsonb not null default '{}'::jsonb,
  score numeric(7, 2),
  started_at timestamptz not null default now(),
  submitted_at timestamptz
);

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id),
  lesson_id uuid references public.lessons (id) on delete cascade,
  title text not null,
  instructions text,
  due_at timestamptz,
  max_marks numeric(6, 2) not null default 100,
  created_at timestamptz not null default now()
);

create table public.assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id),
  assignment_id uuid not null references public.assignments (id) on delete cascade,
  student_id uuid not null references public.profiles (id),
  file_url text,
  submitted_at timestamptz not null default now(),
  grade numeric(6, 2),
  feedback text,
  graded_at timestamptz,
  graded_by uuid references public.profiles (id),
  unique (assignment_id, student_id)
);

-- ── Certificates & Notifications ─────────────────────────────────────

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id),
  student_id uuid not null references public.profiles (id),
  course_id uuid not null references public.courses (id),
  issued_at timestamptz not null default now(),
  certificate_url text,
  unique (student_id, course_id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants (id),
  user_id uuid not null references public.profiles (id),
  type text not null,
  channel public.notification_channel not null default 'email',
  status public.notification_status not null default 'pending',
  payload jsonb not null default '{}'::jsonb,
  sent_at timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_id_idx on public.notifications (user_id);
