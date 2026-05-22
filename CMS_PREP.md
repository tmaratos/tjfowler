# CMS front-end prep (static site)

This site is **static-first**: all seven HTML pages render full content with no Supabase or `js/cms-public.js` on public pages. Future CMS work can target the hooks below without changing page URLs or layout.

## Fixed pages

| File | `data-page` on `<body>` |
|------|-------------------------|
| `index.html` | `index` |
| `meet-dr-fowler.html` | `meet-dr-fowler` |
| `services.html` | `services` |
| `staff.html` | `staff` |
| `patient-resources.html` | `patient-resources` |
| `contact.html` | `contact` |
| `404.html` | `404` |

## Data attribute convention

| Attribute | Purpose |
|-----------|---------|
| `data-page` | Page slug (on `body`) |
| `data-section` | Major region: `site-header`, `page-hero`, `staff-list`, `hero`, `trust-cards`, `before-after`, `site-footer`, etc. |
| `data-editable` | Field key for CMS mapping: `page-title`, `phone`, `address`, `fax`, `hero-title`, `staff-name`, `staff-bio`, `staff-photo`, … |
| `data-staff-id` | Stable staff key: `ashleigh`, `kristen`, `lora`, `sissy`, `jen`, `valerie`, `stacy` |
| `data-staff-active` | `"true"` / `"false"` (default `true` in HTML) |
| `data-staff-order` | Display order integer (`1`–`7` on `staff.html`) |

Query examples for a future loader:

- Page: `document.body.dataset.page`
- Section: `[data-section="staff-list"]`
- Field: `[data-editable="phone"]` (may appear in header and footer)
- Staff row: `[data-staff-id="ashleigh"]`

## Staff photos

Each `.staff-card` includes an optional `.staff-card__photo` (`data-editable="staff-photo"`) and `.staff-card__initials` (`data-editable="staff-initials"`). Empty or broken `src` shows a circular initials avatar (CSS + small helper in `script.js`). Set `src` to a real image URL when photos are available.

## Not wired (intentional)

- Do **not** add `<script>` tags for `js/cms-public.js`, `js/cms-core.js`, or Supabase on public HTML until explicitly requested.
- Untracked `js/` and `supabase/` folders from prior work are placeholders only.

## Scripts on public pages

Only `script.js` (mobile nav, home slideshow, staff photo fallback). Site works with JavaScript disabled except slideshow auto-advance and broken-image fallback niceties.
