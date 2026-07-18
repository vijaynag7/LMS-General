-- Demo data for local development. Applied automatically by `supabase db reset`.
-- Test-only credentials — never use this pattern to seed a production project.
-- Login: admin@demo.edusaas.app / faculty@demo.edusaas.app / student@demo.edusaas.app,
-- password "Password123!" for all three.

do $$
declare
  v_tenant_id uuid := '11111111-1111-1111-1111-111111111111';
  v_admin_id uuid := '22222222-2222-2222-2222-222222222222';
  v_faculty_id uuid := '33333333-3333-3333-3333-333333333333';
  v_student_id uuid := '44444444-4444-4444-4444-444444444444';
  v_course_id uuid := '55555555-5555-5555-5555-555555555555';
  v_module_id uuid := '66666666-6666-6666-6666-666666666666';
  v_lesson_live_id uuid := '77777777-7777-7777-7777-777777777777';
  v_lesson_vod_id uuid := '88888888-8888-8888-8888-888888888888';
begin
  insert into public.tenants (id, name, slug, branding, status, subscription_plan)
  values (
    v_tenant_id,
    'Demo Coaching Institute',
    'demo',
    '{"brandColor": "#6D28D9", "logoUrl": ""}'::jsonb,
    'active',
    'trial'
  );

  -- auth.users + auth.identities directly, so the on_auth_user_created
  -- trigger fires and creates the matching public.profiles row.
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change,
    email_change_token_new, recovery_token
  ) values
    ('00000000-0000-0000-0000-000000000000', v_admin_id, 'authenticated', 'authenticated',
     'admin@demo.edusaas.app', crypt('Password123!', gen_salt('bf')), now(),
     '{"provider":"email","providers":["email"]}',
     jsonb_build_object('tenant_id', v_tenant_id, 'role', 'institute_admin', 'name', 'Demo Admin'),
     now(), now(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', v_faculty_id, 'authenticated', 'authenticated',
     'faculty@demo.edusaas.app', crypt('Password123!', gen_salt('bf')), now(),
     '{"provider":"email","providers":["email"]}',
     jsonb_build_object('tenant_id', v_tenant_id, 'role', 'faculty', 'name', 'Demo Faculty'),
     now(), now(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', v_student_id, 'authenticated', 'authenticated',
     'student@demo.edusaas.app', crypt('Password123!', gen_salt('bf')), now(),
     '{"provider":"email","providers":["email"]}',
     jsonb_build_object('tenant_id', v_tenant_id, 'role', 'student', 'name', 'Demo Student'),
     now(), now(), '', '', '', '');

  insert into auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values
    (gen_random_uuid(), v_admin_id::text, v_admin_id, jsonb_build_object('sub', v_admin_id::text, 'email', 'admin@demo.edusaas.app'), 'email', now(), now(), now()),
    (gen_random_uuid(), v_faculty_id::text, v_faculty_id, jsonb_build_object('sub', v_faculty_id::text, 'email', 'faculty@demo.edusaas.app'), 'email', now(), now(), now()),
    (gen_random_uuid(), v_student_id::text, v_student_id, jsonb_build_object('sub', v_student_id::text, 'email', 'student@demo.edusaas.app'), 'email', now(), now(), now());

  insert into public.courses (id, tenant_id, title, description, price, currency, validity_days, status, created_by)
  values (
    v_course_id, v_tenant_id, 'Foundations of Algebra',
    'A demo course seeded for local development — live class + recorded lesson.',
    999.00, 'INR', 365, 'published', v_admin_id
  );

  insert into public.course_faculty (course_id, faculty_id, tenant_id)
  values (v_course_id, v_faculty_id, v_tenant_id);

  insert into public.modules (id, course_id, tenant_id, title, order_index)
  values (v_module_id, v_course_id, v_tenant_id, 'Module 1: Basics', 0);

  insert into public.lessons (id, module_id, tenant_id, title, type, order_index, is_free_preview)
  values
    (v_lesson_live_id, v_module_id, v_tenant_id, 'Live Kickoff Class', 'live', 0, true),
    (v_lesson_vod_id, v_module_id, v_tenant_id, 'Intro Recording', 'recorded', 1, false);

  insert into public.live_sessions (lesson_id, tenant_id, scheduled_at, status)
  values (v_lesson_live_id, v_tenant_id, now() + interval '1 day', 'scheduled');

  insert into public.enrollments (tenant_id, student_id, course_id, purchased_at, expires_at, progress_percent)
  values (v_tenant_id, v_student_id, v_course_id, now(), now() + interval '365 days', 0);
end $$;
