/**
 * Public site hydration from Supabase. Static HTML remains on failure or missing data.
 */
(function (global) {
  const { escapeHtml, getInitials } = global.CmsCore || {};

  function applyText(el, value) {
    if (!el || value == null || value === "") return;
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
      el.value = value;
    } else if (el.tagName === "META") {
      el.setAttribute("content", value);
    } else {
      el.textContent = value;
    }
  }

  function applyFieldMap(map) {
    if (!map) return;
    Object.entries(map).forEach(([key, value]) => {
      if (value == null || value === "") return;
      document.querySelectorAll(`[data-editable="${CSS.escape(key)}"]`).forEach((el) => applyText(el, value));
      document.querySelectorAll(`[data-editable-href="${CSS.escape(key)}"]`).forEach((el) => {
        if (el.tagName === "A") el.href = value;
      });
      document.querySelectorAll(`[data-field-href="${CSS.escape(key)}"]`).forEach((el) => {
        if (el.tagName === "A") el.href = value;
      });
    });
  }

  function fieldMapFromRows(rows) {
    const map = {};
    (rows || []).forEach((r) => {
      if (r.field_key && r.field_value != null && r.field_value !== "") {
        map[r.field_key] = r.field_value;
      }
    });
    return map;
  }

  function applySettings(s) {
    if (!s) return;

    const addr =
      s.address_line1 && s.address_line2 ? `${s.address_line1}<br />${s.address_line2}` : null;
    if (addr) {
      document.querySelectorAll('[data-editable="address"]').forEach((el) => {
        el.innerHTML = addr;
      });
    }

    const phoneDisplay = s.phone_display || s.phone;
    if (phoneDisplay) {
      document.querySelectorAll('[data-editable="phone"]').forEach((el) => {
        applyText(el, phoneDisplay);
        if (el.tagName === "A") el.href = `tel:${String(s.phone || phoneDisplay).replace(/\D/g, "")}`;
      });
      const tel = String(s.phone || phoneDisplay).replace(/\D/g, "");
      document.querySelectorAll(".mobile-call").forEach((el) => {
        el.href = `tel:${tel}`;
        if (s.mobile_call_label) el.textContent = s.mobile_call_label;
      });
      document.querySelectorAll('[data-editable-href="tel-call"]').forEach((el) => {
        el.href = `tel:${tel}`;
      });
    }

    if (s.practice_name) {
      document.querySelectorAll('[data-editable="practice-name"]').forEach((el) => applyText(el, s.practice_name));
      document.querySelectorAll(".logo").forEach((el) => {
        el.setAttribute("aria-label", `${s.practice_name} home`);
      });
    }
    if (s.tagline) {
      document.querySelectorAll('[data-editable="tagline"]').forEach((el) => applyText(el, s.tagline));
    }
    if (s.email) {
      document.querySelectorAll('[data-editable="email"]').forEach((el) => {
        applyText(el, s.email);
        if (el.tagName === "A") el.href = `mailto:${s.email}`;
      });
    }
    if (s.fax_display || s.fax) {
      document.querySelectorAll('[data-editable="fax"]').forEach((el) => applyText(el, s.fax_display || s.fax));
    }
    if (s.footer_copyright) {
      document.querySelectorAll('[data-editable="footer-copyright"]').forEach((el) => applyText(el, s.footer_copyright));
    }
    if (s.website_credit_text) {
      document.querySelectorAll('[data-editable="website-credit-text"]').forEach((el) => applyText(el, s.website_credit_text));
    }
    if (s.website_credit_url) {
      document.querySelectorAll('[data-editable="website-credit-url"]').forEach((el) => {
        if (el.tagName === "A") el.href = s.website_credit_url;
      });
    }
    if (s.contact_form_notice) {
      document.querySelectorAll('[data-editable="contact-form-notice"]').forEach((el) => applyText(el, s.contact_form_notice));
    }
    if (s.contact_form_title) {
      document.querySelectorAll('[data-editable="contact-form-title"]').forEach((el) => applyText(el, s.contact_form_title));
    }
    if (s.contact_form_submit_label) {
      document.querySelectorAll('[data-editable="contact-form-submit"]').forEach((el) => applyText(el, s.contact_form_submit_label));
    }
    if (s.footer_quick_links_heading) {
      document.querySelectorAll('[data-editable="footer-quick-links-heading"]').forEach((el) => applyText(el, s.footer_quick_links_heading));
    }
    if (s.footer_hours_heading) {
      document.querySelectorAll('[data-editable="footer-hours-heading"]').forEach((el) => applyText(el, s.footer_hours_heading));
    }
    if (s.staff_login_label) {
      document.querySelectorAll('[data-editable="staff-login-label"]').forEach((el) => applyText(el, s.staff_login_label));
    }
    if (s.logo_alt_text) {
      document.querySelectorAll(".site-logo").forEach((img) => {
        if (!img.dataset.cmsAlt) img.alt = s.logo_alt_text;
      });
    }

    if (Array.isArray(s.office_hours) && s.office_hours.length) {
      const hoursHtml = s.office_hours
        .map((row) => {
          if (typeof row === "string") return `<p>${escapeHtml(row)}</p>`;
          const day = row.day || row.label || "";
          const hours = row.hours || row.time || "";
          return `<p><strong>${escapeHtml(day)}:</strong> ${escapeHtml(hours)}</p>`;
        })
        .join("");
      document.querySelectorAll('[data-editable="office-hours"]').forEach((el) => {
        const h3 = el.querySelector("h3");
        const heading = h3 ? h3.outerHTML : "<h3>Office Hours</h3>";
        el.innerHTML = heading + hoursHtml;
      });
      document.querySelectorAll('[data-editable="footer-hours"]').forEach((el) => {
        el.innerHTML = hoursHtml;
      });
    }

    if (s.preview_watermark_enabled && s.preview_watermark_text) {
      document.body.classList.add("has-preview-watermark");
      document.body.setAttribute("data-preview-text", s.preview_watermark_text);
    } else {
      document.body.classList.remove("has-preview-watermark");
    }
  }

  function applyUiLabels(labels) {
    if (!labels?.length) return;
    labels.forEach((row) => {
      if (!row.label_key || row.label_value == null || row.label_value === "") return;
      document.querySelectorAll(`[data-ui-label="${CSS.escape(row.label_key)}"]`).forEach((el) => applyText(el, row.label_value));
      document.querySelectorAll(`[data-editable="${CSS.escape(row.label_key)}"]`).forEach((el) => applyText(el, row.label_value));
    });
  }

  function applyNavigationLinks(links) {
    if (!links?.length) return;
    links.forEach((link) => {
      if (link.is_active === false) return;
      const key = link.link_key;
      if (!key) return;
      document.querySelectorAll(`[data-link-key="${CSS.escape(key)}"]`).forEach((el) => {
        if (link.label) applyText(el, link.label);
        if (link.href) el.href = link.href;
      });
    });
  }

  function applyTrustCards(cards) {
    if (!cards?.length) return;
    const grid = document.querySelector('[data-section="trust-cards"] .trust-grid');
    if (!grid) return;
    grid.innerHTML = cards
      .filter((c) => c.is_active !== false)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      .map(
        (c) => `
      <article class="trust-card" data-trust-key="${escapeHtml(c.card_key)}">
        <span class="trust-card__label">${escapeHtml(c.label)}</span>
        <h3>${escapeHtml(c.title)}</h3>
      </article>`
      )
      .join("");
  }

  function applyCtaBlocks(blocks, page) {
    if (!blocks?.length) return;
    blocks
      .filter((b) => b.is_active !== false && (!b.page_slug || b.page_slug === page))
      .forEach((block) => {
        const sectionKey = block.section_key;
        if (!sectionKey) return;
        const section = document.querySelector(`[data-section="${CSS.escape(sectionKey)}"]`);
        if (!section) return;

        const eyebrow = section.querySelector(".eyebrow");
        if (eyebrow && block.eyebrow) applyText(eyebrow, block.eyebrow);

        const h1 = section.querySelector("h1");
        const h2 = section.querySelector("h2");
        if (h1 && block.title) applyText(h1, block.title);
        else if (h2 && block.title) applyText(h2, block.title);

        if (block.body) {
          const lead = section.querySelector(".section-lead");
          const bodyP = section.querySelector("p:not(.eyebrow):not(.section-lead)");
          if (lead) applyText(lead, block.body);
          else if (bodyP) applyText(bodyP, block.body);
        }

        const btns = section.querySelectorAll(".btn, a.btn");
        if (block.button_primary_label && btns[0]) applyText(btns[0], block.button_primary_label);
        if (block.button_primary_href && btns[0]?.tagName === "A") btns[0].href = block.button_primary_href;
        if (block.button_secondary_label && btns[1]) applyText(btns[1], block.button_secondary_label);
        if (block.button_secondary_href && btns[1]?.tagName === "A") btns[1].href = block.button_secondary_href;
      });
  }

  function applyContactFormFields(fields) {
    if (!fields?.length) return;
    const nameMap = {
      name: { id: "contact-name", labelSel: '[for="contact-name"]' },
      email: { id: "contact-email", labelSel: '[for="contact-email"]' },
      phone: { id: "contact-phone", labelSel: '[for="contact-phone"]' },
      preferred_time: { id: "contact-time", labelSel: '[for="contact-time"]' },
      message: { id: "contact-message", labelSel: '[for="contact-message"]' },
    };
    fields
      .filter((f) => f.is_active !== false)
      .forEach((field) => {
        const meta = nameMap[field.field_key];
        if (!meta) return;
        const input = document.getElementById(meta.id);
        const label = document.querySelector(meta.labelSel);
        if (label && field.label) {
          const req = field.is_required ? ' <span aria-hidden="true">*</span>' : "";
          label.innerHTML = escapeHtml(field.label) + req;
        }
        if (input) {
          if (field.placeholder) input.placeholder = field.placeholder;
          if (field.is_required) input.required = true;
        }
      });
  }

  function applyStructuredSections(rows) {
    if (!rows?.length) return;
    rows
      .filter((r) => r.section_key && r.is_visible !== false)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      .forEach((row) => {
        const section = document.querySelector(`[data-section="${CSS.escape(row.section_key)}"]`);
        if (!section) return;
        const eyebrow = section.querySelector(".eyebrow");
        if (eyebrow && row.subtitle) applyText(eyebrow, row.subtitle);
        const h1 = section.querySelector("h1");
        const h2 = section.querySelector("h2");
        if (h1 && row.title) applyText(h1, row.title);
        else if (h2 && row.title) applyText(h2, row.title);
        if (row.body) {
          const lead = section.querySelector(".section-lead");
          if (lead) applyText(lead, row.body);
        }
        if (row.button_label) {
          const btn = section.querySelector(".btn, a.btn");
          if (btn) applyText(btn, row.button_label);
        }
        if (row.button_url) {
          const btn = section.querySelector(".btn, a.btn");
          if (btn?.tagName === "A") btn.href = row.button_url;
        }
      });
  }

  function renderStaffCard(member) {
    const initials = member.initials || getInitials(member.name);
    const src = member.photo_url ? escapeHtml(member.photo_url) : "";
    const alt = member.photo_url ? escapeHtml(member.name) : "";
    return `
      <article class="staff-card" data-staff-id="${escapeHtml(member.slug)}" data-staff-active="${member.is_active}" data-staff-order="${member.sort_order}">
        <div class="staff-card__layout">
          <div class="staff-card__media staff-card__media--no-photo">
            <img class="staff-card__photo" src="${src}" alt="${alt}" width="88" height="88" decoding="async" />
            <span class="staff-card__initials" aria-hidden="true">${escapeHtml(initials)}</span>
          </div>
          <div class="staff-card__body">
            <h2 class="staff-card__name">${escapeHtml(member.name)}</h2>
            <p>${escapeHtml(member.bio)}</p>
          </div>
        </div>
      </article>`;
  }

  function serviceTitle(s) {
    return s.name || s.title || s.slug;
  }

  function serviceShort(s) {
    return s.short_description || s.lead || "";
  }

  function serviceFull(s) {
    return s.full_description || "";
  }

  function renderServiceNavItem(s) {
    return `<a href="#${escapeHtml(s.slug)}">${escapeHtml(serviceTitle(s))}</a>`;
  }

  function renderServicePreviewLink(s) {
    return `<a href="services.html#${escapeHtml(s.slug)}">${escapeHtml(serviceTitle(s))}</a>`;
  }

  function renderServicePanel(s) {
    const full = serviceFull(s);
    const fullBlock = full ? `<p>${escapeHtml(full)}</p>` : "";
    return `
      <section class="service-panel" id="${escapeHtml(s.slug)}" data-section="service-${escapeHtml(s.slug)}">
        <div class="service-panel__inner">
          <p class="eyebrow">${escapeHtml(s.eyebrow || "")}</p>
          <h2>${escapeHtml(serviceTitle(s))}</h2>
          <p class="section-lead">${escapeHtml(serviceShort(s))}</p>
          ${fullBlock}
        </div>
      </section>`;
  }

  async function safeSelect(sb, table, queryFn) {
    try {
      const result = await queryFn(sb.from(table));
      if (result.error) {
        if (/relation|does not exist|42P01/i.test(result.error.message || "")) return null;
        console.warn(`[site-content] ${table}:`, result.error.message);
        return null;
      }
      return result.data;
    } catch (e) {
      console.warn(`[site-content] ${table}:`, e);
      return null;
    }
  }

  async function loadStaff(sb) {
    const data = await safeSelect(sb, "staff_members", (q) =>
      q.select("*").eq("is_active", true).order("sort_order")
    );
    if (!data?.length) return;
    const list = document.querySelector('[data-section="staff-list"]');
    if (!list) return;
    list.innerHTML = data.map(renderStaffCard).join("");
    if (typeof global.initStaffPhotoFallback === "function") global.initStaffPhotoFallback();
  }

  async function loadServices(sb, page) {
    const data = await safeSelect(sb, "services", (q) => q.select("*").eq("is_active", true).order("sort_order"));
    if (!data?.length) return;
    if (page === "services") {
      const nav = document.querySelector('[data-section="services-nav"] nav');
      const main = document.querySelector("main");
      if (nav) nav.innerHTML = data.map(renderServiceNavItem).join("");
      if (main) {
        main.querySelectorAll(".service-panel").forEach((el) => el.remove());
        main.insertAdjacentHTML("beforeend", data.map(renderServicePanel).join(""));
      }
    }
    if (page === "index") {
      const preview = document.querySelector('[data-section="services-preview"] .services-nav');
      if (preview) preview.innerHTML = data.map(renderServicePreviewLink).join("");
    }
  }

  async function loadSiteImages(sb, page) {
    const data = await safeSelect(sb, "site_images", (q) => q.select("*").order("sort_order"));
    if (!data?.length) return;
    const active = data.filter((i) => i.is_active !== false);

    const logo = active.find((i) => i.image_key === "logo");
    if (logo?.public_url) {
      document.querySelectorAll(".site-logo").forEach((img) => {
        img.src = logo.public_url;
        img.dataset.cmsAlt = "1";
        if (logo.alt_text) img.alt = logo.alt_text;
      });
    }

    if (page === "index") {
      const slides = active.filter((i) => i.category === "slideshow" || /^slide/i.test(i.image_key));
      slides.sort((a, b) => a.sort_order - b.sort_order);
      const slider = document.querySelector(".hero-slider");
      if (slider && slides.length) {
        const prev = slider.querySelector(".prev-slide");
        const next = slider.querySelector(".next-slide");
        slider.querySelectorAll(".slide").forEach((el) => el.remove());
        slides.forEach((img, idx) => {
          const div = document.createElement("div");
          div.className = "slide" + (idx === 0 ? " active" : "");
          const image = document.createElement("img");
          image.src = img.public_url;
          image.alt = img.alt_text || img.title || `Dental office slideshow image ${idx + 1}`;
          div.appendChild(image);
          slider.insertBefore(div, prev || next || null);
        });
        if (typeof global.initHeroSlider === "function") global.initHeroSlider(true);
      }

      const before = active.find((i) => i.image_key === "before");
      const after = active.find((i) => i.image_key === "after");
      const beforeImg = document.querySelector("[data-image='before']");
      const afterImg = document.querySelector("[data-image='after']");
      if (before?.public_url && beforeImg) {
        beforeImg.src = before.public_url;
        if (before.alt_text) beforeImg.alt = before.alt_text;
      }
      if (after?.public_url && afterImg) {
        afterImg.src = after.public_url;
        if (after.alt_text) afterImg.alt = after.alt_text;
      }
    }
  }

  async function hydrate() {
    if (!global.isSupabaseConfigured?.() || !global.getSupabaseClient) return;
    const sb = global.getSupabaseClient();
    if (!sb) return;

    const page = document.body.getAttribute("data-page");

    try {
      const settingsRes = await sb.from("site_settings").select("*").eq("id", 1).maybeSingle();
      if (!settingsRes.error && settingsRes.data) applySettings(settingsRes.data);

      const navLinks = await safeSelect(sb, "navigation_links", (q) => q.select("*").order("sort_order"));
      if (navLinks) applyNavigationLinks(navLinks);

      const uiLabels = await safeSelect(sb, "ui_labels", (q) => q.select("*"));
      if (uiLabels) applyUiLabels(uiLabels);

      const formFields = await safeSelect(sb, "contact_form_fields", (q) => q.select("*").order("sort_order"));
      if (formFields) applyContactFormFields(formFields);

      if (page === "index") {
        const trustCards = await safeSelect(sb, "trust_cards", (q) =>
          q.select("*").eq("is_active", true).order("sort_order")
        );
        if (trustCards?.length) applyTrustCards(trustCards);
      }

      const ctaBlocks = await safeSelect(sb, "cta_blocks", (q) => q.select("*").order("sort_order"));
      if (ctaBlocks) applyCtaBlocks(ctaBlocks, page);

      if (page) {
        const secRes = await sb.from("page_sections").select("*").eq("page_slug", page);
        if (!secRes.error && secRes.data) {
          applyFieldMap(fieldMapFromRows(secRes.data.filter((r) => r.field_key)));
          applyStructuredSections(secRes.data);
        }
      }

      if (page === "staff") await loadStaff(sb);
      await loadServices(sb, page);
      await loadSiteImages(sb, page);

      if (page !== "index" && document.querySelector(".site-logo")) {
        const imgRes = await sb.from("site_images").select("*").eq("image_key", "logo").maybeSingle();
        if (!imgRes.error && imgRes.data?.public_url && imgRes.data.is_active !== false) {
          document.querySelectorAll(".site-logo").forEach((img) => {
            img.src = imgRes.data.public_url;
            if (imgRes.data.alt_text) img.alt = imgRes.data.alt_text;
          });
        }
      }
    } catch (e) {
      console.warn("[site-content] Supabase unavailable, using static content.", e);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", hydrate);
  } else {
    hydrate();
  }
})(window);
