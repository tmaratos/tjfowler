-- T.J. Fowler DDS — Supabase schema (matches seeded production tables)
-- Run in Supabase SQL Editor if tables are missing. Skip tables that already exist.

-- Pages (fixed slugs only)
create table if not exists public.pages (
  slug text primary key,
  title text not null,
  meta_description text,
  updated_at timestamptz not null default now()
);

-- Editable fields per page (field_key matches data-editable in HTML)
create table if not exists public.page_sections (
  id uuid primary key default gen_random_uuid(),
  page_slug text not null references public.pages(slug) on delete cascade,
  field_key text not null,
  field_value text not null default '',
  updated_at timestamptz not null default now(),
  unique (page_slug, field_key)
);

create index if not exists page_sections_slug_idx on public.page_sections (page_slug);

-- Site-wide settings
create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  practice_name text default 'T.J. Fowler DDS',
  phone text default '8656922222',
  phone_display text default '865.692.2222',
  fax text default '8656922272',
  fax_display text default '865.692.2272',
  address_line1 text default '120 Capital Drive, Suite 102',
  address_line2 text default 'Knoxville, TN 37922',
  office_hours jsonb not null default '[]'::jsonb,
  footer_copyright text default '© 2026 T.J. Fowler DDS. All rights reserved.',
  updated_at timestamptz not null default now()
);

-- Services (services.html)
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  eyebrow text not null default '',
  title text not null default '',
  lead text not null default '',
  sort_order int not null default 0,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Staff (staff.html)
create table if not exists public.staff_members (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null default '',
  bio text not null default '',
  photo_url text,
  initials text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Images (slideshow, before/after)
create table if not exists public.site_images (
  id uuid primary key default gen_random_uuid(),
  image_key text not null unique,
  category text not null default 'general',
  public_url text not null,
  alt_text text default '',
  sort_order int not null default 0,
  updated_at timestamptz not null default now()
);

-- Contact form submissions
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  preferred_time text,
  message text not null,
  created_at timestamptz not null default now()
);

-- Allowed admin users (must match Supabase Auth user id)
create table if not exists public.admin_users (
  user_id uuid primary key,
  email text not null,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.pages enable row level security;
alter table public.page_sections enable row level security;
alter table public.site_settings enable row level security;
alter table public.services enable row level security;
alter table public.staff_members enable row level security;
alter table public.site_images enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.admin_users enable row level security;

-- Public read
create policy "public_read_pages" on public.pages for select to anon, authenticated using (true);
create policy "public_read_page_sections" on public.page_sections for select to anon, authenticated using (true);
create policy "public_read_site_settings" on public.site_settings for select to anon, authenticated using (true);
create policy "public_read_services" on public.services for select to anon, authenticated using (is_active = true);
create policy "public_read_staff" on public.staff_members for select to anon, authenticated using (is_active = true);
create policy "public_read_site_images" on public.site_images for select to anon, authenticated using (true);

-- Admin read all (including inactive)
create policy "admin_read_services" on public.services for select to authenticated using (true);
create policy "admin_read_staff" on public.staff_members for select to authenticated using (true);
create policy "admin_read_submissions" on public.contact_submissions for select to authenticated using (true);
create policy "admin_read_admin_users" on public.admin_users for select to authenticated using (auth.uid() = user_id);

-- Contact form: public insert only
create policy "public_insert_contact" on public.contact_submissions
  for insert to anon, authenticated with check (true);

-- Authenticated admin write (pair with admin_users check in app)
create policy "admin_write_pages" on public.pages for all to authenticated using (true) with check (true);
create policy "admin_write_page_sections" on public.page_sections for all to authenticated using (true) with check (true);
create policy "admin_write_site_settings" on public.site_settings for all to authenticated using (true) with check (true);
create policy "admin_write_services" on public.services for all to authenticated using (true) with check (true);
create policy "admin_write_staff" on public.staff_members for all to authenticated using (true) with check (true);
create policy "admin_write_site_images" on public.site_images for all to authenticated using (true) with check (true);

-- Storage buckets: staff-photos, site-images (create in Dashboard, public read)
-- Policies (run after buckets exist):
-- create policy "public_read_storage" on storage.objects for select using (bucket_id in ('staff-photos','site-images'));
-- create policy "admin_upload_storage" on storage.objects for insert to authenticated with check (bucket_id in ('staff-photos','site-images'));
-- create policy "admin_update_storage" on storage.objects for update to authenticated using (bucket_id in ('staff-photos','site-images'));
-- create policy "admin_delete_storage" on storage.objects for delete to authenticated using (bucket_id in ('staff-photos','site-images'));
