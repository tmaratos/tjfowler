# Supabase CMS Setup — T.J. Fowler DDS

This guide helps you connect the website to Supabase so Dr. Fowler can edit pages at **admin.html**.

## 1. Create a Supabase project

1. Go to [https://supabase.com](https://supabase.com) and sign in.
2. **New project** → choose a name and database password → create.
3. Wait until the project is ready.

## 2. Run the database schema

1. In Supabase: **SQL Editor** → **New query**.
2. Open `supabase/schema.sql` from this project, copy all of it, paste into the editor.
3. Click **Run**.

You should see tables: `site_settings`, `pages`, `sections`.

## 3. Create Dr. Fowler’s login

1. Supabase → **Authentication** → **Users** → **Add user**.
2. Enter email and password (Dr. Fowler will use these on admin.html).
3. Confirm the user (disable “invite only” if email confirmation blocks login).

Only people with a Supabase account can edit content. Do not share the password publicly.

## 4. Connect the website to Supabase

1. Supabase → **Project Settings** → **API**.
2. Copy **Project URL** and **anon public** key.
3. Copy `js/supabase-config.example.js` to `js/supabase-config.js`:

   ```bash
   cp js/supabase-config.example.js js/supabase-config.js
   ```

4. Edit `js/supabase-config.js`:

   ```javascript
   window.SUPABASE_CONFIG = {
     url: "https://YOUR_PROJECT_REF.supabase.co",
     anonKey: "YOUR_ANON_PUBLIC_KEY",
   };
   ```

5. On **each public HTML page**, add this line **before** the other CMS scripts (see section 5).  
   **admin.html** already includes `js/supabase-config.js`.

`js/supabase-config.js` is gitignored so keys are not committed to GitHub.

## 5. Enable CMS on public pages

Each page already includes CMS scripts. After `js/supabase-config.js` exists, the site loads content from Supabase.  
Without that file, pages keep showing the built-in HTML (safe fallback).

Script order on public pages:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="js/supabase-config.js"></script>
<script src="js/cms-defaults.js"></script>
<script src="js/cms-core.js"></script>
<script src="js/cms-render.js"></script>
<script src="js/cms-public.js"></script>
<script src="script.js"></script>
```

`<main>` must have `data-cms-page` with the page slug (already set on all pages).

## 6. First-time content import

1. Open **admin.html** in the browser (same folder as the site).
2. Sign in with the Supabase user you created.
3. Click **Import Site Content** in the sidebar.  
   This loads all current page text and sections from `js/cms-defaults.js` into the database.
4. Edit pages, then click **Save Page** on each page you change.
5. Use **Site Settings** for phone, address, and office hours (header/footer).

## 7. Optional: image uploads

For now, images use paths like `assets/slide0.jpg`. In the admin, edit image paths in section fields.

To use Supabase Storage later:

1. **Storage** → **New bucket** → name `media` → **Public**.
2. Add storage policies for authenticated uploads (ask your developer).

## 8. Using the admin (Dr. Fowler)

| Action | How |
|--------|-----|
| Sign in | Open `admin.html`, email + password |
| Edit a page | Click page name in sidebar |
| Edit text | Change fields in each section block |
| Hide a section | Uncheck **Visible** |
| Reorder | **↑** / **↓** buttons |
| Add section | Choose type → **Add Section** → edit → **Save Page** |
| Delete section | **Delete** → **Save Page** |
| Global phone/hours | **Site Settings** → **Save Settings** |
| Preview | **View Website** opens the live site |

**Important:** Click **Save Page** after edits or they will not appear on the public site.

## 9. Security notes

- The **anon** key is safe in the browser; Row Level Security limits writes to signed-in users.
- Do not put the **service_role** key in the website or admin.html.
- Keep `admin.html` unlinked from the public menu if you prefer (bookmark it only).

## Troubleshooting

| Problem | Fix |
|---------|-----|
| “Supabase is not configured” | Create `js/supabase-config.js` from the example file |
| Login fails | Check user exists in Authentication → Users |
| Site still shows old HTML | Run **Import Site Content**, save pages, hard-refresh browser (Ctrl+F5) |
| Push rejected on Git | `git pull origin main` then push again |
| Slideshow stops | Ensure `script.js` loads after `cms-public.js` |

## Files reference

| File | Purpose |
|------|---------|
| `admin.html` / `admin.js` | Content editor |
| `js/cms-public.js` | Loads CMS data on public pages |
| `js/cms-defaults.js` | Default content + seed source |
| `supabase/schema.sql` | Database tables and security |
