-- Optional columns for full CMS (run if your project was created with the base schema only)

alter table public.site_settings add column if not exists tagline text;
alter table public.site_settings add column if not exists email text;
alter table public.site_settings add column if not exists website_credit_text text default 'Tristan Maratos';
alter table public.site_settings add column if not exists website_credit_url text default 'https://tristanmaratos.com';
alter table public.site_settings add column if not exists contact_form_notice text;
alter table public.site_settings add column if not exists nav_links jsonb not null default '[]'::jsonb;
alter table public.site_settings add column if not exists footer_links jsonb not null default '[]'::jsonb;
alter table public.site_settings add column if not exists trust_cards jsonb not null default '[]'::jsonb;
alter table public.site_settings add column if not exists mobile_call_label text default 'Call Now';
alter table public.site_settings add column if not exists contact_form_labels jsonb not null default '{}'::jsonb;
alter table public.site_settings add column if not exists footer_hours_heading text default 'Office Hours';

alter table public.services add column if not exists name text;
alter table public.services add column if not exists short_description text;
alter table public.services add column if not exists full_description text;

alter table public.page_sections add column if not exists section_key text;
alter table public.page_sections add column if not exists title text;
alter table public.page_sections add column if not exists subtitle text;
alter table public.page_sections add column if not exists body text;
alter table public.page_sections add column if not exists button_label text;
alter table public.page_sections add column if not exists button_url text;
alter table public.page_sections add column if not exists is_visible boolean default true;
alter table public.page_sections add column if not exists sort_order int default 0;

alter table public.site_images add column if not exists title text;
alter table public.site_images add column if not exists is_active boolean default true;

alter table public.contact_submissions add column if not exists status text default 'new';

-- If missing, add in SQL Editor:
-- create policy "admin_update_submissions" on public.contact_submissions for update to authenticated using (true) with check (true);

-- Optional JSON columns (legacy / backup; primary CMS uses schema_content.sql tables)
alter table public.site_settings add column if not exists nav_links jsonb default '[]'::jsonb;
alter table public.site_settings add column if not exists footer_links jsonb default '[]'::jsonb;
alter table public.site_settings add column if not exists trust_cards jsonb default '[]'::jsonb;
alter table public.site_settings add column if not exists contact_form_labels jsonb default '{}'::jsonb;
alter table public.site_settings add column if not exists mobile_call_label text;
alter table public.site_settings add column if not exists footer_hours_heading text;
alter table public.site_settings add column if not exists preview_watermark_text text;
alter table public.site_settings add column if not exists preview_watermark_enabled boolean default false;
