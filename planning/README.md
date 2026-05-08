# QueueDesk — Project Status

## Current Version: MVP v0.2

Last updated: 2026-05-08

---

## Status Overview

| Module | Status | Notes |
|--------|--------|-------|
| DB Schema + Migration | ✅ Done | v001 applied to Supabase |
| Auth (Login/Register) | ✅ Done | Supabase Auth + email |
| Route Scaffold | ✅ Done | 22 routes, all build clean |
| Agent Tickets List | ✅ Done | Real Supabase queries |
| Agent Ticket Detail | ✅ Done | Status transitions + comments |
| Requester New Ticket | ✅ Done | Supabase insert + validation |
| Email Intake Webhook | ✅ Done | `/api/email/intake` |
| Agent Dashboard | ✅ Done | Recharts + real user in sidebar |
| Admin Console | ⬜ TODO | Pages exist as stubs |
| Agent Queues Page | ⬜ TODO | Needs real Supabase queries |
| Knowledge Base | ⬜ TODO | Needs real Supabase queries |
| Resend Email Config | ⬜ TODO | Set up Resend domain + webhook |
| Vercel Deployment | ⬜ TODO | Connect to GitHub, deploy |

---

## Architecture

```
src/
├── app/
│   ├── (marketing)/         Landing Page + register CTA
│   ├── (auth)/              Login / Register / Invite token
│   ├── (app)/app/           Requester Portal
│   │   ├── tickets/         My tickets list
│   │   ├── new/             Submit new request
│   │   └── profile/         User settings
│   ├── (agent)/agent/       Agent Console
│   │   ├── dashboard/       Stats + charts
│   │   ├── tickets/         Tickets list + detail
│   │   ├── queues/          Queue management
│   │   └── knowledge/       Knowledge base
│   ├── (admin)/admin/       Admin Console (stubs)
│   │   ├── users/teams/roles/
│   │   ├── queues/sla/approvals/
│   │   └── settings/
│   └── api/email/intake/    Email webhook (Resend compatible)
├── components/
│   ├── agent/               TicketsTable, TicketDetail
│   ├── providers/          AuthProvider
│   └── shared/             AgentShell, AppShell, AdminShell
└── lib/
    ├── supabase/            client, server, middleware, types
    └── types.ts             Full domain types + status configs
```

---

## Next Steps (Priority Order)

1. **Set up Resend** — configure inbound email domain + webhook URL → `/api/email/intake`
2. **Requester Tickets List** — `src/app/(app)/app/tickets/page.tsx` (My Requests)
3. **Admin Console** — users, teams, queues CRUD
4. **Vercel Deployment** — connect repo, set env vars, deploy
5. **Supabase Invites** — `invite/[token]` page to accept invites

---

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=https://gdgiahevkysrdbqojwha.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_V9p0iZNsic1qWUtdCQJzbA_a-wxYf8S
# (DB password: user-managed, not in repo)
RESEND_WEBHOOK_SECRET=  # set after Resend setup
```
