/** @deprecated Use js/site-content.js — kept for backward compatibility. */
(function (global) {
  if (global.__siteContentLoaded) return;
  const s = document.createElement("script");
  s.src = "js/site-content.js";
  document.head.appendChild(s);
})(window);
