export async function trackCurriculumClick(browser, gaId) {
  if (browser.location.origin !== "https://wellspokeninstitute.org" ||
      !/^G-[A-Z0-9]+$/.test(gaId) || typeof browser.gtag !== "function") return;
  try {
    const response = await browser.fetch("/api/curriculum-click", { method: "POST", keepalive: true });
    if (response.status === 200) browser.gtag("event", "curriculum_download", { send_to: gaId });
  } catch { /* The PDF link works independently of measurement. */ }
}
