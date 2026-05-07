-- ============================================================
-- QueueDesk MVP Code-Sync Migration v002
-- Brings DB schema in line with src/lib/supabase/types.ts
-- Run via Supabase Dashboard SQL Editor or psql
-- ============================================================

-- ============================================================
-- 1. ADD MISSING TABLES
-- ============================================================

-- contact 表：用于 Email Intake 流程
CREATE TABLE IF NOT EXISTS contact (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenant(id) ON DELETE RESTRICT,
  email text NOT NULL,
  display_name text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid,
  updated_by uuid,
  deleted_by uuid,
  CONSTRAINT uq_contact_tenant_id UNIQUE (tenant_id, id)
);

CREATE INDEX IF NOT EXISTS ix_contact_tenant_email
  ON contact (tenant_id, email)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_contact_email_lookup
  ON contact USING GIN (email gin_trgm_ops)
  WHERE deleted_at IS NULL;


-- invite 表：用于邀请用户加入工作区
CREATE TABLE IF NOT EXISTS invite (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenant(id) ON DELETE RESTRICT,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('owner','admin','agent','requester')),
  token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid,
  updated_by uuid,
  deleted_by uuid,
  CONSTRAINT uq_invite_tenant_id UNIQUE (tenant_id, id)
);

CREATE INDEX IF NOT EXISTS ix_invite_tenant_email
  ON invite (tenant_id, email)
  WHERE accepted_at IS NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_invite_token_lookup
  ON invite (token)
  WHERE accepted_at IS NULL AND deleted_at IS NULL;


-- ============================================================
-- 2. SYNC app_user TABLE
-- types.ts expects: role, avatar_url, display_name, locale, time_zone
-- ============================================================

-- Add columns if they don't exist
DO $$
BEGIN
  -- role column (simplified role on app_user for MVP code)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'app_user' AND column_name = 'role'
  ) THEN
    ALTER TABLE app_user ADD COLUMN role text NOT NULL DEFAULT 'requester' CHECK (role IN ('owner','admin','agent','requester'));
  END IF;

  -- avatar_url column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'app_user' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE app_user ADD COLUMN avatar_url text;
  END IF;

  -- display_name column (types.ts expects this; original schema has display_name)
  -- Already exists in 001_schema.sql, just ensure it's nullable as per types.ts
  -- No action needed.

  -- locale column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'app_user' AND column_name = 'locale'
  ) THEN
    ALTER TABLE app_user ADD COLUMN locale text NOT NULL DEFAULT 'en-US';
  END IF;

  -- time_zone column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'app_user' AND column_name = 'time_zone'
  ) THEN
    ALTER TABLE app_user ADD COLUMN time_zone text NOT NULL DEFAULT 'UTC';
  END IF;

  -- attributes column (types.ts expects this as jsonb)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'app_user' AND column_name = 'attributes'
  ) THEN
    ALTER TABLE app_user ADD COLUMN attributes jsonb NOT NULL DEFAULT '{}'::jsonb;
  END IF;
END
$$;


-- ============================================================
-- 3. SYNC ticket TABLE
-- types.ts expects: subject, description, lock_version, sla_deadline, breach_notified_at
-- ============================================================

DO $$
BEGIN:
  -- lock_version column (types.ts has it; 001_schema.sql has lock_version bigint)
  -- Ensure default 1 as per types.ts Insert (lock_version?: number}
  -- Already exists.

  -- sla_deadline column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'ticket' AND column_name = 'sla_deadline'
  ) THEN
    ALTER TABLE ticket ADD COLUMN sla_deadline timestamptz;
  END IF;

  -- breach_notified_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'ticket' AND column_name = 'breach_notified_at'
  ) THEN
    ALTER TABLE ticket ADD COLUMN breach_notified_at timestamptz;
  END IF;

  -- description column (types.ts expects description: string | null)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'ticket' AND column_name = 'description'
  ) THEN
    ALTER TABLE ticket ADD COLUMN description text;
  END IF;

  -- requested_by column (for portal: the end user who requested via email)
  -- Not in types.ts, skip.

END
$$;


-- ============================================================
-- 4. SYNC team TABLE
-- types.ts expects: description, status (active/paused/archived), lead_user_id
-- ============================================================

DO $$
BEGIN:
  -- status column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'team' AND column_name = 'status'
  ) THEN
    ALTER TABLE team ADD COLUMN status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','archived'));
  END IF;

  -- lead_user_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'team' AND column_name = 'lead_user_id'
  ) THEN
    ALTER TABLE team ADD COLUMN lead_user_id uuid REFERENCES app_user(id) ON DELETE SET NULL;
  END IF;
END
$$;


-- ============================================================
-- 5. SYNC queue TABLE
-- types.ts expects: description, default_priority, routing_mode, visibility, status
-- ============================================================

