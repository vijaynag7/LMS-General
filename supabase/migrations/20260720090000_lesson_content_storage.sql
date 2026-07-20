-- Storage bucket for lesson content (documents, recorded videos). Private —
-- nothing is directly readable by clients; the get-playback-url Edge
-- Function mints short-lived signed URLs after checking enrollment/staff
-- access, per PRD §7.11. Uploads/deletes are scoped by folder to the
-- uploader's own tenant: path convention is "{tenant_id}/{lesson_id}/{filename}".

insert into storage.buckets (id, name, public)
values ('lesson-content', 'lesson-content', false)
on conflict (id) do nothing;

create policy "lesson_content_insert_staff" on storage.objects for insert
  with check (
    bucket_id = 'lesson-content'
    and public.is_tenant_staff()
    and (storage.foldername(name))[1] = public.current_tenant_id()::text
  );

create policy "lesson_content_update_staff" on storage.objects for update
  using (
    bucket_id = 'lesson-content'
    and public.is_tenant_staff()
    and (storage.foldername(name))[1] = public.current_tenant_id()::text
  );

create policy "lesson_content_delete_staff" on storage.objects for delete
  using (
    bucket_id = 'lesson-content'
    and public.is_tenant_staff()
    and (storage.foldername(name))[1] = public.current_tenant_id()::text
  );
