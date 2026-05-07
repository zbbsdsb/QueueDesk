-- QueueDesk MVP Schema Migration v001
-- Run this via Supabase Dashboard SQL Editor: https://supabase.com/dashboard/project/gdgiahevkysrdbqojwha/sql
-- Or via: psql "postgresql://postgres:[PASSWORD]@db.gdgiahevkysrdbqojwha.supabase.com:5432/postgres" -f migrations/001_schema.sql

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE SCHEMA IF NOT EXISTS app;
CREATE SCHEMA IF NOT EXISTS audit;

-- =========
-- Session context helpers for RLS
-- =========
CREATE OR REPLACE FUNCTION app.current_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.tenant_id', true), '')::uuid
$$;

CREATE OR REPLACE FUNCTION app.current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.user_id', true), '')::uuid
$$;

CREATE OR REPLACE FUNCTION app.is_service_role()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(NULLIF(current_setting('app.service_role', true), '')::boolean, false)
$$;

CREATE OR REPLACE FUNCTION app.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION app.bump_ticket_version()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  NEW.lock_version := OLD.lock_version + 1;
  RETURN NEW;
END;
$$;

-- =========
-- Enums
-- =========
CREATE TYPE tenant_status AS ENUM ('active', 'suspended', 'deleted');
CREATE TYPE user_type AS ENUM ('human', 'bot', 'service_account');
CREATE TYPE user_status AS ENUM ('invited', 'active', 'suspended', 'deleted');

CREATE TYPE team_member_role AS ENUM ('member', 'lead', 'manager');
CREATE TYPE queue_member_role AS ENUM ('agent', 'lead', 'viewer');
CREATE TYPE queue_visibility AS ENUM ('private', 'team', 'tenant');

CREATE TYPE ticket_status AS ENUM (
  'open',
  'pending',
  'waiting_approval',
  'waiting_customer',
  'resolved',
  'closed'
);

CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE ticket_source AS ENUM ('email', 'portal', 'chat', 'api', 'system');
CREATE TYPE comment_visibility AS ENUM ('public', 'internal', 'approver_only');

CREATE TYPE sla_metric AS ENUM ('first_response', 'next_response', 'resolution');
CREATE TYPE sla_clock_state AS ENUM ('running', 'paused', 'satisfied', 'breached', 'cancelled');

CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
CREATE TYPE approval_step_status AS ENUM ('pending', 'approved', 'rejected', 'skipped', 'expired', 'cancelled');
CREATE TYPE approver_type AS ENUM ('user', 'team', 'role', 'requester_manager');
CREATE TYPE approval_mode AS ENUM ('all', 'any');

CREATE TYPE field_principal_type AS ENUM ('user', 'team', 'role');
CREATE TYPE permission_effect AS ENUM ('allow', 'deny');
CREATE TYPE field_mask_type AS ENUM ('none', 'null', 'hash', 'partial');

CREATE TYPE knowledge_article_status AS ENUM ('draft', 'published', 'archived');

CREATE TYPE ai_action_type AS ENUM (
  'classify',
  'summarize',
  'suggest_reply',
  'retrieve',
  'route',
  'approval_recommendation',
  'custom'
);

CREATE TYPE ai_action_status AS ENUM ('queued', 'running', 'succeeded', 'failed', 'cancelled');

CREATE TYPE audit_action AS ENUM ('insert', 'update', 'delete', 'soft_delete', 'restore');

-- =========
-- Core tables
-- =========
CREATE TABLE tenant (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  status tenant_status NOT NULL DEFAULT 'active',
  plan_code text,
  default_time_zone text NOT NULL DEFAULT 'UTC',
  data_region text NOT NULL DEFAULT 'primary',
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid,
  updated_by uuid,
  deleted_by uuid
);

CREATE TABLE tenant_role (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenant(id) ON DELETE RESTRICT,
  role_key text NOT NULL,
  display_name text NOT NULL,
  description text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid,
  updated_by uuid,
  deleted_by uuid,
  CONSTRAINT uq_tenant_role_tenant_id UNIQUE (tenant_id, id)
);

CREATE TABLE app_user (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenant(id) ON DELETE RESTRICT,
  external_ref text,
  auth_subject text,
  email text NOT NULL,
  display_name text NOT NULL,
  type user_type NOT NULL DEFAULT 'human',
  status user_status NOT NULL DEFAULT 'active',
  locale text NOT NULL DEFAULT 'zh-CN',
  time_zone text NOT NULL DEFAULT 'UTC',
  attributes jsonb NOT NULL DEFAULT '{}'::jsonb,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid,
  updated_by uuid,
  deleted_by uuid,
  CONSTRAINT uq_app_user_tenant_id UNIQUE (tenant_id, id)
);

CREATE TABLE team (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenant(id) ON DELETE RESTRICT,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  manager_user_id uuid,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid,
  updated_by uuid,
  deleted_by uuid,
  CONSTRAINT uq_team_tenant_id UNIQUE (tenant_id, id),
  CONSTRAINT fk_team_manager_user
    FOREIGN KEY (tenant_id, manager_user_id)
    REFERENCES app_user(tenant_id, id)
    ON DELETE RESTRICT
);

CREATE TABLE team_member (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenant(id) ON DELETE RESTRICT,
  team_id uuid NOT NULL,
  user_id uuid NOT NULL,
  membership_role team_member_role NOT NULL DEFAULT 'member',
  is_primary boolean NOT NULL DEFAULT false,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid,
  updated_by uuid,
  deleted_by uuid,
  CONSTRAINT uq_team_member_tenant_id UNIQUE (tenant_id, id),
  CONSTRAINT fk_team_member_team
    FOREIGN KEY (tenant_id, team_id)
    REFERENCES team(tenant_id, id)
    ON DELETE CASCADE,
  CONSTRAINT fk_team_member_user
    FOREIGN KEY (tenant_id, user_id)
    REFERENCES app_user(tenant_id, id)
    ON DELETE CASCADE
);

