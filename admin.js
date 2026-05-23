/**
 * T.J. Fowler DDS — Website editor (Supabase Auth + publishable key only).
 */
(function () {
  const Cat = window.CmsCatalog || {};
  const L = window.AdminLabels || {};
  const Panels = window.AdminPanels || {};
  const { SLIDE_KEYS, CTA_BLOCK_KEYS, CONTACT_FIELD_KEYS, UI_LABEL_KEYS, NAV_LINK_KEYS, FOOTER_LINK_KEYS } = Cat;

  const loginView = document.getElementById("login-view");
  const forgotView = document.getElementById("forgot-view");
  const resetView = document.getElementById("reset-view");
  const deniedView = document.getElementById("denied-view");
  const appView = document.getElementById("app-view");
  const globalAlert = document.getElementById("global-alert");

  let sb = null;
  let currentUser = null;
  let panelsLoaded = false;
  let bootstrapping = true;
  const RECOVERY_PENDING_KEY = "admin_password_recovery_pending";
  /** Blocks dashboard until user completes Set New Password after email reset link */
  let passwordRecoveryMode = false;

  function isRecoveryPending() {
    return passwordRecoveryMode || sessionStorage.getItem(RECOVERY_PENDING_KEY) === "1";
  }

  let settingsCache = null;
  let sectionRowsBySlug = {};
  let navCache = [];
  let trustCache = [];
  let ctaCache = [];
  let formFieldsCache = [];
  let labelsCache = [];
  let servicesCache = [];
  let staffCache = [];
  let imagesCache = [];

  function $(id) {
    return document.getElementById(id);
  }

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
      } else el.hidden = key !== view;
    });
  }

  function showPanel(panelId) {
    document.querySelectorAll("#admin-nav .admin-nav__item").forEach((btn) => {
      btn.classList.toggle("is-active", btn.getAttribute("data-panel") === panelId);
    });
    document.querySelectorAll(".admin-panel-view").forEach((el) => {
      el.hidden = el.id !== "panel-" + panelId;
    });
    const sidebar = $("admin-sidebar");
    if (sidebar) sidebar.classList.remove("is-open");
  }

  function initDashboard() {
    const grid = $("dashboard-grid");
    if (!grid || !L.DASHBOARD_CARDS) return;
    grid.innerHTML = L.DASHBOARD_CARDS.map(
      (c) => `<button type="button" class="admin-dashboard-card" data-goto-panel="${escapeAttr(c.panel)}">
        <strong>${escapeHtml(c.title)}</strong>
        <span>${escapeHtml(c.blurb)}</span>
      </button>`
    ).join("");
    grid.querySelectorAll("[data-goto-panel]").forEach((btn) => {
      btn.addEventListener("click", () => showPanel(btn.getAttribute("data-goto-panel")));
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

  function isRecoveryInUrl() {
    const hash = window.location.hash.replace(/^#/, "");
    if (hash) {
      const params = new URLSearchParams(hash);
      if (params.get("type") === "recovery") return true;
      if (hash.includes("type=recovery")) return true;
    }
    const search = new URLSearchParams(window.location.search);
    if (search.get("type") === "recovery") return true;
    return false;
  }

  function enterPasswordRecoveryMode() {
    passwordRecoveryMode = true;
    sessionStorage.setItem(RECOVERY_PENDING_KEY, "1");
    panelsLoaded = false;
    const form = $("reset-form");
    if (form) form.hidden = false;
    if ($("reset-success")) $("reset-success").hidden = true;
    showView("reset");
  }

  function exitPasswordRecoveryMode() {
    passwordRecoveryMode = false;
    sessionStorage.removeItem(RECOVERY_PENDING_KEY);
  }

  function clearRecoveryFromUrl() {
    const path = window.location.pathname + window.location.search;
    history.replaceState(null, "", path);
  }

  function logSupabaseError(label, error) {
    console.error(`[admin] ${label}:`, error);
  }

  function formatSupabaseError(error) {
    if (!error) return null;
    if (typeof error === "string") return error;
    const parts = [];
    if (error.message) parts.push(error.message);
    return parts.join("\n") || String(error);
  }

  function isRlsOrPermissionError(error) {
    if (!error) return false;
    const msg = `${error.message || ""} ${error.details || ""}`.toLowerCase();
    return error.code === "42501" || /row-level security|permission denied|insufficient privilege/.test(msg);
  }

  function showDeniedDebug(info) {
    if ($("denied-email")) $("denied-email").textContent = info?.email || "(none)";
    if ($("denied-user-id")) $("denied-user-id").textContent = info?.userId || "(none)";
    if ($("denied-row-found")) $("denied-row-found").textContent = info?.rowFound ? "yes" : "no";
    if ($("denied-error")) $("denied-error").textContent = info?.error || "(none)";
    showView("denied");
  }

  async function checkAdminAccess() {
    const denied = { ok: false, user: null, email: null, userId: null, error: null, rowFound: false };
    if (!sb) {
      denied.error = "Website connection is not configured.";
      return denied;
    }
    const { data: { user }, error: authError } = await sb.auth.getUser();
    if (authError) {
      denied.error = formatSupabaseError(authError);
      return denied;
    }
    if (!user) {
      denied.error = "Not signed in.";
      return denied;
    }
    denied.user = user;
    denied.userId = user.id;
    const email = user.email?.trim().toLowerCase() || null;
    denied.email = email;
    let lastError = null;

    let { data, error } = await sb.from("admin_users").select("*").eq("user_id", user.id).maybeSingle();
    if (error) {
      lastError = error;
      if (isRlsOrPermissionError(error)) {
        denied.error = formatSupabaseError(error);
        return denied;
      }
    } else if (data) {
      denied.rowFound = true;
      denied.ok = true;
      return denied;
    }

    if (email) {
      ({ data, error } = await sb.from("admin_users").select("*").eq("email", email).maybeSingle());
      if (error) {
        lastError = error;
        if (isRlsOrPermissionError(error)) {
          denied.error = formatSupabaseError(error);
          return denied;
        }
      } else if (data) {
        denied.rowFound = true;
        denied.ok = true;
        return denied;
      }
      ({ data, error } = await sb.from("admin_users").select("*").ilike("email", email).maybeSingle());
      if (error) lastError = error;
      else if (data) {
        denied.rowFound = true;
        denied.ok = true;
        return denied;
      }
    }

    denied.error = lastError
      ? formatSupabaseError(lastError)
      : "This account is not authorized to edit the website.";
    return denied;
  }

  async function requireSession() {
    sb = getClient();
    if (!sb) {
      showAlert($("login-alert"), "Website connection is not configured.", "error");
      showView("login");
      return false;
    }
    if (isRecoveryInUrl()) enterPasswordRecoveryMode();
    if (isRecoveryPending()) {
      showView("reset");
      return false;
    }
    const { data: { user } } = await sb.auth.getUser();
    currentUser = user || null;
    if (!currentUser) {
      showView("login");
      return false;
    }
    const access = await checkAdminAccess();
    if (!access.ok) {
      showDeniedDebug(access);
      return false;
    }
    currentUser = access.user;
    showView("app");
    if (!panelsLoaded) {
      panelsLoaded = true;
      await loadAllPanels();
    }
    return true;
  }

  function slugify(text) {
    return String(text || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "item";
  }

  function escapeHtml(str) {
    return window.CmsCore?.escapeHtml(str) ?? String(str ?? "");
  }

  function escapeAttr(str) {
    return escapeHtml(str).replace(/"/g, "&quot;");
  }

  function readCardFields(card) {
    return Panels.readCard ? Panels.readCard(card) : {};
  }

  async function loadPageSections(slug) {
    const { data, error } = await sb.from("page_sections").select("*").eq("page_slug", slug);
    if (error) throw error;
    sectionRowsBySlug[slug] = data || [];
    return sectionRowsBySlug[slug];
  }

  function fieldValue(slug, key) {
    const row = (sectionRowsBySlug[slug] || []).find((r) => r.field_key === key);
    return row ? row.field_value : "";
  }

  function renderFieldInput(key, value) {
    const label = L.labelForField(key);
    const id = "field-" + key.replace(/[^a-z0-9]/gi, "-");
    const multiline = /lead|bio|description|notice|meta|para|body|message/i.test(key);
    return `<div class="admin-field" data-field-key="${escapeAttr(key)}">
      <label for="${id}">${escapeHtml(label)}</label>
      ${multiline ? `<textarea id="${id}" rows="3">${escapeHtml(value)}</textarea>` : `<input id="${id}" type="text" value="${escapeAttr(value)}" />`}
    </div>`;
  }

  function renderPageFields(container, slug, keys, extraKeys) {
    if (!container) return;
    const allKeys = [...(keys || []), ...(extraKeys || [])];
    container.innerHTML = allKeys.map((key) => renderFieldInput(key, fieldValue(slug, key))).join("");
  }

  function findCta(def) {
    return ctaCache.find((r) => r.section_key === def.section_key && r.page_slug === def.page_slug);
  }

  async function savePageFields(slug, keys, extraKeys) {
    const rows = sectionRowsBySlug[slug] || [];
    const allKeys = [...(keys || []), ...(extraKeys || [])];
    const container =
      slug === "meet-dr-fowler"
        ? $("page-editor-meet-dr-fowler")
        : slug === "patient-resources"
          ? $("page-editor-patient-resources")
          : $("page-editor-contact");

    for (const key of allKeys) {
      const wrap = container?.querySelector(`[data-field-key="${key}"]`);
      const input = wrap?.querySelector("input, textarea");
      const value = input ? input.value : "";
      const existing = rows.find((r) => r.field_key === key);
      if (existing?.id) {
        const { error } = await sb
          .from("page_sections")
          .update({ field_value: value, updated_at: new Date().toISOString() })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await sb.from("page_sections").insert({ page_slug: slug, field_key: key, field_value: value });
        if (error) throw error;
      }
    }
    await loadPageSections(slug);
  }

  async function saveCtaFromCard(def, card) {
    if (!card || !def) return;
    const raw = readCardFields(card);
    const payload = {
      block_key: `${def.page_slug}-${def.section_key}`,
      section_key: def.section_key,
      page_slug: def.page_slug,
      eyebrow: raw.eyebrow,
      title: raw.title,
      body: raw.body,
      button_primary_label: raw.button_primary_label,
      button_primary_href: raw.button_primary_href,
      button_secondary_label: raw.button_secondary_label,
      button_secondary_href: raw.button_secondary_href,
      is_active: true,
      updated_at: new Date().toISOString(),
    };
    const existing = findCta(def);
    if (existing?.id) {
      const { error } = await sb.from("cta_blocks").update(payload).eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await sb.from("cta_blocks").insert(payload);
      if (error) throw error;
    }
  }

  function renderOfficeHours(rows) {
    const editor = $("office-hours-editor");
    if (!editor) return;
    const list = Array.isArray(rows) && rows.length ? rows : [{ day: "", hours: "" }];
    editor.innerHTML = list
      .map(
        (row, i) => `<div class="admin-hours-row" data-hours-idx="${i}">
          <div class="admin-field"><label>Day</label><input type="text" data-hours-day value="${escapeAttr(row.day || "")}" placeholder="Monday" /></div>
          <div class="admin-field"><label>Hours</label><input type="text" data-hours-time value="${escapeAttr(row.hours || "")}" placeholder="8:00 AM – 4:00 PM" /></div>
          <button type="button" class="admin-btn admin-btn--ghost admin-btn--sm" data-action="remove-hours" ${list.length <= 1 ? "disabled" : ""}>Remove</button>
        </div>`
      )
      .join("");
  }

  function readOfficeHours() {
    const rows = [];
    $("office-hours-editor")?.querySelectorAll(".admin-hours-row").forEach((row) => {
      const day = row.querySelector("[data-hours-day]")?.value?.trim();
      const hours = row.querySelector("[data-hours-time]")?.value?.trim();
      if (day || hours) rows.push({ day: day || "", hours: hours || "" });
    });
    return rows;
  }

  function imageCardHtml(key, label, sortOrder) {
    const row = imagesCache.find((i) => i.image_key === key);
    const preview = row?.public_url
      ? `<img src="${escapeAttr(row.public_url)}" alt="" class="admin-thumb" />`
      : '<div class="admin-photo-placeholder" aria-hidden="true">No photo</div>';
    const active = row?.is_active !== false;
    return `<div class="admin-panel admin-card" data-image-key="${escapeAttr(key)}" data-sort-order="${sortOrder}">
      <div class="admin-card__head"><strong>${escapeHtml(label)}</strong>${Panels.activeToggle ? Panels.activeToggle(active) : ""}</div>
      <div class="admin-photo-wrap">${preview}</div>
      <div class="admin-field"><label>Description for screen readers</label><input type="text" data-f="alt_text" value="${escapeAttr(row?.alt_text || "")}" /></div>
      <input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" data-f="image_file" hidden />
      <div class="admin-card-actions">
        <button type="button" class="admin-btn admin-btn--secondary admin-btn--sm" data-action="pick-image">Upload Photo</button>
        <button type="button" class="admin-btn admin-btn--primary admin-btn--sm" data-action="save-image" data-sort="${sortOrder}">Save Changes</button>
        <button type="button" class="admin-btn admin-btn--ghost admin-btn--sm" data-action="slide-up">${escapeHtml(L.BUTTONS.moveUp)}</button>
        <button type="button" class="admin-btn admin-btn--ghost admin-btn--sm" data-action="slide-down">${escapeHtml(L.BUTTONS.moveDown)}</button>
      </div>
    </div>`;
  }

  function renderHomepage() {
    const wrap = $("homepage-sections");
    if (!wrap) return;
    const slug = "index";
    const rows = sectionRowsBySlug[slug] || [];

    wrap.innerHTML = (L.HOMEPAGE_SECTIONS || [])
      .map((sec) => {
        let body = `<p class="admin-help">${escapeHtml(sec.description)}</p>`;
        if (sec.fieldKeys) {
          body += sec.fieldKeys.map((k) => renderFieldInput(k, fieldValue(slug, k))).join("");
        }
        if (sec.ctaBlock) {
          body += Panels.renderCtaBlock(sec.ctaBlock, findCta(sec.ctaBlock));
        }
        if (sec.type === "trust") {
          body += `<div id="homepage-trust-editor" class="admin-stack">${Panels.renderTrust("", trustCache)}</div>`;
        }
        if (sec.type === "slideshow") {
          body += `<div id="slideshow-editor" class="admin-stack"></div>`;
        }
        if (sec.type === "showcase-images") {
          body += `<div id="showcase-editor" class="admin-grid-2"></div>`;
        }
        return `<div class="admin-panel admin-card" data-home-section="${escapeAttr(sec.id)}">
          <h2 class="admin-card__title">${escapeHtml(sec.title)}</h2>${body}
        </div>`;
      })
      .join("");

    const trustHost = wrap.querySelector("#homepage-trust-editor");
    if (trustHost) trustHost.innerHTML = Panels.renderTrust(null, trustCache);

    const slideHost = wrap.querySelector("#slideshow-editor");
    if (slideHost) {
      slideHost.innerHTML = SLIDE_KEYS.map((key, idx) => imageCardHtml(key, `Photo ${idx + 1}`, idx)).join("");
    }
    const showcaseHost = wrap.querySelector("#showcase-editor");
    if (showcaseHost) {
      showcaseHost.innerHTML = ["before", "after"]
        .map((key, i) => imageCardHtml(key, key === "before" ? "Before" : "After", 100 + i))
        .join("");
    }
  }

  async function loadSettings() {
    const { data, error } = await sb.from("site_settings").select("*").eq("id", 1).maybeSingle();
    if (error) throw error;
    settingsCache = data || {};
    const form = $("settings-form");
    if (!form) return;
    ["practice_name", "tagline", "phone", "phone_display", "fax", "fax_display", "email", "address_line1", "address_line2", "footer_copyright", "website_credit_text", "website_credit_url"].forEach((name) => {
      if (form[name]) form[name].value = data?.[name] || "";
    });
    const notice = $("set-contact-notice");
    if (notice) notice.value = data?.contact_form_notice || "";
    renderOfficeHours(data?.office_hours || []);
  }

  async function loadNavigation() {
    const { data, error } = await sb.from("navigation_links").select("*").order("sort_order");
    if (error) throw error;
    navCache = data || [];
    Panels.renderNavigation($("navigation-editor"), navCache);
  }

  async function loadTrustCards() {
    const { data, error } = await sb.from("trust_cards").select("*").order("sort_order");
    if (error) throw error;
    trustCache = data || [];
  }

  async function loadCtaBlocks() {
    const { data, error } = await sb.from("cta_blocks").select("*");
    if (error) throw error;
    ctaCache = data || [];
  }

  async function loadFormFields() {
    const { data, error } = await sb.from("contact_form_fields").select("*").order("sort_order");
    if (error) throw error;
    formFieldsCache = data || [];
    Panels.renderFormFields($("form-fields-editor"), formFieldsCache);
  }

  async function loadUiLabels() {
    const { data, error } = await sb.from("ui_labels").select("*");
    if (error) throw error;
    labelsCache = data || [];
    Panels.renderContactLabels($("contact-form-labels-editor"), labelsCache);
  }

  async function loadServices() {
    const { data, error } = await sb.from("services").select("*").order("sort_order");
    if (error) throw error;
    servicesCache = data || [];
    renderServicesEditor();
  }

  function renderServicesEditor() {
    const editor = $("services-editor");
    if (!editor) return;
    editor.innerHTML = servicesCache
      .map(
        (s, i) => `<div class="admin-panel admin-card" data-service-id="${s.id}" data-sort-order="${s.sort_order}">
          <input type="hidden" data-f="slug" value="${escapeAttr(s.slug)}" />
          <input type="hidden" data-f="sort_order" value="${s.sort_order}" />
          <div class="admin-field"><label>Service name</label><input type="text" data-f="name" value="${escapeAttr(s.name || s.title || "")}" /></div>
          <div class="admin-field"><label>Short description</label><textarea data-f="short_description" rows="2">${escapeHtml(s.short_description || s.lead || "")}</textarea></div>
          <div class="admin-field"><label>Full description</label><textarea data-f="full_description" rows="4">${escapeHtml(s.full_description || "")}</textarea></div>
          <label class="admin-check"><input type="checkbox" data-f="is_active" ${s.is_active ? "checked" : ""} /> Show on Website</label>
          <div class="admin-card-actions">
            <button type="button" class="admin-btn admin-btn--ghost admin-btn--sm" data-action="service-up" ${i === 0 ? "disabled" : ""}>${escapeHtml(L.BUTTONS.moveUp)}</button>
            <button type="button" class="admin-btn admin-btn--ghost admin-btn--sm" data-action="service-down" ${i === servicesCache.length - 1 ? "disabled" : ""}>${escapeHtml(L.BUTTONS.moveDown)}</button>
            <button type="button" class="admin-btn admin-btn--primary admin-btn--sm" data-action="save-service">${escapeHtml(L.BUTTONS.save)}</button>
            <button type="button" class="admin-btn admin-btn--danger admin-btn--sm" data-action="delete-service">Remove</button>
          </div>
        </div>`
      )
      .join("");
  }

  async function loadStaff() {
    const { data, error } = await sb.from("staff_members").select("*").order("sort_order");
    if (error) throw error;
    staffCache = data || [];
    renderStaffEditor();
  }

  function staffPlaceholder(m) {
    const initials = (m.initials || m.name || "?")
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 3)
      .toUpperCase();
    return `<div class="admin-photo-placeholder">${escapeHtml(initials)}</div>`;
  }

  function renderStaffEditor() {
    const editor = $("staff-editor");
    if (!editor) return;
    editor.innerHTML = staffCache
      .map(
        (m, i) => `<div class="admin-panel admin-card" data-staff-id="${m.id}">
          <input type="hidden" data-f="slug" value="${escapeAttr(m.slug)}" />
          <input type="hidden" data-f="sort_order" value="${m.sort_order}" />
          <div class="admin-photo-wrap">${m.photo_url ? `<img src="${escapeAttr(m.photo_url)}" alt="" class="admin-thumb" />` : staffPlaceholder(m)}</div>
          <div class="admin-grid-2">
            <div class="admin-field"><label>Name</label><input type="text" data-f="name" value="${escapeAttr(m.name)}" /></div>
            <div class="admin-field"><label>Initials (if no photo)</label><input type="text" data-f="initials" value="${escapeAttr(m.initials || "")}" maxlength="3" /></div>
          </div>
          <div class="admin-field"><label>Bio</label><textarea data-f="bio" rows="4">${escapeHtml(m.bio)}</textarea></div>
          <label class="admin-check"><input type="checkbox" data-f="is_active" ${m.is_active ? "checked" : ""} /> Show on Website</label>
          <input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" data-f="photo_file" hidden />
          <div class="admin-card-actions">
            <button type="button" class="admin-btn admin-btn--secondary admin-btn--sm" data-action="pick-staff-photo">Upload Photo</button>
            <button type="button" class="admin-btn admin-btn--ghost admin-btn--sm" data-action="staff-up" ${i === 0 ? "disabled" : ""}>${escapeHtml(L.BUTTONS.moveUp)}</button>
            <button type="button" class="admin-btn admin-btn--ghost admin-btn--sm" data-action="staff-down" ${i === staffCache.length - 1 ? "disabled" : ""}>${escapeHtml(L.BUTTONS.moveDown)}</button>
            <button type="button" class="admin-btn admin-btn--primary admin-btn--sm" data-action="save-staff">${escapeHtml(L.BUTTONS.save)}</button>
            <button type="button" class="admin-btn admin-btn--danger admin-btn--sm" data-action="delete-staff">Remove</button>
          </div>
        </div>`
      )
      .join("");
  }

  async function loadImages() {
    const { data, error } = await sb.from("site_images").select("*").order("sort_order");
    if (error) throw error;
    imagesCache = data || [];
    const logo = $("logo-editor");
    if (logo) logo.innerHTML = imageCardHtml("logo", "Logo", 0);
    renderHomepage();
  }

  async function loadSubmissions() {
    const { data, error } = await sb
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    const list = $("submissions-list");
    if (!list) return;
    list.innerHTML = (data || []).length
      ? data.map(renderSubmissionCard).join("")
      : '<p class="admin-help">No messages yet.</p>';
  }

  function renderSubmissionCard(row) {
    const status = row.status || "new";
    const statusLabel = { new: "New", read: "Read", archived: "Archived" }[status] || status;
    return `<div class="admin-panel admin-card" data-submission-id="${row.id}">
      <div class="admin-card__head">
        <p><strong>${escapeHtml(row.name)}</strong></p>
        <span class="admin-badge admin-badge--${escapeAttr(status)}">${escapeHtml(statusLabel)}</span>
      </div>
      <p class="admin-help"><strong>Date received:</strong> ${escapeHtml(new Date(row.created_at).toLocaleString())}</p>
      <p><strong>Email:</strong> ${escapeHtml(row.email)}</p>
      ${row.phone ? `<p><strong>Phone:</strong> ${escapeHtml(row.phone)}</p>` : ""}
      ${row.preferred_time ? `<p><strong>Preferred time:</strong> ${escapeHtml(row.preferred_time)}</p>` : ""}
      <p><strong>Message:</strong><br />${escapeHtml(row.message)}</p>
      <div class="admin-field">
        <label>Status</label>
        <select data-f="status">
          <option value="new" ${status === "new" ? "selected" : ""}>New</option>
          <option value="read" ${status === "read" ? "selected" : ""}>Read</option>
          <option value="archived" ${status === "archived" ? "selected" : ""}>Archived</option>
        </select>
      </div>
      <button type="button" class="admin-btn admin-btn--secondary admin-btn--sm" data-action="save-submission">Save Changes</button>
    </div>`;
  }

  async function uploadImage(file, path) {
    if (!window.CmsCore?.isAllowedImageFile(file)) {
      throw new Error(L.MESSAGES.uploadFailed);
    }
    const { error } = await sb.storage.from("site-images").upload(path, file, { upsert: true, contentType: file.type || undefined });
    if (error) throw error;
    const { data } = sb.storage.from("site-images").getPublicUrl(path);
    return data.publicUrl;
  }

  async function uploadStaffPhoto(file, slug) {
    if (!window.CmsCore?.isAllowedImageFile(file)) throw new Error(L.MESSAGES.uploadFailed);
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const { error } = await sb.storage.from("staff-photos").upload(`${slug}-${Date.now()}.${ext}`, file, { upsert: true, contentType: file.type || undefined });
    if (error) throw error;
    const { data } = sb.storage.from("staff-photos").getPublicUrl(`${slug}-${Date.now()}.${ext}`);
    return data.publicUrl;
  }

  async function saveImageCard(card) {
    const key = card.getAttribute("data-image-key");
    const sortOrder = Number(card.getAttribute("data-sort-order") || 0);
    const file = card.querySelector('[data-f="image_file"]')?.files?.[0];
    const alt_text = card.querySelector('[data-f="alt_text"]')?.value || "";
    const is_active = card.querySelector('[data-f="is_active"]')?.checked !== false;
    let category = "general";
    if (SLIDE_KEYS.includes(key)) category = "slideshow";
    else if (key === "before" || key === "after") category = key;
    else if (key === "logo") category = "logo";

    let url = imagesCache.find((i) => i.image_key === key)?.public_url;
    if (file) {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const folder = key === "logo" ? "logo" : category === "slideshow" ? "slideshow" : "showcase";
      url = await uploadImage(file, `${folder}/${key}.${ext}`);
    }
    if (!url) throw new Error("Please choose a photo to upload.");

    const payload = {
      image_key: key,
      category,
      public_url: url,
      alt_text,
      title: "",
      is_active,
      sort_order: sortOrder,
      updated_at: new Date().toISOString(),
    };
    const existing = imagesCache.find((i) => i.image_key === key);
    if (existing?.id) {
      const { error } = await sb.from("site_images").update(payload).eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await sb.from("site_images").insert(payload);
      if (error) throw error;
    }
  }

  async function saveTrustFromEditor(root) {
    const cards = root?.querySelectorAll("[data-trust-key]") || [];
    for (const card of cards) {
      const key = card.getAttribute("data-trust-key");
      const raw = readCardFields(card);
      const payload = {
        card_key: key,
        label: raw.label,
        title: raw.title,
        sort_order: Number(raw.sort_order),
        is_active: raw.is_active,
        updated_at: new Date().toISOString(),
      };
      const existing = trustCache.find((r) => r.card_key === key);
      if (existing?.id) {
        const { error } = await sb.from("trust_cards").update(payload).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await sb.from("trust_cards").insert(payload);
        if (error) throw error;
      }
    }
    await loadTrustCards();
  }

  async function swapSort(table, cache, idA, idB, field) {
    const a = cache.find((r) => r.id === idA);
    const b = cache.find((r) => r.id === idB);
    if (!a || !b) return;
    await sb.from(table).update({ [field]: b.sort_order }).eq("id", a.id);
    await sb.from(table).update({ [field]: a.sort_order }).eq("id", b.id);
  }

  async function loadPanelSafe(fn, name) {
    try {
      await fn();
    } catch (err) {
      console.warn(`[admin] ${name}:`, err);
      if (/does not exist|relation/i.test(err.message || "")) {
        showGlobal(L.MESSAGES.tableMissing, "error");
      }
    }
  }

  async function loadAllPanels() {
    initDashboard();
    await loadPanelSafe(loadSettings, "basics");
    await loadPanelSafe(() => loadPageSections("index"), "homepage text");
    await loadPanelSafe(loadTrustCards, "trust");
    await loadPanelSafe(loadCtaBlocks, "cta");
    await loadPanelSafe(loadImages, "images");
    await Promise.all([
      loadPanelSafe(() => loadPageSections("meet-dr-fowler"), "meet dr"),
      loadPanelSafe(() => loadPageSections("patient-resources"), "patient resources"),
      loadPanelSafe(() => loadPageSections("contact"), "contact"),
      loadPanelSafe(loadNavigation, "navigation"),
      loadPanelSafe(loadFormFields, "form fields"),
      loadPanelSafe(loadUiLabels, "labels"),
      loadPanelSafe(loadServices, "services"),
      loadPanelSafe(loadStaff, "staff"),
      loadPanelSafe(loadSubmissions, "messages"),
    ]);
    renderPageFields($("page-editor-meet-dr-fowler"), "meet-dr-fowler", L.PAGE_SLUGS?.["meet-dr-fowler"]?.fieldKeys);
    renderPageFields($("page-editor-patient-resources"), "patient-resources", L.PAGE_SLUGS?.["patient-resources"]?.fieldKeys);
    const contactExtra = ["contact-form-success", "contact-form-error"];
    renderPageFields($("page-editor-contact"), "contact", L.PAGE_SLUGS?.contact?.fieldKeys, contactExtra);
  }

  // --- Auth UI ---
  $("login-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    sb = getClient();
    if (!sb) {
      showAlert($("login-alert"), "Website connection is not configured.", "error");
      return;
    }
    const email = $("login-email").value.trim();
    const password = $("login-password").value;
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
      showAlert($("login-alert"), error.message, "error");
      return;
    }
    panelsLoaded = false;
    await requireSession();
  });

  $("btn-show-forgot")?.addEventListener("click", () => showView("forgot"));
  $("btn-back-login-from-forgot")?.addEventListener("click", () => showView("login"));

  $("forgot-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    sb = getClient();
    const email = $("forgot-email").value.trim();
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: getPasswordResetRedirect() });
    if (error) showAlert($("forgot-alert"), error.message, "error");
    else showAlert($("forgot-alert"), "If that email is registered, a reset link was sent.", "success");
  });

  $("reset-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    sb = getClient();
    if (!sb) {
      showAlert($("reset-alert"), "Website connection is not configured.", "error");
      return;
    }
    const pw = ($("reset-password")?.value || "").trim();
    const confirm = ($("reset-password-confirm")?.value || "").trim();
    if (!pw) {
      showAlert($("reset-alert"), "Password must be at least 8 characters.", "error");
      return;
    }
    if (pw !== confirm) {
      showAlert($("reset-alert"), "Passwords do not match.", "error");
      return;
    }
    if (pw.length < 8) {
      showAlert($("reset-alert"), "Password must be at least 8 characters.", "error");
      return;
    }
    const btn = $("btn-update-password");
    if (btn) btn.disabled = true;
    showAlert($("reset-alert"), "Updating password…", "info");
    const { error } = await sb.auth.updateUser({ password: pw });
    if (btn) btn.disabled = false;
    if (error) {
      console.error("[admin] password update failed:", error);
      showAlert($("reset-alert"), "Unable to update password. Please request a new reset link.", "error");
      return;
    }
    exitPasswordRecoveryMode();
    clearRecoveryFromUrl();
    showAlert($("reset-alert"), "", "");
    if ($("reset-form")) $("reset-form").hidden = true;
    if ($("reset-success")) $("reset-success").hidden = false;
    $("reset-password").value = "";
    $("reset-password-confirm").value = "";
  });

  $("btn-continue-dashboard")?.addEventListener("click", async () => {
    exitPasswordRecoveryMode();
    panelsLoaded = false;
    const ok = await requireSession();
    if (!ok && !passwordRecoveryMode) {
      showAlert($("reset-alert"), "Unable to open the dashboard. Please sign in again.", "error");
      if ($("reset-form")) $("reset-form").hidden = false;
      if ($("reset-success")) $("reset-success").hidden = true;
    }
  });

  $("btn-back-login-from-reset")?.addEventListener("click", async () => {
    exitPasswordRecoveryMode();
    clearRecoveryFromUrl();
    if (sb) await sb.auth.signOut();
    currentUser = null;
    panelsLoaded = false;
    if ($("reset-form")) $("reset-form").hidden = false;
    if ($("reset-success")) $("reset-success").hidden = true;
    showView("login");
  });

  async function logout() {
    exitPasswordRecoveryMode();
    if (sb) await sb.auth.signOut();
    currentUser = null;
    panelsLoaded = false;
    if ($("reset-form")) $("reset-form").hidden = false;
    if ($("reset-success")) $("reset-success").hidden = true;
    showView("login");
  }

  $("btn-logout")?.addEventListener("click", logout);
  $("btn-denied-logout")?.addEventListener("click", logout);

  document.querySelectorAll("#admin-nav .admin-nav__item").forEach((btn) => {
    btn.addEventListener("click", () => showPanel(btn.getAttribute("data-panel")));
  });

  $("btn-sidebar-toggle")?.addEventListener("click", () => {
    $("admin-sidebar")?.classList.toggle("is-open");
  });

  $("btn-add-hours-row")?.addEventListener("click", () => {
    const rows = readOfficeHours();
    rows.push({ day: "", hours: "" });
    renderOfficeHours(rows);
  });

  $("office-hours-editor")?.addEventListener("click", (e) => {
    if (!e.target.matches("[data-action='remove-hours']")) return;
    const rows = readOfficeHours();
    const row = e.target.closest(".admin-hours-row");
    const idx = Number(row?.getAttribute("data-hours-idx"));
    rows.splice(idx, 1);
    renderOfficeHours(rows.length ? rows : [{ day: "", hours: "" }]);
  });

  $("btn-save-settings")?.addEventListener("click", async () => {
    const form = $("settings-form");
    const office_hours = readOfficeHours();
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
      website_credit_text: form.website_credit_text.value.trim(),
      website_credit_url: form.website_credit_url.value.trim(),
      office_hours,
      updated_at: new Date().toISOString(),
    };
    const { error } = await sb.from("site_settings").upsert(payload);
    if (error) showGlobal(error.message, "error");
    else {
      settingsCache = payload;
      showGlobal(L.MESSAGES.saved, "success");
    }
  });

  $("btn-save-homepage")?.addEventListener("click", async () => {
    try {
      const slug = "index";
      for (const sec of L.HOMEPAGE_SECTIONS || []) {
        if (sec.fieldKeys) {
          const host = document.querySelector(`[data-home-section="${sec.id}"]`);
          for (const key of sec.fieldKeys) {
            const wrap = host?.querySelector(`[data-field-key="${key}"]`);
            const input = wrap?.querySelector("input, textarea");
            const value = input ? input.value : "";
            const rows = sectionRowsBySlug[slug] || [];
            const existing = rows.find((r) => r.field_key === key);
            if (existing?.id) {
              const { error } = await sb.from("page_sections").update({ field_value: value, updated_at: new Date().toISOString() }).eq("id", existing.id);
              if (error) throw error;
            } else {
              const { error } = await sb.from("page_sections").insert({ page_slug: slug, field_key: key, field_value: value });
              if (error) throw error;
            }
          }
        }
        if (sec.ctaBlock) {
          const card = document.querySelector(`[data-home-section="${sec.id}"] .admin-cta-block`);
          await saveCtaFromCard(sec.ctaBlock, card);
        }
      }
      await saveTrustFromEditor($("homepage-sections"));
      for (const card of $("homepage-sections")?.querySelectorAll("[data-image-key]") || []) {
        if (card.querySelector('[data-f="image_file"]')?.files?.[0] || card.querySelector('[data-f="alt_text"]')) {
          await saveImageCard(card);
        }
      }
      if ($("logo-editor")?.querySelector("[data-image-key]")) {
        await saveImageCard($("logo-editor").querySelector("[data-image-key]"));
      }
      await loadPageSections("index");
      await loadCtaBlocks();
      await loadImages();
      showGlobal(L.MESSAGES.saved, "success");
    } catch (err) {
      showGlobal(err.message || L.MESSAGES.saveFailed, "error");
    }
  });

  $("btn-save-meet-dr-fowler")?.addEventListener("click", async () => {
    try {
      await savePageFields("meet-dr-fowler", L.PAGE_SLUGS?.["meet-dr-fowler"]?.fieldKeys);
      showGlobal(L.MESSAGES.saved, "success");
    } catch (err) {
      showGlobal(err.message || L.MESSAGES.saveFailed, "error");
    }
  });

  $("btn-save-patient-resources")?.addEventListener("click", async () => {
    try {
      await savePageFields("patient-resources", L.PAGE_SLUGS?.["patient-resources"]?.fieldKeys);
      showGlobal(L.MESSAGES.saved, "success");
    } catch (err) {
      showGlobal(err.message || L.MESSAGES.saveFailed, "error");
    }
  });

  $("btn-save-contact")?.addEventListener("click", async () => {
    try {
      await savePageFields("contact", L.PAGE_SLUGS?.contact?.fieldKeys, ["contact-form-success", "contact-form-error"]);
      const notice = $("set-contact-notice")?.value?.trim() || "";
      await sb.from("site_settings").upsert({ id: 1, contact_form_notice: notice, updated_at: new Date().toISOString() });
      for (const card of $("form-fields-editor")?.querySelectorAll("[data-field-key]") || []) {
        const key = card.getAttribute("data-field-key");
        const raw = readCardFields(card);
        const payload = {
          field_key: key,
          label: raw.label,
          placeholder: raw.placeholder,
          is_required: raw.is_required,
          is_active: raw.is_active,
          sort_order: Number(raw.sort_order),
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
      for (const wrap of $("contact-form-labels-editor")?.querySelectorAll("[data-label-key]") || []) {
        const key = wrap.getAttribute("data-label-key");
        const val = wrap.querySelector('[data-f="label_value"]')?.value ?? "";
        const payload = { label_key: key, label_value: val, updated_at: new Date().toISOString() };
        const existing = labelsCache.find((r) => r.label_key === key);
        if (existing?.id) {
          const { error } = await sb.from("ui_labels").update(payload).eq("id", existing.id);
          if (error) throw error;
        } else {
          const { error } = await sb.from("ui_labels").insert(payload);
          if (error) throw error;
        }
      }
      await loadFormFields();
      await loadUiLabels();
      showGlobal(L.MESSAGES.saved, "success");
    } catch (err) {
      showGlobal(err.message || L.MESSAGES.saveFailed, "error");
    }
  });

  $("btn-save-navigation")?.addEventListener("click", async () => {
    try {
      const defs = [...(NAV_LINK_KEYS || []), ...(FOOTER_LINK_KEYS || [])];
      for (const card of $("navigation-editor")?.querySelectorAll("[data-link-key]") || []) {
        const key = card.getAttribute("data-link-key");
        const def = defs.find((d) => d.key === key);
        const raw = readCardFields(card);
        const payload = {
          link_key: key,
          location: raw.location || def?.location || "nav",
          label: raw.label,
          href: raw.href,
          sort_order: Number(raw.sort_order),
          is_active: raw.is_active,
          updated_at: new Date().toISOString(),
        };
        const existing = navCache.find((r) => r.link_key === key);
        if (existing?.id) {
          const { error } = await sb.from("navigation_links").update(payload).eq("id", existing.id);
          if (error) throw error;
        } else {
          const { error } = await sb.from("navigation_links").insert(payload);
          if (error) throw error;
        }
      }
      await loadNavigation();
      showGlobal(L.MESSAGES.saved, "success");
    } catch (err) {
      showGlobal(err.message || L.MESSAGES.saveFailed, "error");
    }
  });

  $("navigation-editor")?.addEventListener("click", async (e) => {
    const card = e.target.closest("[data-link-key]");
    if (!card) return;
    const key = card.getAttribute("data-link-key");
    const idx = navCache.findIndex((r) => r.link_key === key);
    const group = card.closest("[data-nav-group]");
    const loc = group?.getAttribute("data-nav-group");
    const groupKeys = [...(group?.querySelectorAll("[data-link-key]") || [])].map((c) => c.getAttribute("data-link-key"));
    const gIdx = groupKeys.indexOf(key);
    if (e.target.matches("[data-action='nav-up']") && gIdx > 0) {
      const otherKey = groupKeys[gIdx - 1];
      const a = navCache.find((r) => r.link_key === key);
      const b = navCache.find((r) => r.link_key === otherKey);
      if (a?.id && b?.id) {
        await swapSort("navigation_links", [a, b], a.id, b.id, "sort_order");
        await loadNavigation();
      }
    }
    if (e.target.matches("[data-action='nav-down']") && gIdx < groupKeys.length - 1) {
      const otherKey = groupKeys[gIdx + 1];
      const a = navCache.find((r) => r.link_key === key);
      const b = navCache.find((r) => r.link_key === otherKey);
      if (a?.id && b?.id) {
        await swapSort("navigation_links", [a, b], a.id, b.id, "sort_order");
        await loadNavigation();
      }
    }
  });

  $("homepage-sections")?.addEventListener("click", async (e) => {
    const trustCard = e.target.closest("[data-trust-key]");
    if (trustCard && (e.target.matches("[data-action='trust-up']") || e.target.matches("[data-action='trust-down']"))) {
      const key = trustCard.getAttribute("data-trust-key");
      const idx = (Cat.TRUST_CARD_KEYS || []).findIndex((d) => d.key === key);
      const swapIdx = e.target.matches("[data-action='trust-up']") ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= trustCache.length) return;
      const a = trustCache.find((r) => r.card_key === key);
      const otherKey = Cat.TRUST_CARD_KEYS[swapIdx]?.key;
      const b = trustCache.find((r) => r.card_key === otherKey);
      if (a?.id && b?.id) {
        await swapSort("trust_cards", [a, b], a.id, b.id, "sort_order");
        await loadTrustCards();
        renderHomepage();
        showGlobal(L.MESSAGES.saved, "success");
      }
      return;
    }

    const card = e.target.closest("[data-image-key]");
    if (!card) return;
    if (e.target.matches("[data-action='pick-image']")) {
      card.querySelector('[data-f="image_file"]')?.click();
      return;
    }
    if (e.target.matches("[data-action='save-image']")) {
      try {
        await saveImageCard(card);
        showGlobal(L.MESSAGES.uploadOk, "success");
        await loadImages();
      } catch (err) {
        showGlobal(err.message || L.MESSAGES.uploadFailed, "error");
      }
      return;
    }
    if (e.target.matches("[data-action='slide-up'], [data-action='slide-down']")) {
      const key = card.getAttribute("data-image-key");
      const idx = SLIDE_KEYS.indexOf(key);
      const swapIdx = e.target.matches("[data-action='slide-up']") ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= SLIDE_KEYS.length) return;
      const a = imagesCache.find((i) => i.image_key === key);
      const b = imagesCache.find((i) => i.image_key === SLIDE_KEYS[swapIdx]);
      if (a?.id && b?.id) {
        await swapSort("site_images", [a, b], a.id, b.id, "sort_order");
        await loadImages();
        showGlobal(L.MESSAGES.saved, "success");
      }
    }
  });

  $("panel-homepage")?.addEventListener("click", (e) => {
    if (e.target.matches("[data-action='pick-image']")) {
      e.target.closest("[data-image-key]")?.querySelector('[data-f="image_file"]')?.click();
    }
  });

  $("logo-editor")?.addEventListener("click", async (e) => {
    const card = e.target.closest("[data-image-key]");
    if (!card) return;
    if (e.target.matches("[data-action='pick-image']")) {
      card.querySelector('[data-f="image_file"]')?.click();
      return;
    }
    if (e.target.matches("[data-action='save-image']")) {
      try {
        await saveImageCard(card);
        showGlobal(L.MESSAGES.saved, "success");
        await loadImages();
      } catch (err) {
        showGlobal(err.message || L.MESSAGES.uploadFailed, "error");
      }
    }
  });

  $("services-editor")?.addEventListener("click", async (e) => {
    const card = e.target.closest("[data-service-id]");
    if (!card) return;
    const id = card.getAttribute("data-service-id");
    const idx = servicesCache.findIndex((s) => s.id === id);

    if (e.target.matches("[data-action='service-up']") && idx > 0) {
      await swapSort("services", [servicesCache[idx], servicesCache[idx - 1]], servicesCache[idx].id, servicesCache[idx - 1].id, "sort_order");
      await loadServices();
      return;
    }
    if (e.target.matches("[data-action='service-down']") && idx < servicesCache.length - 1) {
      await swapSort("services", [servicesCache[idx], servicesCache[idx + 1]], servicesCache[idx].id, servicesCache[idx + 1].id, "sort_order");
      await loadServices();
      return;
    }
    if (e.target.matches("[data-action='save-service']")) {
      const raw = readCardFields(card);
      const name = raw.name?.trim() || "Service";
      const payload = {
        slug: raw.slug || slugify(name),
        sort_order: raw.sort_order,
        name,
        title: name,
        short_description: raw.short_description,
        lead: raw.short_description,
        full_description: raw.full_description,
        is_active: raw.is_active,
        updated_at: new Date().toISOString(),
      };
      const { error } = await sb.from("services").update(payload).eq("id", id);
      if (error) showGlobal(error.message, "error");
      else {
        showGlobal(L.MESSAGES.saved, "success");
        await loadServices();
      }
    }
    if (e.target.matches("[data-action='delete-service']")) {
      if (!confirm(L.MESSAGES.confirmDeleteService)) return;
      const { error } = await sb.from("services").delete().eq("id", id);
      if (error) showGlobal(error.message, "error");
      else {
        showGlobal(L.MESSAGES.deleted, "success");
        await loadServices();
      }
    }
  });

  $("btn-add-service")?.addEventListener("click", async () => {
    const name = prompt(L.MESSAGES.addServiceName);
    if (!name) return;
    const slug = slugify(name);
    const { error } = await sb.from("services").insert({
      slug,
      name,
      title: name,
      short_description: "",
      lead: "",
      full_description: "",
      sort_order: servicesCache.length,
      is_active: true,
    });
    if (error) showGlobal(error.message, "error");
    else await loadServices();
  });

  $("staff-editor")?.addEventListener("click", async (e) => {
    const card = e.target.closest("[data-staff-id]");
    if (!card) return;
    const id = card.getAttribute("data-staff-id");
    const idx = staffCache.findIndex((m) => m.id === id);

    if (e.target.matches("[data-action='pick-staff-photo']")) {
      card.querySelector('[data-f="photo_file"]')?.click();
      return;
    }
    if (e.target.matches("[data-action='staff-up']") && idx > 0) {
      await swapSort("staff_members", [staffCache[idx], staffCache[idx - 1]], staffCache[idx].id, staffCache[idx - 1].id, "sort_order");
      await loadStaff();
      return;
    }
    if (e.target.matches("[data-action='staff-down']") && idx < staffCache.length - 1) {
      await swapSort("staff_members", [staffCache[idx], staffCache[idx + 1]], staffCache[idx].id, staffCache[idx + 1].id, "sort_order");
      await loadStaff();
      return;
    }
    if (e.target.matches("[data-action='save-staff']")) {
      try {
        const raw = readCardFields(card);
        const name = raw.name?.trim() || "Staff Member";
        const slug = raw.slug || slugify(name);
        const payload = { ...raw, name, slug, updated_at: new Date().toISOString() };
        const file = card.querySelector('[data-f="photo_file"]')?.files?.[0];
        if (file) {
          const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
          const path = `${slug}-${Date.now()}.${ext}`;
          const { error: upErr } = await sb.storage.from("staff-photos").upload(path, file, { upsert: true, contentType: file.type });
          if (upErr) throw upErr;
          payload.photo_url = sb.storage.from("staff-photos").getPublicUrl(path).data.publicUrl;
        }
        delete payload.photo_file;
        const { error } = await sb.from("staff_members").update(payload).eq("id", id);
        if (error) throw error;
        showGlobal(L.MESSAGES.saved, "success");
        await loadStaff();
      } catch (err) {
        showGlobal(err.message || L.MESSAGES.saveFailed, "error");
      }
    }
    if (e.target.matches("[data-action='delete-staff']")) {
      if (!confirm(L.MESSAGES.confirmDeleteStaff)) return;
      const { error } = await sb.from("staff_members").delete().eq("id", id);
      if (error) showGlobal(error.message, "error");
      else {
        showGlobal(L.MESSAGES.deleted, "success");
        await loadStaff();
      }
    }
  });

  $("btn-add-staff")?.addEventListener("click", async () => {
    const name = prompt(L.MESSAGES.addStaffName);
    if (!name) return;
    const { error } = await sb.from("staff_members").insert({
      slug: slugify(name),
      name,
      bio: "",
      sort_order: staffCache.length,
      is_active: true,
    });
    if (error) showGlobal(error.message, "error");
    else await loadStaff();
  });

  $("submissions-list")?.addEventListener("click", async (e) => {
    if (!e.target.matches("[data-action='save-submission']")) return;
    const card = e.target.closest("[data-submission-id]");
    const id = card.getAttribute("data-submission-id");
    const status = card.querySelector('[data-f="status"]').value;
    const { error } = await sb.from("contact_submissions").update({ status }).eq("id", id);
    if (error) showGlobal(error.message, "error");
    else {
      showGlobal(L.MESSAGES.saved, "success");
      await loadSubmissions();
    }
  });

  $("btn-refresh-submissions")?.addEventListener("click", () => loadSubmissions());

  sb = getClient();
  if (!sb) {
    showAlert($("login-alert"), "Website connection is not configured.", "error");
    showView("login");
  } else {
    if (isRecoveryInUrl()) {
      enterPasswordRecoveryMode();
    }

    sb.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        enterPasswordRecoveryMode();
        return;
      }
      if (isRecoveryPending()) {
        showView("reset");
        return;
      }
      if (bootstrapping) return;
      if (event === "SIGNED_OUT") {
        currentUser = null;
        panelsLoaded = false;
        showView("login");
        return;
      }
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED") {
        requireSession();
      }
    });

    requireSession().finally(() => {
      bootstrapping = false;
      if (isRecoveryPending()) showView("reset");
    });
  }
})();
