// The POST handler sets this short-lived receipt only after the provider accepts
// the double-opt-in request. A query parameter alone is never a conversion.
export function consumeSignupReceipt(browser, enabled, gaId) {
  const url = new URL(browser.location.href);
  if (!enabled || url.origin !== "https://wellspokeninstitute.org" ||
      url.pathname.replace(/\/$/, "") !== "/thanks" || url.searchParams.get("s") !== "1" ||
      !browser.document.cookie.split(/;\s*/).includes("__Host-institute_signup=1")) return false;

  browser.document.cookie = "__Host-institute_signup=; Max-Age=0; Path=/; Secure; SameSite=Strict";
  url.searchParams.delete("s");
  browser.history.replaceState(browser.history.state, "", url);
  if (/^G-[A-Z0-9]+$/.test(gaId)) {
    browser.gtag?.("event", "newsletter_signup", { method: "newsletter", send_to: gaId });
  }
  return true;
}
