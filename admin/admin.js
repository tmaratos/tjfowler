/**
 * T.J. Fowler DDS — Cloudflare D1 admin dashboard
 */
(function () {
  const TOKEN_KEY = "cms_admin_token";

  const authGate = document.getElementById("auth-gate");
  const authAlert = document.getElementById("auth-alert");
  const authTokenForm = document.getElementById("auth-token-form");
  const appView = document.getElementById("app-view");
  const globalAlert = document.getElementById("global-alert");

  let staffCache = [];

  function isLocalDev() {
    const h = location.hostname;
    return h === "localhost" || h === "127.0.0.1";
  }

  function getToken() {
    return sessionStorage.getItem(TOKEN_KEY) || "";
  }

  function setToken(t) {
    if (t) sessionStorage.setItem(TOKEN_KEY, t);
    else sessionStorage.removeItem(TOKEN_KEY);
  }

  function authHeaders() {
    const h = { "Content-Type": "application/json" };
    const token = getToken();
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }

  async function api(path, options = {}) {
    const res = await fetch(path, {
      ...options,
      headers: { ...authHeaders(), ...(options.headers || {}) },
    });
    const data = await res.json().catch(() => ({}));
    return { res, data };
  }

  function showAlert(el, msg, type) {
    if (!el) return;
    el.textContent = msg || "";
    el.className = "admin-alert admin-alert--" + (type || "info");
    el.hidden = !msg;
  }

  function showGlobal(msg, type) {
    showAlert(globalAlert, msg, type);
    if (msg) setTimeout(() => showAlert(globalAlert, "", ""), 5000);
  }

  function escapeHtml(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function showPanel(id) {
    document.querySelectorAll(".admin-nav__item").forEach((b) => {
      b.classList.toggle("is-active", b.getAttribute("data-panel") === id);
    });
    document.querySelectorAll(".admin-panel-view").forEach((p) => {
      p.hidden = p.id !== "panel-" + id;
    });
  }

  document.querySelectorAll(".admin-nav__item").forEach((btn) => {
    btn.addEventListener("click", () => showPanel(btn.getAttribute("data-panel")));
  });

  async function checkAuth() {
    const { res } = await api("/api/admin/staff");
    if (res.status === 401) {
      appView.hidden = true;
      authGate.hidden = false;
      if (isLocalDev()) {
        document.getElementById("auth-gate-desc").textContent =
          "Enter your local admin token to continue.";
        authTokenForm.hidden = false;
      } else {
        document.getElementById("auth-gate-desc").textContent =
          "This page is protected. Sign in through Cloudflare Access to continue.";
        authTokenForm.hidden = true;
      }
      return false;
    }
    if (!res.ok) {
      showAlert(authAlert, "Could not connect to the website editor.", "error");
      return false;
    }
    authGate.hidden = true;
    appView.hidden = false;
    appView.classList.add("is-active");
    return true;
  }

  document.getElementById("btn-save-token")?.addEventListener("click", async () => {
    const t = document.getElementById("admin-token").value.trim();
    if (!t) {
      showAlert(authAlert, "Please enter the admin token.", "error");
      return;
    }
    setToken(t);
    const ok = await checkAuth();
    if (!ok) {
      setToken("");
      showAlert(authAlert, "Invalid admin token.", "error");
    } else {
      await loadAll();
    }
  });

  async function loadStaffPageForm() {
    const { res, data } = await api("/api/admin/pages/staff");
    if (!res.ok) return;
    const p = data.page || {};
    document.getElementById("sp-eyebrow").value = p.eyebrow || "";
    document.getElementById("sp-title").value = p.title || "";
    document.getElementById("sp-subtitle").value = p.subtitle || "";
  }

  document.getElementById("staff-page-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const page = {
      eyebrow: document.getElementById("sp-eyebrow").value.trim(),
      title: document.getElementById("sp-title").value.trim(),
      subtitle: document.getElementById("sp-subtitle").value.trim(),
    };
    const { res, data } = await api("/api/admin/pages/staff", {
      method: "PUT",
      body: JSON.stringify({ page }),
    });
    if (!res.ok) showGlobal(data.error || "Could not save.", "error");
    else showGlobal("Staff page intro saved.", "success");
  });

  function staffPlaceholder(m) {
    const initials = (m.initials || m.name || "?").slice(0, 3).toUpperCase();
    return `<div class="admin-photo-placeholder">${escapeHtml(initials)}</div>`;
  }

  function renderStaffEditor() {
    const editor = document.getElementById("staff-editor");
    if (!editor) return;
    editor.innerHTML = staffCache
      .map(
        (m, i) => `
      <div class="admin-panel admin-card" data-staff-id="${m.id}"${m._draft ? ' data-staff-draft="1"' : ""}>
        ${m._draft ? '<p class="admin-help">New — enter a name and click Save Changes. Hidden from website until saved with Show on Website checked.</p>' : ""}
        <div class="admin-photo-wrap">${m.photo_key ? "" : staffPlaceholder(m)}</div>
        <div class="admin-grid-2">
          <div class="admin-field"><label>Name</label><input type="text" data-f="name" value="${escapeHtml(m.name || "")}" placeholder="Staff name" /></div>
          <div class="admin-field"><label>Initials (if no photo)</label><input type="text" data-f="initials" value="${escapeHtml(m.initials || "")}" maxlength="3" /></div>
        </div>
        <div class="admin-field"><label>Role (optional)</label><input type="text" data-f="role" value="${escapeHtml(m.role || "")}" /></div>
        <div class="admin-field"><label>Bio</label><textarea data-f="bio" rows="4">${escapeHtml(m.bio || "")}</textarea></div>
        <input type="hidden" data-f="sort_order" value="${m.sort_order}" />
        <label class="admin-check"><input type="checkbox" data-f="is_active" ${m.is_active ? "checked" : ""} /> Show on Website</label>
        <div class="admin-card-actions">
          <button type="button" class="admin-btn admin-btn--ghost admin-btn--sm" data-action="staff-up" ${i === 0 ? "disabled" : ""}>Move Up</button>
          <button type="button" class="admin-btn admin-btn--ghost admin-btn--sm" data-action="staff-down" ${i === staffCache.length - 1 ? "disabled" : ""}>Move Down</button>
          <button type="button" class="admin-btn admin-btn--primary admin-btn--sm" data-action="save-staff">Save Changes</button>
          ${m._draft ? "" : '<button type="button" class="admin-btn admin-btn--danger admin-btn--sm" data-action="hide-staff">Hide from Website</button>'}
        </div>
      </div>`
      )
      .join("");
  }

  function readStaffCard(card) {
    return {
      name: (card.querySelector('[data-f="name"]')?.value || "").trim(),
      initials: (card.querySelector('[data-f="initials"]')?.value || "").trim(),
      role: (card.querySelector('[data-f="role"]')?.value || "").trim(),
      bio: (card.querySelector('[data-f="bio"]')?.value || "").trim(),
      sort_order: Number(card.querySelector('[data-f="sort_order"]')?.value || 0),
      is_active: card.querySelector('[data-f="is_active"]')?.checked ? 1 : 0,
    };
  }

  async function loadStaff() {
    const { res, data } = await api("/api/admin/staff");
    if (!res.ok) return;
    staffCache = data.staff || [];
    renderStaffEditor();
  }

  document.getElementById("btn-add-staff")?.addEventListener("click", () => {
    staffCache.push({
      id: `draft-${Date.now()}`,
      _draft: true,
      name: "",
      initials: "",
      role: "",
      bio: "",
      sort_order: staffCache.length + 1,
      is_active: 0,
    });
    renderStaffEditor();
  });

  document.getElementById("staff-editor")?.addEventListener("click", async (e) => {
    const card = e.target.closest("[data-staff-id]");
    if (!card) return;
    const id = card.getAttribute("data-staff-id");
    const idx = staffCache.findIndex((m) => String(m.id) === id);

    if (e.target.matches("[data-action='staff-up']") && idx > 0) {
      const a = staffCache[idx];
      const b = staffCache[idx - 1];
      [a.sort_order, b.sort_order] = [b.sort_order, a.sort_order];
      if (!a._draft) await api(`/api/admin/staff/${a.id}`, { method: "PUT", body: JSON.stringify(a) });
      if (!b._draft) await api(`/api/admin/staff/${b.id}`, { method: "PUT", body: JSON.stringify(b) });
      staffCache.sort((x, y) => x.sort_order - y.sort_order);
      renderStaffEditor();
      return;
    }
    if (e.target.matches("[data-action='staff-down']") && idx < staffCache.length - 1) {
      const a = staffCache[idx];
      const b = staffCache[idx + 1];
      [a.sort_order, b.sort_order] = [b.sort_order, a.sort_order];
      if (!a._draft) await api(`/api/admin/staff/${a.id}`, { method: "PUT", body: JSON.stringify(a) });
      if (!b._draft) await api(`/api/admin/staff/${b.id}`, { method: "PUT", body: JSON.stringify(b) });
      staffCache.sort((x, y) => x.sort_order - y.sort_order);
      renderStaffEditor();
      return;
    }

    if (e.target.matches("[data-action='save-staff']")) {
      const payload = readStaffCard(card);
      if (!payload.name) {
        showGlobal("Please enter a staff name before saving.", "error");
        return;
      }
      console.log("Saving staff payload:", payload);
      const isDraft = card.hasAttribute("data-staff-draft");
      let result;
      if (isDraft) {
        result = await api("/api/admin/staff", { method: "POST", body: JSON.stringify(payload) });
      } else {
        result = await api(`/api/admin/staff/${id}`, { method: "PUT", body: JSON.stringify(payload) });
      }
      console.log("Staff save result:", result.data, result.res.status);
      if (!result.res.ok) showGlobal(result.data.error || "Could not save staff member.", "error");
      else {
        showGlobal("Staff member saved.", "success");
        await loadStaff();
      }
    }

    if (e.target.matches("[data-action='hide-staff']")) {
      if (!confirm("Hide this staff member from the public website?")) return;
      const { res, data } = await api(`/api/admin/staff/${id}`, { method: "DELETE" });
      if (!res.ok) showGlobal(data.error || "Could not hide staff member.", "error");
      else {
        showGlobal("Staff member hidden from website.", "success");
        await loadStaff();
      }
    }
  });

  function hoursToText(jsonStr) {
    try {
      const rows = JSON.parse(jsonStr || "[]");
      return rows.map((r) => `${r.day}|${r.hours}`).join("\n");
    } catch {
      return "";
    }
  }

  function textToHours(text) {
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [day, ...rest] = line.split("|");
        return { day: (day || "").trim(), hours: rest.join("|").trim() };
      });
  }

  async function loadBasics() {
    const { res, data } = await api("/api/admin/site");
    if (!res.ok) return;
    const s = data.settings || {};
    document.getElementById("set-practice-name").value = s.practice_name || "";
    document.getElementById("set-phone").value = s.phone || "";
    document.getElementById("set-phone-display").value = s.phone_display || "";
    document.getElementById("set-address1").value = s.address_line1 || "";
    document.getElementById("set-address2").value = s.address_line2 || "";
    document.getElementById("set-hours").value = hoursToText(s.office_hours_json);
    document.getElementById("set-appt-eyebrow").value = s.appointments_eyebrow || "";
    document.getElementById("set-appt-title").value = s.appointments_title || "";
    document.getElementById("set-appt-text").value = s.appointments_text || "";
    document.getElementById("set-appt-call").value = s.appointments_call_label || "";
    document.getElementById("set-appt-contact").value = s.appointments_contact_label || "";
    document.getElementById("set-footer").value = s.footer_copyright || "";
    document.getElementById("set-credit-text").value = s.website_credit_text || "";
    document.getElementById("set-credit-url").value = s.website_credit_url || "";
  }

  document.getElementById("basics-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const settings = {
      practice_name: document.getElementById("set-practice-name").value.trim(),
      phone: document.getElementById("set-phone").value.trim(),
      phone_display: document.getElementById("set-phone-display").value.trim(),
      address_line1: document.getElementById("set-address1").value.trim(),
      address_line2: document.getElementById("set-address2").value.trim(),
      office_hours_json: JSON.stringify(textToHours(document.getElementById("set-hours").value)),
      appointments_eyebrow: document.getElementById("set-appt-eyebrow").value.trim(),
      appointments_title: document.getElementById("set-appt-title").value.trim(),
      appointments_text: document.getElementById("set-appt-text").value.trim(),
      appointments_call_label: document.getElementById("set-appt-call").value.trim(),
      appointments_call_href: "tel:" + document.getElementById("set-phone").value.trim().replace(/\D/g, ""),
      appointments_contact_label: document.getElementById("set-appt-contact").value.trim(),
      appointments_contact_href: "contact.html",
      footer_copyright: document.getElementById("set-footer").value.trim(),
      website_credit_text: document.getElementById("set-credit-text").value.trim(),
      website_credit_url: document.getElementById("set-credit-url").value.trim(),
    };
    const { res, data } = await api("/api/admin/site", {
      method: "PUT",
      body: JSON.stringify({ settings }),
    });
    if (!res.ok) showGlobal(data.error || "Could not save.", "error");
    else showGlobal("Website basics saved.", "success");
  });

  async function loadAll() {
    await Promise.all([loadStaffPageForm(), loadStaff(), loadBasics()]);
  }

  (async function init() {
    const ok = await checkAuth();
    if (ok) await loadAll();
  })();
})();
