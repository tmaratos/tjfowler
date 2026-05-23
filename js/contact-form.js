/**
 * Contact form → contact_submissions (anon insert via RLS).
 * Labels from contact_form_fields when available.
 */
(function (global) {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const statusEl = document.getElementById("contact-form-status");
  const submitBtn = form.querySelector('[type="submit"]');

  function setStatus(message, type) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = "contact-form__status contact-form__status--" + (type || "info");
    statusEl.hidden = !message;
  }

  async function loadFormFields() {
    if (!global.isSupabaseConfigured?.()) return;
    const sb = global.getSupabaseClient();
    if (!sb) return;
    const { data, error } = await sb.from("contact_form_fields").select("*").eq("is_active", true).order("sort_order");
    if (error || !data?.length) return;
    const map = {
      name: { id: "contact-name", labelSel: '[for="contact-name"]' },
      email: { id: "contact-email", labelSel: '[for="contact-email"]' },
      phone: { id: "contact-phone", labelSel: '[for="contact-phone"]' },
      preferred_time: { id: "contact-time", labelSel: '[for="contact-time"]' },
      message: { id: "contact-message", labelSel: '[for="contact-message"]' },
    };
    const esc = global.CmsCore?.escapeHtml || ((s) => String(s));
    data.forEach((field) => {
      const meta = map[field.field_key];
      if (!meta) return;
      const input = document.getElementById(meta.id);
      const label = document.querySelector(meta.labelSel);
      if (label && field.label) {
        const req = field.is_required ? ' <span aria-hidden="true">*</span>' : "";
        label.innerHTML = esc(field.label) + req;
      }
      if (input) {
        if (field.placeholder) input.placeholder = field.placeholder;
        if (field.is_required) input.required = true;
      }
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!global.isSupabaseConfigured?.()) {
      setStatus("Online messaging is temporarily unavailable. Please call our office.", "error");
      return;
    }
    const sb = global.getSupabaseClient();
    if (!sb) {
      setStatus("Online messaging is temporarily unavailable. Please call our office.", "error");
      return;
    }

    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      phone: String(fd.get("phone") || "").trim() || null,
      preferred_time: String(fd.get("preferred_time") || "").trim() || null,
      message: String(fd.get("message") || "").trim(),
      status: "new",
    };

    if (!payload.name || !payload.email || !payload.message) {
      setStatus("Please fill in name, email, and message.", "error");
      return;
    }

    submitBtn.disabled = true;
    setStatus("Sending…", "info");

    let { error } = await sb.from("contact_submissions").insert(payload);
    if (error && /status/i.test(error.message || "")) {
      const fallback = { ...payload };
      delete fallback.status;
      ({ error } = await sb.from("contact_submissions").insert(fallback));
    }

    submitBtn.disabled = false;
    if (error) {
      console.error("[contact-form]", error);
      setStatus("We could not send your message. Please call the office.", "error");
      return;
    }

    form.reset();
    setStatus("Thank you. Your message was received. We will respond during business hours.", "success");
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadFormFields);
  } else {
    loadFormFields();
  }
})(window);
