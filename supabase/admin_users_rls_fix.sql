-- Fix admin_users RLS so authenticated users can read their own row by auth uid OR email.
-- Run in Supabase SQL Editor after schema.sql.
--
-- Also ensure each row's user_id matches auth.users.id for that email:
--   update public.admin_users au
--   set user_id = u.id
--   from auth.users u
--   where lower(trim(u.email)) = lower(trim(au.email))
--     and au.user_id is distinct from u.id;

drop policy if exists "admin_read_admin_users" on public.admin_users;

create policy "admin_read_own_admin_row"
on public.admin_users for select to authenticated
using (
  user_id = auth.uid()
  or lower(trim(email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
);
