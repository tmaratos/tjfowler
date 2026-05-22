/**
 * T.J. Fowler DDS — Admin CMS
 */
(function () {
  const PAGE_LABELS = {
    index: "Home",
    "meet-dr-fowler": "Meet Dr. Fowler",
    services: "Services",
    staff: "Staff",
    "patient-resources": "Patient Resources",
    contact: "Contact",
    "404": "404 Page",
  };

  const SECTION_TYPES = [
    { type: "page_hero", label: "Page hero (title area)" },
    { type: "home_hero", label: "Home slideshow hero", pages: ["index"] },
    { type: "trust_cards", label: "Trust cards row", pages: ["index"] },
    { type: "two_column", label: "Two columns + sidebar" },
    { type: "section_header_links", label: "Section header + link grid" },
    { type: "showcase", label: "Before & after showcase", pages: ["index"] },
    { type: "patient_cta", label: "Call-to-action band" },
    { type: "service_nav", label: "Services anchor menu", pages: ["services"] },
    { type: "service_panel", label: "Service detail block", pages: ["services"] },
    { type: "staff_card", label: "Staff bio card", pages: ["staff"] },
    { type: "info_card", label: "Info card" },
    { type: "rich_text", label: "Text section (flexible)" },
  ];

  const state = {
    user: null,
    currentSlug: "index",
    pageMeta: { title: "", meta_description: "" },
    sections: [],
    deletedSectionIds: [],
    siteSettings: null,
    settingsMode: false,
  };

  const $ = (sel) => document.querySelector(sel);
  const loginView = $("#login-view");
  const appView = $("#app-view");
  const loginAlert = $("#login-alert");
  const globalAlert = $("#global-alert");

  function alert(el, msg, type) {
    if (!el) return;
    el.innerHTML = msg
      ? `<div class="admin-alert admin-alert--${type}">${msg}</div>`
      : "";
  }

  function getSb() {
    if (!window.CmsCore.isConfigured()) return null;
    return window.CmsCore.getClient();
  }

  function uuid() {
    return crypto.randomUUID();
  }

  function defaultContent(type) {
    const d = window.CMS_DEFAULTS?.pages || {};
    for (const page of Object.values(d)) {
      const found = (page.sections || []).find((s) => s.section_type === type);
      if (found) return JSON.parse(JSON.stringify(found.content));
    }
    const fallbacks = {
      page_hero: { eyebrow: "", title: "New Section", subtitle: "" },
      rich_text: { title: "New Section", paragraphs: ["Add your content here."] },
      staff_card: { name: "Team Member", bio: "" },
      service_panel: {
        anchor_id: "section-" + Date.now(),
        eyebrow: "",
        title: "Service",
        lead: "",
      },
      patient_cta: {
        eyebrow: "",
        title: "",
        text: "",
        buttons: [{ text: "Contact", href: "contact.html", style: "primary" }],
      },
    };
    return fallbacks[type] || {};
  }

  function field(label, html) {
    return `<div class="admin-field"><label>${label}</label>${html}</div>`;
  }

  function input(name, value, type = "text") {
    const v = window.CmsCore.escapeHtml(value ?? "");
    return `<input type="${type}" data-key="${name}" value="${v}" />`;
  }

  function textarea(name, value, rows = 3) {
    return `<textarea data-key="${name}" rows="${rows}">${window.CmsCore.escapeHtml(value ?? "")}</textarea>`;
  }

  function renderSectionEditor(section, index) {
    const c = section.content || {};
    const type = section.section_type;
    let fields = "";

    const add = (label, key, kind = "text", rows) => {
      if (kind === "textarea")
        fields += field(label, textarea(key, c[key], rows));
      else fields += field(label, input(key, c[key], kind));
    };

    switch (type) {
      case "home_hero":
        add("Eyebrow", "eyebrow");
        add("Headline", "title");
        add("Subtitle", "subtitle", "textarea", 2);
        fields += field(
          "Primary button text",
          input("cta_primary.text", c.cta_primary?.text)
        );
        fields += field(
          "Primary button link",
          input("cta_primary.href", c.cta_primary?.href)
        );
        fields += field(
          "Secondary button text",
          input("cta_secondary.text", c.cta_secondary?.text)
        );
        fields += field(
          "Secondary button link",
          input("cta_secondary.href", c.cta_secondary?.href)
        );
        fields += field(
          "Slides (one per line: image path | alt text)",
          textarea(
            "_slides",
            (c.slides || []).map((s) => `${s.src} | ${s.alt}`).join("\n"),
            6
          )
        );
        break;
      case "page_hero":
        add("Eyebrow", "eyebrow");
        add("Title", "title");
        add("Subtitle", "subtitle", "textarea", 2);
        break;
      case "trust_cards":
        fields += field(
          "Cards (one per line: label | title)",
          textarea(
            "_cards",
            (c.cards || []).map((x) => `${x.label} | ${x.title}`).join("\n"),
            6
          )
        );
        break;
      case "two_column":
        add("Eyebrow (optional)", "eyebrow");
        add("Title", "title");
        fields += field(
          "Paragraphs (one per line)",
          textarea("_paragraphs", (c.paragraphs || []).join("\n"), 6)
        );
        fields += field("Sidebar type", `<select data-key="sidebar.type">
          <option value="office_hours" ${c.sidebar?.type === "office_hours" ? "selected" : ""}>Office hours</option>
          <option value="info_card" ${c.sidebar?.type === "info_card" ? "selected" : ""}>Info card</option>
          <option value="" ${!c.sidebar ? "selected" : ""}>None</option>
        </select>`);
        add("Sidebar title", "sidebar.title");
        fields += field(
          "Sidebar paragraphs (one per line)",
          textarea("_sidebar_paragraphs", (c.sidebar?.paragraphs || []).join("\n"), 4)
        );
        fields += field(
          "Sidebar button text",
          input("sidebar.button.text", c.sidebar?.button?.text)
        );
        fields += field(
          "Sidebar button link",
          input("sidebar.button.href", c.sidebar?.button?.href)
        );
        break;
      case "section_header_links":
        add("Eyebrow", "eyebrow");
        add("Title", "title");
        add("Lead", "lead", "textarea", 2);
        fields += field(
          "Links (one per line: text | href)",
          textarea(
            "_links",
            (c.links || []).map((l) => `${l.text} | ${l.href}`).join("\n"),
            6
          )
        );
        break;
      case "showcase":
        add("Eyebrow", "eyebrow");
        add("Title", "title");
        add("Lead", "lead", "textarea", 2);
        add("Before image path", "before.src");
        add("Before alt text", "before.alt");
        add("After image path", "after.src");
        add("After alt text", "after.alt");
        break;
      case "patient_cta":
        add("Eyebrow", "eyebrow");
        add("Title", "title");
        add("Text", "text", "textarea", 2);
        fields += field(
          "Buttons (one per line: text | href | primary or secondary)",
          textarea(
            "_buttons",
            (c.buttons || [])
              .map((b) => `${b.text} | ${b.href} | ${b.style || "primary"}`)
              .join("\n"),
            4
          )
        );
        break;
      case "service_nav":
        fields += field(
          "Links (one per line: text | href)",
          textarea(
            "_links",
            (c.links || []).map((l) => `${l.text} | ${l.href}`).join("\n"),
            8
          )
        );
        break;
      case "service_panel":
        add("Anchor ID (for menu links)", "anchor_id");
        add("Eyebrow", "eyebrow");
        add("Title", "title");
        add("Description", "lead", "textarea", 3);
        break;
      case "staff_card":
        add("Name", "name");
        add("Bio", "bio", "textarea", 6);
        break;
      case "info_card":
        add("Title", "title");
        add("Lead", "lead", "textarea", 2);
        fields += field(
          "Extra paragraphs (one per line)",
          textarea("_paragraphs", (c.paragraphs || []).join("\n"), 4)
        );
        break;
      case "rich_text":
        add("Eyebrow (optional)", "eyebrow");
        add("Title", "title");
        fields += field(
          "Paragraphs (one per line)",
          textarea("_paragraphs", (c.paragraphs || []).join("\n"), 6)
        );
        break;
      default:
        fields += field(
          "Content (JSON)",
          textarea("_json", JSON.stringify(c, null, 2), 8)
        );
    }

    const label =
      SECTION_TYPES.find((t) => t.type === type)?.label || type;

    return `<div class="admin-panel" data-section-index="${index}">
      <div class="admin-panel__head">
        <h3>${index + 1}. ${label}</h3>
        <div class="admin-panel__controls">
          <label class="admin-hidden-toggle"><input type="checkbox" data-action="visible" ${section.visible !== false ? "checked" : ""} /> Visible</label>
          <button type="button" class="admin-btn admin-btn--ghost admin-btn--sm" data-action="up" ${index === 0 ? "disabled" : ""}>↑</button>
          <button type="button" class="admin-btn admin-btn--ghost admin-btn--sm" data-action="down" ${index === state.sections.length - 1 ? "disabled" : ""}>↓</button>
          <button type="button" class="admin-btn admin-btn--danger admin-btn--sm" data-action="delete">Delete</button>
        </div>
      </div>
      <div class="admin-grid-2">${fields}</div>
    </div>`;
  }

  function parseLinesPipe(text, cols) {
    return String(text || "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split("|").map((p) => p.trim());
        const obj = {};
        cols.forEach((col, i) => {
          obj[col] = parts[i] || "";
        });
        return obj;
      });
  }

  function setNested(obj, path, value) {
    const keys = path.split(".");
    let cur = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!cur[keys[i]]) cur[keys[i]] = {};
      cur = cur[keys[i]];
    }
    cur[keys[keys.length - 1]] = value;
  }

  function readSectionFromPanel(panel, section) {
    const c = JSON.parse(JSON.stringify(section.content || {}));
    panel.querySelectorAll("[data-key]").forEach((el) => {
      const key = el.getAttribute("data-key");
      if (key.startsWith("_")) return;
      setNested(c, key, el.value);
    });

    const slides = panel.querySelector('[data-key="_slides"]');
    if (slides)
      c.slides = parseLinesPipe(slides.value, ["src", "alt"]);

    const cards = panel.querySelector('[data-key="_cards"]');
    if (cards) c.cards = parseLinesPipe(cards.value, ["label", "title"]);

    const links = panel.querySelector('[data-key="_links"]');
    if (links && (section.section_type === "section_header_links" || section.section_type === "service_nav"))
      c.links = parseLinesPipe(links.value, ["text", "href"]);

    const buttons = panel.querySelector('[data-key="_buttons"]');
    if (buttons)
      c.buttons = parseLinesPipe(buttons.value, ["text", "href", "style"]);

    const paras = panel.querySelector('[data-key="_paragraphs"]');
    if (paras && section.section_type !== "info_card")
      c.paragraphs = String(paras.value).split("\n").filter((l) => l.trim());

    if (section.section_type === "info_card" && paras)
      c.paragraphs = String(paras.value).split("\n").filter((l) => l.trim());

    const sideParas = panel.querySelector('[data-key="_sidebar_paragraphs"]');
    if (sideParas) {
      if (!c.sidebar) c.sidebar = { type: "info_card" };
      c.sidebar.paragraphs = String(sideParas.value).split("\n").filter((l) => l.trim());
    }

    const sideType = panel.querySelector('[data-key="sidebar.type"]');
    if (sideType) {
      if (sideType.value) {
        c.sidebar = c.sidebar || {};
        c.sidebar.type = sideType.value;
      } else {
        delete c.sidebar;
      }
    }

    if (section.section_type === "home_hero") {
      c.cta_primary = {
        text: panel.querySelector('[data-key="cta_primary.text"]')?.value || "",
        href: panel.querySelector('[data-key="cta_primary.href"]')?.value || "",
      };
      c.cta_secondary = {
        text: panel.querySelector('[data-key="cta_secondary.text"]')?.value || "",
        href: panel.querySelector('[data-key="cta_secondary.href"]')?.value || "",
      };
    }

    if (section.section_type === "two_column" && c.sidebar) {
      c.sidebar.button = {
        text: panel.querySelector('[data-key="sidebar.button.text"]')?.value || "",
        href: panel.querySelector('[data-key="sidebar.button.href"]')?.value || "",
      };
      if (c.sidebar.type === "office_hours" && !c.sidebar.hours) {
        c.sidebar.hours = state.siteSettings?.office_hours || [];
      }
    }

    const jsonField = panel.querySelector('[data-key="_json"]');
    if (jsonField) {
      try {
        return { ...section, content: JSON.parse(jsonField.value) };
      } catch (e) {
        throw new Error("Invalid JSON in section");
      }
    }

    return { ...section, content: c };
  }

  function collectSectionsFromDom() {
    const panels = document.querySelectorAll("[data-section-index]");
    return Array.from(panels).map((panel) => {
      const i = Number(panel.getAttribute("data-section-index"));
      return readSectionFromPanel(panel, state.sections[i]);
    });
  }

  function renderSectionsList() {
    const list = $("#sections-list");
    list.innerHTML = state.sections
      .map((s, i) => renderSectionEditor(s, i))
      .join("");

    list.querySelectorAll("[data-action]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.getAttribute("data-action");
        const panel = btn.closest("[data-section-index]");
        const index = Number(panel.getAttribute("data-section-index"));

        if (action === "delete") {
          if (!confirm("Delete this section?")) return;
          const removed = state.sections.splice(index, 1)[0];
          if (removed.id && !String(removed.id).startsWith("default-"))
            state.deletedSectionIds.push(removed.id);
          syncSectionsFromDomBeforeReorder();
          renderSectionsList();
          return;
        }

        if (action === "up" && index > 0) {
          syncSectionsFromDomBeforeReorder();
          [state.sections[index - 1], state.sections[index]] = [
            state.sections[index],
            state.sections[index - 1],
          ];
          renderSectionsList();
        }

        if (action === "down" && index < state.sections.length - 1) {
          syncSectionsFromDomBeforeReorder();
          [state.sections[index], state.sections[index + 1]] = [
            state.sections[index + 1],
            state.sections[index],
          ];
          renderSectionsList();
        }
      });
    });

    list.querySelectorAll('[data-action="visible"]').forEach((cb) => {
      cb.addEventListener("change", () => {
        const panel = cb.closest("[data-section-index]");
        const index = Number(panel.getAttribute("data-section-index"));
        state.sections[index].visible = cb.checked;
      });
    });
  }

  function syncSectionsFromDomBeforeReorder() {
    try {
      state.sections = collectSectionsFromDom();
    } catch (e) {
      alert(globalAlert, e.message, "error");
    }
  }

  function populateAddSectionSelect() {
    const sel = $("#add-section-type");
    const allowed = SECTION_TYPES.filter(
      (t) => !t.pages || t.pages.includes(state.currentSlug)
    );
    sel.innerHTML =
      '<option value="">Add section…</option>' +
      allowed.map((t) => `<option value="${t.type}">${t.label}</option>`).join("");
  }

  function buildPageNav() {
    const nav = $("#page-nav");
    nav.innerHTML = Object.entries(PAGE_LABELS)
      .map(
        ([slug, label]) =>
          `<button type="button" data-slug="${slug}" class="${slug === state.currentSlug ? "is-active" : ""}">${label}</button>`
      )
      .join("");

    nav.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => loadPage(btn.getAttribute("data-slug")));
    });
  }

  function showSettingsMode(on) {
    state.settingsMode = on;
    $("#page-editor").hidden = on;
    $("#settings-editor").hidden = !on;
  }

  function renderSettingsForm() {
    const s = state.siteSettings || window.CMS_DEFAULTS.siteSettings;
    const form = $("#settings-form");
    form.innerHTML = `
      ${field("Phone (digits only, for tel: link)", input("phone", s.phone))}
      ${field("Phone (display)", input("phone_display", s.phone_display))}
      ${field("Fax (digits)", input("fax", s.fax))}
      ${field("Fax (display)", input("fax_display", s.fax_display))}
      ${field("Address line 1", input("address_line1", s.address_line1))}
      ${field("Address line 2", input("address_line2", s.address_line2))}
      ${field("Footer copyright", input("footer_copyright", s.footer_copyright))}
      <div class="admin-field">
        <label>Office hours</label>
        <div id="hours-rows"></div>
        <button type="button" class="admin-btn admin-btn--ghost admin-btn--sm" id="btn-add-hour">+ Add hours row</button>
      </div>
    `;

    const hoursWrap = $("#hours-rows");
    const hours = s.office_hours || [];
    hours.forEach((row, i) => {
      const div = document.createElement("div");
      div.className = "admin-hours-row";
      div.innerHTML = `
        <input type="text" data-hour-label placeholder="Day" value="${window.CmsCore.escapeHtml(row.label)}" />
        <input type="text" data-hour-time placeholder="Hours" value="${window.CmsCore.escapeHtml(row.time)}" />
        <button type="button" class="admin-btn admin-btn--danger admin-btn--sm" data-hour-remove>×</button>
      `;
      hoursWrap.appendChild(div);
    });

    $("#btn-add-hour").onclick = () => {
      const div = document.createElement("div");
      div.className = "admin-hours-row";
      div.innerHTML = `
        <input type="text" data-hour-label placeholder="Day" />
        <input type="text" data-hour-time placeholder="Hours" />
        <button type="button" class="admin-btn admin-btn--danger admin-btn--sm" data-hour-remove>×</button>
      `;
      hoursWrap.appendChild(div);
    };

    hoursWrap.onclick = (e) => {
      if (e.target.matches("[data-hour-remove]"))
        e.target.closest(".admin-hours-row").remove();
    };
  }

  function readSettingsFromForm() {
    const form = $("#settings-form");
    const s = {
      id: 1,
      phone: form.querySelector('[data-key="phone"]').value,
      phone_display: form.querySelector('[data-key="phone_display"]').value,
      fax: form.querySelector('[data-key="fax"]').value,
      fax_display: form.querySelector('[data-key="fax_display"]').value,
      address_line1: form.querySelector('[data-key="address_line1"]').value,
      address_line2: form.querySelector('[data-key="address_line2"]').value,
      footer_copyright: form.querySelector('[data-key="footer_copyright"]').value,
      office_hours: Array.from(form.querySelectorAll(".admin-hours-row")).map((row) => ({
        label: row.querySelector("[data-hour-label]").value,
        time: row.querySelector("[data-hour-time]").value,
      })),
      updated_at: new Date().toISOString(),
    };
    return s;
  }

  async function loadSiteSettings() {
    const sb = getSb();
    if (!sb) {
      state.siteSettings = window.CMS_DEFAULTS.siteSettings;
      return;
    }
    const { data, error } = await sb.from("site_settings").select("*").eq("id", 1).maybeSingle();
    if (error) throw error;
    state.siteSettings = data || window.CMS_DEFAULTS.siteSettings;
  }

  async function loadPage(slug) {
    if (state.settingsMode) showSettingsMode(false);
    state.currentSlug = slug;
    state.deletedSectionIds = [];
    buildPageNav();
    populateAddSectionSelect();
    $("#editor-title").textContent = `Edit: ${PAGE_LABELS[slug] || slug}`;

    const sb = getSb();
    const defaults = window.CMS_DEFAULTS.pages[slug];

    if (!sb) {
      state.pageMeta = {
        title: defaults?.title || "",
        meta_description: defaults?.meta_description || "",
      };
      state.sections = (defaults?.sections || []).map((s, i) => ({
        ...s,
        id: uuid(),
        page_slug: slug,
        sort_order: i,
      }));
    } else {
      const [pageRes, sectionsRes] = await Promise.all([
        sb.from("pages").select("*").eq("slug", slug).maybeSingle(),
        sb.from("sections").select("*").eq("page_slug", slug).order("sort_order"),
      ]);

      if (pageRes.error) throw pageRes.error;
      if (sectionsRes.error) throw sectionsRes.error;

      state.pageMeta = pageRes.data
        ? {
            title: pageRes.data.title,
            meta_description: pageRes.data.meta_description || "",
          }
        : {
            title: defaults?.title || "",
            meta_description: defaults?.meta_description || "",
          };

      if (sectionsRes.data?.length) {
        state.sections = sectionsRes.data;
      } else {
        state.sections = (defaults?.sections || []).map((s, i) => ({
          ...s,
          id: uuid(),
          page_slug: slug,
          sort_order: i,
        }));
      }
    }

    $("#page-title").value = state.pageMeta.title || "";
    $("#page-meta").value = state.pageMeta.meta_description || "";
    renderSectionsList();
    alert(globalAlert, "", "");
  }

  async function savePage() {
    const sb = getSb();
    if (!sb) {
      alert(globalAlert, "Supabase is not configured. Add js/supabase-config.js first.", "error");
      return;
    }

    try {
      state.sections = collectSectionsFromDom();
    } catch (e) {
      alert(globalAlert, e.message, "error");
      return;
    }

    const slug = state.currentSlug;
    const pageRow = {
      slug,
      title: $("#page-title").value,
      meta_description: $("#page-meta").value,
      updated_at: new Date().toISOString(),
    };

    const { error: pageErr } = await sb.from("pages").upsert(pageRow);
    if (pageErr) throw pageErr;

    for (const id of state.deletedSectionIds) {
      await sb.from("sections").delete().eq("id", id);
    }
    state.deletedSectionIds = [];

    for (let i = 0; i < state.sections.length; i++) {
      const s = state.sections[i];
      const row = {
        id: s.id && !String(s.id).startsWith("default-") ? s.id : uuid(),
        page_slug: slug,
        sort_order: i,
        section_type: s.section_type,
        visible: s.visible !== false,
        content: s.content,
        updated_at: new Date().toISOString(),
      };
      const { error } = await sb.from("sections").upsert(row);
      if (error) throw error;
      state.sections[i].id = row.id;
    }

    alert(globalAlert, "Page saved successfully.", "success");
    renderSectionsList();
  }

  async function saveSettings() {
    const sb = getSb();
    if (!sb) {
      alert(globalAlert, "Supabase is not configured.", "error");
      return;
    }
    const row = readSettingsFromForm();
    const { error } = await sb.from("site_settings").upsert(row);
    if (error) {
      alert(globalAlert, error.message, "error");
      return;
    }
    state.siteSettings = row;
    alert(globalAlert, "Site settings saved.", "success");
  }

  async function seedDatabase() {
    const sb = getSb();
    if (!sb) {
      alert(globalAlert, "Supabase is not configured.", "error");
      return;
    }
    if (
      !confirm(
        "Import all default site content? This replaces sections for every page (settings are merged)."
      )
    )
      return;

    const settings = window.CMS_DEFAULTS.siteSettings;
    await sb.from("site_settings").upsert({ id: 1, ...settings, updated_at: new Date().toISOString() });

    for (const [slug, page] of Object.entries(window.CMS_DEFAULTS.pages)) {
      await sb.from("pages").upsert({
        slug,
        title: page.title,
        meta_description: page.meta_description || "",
        updated_at: new Date().toISOString(),
      });

      await sb.from("sections").delete().eq("page_slug", slug);

      const rows = (page.sections || []).map((s, i) => ({
        id: uuid(),
        page_slug: slug,
        sort_order: i,
        section_type: s.section_type,
        visible: s.visible !== false,
        content: s.content,
        updated_at: new Date().toISOString(),
      }));

      if (rows.length) {
        const { error } = await sb.from("sections").insert(rows);
        if (error) throw error;
      }
    }

    await loadSiteSettings();
    await loadPage(state.currentSlug);
    alert(globalAlert, "Site content imported from defaults.", "success");
  }

  function showApp(user) {
    state.user = user;
    loginView.style.display = "none";
    appView.classList.add("is-active");
  }

  function showLogin() {
    state.user = null;
    loginView.style.display = "block";
    appView.classList.remove("is-active");
  }

  async function initApp() {
    if (!window.CmsCore.isConfigured()) {
      alert(
        loginAlert,
        'Copy <code>js/supabase-config.example.js</code> to <code>js/supabase-config.js</code> and add your Supabase URL and anon key.',
        "error"
      );
      return;
    }

    const sb = getSb();
    const { data } = await sb.auth.getSession();
    if (!data.session) {
      showLogin();
      return;
    }

    showApp(data.session.user);
    await loadSiteSettings();
    buildPageNav();
    await loadPage("index");
  }

  $("#login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    alert(loginAlert, "", "");
    const sb = getSb();
    if (!sb) {
      alert(loginAlert, "Supabase is not configured.", "error");
      return;
    }
    const email = $("#login-email").value.trim();
    const password = $("#login-password").value;
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
      alert(loginAlert, error.message, "error");
      return;
    }
    showApp(data.user);
    await loadSiteSettings();
    buildPageNav();
    await loadPage("index");
  });

  $("#btn-logout").addEventListener("click", async () => {
    const sb = getSb();
    if (sb) await sb.auth.signOut();
    showLogin();
  });

  $("#btn-save-page").addEventListener("click", savePage);
  $("#btn-save-settings").addEventListener("click", saveSettings);
  $("#btn-seed").addEventListener("click", seedDatabase);
  $("#btn-site-settings").addEventListener("click", () => {
    renderSettingsForm();
    showSettingsMode(true);
  });
  $("#btn-back-pages").addEventListener("click", () => showSettingsMode(false));

  $("#btn-add-section").addEventListener("click", () => {
    const type = $("#add-section-type").value;
    if (!type) {
      alert(globalAlert, "Choose a section type first.", "info");
      return;
    }
    try {
      syncSectionsFromDomBeforeReorder();
    } catch (e) {
      alert(globalAlert, e.message, "error");
      return;
    }
    state.sections.push({
      id: uuid(),
      page_slug: state.currentSlug,
      section_type: type,
      visible: true,
      content: defaultContent(type),
      sort_order: state.sections.length,
    });
    renderSectionsList();
    $("#add-section-type").value = "";
  });

  const sbClient = getSb();
  if (sbClient) {
    sbClient.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") showLogin();
    });
  }

  initApp();
})();
