# QueueDesk Planning

## Overview
AI-first internal service desk SaaS for SMEs (20–500 employees).

## Tech Stack
- **Frontend**: Next.js (App Router) + TypeScript + Tailwind CSS
- **Backend**: TypeScript modular backend (same repo)
- **Database**: Supabase (PostgreSQL + Auth + Realtime) + BullMQ
- **AI**: OpenAI API (user-supplied key)
- **Email**: Resend (TBD)
- **Hosting**: Vercel (planned)
- **Repo**: GitHub (empty, ready to push)

## Architecture
- Three portals: Agent Console / Requester Portal / Admin Console
- Multi-tenant with RLS isolation
- Email intake → auto ticket creation

## Current Status
- [x] DB Migration v001 (Supabase SQL Editor — run successfully)
- [x] Product requirements documented
- [x] PostgreSQL data model complete
- [x] AI module architecture designed
- [x] Email Intake technical design complete
- [x] REST API design complete
- [x] UI/UX design spec complete
- [ ] Next.js project scaffold
- [ ] Vercel + GitHub repo connection
- [ ] Auth integration
- [ ] Agent Console pages
- [ ] Requester Portal pages
- [ ] Email Intake implementation
- [ ] AI module integration

## Database
- Supabase Project: `gdgiahevkysrdbqojwha` (Singapore, free tier)
- Project URL: `https://gdgiahevkysrdbqojwha.supabase.co`
- anon key: `sb_publishable_V9p0iZNsic1qWUtdCQJzbA_a-wxYf8S`

## Docs (in `Prepare && Planning/`)
- QueueDesk MVP PRD
- PostgreSQL data model report
- AI module architecture
- Email Intake technical design
- REST API design spec
- UI/UX design spec
- ADR draft
