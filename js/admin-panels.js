/**
 * Plain-English render helpers for navigation, trust boxes, and contact form fields.
 */
(function () {
  const Cat = window.CmsCatalog || {};
  const L = window.AdminLabels || {};
  const { NAV_LINK_KEYS, FOOTER_LINK_KEYS, TRUST_CARD_KEYS, TRUST_CARDS, CONTACT_FIELD_KEYS, UI_LABEL_KEYS } = Cat;

  function esc(s) {
    return window.CmsCore?.escapeHtml(s) ?? String(s ?? "");
  }
  function escA(s) {
    return esc(s).replace(/"/g, "&quot;");
  }

  function readCard(card) {
    const out = {};
    if (!card) return out;
    card.querySelectorAll("[data-f]").forEach((el) => {
      const k = el.getAttribute("data-f");
      if (el.type === "checkbox") out[k] = el.checked;
      else if (el.type === "number") out[k] = Number(el.value);
      else out[k] = el.value;
    });
    return out;
  }

  function activeToggle(checked) {
    const on = checked !== false;
    return `<label class="admin-check admin-check--toggle">
      <input type="checkbox" data-f="is_active" ${on ? "checked" : ""} />
      <span>${on ? L.BUTTONS?.show || "Show on Website" : L.BUTTONS?.hide || "Hide from Website"}</span>
    </label>`;
  }

  function renderNavigation(editor, navCache) {
    if (!editor) return;
    const map = new Map((navCache || []).map((r) => [r.link_key, r]));
    const navDefs = (NAV_LINK_KEYS || []).filter((d) => (d.location || "nav") !== "footer");
    const footerDefs = FOOTER_LINK_KEYS || [];

    const section = (title, desc, defs, loc) => {
      const cards = defs
        .map((def, idx) => {
          const row = map.get(def.key) || {};
          const labelDefault = (def.label || "").replace(/^(Nav|Footer):\s*/i, "");
          const order = row.sort_order != null ? row.sort_order : idx;
          return `<div class="admin-panel admin-card" data-link-key="${escA(def.key)}" data-sort-order="${order}">
            <input type="hidden" data-f="location" value="${escA(loc)}" />
            <input type="hidden" data-f="sort_order" value="${order}" />
            <div class="admin-grid-2">
              <div class="admin-field"><label>Menu label</label><input type="text" data-f="label" value="${escA(row.label || labelDefault)}" /></div>
              <div class="admin-field"><label>Link destination</label><input type="text" data-f="href" value="${escA(row.href || def.href || "")}" /></div>
            </div>
            ${activeToggle(row.is_active)}
            <div class="admin-card-actions">
              <button type="button" class="admin-btn admin-btn--ghost admin-btn--sm" data-action="nav-up">${esc(L.BUTTONS?.moveUp || "Move Up")}</button>
              <button type="button" class="admin-btn admin-btn--ghost admin-btn--sm" data-action="nav-down">${esc(L.BUTTONS?.moveDown || "Move Down")}</button>
            </div>
          </div>`;
        })
        .join("");
      return `<div class="admin-panel admin-card">
        <h2 class="admin-card__title">${esc(title)}</h2>
        <p class="admin-help">${esc(desc)}</p>
        <div class="admin-stack" data-nav-group="${escA(loc)}">${cards}</div>
      </div>`;
    };

    editor.innerHTML =
      section("Top Menu", "Links across the top of every page.", navDefs, "nav") +
      section("Footer Links", "Quick links in the website footer.", footerDefs, "footer");
  }

  function renderTrust(editor, trustCache) {
    const map = new Map((trustCache || []).map((r) => [r.card_key, r]));
    return (TRUST_CARD_KEYS || [])
      .map((def, idx) => {
        const row = map.get(def.key) || {};
        const d = (TRUST_CARDS || []).find((c) => c.key === def.key) || {};
        const friendly = L.TRUST_CARD_LABELS?.[def.key] || def.label;
        const order = row.sort_order != null ? row.sort_order : idx;
        return `<div class="admin-panel admin-card" data-trust-key="${escA(def.key)}" data-sort-order="${order}">
          <h3 class="admin-card__title">${esc(friendly)}</h3>
          <input type="hidden" data-f="sort_order" value="${order}" />
          <div class="admin-grid-2">
            <div class="admin-field"><label>Small label</label><input type="text" data-f="label" value="${escA(row.label || d.defaultLabel || "")}" /></div>
            <div class="admin-field"><label>Main text</label><input type="text" data-f="title" value="${escA(row.title || d.defaultTitle || "")}" /></div>
          </div>
          ${activeToggle(row.is_active)}
          <div class="admin-card-actions">
            <button type="button" class="admin-btn admin-btn--ghost admin-btn--sm" data-action="trust-up">${esc(L.BUTTONS?.moveUp || "Move Up")}</button>
            <button type="button" class="admin-btn admin-btn--ghost admin-btn--sm" data-action="trust-down">${esc(L.BUTTONS?.moveDown || "Move Down")}</button>
          </div>
        </div>`;
      })
      .join("");
  }

  function renderFormFields(editor, formCache) {
    if (!editor) return;
    const map = new Map((formCache || []).map((f) => [f.field_key, f]));
    editor.innerHTML = (CONTACT_FIELD_KEYS || [])
      .map((def, idx) => {
        const row = map.get(def.key) || {};
        const order = row.sort_order != null ? row.sort_order : idx;
        const req = row.is_required != null ? row.is_required : def.required;
        return `<div class="admin-panel admin-card" data-field-key="${escA(def.key)}" data-sort-order="${order}">
          <h3 class="admin-card__title">${esc(def.label)}</h3>
          <input type="hidden" data-f="sort_order" value="${order}" />
          <div class="admin-grid-2">
            <div class="admin-field"><label>Label</label><input type="text" data-f="label" value="${escA(row.label || def.label)}" /></div>
            <div class="admin-field"><label>Placeholder</label><input type="text" data-f="placeholder" value="${escA(row.placeholder || def.placeholder || "")}" /></div>
          </div>
          <label class="admin-check"><input type="checkbox" data-f="is_required" ${req ? "checked" : ""} /> Required field</label>
          ${activeToggle(row.is_active !== false)}
        </div>`;
      })
      .join("");
  }

  function renderContactLabels(editor, labelCache) {
    if (!editor) return;
    const map = new Map((labelCache || []).map((l) => [l.label_key, l]));
    const keys = [
      { key: "contact-form-title", label: "Form heading", default: "Send a Message" },
      { key: "contact-form-submit", label: "Submit button text", default: "Send Message" },
    ];
    editor.innerHTML = keys
      .map((def) => {
        const row = map.get(def.key) || {};
        return `<div class="admin-field" data-label-key="${escA(def.key)}">
          <label>${esc(def.label)}</label>
          <input type="text" data-f="label_value" value="${escA(row.label_value || def.default)}" />
        </div>`;
      })
      .join("");
  }

  function renderCtaBlock(def, row) {
    if (!def) return "";
    const r = row || {};
    return `<div class="admin-panel admin-card admin-cta-block" data-cta-page="${escA(def.page_slug)}" data-cta-section="${escA(def.section_key)}">
      <div class="admin-grid-2">
        <div class="admin-field"><label>Small top line</label><input type="text" data-f="eyebrow" value="${escA(r.eyebrow || "")}" /></div>
        <div class="admin-field"><label>Heading</label><input type="text" data-f="title" value="${escA(r.title || "")}" /></div>
      </div>
      <div class="admin-field"><label>Paragraph</label><textarea data-f="body" rows="2">${esc(r.body || "")}</textarea></div>
      <div class="admin-grid-2">
        <div class="admin-field"><label>Primary button text</label><input type="text" data-f="button_primary_label" value="${escA(r.button_primary_label || "")}" /></div>
        <div class="admin-field"><label>Primary button link</label><input type="text" data-f="button_primary_href" value="${escA(r.button_primary_href || "")}" /></div>
      </div>
      <div class="admin-grid-2">
        <div class="admin-field"><label>Secondary button text</label><input type="text" data-f="button_secondary_label" value="${escA(r.button_secondary_label || "")}" /></div>
        <div class="admin-field"><label>Secondary button link</label><input type="text" data-f="button_secondary_href" value="${escA(r.button_secondary_href || "")}" /></div>
      </div>
      <input type="hidden" data-f="is_active" value="true" />
    </div>`;
  }

  window.AdminPanels = {
    readCard,
    renderNavigation,
    renderTrust,
    renderFormFields,
    renderContactLabels,
    renderCtaBlock,
    activeToggle,
  };
})();
