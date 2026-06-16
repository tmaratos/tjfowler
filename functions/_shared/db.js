export async function getAllSettings(db) {
  const { results } = await db.prepare("SELECT key, value FROM site_settings").all();
  const out = {};
  for (const row of results || []) {
    out[row.key] = row.value;
  }
  return out;
}

export async function getStaffPage(db) {
  return db.prepare("SELECT * FROM pages WHERE slug = ?").bind("staff").first();
}

export async function getActiveStaff(db) {
  const { results } = await db
    .prepare("SELECT * FROM staff WHERE is_active = 1 ORDER BY sort_order ASC, id ASC")
    .all();
  return results || [];
}

export async function getAllStaff(db) {
  const { results } = await db
    .prepare("SELECT * FROM staff ORDER BY sort_order ASC, id ASC")
    .all();
  return results || [];
}
