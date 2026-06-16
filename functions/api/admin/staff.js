import { json } from "../../_shared/response.js";
import { requireAdmin, readJson, audit } from "../../_shared/auth.js";
import { getAllStaff } from "../../_shared/db.js";

export async function onRequestGet(context) {
  const denied = requireAdmin(context.request, context.env);
  if (denied) return denied;
  const staff = await getAllStaff(context.env.DB);
  return json({ staff });
}

export async function onRequestPost(context) {
  const denied = requireAdmin(context.request, context.env);
  if (denied) return denied;

  const body = await readJson(context.request);
  if (!body?.name?.trim()) {
    return json({ error: "Name is required." }, 400);
  }

  const db = context.env.DB;
  const maxRow = await db.prepare("SELECT MAX(sort_order) AS m FROM staff").first();
  const sortOrder = body.sort_order != null ? Number(body.sort_order) : (maxRow?.m || 0) + 1;

  const initials =
    (body.initials || "").trim() ||
    body.name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 3)
      .toUpperCase();

  const result = await db
    .prepare(
      `INSERT INTO staff (initials, name, role, bio, photo_key, sort_order, is_active, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`
    )
    .bind(
      initials,
      body.name.trim(),
      body.role?.trim() || null,
      body.bio?.trim() || "",
      body.photo_key || null,
      sortOrder,
      body.is_active === 0 || body.is_active === false ? 0 : 1
    )
    .run();

  const id = result.meta?.last_row_id;
  await audit(db, "create", "staff", id, `Created staff: ${body.name.trim()}`);
  const row = await db.prepare("SELECT * FROM staff WHERE id = ?").bind(id).first();
  return json({ staff: row }, 201);
}
