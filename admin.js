/**
 * T.J. Fowler DDS — Admin CMS (Supabase Auth + publishable key only).
 */
(function () {
  const {
    PAGES,
    PAGE_FIELDS,
    PAGE_FIELD_DEFS,
    PAGE_STRUCTURED_SECTIONS,
    SLIDE_KEYS,
    CTA_BLOCK_KEYS,
    CONTACT_FORM_FIELD_KEYS,
    UI_LABEL_KEYS,
  } = window.CmsCatalog || {};

  const HOMEPAGE_FIELD_KEYS = [
    "hero-cta-primary-label",
    "hero-cta-primary-url",
    "hero-cta-secondary-label",
    "hero-cta-secondary-url",
  ];

  const loginView = document.getElementById("login-view");
  const forgotView = document.getElementById("forgot-view");
  const resetView = document.getElementById("reset-view");
  const deniedView = document.getElementById("denied-view");
  const appView = document.getElementById("app-view");

  const loginForm = document.getElementById("login-form");
  const forgotForm = document.getElementById("forgot-form");
  const resetForm = document.getElementById("reset-form");
  const loginAlert = document.getElementById("login-alert");
  const forgotAlert = document.getElementById("forgot-alert");
  const resetAlert = document.getElementById("reset-alert");
  const globalAlert = document.getElementById("global-alert");

  const pageSlugSelect = document.getElementById("page-slug-select");
  const sectionsEditor = document.getElementById("sections-editor");
  const structuredSectionsEditor = document.getElementById("structured-sections-editor");
  const servicesEditor = document.getElementById("services-editor");
  const staffEditor = document.getElementById("staff-editor");
  const logoEditor = document.getElementById("logo-editor");
  const slideshowEditor = document.getElementById("slideshow-editor");
  const showcaseEditor = document.getElementById("showcase-editor");
  const submissionsList = document.getElementById("submissions-list");
  const navigationEditor = document.getElementById("navigation-editor");
  const trustEditor = document.getElementById("trust-editor");
  const ctaEditor = document.getElementById("cta-editor");
  const formFieldsEditor = document.getElementById("form-fields-editor");
  const labelsEditor = document.getElementById("labels-editor");
  let sb = null;
  let currentUser = null;
  let sectionRows = [];
  let settingsCache = null;
  let navCache = [];
  let trustCache = [];
  let ctaCache = [];
  let formFieldsCache = [];
  let labelsCache = [];
  let panelsLoaded = false;
  let bootstrapping = true;

  function showAlert(el, message, type) {
    if (!el) return;
    el.textContent = message || "";
    el.className = "admin-alert admin-alert--" + (type || "info");
    el.hidden = !message;
  }

  function showGlobal(message, type) {
    showAlert(globalAlert, message, type);
    if (message) setTimeout(() => showAlert(globalAlert, "", ""), 6000);
  }

  function showView(view) {
    const map = { login: loginView, forgot: forgotView, reset: resetView, denied: deniedView, app: appView };
    Object.entries(map).forEach(([key, el]) => {
      if (!el) return;
      if (key === "app") {
        el.hidden = view !== "app";
        el.classList.toggle("is-active", view === "app");
      } else {
        el.hidden = key !== view;
      }
    });
  }

  function getClient() {
    if (!window.isSupabaseConfigured?.()) return null;
    return window.getSupabaseClient?.() || null;
  }

  function getPasswordResetRedirect() {
    const host = window.location.hostname;
    if (host === "127.0.0.1" || host === "localhost") {
      return `${window.location.origin}${window.location.pathname}`;
    }
    return "https://tmaratos.github.io/tjfowler/admin.html";
  }

  function isRecoveryHash() {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return false;
    const params = new URLSearchParams(hash);
    return params.get("type") === "recovery" || hash.includes("type=recovery");
  }

  async function isAdminUser(user) {
    if (!user || !sb) return false;
    const { data, error } = await sb.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
    if (error) console.warn("[admin] admin_users", error);
    return Boolean(data);
  }

  async function resolveSession() {
    sb = getClient();
    if (!sb) {
      showAlert(loginAlert, "Supabase is not configured.", "error");
      showView("login");
      return;
    }

    if (isRecoveryHash()) {
      showView("reset");
      return;
    }

    const { data } = await sb.auth.getSession();
    currentUser = data.session?.user || null;
    if (!currentUser) {
      showView("login");
      return;
    }

    if (!(await isAdminUser(currentUser))) {
      showView("denied");
      return;
    }

    showView("app");
    if (!panelsLoaded) {
      panelsLoaded = true;
      await loadAllPanels();
      window.dispatchEvent(new Event("admin-panels-load"));
    }
  }

  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    sb = getClient();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    showAlert(loginAlert, "Signing in…", "info");
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
      showAlert(loginAlert, error.message, "error");
      return;
    }
    currentUser = data.user;
    if (!(await isAdminUser(currentUser))) {
      showAlert(loginAlert, "", "");
      showView("denied");
      return;
    }
    showAlert(loginAlert, "", "");
    panelsLoaded = false;
    await resolveSession();
  });

  document.getElementById("btn-show-forgot")?.addEventListener("click", () => {
    showAlert(loginAlert, "", "");
    showView("forgot");
  });

  document.getElementById("btn-back-login-from-forgot")?.addEventListener("click", () => showView("login"));

  forgotForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    sb = getClient();
    const email = document.getElementById("forgot-email").value.trim();
    showAlert(forgotAlert, "Sending reset link…", "info");
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: getPasswordResetRedirect(),
    });
    if (error) {
      showAlert(forgotAlert, error.message, "error");
      return;
    }
    showAlert(
      forgotAlert,
      "If that email is registered, a reset link was sent. Check your inbox.",
      "success"
    );
  });

  resetForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    sb = getClient();
    const pw = document.getElementById("reset-password").value;
    const confirm = document.getElementById("reset-password-confirm").value;
    if (pw !== confirm) {
      showAlert(resetAlert, "Passwords do not match.", "error");
      return;
    }
    if (pw.length < 8) {
      showAlert(resetAlert, "Password must be at least 8 characters.", "error");
      return;
    }
    showAlert(resetAlert, "Updating password…", "info");
    const { error } = await sb.auth.updateUser({ password: pw });
    if (error) {
      showAlert(resetAlert, error.message, "error");
      return;
    }
    history.replaceState(null, "", window.location.pathname + window.location.search);
    showAlert(resetAlert, "Password updated. Sign in with your new password.", "success");
    await sb.auth.signOut();
    currentUser = null;
    panelsLoaded = false;
    setTimeout(() => showView("login"), 1500);
  });

  async function logout() {
    if (sb) await sb.auth.signOut();
    currentUser = null;
    panelsLoaded = false;
    showView("login");
  }

  document.getElementById("btn-logout")?.addEventListener("click", logout);
  document.getElementById("btn-denied-logout")?.addEventListener("click", logout);

  document.querySelectorAll("#admin-nav .admin-nav__item").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#admin-nav .admin-nav__item").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const panel = btn.getAttribute("data-panel");
      document.querySelectorAll(".admin-panel-view").forEach((el) => {
        el.hidden = el.id !== "panel-" + panel;
      });
    });
  });

  PAGES.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p.slug;
    opt.textContent = p.label;
    pageSlugSelect.appendChild(opt);
  });

  pageSlugSelect.addEventListener("change", () => renderPageEditors());

  async function loadPageSections() {
    const slug = pageSlugSelect.value;
    const { data, error } = await sb.from("page_sections").select("*").eq("page_slug", slug);
    if (error) throw error;
    sectionRows = data || [];
    renderPageEditors();
  }

  function findStructuredRow(sectionKey) {
    return sectionRows.find((r) => r.section_key === sectionKey);
  }

  function renderPageEditors() {
    const slug = pageSlugSelect.value;
    const structDefs = PAGE_STRUCTURED_SECTIONS[slug] || [];

    structuredSectionsEditor.innerHTML = structDefs.length
      ? structDefs
          .map((def, idx) => {
            const row = findStructuredRow(def.key) || {};
            return `
        <div class="admin-panel admin-card" data-struct-key="${escapeAttr(def.key)}">
          <h3 class="admin-card__title">${escapeHtml(def.label)} <span class="admin-help">(${escapeHtml(def.key)})</span></h3>
          <div class="admin-grid-2">
            <div class="admin-field"><label>Title</label><input type="text" data-sf="title" value="${escapeAttr(row.title || "")}" /></div>
            <div class="admin-field"><label>Subtitle / eyebrow</label><input type="text" data-sf="subtitle" value="${escapeAttr(row.subtitle || "")}" /></div>
          </div>
          <div class="admin-field"><label>Body</label><textarea data-sf="body" rows="3">${escapeHtml(row.body || "")}</textarea></div>
          <div class="admin-grid-2">
            <div class="admin-field"><label>Button label</label><input type="text" data-sf="button_label" value="${escapeAttr(row.button_label || "")}" /></div>
            <div class="admin-field"><label>Button URL</label><input type="text" data-sf="button_url" value="${escapeAttr(row.button_url || "")}" /></div>
          </div>
          <div class="admin-grid-2">
            <div class="admin-field"><label>Sort order</label><input type="number" data-sf="sort_order" value="${row.sort_order != null ? row.sort_order : idx}" /></div>
            <label class="admin-check"><input type="checkbox" data-sf="is_visible" ${row.is_visible !== false ? "checked" : ""} /> Visible</label>
          </div>
        </div>`;
          })
          .join("")
      : '<p class="admin-help">No structured sections for this page.</p>';

    const fieldDefs = PAGE_FIELD_DEFS?.[slug] || (PAGE_FIELDS[slug] || []).map((key) => ({ key, label: key }));
    const fields = fieldDefs.filter((f) => !(slug === "index" && HOMEPAGE_FIELD_KEYS.includes(f.key)));
    sectionsEditor.innerHTML = fields
      .map((def) => {
        const key = def.key;
        const row = sectionRows.find((r) => r.field_key === key);
        const val = row ? row.field_value : "";
        const id = "field-" + key.replace(/[^a-z0-9]/gi, "-");
        const multiline = def.multiline || /lead|bio|description|notice|meta|para/i.test(key);
        return `
          <div class="admin-panel admin-field" data-field-key="${escapeAttr(key)}">
            <label for="${id}">${escapeHtml(def.label || key)}</label>
            ${multiline ? `<textarea id="${id}" rows="3">${escapeHtml(val)}</textarea>` : `<input id="${id}" type="text" value="${escapeAttr(val)}" />`}
          </div>`;
      })
      .join("");
  }

  document.getElementById("btn-save-sections")?.addEventListener("click", async () => {
    const slug = pageSlugSelect.value;
    try {
      const structDefs = PAGE_STRUCTURED_SECTIONS[slug] || [];
      for (const def of structDefs) {
        const card = structuredSectionsEditor.querySelector(`[data-struct-key="${def.key}"]`);
        if (!card) continue;
        const payload = readStructFields(card);
        payload.page_slug = slug;
        payload.section_key = def.key;
        payload.updated_at = new Date().toISOString();
        const existing = findStructuredRow(def.key);
        if (existing?.id) {
          const { error } = await sb.from("page_sections").update(payload).eq("id", existing.id);
          if (error) throw error;
        } else {
          const { error } = await sb.from("page_sections").insert(payload);
          if (error) throw error;
        }
      }

      const saveDefs = PAGE_FIELD_DEFS?.[slug] || (PAGE_FIELDS[slug] || []).map((key) => ({ key }));
      const saveFields = saveDefs.filter((f) => !(slug === "index" && HOMEPAGE_FIELD_KEYS.includes(f.key)));
      for (const def of saveFields) {
        const key = def.key;
        const wrap = sectionsEditor.querySelector(`[data-field-key="${key}"]`);
        const input = wrap?.querySelector("input, textarea");
        const value = input ? input.value : "";
        const existing = sectionRows.find((r) => r.field_key === key);
        if (existing) {
          const { error } = await sb.from("page_sections").update({ field_value: value, updated_at: new Date().toISOString() }).eq("id", existing.id);
          if (error) throw error;
        } else {
          const { error } = await sb.from("page_sections").insert({ page_slug: slug, field_key: key, field_value: value });
          if (error) throw error;
        }
      }
      await loadPageSections();
      showGlobal("Page content saved.", "success");
    } catch (err) {
      console.error(err);
      showGlobal(err.message || "Could not save page content.", "error");
    }
  });

  function readStructFields(card) {
    const out = {};
    card.querySelectorAll("[data-sf]").forEach((el) => {
      const key = el.getAttribute("data-sf");
      if (el.type === "checkbox") out[key] = el.checked;
      else if (el.type === "number") out[key] = Number(el.value);
      else out[key] = el.value;
    });
    return out;
  }

  function findNavRow(key) {
    return navCache.find((r) => r.link_key === key);
  }

  async function loadNavigation() {
    const { data, error } = await sb.from("navigation_links").select("*").order("sort_order");
    if (error) throw error;
    navCache = data || [];
    renderNavigationEditor();
  }

  function renderNavigationEditor() {
    if (!navigationEditor) return;
    const defs = [
      ...(window.CmsCatalog?.NAV_LINK_KEYS || []),
      ...(window.CmsCatalog?.FOOTER_LINK_KEYS || []),
    ];
    navigationEditor.innerHTML = defs
      .map((def, idx) => {
        const row = findNavRow(def.key) || {};
        return `
        <div class="admin-panel admin-card" data-link-key="${escapeAttr(def.key)}">
          <p class="admin-help">${escapeHtml(def.key)} (${escapeHtml(def.location || "nav")})</p>
          <div class="admin-field"><label>Label</label><input type="text" data-f="label" value="${escapeAttr(row.label || def.label || "")}" /></div>
          <div class="admin-field"><label>Href</label><input type="text" data-f="href" value="${escapeAttr(row.href || def.href || "")}" /></div>
          <div class="admin-field"><label>Sort order</label><input type="number" data-f="sort_order" value="${row.sort_order != null ? row.sort_order : idx}" /></div>
          <label class="admin-check"><input type="checkbox" data-f="is_active" ${row.is_active !== false ? "checked" : ""} /> Active</label>
        </div>`;
      })
      .join("");
  }

  document.getElementById("btn-save-navigation")?.addEventListener("click", async () => {
    try {
      const defs = [
        ...(window.CmsCatalog?.NAV_LINK_KEYS || []),
        ...(window.CmsCatalog?.FOOTER_LINK_KEYS || []),
      ];
      for (let idx = 0; idx < defs.length; idx++) {
        const def = defs[idx];
        const card = navigationEditor.querySelector(`[data-link-key="${def.key}"]`);
        const raw = readCardFields(card);
        const payload = {
          link_key: def.key,
          label: raw.label,
          href: raw.href,
          location: def.location || "nav",
          sort_order: raw.sort_order ?? idx,
          is_active: raw.is_active,
          updated_at: new Date().toISOString(),
        };
        const existing = findNavRow(def.key);
        if (existing?.id) {
          const { error } = await sb.from("navigation_links").update(payload).eq("id", existing.id);
          if (error) throw error;
        } else {
          const { error } = await sb.from("navigation_links").insert(payload);
          if (error) throw error;
        }
      }
      await loadNavigation();
      showGlobal("Navigation links saved.", "success");
    } catch (err) {
      showGlobal(err.message || "Could not save navigation.", "error");
    }
  });

  function findTrustRow(key) {
    return trustCache.find((r) => r.card_key === key);
  }

  async function loadTrustCards() {
    const { data, error } = await sb.from("trust_cards").select("*").order("sort_order");
    if (error) throw error;
    trustCache = data || [];
    renderTrustEditor();
  }

  function renderTrustEditor() {
    if (!trustEditor) return;
    trustEditor.innerHTML = (window.CmsCatalog?.TRUST_CARD_KEYS || [])
      .map((def, idx) => {
        const row = findTrustRow(def.key) || {};
        return `
        <div class="admin-panel admin-card" data-trust-key="${escapeAttr(def.key)}">
          <h3 class="admin-card__title">${escapeHtml(def.label)}</h3>
          <div class="admin-grid-2">
            <div class="admin-field"><label>Card label</label><input type="text" data-f="label" value="${escapeAttr(row.label || "")}" /></div>
            <div class="admin-field"><label>Sort order</label><input type="number" data-f="sort_order" value="${row.sort_order != null ? row.sort_order : idx}" /></div>
          </div>
          <div class="admin-field"><label>Card title</label><input type="text" data-f="title" value="${escapeAttr(row.title || "")}" /></div>
          <label class="admin-check"><input type="checkbox" data-f="is_active" ${row.is_active !== false ? "checked" : ""} /> Active</label>
        </div>`;
      })
      .join("");
  }

  document.getElementById("btn-save-trust")?.addEventListener("click", async () => {
    try {
      for (let idx = 0; idx < (window.CmsCatalog?.TRUST_CARD_KEYS || []).length; idx++) {
        const def = window.CmsCatalog.TRUST_CARD_KEYS[idx];
        const card = trustEditor.querySelector(`[data-trust-key="${def.key}"]`);
        const raw = readCardFields(card);
        const payload = {
          card_key: def.key,
          label: raw.label,
          title: raw.title,
          sort_order: raw.sort_order ?? idx,
          is_active: raw.is_active,
          updated_at: new Date().toISOString(),
        };
        const existing = findTrustRow(def.key);
        if (existing?.id) {
          const { error } = await sb.from("trust_cards").update(payload).eq("id", existing.id);
          if (error) throw error;
        } else {
          const { error } = await sb.from("trust_cards").insert(payload);
          if (error) throw error;
        }
      }
      await loadTrustCards();
      showGlobal("Trust cards saved.", "success");
    } catch (err) {
      showGlobal(err.message || "Could not save trust cards.", "error");
    }
  });

  function findCtaRow(def) {
    return ctaCache.find((r) => r.section_key === def.section_key && r.page_slug === def.page_slug);
  }

  async function loadCtaBlocks() {
    const { data, error } = await sb.from("cta_blocks").select("*").order("sort_order");
    if (error) throw error;
    ctaCache = data || [];
    renderCtaEditor();
  }

  function renderCtaEditor() {
    if (!ctaEditor || !CTA_BLOCK_KEYS) return;
    ctaEditor.innerHTML = CTA_BLOCK_KEYS.map((def) => {
      const row = findCtaRow(def) || {};
      return `
        <div class="admin-panel admin-card" data-cta-section="${escapeAttr(def.section_key)}" data-cta-page="${escapeAttr(def.page_slug || "")}">
          <h3 class="admin-card__title">${escapeHtml(def.label)} <span class="admin-help">[${escapeHtml(def.section_key)} / ${escapeHtml(def.page_slug || "")}]</span></h3>
          <div class="admin-grid-2">
            <div class="admin-field"><label>Eyebrow</label><input type="text" data-f="eyebrow" value="${escapeAttr(row.eyebrow || "")}" /></div>
            <div class="admin-field"><label>Title</label><input type="text" data-f="title" value="${escapeAttr(row.title || "")}" /></div>
          </div>
          <div class="admin-field"><label>Body</label><textarea data-f="body" rows="2">${escapeHtml(row.body || "")}</textarea></div>
          <div class="admin-grid-2">
            <div class="admin-field"><label>Primary button label</label><input type="text" data-f="button_primary_label" value="${escapeAttr(row.button_primary_label || "")}" /></div>
            <div class="admin-field"><label>Primary button URL</label><input type="text" data-f="button_primary_href" value="${escapeAttr(row.button_primary_href || "")}" /></div>
          </div>
          <div class="admin-grid-2">
            <div class="admin-field"><label>Secondary button label</label><input type="text" data-f="button_secondary_label" value="${escapeAttr(row.button_secondary_label || "")}" /></div>
            <div class="admin-field"><label>Secondary button URL</label><input type="text" data-f="button_secondary_href" value="${escapeAttr(row.button_secondary_href || "")}" /></div>
          </div>
          <label class="admin-check"><input type="checkbox" data-f="is_active" ${row.is_active !== false ? "checked" : ""} /> Active</label>
        </div>`;
    }).join("");
  }

  async function loadFormFields() {
    const { data, error } = await sb.from("contact_form_fields").select("*").order("sort_order");
    if (error) throw error;
    formFieldsCache = data || [];
    renderFormFieldsEditor();
  }

  function renderFormFieldsEditor() {
    if (!formFieldsEditor) return;
    const defs = window.CmsCatalog?.CONTACT_FIELD_KEYS || [];
    formFieldsEditor.innerHTML = defs
      .map((def, idx) => {
        const key = def.key;
        const row = formFieldsCache.find((r) => r.field_key === key) || {};
        return `
        <div class="admin-panel admin-card" data-form-field="${escapeAttr(key)}">
          <h3 class="admin-card__title">${escapeHtml(def.label || key)}</h3>
          <div class="admin-field"><label>Label</label><input type="text" data-f="label" value="${escapeAttr(row.label || def.label || "")}" /></div>
          <div class="admin-field"><label>Placeholder</label><input type="text" data-f="placeholder" value="${escapeAttr(row.placeholder || def.placeholder || "")}" /></div>
          <label class="admin-check"><input type="checkbox" data-f="is_required" ${(row.is_required ?? def.required) ? "checked" : ""} /> Required</label>
          <label class="admin-check"><input type="checkbox" data-f="is_active" ${row.is_active !== false ? "checked" : ""} /> Active</label>
        </div>`;
      })
      .join("");
  }

  async function loadUiLabels() {
    const { data, error } = await sb.from("ui_labels").select("*").order("label_key");
    if (error) throw error;
    labelsCache = data || [];
    renderLabelsEditor();
  }

  function renderLabelsEditor() {
    if (!labelsEditor) return;
    labelsEditor.innerHTML = (UI_LABEL_KEYS || [])
      .map((def) => {
        const row = labelsCache.find((r) => r.label_key === def.key) || {};
        return `
        <div class="admin-field" data-label-key="${escapeAttr(def.key)}">
          <label>${escapeHtml(def.label)}</label>
          <input type="text" data-f="label_value" value="${escapeAttr(row.label_value || def.default || "")}" />
        </div>`;
      })
      .join("");
  }

  async function loadSettings() {
    const { data, error } = await sb.from("site_settings").select("*").eq("id", 1).maybeSingle();
    if (error) throw error;
    settingsCache = data || {};
    const form = document.getElementById("settings-form");
    if (!form) return;
    const fields = [
      "practice_name", "tagline", "phone", "phone_display", "fax", "fax_display", "email",
      "address_line1", "address_line2", "footer_copyright",
      "website_credit_text", "website_credit_url", "contact_form_notice",
    ];
    fields.forEach((name) => {
      if (form[name]) form[name].value = data?.[name] || "";
    });
    form.office_hours.value = JSON.stringify(data?.office_hours || [], null, 2);
  }

  document.getElementById("btn-save-settings")?.addEventListener("click", async () => {
    const form = document.getElementById("settings-form");
    let office_hours;
    try {
      office_hours = JSON.parse(form.office_hours.value || "[]");
    } catch {
      showGlobal("Office hours must be valid JSON.", "error");
      return;
    }
    const payload = {
      id: 1,
      practice_name: form.practice_name.value.trim(),
      tagline: form.tagline.value.trim(),
      phone: form.phone.value.trim(),
      phone_display: form.phone_display.value.trim(),
      fax: form.fax.value.trim(),
      fax_display: form.fax_display.value.trim(),
      email: form.email.value.trim(),
      address_line1: form.address_line1.value.trim(),
      address_line2: form.address_line2.value.trim(),
      footer_copyright: form.footer_copyright.value.trim(),
      contact_form_notice: form.contact_form_notice?.value?.trim() || "",
      website_credit_text: form.website_credit_text.value.trim(),
      website_credit_url: form.website_credit_url.value.trim(),
      office_hours,
      updated_at: new Date().toISOString(),
    };
    const { error } = await sb.from("site_settings").upsert(payload);
    if (error) showGlobal(error.message, "error");
    else {
      settingsCache = payload;
      showGlobal("Site settings saved.", "success");
    }
  });

  document.getElementById("btn-save-cta")?.addEventListener("click", async () => {
    try {
      for (const def of CTA_BLOCK_KEYS || []) {
        const card = ctaEditor.querySelector(
          `[data-cta-section="${def.section_key}"][data-cta-page="${def.page_slug || ""}"]`
        );
        if (!card) continue;
        const raw = readCardFields(card);
        const payload = {
          block_key: `${def.page_slug || "site"}-${def.section_key}`,
          section_key: def.section_key,
          page_slug: def.page_slug || def.page,
          eyebrow: raw.eyebrow,
          title: raw.title,
          body: raw.body,
          button_primary_label: raw.button_primary_label,
          button_primary_href: raw.button_primary_href,
          button_secondary_label: raw.button_secondary_label,
          button_secondary_href: raw.button_secondary_href,
          is_active: raw.is_active,
          updated_at: new Date().toISOString(),
        };
        const existing = findCtaRow(def);
        if (existing?.id) {
          const { error } = await sb.from("cta_blocks").update(payload).eq("id", existing.id);
          if (error) throw error;
        } else {
          const { error } = await sb.from("cta_blocks").insert(payload);
          if (error) throw error;
        }
      }
      await loadCtaBlocks();
      showGlobal("CTA blocks saved.", "success");
    } catch (err) {
      showGlobal(err.message || "Could not save CTAs.", "error");
    }
  });

  document.getElementById("btn-save-form-fields")?.addEventListener("click", async () => {
    try {
      const defs = window.CmsCatalog?.CONTACT_FIELD_KEYS || [];
      for (let idx = 0; idx < defs.length; idx++) {
        const key = defs[idx].key;
        const card = formFieldsEditor.querySelector(`[data-form-field="${key}"]`);
        const raw = readCardFields(card);
        const payload = {
          field_key: key,
          label: raw.label,
          placeholder: raw.placeholder,
          is_required: raw.is_required,
          is_active: raw.is_active,
          sort_order: idx,
          updated_at: new Date().toISOString(),
        };
        const existing = formFieldsCache.find((r) => r.field_key === key);
        if (existing?.id) {
          const { error } = await sb.from("contact_form_fields").update(payload).eq("id", existing.id);
          if (error) throw error;
        } else {
          const { error } = await sb.from("contact_form_fields").insert(payload);
          if (error) throw error;
        }
      }
      await loadFormFields();
      showGlobal("Contact form fields saved.", "success");
    } catch (err) {
      showGlobal(err.message || "Could not save form fields.", "error");
    }
  });

  document.getElementById("btn-save-labels")?.addEventListener("click", async () => {
    try {
      for (const def of UI_LABEL_KEYS || []) {
        const wrap = labelsEditor.querySelector(`[data-label-key="${def.key}"]`);
        const value = wrap?.querySelector('[data-f="label_value"]')?.value ?? "";
        const payload = { label_key: def.key, label_value: value, updated_at: new Date().toISOString() };
        const existing = labelsCache.find((r) => r.label_key === def.key);
        if (existing?.id) {
          const { error } = await sb.from("ui_labels").update(payload).eq("id", existing.id);
          if (error) throw error;
        } else {
          const { error } = await sb.from("ui_labels").insert(payload);
          if (error) throw error;
        }
      }
      await loadUiLabels();
      showGlobal("UI labels saved.", "success");
    } catch (err) {
      showGlobal(err.message || "Could not save labels.", "error");
    }
  });

  async function uploadImage(bucket, file, path) {
    if (!window.CmsCore?.isAllowedImageFile(file)) {
      throw new Error("Only JPG, JPEG, PNG, and WebP images are allowed.");
    }
    const { error } = await sb.storage.from(bucket).upload(path, file, { upsert: true, contentType: file.type || undefined });
    if (error) throw error;
    const { data } = sb.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  let servicesCache = [];
  let staffCache = [];
  let imagesCache = [];

  async function loadServices() {
    const { data, error } = await sb.from("services").select("*").order("sort_order");
    if (error) throw error;
    servicesCache = data || [];
    renderServicesEditor();
  }

  function renderServicesEditor() {
    servicesEditor.innerHTML = servicesCache
      .map(
        (s) => `
        <div class="admin-panel admin-card" data-service-id="${s.id}">
          <div class="admin-grid-2">
            <div class="admin-field"><label>Slug</label><input type="text" data-f="slug" value="${escapeAttr(s.slug)}" /></div>
            <div class="admin-field"><label>Sort order</label><input type="number" data-f="sort_order" value="${s.sort_order}" /></div>
          </div>
          <div class="admin-field"><label>Service name</label><input type="text" data-f="name" value="${escapeAttr(s.name || s.title || "")}" /></div>
          <div class="admin-field"><label>Eyebrow</label><input type="text" data-f="eyebrow" value="${escapeAttr(s.eyebrow || "")}" /></div>
          <div class="admin-field"><label>Short description</label><textarea data-f="short_description" rows="2">${escapeHtml(s.short_description || s.lead || "")}</textarea></div>
          <div class="admin-field"><label>Full description</label><textarea data-f="full_description" rows="4">${escapeHtml(s.full_description || "")}</textarea></div>
          <label class="admin-check"><input type="checkbox" data-f="is_active" ${s.is_active ? "checked" : ""} /> Active</label>
          <div class="admin-card-actions">
            <button type="button" class="admin-btn admin-btn--primary" data-action="save-service">Save</button>
            <button type="button" class="admin-btn admin-btn--ghost" data-action="delete-service">Delete</button>
          </div>
        </div>`
      )
      .join("");
  }

  servicesEditor?.addEventListener("click", async (e) => {
    const card = e.target.closest("[data-service-id]");
    if (!card) return;
    const id = card.getAttribute("data-service-id");
    if (e.target.matches("[data-action='save-service']")) {
      const raw = readCardFields(card);
      const payload = {
        slug: raw.slug,
        sort_order: raw.sort_order,
        eyebrow: raw.eyebrow,
        name: raw.name,
        title: raw.name,
        short_description: raw.short_description,
        lead: raw.short_description,
        full_description: raw.full_description,
        is_active: raw.is_active,
        updated_at: new Date().toISOString(),
      };
      const { error } = await sb.from("services").update(payload).eq("id", id);
      if (error) showGlobal(error.message, "error");
      else {
        showGlobal("Service saved.", "success");
        await loadServices();
      }
    }
    if (e.target.matches("[data-action='delete-service']")) {
      if (!confirm("Delete this service?")) return;
      const { error } = await sb.from("services").delete().eq("id", id);
      if (error) showGlobal(error.message, "error");
      else {
        showGlobal("Service deleted.", "success");
        await loadServices();
      }
    }
  });

  document.getElementById("btn-add-service")?.addEventListener("click", async () => {
    const slug = prompt("New service slug (e.g. general):");
    if (!slug) return;
    const { error } = await sb.from("services").insert({
      slug: slug.trim().toLowerCase().replace(/\s+/g, "-"),
      name: "New Service",
      title: "New Service",
      eyebrow: "Dental Service",
      short_description: "",
      lead: "",
      full_description: "",
      sort_order: servicesCache.length,
      is_active: true,
    });
    if (error) showGlobal(error.message, "error");
    else await loadServices();
  });

  async function loadStaff() {
    const { data, error } = await sb.from("staff_members").select("*").order("sort_order");
    if (error) throw error;
    staffCache = data || [];
    renderStaffEditor();
  }

  function renderStaffEditor() {
    staffEditor.innerHTML = staffCache
      .map(
        (m, i) => `
        <div class="admin-panel admin-card" data-staff-id="${m.id}">
          ${m.photo_url ? `<img src="${escapeAttr(m.photo_url)}" alt="" class="admin-thumb" />` : ""}
          <div class="admin-grid-2">
            <div class="admin-field"><label>Slug</label><input type="text" data-f="slug" value="${escapeAttr(m.slug)}" /></div>
            <div class="admin-field"><label>Initials</label><input type="text" data-f="initials" value="${escapeAttr(m.initials || "")}" maxlength="3" /></div>
          </div>
          <div class="admin-field"><label>Name</label><input type="text" data-f="name" value="${escapeAttr(m.name)}" /></div>
          <div class="admin-field"><label>Bio</label><textarea data-f="bio" rows="4">${escapeHtml(m.bio)}</textarea></div>
          <div class="admin-field"><label>Sort order</label><input type="number" data-f="sort_order" value="${m.sort_order}" /></div>
          <label class="admin-check"><input type="checkbox" data-f="is_active" ${m.is_active ? "checked" : ""} /> Active</label>
          <div class="admin-field">
            <label>Photo (JPG, PNG, WebP)</label>
            <input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" data-f="photo_file" />
          </div>
          <div class="admin-card-actions">
            <button type="button" class="admin-btn admin-btn--ghost" data-action="staff-up" ${i === 0 ? "disabled" : ""}>Move up</button>
            <button type="button" class="admin-btn admin-btn--ghost" data-action="staff-down" ${i === staffCache.length - 1 ? "disabled" : ""}>Move down</button>
            <button type="button" class="admin-btn admin-btn--primary" data-action="save-staff">Save</button>
            <button type="button" class="admin-btn admin-btn--ghost" data-action="delete-staff">Delete</button>
          </div>
        </div>`
      )
      .join("");
  }

  staffEditor?.addEventListener("click", async (e) => {
    const card = e.target.closest("[data-staff-id]");
    if (!card) return;
    const id = card.getAttribute("data-staff-id");
    const idx = staffCache.findIndex((m) => m.id === id);

    if (e.target.matches("[data-action='staff-up']") && idx > 0) {
      await swapStaffOrder(idx, idx - 1);
      return;
    }
    if (e.target.matches("[data-action='staff-down']") && idx < staffCache.length - 1) {
      await swapStaffOrder(idx, idx + 1);
      return;
    }

    if (e.target.matches("[data-action='save-staff']")) {
      try {
        const payload = readCardFields(card);
        const file = card.querySelector('[data-f="photo_file"]')?.files?.[0];
        if (file) {
          const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
          payload.photo_url = await uploadImage("staff-photos", file, `${payload.slug}-${Date.now()}.${ext}`);
        }
        const { error } = await sb.from("staff_members").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", id);
        if (error) throw error;
        showGlobal("Staff member saved.", "success");
        await loadStaff();
      } catch (err) {
        showGlobal(err.message || "Could not save staff.", "error");
      }
    }
    if (e.target.matches("[data-action='delete-staff']")) {
      if (!confirm("Delete this staff member?")) return;
      const { error } = await sb.from("staff_members").delete().eq("id", id);
      if (error) showGlobal(error.message, "error");
      else {
        showGlobal("Staff member deleted.", "success");
        await loadStaff();
      }
    }
  });

  async function swapStaffOrder(a, b) {
    const aRow = staffCache[a];
    const bRow = staffCache[b];
    const aOrder = aRow.sort_order;
    const bOrder = bRow.sort_order;
    await sb.from("staff_members").update({ sort_order: bOrder }).eq("id", aRow.id);
    await sb.from("staff_members").update({ sort_order: aOrder }).eq("id", bRow.id);
    await loadStaff();
    showGlobal("Staff order updated.", "success");
  }

  document.getElementById("btn-add-staff")?.addEventListener("click", async () => {
    const slug = prompt("Staff slug (e.g. ashleigh):");
    if (!slug) return;
    const { error } = await sb.from("staff_members").insert({
      slug: slug.trim().toLowerCase(),
      name: "New Staff Member",
      bio: "",
      sort_order: staffCache.length,
      is_active: true,
    });
    if (error) showGlobal(error.message, "error");
    else await loadStaff();
  });

  async function loadImages() {
    const { data, error } = await sb.from("site_images").select("*").order("sort_order");
    if (error) throw error;
    imagesCache = data || [];
    renderImagesEditor();
  }

  function findImage(key) {
    return imagesCache.find((i) => i.image_key === key);
  }

  function imageCardHtml(key, label, sortOrder) {
    const row = findImage(key);
    const preview = row?.public_url
      ? `<img src="${escapeAttr(row.public_url)}" alt="" class="admin-thumb" />`
      : '<span class="admin-help">No image</span>';
    return `
      <div class="admin-panel admin-card" data-image-key="${escapeAttr(key)}">
        <strong>${escapeHtml(label)}</strong> (${escapeHtml(key)})
        <div>${preview}</div>
        <div class="admin-field"><label>Title</label><input type="text" data-f="title" value="${escapeAttr(row?.title || "")}" /></div>
        <div class="admin-field"><label>Alt text</label><input type="text" data-f="alt_text" value="${escapeAttr(row?.alt_text || "")}" /></div>
        <label class="admin-check"><input type="checkbox" data-f="is_active" ${row?.is_active !== false ? "checked" : ""} /> Active</label>
        <input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" data-f="image_file" />
        <button type="button" class="admin-btn admin-btn--primary" data-action="save-image" data-sort="${sortOrder}">Upload / Save</button>
      </div>`;
  }

  function renderImagesEditor() {
    logoEditor.innerHTML = imageCardHtml("logo", "Site logo", 0);
    slideshowEditor.innerHTML = SLIDE_KEYS.map((key, idx) => imageCardHtml(key, `Slide ${idx + 1}`, idx)).join("");
    showcaseEditor.innerHTML = ["before", "after"]
      .map((key, i) => imageCardHtml(key, key === "before" ? "Before" : "After", 100 + i))
      .join("");
  }

  async function saveImageCard(card) {
    const key = card.getAttribute("data-image-key");
    const sortOrder = Number(card.querySelector("[data-action='save-image']")?.getAttribute("data-sort") || 0);
    const file = card.querySelector('[data-f="image_file"]')?.files?.[0];
    const alt_text = card.querySelector('[data-f="alt_text"]')?.value || "";
    const title = card.querySelector('[data-f="title"]')?.value || "";
    const is_active = card.querySelector('[data-f="is_active"]')?.checked !== false;
    let category = "general";
    if (SLIDE_KEYS.includes(key)) category = "slideshow";
    else if (key === "before" || key === "after") category = key;
    else if (key === "logo") category = "logo";

    let url = findImage(key)?.public_url;
    if (file) {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const folder = key === "logo" ? "logo" : category === "slideshow" ? "slideshow" : "showcase";
      url = await uploadImage("site-images", file, `${folder}/${key}.${ext}`);
    }
    if (!url) throw new Error("Choose an image file to upload, or keep an existing image.");

    const payload = {
      image_key: key,
      category,
      public_url: url,
      alt_text,
      title,
      is_active,
      sort_order: sortOrder,
      updated_at: new Date().toISOString(),
    };
    const existing = findImage(key);
    if (existing) {
      const { error } = await sb.from("site_images").update(payload).eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await sb.from("site_images").insert(payload);
      if (error) throw error;
    }
  }

  document.getElementById("panel-images")?.addEventListener("click", async (e) => {
    if (!e.target.matches("[data-action='save-image']")) return;
    const card = e.target.closest("[data-image-key]");
    try {
      await saveImageCard(card);
      showGlobal("Image saved.", "success");
      await loadImages();
    } catch (err) {
      showGlobal(err.message || "Upload failed.", "error");
    }
  });

  async function loadSubmissions() {
    const { data, error } = await sb
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    submissionsList.innerHTML = (data || []).length
      ? data.map(renderSubmissionCard).join("")
      : '<p class="admin-help">No submissions yet.</p>';
  }

  function renderSubmissionCard(row) {
    const status = row.status || "new";
    return `
      <div class="admin-panel admin-card" data-submission-id="${row.id}">
        <div class="admin-card__head">
          <p><strong>${escapeHtml(row.name)}</strong> &lt;${escapeHtml(row.email)}&gt;</p>
          <span class="admin-badge admin-badge--${escapeAttr(status)}">${escapeHtml(status)}</span>
        </div>
        <p class="admin-help">${escapeHtml(new Date(row.created_at).toLocaleString())}</p>
        ${row.phone ? `<p>Phone: ${escapeHtml(row.phone)}</p>` : ""}
        ${row.preferred_time ? `<p>Preferred time: ${escapeHtml(row.preferred_time)}</p>` : ""}
        <p>${escapeHtml(row.message)}</p>
        <div class="admin-field">
          <label>Status</label>
          <select data-f="status">
            <option value="new" ${status === "new" ? "selected" : ""}>New</option>
            <option value="read" ${status === "read" ? "selected" : ""}>Read</option>
            <option value="archived" ${status === "archived" ? "selected" : ""}>Archived</option>
          </select>
        </div>
        <button type="button" class="admin-btn admin-btn--secondary" data-action="save-submission">Update status</button>
      </div>`;
  }

  submissionsList?.addEventListener("click", async (e) => {
    if (!e.target.matches("[data-action='save-submission']")) return;
    const card = e.target.closest("[data-submission-id]");
    const id = card.getAttribute("data-submission-id");
    const status = card.querySelector('[data-f="status"]').value;
    const { error } = await sb.from("contact_submissions").update({ status }).eq("id", id);
    if (error) showGlobal(error.message, "error");
    else {
      showGlobal("Submission updated.", "success");
      await loadSubmissions();
    }
  });

  document.getElementById("btn-refresh-submissions")?.addEventListener("click", () => loadSubmissions());

  function readCardFields(card) {
    const out = {};
    card.querySelectorAll("[data-f]").forEach((el) => {
      const key = el.getAttribute("data-f");
      if (key === "photo_file" || key === "image_file") return;
      if (el.type === "checkbox") out[key] = el.checked;
      else if (el.type === "number") out[key] = Number(el.value);
      else out[key] = el.value;
    });
    return out;
  }

  function escapeHtml(str) {
    return window.CmsCore?.escapeHtml(str) ?? String(str ?? "");
  }

  function escapeAttr(str) {
    return escapeHtml(str).replace(/"/g, "&quot;");
  }

  async function loadPanelSafe(fn, name) {
    try {
      await fn();
    } catch (err) {
      console.warn(`[admin] ${name}:`, err);
      if (/does not exist|relation/i.test(err.message || "")) {
        showGlobal(`Table missing for ${name}. Run supabase/schema_content.sql.`, "error");
      }
    }
  }

  async function loadAllPanels() {
    await loadPanelSafe(loadSettings, "settings");
    await Promise.all([
      loadPanelSafe(loadPageSections, "pages"),
      loadPanelSafe(loadNavigation, "navigation"),
      loadPanelSafe(loadTrustCards, "trust cards"),
      loadPanelSafe(loadCtaBlocks, "CTA blocks"),
      loadPanelSafe(loadFormFields, "form fields"),
      loadPanelSafe(loadUiLabels, "UI labels"),
      loadPanelSafe(loadServices, "services"),
      loadPanelSafe(loadStaff, "staff"),
      loadPanelSafe(loadImages, "images"),
      loadPanelSafe(loadSubmissions, "submissions"),
    ]);
  }

  sb = getClient();
  if (!sb) {
    showAlert(loginAlert, "Supabase is not configured.", "error");
    showView("login");
  } else {
    sb.auth.onAuthStateChange((event) => {
      if (bootstrapping) return;
      if (event === "PASSWORD_RECOVERY") {
        showView("reset");
        return;
      }
      if (event === "SIGNED_OUT") {
        currentUser = null;
        panelsLoaded = false;
        showView("login");
        return;
      }
      resolveSession();
    });
    resolveSession().finally(() => {
      bootstrapping = false;
    });
  }
})();
