-- RLS: enabled on every table (tech-stack.md §5), no exceptions.
-- Cross-tenant isolation is enforced here, not in application code — see
-- PRD §14 "multi-tenant data leakage" risk.

-- ── Helper functions ─────────────────────────────────────────────────
-- SECURITY DEFINER so they can read profiles regardless of the caller's
-- own RLS visibility, without causing policy recursion on public.profiles.

create or replace function public.current_tenant_id()
returns uuid
language sql stable security definer set search_path = public as $$
  select tenant_id from public.profiles where id = auth.uid();
$$;

create or replace function public.current_role()
returns public.role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_super_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'super_admin' from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.is_tenant_staff()
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role in ('institute_admin', 'faculty') from public.profiles where id = auth.uid()), false);
$$;

-- Auto-create a profile row when a new auth user signs up. tenant_id/role/name
-- are supplied via signUp({ options: { data: {...} } }) and land in raw_user_meta_data.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, tenant_id, role, name, phone)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'tenant_id', '')::uuid,
    coalesce(nullif(new.raw_user_meta_data ->> 'role', '')::public.role, 'student'),
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Enable RLS everywhere ────────────────────────────────────────────

alter table public.tenants enable row level security;
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.course_faculty enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.live_sessions enable row level security;
alter table public.attendance enable row level security;
alter table public.batches enable row level security;
alter table public.batch_students enable row level security;
alter table public.payments enable row level security;
alter table public.enrollments enable row level security;
alter table public.quizzes enable row level security;
alter table public.questions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.assignments enable row level security;
alter table public.assignment_submissions enable row level security;
alter table public.certificates enable row level security;
alter table public.notifications enable row level security;

-- ── tenants ───────────────────────────────────────────────────────────
-- Public storefronts need to resolve a tenant by slug before the visitor
-- has an account, so active/trial tenants are readable by anon.

create policy "tenants_select" on public.tenants for select
  using (id = public.current_tenant_id() or status in ('trial', 'active') or public.is_super_admin());

create policy "tenants_update_own" on public.tenants for update
  using (id = public.current_tenant_id() and public.current_role() = 'institute_admin');

create policy "tenants_super_admin_all" on public.tenants for all
  using (public.is_super_admin()) with check (public.is_super_admin());

-- ── profiles ──────────────────────────────────────────────────────────

create policy "profiles_select" on public.profiles for select
  using (id = auth.uid() or (tenant_id = public.current_tenant_id() and public.is_tenant_staff()) or public.is_super_admin());

create policy "profiles_update_own" on public.profiles for update
  using (id = auth.uid() or (tenant_id = public.current_tenant_id() and public.current_role() = 'institute_admin'));

-- ── courses / modules / lessons ──────────────────────────────────────
-- Tenant members see everything in their tenant (incl. drafts); the public
-- only sees published courses. Row visibility here is coarse — actual video
-- playback for non-preview lessons is gated separately via a signed-URL
-- Edge Function that checks enrollment server-side, not by this policy.

create policy "courses_select" on public.courses for select
  using (tenant_id = public.current_tenant_id() or status = 'published');

create policy "courses_write" on public.courses for insert
  with check (tenant_id = public.current_tenant_id() and public.is_tenant_staff());
create policy "courses_update" on public.courses for update
  using (tenant_id = public.current_tenant_id() and public.is_tenant_staff());
create policy "courses_delete" on public.courses for delete
  using (tenant_id = public.current_tenant_id() and public.is_tenant_staff());

create policy "course_faculty_select" on public.course_faculty for select
  using (tenant_id = public.current_tenant_id());
create policy "course_faculty_write" on public.course_faculty for all
  using (tenant_id = public.current_tenant_id() and public.is_tenant_staff())
  with check (tenant_id = public.current_tenant_id() and public.is_tenant_staff());

create policy "modules_select" on public.modules for select
  using (
    tenant_id = public.current_tenant_id()
    or exists (select 1 from public.courses c where c.id = course_id and c.status = 'published')
  );
create policy "modules_write" on public.modules for insert
  with check (tenant_id = public.current_tenant_id() and public.is_tenant_staff());
create policy "modules_update" on public.modules for update
  using (tenant_id = public.current_tenant_id() and public.is_tenant_staff());
create policy "modules_delete" on public.modules for delete
  using (tenant_id = public.current_tenant_id() and public.is_tenant_staff());

create policy "lessons_select" on public.lessons for select
  using (
    tenant_id = public.current_tenant_id()
    or exists (
      select 1 from public.modules m join public.courses c on c.id = m.course_id
      where m.id = module_id and c.status = 'published'
    )
  );
create policy "lessons_write" on public.lessons for insert
  with check (tenant_id = public.current_tenant_id() and public.is_tenant_staff());
