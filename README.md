# T.J. Fowler DDS

Static marketing website for T.J. Fowler DDS (Knoxville, TN). Hosted on **Cloudflare Pages** with a lightweight **D1** CMS for editable content (staff page first).

## Stack

- **Cloudflare Pages** — static site hosting
- **Cloudflare Pages Functions** — `/api/*` routes
- **Cloudflare D1** — CMS database (`tj-fowler-cms`)
- **Cloudflare Access** — protects `/admin/*` and `/api/admin/*` in production
- **Wrangler** — local dev, migrations, deploy

All services used are on Cloudflare’s **free tier**.

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Log in to Cloudflare

```bash
npx wrangler login
```

### 3. Create the D1 database

```bash
npx wrangler d1 create tj-fowler-cms
```

Copy the `database_id` from the command output into `wrangler.toml` (replace the placeholder UUID).

### 4. Apply migrations

Local (for `npm run dev`):

```bash
npm run db:migrate:local
npm run db:seed:local
```

Production (before or after first deploy):

```bash
npm run db:migrate:prod
npm run db:seed:prod
```

### 5. Environment variables

**Local development** — copy `.dev.vars.example` to `.dev.vars`:

```
CMS_ADMIN_TOKEN=choose-a-long-random-token
```

**Cloudflare Pages dashboard** (Production + Preview):

| Variable | Purpose |
|----------|---------|
| `CMS_ADMIN_TOKEN` | Optional fallback; production should use Cloudflare Access |
| `TURNSTILE_SECRET_KEY` | Optional — contact form Turnstile verification (TODO in code) |

### 6. Run locally

```bash
npm run dev
```

Open `http://localhost:8788/staff.html` for the public staff page.

Open `http://localhost:8788/admin/` — enter your `CMS_ADMIN_TOKEN` when prompted.

### 7. Deploy

```bash
npm run deploy
```

Or connect the Git repo in the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**. Build command: `npm run build`. Output directory: `.` (project root).

### 8. Protect admin routes (production)

In the Cloudflare dashboard:

1. **Zero Trust → Access → Applications → Add an application**
2. Type: **Self-hosted**
3. Application domain: your Pages URL (e.g. `tjfowler.pages.dev`)
4. Paths to protect:
   - `/admin`
   - `/admin/*`
   - `/api/admin`
   - `/api/admin/*`
5. Add an **Allow** policy for authorized staff (email OTP, Google, etc.)

Local dev uses `Authorization: Bearer <CMS_ADMIN_TOKEN>` instead.

## CMS features

### Public API (read-only)

| Route | Description |
|-------|-------------|
| `GET /api/public/site` | Practice name, address, phone, hours, appointments CTA |
| `GET /api/public/pages/staff` | Staff page intro (eyebrow, title, subtitle) |
| `GET /api/public/staff` | Active staff members, sorted by `sort_order` |
| `POST /api/contact` | Contact form submissions (logged to `audit_log`) |

### Admin API (protected)

| Route | Description |
|-------|-------------|
| `GET/PUT /api/admin/site` | Site settings |
| `GET/PUT /api/admin/pages/staff` | Staff page intro |
| `GET/POST /api/admin/staff` | List / create staff |
| `PUT/DELETE /api/admin/staff/:id` | Update / soft-delete staff |

### Admin dashboard

**`/admin/`** — edit staff page intro, staff members (name, initials, bio, order, active), and basic site info.

Legacy **`admin.html`** redirects to `/admin/`.

## Database tables

- `site_settings` — key/value site configuration
- `pages` — per-page CMS content (slug `staff` seeded)
- `staff` — staff members (`photo_key` reserved for future R2 uploads)
- `audit_log` — admin and contact activity

Seed data includes all seven staff bios verbatim.

## npm scripts

| Script | Command |
|--------|---------|
| `npm run dev` | Local Pages dev with D1 |
| `npm run build` | No-op (static site) |
| `npm run preview` | Pages dev against remote D1 |
| `npm run deploy` | Deploy to Cloudflare Pages |
| `npm run db:migrate:local` | Apply migrations locally |
| `npm run db:migrate:prod` | Apply migrations to production D1 |
| `npm run db:seed:local` | Seed local D1 |
| `npm run db:seed:prod` | Seed production D1 |

## Contact form

The contact form posts to `/api/contact`. It includes a notice that users must **not** submit medical, dental, insurance, emergency, or patient health information.

Turnstile verification is stubbed — set `TURNSTILE_SECRET_KEY` and wire the widget when ready.

## Pending / optional

- **R2 staff photos** — schema supports `photo_key`; upload API not implemented yet
- **Turnstile** — secret key + frontend widget
- **Email notifications** — contact submissions are stored in `audit_log` only; add Email Workers or a webhook if needed
- **CMS for other pages** — home, services, etc. still use static HTML

## Credits

Website by [Tristan Maratos](https://tristanmaratos.com).
