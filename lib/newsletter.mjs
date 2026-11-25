export const origin = "https://wellspokeninstitute.org";

export function message(body, status) {
  return new Response(body, { status, headers: { "Cache-Control": "no-store" } });
}

async function readForm(request) {
  const reader = request.body?.getReader();
  if (!reader) return null;
  const decoder = new TextDecoder();
  let size = 0;
  let body = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) return new URLSearchParams(body + decoder.decode());
    size += value.byteLength;
    if (size > 8192) {
      await reader.cancel();
      return null;
    }
    body += decoder.decode(value, { stream: true });
  }
}

async function requestDoubleOptIn(send, apiKey, email, list, template) {
  return send("https://api.brevo.com/v3/contacts/doubleOptinConfirmation", {
    method: "POST", signal: AbortSignal.timeout(10000),
    headers: { "content-type": "application/json", "api-key": apiKey },
    body: JSON.stringify({ email, includeListIds: [list], templateId: template,
      redirectionUrl: origin + "/thanks", contactPixelTrackingConsent: false }),
  });
}

export async function verifiedEmail(request, env, action, send) {
  if (new URL(request.url).origin !== origin || request.headers.get("Origin") !== origin) {
    return message("Please use the form on this website.", 403);
  }
  if (request.headers.get("Content-Type")?.split(";")[0] !== "application/x-www-form-urlencoded") {
    return message("Please use the form on this website.", 415);
  }
  try {
    const form = await readForm(request);
    if (!form) return message("Please return to the form and try again.", 400);
    const email = form.get("email")?.trim();
    const token = form.get("cf-turnstile-response");
    if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        !token || token.length > 2048) return message("Enter your email and complete verification.", 400);
    const verification = await send("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST", body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token }),
      signal: AbortSignal.timeout(8000),
    });
    if (!verification.ok) return message("Verification unavailable. Please try again.", 503);
    const challenge = await verification.json();
    if (challenge.success !== true || challenge.hostname !== new URL(origin).hostname || challenge.action !== action) {
      return message("Verification expired. Return to the form and try again.", 400);
    }
    return email;
  } catch {
    return message("Verification is temporarily unavailable.", 503);
  }
}

export async function subscribe(request, env, send = fetch) {
  const list = Number(env.BREVO_LIST_ID);
  const template = Number(env.BREVO_DOI_TEMPLATE_ID);
  if (!env.TURNSTILE_SECRET || !env.BREVO_API_KEY || !Number.isSafeInteger(list) ||
      list < 1 || !Number.isSafeInteger(template) || template < 1) {
    return message("Subscriptions are temporarily unavailable.", 503);
  }
  const email = await verifiedEmail(request, env, "newsletter", send);
  if (email instanceof Response) return email;
  try {
    const result = await requestDoubleOptIn(send, env.BREVO_API_KEY, email, list, template);
    if (!result.ok) return message("Could not request the confirmation email. Please try again later.", 503);
    return new Response(null, { status: 303, headers: { Location: "/thanks?s=1", "Cache-Control": "no-store",
      "Set-Cookie": "__Host-institute_signup=1; Max-Age=300; Path=/; Secure; SameSite=Strict" } });
  } catch {
    return message("Subscriptions are temporarily unavailable. Please try again later.", 503);
  }
}
