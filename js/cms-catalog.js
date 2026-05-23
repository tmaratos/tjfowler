/**
 * Complete CMS catalog — every editable key on the public site (no new pages).
 */
(function (global) {
  const PAGES = [
    { slug: "index", label: "Home" },
    { slug: "meet-dr-fowler", label: "Meet Dr. Fowler" },
    { slug: "services", label: "Services" },
    { slug: "staff", label: "Staff" },
    { slug: "patient-resources", label: "Dentistry & You" },
    { slug: "contact", label: "Contact" },
    { slug: "404", label: "404" },
  ];

  const NAV_LINK_KEYS = [
    { key: "nav-home", label: "Nav: Home", href: "index.html", location: "nav" },
    { key: "nav-meet-dr", label: "Nav: Meet Dr. Fowler", href: "meet-dr-fowler.html", location: "nav" },
    { key: "nav-services", label: "Nav: Services", href: "services.html", location: "nav" },
    { key: "nav-staff", label: "Nav: Staff", href: "staff.html", location: "nav" },
    { key: "nav-patient-resources", label: "Nav: Dentistry & You", href: "patient-resources.html", location: "nav" },
    { key: "nav-contact", label: "Nav: Contact", href: "contact.html", location: "nav" },
  ];

  const FOOTER_LINK_KEYS = [
    { key: "footer-meet-dr", label: "Footer: Meet Dr. Fowler", href: "meet-dr-fowler.html", location: "footer" },
    { key: "footer-services", label: "Footer: Services", href: "services.html", location: "footer" },
    { key: "footer-staff", label: "Footer: Our Staff", href: "staff.html", location: "footer" },
    { key: "footer-contact", label: "Footer: Contact", href: "contact.html", location: "footer" },
  ];

  const TRUST_CARD_KEYS = [
    { key: "established", label: "Established" },
    { key: "expertise", label: "Expertise" },
    { key: "approach", label: "Approach" },
    { key: "experience", label: "Experience" },
  ];

  const CTA_BLOCK_KEYS = [
    { key: "hero", section_key: "hero", page_slug: "index", label: "Home: Hero" },
    { key: "welcome", section_key: "welcome", page_slug: "index", label: "Home: Welcome" },
    { key: "patient-cta", section_key: "patient-cta", page_slug: "index", label: "Home: Appointment CTA" },
    { key: "patient-cta", section_key: "patient-cta", page_slug: "staff", label: "Staff: Appointment CTA" },
    { key: "page-hero", section_key: "page-hero", page_slug: "404", label: "404: Hero CTA" },
  ];

  const CONTACT_FIELD_KEYS = [
    { key: "name", label: "Name", required: true },
    { key: "email", label: "Email", required: true },
    { key: "phone", label: "Phone", required: false },
    { key: "preferred_time", label: "Preferred time", required: false, placeholder: "e.g. mornings, Tuesday afternoon" },
    { key: "message", label: "Message", required: true },
  ];

  const UI_LABEL_KEYS = [
    { key: "footer-quick-links", label: "Footer: Quick Links heading", default: "Quick Links" },
    { key: "footer-office-hours", label: "Footer: Office Hours heading", default: "Office Hours" },
    { key: "mobile-call", label: "Mobile call button", default: "Call Now" },
    { key: "staff-login-label", label: "Staff login link", default: "Staff login" },
    { key: "contact-form-title", label: "Contact form title", default: "Send a Message" },
    { key: "contact-form-submit", label: "Contact form submit button", default: "Send Message" },
    { key: "turnstile-placeholder", label: "Turnstile placeholder", default: "Security check (Turnstile) — enable when site key is configured." },
  ];

  const SLIDE_KEYS = ["slide0", "slide1", "slide2", "slide3", "slide4", "slide5"];
  const SITE_IMAGE_KEYS = ["logo", "before", "after", ...SLIDE_KEYS];

  const PAGE_FIELD_DEFS = {
    index: [
      { key: "page-title", label: "Browser title" },
      { key: "meta-description", label: "Meta description", multiline: true },
      { key: "hero-eyebrow", label: "Hero eyebrow" },
      { key: "hero-title", label: "Hero title" },
      { key: "hero-lead", label: "Hero lead", multiline: true },
      { key: "hero-cta-primary-label", label: "Hero button 1 label" },
      { key: "hero-cta-primary-url", label: "Hero button 1 URL", href: true },
      { key: "hero-cta-secondary-label", label: "Hero button 2 label" },
      { key: "hero-cta-secondary-url", label: "Hero button 2 URL", href: true },
      { key: "welcome-eyebrow", label: "Welcome eyebrow" },
      { key: "welcome-title", label: "Welcome title" },
      { key: "welcome-para-1", label: "Welcome paragraph 1", multiline: true },
      { key: "welcome-para-2", label: "Welcome paragraph 2", multiline: true },
      { key: "welcome-hours-cta-label", label: "Welcome hours call label" },
      { key: "patient-cta-eyebrow", label: "Appointment CTA eyebrow" },
      { key: "patient-cta-title", label: "Appointment CTA title" },
      { key: "patient-cta-body", label: "Appointment CTA body", multiline: true },
      { key: "patient-cta-call-label", label: "Appointment call label" },
      { key: "patient-cta-contact-label", label: "Appointment contact label" },
      { key: "mobile-call-label", label: "Mobile call bar" },
      { key: "footer-hours-heading", label: "Footer hours heading" },
      { key: "showcase-eyebrow", label: "Before/after eyebrow" },
      { key: "showcase-title", label: "Before/after title" },
      { key: "showcase-lead", label: "Before/after lead", multiline: true },
      { key: "showcase-before-tag", label: "Before image tag" },
      { key: "showcase-after-tag", label: "After image tag" },
      { key: "welcome-para-1", label: "Welcome paragraph 1 (alt key)", multiline: true },
      { key: "welcome-para-2", label: "Welcome paragraph 2 (alt key)", multiline: true },
      { key: "welcome-hours-heading", label: "Welcome hours card heading" },
      { key: "welcome-call-label", label: "Welcome call button label" },
      { key: "services-preview-eyebrow", label: "Services preview eyebrow" },
      { key: "services-preview-title", label: "Services preview title" },
      { key: "services-preview-lead", label: "Services preview lead", multiline: true },
    ],
    "meet-dr-fowler": [
      { key: "page-title", label: "Browser title" },
      { key: "meta-description", label: "Meta description", multiline: true },
      { key: "hero-eyebrow", label: "Hero eyebrow" },
      { key: "hero-title", label: "Hero title" },
      { key: "hero-lead", label: "Hero lead", multiline: true },
      { key: "bio-title", label: "Bio section title" },
      { key: "bio-p1", label: "Bio paragraph 1", multiline: true },
      { key: "bio-p2", label: "Bio paragraph 2", multiline: true },
      { key: "bio-p3", label: "Bio paragraph 3", multiline: true },
      { key: "bio-p4", label: "Bio paragraph 4", multiline: true },
      { key: "bio-p5", label: "Bio paragraph 5", multiline: true },
      { key: "doctor-info-heading", label: "Sidebar heading" },
      { key: "doctor-info-p1", label: "Sidebar paragraph 1", multiline: true },
      { key: "doctor-info-p2", label: "Sidebar paragraph 2", multiline: true },
      { key: "doctor-info-p3", label: "Sidebar paragraph 3", multiline: true },
      { key: "doctor-cta-label", label: "Sidebar button label" },
      { key: "doctor-cta-url", label: "Sidebar button URL", href: true },
    ],
    services: [
      { key: "page-title", label: "Browser title" },
      { key: "hero-eyebrow", label: "Hero eyebrow" },
      { key: "hero-title", label: "Hero title" },
      { key: "hero-lead", label: "Hero lead", multiline: true },
    ],
    staff: [
      { key: "page-title", label: "Browser title" },
      { key: "meta-description", label: "Meta description", multiline: true },
      { key: "hero-eyebrow", label: "Hero eyebrow" },
      { key: "hero-title", label: "Hero title" },
      { key: "hero-lead", label: "Hero lead", multiline: true },
    ],
    "patient-resources": [
      { key: "page-title", label: "Browser title" },
      { key: "hero-eyebrow", label: "Hero eyebrow" },
      { key: "hero-title", label: "Hero title" },
      { key: "hero-lead", label: "Hero lead", multiline: true },
      { key: "content-title", label: "Content title" },
      { key: "content-lead", label: "Content lead", multiline: true },
    ],
    contact: [
      { key: "page-title", label: "Browser title" },
      { key: "hero-eyebrow", label: "Hero eyebrow" },
      { key: "hero-title", label: "Hero title" },
      { key: "hero-lead", label: "Hero lead", multiline: true },
      { key: "contact-heading", label: "Office information heading" },
      { key: "contact-phone-label", label: "Phone label" },
      { key: "contact-fax-label", label: "Fax label" },
      { key: "contact-hours-heading", label: "Hours card heading" },
    ],
    404: [
      { key: "page-title", label: "Browser title" },
      { key: "meta-description", label: "Meta description", multiline: true },
      { key: "hero-eyebrow", label: "Hero eyebrow" },
      { key: "hero-title", label: "Hero title" },
      { key: "hero-lead", label: "Hero lead", multiline: true },
    ],
  };

  const PAGE_STRUCTURED_SECTIONS = {
    index: [
      { key: "hero", label: "Hero overlay" },
      { key: "welcome", label: "Welcome" },
      { key: "services-preview", label: "Services preview" },
      { key: "before-after", label: "Before & after header" },
      { key: "patient-cta", label: "Appointment CTA" },
    ],
    "meet-dr-fowler": [
      { key: "page-hero", label: "Page hero" },
      { key: "doctor-bio", label: "Doctor bio block" },
    ],
    services: [{ key: "page-hero", label: "Page hero" }],
    staff: [{ key: "page-hero", label: "Page hero" }],
    "patient-resources": [
      { key: "page-hero", label: "Page hero" },
      { key: "patient-content", label: "Patient content" },
    ],
    contact: [
      { key: "page-hero", label: "Page hero" },
      { key: "contact-details", label: "Contact details" },
      { key: "contact-form", label: "Contact form section" },
    ],
    404: [{ key: "page-hero", label: "Page hero" }],
  };

  function fieldKeysForPage(slug) {
    return (PAGE_FIELD_DEFS[slug] || []).map((f) => f.key);
  }

  const PAGE_FIELDS = Object.fromEntries(
    Object.entries(PAGE_FIELD_DEFS).map(([slug, defs]) => [slug, defs.map((d) => d.key)])
  );

  const NAV_LINKS = NAV_LINK_KEYS.map((l) => ({
    key: l.key,
    defaultLabel: l.label.replace(/^Nav:\s*/i, ""),
    href: l.href,
  }));

  const FOOTER_LINKS = FOOTER_LINK_KEYS.map((l) => ({
    key: l.key,
    defaultLabel: l.label.replace(/^Footer:\s*/i, ""),
    href: l.href,
  }));

  const TRUST_DEFAULTS = [
    { label: "Established", title: "Serving Knoxville Since 2007" },
    { label: "Expertise", title: "Restorative & Cosmetic Dentistry" },
    { label: "Approach", title: "Family-Focused Care" },
    { label: "Experience", title: "Comfortable Office Experience" },
  ];

  const TRUST_CARDS = TRUST_CARD_KEYS.map((c, i) => ({
    key: c.key,
    defaultLabel: TRUST_DEFAULTS[i]?.label || "Label",
    defaultTitle: TRUST_DEFAULTS[i]?.title || "Title",
  }));

  const CONTACT_FORM_LABELS = CONTACT_FIELD_KEYS.map((f) => ({
    key: f.key,
    label: f.label,
    default: f.label,
  }));

  const CONTACT_FORM_FIELD_KEYS = CONTACT_FIELD_KEYS.map((f) => f.key);

  const DEFAULT_NAV_LINKS = NAV_LINKS.map((l) => ({ key: l.key, label: l.defaultLabel, href: l.href }));
  const DEFAULT_FOOTER_LINKS = FOOTER_LINKS.map((l) => ({ key: l.key, label: l.defaultLabel, href: l.href }));
  const DEFAULT_TRUST_CARDS = TRUST_CARDS.map((c) => ({ key: c.key, label: c.defaultLabel, title: c.defaultTitle }));

  global.CmsCatalog = {
    PAGES,
    NAV_LINK_KEYS,
    FOOTER_LINK_KEYS,
    NAV_LINKS,
    FOOTER_LINKS,
    TRUST_CARD_KEYS,
    TRUST_CARDS,
    CTA_BLOCK_KEYS,
    CONTACT_FIELD_KEYS,
    CONTACT_FORM_FIELD_KEYS,
    CONTACT_FORM_LABELS,
    UI_LABEL_KEYS,
    SLIDE_KEYS,
    SITE_IMAGE_KEYS,
    PAGE_FIELD_DEFS,
    PAGE_FIELDS,
    PAGE_STRUCTURED_SECTIONS,
    DEFAULT_NAV_LINKS,
    DEFAULT_FOOTER_LINKS,
    DEFAULT_TRUST_CARDS,
    fieldKeysForPage,
  };
})(window);
