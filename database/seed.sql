INSERT INTO designations (name) VALUES
  ('Programme Chair'),
  ('Assistant Programme Chair'),
  ('Senior Lecturer'),
  ('Lecturer')
ON CONFLICT DO NOTHING;

INSERT INTO staff_groups (code, name, group_type) VALUES
  ('DAAA', 'Diploma in Applied AI and Analytics', 'DIPLOMA'),
  ('ADMIN', 'Administration', 'ADMIN'),
  ('INDUSTRY', 'Industry', 'INDUSTRY')
ON CONFLICT DO NOTHING;

INSERT INTO academic_years (code, minimum_cents, maximum_cents, is_current)
VALUES ('AY2026', 5, 1000, true)
ON CONFLICT DO NOTHING;

INSERT INTO performance_categories (code, name, display_order) VALUES
  ('PET', 'PET', 10),
  ('CET', 'CET', 20),
  ('TL', 'Teaching & Learning / Pedagogy', 30),
  ('PROJECTS', 'Projects', 40),
  ('CONSULTATION', 'Consultation', 50),
  ('SOI', 'SOI Activities', 60),
  ('EDTECH', 'edTech Initiatives', 70),
  ('STUDENTS', 'Student Matters', 80),
  ('ALUMNI', 'Alumni Matters', 90),
  ('DIPLOMA', 'Diploma Activities', 100),
  ('AWARDS', 'Awards', 110),
  ('TRAINING', 'Training & Certification', 120),
  ('OTHERS', 'Others', 130)
ON CONFLICT DO NOTHING;

INSERT INTO transformation_goals (code, name) VALUES
  ('FUTURE_LEARNERS', 'Future-Proof Learners'),
  ('TIE', 'Focus TIE Efforts'),
  ('SOCIAL_MOBILITY', 'Strengthen Support for Social Mobility'),
  ('DIGITALISE', 'Digitalise RP'),
  ('CAPABILITIES', 'Transform RP''s Capabilities')
ON CONFLICT DO NOTHING;
