/**
 * Hydrate staff.html from Cloudflare D1 API. Static HTML remains on failure.
 */
(function () {
  function escapeHtml(str) {
    if (str == null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function applyText(el, value) {
    if (!el || value == null || value === "") return;
    el.textContent = value;
  }

  function renderStaffCard(member) {
    const initials = member.initials || "?";
    const photo = member.photo_key
      ? `<img class="staff-card__photo" src="" alt="${escapeHtml(member.name)}" width="88" height="88" decoding="async" data-photo-key="${escapeHtml(member.photo_key)}" />`
      : `<img class="staff-card__photo" src="" alt="" width="88" height="88" decoding="async" />`;
    return `
      <article class="staff-card" data-staff-id="${escapeHtml(String(member.id))}">
        <div class="staff-card__layout">
          <div class="staff-card__media staff-card__media--no-photo">
            ${photo}
            <span class="staff-card__initials" aria-hidden="true">${escapeHtml(initials)}</span>
          </div>
          <div class="staff-card__body">
            <h2 class="staff-card__name">${escapeHtml(member.name)}</h2>
            <p>${escapeHtml(member.bio)}</p>
          </div>
        </div>
      </article>`;
  }

  function applySiteSettings(settings) {
    if (!settings) return;
    if (settings.practice_name) {
      document.querySelectorAll('[data-editable="practice-name"]').forEach((el) => applyText(el, settings.practice_name));
    }
    if (settings.address_line1 && settings.address_line2) {
      const addr = `${settings.address_line1}\n${settings.address_line2}`;
      document.querySelectorAll('[data-editable="address"]').forEach((el) => {
        el.innerHTML = `${escapeHtml(settings.address_line1)}<br />${escapeHtml(settings.address_line2)}`;
      });
    }
    const phone = settings.phone_display || settings.phone;
    if (phone) {
      document.querySelectorAll('[data-editable="phone"]').forEach((el) => {
        applyText(el, phone);
        if (el.tagName === "A") el.href = `tel:${String(settings.phone || phone).replace(/\D/g, "")}`;
      });
      document.querySelectorAll(".mobile-call").forEach((el) => {
        el.href = `tel:${String(settings.phone || phone).replace(/\D/g, "")}`;
      });
    }
    if (settings.footer_copyright) {
      document.querySelectorAll('[data-editable="footer-copyright"]').forEach((el) => applyText(el, settings.footer_copyright));
    }
    if (settings.website_credit_text) {
      document.querySelectorAll('[data-editable="website-credit-text"]').forEach((el) => applyText(el, settings.website_credit_text));
    }
    if (settings.website_credit_url) {
      document.querySelectorAll('[data-editable="website-credit-url"]').forEach((el) => {
        if (el.tagName === "A") el.href = settings.website_credit_url;
      });
    }
    if (settings.office_hours_json) {
      try {
        const hours = JSON.parse(settings.office_hours_json);
        document.querySelectorAll('[data-editable="footer-hours"]').forEach((el) => {
          const heading = el.querySelector(".site-footer__heading");
          const h = heading ? heading.outerHTML : "";
          const body = hours
            .map((row) => `<p><strong>${escapeHtml(row.day)}:</strong> ${escapeHtml(row.hours)}</p>`)
            .join("");
          el.innerHTML = h + body;
        });
      } catch (_) {
        /* keep static */
      }
    }
    if (settings.appointments_eyebrow) {
      document.querySelectorAll('[data-editable="patient-cta-eyebrow"]').forEach((el) => applyText(el, settings.appointments_eyebrow));
    }
    if (settings.appointments_title) {
      document.querySelectorAll('[data-editable="patient-cta-title"]').forEach((el) => applyText(el, settings.appointments_title));
    }
    if (settings.appointments_text) {
      document.querySelectorAll('[data-editable="patient-cta-body"]').forEach((el) => applyText(el, settings.appointments_text));
    }
    if (settings.appointments_call_label) {
      document.querySelectorAll('[data-editable="patient-cta-call-label"]').forEach((el) => applyText(el, settings.appointments_call_label));
    }
    if (settings.appointments_call_href) {
      document.querySelectorAll('[data-editable="patient-cta-call-label"]').forEach((el) => {
        if (el.tagName === "A") el.href = settings.appointments_call_href;
      });
    }
    if (settings.appointments_contact_label) {
      document.querySelectorAll('[data-editable="patient-cta-contact-label"]').forEach((el) => applyText(el, settings.appointments_contact_label));
    }
  }

  async function hydrate() {
    try {
      const [pageRes, staffRes, siteRes] = await Promise.all([
        fetch("/api/public/pages/staff"),
        fetch("/api/public/staff"),
        fetch("/api/public/site"),
      ]);

      if (pageRes.ok) {
        const { page } = await pageRes.json();
        if (page) {
          document.querySelectorAll('[data-editable="hero-eyebrow"]').forEach((el) => applyText(el, page.eyebrow));
          document.querySelectorAll('[data-editable="hero-title"]').forEach((el) => applyText(el, page.title));
          document.querySelectorAll('[data-editable="hero-lead"]').forEach((el) => applyText(el, page.subtitle));
          if (page.seo_title) document.title = page.seo_title;
          const meta = document.querySelector('meta[name="description"]');
          if (meta && page.seo_description) meta.setAttribute("content", page.seo_description);
        }
      }

      if (staffRes.ok) {
        const { staff } = await staffRes.json();
        if (staff?.length) {
          const list = document.querySelector('[data-section="staff-list"]');
          if (list) {
            list.innerHTML = staff.map(renderStaffCard).join("");
            if (typeof window.initStaffPhotoFallback === "function") {
              window.initStaffPhotoFallback();
            }
          }
        }
      }

      if (siteRes.ok) {
        const { settings } = await siteRes.json();
        applySiteSettings(settings);
      }
    } catch (e) {
      console.warn("[staff-page] API unavailable, using static content.", e);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", hydrate);
  } else {
    hydrate();
  }
})();
