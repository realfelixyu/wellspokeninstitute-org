import { origin, message, verifiedEmail } from "./newsletter.mjs";

const noStore = { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" };
const cookieName = "__Host-institute_pack";
const isTicket = value => typeof value === "string" && /^[a-f0-9]{32}$/.test(value);
async function digest(value) {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, "0")).join("");
}

export async function emailCurriculum(request, env, send = fetch) {
  const db = env.CURRICULUM_RECEIPTS;
  const template = Number(env.BREVO_CURRICULUM_TEMPLATE_ID);
  if (!db || !env.TURNSTILE_SECRET || !env.BREVO_API_KEY || !Number.isSafeInteger(template) ||
      template <= 0 || template === Number(env.BREVO_DOI_TEMPLATE_ID)) {
    return message("Email delivery is unavailable. The PDF is still available to download.", 503);
  }
  const email = await verifiedEmail(request, env, "curriculum", send);
  if (email instanceof Response) return email;
  try {
    const token = crypto.randomUUID().replaceAll("-", "");
    const hash = await digest(token);
    await db.batch([
      db.prepare("DELETE FROM curriculum_receipts WHERE expires_at <= unixepoch()"),
      db.prepare("INSERT INTO curriculum_receipts (digest, expires_at) VALUES (?, unixepoch() + 604800)").bind(hash),
    ]);
    const result = await send("https://api.brevo.com/v3/smtp/email", {
      method: "POST", signal: AbortSignal.timeout(10000),
      headers: { "content-type": "application/json", "api-key": env.BREVO_API_KEY },
      body: JSON.stringify({ to: [{ email }], templateId: template,
        params: { pack_url: origin + "/api/curriculum-ticket?key=" + token } }),
    });
    if (!result.ok) {
      await db.prepare("DELETE FROM curriculum_receipts WHERE digest = ?").bind(hash).run();
      return message("Email delivery is unavailable. The PDF is still available to download.", 503);
    }
    return message("Check your inbox for the teaching pack link.", 200);
  } catch {
    return message("Email delivery is unavailable. The PDF is still available to download.", 503);
  }
}

// An email security scanner can follow this link without consuming the ticket.
export function openCurriculumLink(request) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  const headers = new Headers({ ...noStore, Location: "/curriculum#teaching-pack" });
  if (url.origin === origin && isTicket(key)) {
    headers.set("Set-Cookie", cookieName + "=" + key + "; Path=/; Max-Age=3600; Secure; HttpOnly; SameSite=Lax");
  }
  return new Response(null, { status: 303, headers });
}

export async function redeemCurriculumClick(request, env) {
  if (new URL(request.url).origin !== origin || request.headers.get("Origin") !== origin) return message("", 403);
  const key = (request.headers.get("Cookie") || "").split(/;\s*/).find(pair => pair.startsWith(cookieName + "="))?.split("=")[1];
  if (!isTicket(key) || !env.CURRICULUM_RECEIPTS) return new Response(null, { status: 204, headers: noStore });
  try {
    const result = await env.CURRICULUM_RECEIPTS.prepare(
      "DELETE FROM curriculum_receipts WHERE digest = ? AND expires_at > unixepoch()"
    ).bind(await digest(key)).run();
    const headers = { ...noStore, "Set-Cookie": cookieName + "=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=Lax" };
    return new Response(null, { status: result.meta.changes === 1 ? 200 : 204, headers });
  } catch {
    return message("", 503);
  }
}
