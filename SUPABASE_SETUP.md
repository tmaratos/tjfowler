# Supabase setup — T.J. Fowler DDS

## Frontend config

`js/supabase-config.js` holds the project URL and **publishable** key (gitignored locally). Copy from `js/supabase-config.example.js` if needed.

Never commit or use the **secret** / `service_role` key in HTML or JS.

## Auth & admin

1. Supabase → **Authentication** → Email provider enabled.
2. Admin user must exist in **Auth** and in `admin_users`.
3. **Redirect URLs** (Authentication → URL configuration) must include:
   - `https://tmaratos.github.io/tjfowler/admin.html`
   - `http://127.0.0.1:5500/admin.html`
   - `http://localhost:5500/admin.html`

## Password reset

Admin → **Forgot password?** sends `resetPasswordForEmail` with the redirect above. After the email link, `admin.html` shows **Set New Password** and calls `updateUser({ password })`.

## Storage

Public buckets: `staff-photos`, `site-images`. Run `supabase/storage_policies.sql`.

Uploads: JPG, JPEG, PNG, WebP only.

## Schema files (run in order if tables missing)

1. `supabase/schema.sql` — base tables
2. `supabase/schema_extensions.sql` — optional columns on existing tables
3. `supabase/schema_content.sql` — `navigation_links`, `trust_cards`, `cta_blocks`, `contact_form_fields`, `ui_labels` + RLS

## Tables

| Table | Public read | Admin write |
|-------|-------------|-------------|
| `site_settings` | yes | yes |
| `page_sections` | yes | yes |
| `navigation_links` | active rows | yes |
| `trust_cards` | active rows | yes |
| `cta_blocks` | active rows | yes |
| `contact_form_fields` | active rows | yes |
| `ui_labels` | yes | yes |
| `services` | active | yes |
| `staff_members` | active | yes |
| `site_images` | yes | yes |
| `contact_submissions` | insert only (anon) | read + status update |
| `admin_users` | own row | — |

## Public site scripts

All 7 HTML pages load:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="js/supabase-config.js"></script>
<script src="js/cms-core.js"></script>
<script src="js/site-content.js"></script>
<script src="script.js"></script>
```

`contact.html` also loads `js/contact-form.js`.

Static HTML remains visible if Supabase is unavailable.

## Admin panels (11)

| Panel | Table(s) |
|-------|----------|
| Site Settings | `site_settings` |
| Nav & Footer | `navigation_links` (`link_key` matches `data-link-key` in HTML) |
| Page Sections | `page_sections` |
| Services | `services` |
| Staff | `staff_members` + `staff-photos` storage |
| Images | `site_images` + `site-images` storage |
| Trust Cards | `trust_cards` (`card_key` matches `data-trust-card` on home) |
| CTA Blocks | `cta_blocks` (`section_key` + `page_slug`, button_* columns) |
| Form Fields | `contact_form_fields` |
| UI Labels | `ui_labels` |
| Contact Messages | `contact_submissions` |

## Verify

- Public pages work with static fallback when offline
- `admin.html` login for `admin_users` only; others see **Access Denied**
- Staff photo initials fallback; slideshow and mobile nav work
- Contact form inserts to `contact_submissions`
