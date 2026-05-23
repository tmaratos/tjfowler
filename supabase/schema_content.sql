-- CMS content tables (run after schema.sql + schema_extensions.sql)

create table if not exists public.navigation_links (
  id uuid primary key default gen_random_uuid(),
  link_key text not null unique,
  label text not null default '',
  href text not null default '',
  location text default 'nav',
  sort_order int not null default 0,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.trust_cards (
  id uuid primary key default gen_random_uuid(),
  card_key text not null unique,
  label text not null default '',
  title text not null default '',
  sort_order int not null default 0,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.cta_blocks (
  id uuid primary key default gen_random_uuid(),
  block_key text unique,
  section_key text not null,
  page_slug text,
  eyebrow text default '',
  title text default '',
  body text default '',
  button_primary_label text default '',
  button_primary_href text default '',
  button_secondary_label text default '',
  button_secondary_href text default '',
  sort_order int not null default 0,
  is_active boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (section_key, page_slug)
);

create table if not exists public.contact_form_fields (
  id uuid primary key default gen_random_uuid(),
  field_key text not null unique,
  label text not null default '',
  placeholder text default '',
  is_required boolean not null default false,
  sort_order int not null default 0,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.ui_labels (
  id uuid primary key default gen_random_uuid(),
  label_key text not null unique,
  label_value text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.navigation_links enable row level security;
alter table public.trust_cards enable row level security;
alter table public.cta_blocks enable row level security;
alter table public.contact_form_fields enable row level security;
alter table public.ui_labels enable row level security;

create policy "public_read_navigation_links" on public.navigation_links
  for select to anon, authenticated using (is_active = true);

create policy "public_read_trust_cards" on public.trust_cards
  for select to anon, authenticated using (is_active = true);

create policy "public_read_cta_blocks" on public.cta_blocks
  for select to anon, authenticated using (is_active = true);

create policy "public_read_contact_form_fields" on public.contact_form_fields
  for select to anon, authenticated using (is_active = true);

create policy "public_read_ui_labels" on public.ui_labels
  for select to anon, authenticated using (true);

create policy "admin_write_navigation_links" on public.navigation_links
  for all to authenticated using (true) with check (true);

create policy "admin_write_trust_cards" on public.trust_cards
  for all to authenticated using (true) with check (true);

create policy "admin_write_cta_blocks" on public.cta_blocks
  for all to authenticated using (true) with check (true);

create policy "admin_write_contact_form_fields" on public.contact_form_fields
  for all to authenticated using (true) with check (true);

create policy "admin_write_ui_labels" on public.ui_labels
  for all to authenticated using (true) with check (true);

-- Optional: allow admins to update submission status
-- create policy "admin_update_submissions" on public.contact_submissions
--   for update to authenticated using (true) with check (true);
