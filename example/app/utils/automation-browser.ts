declare global {
  interface Window {
    /** Set by QA harnesses (init script) to opt an automation browser in. */
    __plausible?: boolean;
  }
}

/**
 * Automation browsers (Playwright, headless checkers) get no analytics: bot
 * traffic pollutes the dataset and third-party beacons stretch the
 * networkidle window that agent checkers wait on. Real users are unaffected.
 *
 * A QA harness that must prove the trackers fire sets `window.__plausible =
 * true` before the page scripts run — the same opt-in Plausible's own
 * tracker honours — and is treated like a real browser.
 *
 * Gate the `useHead()` call itself, not the value passed to it: `useHead`
 * also runs during SSR, where this helper is always false.
 */
export function isAutomationBrowser(): boolean {
  if (!import.meta.client) return false;
  if (window.__plausible === true) return false;
  return navigator.webdriver === true;
}
