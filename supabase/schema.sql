-- T.J. Fowler DDS — CMS schema for Supabase
-- Run in: Supabase Dashboard → SQL Editor → New query

-- Site-wide settings (address, phone, hours, etc.)
create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  phone text not null default '8656922222',
  phone_display text not null default '865.692.2222',
  fax text default '8656922272',
  fax_display text default '865.692.2272',
  address_line1 text not null default '120 Capital Drive, Suite 102',
  address_line2 text not null default 'Knoxville, TN 37922',
  office_hours jsonb not null default '[]'::jsonb,
  footer_copyright text not null default '© 2026 T.J. Fowler DDS. All rights reserved.',
  updated_at timestamptz not null default now()
);

-- Page metadata
create table if not exists public.pages (
  slug text primary key,
  title text not null,
  meta_description text,
  updated_at timestamptz not null default now()
);

-- Content sections (builder blocks)
create table if not exists public.sections (
  id uuid primary key default gen_random_uuid(),
  page_slug text not null references public.pages(slug) on delete cascade,
  sort_order int not null default 0,
  section_type text not null,
  visible boolean not null default true,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists sections_page_order_idx
  on public.sections (page_slug, sort_order);

-- RLS
alter table public.site_settings enable row level security;
alter table public.pages enable row level security;
alter table public.sections enable row level security;

-- Public read (website visitors)
create policy "Public read site_settings"
  on public.site_settings for select
  to anon, authenticated
  using (true);

create policy "Public read pages"
  on public.pages for select
  to anon, authenticated
  using (true);

create policy "Public read sections"
  on public.sections for select
  to anon, authenticated
  using (visible = true);

-- Authenticated admin write
create policy "Admin manage site_settings"
  on public.site_settings for all
  to authenticated
  using (true)
  with check (true);

create policy "Admin manage pages"
  on public.pages for all
  to authenticated
  using (true)
  with check (true);

create policy "Admin manage sections"
  on public.sections for all
  to authenticated
  using (true)
  with check (true);

-- Allow admin to read hidden sections while editing
create policy "Admin read all sections"
  on public.sections for select
  to authenticated
  using (true);

-- Storage bucket for uploaded images (optional)
-- Create in Dashboard: Storage → New bucket → "media" → Public
