-- Public-facing instructor/trainer bios shown on a course's marketing page.
-- Deliberately NOT linked to profiles/auth — a trainer listed here doesn't
-- need (or get) an LMS login; this is display content the admin manages
-- directly, matching how the "Meet the Trainers" section works on course
-- marketing pages generally (name/photo/bio, not tied to platform accounts).

create table public.course_instructors (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id),
  course_id uuid not null references public.courses (id) on delete cascade,
  name text not null,
  title text,
  bio text,
  photo_url text,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index course_instructors_course_id_idx on public.course_instructors (course_id);

alter table public.course_instructors enable row level security;

-- Same visibility rule as courses/modules/lessons: tenant staff see everything
-- in their own tenant, the public sees instructors for published courses.
create policy "course_instructors_select" on public.course_instructors for select
  using (
    tenant_id = public.current_tenant_id()
    or exists (select 1 from public.courses c where c.id = course_id and c.status = 'published')
  );

create policy "course_instructors_write" on public.course_instructors for all
  using (tenant_id = public.current_tenant_id() and public.is_tenant_staff())
  with check (tenant_id = public.current_tenant_id() and public.is_tenant_staff());
