/**
 * Loads CMS content from Supabase on public pages.
 * Falls back to static HTML when Supabase is not configured.
 *
 * NOT WIRED: Do not include this script on public HTML until CMS is approved.
 * The static site uses data-* hooks in HTML and CMS_PREP.md instead.
 */
(function () {
  async function fetchCmsData(pageSlug) {
    const sb = window.CmsCore.getClient();
    if (!sb) return null;

    const [settingsRes, pageRes, sectionsRes] = await Promise.all([
      sb.from("site_settings").select("*").eq("id", 1).maybeSingle(),
      sb.from("pages").select("*").eq("slug", pageSlug).maybeSingle(),
      sb
        .from("sections")
        .select("*")
        .eq("page_slug", pageSlug)
        .order("sort_order", { ascending: true }),
    ]);

    if (settingsRes.error) console.warn("CMS settings:", settingsRes.error);
    if (sectionsRes.error) console.warn("CMS sections:", sectionsRes.error);

    const defaults = window.CMS_DEFAULTS;
    const settings = settingsRes.data || defaults.siteSettings;
    const pageMeta = pageRes.data || defaults.pages[pageSlug];
    let sections = sectionsRes.data;

    if (!sections || sections.length === 0) {
      sections = (defaults.pages[pageSlug]?.sections || []).map((s, i) => ({
        ...s,
        id: `default-${i}`,
        page_slug: pageSlug,
        sort_order: i,
      }));
    }

    return { settings, pageMeta, sections };
  }

  function initSliderIfNeeded() {
    if (typeof window.initHeroSlider === "function") {
      window.initHeroSlider();
    }
  }

  function loadOptionalConfig() {
    return new Promise((resolve) => {
      if (window.SUPABASE_CONFIG?.url && window.SUPABASE_CONFIG?.anonKey) {
        resolve(true);
        return;
      }
      const existing = document.querySelector('script[data-cms-config]');
      if (existing) {
        resolve(window.CmsCore.isConfigured());
        return;
      }
      const s = document.createElement("script");
      s.src = "js/supabase-config.js";
      s.setAttribute("data-cms-config", "1");
      s.onload = () => resolve(window.CmsCore.isConfigured());
      s.onerror = () => resolve(false);
      document.head.appendChild(s);
    });
  }

  async function init() {
    const main = document.querySelector("main[data-cms-page]");
    if (!main) return;

    const hasConfig = await loadOptionalConfig();
    if (!hasConfig || !window.CmsCore.isConfigured()) return;

    const pageSlug = main.getAttribute("data-cms-page");
    if (!pageSlug) return;

    main.classList.add("cms-main--loading");

    try {
      const data = await fetchCmsData(pageSlug);
      if (!data) return;

      const { settings, pageMeta, sections } = data;

      if (pageMeta?.title) document.title = pageMeta.title;
      if (pageMeta?.meta_description) {
        let meta = document.querySelector('meta[name="description"]');
        if (!meta) {
          meta = document.createElement("meta");
          meta.name = "description";
          document.head.appendChild(meta);
        }
        meta.content = pageMeta.meta_description;
      }

      main.innerHTML = window.CmsRender.renderPage(sections, pageSlug);
      window.CmsRender.applySiteSettings(settings);
      initSliderIfNeeded();
      main.classList.remove("cms-main--loading");
      main.classList.add("cms-main--ready");
    } catch (err) {
      console.warn("CMS load failed, using static HTML.", err);
      main.classList.remove("cms-main--loading");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
