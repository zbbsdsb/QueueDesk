# QueueDesk MVP 功能补全计划 - Product Requirement Document

## Overview
- **Summary**: Complete all remaining features for QueueDesk MVP to meet PRD Must Have requirements, including core P0 features (approval workflow, AI assistance), P1 features (SLA UI, public ticket view, audit log, ticket reassignment), and frontend quality improvements.
- **Purpose**: Deliver a production-ready MVP that meets all initial product requirements.
- **Target Users**: Agents, administrators, requesters.

## Goals
- Complete approval workflow (approver list, actions, notifications)
- Implement AI assistance features (classification, summarization, draft replies)
- Add SLA UI and public ticket view
- Implement audit log page and ticket reassignment
- Improve frontend quality and accessibility

## Non-Goals (Out of Scope)
- Complete redesign of the UI
- New features beyond the MVP scope
- Performance optimizations beyond the current plan
- External deployments (users handle their own deployments)

## Background & Context
- Current MVP completion is ~65%
- Remaining work includes P0 core features and P1 quality improvements
- Existing features: auth, agent/requester/admin portals, email intake, dashboard, queues, knowledge base, basic approvals UI
- Tech stack: Next.js 16, Supabase, Tailwind CSS, TypeScript

## Functional Requirements
- **FR-1**: Approval workflow execution (list, approve/reject, UI, notifications)
- **FR-2**: AI assistance (classification, summarization, draft replies)
- **FR-3**: SLA front-end display
- **FR-4**: Public ticket view (signed links)
- **FR-5**: Audit log page
- **FR-6**: Ticket reassignment UI/API
- **FR-7**: Frontend quality improvements

## Non-Functional Requirements
- **NFR-1**: All features use existing Supabase tables and patterns
- **NFR-2**: Maintain type safety
- **NFR-3**: Accessibility improvements
- **NFR-4**: Follow existing coding conventions

## Constraints
- **Technical**: Use existing Supabase types
- **Business**: Complete within 2-3 weeks
- **Dependencies**: OpenAI API key for AI features

## Assumptions
- OpenAI GPT-4o-mini is the default model for AI features
- Existing `audit_log` table exists in DB
- Approval workflow uses tenant.settings for configuration

## Acceptance Criteria

### AC-1: Approval Workflow Complete
- **Given**: A ticket in pending_approval status
- **When**: An approver views their approval list
- **Then**: They can see the ticket and approve/reject it
- **Verification**: `human-judgment`

### AC-2: AI Assistance Available
- **Given**: An agent views a ticket detail
- **When**: They click "AI Suggest"
- **Then**: They see classification, summary, and draft reply
- **Verification**: `human-judgment`

### AC-3: SLA Displayed
- **Given**: A ticket with an SLA policy
- **When**: Viewing ticket detail or list
- **Then**: SLA status and remaining time are visible
- **Verification**: `human-judgment`

### AC-4: Public Ticket View Works
- **Given**: A signed ticket link
- **When**: Visiting the link (no login)
- **Then**: Ticket details are visible
- **Verification**: `human-judgment`

### AC-5: Audit Log Present
- **Given**: An admin views audit log
- **When**: Filtering and exporting
- **Then**: Log entries are shown correctly
- **Verification**: `human-judgment`

### AC-6: Ticket Reassignment Works
- **Given**: An agent with a ticket
- **When**: They reassign it
- **Then**: The ticket is assigned to the new agent
- **Verification**: `programmatic`

## Open Questions
- [ ] OpenAI model selection confirmation
- [ ] Audit log retention policy
- [ ] Public ticket link expiration policy
