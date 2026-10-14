CREATE TYPE group_type AS ENUM ('DIPLOMA', 'ADMIN', 'INDUSTRY', 'OTHER');
CREATE TYPE role_code AS ENUM ('STAFF', 'GROUP_ADMIN', 'OVERALL_ADMIN');
CREATE TYPE participant_status AS ENUM ('SUGGESTED', 'ACKNOWLEDGED', 'DECLINED');
CREATE TYPE contribution_status AS ENUM ('PLANNED', 'ONGOING', 'COMPLETED');
CREATE TYPE evidence_type AS ENUM ('FILE', 'LINK');
CREATE TYPE lock_kind AS ENUM ('JOURNAL', 'PERMANENT_AY');

CREATE TABLE designations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE staff_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  group_type group_type NOT NULL,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE staff_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_number text NOT NULL UNIQUE,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  must_change_password boolean NOT NULL DEFAULT true,
  designation_id uuid NOT NULL REFERENCES designations(id),
  group_id uuid NOT NULL REFERENCES staff_groups(id),
  reporting_officer_id uuid REFERENCES staff_members(id),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (reporting_officer_id IS NULL OR reporting_officer_id <> id)
);

CREATE TABLE role_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  role role_code NOT NULL,
  group_id uuid REFERENCES staff_groups(id),
  UNIQUE NULLS NOT DISTINCT (staff_id, role, group_id),
  CHECK (
    (role = 'GROUP_ADMIN' AND group_id IS NOT NULL)
    OR (role <> 'GROUP_ADMIN' AND group_id IS NULL)
  )
);

CREATE TABLE academic_years (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE CHECK (code ~ '^AY[0-9]{4}$'),
  minimum_cents integer NOT NULL,
  maximum_cents integer NOT NULL,
  is_current boolean NOT NULL DEFAULT false,
  is_permanently_locked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (minimum_cents >= 0),
  CHECK (maximum_cents >= minimum_cents)
);

CREATE UNIQUE INDEX one_current_academic_year
  ON academic_years (is_current) WHERE is_current = true;

CREATE TABLE performance_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  guidance text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE transformation_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id uuid NOT NULL REFERENCES academic_years(id),
  category_id uuid NOT NULL REFERENCES performance_categories(id),
  transformation_goal_id uuid REFERENCES transformation_goals(id),
  created_by_id uuid NOT NULL REFERENCES staff_members(id),
  title text NOT NULL,
  description text NOT NULL,
  outcomes text,
  status contribution_status NOT NULL DEFAULT 'ONGOING',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE journal_entry_staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id uuid NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  staff_id uuid NOT NULL REFERENCES staff_members(id),
  added_by_id uuid NOT NULL REFERENCES staff_members(id),
  contribution_role text,
  lecturer_cents integer,
  acknowledgement_status participant_status NOT NULL DEFAULT 'SUGGESTED',
  acknowledged_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (journal_entry_id, staff_id),
  CHECK (
    (acknowledgement_status = 'ACKNOWLEDGED' AND lecturer_cents IS NOT NULL)
    OR acknowledgement_status <> 'ACKNOWLEDGED'
  )
);

CREATE TABLE journal_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id uuid NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  evidence_type evidence_type NOT NULL,
  title text NOT NULL,
  storage_reference text,
  external_url text,
  notes text,
  uploaded_by_id uuid NOT NULL REFERENCES staff_members(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    (evidence_type = 'FILE' AND storage_reference IS NOT NULL AND external_url IS NULL)
    OR (evidence_type = 'LINK' AND external_url IS NOT NULL AND storage_reference IS NULL)
  )
);

CREATE TABLE cents_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_staff_id uuid NOT NULL REFERENCES journal_entry_staff(id) ON DELETE CASCADE,
  adjusted_by_id uuid NOT NULL REFERENCES staff_members(id),
  adjusted_cents integer NOT NULL,
  officer_distance integer NOT NULL CHECK (officer_distance > 0),
  comments text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE journal_locks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id uuid NOT NULL REFERENCES academic_years(id),
  staff_id uuid NOT NULL REFERENCES staff_members(id),
  locked_by_id uuid REFERENCES staff_members(id),
  lock_kind lock_kind NOT NULL DEFAULT 'JOURNAL',
  officer_distance integer,
  unlocked_at timestamptz,
  unlocked_by_id uuid REFERENCES staff_members(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    (lock_kind = 'PERMANENT_AY' AND locked_by_id IS NULL)
    OR (lock_kind = 'JOURNAL' AND locked_by_id IS NOT NULL AND officer_distance > 0)
  )
);

CREATE UNIQUE INDEX one_active_journal_lock
  ON journal_locks (academic_year_id, staff_id)
  WHERE unlocked_at IS NULL;

CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  entity_type text,
  entity_id uuid,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE audit_events (
  id bigserial PRIMARY KEY,
  actor_id uuid REFERENCES staff_members(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  changes jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX staff_reporting_officer_idx ON staff_members(reporting_officer_id);
CREATE INDEX journal_entries_year_idx ON journal_entries(academic_year_id);
CREATE INDEX journal_entry_staff_staff_idx ON journal_entry_staff(staff_id);
CREATE INDEX notifications_unread_idx ON notifications(staff_id, created_at DESC) WHERE read_at IS NULL;
CREATE INDEX audit_entity_idx ON audit_events(entity_type, entity_id, created_at DESC);

-- Validates participant and adjustment cents against the entry's Academic Year.
CREATE OR REPLACE FUNCTION validate_lecturer_cents_value() RETURNS trigger AS $$
DECLARE
  min_value integer;
  max_value integer;
BEGIN
  SELECT ay.minimum_cents, ay.maximum_cents INTO min_value, max_value
  FROM journal_entries je
  JOIN academic_years ay ON ay.id = je.academic_year_id
  WHERE je.id = NEW.journal_entry_id;

  IF NEW.lecturer_cents NOT BETWEEN min_value AND max_value THEN
    RAISE EXCEPTION 'Cents must be between % and %', min_value, max_value;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_adjusted_cents_value() RETURNS trigger AS $$
DECLARE
  min_value integer;
  max_value integer;
BEGIN
  SELECT ay.minimum_cents, ay.maximum_cents INTO min_value, max_value
  FROM journal_entry_staff jes
  JOIN journal_entries je ON je.id = jes.journal_entry_id
  JOIN academic_years ay ON ay.id = je.academic_year_id
  WHERE jes.id = NEW.journal_entry_staff_id;

  IF NEW.adjusted_cents NOT BETWEEN min_value AND max_value THEN
    RAISE EXCEPTION 'Cents must be between % and %', min_value, max_value;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_lecturer_cents
BEFORE INSERT OR UPDATE OF lecturer_cents ON journal_entry_staff
FOR EACH ROW WHEN (NEW.lecturer_cents IS NOT NULL)
EXECUTE FUNCTION validate_lecturer_cents_value();

CREATE TRIGGER validate_adjusted_cents
BEFORE INSERT OR UPDATE OF adjusted_cents ON cents_adjustments
FOR EACH ROW
EXECUTE FUNCTION validate_adjusted_cents_value();