DO $$
BEGIN:
  -- default_priority column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'queue' AND column_name = 'default_priority'
  ) THEN
    ALTER TABLE queue ADD COLUMN default_priority text NOT NULL DEFAULT 'normal' CHECK (default_priority IN ('low','normal','high','urgent'));
  END IF;

  -- routing_mode column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'queue' AND column_name = 'routing_mode'
  ) THEN
    ALTER TABLE queue ADD COLUMN routing_mode text NOT NULL DEFAULT 'manual' CHECK (routing_mode IN ('manual','round_robin','skill_based'));
  END IF;

  -- visibility column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'queue' AND column_name = 'visibility'
  ) THEN
    ALTER TABLE queue ADD COLUMN visibility text NOT NULL DEFAULT 'restricted' CHECK (visibility IN ('internal','restricted'));
  END IF;

  -- status column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'queue' AND column_name = 'status'
  ) THEN
    ALTER TABLE queue ADD COLUMN status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','archived'));
  END IF;

  -- description column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'queue' AND column_name = 'description'
  ) THEN
    ALTER TABLE queue ADD COLUMN description text;
  END IF;
END
$$;


-- ============================================================
-- 6. SYNC sla_policy TABLE
-- types.ts expects: first_response_target_minutes, resolution_target_minutes, pause_on_statuses, business_hours (Json)
-- ============================================================

DO $$
BEGIN:
  -- first_response_target_minutes (types.ts name)
  -- 001_schema.sql has: first_response_seconds
  -- Rename or add alias. Let's add the minute-version as a generated column or just use seconds.
  -- For MVP code: keep using seconds in DB, but code sends minutes.
  -- Add a comment for clarity.
  COMMENT ON COLUMN sla_policy.first_response_seconds IS 'MVP code sends minutes; stored as seconds = minutes * 60';

  -- resolution_target_minutes (types.ts name)
  COMMENT ON COLUMN sla_policy.resolution_seconds IS 'MVP code sends minutes; stored as seconds = minutes * 60';

  -- business_hours column (types.ts expects Json)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'sla_policy' AND column_name = 'business_hours'
  ) THEN
    ALTER TABLE sla_policy ADD COLUMN business_hours jsonb NOT NULL DEFAULT '[]'::jsonb;
  END IF;

  -- pause_on_statuses (types.ts expects string[]; 001_schema.sql has pause_on_statuses ticket_status[])
  -- Already correct type. Ensure default.
  ALTER TABLE sla_policy ALTER COLUMN pause_on_statuses SET DEFAULT ARRAY['open','pending','waiting_approval','waiting_customer']::text[];
END
$$;


-- ============================================================
-- 7. ADD UPDATED_AT TRIGGERS FOR NEW TABLES
-- ============================================================

-- contact
DROP TRIGGER IF EXISTS trg_contact_set_updated_at ON contact;
CREATE TRIGGER trg_contact_set_updated_at
  BEFORE UPDATE ON contact
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

-- invite
DROP TRIGGER IF EXISTS trg_invite_set_updated_at ON invite;
CREATE TRIGGER trg_invite_set_updated_at
  BEFORE UPDATE ON invite
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();


-- ============================================================
-- 8. ENABLE RLS ON NEW TABLES
-- ============================================================

ALTER TABLE contact ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact FORCE ROW LEVEL SECURITY;

ALTER TABLE invite ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite FORCE ROW LEVEL SECURITY;

-- RLS policies for contact
CREATE POLICY IF NOT EXISTS contact_tenant_isolation
  ON contact
  FOR ALL
  USING (tenant_id = app.current_tenant_id())
  WITH CHECK (tenant_id = app.current_tenant_id());

-- RLS policies for invite
CREATE POLICY IF NOT EXISTS invite_tenant_isolation
  ON invite
  FOR ALL
  USING (tenant_id = app.current_tenant_id())
  WITH CHECK (tenant_id = app.current_tenant_id());


-- ============================================================
-- 9. AUDIT TRIGGERS FOR NEW TABLES
-- ============================================================

DROP TRIGGER IF EXISTS trg_audit_contact ON contact;
CREATE TRIGGER trg_audit_contact
  AFTER INSERT OR UPDATE OR DELETE ON contact
  FOR EACH ROW EXECUTE FUNCTION audit.log_row_change();

DROP TRIGGER IF EXISTS trg_audit_invite ON invite;
CREATE TRIGGER trg_audit_invite
  AFTER INSERT OR UPDATE OR DELETE ON invite
  FOR EACH ROW EXECUTE FUNCTION audit.log_row_change();


-- ============================================================
-- DONE
-- ============================================================
SELECT 'MVP schema sync v002 applied successfully' AS result;
