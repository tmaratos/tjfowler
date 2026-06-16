/**
 * Contact form → POST /api/contact (Cloudflare Pages Function).
 */
(function () {
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

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      phone: String(fd.get("phone") || "").trim() || null,
      preferred_time: String(fd.get("preferred_time") || "").trim() || null,
      message: String(fd.get("message") || "").trim(),
    };

    if (!payload.name || !payload.email || !payload.message) {
      setStatus("Please fill in name, email, and message.", "error");
      return;
    }

    submitBtn.disabled = true;
    setStatus("Sending…", "info");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus(data.error || "We could not send your message. Please call the office.", "error");
        return;
      }
      form.reset();
      setStatus(data.message || "Thank you. Your message was received.", "success");
    } catch {
      setStatus("We could not send your message. Please call the office.", "error");
    } finally {
      submitBtn.disabled = false;
    }
  });
})();
