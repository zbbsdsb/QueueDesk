-- ============================================================
-- QueueDesk — Initial Schema Migration
-- Generated from src/lib/supabase/types.ts
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. tenants
-- ============================================================
create table if not exists public.tenant (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  status text not null check (status in ('active','suspended','trial')) default 'trial',
  settings jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- Soft-delete index
create index if not exists idx_tenant_deleted_at on public.tenant (deleted_at);

-- Enable RLS
alter table public.tenant enable row level security;

-- ============================================================
-- 2. app_user
-- ============================================================
create table if not exists public.app_user (
  id uuid primary key references auth.users (id) on delete cascade,
  tenant_id uuid not null references public.tenant (id) on delete cascade,
  email text not null unique,
  display_name text,
  avatar_url text,
  role text not null check (role in ('owner','admin','agent','requester')) default 'requester',
  status text not null check (status in ('active','invited','disabled')) default 'invited',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists idx_app_user_tenant on public.app_user (tenant_id);
create index if not exists idx_app_user_email on public.app_user (email);
create index if not exists idx_app_user_deleted_at on public.app_user (deleted_at);

alter table public.app_user enable row level security;

-- ============================================================
-- 3. team
-- ============================================================
create table if not exists public.team (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenant (id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  lead_user_id uuid references public.app_user (id) on delete set null,
  status text not null check (status in ('active','paused','archived')) default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (tenant_id, slug)
);

create index if not exists idx_team_tenant on public.team (tenant_id);
create index if not exists idx_team_deleted_at on public.team (deleted_at);

alter table public.team enable row level security;

-- ============================================================
-- 4. queue
-- ============================================================
create table if not exists public.queue (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenant (id) on delete cascade,
  team_id uuid references public.team (id) on delete set null,
  name text not null,
  slug text not null,
  description text,
  default_priority text not null check (default_priority in ('low','normal','high','urgent')) default 'normal',
  routing_mode text not null check (routing_mode in ('manual','round_robin','skill_based')) default 'manual',
  visibility text not null check (visibility in ('internal','restricted')) default 'internal',
  status text not null check (status in ('active','paused','archived')) default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (tenant_id, slug)
);

create index if not exists idx_queue_tenant on public.queue (tenant_id);
create index if not exists idx_queue_team on public.queue (team_id);
create index if not exists idx_queue_deleted_at on public.queue (deleted_at);

alter table public.queue enable row level security;

-- ============================================================
-- 5. sla_policy
-- ============================================================
create table if not exists public.sla_policy (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenant (id) on delete cascade,
  name text not null,
  description text,
  first_response_target_minutes int not null default 240,
  resolution_target_minutes int not null default 1440,
  pause_on_statuses text[] not null default array['pending_customer','pending_approval'],
  business_hours jsonb,
  status text not null check (status in ('active','archived')) default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (tenant_id, name)
);

create index if not exists idx_sla_policy_tenant on public.sla_policy (tenant_id);
create index if not exists idx_sla_policy_deleted_at on public.sla_policy (deleted_at);

alter table public.sla_policy enable row level security;

-- ============================================================
-- 6. ticket
-- ============================================================
create table if not exists public.ticket (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenant (id) on delete cascade,
  queue_id uuid not null references public.queue (id) on delete restrict,
  requester_id uuid not null references public.app_user (id) on delete restrict,
  assigned_agent_id uuid references public.app_user (id) on delete set null,
  status text not null check (status in ('open','in_progress','pending_approval','pending_customer','resolved','closed','cancelled')) default 'open',
  priority text not null check (priority in ('low','normal','high','urgent')) default 'normal',
  subject text not null,
  description text,
  lock_version int not null default 1,
  sla_deadline timestamptz,
  breach_notified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists idx_ticket_tenant on public.ticket (tenant_id);
create index if not exists idx_ticket_queue on public.ticket (queue_id);
create index if not exists idx_ticket_requester on public.ticket (requester_id);
create index if not exists idx_ticket_assigned on public.ticket (assigned_agent_id);
create index if not exists idx_ticket_status on public.ticket (status);
create index if not exists idx_ticket_created_at on public.ticket (created_at desc);
create index if not exists idx_ticket_deleted_at on public.ticket (deleted_at);
-- Partial index: active tickets only (most common query)
create index if not exists idx_ticket_active on public.ticket (tenant_id, status)
  where deleted_at is null and status not in ('resolved','closed','cancelled');

alter table public.ticket enable row level security;

-- ============================================================
-- 7. contact (email-to-ticket contacts)
-- ============================================================
create table if not exists public.contact (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenant (id) on delete cascade,
  email text not null,
  display_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (tenant_id, email)
);

create index if not exists idx_contact_tenant on public.contact (tenant_id);
create index if not exists idx_contact_email on public.contact (email);
create index if not exists idx_contact_deleted_at on public.contact (deleted_at);

alter table public.contact enable row level security;

-- ============================================================
-- 8. ticket_comment
-- ============================================================
create table if not exists public.ticket_comment (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenant (id) on delete cascade,
  ticket_id uuid not null references public.ticket (id) on delete cascade,
  author_id uuid not null references public.app_user (id) on delete restrict,
  author_type text not null check (author_type in ('user','contact','system')) default 'user',
  visibility text not null check (visibility in ('public','internal')) default 'public',
  body text not null,
  status text not null check (status in ('published','edited','redacted')) default 'published',
  mentions uuid[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists idx_ticket_comment_tenant on public.ticket_comment (tenant_id);
create index if not exists idx_ticket_comment_ticket on public.ticket_comment (ticket_id);
create index if not exists idx_ticket_comment_author on public.ticket_comment (author_id);
create index if not exists idx_ticket_comment_deleted_at on public.ticket_comment (deleted_at);

alter table public.ticket_comment enable row level security;

-- ============================================================
-- 9. invite
-- ============================================================
create table if not exists public.invite (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenant (id) on delete cascade,
  email text not null,
  role text not null check (role in ('owner','admin','agent','requester')) default 'agent',
  token text not null unique,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_invite_tenant on public.invite (tenant_id);
create index if not exists idx_invite_email on public.invite (email);
create index if not exists idx_invite_token on public.invite (token);

alter table public.invite enable row level security;

-- ============================================================
-- RLS Policies — tenant isolation (all tables)
-- ============================================================
-- Tenant users can only see rows where tenant_id matches their JWT claim.
-- These are placeholder policies; adjust to match your auth schema.

-- Helper: get current tenant_id from JWT
create or replace function public.get_current_tenant_id()
returns uuid
language sql stable
as $$
  select nullif(current_setting('request.jwt.claims.tenant_id', true), '')::uuid;
$$;

-- tenant: owners/admins only
create policy tenant_isolation on public.tenant
  for all using (id = public.get_current_tenant_id());

-- app_user
create policy tenant_isolation on public.app_user
  for all using (tenant_id = public.get_current_tenant_id());

-- team
create policy tenant_isolation on public.team
  for all using (tenant_id = public.get_current_tenant_id());

-- queue
create policy tenant_isolation on public.queue
  for all using (tenant_id = public.get_current_tenant_id());

-- sla_policy
create policy tenant_isolation on public.sla_policy
  for all using (tenant_id = public.get_current_tenant_id());

-- ticket
create policy tenant_isolation on public.ticket
  for all using (tenant_id = public.get_current_tenant_id());

-- contact
create policy tenant_isolation on public.contact
  for all using (tenant_id = public.get_current_tenant_id());

-- ticket_comment
create policy tenant_isolation on public.ticket_comment
  for all using (tenant_id = public.get_current_tenant_id());

-- invite
create policy tenant_isolation on public.invite
  for all using (tenant_id = public.get_current_tenant_id());

-- ============================================================
-- Updated_at trigger (all tables)
-- ============================================================
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger trg_tenant_updated_at before update on public.tenant
  for each row execute function public.touch_updated_at();
create or replace trigger trg_app_user_updated_at before update on public.app_user
  for each row execute function public.touch_updated_at();
create or replace trigger trg_team_updated_at before update on public.team
  for each row execute function public.touch_updated_at();
create or replace trigger trg_queue_updated_at before update on public.queue
  for each row execute function public.touch_updated_at();
create or replace trigger trg_sla_policy_updated_at before update on public.sla_policy
  for each row execute function public.touch_updated_at();
create or replace trigger trg_ticket_updated_at before update on public.ticket
  for each row execute function public.touch_updated_at();
create or replace trigger trg_contact_updated_at before update on public.contact
  for each row execute function public.touch_updated_at();
create or replace trigger trg_ticket_comment_updated_at before update on public.ticket_comment
  for each row execute function public.touch_updated_at();

-- ============================================================
-- Seed: demo tenant + admin user (replace with real_ids after signup)
-- ============================================================
-- These rows are commented out; uncomment and replace the UUIDs
-- after you create your first user via Supabase Auth.
--
-- insert into public.tenant (id, name, slug, status)
-- values ('11111111-1111-1111-1111-111111111111', 'Demo Workspace', 'demo', 'trial');
--
-- insert into public.app_user (id, tenant_id, email, display_name, role, status)
-- values ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'admin@queuedesk.local', 'Admin', 'owner', 'active');
