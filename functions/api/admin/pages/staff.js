import { json } from "../../../_shared/response.js";
import { requireAdmin, readJson, audit } from "../../../_shared/auth.js";
import { getStaffPage } from "../../../_shared/db.js";

export async function onRequestGet(context) {
  const denied = requireAdmin(context.request, context.env);
  if (denied) return denied;
  const page = await getStaffPage(context.env.DB);
  return json({ page });
}

export async function onRequestPut(context) {
  const denied = requireAdmin(context.request, context.env);
  if (denied) return denied;

  const body = await readJson(context.request);
  if (!body?.page) return json({ error: "Invalid page payload." }, 400);

  const p = body.page;
  const db = context.env.DB;
  await db
    .prepare(
      `UPDATE pages SET eyebrow = ?, title = ?, subtitle = ?, seo_title = ?, seo_description = ?, updated_at = datetime('now') WHERE slug = 'staff'`
    )
    .bind(
      p.eyebrow?.trim() || null,
      p.title?.trim() || "Meet Our Staff",
      p.subtitle?.trim() || null,
      p.seo_title?.trim() || null,
      p.seo_description?.trim() || null
    )
    .run();

  await audit(db, "update", "pages", "staff", "Updated staff page intro");
  const page = await getStaffPage(db);
  return json({ page });
}
