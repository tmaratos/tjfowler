import { json } from "../../_shared/response.js";
import { requireAdmin, readJson, audit } from "../../_shared/auth.js";
import { getAllSettings } from "../../_shared/db.js";

export async function onRequestGet(context) {
  const denied = requireAdmin(context.request, context.env);
  if (denied) return denied;
  const settings = await getAllSettings(context.env.DB);
  return json({ settings });
}

export async function onRequestPut(context) {
  const denied = requireAdmin(context.request, context.env);
  if (denied) return denied;

  const body = await readJson(context.request);
  if (!body?.settings || typeof body.settings !== "object") {
    return json({ error: "Invalid settings payload." }, 400);
  }

  const db = context.env.DB;
  const stmt = db.prepare(
    "INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')"
  );

  for (const [key, value] of Object.entries(body.settings)) {
    await stmt.bind(key, String(value ?? "")).run();
  }

  await audit(db, "update", "site_settings", null, `Updated ${Object.keys(body.settings).length} settings`);
  const settings = await getAllSettings(db);
  return json({ settings });
}