CREATE TABLE user_role_assignment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenant(id) ON DELETE RESTRICT,
  role_id uuid NOT NULL,
  user_id uuid NOT NULL,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid,
  updated_by uuid,
  deleted_by uuid,
  CONSTRAINT uq_user_role_assignment_tenant_id UNIQUE (tenant_id, id),
  CONSTRAINT fk_user_role_assignment_role
    FOREIGN KEY (tenant_id, role_id)
    REFERENCES tenant_role(tenant_id, id)
    ON DELETE CASCADE,
  CONSTRAINT fk_user_role_assignment_user
    FOREIGN KEY (tenant_id, user_id)
    REFERENCES app_user(tenant_id, id)
    ON DELETE CASCADE
);

-- =========
-- Business calendar & SLA
-- =========
CREATE TABLE business_calendar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenant(id) ON DELETE RESTRICT,
  name text NOT NULL,
  time_zone text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  description text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid,
  updated_by uuid,
  deleted_by uuid,
  CONSTRAINT uq_business_calendar_tenant_id UNIQUE (tenant_id, id)
);

CREATE TABLE business_calendar_rule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenant(id) ON DELETE RESTRICT,
  calendar_id uuid NOT NULL,
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  start_time time NOT NULL,
  end_time time NOT NULL,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid,
  updated_by uuid,
  deleted_by uuid,
  CONSTRAINT uq_business_calendar_rule_tenant_id UNIQUE (tenant_id, id),
  CONSTRAINT fk_business_calendar_rule_calendar
    FOREIGN KEY (tenant_id, calendar_id)
    REFERENCES business_calendar(tenant_id, id)
    ON DELETE CASCADE,
  CONSTRAINT ck_business_calendar_rule_time CHECK (start_time < end_time)
);

CREATE TABLE business_calendar_holiday (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenant(id) ON DELETE RESTRICT,
  calendar_id uuid NOT NULL,
  holiday_date date NOT NULL,
  holiday_name text NOT NULL,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid,
  updated_by uuid,
  deleted_by uuid,
  CONSTRAINT uq_business_calendar_holiday_tenant_id UNIQUE (tenant_id, id),
  CONSTRAINT fk_business_calendar_holiday_calendar
    FOREIGN KEY (tenant_id, calendar_id)
    REFERENCES business_calendar(tenant_id, id)
    ON DELETE CASCADE
);

CREATE TABLE business_calendar_exception (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenant(id) ON DELETE RESTRICT,
  calendar_id uuid NOT NULL,
  local_date date NOT NULL,
  is_closed boolean NOT NULL DEFAULT false,
  start_time time,
  end_time time,
  note text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid,
  updated_by uuid,
  deleted_by uuid,
  CONSTRAINT uq_business_calendar_exception_tenant_id UNIQUE (tenant_id, id),
  CONSTRAINT fk_business_calendar_exception_calendar
    FOREIGN KEY (tenant_id, calendar_id)
    REFERENCES business_calendar(tenant_id, id)
    ON DELETE CASCADE,
  CONSTRAINT ck_calendar_exception_shape CHECK (
    (is_closed = true AND start_time IS NULL AND end_time IS NULL)
    OR
    (is_closed = false AND start_time IS NOT NULL AND end_time IS NOT NULL AND start_time < end_time)
  )
);

CREATE TABLE sla_policy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenant(id) ON DELETE RESTRICT,
  name text NOT NULL,
  description text,
  business_calendar_id uuid NOT NULL,
  first_response_seconds integer CHECK (first_response_seconds IS NULL OR first_response_seconds >= 0),
  next_response_seconds integer CHECK (next_response_seconds IS NULL OR next_response_seconds >= 0),
  resolution_seconds integer CHECK (resolution_seconds IS NULL OR resolution_seconds >= 0),
  pause_on_statuses ticket_status[] NOT NULL
    DEFAULT ARRAY['pending','waiting_approval','waiting_customer']::ticket_status[],
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid,
  updated_by uuid,
  deleted_by uuid,
  CONSTRAINT uq_sla_policy_tenant_id UNIQUE (tenant_id, id),
  CONSTRAINT fk_sla_policy_calendar
    FOREIGN KEY (tenant_id, business_calendar_id)
    REFERENCES business_calendar(tenant_id, id)
    ON DELETE RESTRICT
);

-- =========
-- Approval workflow definitions
-- =========
CREATE TABLE approval_workflow (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenant(id) ON DELETE RESTRICT,
  name text NOT NULL,
  description text,
  version integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  trigger_condition jsonb NOT NULL DEFAULT '{}'::jsonb,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid,
  updated_by uuid,
  deleted_by uuid,
  CONSTRAINT uq_approval_workflow_tenant_id UNIQUE (tenant_id, id)
);

