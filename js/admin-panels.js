/**
 * Admin panels for navigation_links, trust_cards, cta_blocks, contact_form_fields, ui_labels.
 * Loaded after admin.js; uses shared sb client from admin session.
 */
(function () {
  const Cat = window.CmsCatalog || {};
  const {
    NAV_LINK_KEYS,
    FOOTER_LINK_KEYS,
    TRUST_CARD_KEYS,
    TRUST_CARDS,
    CONTACT_FIELD_KEYS,
    UI_LABEL_KEYS,
    CTA_BLOCK_KEYS,
  } = Cat;

  const navigationEditor = document.getElementById("navigation-editor");
  const trustEditor = document.getElementById("trust-editor");
  const ctaEditor = document.getElementById("cta-editor");
  const formFieldsEditor = document.getElementById("form-fields-editor");
  const labelsEditor = document.getElementById("labels-editor");

  if (!navigationEditor) return;

  let navCache = [];
  let trustCache = [];
  let ctaCache = [];
  let formCache = [];
  let labelCache = [];

  function esc(s) {
    return window.CmsCore?.escapeHtml(s) ?? String(s ?? "");
  }
  function escA(s) {
    return esc(s).replace(/"/g, "&quot;");
  }

  function sb() {
    return window.getSupabaseClient?.();
  }

  function toast(msg, type) {
    const el = document.getElementById("global-alert");
    if (!el) return;
    el.textContent = msg || "";
    el.className = "admin-alert admin-alert--" + (type || "info");
    el.hidden = !msg;
    if (msg) setTimeout(() => { el.hidden = true; }, 6000);
  }

  function renderNavigation() {
    const map = new Map(navCache.map((r) => [r.link_key, r]));
    const defs = [...(NAV_LINK_KEYS || []), ...(FOOTER_LINK_KEYS || [])];
    navigationEditor.innerHTML = defs
      .map((def, idx) => {
        const row = map.get(def.key) || {};
        const loc = row.location || def.location || (def.key.startsWith("footer") ? "footer" : "nav");
        const labelDefault = def.label.replace(/^(Nav|Footer):\s*/i, "");
        return `<div class="admin-panel admin-card" data-link-key="${escA(def.key)}">
          <h3 class="admin-card__title">${esc(def.label)} <span class="admin-help">(${esc(loc)})</span></h3>
          <input type="hidden" data-f="location" value="${escA(loc)}" />
          <div class="admin-grid-2">
            <div class="admin-field"><label>Label</label><input type="text" data-f="label" value="${escA(row.label || labelDefault)}" /></div>
            <div class="admin-field"><label>URL</label><input type="text" data-f="href" value="${escA(row.href || def.href || "")}" /></div>
          </div>
          <div class="admin-grid-2">
            <div class="admin-field"><label>Sort</label><input type="number" data-f="sort_order" value="${row.sort_order != null ? row.sort_order : idx}" /></div>
            <label class="admin-check"><input type="checkbox" data-f="is_active" ${row.is_active !== false ? "checked" : ""} /> Active</label>
          </div>
        </div>`;
      })
      .join("")
      .replace(/<\/?motion/g, (t) => (t.includes("/") ? "</div" : "<div")).replace(/motion>/g, "div>");
  }

  function renderTrust() {
    const map = new Map(trustCache.map((r) => [r.card_key, r]));
    trustEditor.innerHTML = (TRUST_CARD_KEYS || [])
      .map((def, idx) => {
        const row = map.get(def.key) || {};
        const d = (TRUST_CARDS || []).find((c) => c.key === def.key) || {};
        return `<div class="admin-panel admin-card" data-trust-key="${escA(def.key)}">
          <h3 class="admin-card__title">${esc(def.label)}</h3>
          <div class="admin-grid-2">
            <div class="admin-field"><label>Label</label><input type="text" data-f="label" value="${escA(row.label || d.defaultLabel || "")}" /></div>
            <div class="admin-field"><label>Title</label><input type="text" data-f="title" value="${escA(row.title || d.defaultTitle || "")}" /></div>
          </div>
          <div class="admin-grid-2">
            <div class="admin-field"><label>Sort</label><input type="number" data-f="sort_order" value="${row.sort_order != null ? row.sort_order : idx}" /></div>
            <label class="admin-check"><input type="checkbox" data-f="is_active" ${row.is_active !== false ? "checked" : ""} /> Active</label>
          </div>
        </div>`;
      })
      .join("")
      .replace(/<\/?motion/g, (t) => (t.includes("/") ? "</div" : "<div"));
  }

  function ctaCard(b) {
    return `<div class="admin-panel admin-card" data-cta-id="${escA(b.id)}">
      <p class="admin-help"><code>${esc(b.block_key)}</code> → ${esc(b.page_slug || "any")} / ${esc(b.section_key || "")}</p>
      <div class="admin-grid-2">
        <div class="admin-field"><label>Block key</label><input type="text" data-f="block_key" value="${escA(b.block_key)}" /></div>
        <div class="admin-field"><label>Page slug</label><input type="text" data-f="page_slug" value="${escA(b.page_slug || "")}" /></div>
      </div>
      <div class="admin-field"><label>Section key</label><input type="text" data-f="section_key" value="${escA(b.section_key || "")}" /></div>
      <div class="admin-grid-2">
        <div class="admin-field"><label>Eyebrow</label><input type="text" data-f="eyebrow" value="${escA(b.eyebrow || "")}" /></div>
        <div class="admin-field"><label>Title</label><input type="text" data-f="title" value="${escA(b.title || "")}" /></div>
      </div>
      <div class="admin-field"><label>Body</label><textarea data-f="body" rows="2">${esc(b.body || "")}</textarea></div>
      <div class="admin-grid-2">
        <div class="admin-field"><label>Primary label</label><input type="text" data-f="button_primary_label" value="${escA(b.button_primary_label || "")}" /></div>
        <div class="admin-field"><label>Primary URL</label><input type="text" data-f="button_primary_href" value="${escA(b.button_primary_href || "")}" /></div>
      </div>
      <div class="admin-grid-2">
        <div class="admin-field"><label>Secondary label</label><input type="text" data-f="button_secondary_label" value="${escA(b.button_secondary_label || "")}" /></div>
        <div class="admin-field"><label>Secondary URL</label><input type="text" data-f="button_secondary_href" value="${escA(b.button_secondary_href || "")}" /></div>
      </div>
      <label class="admin-check"><input type="checkbox" data-f="is_active" ${b.is_active !== false ? "checked" : ""} /> Active</label>
      <div class="admin-card-actions">
        <button type="button" class="admin-btn admin-btn--primary" data-action="save-cta">Save</button>
        <button type="button" class="admin-btn admin-btn--ghost" data-action="delete-cta">Delete</button>
      </div>
    </div>`;
  }

  function renderCta() {
    ctaEditor.innerHTML = ctaCache.length
      ? ctaCache.map((b) => ctaCard(b)).join("").replace(/<\/?motion/g, (t) => (t.includes("/") ? "</div" : "<div"))
      : '<p class="admin-help">No CTA blocks. Add one for appointment CTAs or 404 buttons.</p>';
  }

  function renderFormFields() {
    const map = new Map(formCache.map((f) => [f.field_key, f]));
    formFieldsEditor.innerHTML = (CONTACT_FIELD_KEYS || [])
      .map((def, idx) => {
        const row = map.get(def.key) || {};
        return `<div class="admin-panel admin-card" data-field-key="${escA(def.key)}">
          <h3 class="admin-card__title">${esc(def.label)}</h3>
          <div class="admin-grid-2">
            <div class="admin-field"><label>Label</label><input type="text" data-f="label" value="${escA(row.label || def.label)}" /></div>
            <div class="admin-field"><label>Placeholder</label><input type="text" data-f="placeholder" value="${escA(row.placeholder || def.placeholder || "")}" /></div>
          </div>
          <label class="admin-check"><input type="checkbox" data-f="is_required" ${(row.is_required != null ? row.is_required : def.required) ? "checked" : ""} /> Required</label>
          <input type="hidden" data-f="sort_order" value="${row.sort_order != null ? row.sort_order : idx}" />
        </div>`;
      })
      .join("")
      .replace(/<\/?motion/g, (t) => (t.includes("/") ? "</div>" : "<div")).replace(/motion>/g, "div>");
  }

  function renderLabels() {
    const map = new Map(labelCache.map((l) => [l.label_key, l]));
    labelsEditor.innerHTML = (UI_LABEL_KEYS || [])
      .map((def) => {
        const row = map.get(def.key) || {};
        return `<div class="admin-panel admin-field" data-label-key="${escA(def.key)}">
          <label>${esc(def.label)} <span class="admin-help">(${esc(def.key)})</span></label>
          <input type="text" data-f="label_value" value="${escA(row.label_value || def.default || "")}" />
        </div>`;
      })
      .join("");
  }

  function readCard(card) {
    const out = {};
    card.querySelectorAll("[data-f]").forEach((el) => {
      const k = el.getAttribute("data-f");
      if (el.type === "checkbox") out[k] = el.checked;
      else if (el.type === "number") out[k] = Number(el.value);
      else out[k] = el.value;
    });
    return out;
  }

  async function loadAll() {
    const client = sb();
    if (!client) return;
    const [nav, trust, cta, form, labels] = await Promise.all([
      client.from("navigation_links").select("*").order("sort_order"),
      client.from("trust_cards").select("*").order("sort_order"),
      client.from("cta_blocks").select("*").order("sort_order"),
      client.from("contact_form_fields").select("*").order("sort_order"),
      client.from("ui_labels").select("*"),
    ]);
    if (!nav.error) navCache = nav.data || [];
    if (!trust.error) trustCache = trust.data || [];
    if (!cta.error) ctaCache = cta.data || [];
    if (!form.error) formCache = form.data || [];
    if (!labels.error) labelCache = labels.data || [];
    renderNavigation();
    renderTrust();
    renderCta();
    renderFormFields();
    renderLabels();
  }

  document.getElementById("btn-save-navigation")?.addEventListener("click", async () => {
    const client = sb();
    if (!client) return;
    try {
      for (const card of navigationEditor.querySelectorAll("[data-link-key]")) {
        const key = card.getAttribute("data-link-key");
        const p = readCard(card);
        const payload = {
          link_key: key,
          location: p.location,
          label: p.label,
          href: p.href,
          sort_order: p.sort_order,
          is_active: p.is_active,
          updated_at: new Date().toISOString(),
        };
        const existing = navCache.find((r) => r.link_key === key);
        if (existing?.id) {
          const { error } = await client.from("navigation_links").update(payload).eq("id", existing.id);
          if (error) throw error;
        } else {
          const { error } = await client.from("navigation_links").insert(payload);
          if (error) throw error;
        }
      }
      await loadAll();
      toast("Navigation links saved.", "success");
    } catch (e) {
      toast(e.message || "Could not save links.", "error");
    }
  });

  document.getElementById("btn-save-trust")?.addEventListener("click", async () => {
    const client = sb();
    if (!client) return;
    try {
      for (const card of trustEditor.querySelectorAll("[data-trust-key]")) {
        const key = card.getAttribute("data-trust-key");
        const p = readCard(card);
        const payload = {
          card_key: key,
          label: p.label,
          title: p.title,
          sort_order: p.sort_order,
          is_active: p.is_active,
          updated_at: new Date().toISOString(),
        };
        const existing = trustCache.find((r) => r.card_key === key);
        if (existing?.id) {
          const { error } = await client.from("trust_cards").update(payload).eq("id", existing.id);
          if (error) throw error;
        } else {
          const { error } = await client.from("trust_cards").insert(payload);
          if (error) throw error;
        }
      }
      await loadAll();
      toast("Trust cards saved.", "success");
    } catch (e) {
      toast(e.message || "Could not save trust cards.", "error");
    }
  });

  document.getElementById("btn-add-cta")?.addEventListener("click", async () => {
    const client = sb();
    const key = prompt("CTA block key (e.g. index-patient-cta):");
    if (!key || !client) return;
    const def = (CTA_BLOCK_KEYS || []).find((c) => c.key === key);
    const { error } = await client.from("cta_blocks").insert({
      block_key: key.trim(),
      page_slug: def?.page || "",
      section_key: def?.section || "",
      is_active: true,
    });
    if (error) toast(error.message, "error");
    else {
      await loadAll();
      toast("CTA block added.", "success");
    }
  });

  ctaEditor?.addEventListener("click", async (e) => {
    const client = sb();
    if (!client) return;
    const card = e.target.closest("[data-cta-id]");
    if (!card) return;
    const id = card.getAttribute("data-cta-id");
    if (e.target.matches("[data-action='save-cta']")) {
      const p = readCard(card);
      const { error } = await client.from("cta_blocks").update({ ...p, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) toast(error.message, "error");
      else {
        await loadAll();
        toast("CTA saved.", "success");
      }
    }
    if (e.target.matches("[data-action='delete-cta']")) {
      if (!confirm("Delete this CTA block?")) return;
      const { error } = await client.from("cta_blocks").delete().eq("id", id);
      if (error) toast(error.message, "error");
      else {
        await loadAll();
        toast("CTA deleted.", "success");
      }
    }
  });

  document.getElementById("btn-save-form-fields")?.addEventListener("click", async () => {
    const client = sb();
    if (!client) return;
    try {
      for (const card of formFieldsEditor.querySelectorAll("[data-field-key]")) {
        const key = card.getAttribute("data-field-key");
        const p = readCard(card);
        const payload = {
          field_key: key,
          label: p.label,
          placeholder: p.placeholder,
          is_required: p.is_required,
          sort_order: p.sort_order,
          is_active: true,
          updated_at: new Date().toISOString(),
        };
        const existing = formCache.find((r) => r.field_key === key);
        if (existing?.id) {
          const { error } = await client.from("contact_form_fields").update(payload).eq("id", existing.id);
          if (error) throw error;
        } else {
          const { error } = await client.from("contact_form_fields").insert(payload);
          if (error) throw error;
        }
      }
      await loadAll();
      toast("Form fields saved.", "success");
    } catch (e) {
      toast(e.message || "Could not save form fields.", "error");
    }
  });

  document.getElementById("btn-save-labels")?.addEventListener("click", async () => {
    const client = sb();
    if (!client) return;
    try {
      for (const card of labelsEditor.querySelectorAll("[data-label-key]")) {
        const key = card.getAttribute("data-label-key");
        const val = card.querySelector('[data-f="label_value"]')?.value ?? "";
        const payload = { label_key: key, label_value: val, updated_at: new Date().toISOString() };
        const existing = labelCache.find((r) => r.label_key === key);
        if (existing?.id) {
          const { error } = await client.from("ui_labels").update(payload).eq("id", existing.id);
          if (error) throw error;
        } else {
          const { error } = await client.from("ui_labels").insert(payload);
          if (error) throw error;
        }
      }
      await loadAll();
      toast("UI labels saved.", "success");
    } catch (e) {
      toast(e.message || "Could not save labels.", "error");
    }
  });

  window.AdminPanels = { loadAll };
  document.addEventListener("DOMContentLoaded", () => {
    if (sb()) loadAll();
  });
  window.addEventListener("admin-panels-load", () => loadAll());
})();