create policy "lessons_update" on public.lessons for update
  using (tenant_id = public.current_tenant_id() and public.is_tenant_staff());
create policy "lessons_delete" on public.lessons for delete
  using (tenant_id = public.current_tenant_id() and public.is_tenant_staff());

-- ── live classes & attendance ─────────────────────────────────────────

create policy "live_sessions_select" on public.live_sessions for select
  using (tenant_id = public.current_tenant_id());
create policy "live_sessions_write" on public.live_sessions for all
  using (tenant_id = public.current_tenant_id() and public.is_tenant_staff())
  with check (tenant_id = public.current_tenant_id() and public.is_tenant_staff());

create policy "attendance_select" on public.attendance for select
  using (tenant_id = public.current_tenant_id() and (student_id = auth.uid() or public.is_tenant_staff()));
create policy "attendance_insert_self" on public.attendance for insert
  with check (tenant_id = public.current_tenant_id() and student_id = auth.uid());
create policy "attendance_update_self" on public.attendance for update
  using (tenant_id = public.current_tenant_id() and (student_id = auth.uid() or public.is_tenant_staff()));

-- ── batches ───────────────────────────────────────────────────────────

create policy "batches_select" on public.batches for select
  using (tenant_id = public.current_tenant_id());
create policy "batches_write" on public.batches for all
  using (tenant_id = public.current_tenant_id() and public.is_tenant_staff())
  with check (tenant_id = public.current_tenant_id() and public.is_tenant_staff());

create policy "batch_students_select" on public.batch_students for select
  using (tenant_id = public.current_tenant_id() and (student_id = auth.uid() or public.is_tenant_staff()));
create policy "batch_students_write" on public.batch_students for all
  using (tenant_id = public.current_tenant_id() and public.is_tenant_staff())
  with check (tenant_id = public.current_tenant_id() and public.is_tenant_staff());

-- ── payments & enrollments ────────────────────────────────────────────
-- No insert/update policy for authenticated users: both are written only by
-- Edge Functions running on the service-role key (order creation, webhook
-- confirmation) so a client can never mint its own paid enrollment.

create policy "payments_select" on public.payments for select
  using (tenant_id = public.current_tenant_id() and (student_id = auth.uid() or public.is_tenant_staff()));

create policy "enrollments_select" on public.enrollments for select
  using (tenant_id = public.current_tenant_id() and (student_id = auth.uid() or public.is_tenant_staff()));

-- ── assessments ───────────────────────────────────────────────────────

create policy "quizzes_select" on public.quizzes for select
  using (tenant_id = public.current_tenant_id());
create policy "quizzes_write" on public.quizzes for all
  using (tenant_id = public.current_tenant_id() and public.is_tenant_staff())
  with check (tenant_id = public.current_tenant_id() and public.is_tenant_staff());

create policy "questions_select" on public.questions for select
  using (tenant_id = public.current_tenant_id());
create policy "questions_write" on public.questions for all
  using (tenant_id = public.current_tenant_id() and public.is_tenant_staff())
  with check (tenant_id = public.current_tenant_id() and public.is_tenant_staff());

create policy "quiz_attempts_select" on public.quiz_attempts for select
  using (tenant_id = public.current_tenant_id() and (student_id = auth.uid() or public.is_tenant_staff()));
create policy "quiz_attempts_insert_self" on public.quiz_attempts for insert
  with check (tenant_id = public.current_tenant_id() and student_id = auth.uid());
create policy "quiz_attempts_update_self" on public.quiz_attempts for update
  using (tenant_id = public.current_tenant_id() and student_id = auth.uid());

create policy "assignments_select" on public.assignments for select
  using (tenant_id = public.current_tenant_id());
create policy "assignments_write" on public.assignments for all
  using (tenant_id = public.current_tenant_id() and public.is_tenant_staff())
  with check (tenant_id = public.current_tenant_id() and public.is_tenant_staff());

create policy "assignment_submissions_select" on public.assignment_submissions for select
  using (tenant_id = public.current_tenant_id() and (student_id = auth.uid() or public.is_tenant_staff()));
create policy "assignment_submissions_insert_self" on public.assignment_submissions for insert
  with check (tenant_id = public.current_tenant_id() and student_id = auth.uid());
create policy "assignment_submissions_update" on public.assignment_submissions for update
  using (tenant_id = public.current_tenant_id() and (student_id = auth.uid() or public.is_tenant_staff()));

-- ── certificates & notifications ──────────────────────────────────────
-- Certificates are issued server-side only (completion criteria check).

create policy "certificates_select" on public.certificates for select
  using (tenant_id = public.current_tenant_id() and (student_id = auth.uid() or public.is_tenant_staff()));

create policy "notifications_select_own" on public.notifications for select
  using (user_id = auth.uid());
create policy "notifications_update_own" on public.notifications for update
  using (user_id = auth.uid());
