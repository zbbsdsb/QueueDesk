# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial project documentation structure

### Changed

- (No changes yet)

### Deprecated

- (No deprecated features)

### Removed

- (No removed features)

### Fixed

- (No bug fixes)

### Security

- (No security changes)

---

## [0.3.0] - 2026-05-14

### Added

#### Authentication & Authorization

- Multi-role authentication system (Admin, Agent, User)
- Role-based access control (RBAC)
- User registration and login flows
- Invitation-based user onboarding

#### Ticket Management

- Full ticket lifecycle management
- Ticket creation, viewing, updating, and closing
- Ticket priority levels (Low, Medium, High, Critical)
- Ticket status tracking (Open, In Progress, Pending, Resolved, Closed)
- Manual ticket assignment to agents
- Ticket reassignment capability
- Public ticket submission via unique token links

#### Queue Management

- Queue creation and configuration
- Queue-based ticket routing
- Queue assignment for agents
- Queue-level SLA configuration

#### SLA Management

- Service Level Agreement definitions
- SLA breach monitoring and tracking
- Automated SLA escalation
- Cron-based SLA validation

#### Team Management

- Team creation and management
- Team-based ticket assignment
- Team-level statistics

#### User Approvals

- Approval workflow for special access requests
- Approve/reject functionality for admins
- Approval audit trail

#### Audit & Compliance

- Comprehensive audit logging
- Action tracking (who, what, when)
- Admin audit dashboard

#### AI Features

- **Ticket Classification**: Automatic category prediction using machine learning
- **Response Drafting**: AI-generated response suggestions
- **Ticket Summarization**: Automatic content summarization
- AI integration API endpoints

#### Email Integration

- Email intake system for ticket submission
- Automatic queue routing based on email content
- Email notification templates
- Resend email service integration

#### Slack Integration

- Slack notifications for ticket events
- Interactive message handling
- Slash command support
- Channel-based routing

#### Admin Features

- Admin dashboard with statistics
- User management interface
- Role management interface
- Team management interface
- SLA configuration interface
- Approval queue management
- Audit log viewer

#### Agent Features

- Agent dashboard with key metrics
- Ticket queue view with filtering
- Ticket detail page with response capabilities
- Knowledge base access
- Personal settings management

#### User Features

- Public ticket submission form
- Ticket tracking via unique links
- User profile management

#### UI/UX

- Responsive design with Tailwind CSS
- Three-panel shell layouts for each role
- Modal-based interactions
- Toast notifications
- Recharts-based statistics visualization
- Avatar components with initials fallback

#### API Endpoints

- `GET/POST /api/tickets` - Ticket CRUD operations
- `POST /api/tickets/[id]/reassign` - Ticket reassignment
- `POST /api/approvals/[id]/approve` - Approve request
- `POST /api/approvals/[id]/reject` - Reject request
- `GET /api/audit` - Audit log retrieval
- `GET /api/ai/suggest/[ticketId]` - AI suggestions
- `POST /api/email/intake` - Email processing
- `POST /api/slack/interact` - Slack interactions
- `POST /api/cron/sla` - SLA validation cron
- `GET/POST /api/teams` - Team management
- `GET/POST /api/queues` - Queue management

### Changed

- Migrated to Next.js 16.2.5 with React 19
- Updated Supabase client to v2.105.3
- Updated Tailwind CSS to v4
- Migrated from CSS Modules to global CSS with Tailwind

### Deprecated

- (No deprecated features in this release)

### Removed

- Legacy authentication methods (replaced by Supabase Auth)

### Fixed

- (No bug fixes in initial v0.3.0 release)

### Security

- Row Level Security (RLS) policies on all database tables
- Secure session handling via Supabase SSR
- Protected API routes with authentication middleware

---

## [0.2.0] - 2026-04-01

### Added

- Initial project scaffolding
- Basic project structure
- README and documentation

### Changed

- (No changes)

### Fixed

- (No fixes)

---

## [0.1.0] - 2026-03-15

### Added

- Project initialization
- Repository setup
- Initial commit

### Changed

- (No changes)

### Fixed

- (No fixes)

---

## Versioning Policy

QueueDesk uses [Semantic Versioning](https://semver.org/):

```
MAJOR.MINOR.PATCH

1. MAJOR version for incompatible API changes
2. MINOR version for new functionality (backwards-compatible)
3. PATCH version for backwards-compatible bug fixes
```

### Version Examples

- **1.0.0**: First stable release
- **1.1.0**: New features added (backwards-compatible)
- **1.1.1**: Bug fixes (backwards-compatible)
- **2.0.0**: Breaking changes

### Pre-release Versions

- **alpha**: Early development (e.g., 0.3.0-alpha.1)
- **beta**: Feature complete, testing (e.g., 0.3.0-beta.1)
- **rc**: Release candidate (e.g., 0.3.0-rc.1)

---

## Keep a Changelog Format

This changelog follows the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) standard:

### Section Definitions

| Section | Description |
|---------|-------------|
| **Added** | New features added |
| **Changed** | Changes in existing functionality |
| **Deprecated** | Features marked for removal |
| **Removed** | Features removed in this release |
| **Fixed** | Bug fixes |
| **Security** | Security-related changes |

### Guiding Principles

1. **Every significant change** must be documented
2. **Group changes** by their type
3. **Link to issues** when possible (e.g., `#123`)
4. **Include dates** for each release
5. **Keep the Unreleased section** at the top

---

## Migration Guides

For major version upgrades, migration guides will be provided:

- [Upgrade to v0.4](./docs/migration/v0.4.md) - Coming soon
- [Upgrade to v1.0](./docs/migration/v1.0.md) - Coming soon

---

## Release Process

1. All changes are documented in `UNRELEASED` section
2. Version number is assigned based on change scope
3. Release date is added when published
4. A new `Unreleased` section is created
5. Release announcement posted to GitHub and community channels

---

_Last updated: 2026-05-14_
