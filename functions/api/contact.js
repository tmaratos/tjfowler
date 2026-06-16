import { json } from "../_shared/response.js";
import { readJson, audit } from "../_shared/auth.js";

export async function onRequestPost(context) {
  const body = await readJson(context.request);
  if (!body) return json({ error: "Invalid request." }, 400);

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const message = String(body.message || "").trim();

  if (!name || !email || !message) {
    return json({ error: "Name, email, and message are required." }, 400);
  }

  // TODO: Verify Cloudflare Turnstile when TURNSTILE_SECRET_KEY is configured
  // if (context.env.TURNSTILE_SECRET_KEY && body.turnstile_token) { ... }

  const summary = JSON.stringify({
    name,
    email,
    phone: body.phone || null,
    preferred_time: body.preferred_time || null,
    message: message.slice(0, 2000),
  });

  await audit(context.env.DB, "contact_submit", "contact", null, summary);

  return json({
    ok: true,
    message: "Thank you. Your message was received. We will respond during business hours.",
  });
}