CREATE TABLE approval_step (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenant(id) ON DELETE RESTRICT,
  workflow_id uuid NOT NULL,
  step_order integer NOT NULL CHECK (step_order > 0),
  step_name text NOT NULL,
  approver_type approver_type NOT NULL,
  approver_user_id uuid,
  approver_team_id uuid,
  approver_role_key text,
  mode approval_mode NOT NULL DEFAULT 'all',
  timeout_seconds integer CHECK (timeout_seconds IS NULL OR timeout_seconds >= 0),
  conditions jsonb NOT NULL DEFAULT '{}'::jsonb,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid,
  updated_by uuid,
  deleted_by uuid,
  CONSTRAINT uq_approval_step_tenant_id UNIQUE (tenant_id, id),
  CONSTRAINT fk_approval_step_workflow
    FOREIGN KEY (tenant_id, workflow_id)
    REFERENCES approval_workflow(tenant_id, id)
    ON DELETE CASCADE,
  CONSTRAINT fk_approval_step_user
    FOREIGN KEY (tenant_id, approver_user_id)
    REFERENCES app_user(tenant_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_approval_step_team
    FOREIGN KEY (tenant_id, approver_team_id)
    REFERENCES team(tenant_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT ck_approval_step_approver CHECK (
    (approver_type = 'user' AND approver_user_id IS NOT NULL AND approver_team_id IS NULL AND approver_role_key IS NULL)
    OR
    (approver_type = 'team' AND approver_team_id IS NOT NULL AND approver_user_id IS NULL AND approver_role_key IS NULL)
    OR
    (approver_type = 'role' AND approver_role_key IS NOT NULL AND approver_user_id IS NULL AND approver_team_id IS NULL)
    OR
    (approver_type = 'requester_manager' AND approver_user_id IS NULL AND approver_team_id IS NULL AND approver_role_key IS NULL)
  )
);

-- =========
-- Queues, labels, tickets
-- =========
CREATE TABLE queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenant(id) ON DELETE RESTRICT,
  code text NOT NULL,
  name text NOT NULL,
  description text,
  visibility queue_visibility NOT NULL DEFAULT 'team',
  owner_team_id uuid,
  default_assignee_user_id uuid,
  default_sla_policy_id uuid,
  default_approval_workflow_id uuid,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid,
  updated_by uuid,
  deleted_by uuid,
  CONSTRAINT uq_queue_tenant_id UNIQUE (tenant_id, id),
  CONSTRAINT fk_queue_owner_team
    FOREIGN KEY (tenant_id, owner_team_id)
    REFERENCES team(tenant_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_queue_default_assignee
    FOREIGN KEY (tenant_id, default_assignee_user_id)
    REFERENCES app_user(tenant_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_queue_default_sla_policy
    FOREIGN KEY (tenant_id, default_sla_policy_id)
    REFERENCES sla_policy(tenant_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_queue_default_approval_workflow
    FOREIGN KEY (tenant_id, default_approval_workflow_id)
    REFERENCES approval_workflow(tenant_id, id)
    ON DELETE RESTRICT
);

CREATE TABLE queue_member (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenant(id) ON DELETE RESTRICT,
  queue_id uuid NOT NULL,
  user_id uuid NOT NULL,
  membership_role queue_member_role NOT NULL DEFAULT 'agent',
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid,
  updated_by uuid,
  deleted_by uuid,
  CONSTRAINT uq_queue_member_tenant_id UNIQUE (tenant_id, id),
  CONSTRAINT fk_queue_member_queue
    FOREIGN KEY (tenant_id, queue_id)
    REFERENCES queue(tenant_id, id)
    ON DELETE CASCADE,
  CONSTRAINT fk_queue_member_user
    FOREIGN KEY (tenant_id, user_id)
    REFERENCES app_user(tenant_id, id)
    ON DELETE CASCADE
);

CREATE TABLE label (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenant(id) ON DELETE RESTRICT,
  name text NOT NULL,
  color text,
  description text,
  is_system boolean NOT NULL DEFAULT false,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid,
  updated_by uuid,
  deleted_by uuid,
  CONSTRAINT uq_label_tenant_id UNIQUE (tenant_id, id)
);

CREATE TABLE ticket (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenant(id) ON DELETE RESTRICT,
  ticket_no bigint GENERATED ALWAYS AS IDENTITY,
  queue_id uuid NOT NULL,
  requester_user_id uuid,
  reporter_user_id uuid,
  assignee_user_id uuid,
  current_approval_id uuid,
  subject text NOT NULL,
  description text,
  status ticket_status NOT NULL DEFAULT 'open',
  priority ticket_priority NOT NULL DEFAULT 'medium',
  source ticket_source NOT NULL DEFAULT 'portal',
  channel_ref text,
  waiting_reason text,
  custom_fields jsonb NOT NULL DEFAULT '{}'::jsonb,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  search_tsv tsvector GENERATED ALWAYS AS (
    to_tsvector('simple', coalesce(subject, '') || ' ' || coalesce(description, ''))
  ) STORED,
  next_sla_breach_at timestamptz,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  first_responded_at timestamptz,
  resolved_at timestamptz,
  closed_at timestamptz,
  last_customer_reply_at timestamptz,
  last_agent_reply_at timestamptz,
  lock_version bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid,
  updated_by uuid,
  deleted_by uuid,
  CONSTRAINT uq_ticket_tenant_id UNIQUE (tenant_id, id),
  CONSTRAINT uq_ticket_tenant_ticket_no UNIQUE (tenant_id, ticket_no),
  CONSTRAINT fk_ticket_queue
    FOREIGN KEY (tenant_id, queue_id)
    REFERENCES queue(tenant_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_ticket_requester
    FOREIGN KEY (tenant_id, requester_user_id)
    REFERENCES app_user(tenant_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_ticket_reporter
    FOREIGN KEY (tenant_id, reporter_user_id)
    REFERENCES app_user(tenant_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_ticket_assignee
    FOREIGN KEY (tenant_id, assignee_user_id)
    REFERENCES app_user(tenant_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT ck_ticket_time_order CHECK (
    (resolved_at IS NULL OR resolved_at >= submitted_at)
    AND
    (closed_at IS NULL OR closed_at >= submitted_at)
  )
);

CREATE TABLE ticket_status_transition (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenant(id) ON DELETE RESTRICT,
  ticket_id uuid NOT NULL,
  from_status ticket_status,
  to_status ticket_status NOT NULL,
  changed_by uuid,
  note text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  changed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid,
  updated_by uuid,
  deleted_by uuid,
  CONSTRAINT uq_ticket_status_transition_tenant_id UNIQUE (tenant_id, id),
  CONSTRAINT fk_ticket_status_transition_ticket
    FOREIGN KEY (tenant_id, ticket_id)
    REFERENCES ticket(tenant_id, id)
    ON DELETE CASCADE,
  CONSTRAINT fk_ticket_status_transition_user
    FOREIGN KEY (tenant_id, changed_by)
    REFERENCES app_user(tenant_id, id)
    ON DELETE RESTRICT
);

CREATE TABLE ticket_comment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenant(id) ON DELETE RESTRICT,
  ticket_id uuid NOT NULL,
  author_user_id uuid,
  parent_comment_id uuid,
  visibility comment_visibility NOT NULL DEFAULT 'internal',
  body text NOT NULL,
  is_redacted boolean NOT NULL DEFAULT false,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid,
  updated_by uuid,
  deleted_by uuid,
  CONSTRAINT uq_ticket_comment_tenant_id UNIQUE (tenant_id, id),
  CONSTRAINT fk_ticket_comment_ticket
    FOREIGN KEY (tenant_id, ticket_id)
    REFERENCES ticket(tenant_id, id)
    ON DELETE CASCADE,
  CONSTRAINT fk_ticket_comment_author
    FOREIGN KEY (tenant_id, author_user_id)
    REFERENCES app_user(tenant_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_ticket_comment_parent
    FOREIGN KEY (tenant_id, parent_comment_id)
    REFERENCES ticket_comment(tenant_id, id)
    ON DELETE RESTRICT
);

CREATE TABLE knowledge_article (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenant(id) ON DELETE RESTRICT,
  author_user_id uuid,
  title text NOT NULL,
  slug text NOT NULL,
  language_code text NOT NULL DEFAULT 'zh-CN',
  status knowledge_article_status NOT NULL DEFAULT 'draft',
  summary text,
  body_markdown text,
  body_text text NOT NULL DEFAULT '',
  search_tsv tsvector GENERATED ALWAYS AS (
    to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(body_text, ''))
  ) STORED,
  embedding vector(1536),
  embedding_model text,
  embedding_updated_at timestamptz,
  published_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid,
  updated_by uuid,
  deleted_by uuid,
  CONSTRAINT uq_knowledge_article_tenant_id UNIQUE (tenant_id, id),
  CONSTRAINT fk_knowledge_article_author
    FOREIGN KEY (tenant_id, author_user_id)
    REFERENCES app_user(tenant_id, id)
    ON DELETE RESTRICT
);

CREATE TABLE attachment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenant(id) ON DELETE RESTRICT,
  ticket_id uuid,
  comment_id uuid,
  article_id uuid,
  uploaded_by uuid,
  storage_bucket text NOT NULL,
  object_key text NOT NULL,
  file_name text NOT NULL,
  content_type text,
  byte_size bigint NOT NULL CHECK (byte_size >= 0),
  checksum_sha256 text,
  is_inline boolean NOT NULL DEFAULT false,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid,
  updated_by uuid,
  deleted_by uuid,
  CONSTRAINT uq_attachment_tenant_id UNIQUE (tenant_id, id),
  CONSTRAINT fk_attachment_ticket
    FOREIGN KEY (tenant_id, ticket_id)
    REFERENCES ticket(tenant_id, id)
    ON DELETE CASCADE,
  CONSTRAINT fk_attachment_comment
    FOREIGN KEY (tenant_id, comment_id)
    REFERENCES ticket_comment(tenant_id, id)
    ON DELETE CASCADE,
  CONSTRAINT fk_attachment_article
    FOREIGN KEY (tenant_id, article_id)
    REFERENCES knowledge_article(tenant_id, id)
    ON DELETE CASCADE,
  CONSTRAINT fk_attachment_uploaded_by
    FOREIGN KEY (tenant_id, uploaded_by)
    REFERENCES app_user(tenant_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT ck_attachment_parent CHECK (num_nonnulls(ticket_id, comment_id, article_id) = 1)
);

CREATE TABLE ticket_label (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenant(id) ON DELETE RESTRICT,
  ticket_id uuid NOT NULL,
  label_id uuid NOT NULL,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid,
  updated_by uuid,
  deleted_by uuid,
  CONSTRAINT uq_ticket_label_tenant_id UNIQUE (tenant_id, id),
  CONSTRAINT fk_ticket_label_ticket
    FOREIGN KEY (tenant_id, ticket_id)
    REFERENCES ticket(tenant_id, id)
    ON DELETE CASCADE,
  CONSTRAINT fk_ticket_label_label
    FOREIGN KEY (tenant_id, label_id)
    REFERENCES label(tenant_id, id)
    ON DELETE CASCADE
);

CREATE TABLE ticket_sla_clock (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenant(id) ON DELETE RESTRICT,
  ticket_id uuid NOT NULL,
  policy_id uuid NOT NULL,
  business_calendar_id uuid NOT NULL,
  metric sla_metric NOT NULL,
  target_seconds integer NOT NULL CHECK (target_seconds >= 0),
  state sla_clock_state NOT NULL DEFAULT 'running',
  started_at timestamptz NOT NULL DEFAULT now(),
  last_resumed_at timestamptz NOT NULL DEFAULT now(),
  paused_at timestamptz,
  consumed_seconds bigint NOT NULL DEFAULT 0 CHECK (consumed_seconds >= 0),
  due_at timestamptz,
  breached_at timestamptz,
  satisfied_at timestamptz,
  snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid,
  updated_by uuid,
  deleted_by uuid,
  CONSTRAINT uq_ticket_sla_clock_tenant_id UNIQUE (tenant_id, id),
  CONSTRAINT uq_ticket_sla_clock_ticket_metric UNIQUE (tenant_id, ticket_id, metric),
  CONSTRAINT fk_ticket_sla_clock_ticket
    FOREIGN KEY (tenant_id, ticket_id)
    REFERENCES ticket(tenant_id, id)
    ON DELETE CASCADE,
  CONSTRAINT fk_ticket_sla_clock_policy
    FOREIGN KEY (tenant_id, policy_id)
    REFERENCES sla_policy(tenant_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_ticket_sla_clock_calendar
    FOREIGN KEY (tenant_id, business_calendar_id)
    REFERENCES business_calendar(tenant_id, id)
    ON DELETE RESTRICT
);

CREATE TABLE ticket_sla_pause_segment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenant(id) ON DELETE RESTRICT,
  ticket_sla_clock_id uuid NOT NULL,
  pause_status ticket_status,
  pause_start_at timestamptz NOT NULL,
  resumed_at timestamptz,
  note text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid,
  updated_by uuid,
  deleted_by uuid,
  CONSTRAINT uq_ticket_sla_pause_segment_tenant_id UNIQUE (tenant_id, id),
  CONSTRAINT fk_ticket_sla_pause_segment_clock
    FOREIGN KEY (tenant_id, ticket_sla_clock_id)
    REFERENCES ticket_sla_clock(tenant_id, id)
    ON DELETE CASCADE,
  CONSTRAINT ck_ticket_sla_pause_segment_time CHECK (
    resumed_at IS NULL OR resumed_at >= pause_start_at
  )
);

CREATE TABLE ticket_approval (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenant(id) ON DELETE RESTRICT,
  ticket_id uuid NOT NULL,
  workflow_id uuid NOT NULL,
  status approval_status NOT NULL DEFAULT 'pending',
  current_step_order integer,
  requested_by uuid,
  requested_at timestamptz NOT NULL DEFAULT now(),
  decided_at timestamptz,
  final_decider_user_id uuid,
  reason text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid,
  updated_by uuid,
  deleted_by uuid,
  CONSTRAINT uq_ticket_approval_tenant_id UNIQUE (tenant_id, id),
  CONSTRAINT fk_ticket_approval_ticket
    FOREIGN KEY (tenant_id, ticket_id)
    REFERENCES ticket(tenant_id, id)
    ON DELETE CASCADE,
  CONSTRAINT fk_ticket_approval_workflow
    FOREIGN KEY (tenant_id, workflow_id)
    REFERENCES approval_workflow(tenant_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_ticket_approval_requested_by
    FOREIGN KEY (tenant_id, requested_by)
    REFERENCES app_user(tenant_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_ticket_approval_final_decider
    FOREIGN KEY (tenant_id, final_decider_user_id)
    REFERENCES app_user(tenant_id, id)
    ON DELETE RESTRICT
);

CREATE TABLE ticket_approval_step (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenant(id) ON DELETE RESTRICT,
  ticket_approval_id uuid NOT NULL,
  workflow_step_id uuid NOT NULL,
  step_order integer NOT NULL,
  approver_user_id uuid,
  approver_team_id uuid,
  status approval_step_status NOT NULL DEFAULT 'pending',
  decided_by uuid,
  decided_at timestamptz,
  comment text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid,
  updated_by uuid,
  deleted_by uuid,
  CONSTRAINT uq_ticket_approval_step_tenant_id UNIQUE (tenant_id, id),
  CONSTRAINT fk_ticket_approval_step_approval
    FOREIGN KEY (tenant_id, ticket_approval_id)
    REFERENCES ticket_approval(tenant_id, id)
    ON DELETE CASCADE,
  CONSTRAINT fk_ticket_approval_step_workflow_step
    FOREIGN KEY (tenant_id, workflow_step_id)
    REFERENCES approval_step(tenant_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_ticket_approval_step_approver_user
    FOREIGN KEY (tenant_id, approver_user_id)
    REFERENCES app_user(tenant_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_ticket_approval_step_approver_team
    FOREIGN KEY (tenant_id, approver_team_id)
    REFERENCES team(tenant_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_ticket_approval_step_decided_by
    FOREIGN KEY (tenant_id, decided_by)
    REFERENCES app_user(tenant_id, id)
    ON DELETE RESTRICT
);

ALTER TABLE ticket
  ADD CONSTRAINT fk_ticket_current_approval
  FOREIGN KEY (tenant_id, current_approval_id)
  REFERENCES ticket_approval(tenant_id, id)
  ON DELETE RESTRICT;

CREATE TABLE field_permission (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenant(id) ON DELETE RESTRICT,
  resource_name text NOT NULL,
  field_name text NOT NULL,
  principal_type field_principal_type NOT NULL,
  principal_id uuid,
  role_key text,
  effect permission_effect NOT NULL DEFAULT 'allow',
  can_read boolean NOT NULL DEFAULT true,
  can_write boolean NOT NULL DEFAULT false,
  mask_type field_mask_type NOT NULL DEFAULT 'none',
  condition_expr text,
  priority integer NOT NULL DEFAULT 100,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid,
  updated_by uuid,
  deleted_by uuid,
  CONSTRAINT uq_field_permission_tenant_id UNIQUE (tenant_id, id),
  CONSTRAINT ck_field_permission_principal CHECK (
    (principal_type = 'role' AND principal_id IS NULL AND role_key IS NOT NULL)
    OR
    (principal_type IN ('user','team') AND principal_id IS NOT NULL AND role_key IS NULL)
  )
);

CREATE TABLE ai_action (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenant(id) ON DELETE RESTRICT,
  ticket_id uuid,
  article_id uuid,
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  action_type ai_action_type NOT NULL,
  status ai_action_status NOT NULL DEFAULT 'queued',
  provider text,
  model_name text,
  prompt_version text,
  input_text text,
  output_text text,
  input_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  output_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  embedding vector(1536),
  input_tokens integer CHECK (input_tokens IS NULL OR input_tokens >= 0),
  output_tokens integer CHECK (output_tokens IS NULL OR output_tokens >= 0),
  latency_ms integer CHECK (latency_ms IS NULL OR latency_ms >= 0),
  cost_usd numeric(12, 6) CHECK (cost_usd IS NULL OR cost_usd >= 0),
  requested_by uuid,
  completed_at timestamptz,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid,
  updated_by uuid,
  deleted_by uuid,
  CONSTRAINT uq_ai_action_tenant_id UNIQUE (tenant_id, id),
  CONSTRAINT fk_ai_action_ticket
    FOREIGN KEY (tenant_id, ticket_id)
    REFERENCES ticket(tenant_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_ai_action_article
    FOREIGN KEY (tenant_id, article_id)
    REFERENCES knowledge_article(tenant_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_ai_action_requested_by
    FOREIGN KEY (tenant_id, requested_by)
    REFERENCES app_user(tenant_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT ck_ai_action_target_parent CHECK (num_nonnulls(ticket_id, article_id) <= 1)
);

-- =========
-- Baseline indexes
-- =========
CREATE UNIQUE INDEX ux_tenant_role_key_active
  ON tenant_role (tenant_id, role_key)
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX ux_app_user_email_active
  ON app_user (tenant_id, lower(email))
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX ux_app_user_auth_subject_active
  ON app_user (tenant_id, auth_subject)
  WHERE auth_subject IS NOT NULL AND deleted_at IS NULL;

CREATE UNIQUE INDEX ux_team_slug_active
  ON team (tenant_id, slug)
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX ux_team_member_active
  ON team_member (tenant_id, team_id, user_id)
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX ux_user_role_assignment_active
  ON user_role_assignment (tenant_id, role_id, user_id)
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX ux_business_calendar_default_active
  ON business_calendar (tenant_id)
  WHERE is_default = true AND deleted_at IS NULL;

CREATE UNIQUE INDEX ux_business_calendar_rule_active
  ON business_calendar_rule (tenant_id, calendar_id, day_of_week, start_time, end_time)
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX ux_business_calendar_holiday_active
  ON business_calendar_holiday (tenant_id, calendar_id, holiday_date)
  WHERE deleted_at IS NULL;

CREATE INDEX ix_business_calendar_exception_lookup
  ON business_calendar_exception (tenant_id, calendar_id, local_date, is_closed)
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX ux_sla_policy_name_active
  ON sla_policy (tenant_id, name)
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX ux_approval_workflow_name_version_active
  ON approval_workflow (tenant_id, name, version)
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX ux_approval_step_order_active
  ON approval_step (tenant_id, workflow_id, step_order)
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX ux_queue_code_active
  ON queue (tenant_id, code)
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX ux_queue_member_active
  ON queue_member (tenant_id, queue_id, user_id)
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX ux_label_name_active
  ON label (tenant_id, name)
  WHERE deleted_at IS NULL;

CREATE INDEX ix_ticket_queue_status_created
  ON ticket (tenant_id, queue_id, status, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX ix_ticket_assignee_status_updated
  ON ticket (tenant_id, assignee_user_id, status, updated_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX ix_ticket_next_breach_active
  ON ticket (tenant_id, next_sla_breach_at, created_at DESC)
  WHERE deleted_at IS NULL
    AND status IN ('open', 'pending', 'waiting_approval', 'waiting_customer');

CREATE INDEX ix_ticket_queue_status_cover
  ON ticket (tenant_id, queue_id, status, next_sla_breach_at, created_at DESC)
  INCLUDE (ticket_no, priority, assignee_user_id, requester_user_id, subject)
  WHERE deleted_at IS NULL;

CREATE INDEX ix_ticket_search_tsv
  ON ticket USING GIN (search_tsv)
  WHERE deleted_at IS NULL;

CREATE INDEX ix_ticket_subject_trgm
  ON ticket USING GIN (subject gin_trgm_ops)
  WHERE deleted_at IS NULL;

CREATE INDEX ix_ticket_status_transition_ticket_time
  ON ticket_status_transition (tenant_id, ticket_id, changed_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX ix_ticket_comment_ticket_time
  ON ticket_comment (tenant_id, ticket_id, created_at ASC)
  WHERE deleted_at IS NULL;

CREATE INDEX ix_attachment_ticket
  ON attachment (tenant_id, ticket_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX ix_attachment_comment
  ON attachment (tenant_id, comment_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX ix_attachment_article
  ON attachment (tenant_id, article_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX ux_ticket_label_active
  ON ticket_label (tenant_id, ticket_id, label_id)
  WHERE deleted_at IS NULL;

CREATE INDEX ix_ticket_sla_clock_due_active
  ON ticket_sla_clock (tenant_id, state, due_at)
  WHERE deleted_at IS NULL
    AND state = 'running';

CREATE INDEX ix_ticket_sla_clock_ticket
  ON ticket_sla_clock (tenant_id, ticket_id, metric)
  WHERE deleted_at IS NULL;

CREATE INDEX ix_ticket_sla_pause_segment_clock
  ON ticket_sla_pause_segment (tenant_id, ticket_sla_clock_id, pause_start_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX ix_ticket_approval_ticket_status
  ON ticket_approval (tenant_id, ticket_id, status, requested_at DESC)
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX ux_ticket_approval_step_order_active
  ON ticket_approval_step (tenant_id, ticket_approval_id, step_order)
  WHERE deleted_at IS NULL;

CREATE INDEX ix_field_permission_lookup
  ON field_permission (tenant_id, resource_name, field_name, principal_type, priority DESC)
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX ux_knowledge_article_slug_active
  ON knowledge_article (tenant_id, slug)
  WHERE deleted_at IS NULL;

CREATE INDEX ix_knowledge_article_search_tsv
  ON knowledge_article USING GIN (search_tsv)
  WHERE deleted_at IS NULL
    AND status = 'published';

CREATE INDEX ix_knowledge_article_title_trgm
  ON knowledge_article USING GIN (title gin_trgm_ops)
  WHERE deleted_at IS NULL;

CREATE INDEX ix_ai_action_target
  ON ai_action (tenant_id, target_type, target_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX ix_ai_action_status_created
  ON ai_action (tenant_id, status, created_at DESC)
  WHERE deleted_at IS NULL;

-- =========
-- Audit log: append-only, partitioned
-- =========
CREATE TABLE audit.audit_log (
  audit_id bigint GENERATED ALWAYS AS IDENTITY,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  tenant_id uuid,
  actor_user_id uuid,
  db_role name NOT NULL DEFAULT session_user,
  txid bigint NOT NULL DEFAULT txid_current(),
  trace_id text,
  request_id uuid,
  client_addr inet,
  user_agent text,
  action audit_action NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  entity_pk jsonb NOT NULL DEFAULT '{}'::jsonb,
  changed_fields text[] NOT NULL DEFAULT ARRAY[]::text[],
  before_data jsonb,
  after_data jsonb,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  prev_row_hash bytea,
  row_hash bytea NOT NULL,
  hmac_sig bytea,
  PRIMARY KEY (occurred_at, audit_id)
) PARTITION BY RANGE (occurred_at);

CREATE TABLE audit.audit_log_default
  PARTITION OF audit.audit_log DEFAULT;

CREATE INDEX ix_audit_log_tenant_time
  ON audit.audit_log (tenant_id, occurred_at DESC);

CREATE INDEX ix_audit_log_entity_time
  ON audit.audit_log (tenant_id, entity_type, entity_id, occurred_at DESC);

CREATE INDEX ix_audit_log_action_time
  ON audit.audit_log (tenant_id, action, occurred_at DESC);

CREATE INDEX ix_audit_log_default_brin_time
  ON audit.audit_log_default USING BRIN (occurred_at);

CREATE OR REPLACE FUNCTION audit.jsonb_changed_keys(p_old jsonb, p_new jsonb)
RETURNS text[]
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT COALESCE(array_agg(k ORDER BY k), ARRAY[]::text[])
  FROM (
    SELECT keys.key AS k
    FROM jsonb_object_keys(COALESCE(p_old, '{}'::jsonb) || COALESCE(p_new, '{}'::jsonb)) AS keys(key)
    WHERE COALESCE(p_old -> keys.key, 'null'::jsonb) IS DISTINCT FROM COALESCE(p_new -> keys.key, 'null'::jsonb)
  ) s
$$;

CREATE OR REPLACE FUNCTION audit.log_row_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, app, audit
AS $$
DECLARE
  v_old jsonb;
  v_new jsonb;
  v_tenant uuid;
  v_entity_id uuid;
  v_action audit_action;
  v_payload jsonb;
  v_prev bytea;
  v_request_id uuid;
BEGIN
  IF TG_TABLE_SCHEMA = 'audit' THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  v_old := CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) END;
  v_new := CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) END;

  v_tenant := COALESCE((v_new ->> 'tenant_id')::uuid, (v_old ->> 'tenant_id')::uuid);
  v_entity_id := COALESCE((v_new ->> 'id')::uuid, (v_old ->> 'id')::uuid);
  v_request_id := NULLIF(current_setting('app.request_id', true), '')::uuid;

  v_action := CASE
    WHEN TG_OP = 'INSERT' THEN 'insert'
    WHEN TG_OP = 'DELETE' THEN 'delete'
    WHEN TG_OP = 'UPDATE' AND (v_old ? 'deleted_at') AND (v_old ->> 'deleted_at') IS NULL AND (v_new ->> 'deleted_at') IS NOT NULL THEN 'soft_delete'
    WHEN TG_OP = 'UPDATE' AND (v_old ? 'deleted_at') AND (v_old ->> 'deleted_at') IS NOT NULL AND (v_new ->> 'deleted_at') IS NULL THEN 'restore'
    ELSE 'update'
  END;

  v_payload := jsonb_build_object(
    'schema', TG_TABLE_SCHEMA,
    'table', TG_TABLE_NAME,
    'op', TG_OP,
    'tenant_id', v_tenant,
    'actor_user_id', app.current_user_id(),
    'before', v_old,
    'after', v_new,
    'changed_fields', audit.jsonb_changed_keys(v_old, v_new),
    'timestamp', now()
  );

  PERFORM pg_advisory_xact_lock(hashtextextended(COALESCE(v_tenant::text, 'system'), 0));

  SELECT row_hash
    INTO v_prev
  FROM audit.audit_log
  WHERE tenant_id IS NOT DISTINCT FROM v_tenant
  ORDER BY occurred_at DESC, audit_id DESC
  LIMIT 1;

  INSERT INTO audit.audit_log (
    tenant_id,
    actor_user_id,
    trace_id,
    request_id,
    client_addr,
    user_agent,
    action,
    entity_type,
    entity_id,
    entity_pk,
    changed_fields,
    before_data,
    after_data,
    payload,
    prev_row_hash,
    row_hash,
    hmac_sig
  )
  VALUES (
    v_tenant,
    app.current_user_id(),
    current_setting('app.trace_id', true),
    v_request_id,
    inet_client_addr(),
    current_setting('app.user_agent', true),
    v_action,
    TG_TABLE_NAME,
    v_entity_id,
    jsonb_build_object('tenant_id', v_tenant, 'id', v_entity_id),
    audit.jsonb_changed_keys(v_old, v_new),
    v_old,
    v_new,
    v_payload,
    v_prev,
    digest(COALESCE(encode(v_prev, 'hex'), '') || v_payload::text, 'sha256'),
    CASE
      WHEN NULLIF(current_setting('app.audit_hmac_key', true), '') IS NULL THEN NULL
      ELSE hmac(
        COALESCE(encode(v_prev, 'hex'), '') || v_payload::text,
        current_setting('app.audit_hmac_key', true),
        'sha256'
      )
    END
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION audit.raise_immutable()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'audit.audit_log is append-only';
END;
$$;

CREATE TRIGGER trg_audit_log_immutable
  BEFORE UPDATE OR DELETE
  ON audit.audit_log
  FOR EACH ROW
  EXECUTE FUNCTION audit.raise_immutable();

-- =========
-- Triggers
-- =========
CREATE OR REPLACE FUNCTION app.log_ticket_status_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO ticket_status_transition (
      tenant_id,
      ticket_id,
      from_status,
      to_status,
      changed_by,
      note,
      meta,
      created_by,
      updated_by
    )
    VALUES (
      NEW.tenant_id,
      NEW.id,
      OLD.status,
      NEW.status,
      app.current_user_id(),
      current_setting('app.status_note', true),
      '{}'::jsonb,
      app.current_user_id(),
      app.current_user_id()
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_ticket_bump_version
  BEFORE UPDATE
  ON ticket
  FOR EACH ROW
  EXECUTE FUNCTION app.bump_ticket_version();

CREATE TRIGGER trg_ticket_status_transition
  AFTER UPDATE OF status
  ON ticket
  FOR EACH ROW
  EXECUTE FUNCTION app.log_ticket_status_transition();

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'tenant',
    'tenant_role',
    'app_user',
    'team',
    'team_member',
    'user_role_assignment',
    'business_calendar',
    'business_calendar_rule',
    'business_calendar_holiday',
    'business_calendar_exception',
    'sla_policy',
    'approval_workflow',
    'approval_step',
    'queue',
    'queue_member',
    'label',
    'ticket_status_transition',
    'ticket_comment',
    'knowledge_article',
    'attachment',
    'ticket_label',
    'ticket_sla_clock',
    'ticket_sla_pause_segment',
    'ticket_approval',
    'ticket_approval_step',
    'field_permission',
    'ai_action'
  ]
  LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%I_set_updated_at
         BEFORE UPDATE ON public.%I
         FOR EACH ROW
         EXECUTE FUNCTION app.set_updated_at();',
      t, t
    );
  END LOOP;
END $$;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'tenant_role',
    'app_user',
    'team',
    'team_member',
    'user_role_assignment',
    'business_calendar',
    'business_calendar_rule',
    'business_calendar_holiday',
    'business_calendar_exception',
    'sla_policy',
    'approval_workflow',
    'approval_step',
    'queue',
    'queue_member',
    'label',
    'ticket',
    'ticket_status_transition',
    'ticket_comment',
    'knowledge_article',
    'attachment',
    'ticket_label',
    'ticket_sla_clock',
    'ticket_sla_pause_segment',
    'ticket_approval',
    'ticket_approval_step',
    'field_permission',
    'ai_action'
  ]
  LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_audit_%I
         AFTER INSERT OR UPDATE OR DELETE
         ON public.%I
         FOR EACH ROW
         EXECUTE FUNCTION audit.log_row_change();',
      t, t
    );
  END LOOP;
END $$;

-- =========
-- RLS
-- =========
ALTER TABLE tenant ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation
  ON tenant
  FOR ALL
  USING (id = app.current_tenant_id())
  WITH CHECK (id = app.current_tenant_id());

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'tenant_role',
    'app_user',
    'team',
    'team_member',
    'user_role_assignment',
    'business_calendar',
    'business_calendar_rule',
    'business_calendar_holiday',
    'business_calendar_exception',
    'sla_policy',
    'approval_workflow',
    'approval_step',
    'queue',
    'queue_member',
    'label',
    'ticket',
    'ticket_status_transition',
    'ticket_comment',
    'knowledge_article',
    'attachment',
    'ticket_label',
    'ticket_sla_clock',
    'ticket_sla_pause_segment',
    'ticket_approval',
    'ticket_approval_step',
    'field_permission',
    'ai_action'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY;', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I
         FOR ALL
         USING (tenant_id = app.current_tenant_id())
         WITH CHECK (tenant_id = app.current_tenant_id());',
      t || '_tenant_policy',
      t
    );
  END LOOP;
END $$;

ALTER TABLE audit.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit.audit_log FORCE ROW LEVEL SECURITY;

CREATE POLICY audit_log_select_policy
  ON audit.audit_log
  FOR SELECT
  USING (
    app.is_service_role()
    OR tenant_id = app.current_tenant_id()
  );

CREATE POLICY audit_log_insert_policy
  ON audit.audit_log
  FOR INSERT
  WITH CHECK (true);

REVOKE UPDATE, DELETE ON audit.audit_log FROM PUBLIC;
REVOKE UPDATE, DELETE ON audit.audit_log_default FROM PUBLIC;

COMMIT;
