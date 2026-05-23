/**
 * Supabase client — publishable key only (never service_role in the browser).
 */
(function (global) {
  const CONFIG = {
    url: "https://pckztelmidjdorhglpie.supabase.co",
    anonKey: "sb_publishable_USPJ1erh_rMmb99848kLzw_rrY_fqld",
  };

  let client = null;

  function isConfigured() {
    return Boolean(CONFIG.url && CONFIG.anonKey);
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
