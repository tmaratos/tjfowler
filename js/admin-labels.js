/**
 * Plain-English labels for the website editor (internal keys stay in code/DB only).
 */
(function (global) {
  const BUTTONS = {
    save: "Save Changes",
    upload: "Upload Photo",
    replace: "Replace Photo",
    show: "Show on Website",
    hide: "Hide from Website",
    moveUp: "Move Up",
    moveDown: "Move Down",
    addService: "Add Service",
    addStaff: "Add Staff Member",
    addHoursRow: "Add Day",
    refresh: "Refresh List",
    signOut: "Sign Out",
    viewSite: "View Website",
  };

  const PANELS = {
    dashboard: {
      title: "Dashboard",
      description: "Overview of everything you can update on the practice website.",
    },
    basics: {
      title: "Website Basics",
      description: "Your practice name, contact details, address, office hours, and footer credit.",
    },
    homepage: {
      title: "Homepage",
      description: "The main page visitors see first — banner, photos, trust boxes, welcome text, before & after, and appointment section.",
    },
    "meet-dr-fowler": {
      title: "Meet Dr. Fowler",
      description: "Dr. Fowler’s page heading, introduction, biography, and appointment box.",
    },
    services: {
      title: "Services",
      description: "Dental services listed on the Services page — names, descriptions, and visibility.",
    },
    staff: {
      title: "Staff",
      description: "Team members shown on the Staff page, including photos and bios.",
    },
    "patient-resources": {
      title: "Dentistry & You",
      description: "Patient education page heading, introduction, and main content.",
    },
    contact: {
      title: "Contact Page",
      description: "Contact page wording, form messages, and each form field’s labels.",
    },
    messages: {
      title: "Website Messages",
      description: "Messages sent through the contact form on your website.",
    },
    navigation: {
      title: "Navigation & Footer",
      description: "Links in the top menu and footer — labels, destinations, and visibility.",
    },
  };

  const DASHBOARD_CARDS = [
    { panel: "basics", title: "Website Basics", blurb: "Update practice name, phone, address, hours, and footer." },
    { panel: "homepage", title: "Homepage", blurb: "Edit the homepage banner, slideshow, trust boxes, and welcome area." },
    { panel: "meet-dr-fowler", title: "Meet Dr. Fowler", blurb: "Change Dr. Fowler’s bio and page introduction." },
    { panel: "services", title: "Services", blurb: "Add or edit services patients can read about." },
    { panel: "staff", title: "Staff", blurb: "Manage team photos, names, and bios." },
    { panel: "patient-resources", title: "Dentistry & You", blurb: "Edit the patient resources page text." },
    { panel: "contact", title: "Contact Page", blurb: "Adjust contact page text and form field labels." },
    { panel: "messages", title: "Website Messages", blurb: "Read and organize messages from the contact form." },
    { panel: "navigation", title: "Navigation & Footer", blurb: "Update menu and footer links." },
  ];

  const FIELD_LABELS = {
    "page-title": "Browser tab title (advanced)",
    "meta-description": "Search description (advanced)",
    "hero-eyebrow": "Small top line",
    "hero-title": "Main heading",
    "hero-lead": "Description",
    "hero-cta-primary-label": "Primary button text",
    "hero-cta-primary-url": "Primary button link",
    "hero-cta-secondary-label": "Secondary button text",
    "hero-cta-secondary-url": "Secondary button link",
    "welcome-eyebrow": "Small top line",
    "welcome-title": "Heading",
    "welcome-para-1": "Paragraph",
    "welcome-para-2": "Second paragraph",
    "welcome-hours-cta-label": "Hours call label",
    "welcome-hours-heading": "Hours card heading",
    "welcome-call-label": "Call button label",
    "patient-cta-eyebrow": "Small top line",
    "patient-cta-title": "Heading",
    "patient-cta-body": "Paragraph",
    "patient-cta-call-label": "Call button text",
    "patient-cta-contact-label": "Contact button text",
    "showcase-eyebrow": "Small top line",
    "showcase-title": "Heading",
    "showcase-lead": "Description",
    "showcase-before-tag": "Before image caption",
    "showcase-after-tag": "After image caption",
    "bio-title": "Bio section heading",
    "bio-p1": "Bio paragraph 1",
    "bio-p2": "Bio paragraph 2",
    "bio-p3": "Bio paragraph 3",
    "bio-p4": "Bio paragraph 4",
    "bio-p5": "Bio paragraph 5",
    "doctor-info-heading": "Appointment box heading",
    "doctor-info-p1": "Appointment box text 1",
    "doctor-info-p2": "Appointment box text 2",
    "doctor-info-p3": "Appointment box text 3",
    "doctor-cta-label": "Appointment button text",
    "doctor-cta-url": "Appointment button link",
    "content-title": "Education heading",
    "content-lead": "Education paragraph",
    "contact-heading": "Office information heading",
    "contact-phone-label": "Phone label",
    "contact-fax-label": "Fax label",
    "contact-hours-heading": "Hours card heading",
    "contact-form-success": "Message after successful send",
    "contact-form-error": "Message when send fails",
    "mobile-call-label": "Mobile call bar text",
    "footer-hours-heading": "Footer hours heading",
    "services-preview-eyebrow": "Services preview small line",
    "services-preview-title": "Services preview heading",
    "services-preview-lead": "Services preview description",
  };

  const HOMEPAGE_SECTIONS = [
    {
      id: "banner",
      title: "Main Homepage Banner",
      description: "Large banner at the top of the homepage with headings and buttons.",
      fieldKeys: [
        "hero-eyebrow",
        "hero-title",
        "hero-lead",
        "hero-cta-primary-label",
        "hero-cta-primary-url",
        "hero-cta-secondary-label",
        "hero-cta-secondary-url",
      ],
      ctaBlock: { page_slug: "index", section_key: "hero" },
    },
    {
      id: "slideshow",
      title: "Slideshow Photos",
      description: "Rotating photos on the homepage banner.",
      type: "slideshow",
    },
    {
      id: "trust",
      title: "Homepage Trust Boxes",
      description: "Four highlight boxes below the banner (e.g. Established, Expertise).",
      type: "trust",
    },
    {
      id: "welcome",
      title: "Welcome Text",
      description: "Welcome section in the middle of the homepage.",
      fieldKeys: ["welcome-eyebrow", "welcome-title", "welcome-para-1", "welcome-para-2"],
      ctaBlock: { page_slug: "index", section_key: "welcome" },
    },
    {
      id: "before-after",
      title: "Before & After",
      description: "Before and after photos and captions on the homepage.",
      fieldKeys: [
        "showcase-eyebrow",
        "showcase-title",
        "showcase-lead",
        "showcase-before-tag",
        "showcase-after-tag",
      ],
      type: "showcase-images",
    },
    {
      id: "appointment",
      title: "Appointment Section",
      description: "Call-to-action near the bottom of the homepage.",
      fieldKeys: [
        "patient-cta-eyebrow",
        "patient-cta-title",
        "patient-cta-body",
        "patient-cta-call-label",
        "patient-cta-contact-label",
      ],
      ctaBlock: { page_slug: "index", section_key: "patient-cta" },
    },
  ];

  const PAGE_SLUGS = {
    "meet-dr-fowler": {
      fieldKeys: [
        "hero-eyebrow",
        "hero-title",
        "hero-lead",
        "bio-title",
        "bio-p1",
        "bio-p2",
        "bio-p3",
        "bio-p4",
        "bio-p5",
        "doctor-info-heading",
        "doctor-info-p1",
        "doctor-info-p2",
        "doctor-info-p3",
        "doctor-cta-label",
        "doctor-cta-url",
      ],
    },
    "patient-resources": {
      fieldKeys: ["hero-eyebrow", "hero-title", "hero-lead", "content-title", "content-lead"],
    },
    contact: {
      fieldKeys: [
        "hero-eyebrow",
        "hero-title",
        "hero-lead",
        "contact-heading",
        "contact-phone-label",
        "contact-fax-label",
        "contact-hours-heading",
      ],
      uiLabelKeys: ["contact-form-title", "contact-form-submit"],
    },
  };

  const TRUST_CARD_LABELS = {
    established: "Established",
    expertise: "Expertise",
    approach: "Approach",
    experience: "Experience",
  };

  const NAV_SECTIONS = [
    { id: "top-menu", title: "Top Menu", description: "Links across the top of every page.", location: "nav" },
    { id: "footer-links", title: "Footer Links", description: "Quick links in the website footer.", location: "footer" },
  ];

  const MESSAGES = {
    saved: "Your changes were saved.",
    saveFailed: "We could not save your changes. Please try again.",
    deleted: "Item removed.",
    uploadOk: "Photo uploaded successfully.",
    uploadFailed: "Photo upload failed. Please use JPG, PNG, or WebP.",
    hoursInvalid: "Please check office hours — each row needs a day and hours.",
    confirmDeleteService: "Remove this service from the website?",
    confirmDeleteStaff: "Remove this staff member from the website?",
    confirmHide: "Hide this from the website?",
    addServiceName: "Enter the service name:",
    addStaffName: "Enter the staff member’s name:",
    tableMissing: "This section is not set up yet. Ask your website helper to finish setup.",
  };

  function labelForField(key) {
    return FIELD_LABELS[key] || key.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  global.AdminLabels = {
    BUTTONS,
    PANELS,
    DASHBOARD_CARDS,
    FIELD_LABELS,
    HOMEPAGE_SECTIONS,
    PAGE_SLUGS,
    TRUST_CARD_LABELS,
    NAV_SECTIONS,
    MESSAGES,
    labelForField,
  };
})(window);
