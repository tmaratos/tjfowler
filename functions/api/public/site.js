import { json } from "../../_shared/response.js";
import { getAllSettings } from "../../_shared/db.js";

export async function onRequestGet(context) {
  const settings = await getAllSettings(context.env.DB);
  return json({ settings });
}
