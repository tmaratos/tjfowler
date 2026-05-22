/**
 * Renders CMS sections into HTML matching existing site styles.
 */
(function () {
  const { escapeHtml, paragraphHtml, hoursHtml } = window.CmsCore;

  function renderButtons(buttons) {
    if (!Array.isArray(buttons) || !buttons.length) return "";
    return `<div class="cta-actions">${buttons
      .map((b) => {
        const style = b.style === "secondary" ? "secondary" : "primary";
        return `<a class="btn ${style}" href="${escapeHtml(b.href)}">${escapeHtml(b.text)}</a>`;
      })
      .join("")}</div>`;
  }

  function renderSidebar(sidebar) {
    if (!sidebar) return "";
    if (sidebar.type === "office_hours") {
      const btn = sidebar.button
        ? `<a class="btn primary" href="${escapeHtml(sidebar.button.href)}">${escapeHtml(sidebar.button.text)}</a>`
        : "";
      return `<div class="office-hours-card"><h3>${escapeHtml(sidebar.title || "Office Hours")}</h3>${hoursHtml(sidebar.hours)}${btn}</div>`;
    }
    if (sidebar.type === "info_card") {
      const paras = (sidebar.paragraphs || [])
        .map((p) => paragraphHtml(p))
        .join("");
      const btn = sidebar.button
        ? `<a class="btn primary" href="${escapeHtml(sidebar.button.href)}">${escapeHtml(sidebar.button.text)}</a>`
        : "";
      return `<div class="office-hours-card"><h3>${escapeHtml(sidebar.title)}</h3>${paras}${btn}</div>`;
    }
    return "";
  }

  function renderSection(section, pageSlug) {
    const t = section.section_type;
    const c = section.content || {};

    switch (t) {
      case "home_hero": {
        const slides = (c.slides || [])
          .map(
            (s, i) =>
              `<div class="slide${i === 0 ? " active" : ""}"><img src="${escapeHtml(s.src)}" alt="${escapeHtml(s.alt)}" /></div>`
          )
          .join("");
        return `<section class="home-hero" aria-label="T.J. Fowler DDS slideshow">
          <div class="hero-slider">${slides}
            <button class="slider-btn prev-slide" type="button" aria-label="Previous slide">&#8249;</button>
            <button class="slider-btn next-slide" type="button" aria-label="Next slide">&#8250;</button>
          </div>
          <div class="hero-overlay">
            <p class="eyebrow">${escapeHtml(c.eyebrow)}</p>
            <h1>${escapeHtml(c.title)}</h1>
            <p>${escapeHtml(c.subtitle)}</p>
            <div class="cta-actions">
              <a class="btn primary" href="${escapeHtml(c.cta_primary?.href)}">${escapeHtml(c.cta_primary?.text)}</a>
              <a class="btn secondary" href="${escapeHtml(c.cta_secondary?.href)}">${escapeHtml(c.cta_secondary?.text)}</a>
            </div>
          </div>
        </section>`;
      }
      case "page_hero":
        return `<section class="page-hero">
          <p class="eyebrow">${escapeHtml(c.eyebrow)}</p>
          <h1>${escapeHtml(c.title)}</h1>
          <p>${escapeHtml(c.subtitle)}</p>
          ${renderButtons(c.buttons)}
        </section>`;
      case "trust_cards": {
        const cards = (c.cards || [])
          .map(
            (card) =>
              `<article class="trust-card"><span class="trust-card__label">${escapeHtml(card.label)}</span><h3>${escapeHtml(card.title)}</h3></article>`
          )
          .join("");
        return `<section class="section section--tight"><div class="trust-grid">${cards}</div></section>`;
      }
      case "two_column": {
        const paras = (c.paragraphs || []).map((p) => paragraphHtml(p)).join("");
        const eyebrow = c.eyebrow ? `<p class="eyebrow">${escapeHtml(c.eyebrow)}</p>` : "";
        const title = c.title ? `<h2>${escapeHtml(c.title)}</h2>` : "";
        return `<section class="section"><div class="service-content"><div>${eyebrow}${title}${paras}</div><div>${renderSidebar(c.sidebar)}</div></div></section>`;
      }
      case "section_header_links": {
        const links = (c.links || [])
          .map(
            (l) =>
              `<a href="${escapeHtml(l.href)}">${escapeHtml(l.text)}</a>`
          )
          .join("");
        const alt = pageSlug === "index" ? " section--alt" : "";
        return `<section class="section${alt}"><div class="section-header">
          <p class="eyebrow">${escapeHtml(c.eyebrow)}</p>
          <h2>${escapeHtml(c.title)}</h2>
          <p class="section-lead">${escapeHtml(c.lead)}</p>
        </div><div class="services-nav">${links}</div></section>`;
      }
      case "showcase":
        return `<section class="showcase-section"><div class="section-header">
          <p class="eyebrow">${escapeHtml(c.eyebrow)}</p>
          <h2>${escapeHtml(c.title)}</h2>
          <p class="section-lead">${escapeHtml(c.lead)}</p>
        </div><div class="showcase">
          <figure class="showcase__item"><span class="showcase__tag">Before</span><img src="${escapeHtml(c.before?.src)}" alt="${escapeHtml(c.before?.alt)}" /></figure>
          <figure class="showcase__item"><span class="showcase__tag">After</span><img src="${escapeHtml(c.after?.src)}" alt="${escapeHtml(c.after?.alt)}" /></figure>
        </div></section>`;
      case "patient_cta":
        return `<section class="section"><div class="patient-cta"><div>
          ${c.eyebrow ? `<p class="eyebrow">${escapeHtml(c.eyebrow)}</p>` : ""}
          ${c.title ? `<h2>${escapeHtml(c.title)}</h2>` : ""}
          ${c.text ? `<p>${escapeHtml(c.text)}</p>` : ""}
        </div>${renderButtons(c.buttons)}</div></section>`;
      case "service_nav": {
        const links = (c.links || [])
          .map((l) => `<a href="${escapeHtml(l.href)}">${escapeHtml(l.text)}</a>`)
          .join("");
        return `<section class="section section--flush"><nav class="services-nav services-nav--page" aria-label="Services menu">${links}</nav></section>`;
      }
      case "service_panel":
        return `<section class="service-panel" id="${escapeHtml(c.anchor_id)}"><div class="service-panel__inner">
          <p class="eyebrow">${escapeHtml(c.eyebrow)}</p>
          <h2>${escapeHtml(c.title)}</h2>
          <p class="section-lead">${escapeHtml(c.lead)}</p>
        </div></section>`;
      case "staff_card":
        return "";
      case "info_card":
        return `<section class="section"><div class="info-card">
          <h2>${escapeHtml(c.title)}</h2>
          ${c.lead ? `<p class="section-lead">${escapeHtml(c.lead)}</p>` : ""}
          ${(c.paragraphs || []).map((p) => paragraphHtml(p)).join("")}
        </div></section>`;
      case "rich_text": {
        const paras = (c.paragraphs || []).map((p) => paragraphHtml(p)).join("");
        return `<section class="section">
          ${c.eyebrow ? `<p class="eyebrow">${escapeHtml(c.eyebrow)}</p>` : ""}
          ${c.title ? `<h2>${escapeHtml(c.title)}</h2>` : ""}
          ${paras}
        </section>`;
      }
      default:
        return `<section class="section"><p class="section-lead">Unknown section type: ${escapeHtml(t)}</p></section>`;
    }
  }

  function renderPage(sections, pageSlug) {
    const visible = sections.filter((s) => s.visible !== false);
    const parts = [];
    let staffGroup = [];

    visible.forEach((section, i) => {
      if (section.section_type === "staff_card") {
        staffGroup.push(section);
        const next = visible[i + 1];
        if (!next || next.section_type !== "staff_card") {
          parts.push(
            `<section class="section staff-section">${staffGroup
              .map((s) => {
                const c = s.content || {};
                return `<article class="staff-card"><h2 class="staff-card__name">${escapeHtml(c.name)}</h2><p>${escapeHtml(c.bio)}</p></article>`;
              })
              .join("")}</section>`
          );
          staffGroup = [];
        }
      } else {
        parts.push(renderSection(section, pageSlug));
      }
    });

    return parts.join("");
  }

  function applySiteSettings(settings) {
    if (!settings) return;
    const addr = `${escapeHtml(settings.address_line1)}<br />${escapeHtml(settings.address_line2)}`;
    const phone = settings.phone_display || settings.phone;
    const tel = settings.phone || "8656922222";

    document.querySelectorAll(".header-contact span").forEach((el) => {
      el.innerHTML = addr;
    });
    document.querySelectorAll(".header-contact a[href^='tel']").forEach((el) => {
      el.href = `tel:${tel}`;
      el.textContent = phone;
    });
    document.querySelectorAll(".mobile-call").forEach((el) => {
      el.href = `tel:${tel}`;
    });
    document.querySelectorAll(".site-footer__brand p").forEach((el, i) => {
      if (i === 1) el.innerHTML = addr;
    });
    document.querySelectorAll(".site-footer__brand a[href^='tel']").forEach((el) => {
      el.href = `tel:${tel}`;
      el.textContent = phone;
    });
    const hoursEl = document.querySelector(".site-footer__hours");
    if (hoursEl && settings.office_hours) {
      const heading = hoursEl.querySelector(".site-footer__heading");
      hoursEl.innerHTML = "";
      if (heading) hoursEl.appendChild(heading);
      else {
        const h = document.createElement("p");
        h.className = "site-footer__heading";
        h.textContent = "Office Hours";
        hoursEl.appendChild(h);
      }
      (settings.office_hours || []).forEach((row) => {
        const p = document.createElement("p");
        p.innerHTML = `<strong>${escapeHtml(row.label)}:</strong> ${escapeHtml(row.time)}`;
        hoursEl.appendChild(p);
      });
    }
    const copy = document.querySelector(".site-footer__bottom p");
    if (copy && settings.footer_copyright) copy.textContent = settings.footer_copyright;
  }

  window.CmsRender = {
    renderPage,
    renderSection,
    applySiteSettings,
  };
})();
