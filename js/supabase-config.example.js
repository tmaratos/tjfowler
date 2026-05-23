/**
 * Copy to js/supabase-config.js (gitignored) and add your Supabase URL + publishable key.
 * Never put the service_role / secret key in frontend code.
 */
(function (global) {
  const CONFIG = {
    url: "https://YOUR_PROJECT_REF.supabase.co",
    anonKey: "YOUR_SUPABASE_PUBLISHABLE_KEY",
  };

  let client = null;

  function isConfigured() {
    return Boolean(
      CONFIG.url &&
        CONFIG.anonKey &&
        !String(CONFIG.url).includes("YOUR_PROJECT") &&
        !String(CONFIG.anonKey).includes("YOUR_")
    );
  }

  function getSupabaseClient() {
    if (!isConfigured()) return null;
    if (!client && global.supabase?.createClient) {
      client = global.supabase.createClient(CONFIG.url, CONFIG.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    }
    return client;
  }

  global.SUPABASE_CONFIG = CONFIG;
  global.isSupabaseConfigured = isConfigured;
  global.getSupabaseClient = getSupabaseClient;
})(window);
