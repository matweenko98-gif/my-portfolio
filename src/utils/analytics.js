export function hasAnalyticsConsent() {
  try { return localStorage.getItem('cookie_accepted') === 'true'; }
  catch { return false; }
}

export function trackConversion(name, parameters = {}) {
  if (!hasAnalyticsConsent() || /^\/admin(?:-keis)?(?:\/|$)/.test(location.pathname)) return;
  // Only use predefined event properties; never send form fields or contact data.
  window.gtag?.('event', name, parameters);
  window.ym?.(109905970, 'reachGoal', name, parameters);
}
