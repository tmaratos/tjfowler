# T.J. Fowler DDS

Static marketing site for T.J. Fowler DDS (Knoxville, TN). Seven HTML pages, healthcare-focused styling, mobile navigation, home slideshow, and before/after showcase on the home page only.

## Local preview

Open `index.html` in a browser, or serve the folder with any static file server.

## Website admin (Supabase CMS)

Dr. Fowler can edit page content at **admin.html** after Supabase is configured.

Setup steps: **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)**

- Copy `js/supabase-config.example.js` → `js/supabase-config.js` (not committed to git)
- Run `supabase/schema.sql` in your Supabase project
- Sign in at `admin.html` and use **Import Site Content** once

Without `js/supabase-config.js`, the public site shows the built-in HTML as usual.

## Credits

Website by [Tristan Maratos](https://tristanmaratos.com).
