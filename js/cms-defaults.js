/**
 * Default site content — used as fallback and for first-time database seed.
 */
(function () {
  const HOURS = [
    { label: "Monday", time: "8:00 AM – 4:00 PM" },
    { label: "Tuesday – Thursday", time: "8:30 AM – 5:00 PM" },
    { label: "Friday", time: "8:00 AM – 4:00 PM" },
  ];

  const SLIDES = [
    { src: "assets/slide0.jpg", alt: "Dental office slideshow image 1" },
    { src: "assets/slide1.jpg", alt: "Dental office slideshow image 2" },
    { src: "assets/slide2.jpg", alt: "Dental office slideshow image 3" },
    { src: "assets/slide3.jpg", alt: "Dental office slideshow image 4" },
    { src: "assets/slide4.jpg", alt: "Dental office slideshow image 5" },
    { src: "assets/slide5.jpg", alt: "Dental office slideshow image 6" },
  ];

  window.CMS_DEFAULTS = {
    siteSettings: {
      phone: "8656922222",
      phone_display: "865.692.2222",
      fax: "8656922272",
      fax_display: "865.692.2272",
      address_line1: "120 Capital Drive, Suite 102",
      address_line2: "Knoxville, TN 37922",
      office_hours: HOURS,
      footer_copyright: "© 2026 T.J. Fowler DDS. All rights reserved.",
    },
    pages: {
      index: {
        title: "T.J. Fowler DDS | Knoxville Restorative & Cosmetic Dentistry",
        meta_description:
          "T.J. Fowler DDS provides restorative, cosmetic, family, and preventive dental care in Knoxville, Tennessee.",
        sections: [
          {
            section_type: "home_hero",
            visible: true,
            content: {
              eyebrow: "Knoxville, Tennessee",
              title: "Restorative & Cosmetic Dentistry with a Personal Touch",
              subtitle:
                "Modern dental care from a locally rooted Knoxville practice focused on comfort, trust, and long-term patient relationships.",
              cta_primary: { text: "Schedule Appointment", href: "contact.html" },
              cta_secondary: { text: "Meet Dr. Fowler", href: "meet-dr-fowler.html" },
              slides: SLIDES,
            },
          },
          {
            section_type: "trust_cards",
            visible: true,
            content: {
              cards: [
                { label: "Established", title: "Serving Knoxville Since 2007" },
                { label: "Expertise", title: "Restorative & Cosmetic Dentistry" },
                { label: "Approach", title: "Family-Focused Care" },
                { label: "Experience", title: "Comfortable Office Experience" },
              ],
            },
          },
          {
            section_type: "two_column",
            visible: true,
            content: {
              eyebrow: "Welcome",
              title: "Comprehensive Dental Care in West Knoxville",
              paragraphs: [
                "Dr. Fowler and his staff welcome patients to a modern dental office focused on comfort, professionalism, and long-term oral health.",
                "Conveniently located in West Knoxville near Kingston Pike and Pellissippi Parkway, the office provides family, restorative, cosmetic, and preventive dental care.",
              ],
              sidebar: {
                type: "office_hours",
                title: "Office Hours",
                hours: HOURS,
                button: { text: "Call 865.692.2222", href: "tel:8656922222" },
              },
            },
          },
          {
            section_type: "section_header_links",
            visible: true,
            content: {
              eyebrow: "Dental Services",
              title: "Services Offered",
              lead: "Comprehensive care tailored to your smile, comfort, and long-term oral health.",
              links: [
                { text: "General Dentistry", href: "services.html#general" },
                { text: "Cosmetic Dentistry", href: "services.html#cosmetic" },
                { text: "Implant Dentistry", href: "services.html#implant" },
                { text: "Crowns & Bridges", href: "services.html#crowns" },
                { text: "Root Canal Therapy", href: "services.html#rootcanal" },
                { text: "Routine Cleanings", href: "services.html#cleanings" },
                { text: "Nitrous Oxide Sedation", href: "services.html#nitrous" },
                { text: "Pediatric Dentistry", href: "services.html#pediatric" },
              ],
            },
          },
          {
            section_type: "showcase",
            visible: true,
            content: {
              eyebrow: "Smile Results",
              title: "Before & After",
              lead: "A refined look at restorative and cosmetic dental treatment results.",
              before: { src: "assets/IMG_6047.jpeg", alt: "Before dental treatment" },
              after: { src: "assets/IMG_6048.jpeg", alt: "After dental treatment" },
            },
          },
          {
            section_type: "patient_cta",
            visible: true,
            content: {
              eyebrow: "Appointments",
              title: "Ready to Schedule?",
              text: "Contact the office for appointments, questions, directions, and patient forms.",
              buttons: [
                { text: "Call 865.692.2222", href: "tel:8656922222", style: "primary" },
                { text: "Contact", href: "contact.html", style: "secondary" },
              ],
            },
          },
        ],
      },
      services: {
        title: "Services Offered | T.J. Fowler DDS",
        meta_description: "",
        sections: [
          {
            section_type: "page_hero",
            visible: true,
            content: {
              eyebrow: "Dental Services",
              title: "Services Offered",
              subtitle:
                "Comprehensive restorative, cosmetic, preventive, and family dental care in Knoxville, Tennessee.",
            },
          },
          {
            section_type: "service_nav",
            visible: true,
            content: {
              links: [
                { text: "General Dentistry", href: "#general" },
                { text: "Cosmetic Dentistry", href: "#cosmetic" },
                { text: "Implant Dentistry", href: "#implant" },
                { text: "Crowns & Bridges", href: "#crowns" },
                { text: "Root Canal Therapy", href: "#rootcanal" },
                { text: "Routine Cleanings", href: "#cleanings" },
                { text: "Nitrous Oxide Sedation", href: "#nitrous" },
                { text: "Pediatric Dentistry", href: "#pediatric" },
              ],
            },
          },
          {
            section_type: "service_panel",
            visible: true,
            content: { anchor_id: "general", eyebrow: "General Dentistry", title: "General & Family Dentistry", lead: "Preventive dental care including cleanings, exams, x-rays, and long-term oral health support." },
          },
          {
            section_type: "service_panel",
            visible: true,
            content: { anchor_id: "cosmetic", eyebrow: "Cosmetic Dentistry", title: "Cosmetic Services, Whitening & Veneers", lead: "Cosmetic dental treatments focused on smile appearance, confidence, whitening, and veneers." },
          },
          {
            section_type: "service_panel",
            visible: true,
            content: { anchor_id: "implant", eyebrow: "Implants", title: "Implant Dentistry", lead: "Implant restoration options intended to restore appearance and function after tooth loss." },
          },
          {
            section_type: "service_panel",
            visible: true,
            content: { anchor_id: "crowns", eyebrow: "Restorative Care", title: "Crowns & Bridges", lead: "Restorative treatment options for damaged, weakened, or missing teeth." },
          },
          {
            section_type: "service_panel",
            visible: true,
            content: { anchor_id: "rootcanal", eyebrow: "Root Canal Therapy", title: "Root Canal Treatment", lead: "Treatment designed to relieve pain while preserving natural teeth whenever possible." },
          },
          {
            section_type: "service_panel",
            visible: true,
            content: { anchor_id: "cleanings", eyebrow: "Preventive Dentistry", title: "Routine Cleanings & Gum Disease Treatment", lead: "Preventive cleanings and periodontal care supporting long-term oral health." },
          },
          {
            section_type: "service_panel",
            visible: true,
            content: { anchor_id: "nitrous", eyebrow: "Patient Comfort", title: "Nitrous Oxide Sedation", lead: "Comfort-focused treatment options available for anxious or nervous patients." },
          },
          {
            section_type: "service_panel",
            visible: true,
            content: { anchor_id: "pediatric", eyebrow: "Family Dentistry", title: "Pediatric Dentistry", lead: "Friendly dental care for children in a calm and welcoming environment." },
          },
        ],
      },
      "meet-dr-fowler": {
        title: "Meet Dr. Fowler | T.J. Fowler DDS",
        meta_description: "",
        sections: [
          {
            section_type: "page_hero",
            visible: true,
            content: {
              eyebrow: "Meet The Dentist",
              title: "Meet Dr. T.J. Fowler",
              subtitle:
                "A Knoxville native providing restorative, cosmetic, preventive, and family dental care with a community-focused approach.",
            },
          },
          {
            section_type: "two_column",
            visible: true,
            content: {
              title: "Knoxville Roots. Professional Dental Care.",
              paragraphs: [
                "Dr. Fowler was born and raised in Knoxville, Tennessee, and his family has long been part of the local community.",
                "He attended Knoxville Catholic High School before earning a Bachelor of Science degree in Microbiology from the University of Tennessee, Knoxville.",
                "He later attended the University of Tennessee College of Dentistry in Memphis where he received his Doctor of Dental Surgery degree.",
                "After dental school, Dr. Fowler completed a General Practice Residency through the University of Tennessee Graduate School of Medicine at UT Hospital.",
                "Following residency, he practiced in Oak Ridge before opening his Knoxville office in December 2007.",
              ],
              sidebar: {
                type: "info_card",
                title: "Office Information",
                paragraphs: [
                  "Restorative and cosmetic dental solutions in West Knoxville.",
                  "Tuesday through Friday appointments available.",
                  "Emergency appointments available when possible.",
                ],
                button: { text: "Schedule Appointment", href: "contact.html" },
              },
            },
          },
        ],
      },
      staff: {
        title: "Meet Our Staff | T.J. Fowler DDS",
        meta_description: "Meet the dental staff at T.J. Fowler DDS in Knoxville, Tennessee.",
        sections: [
          {
            section_type: "page_hero",
            visible: true,
            content: {
              eyebrow: "Our Team",
              title: "Meet Our Staff",
              subtitle:
                "Friendly and experienced dental professionals committed to patient comfort, professionalism, and quality care.",
            },
          },
          {
            section_type: "staff_card",
            visible: true,
            content: {
              name: "Ashleigh",
              bio: "I am a 2007 graduate of Roane State Community College with an Associate of Applied Science degree in Dental Hygiene. I am a fun and caring person who always puts the care and comfort of my patients first. My husband, Kevin and I spend most of our free time with our young daughter Avery, and if we get a chance we like to work out or catch a good movie at the cinema.",
            },
          },
          {
            section_type: "staff_card",
            visible: true,
            content: {
              name: "Kristen",
              bio: "I have worked as a registered/certified dental assistant since 2009. I am currently attending Roane State Community College to pursue an Associate in Applied Science degree in Dental Hygiene. I am a native of Knoxville, Tennessee and in my free time I enjoy spending time with my fiancé, family, and friends.",
            },
          },
          {
            section_type: "staff_card",
            visible: true,
            content: {
              name: "Lora",
              bio: "I have been a Registered Dental Assistant since 1998 and I earned my Expanded Functions Certificate for Assisting from the University of Tennessee Health Science Center in Memphis, TN in 2008. I enjoy the field of dentistry because it allows me to interact with all our wonderful patients on a daily basis. I am a native of Oak Ridge, TN and love being a part of this community. I enjoy spending time outside, running, and hiking with my pet bulldog.",
            },
          },
          {
            section_type: "staff_card",
            visible: true,
            content: {
              name: "Sissy",
              bio: "I am currently the office manager for Dr. T.J Fowler. I have spent the past twenty years working in the dental field as a registered dental assistant. I have certifications in Dental Radiology, Nitrous Oxide Monitoring, and Coronal Polishing. Much of my spare time is spent with my family or browsing the web and playing on Facebook. My wonderful husband of twenty years, James, and I have a fabulous daughter named Whitney. She is currently a sophomore at the University of Tennessee, Knoxville and she is pursuing a Bachelor of Science degree in the Biological Sciences with a concentration in Microbiology and the incorporation of a pre-Dental curriculum.",
            },
          },
          {
            section_type: "staff_card",
            visible: true,
            content: {
              name: "Jen",
              bio: "I am originally from Michigan and recently graduated from the Roane State Dental Hygiene Program in 2015. I enjoy anything outdoors and love my new puppy! I look forward to meeting and helping all of my patients! Go Michigan State!",
            },
          },
          {
            section_type: "staff_card",
            visible: true,
            content: {
              name: "Valerie",
              bio: "I am a 2009 graduate of Roane State Community College with an Associate of Applied Science degree in Dental Hygiene. I love being a hygienist and working in the field of dentistry. My husband, Casey and I have two wonderful children, Emily and Adam. I enjoy spending time with my family and friends, and I am a huge movie buff!",
            },
          },
          {
            section_type: "staff_card",
            visible: true,
            content: {
              name: "Stacy",
              bio: "Originally from Knoxville, I have been in the dental field for many years and recently joined Dr. Fowler's practice in 2015. I enjoy working with my new teammates and providing our patients with the best possible care.",
            },
          },
          {
            section_type: "patient_cta",
            visible: true,
            content: {
              eyebrow: "Appointments",
              title: "Ready to Schedule?",
              text: "Contact the office to schedule an appointment or ask questions regarding available dental services.",
              buttons: [
                { text: "Call 865.692.2222", href: "tel:8656922222", style: "primary" },
                { text: "Contact", href: "contact.html", style: "secondary" },
              ],
            },
          },
        ],
      },
      contact: {
        title: "Contact | T.J. Fowler DDS",
        meta_description: "",
        sections: [
          {
            section_type: "page_hero",
            visible: true,
            content: {
              eyebrow: "Appointments",
              title: "Contact T.J. Fowler DDS",
              subtitle: "Schedule appointments, request information, or contact the office directly.",
            },
          },
          {
            section_type: "two_column",
            visible: true,
            content: {
              title: "Office Information",
              paragraphs: [
                "<strong>T.J. Fowler DDS</strong><br />120 Capital Drive, Suite 102<br />Knoxville, TN 37922",
                "<strong>Phone:</strong><br /><a href=\"tel:8656922222\">865.692.2222</a>",
                "<strong>Fax:</strong><br />865.692.2272",
              ],
              sidebar: { type: "office_hours", title: "Office Hours", hours: HOURS },
            },
          },
        ],
      },
      "patient-resources": {
        title: "Dentistry & You | T.J. Fowler DDS",
        meta_description: "",
        sections: [
          {
            section_type: "page_hero",
            visible: true,
            content: {
              eyebrow: "Patient Education",
              title: "Dentistry & You",
              subtitle:
                "Helpful information about oral health, preventive care, and maintaining a healthy smile.",
            },
          },
          {
            section_type: "info_card",
            visible: true,
            content: {
              title: "The Importance of Routine Dental Care",
              lead: "Regular dental visits help support long-term oral health, identify concerns early, and maintain healthy teeth and gums.",
            },
          },
        ],
      },
      "404": {
        title: "Page Not Found | T.J. Fowler DDS",
        meta_description: "The page you are looking for could not be found.",
        sections: [
          {
            section_type: "page_hero",
            visible: true,
            content: {
              eyebrow: "404 Error",
              title: "Page Not Found",
              subtitle: "The page you are looking for may have been moved, renamed, or no longer exists.",
            },
          },
          {
            section_type: "patient_cta",
            visible: true,
            content: {
              buttons: [
                { text: "Return Home", href: "index.html", style: "primary" },
                { text: "Contact Office", href: "contact.html", style: "secondary" },
              ],
            },
          },
        ],
      },
    },
  };

  window.CMS_PAGE_SLUGS = Object.keys(window.CMS_DEFAULTS.pages);
})();
