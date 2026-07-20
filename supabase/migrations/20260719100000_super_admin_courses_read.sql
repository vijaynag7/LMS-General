-- Super admin needs cross-tenant read access to courses for the platform
-- dashboard (per-institute course counts). Profiles already has this via
-- profiles_select; tenants already has full access via tenants_super_admin_all.

create policy "courses_select_super_admin" on public.courses for select
  using (public.is_super_admin());
