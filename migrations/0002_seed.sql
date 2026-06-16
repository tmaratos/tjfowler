-- Seed T.J. Fowler DDS CMS content (staff bios verbatim)

DELETE FROM staff;
DELETE FROM pages WHERE slug = 'staff';
DELETE FROM site_settings;

INSERT INTO site_settings (key, value) VALUES
  ('practice_name', 'T.J. Fowler DDS'),
  ('address_line1', '120 Capital Drive, Suite 102'),
  ('address_line2', 'Knoxville, TN 37922'),
  ('phone', '8656922222'),
  ('phone_display', '865.692.2222'),
  ('office_hours_json', '[{"day":"Mon","hours":"8:00 AM – 4:00 PM"},{"day":"Tue–Thu","hours":"8:30 AM – 5:00 PM"},{"day":"Fri","hours":"8:00 AM – 4:00 PM"}]'),
  ('footer_copyright', '© 2026 T.J. Fowler DDS. All rights reserved.'),
  ('website_credit_text', 'Tristan Maratos'),
  ('website_credit_url', 'https://tristanmaratos.com'),
  ('appointments_eyebrow', 'Appointments'),
  ('appointments_title', 'Ready to Schedule?'),
  ('appointments_text', 'Contact the office to schedule an appointment or ask questions regarding available dental services.'),
  ('appointments_call_label', 'Call 865.692.2222'),
  ('appointments_call_href', 'tel:8656922222'),
  ('appointments_contact_label', 'Contact'),
  ('appointments_contact_href', 'contact.html'),
  ('contact_form_notice', 'Please do not submit medical, dental, insurance, emergency, or patient health information through this form.');

INSERT INTO pages (slug, eyebrow, title, subtitle, seo_title, seo_description) VALUES (
  'staff',
  'Our Team',
  'Meet Our Staff',
  'Friendly and experienced dental professionals committed to patient comfort, professionalism, and quality care.',
  'Meet Our Staff | T.J. Fowler DDS',
  'Meet the dental staff at T.J. Fowler DDS in Knoxville, Tennessee.'
);

INSERT INTO staff (initials, name, role, bio, sort_order, is_active) VALUES
('A', 'Ashleigh', NULL, 'I am a 2007 graduate of Roane State Community College with an Associate of Applied Science degree in Dental Hygiene. I am a fun and caring person who always puts the care and comfort of my patients first. My husband, Kevin and I spend most of our free time with our young daughter Avery, and if we get a chance we like to work out or catch a good movie at the cinema.', 1, 1),
('K', 'Kristen', NULL, 'I have worked as a registered/certified dental assistant since 2009. I am currently attending Roane State Community College to pursue an Associate in Applied Science degree in Dental Hygiene. I am a native of Knoxville, Tennessee and in my free time I enjoy spending time with my fiancé, family, and friends.', 2, 1),
('L', 'Lora', NULL, 'I have been a Registered Dental Assistant since 1998 and I earned my Expanded Functions Certificate for Assisting from the University of Tennessee Health Science Center in Memphis, TN in 2008. I enjoy the field of dentistry because it allows me to interact with all our wonderful patients on a daily basis. I am a native of Oak Ridge, TN and love being a part of this community. I enjoy spending time outside, running, and hiking with my pet bulldog.', 3, 1),
('S', 'Sissy', NULL, 'I am currently the office manager for Dr. T.J Fowler. I have spent the past twenty years working in the dental field as a registered dental assistant. I have certifications in Dental Radiology, Nitrous Oxide Monitoring, and Coronal Polishing. Much of my spare time is spent with my family or browsing the web and playing on Facebook. My wonderful husband of twenty years, James, and I have a fabulous daughter named Whitney. She is currently a sophomore at the University of Tennessee, Knoxville and she is pursuing a Bachelor of Science degree in the Biological Sciences with a concentration in Microbiology and the incorporation of a pre-Dental curriculum.', 4, 1),
('J', 'Jen', NULL, 'I am originally from Michigan and recently graduated from the Roane State Dental Hygiene Program in 2015. I enjoy anything outdoors and love my new puppy! I look forward to meeting and helping all of my patients! Go Michigan State!', 5, 1),
('V', 'Valerie', NULL, 'I am a 2009 graduate of Roane State Community College with an Associate of Applied Science degree in Dental Hygiene. I love being a hygienist and working in the field of dentistry. My husband, Casey and I have two wonderful children, Emily and Adam. I enjoy spending time with my family and friends, and I am a huge movie buff!', 6, 1),
('S', 'Stacy', NULL, 'Originally from Knoxville, I have been in the dental field for many years and recently joined Dr. Fowler''s practice in 2015. I enjoy working with my new teammates and providing our patients with the best possible care.', 7, 1);
