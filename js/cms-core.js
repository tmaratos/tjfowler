/**
 * Shared CMS helpers (no service_role).
 */
(function (global) {
  function escapeHtml(str) {
    if (str == null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getInitials(name) {
    if (!name) return "?";
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const ALLOWED_IMAGE_EXT = /\.(jpe?g|png|webp)$/i;

  function isAllowedImageFile(file) {
    if (!file) return false;
    const typeOk = ALLOWED_IMAGE_TYPES.includes(file.type);
    const extOk = ALLOWED_IMAGE_EXT.test(file.name || "");
    return typeOk || extOk;
  }

  function formatPhoneDisplay(digits) {
    const d = String(digits || "").replace(/\D/g, "");
    if (d.length === 10) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    return digits || "";
  }

  global.CmsCore = {
    escapeHtml,
    getInitials,
    isAllowedImageFile,
    formatPhoneDisplay,
  };
})(window);
