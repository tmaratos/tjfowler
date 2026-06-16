import { json } from "../../../_shared/response.js";
import { requireAdmin, readJson, audit } from "../../../_shared/auth.js";

export async function onRequest(context) {
  const denied = requireAdmin(context.request, context.env);
  if (denied) return denied;

  const id = context.params.id;
  if (!id) return json({ error: "Missing staff id." }, 400);

  const db = context.env.DB;
  const existing = await db.prepare("SELECT * FROM staff WHERE id = ?").bind(id).first();
  if (!existing) return json({ error: "Staff member not found." }, 404);

  if (context.request.method === "PUT") {
    const body = await readJson(context.request);
    if (!body?.name?.trim()) return json({ error: "Name is required." }, 400);

    const initials =
      (body.initials || "").trim() ||
      body.name
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .slice(0, 3)
        .toUpperCase();

    await db
      .prepare(
        `UPDATE staff SET initials = ?, name = ?, role = ?, bio = ?, photo_key = ?,
         sort_order = ?, is_active = ?, updated_at = datetime('now') WHERE id = ?`
      )
      .bind(
        initials,
        body.name.trim(),
        body.role?.trim() || null,
        body.bio?.trim() || "",
        body.photo_key ?? existing.photo_key,
        body.sort_order != null ? Number(body.sort_order) : existing.sort_order,
        body.is_active === 0 || body.is_active === false ? 0 : 1,
        id
      )
      .run();

    await audit(db, "update", "staff", id, `Updated staff: ${body.name.trim()}`);
    const row = await db.prepare("SELECT * FROM staff WHERE id = ?").bind(id).first();
    return json({ staff: row });
  }

  if (context.request.method === "DELETE") {
    await db
      .prepare("UPDATE staff SET is_active = 0, updated_at = datetime('now') WHERE id = ?")
      .bind(id)
      .run();
    await audit(db, "deactivate", "staff", id, `Deactivated staff id ${id}`);
    return json({ ok: true });
  }

  return json({ error: "Method not allowed." }, 405);
}
