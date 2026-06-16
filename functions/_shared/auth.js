import { errorResponse } from "./response.js";

/**
 * Admin protection:
 * - Production: Cloudflare Access (Cf-Access-Jwt-Assertion header)
 * - Local dev: Authorization: Bearer <CMS_ADMIN_TOKEN>
 */
export function requireAdmin(request, env) {
  if (request.headers.get("Cf-Access-Jwt-Assertion")) {
    return null;
  }
  const token = env.CMS_ADMIN_TOKEN;
  const auth = request.headers.get("Authorization") || "";
  if (token && auth === `Bearer ${token}`) {
    return null;
  }
  return errorResponse("Unauthorized. Admin access required.", 401);
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function audit(db, action, entityType, entityId, summary) {
  await db
    .prepare(
      "INSERT INTO audit_log (action, entity_type, entity_id, summary) VALUES (?, ?, ?, ?)"
    )
    .bind(action, entityType, entityId ? String(entityId) : null, summary || null)
    .run();
}
