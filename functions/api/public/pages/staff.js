import { json, errorResponse } from "../../../_shared/response.js";
import { getStaffPage } from "../../../_shared/db.js";

export async function onRequestGet(context) {
  const page = await getStaffPage(context.env.DB);
  if (!page) return errorResponse("Page not found.", 404);
  return json({ page });
}
