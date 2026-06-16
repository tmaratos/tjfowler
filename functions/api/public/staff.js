import { json } from "../../_shared/response.js";
import { getActiveStaff } from "../../_shared/db.js";

export async function onRequestGet(context) {
  const staff = await getActiveStaff(context.env.DB);
  return json({ staff });
}
