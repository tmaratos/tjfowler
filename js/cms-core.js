/**
 * Shared Supabase + CMS helpers
 */
(function () {
  let client = null;

  function isConfigured() {
    const c = window.SUPABASE_CONFIG;
    return Boolean(
      c &&
        c.url &&
        c.anonKey &&
        !String(c.url).includes("YOUR_PROJECT") &&
        !String(c.anonKey).includes("YOUR_ANON")
    );
  }

  function getClient() {
    if (!isConfigured()) return null;
    if (!client && window.supabase) {
      client = window.supabase.createClient(
        window.SUPABASE_CONFIG.url,
        window.SUPABASE_CONFIG.anonKey
      );
    }
    return client;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function paragraphHtml(text) {
    const t = String(text ?? "");
    if (/<[a-z][\s\S]*>/i.test(t)) return t;
    return `<p>${escapeHtml(t)}</p>`;
  }

  function hoursHtml(hours) {
    if (!Array.isArray(hours)) return "";
    return hours
      .map(
        (h) =>
          `<p><strong>${escapeHtml(h.label)}:</strong> ${escapeHtml(h.time)}</p>`
      )
      .join("");
  }

  window.CmsCore = {
    isConfigured,
    getClient,
    escapeHtml,
    paragraphHtml,
    hoursHtml,
  };
})();
