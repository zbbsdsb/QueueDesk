# QueueDesk v1.0 Admin Guide

## Table of Contents
- [Introduction](#introduction)
- [Getting Started](#getting-started)
- [Admin Dashboard Overview](#admin-dashboard-overview)
- [User Management](#user-management)
- [Team Management](#team-management)
- [Queue Management](#queue-management)
- [SLA Policies](#sla-policies)
- [Approval Workflows](#approval-workflows)
- [Roles and Permissions](#roles-and-permissions)
- [Audit Logs](#audit-logs)
- [Workspace Settings](#workspace-settings)
- [Integrations](#integrations)
- [AI Configuration](#ai-configuration)
- [Reports and Analytics](#reports-and-analytics)
- [Backup and Recovery](#backup-and-recovery)
- [Best Practices](#best-practices)

## Introduction

Welcome to the QueueDesk Admin Console! This guide will help you set up, configure, and manage your QueueDesk workspace effectively. As an administrator, you have full control over users, teams, queues, SLAs, and system settings.

## Getting Started

### Accessing the Admin Console

1. Navigate to your QueueDesk workspace URL
2. Log in with your admin credentials
3. Click **Admin** in the sidebar to access the admin console

### Initial Workspace Setup

1. **Verify Workspace Information**: Confirm your organization name, domain, and contact details
2. **Set Up Email Integration**: Configure email intake for ticket creation
3. **Create Your First Team**: Set up a team for initial ticket handling
4. **Create Your First Queue**: Configure a queue to receive tickets
5. **Add Users**: Invite team members and assign appropriate roles
6. **Set Up SLA Policies**: Define response and resolution targets

## Admin Dashboard Overview

The admin dashboard provides a high-level view of your entire workspace:

- **Key Metrics**: Total tickets, active users, SLA compliance rate, average resolution time
- **Recent Activity**: Latest system events and user actions
- **Queue Health**: Status of all queues with backlog and SLA risk indicators
- **Quick Actions**: Shortcuts to common admin tasks

## User Management

### Adding Users

1. Go to **Admin** > **Users**
2. Click **Invite User**
3. Enter user details:
   - Full name
   - Email address
   - Role (see [Roles and Permissions](#roles-and-permissions))
   - Team assignments
4. Click **Send Invitation**

Users will receive an email with a link to set up their account.

### User Roles

| Role | Description |
|------|-------------|
| Org Owner | Full control over the entire organization |
| Workspace Admin | Full control over the workspace |
| Team Lead | Manage their team's queues and users |
| Agent | Handle tickets within assigned queues |
| Approver | Review and approve/deny requests |
| Viewer | Read-only access to tickets and reports |
| External Requester | Can only submit and view their own tickets |

### Editing Users

1. Go to **Admin** > **Users**
2. Find the user and click **Edit**
3. Update:
   - Profile information
   - Role and permissions
   - Team assignments
   - Status (Active/Suspended/Deactivated)
4. Save changes

### Deactivating Users

1. Find the user in the user list
2. Click **Deactivate**
3. Confirm deactivation
4. Their tickets can be reassigned automatically or manually

### User Import

For bulk user creation:
1. Go to **Admin** > **Users** > **Import**
2. Download the CSV template
3. Fill in user data
4. Upload the CSV file
5. Review and confirm import

## Team Management

### Creating Teams

1. Go to **Admin** > **Teams**
2. Click **New Team**
3. Configure team details:
   - Team name
   - Description
   - Team lead
   - Team type (IT Support, HR Services, Finance, etc.)
   - Business hours
4. Add team members
5. Click **Create Team**

### Team Settings

- **Business Hours**: Define when the team is available (affects SLA calculations)
- **Members**: Add or remove team members
- **Queues**: Assign queues to the team
- **Escalation Paths**: Configure automatic escalation for overdue tickets

### Editing Teams

1. Go to **Admin** > **Teams**
2. Select the team to edit
3. Update settings as needed
4. Save changes

## Queue Management

### Creating Queues

1. Go to **Admin** > **Queues**
2. Click **New Queue**
3. Configure queue details:
   - Queue name
   - Description
   - Assigned team
   - Intake sources (email, form, API)
   - Default priority
   - Default SLA policy
   - Routing mode (Manual, Round Robin, Skill-based)
   - Sort policy (FIFO, SLA Risk, Priority)
   - Visibility (Team only / Workspace shared)
4. Click **Create Queue**

### Queue Intake Sources

Configure how tickets enter the queue:

#### Email Intake
1. In queue settings, go to **Email Intake**
2. Set up the email address (e.g., `it-support@yourcompany.com`)
3. Configure email settings:
   - Auto-reply template
   - Thread detection
   - Attachment handling
   - SPAM filtering

#### Web Form Intake
1. Go to **Forms** > **Create New Form**
2. Design the form with fields
3. Map form fields to ticket properties
4. Assign form to queue
5. Share the form link or embed it

#### API Intake
See the [API Documentation](./API.md) for details.

### Queue Routing Rules

Configure automatic ticket assignment:
1. Go to queue settings > **Routing Rules**
2. Create rules based on:
   - Ticket keywords
   - Priority
   - Tags
   - Requester attributes
3. Define actions:
   - Assign to specific agent
   - Set priority
   - Add tags
   - Trigger notifications
4. Order rules by priority (top to bottom)

### Queue Statuses

| Status | Description |
|--------|-------------|
| Draft | Queue is being configured, not receiving tickets |
| Active | Queue is operational and receiving tickets |
| Paused | Queue is not receiving new tickets, but existing tickets remain |
| Archived | Queue is read-only, all tickets are closed |

### Managing Queues

- **Edit Queue Settings**: Update configuration at any time
- **Pause Queue**: Temporarily stop receiving new tickets
- **Archive Queue**: Retire old queues while preserving history
- **Merge Queues**: Combine two queues (advanced operation)

## SLA Policies

### What are SLAs?

Service Level Agreements (SLAs) define response and resolution time targets for tickets.

### Creating SLA Policies

1. Go to **Admin** > **SLA Policies**
2. Click **New SLA Policy**
3. Configure:
   - Policy name
   - Description
   - Targets:
     - First response time
     - Resolution time
   - Business hours calendar
   - Start conditions (when the clock starts)
   - Pause conditions (when the clock stops)
   - Stop conditions (when the clock ends)
   - Breach actions (notifications, escalations)
4. Assign to queues or ticket criteria
5. Save

### Business Hours

Define working hours for SLA calculations:
1. Go to **Admin** > **Business Hours**
2. Set up:
   - Working days and hours
   - Holidays
   - Time zone
3. Apply to teams or SLAs

### SLA Monitoring

- **Dashboard Widgets**: View real-time SLA compliance
- **Reports**: Generate SLA performance reports
- **Alerts**: Set up notifications for at-risk tickets

## Approval Workflows

### Approval Templates

QueueDesk includes built-in approval templates:

- **Access Request**: Manager → System Owner → IT
- **Procurement Request**: Manager → Finance (with amount thresholds)
- **Employee Change**: Manager → HR → IT

### Creating Custom Approval Workflows

1. Go to **Admin** > **Approvals**
2. Click **New Approval Template**
3. Configure:
   - Template name and type
   - Approval steps (multiple steps supported)
   - Approvers for each step (users or roles)
   - Decision mode (All must approve / Any can approve)
   - Timeout behavior
   - Ticket status updates on approval/denial
4. Save and enable

### Managing Approvals

- **View Pending Approvals**: Monitor all pending approval requests
- **Reassign Approvers**: Redirect approvals if someone is unavailable
- **Override Decisions**: Force approval/denial when necessary
- **Audit Trail**: View complete history of all approval actions

## Roles and Permissions

### Understanding Roles

QueueDesk uses Role-Based Access Control (RBAC) with the following roles:

| Role | Permissions |
|------|-------------|
| Org Owner | Everything: billing, security, all workspaces |
| Workspace Admin | Workspace settings, users, queues, SLAs, reports |
| Team Lead | Manage team, view team reports, reassign tickets |
| Agent | Handle tickets, send replies, add internal notes |
| Approver | View and act on assigned approvals only |
| Viewer | Read-only access to tickets and reports |
| External Requester | Submit and view own tickets only |
| Integration Bot | API access with scoped permissions |

### Custom Roles (Enterprise)

For Enterprise customers:
1. Go to **Admin** > **Roles**
2. Click **New Role**
3. Define:
   - Role name
   - Permissions (granular control)
   - Scope (Workspace / Team / Queue)
4. Save and assign to users

### Permission Categories

- **User Management**: Create, edit, deactivate users
- **Queue Management**: Create, edit, delete queues
- **SLA Management**: Create and edit SLA policies
- **Reporting**: View and export reports
- **Audit Logs**: View audit logs
- **Settings**: Modify workspace settings
- **Billing**: Manage subscription and payments

## Audit Logs

### Viewing Audit Logs

1. Go to **Admin** > **Audit Logs**
2. Browse or search the log entries
3. Filter by:
   - Date range
   - Actor (user or system)
   - Action type
   - Entity type
   - Status

### Log Entry Details

Each log entry includes:
- Timestamp
- Actor (who performed the action)
- Action performed
- Entity affected
- Before/after values (when applicable)
- IP address
- User agent
- Correlation ID

### Exporting Audit Logs

1. Apply filters to select entries
2. Click **Export**
3. Choose format (CSV or JSON)
4. Download the export

### Log Retention

- Default retention: 1 year
- Enterprise: configurable retention policies
- Legal holds: Preserve logs for compliance

## Workspace Settings

### General Settings

Go to **Admin** > **Settings** > **General**:
- Workspace name and URL
- Time zone
- Date and time format
- Default language
- Company branding (logo, colors)

### Security Settings

- **Password Policy**: Minimum length, complexity, expiration
- **Session Settings**: Timeout duration, IP restrictions
- **Two-Factor Authentication**: Enable/require 2FA
- **Single Sign-On (SSO)**: Configure SAML/OAuth integration
- **IP Whitelisting**: Restrict access to specific IP ranges

### Notification Settings

- **System Notifications**: Configure admin alerts
- **Email Templates**: Customize outgoing emails
- **Slack Integration**: Send notifications to Slack channels

### Data Retention

Configure how long data is kept:
- Closed tickets
- Audit logs
- Attachments
- User data

## Integrations

### Slack Integration

1. Go to **Admin** > **Integrations** > **Slack**
2. Click **Connect to Slack**
3. Follow the OAuth flow
4. Configure:
   - Which events to send to Slack
   - Which channels to notify
   - Notification format
5. Save

### Email Integration

- Configure outgoing email (SMTP or Resend)
- Set up email intake for queues
- Customize email templates

### API Integration

See [API Documentation](./API.md) for:
- Authentication
- Endpoints
- Webhooks
- SDKs

### Custom Integrations

Use the API to build custom integrations with:
- HR systems
- ITSM tools
- Monitoring systems
- Internal tools

## AI Configuration

### Enabling AI Features

1. Go to **Admin** > **AI Settings**
2. Toggle features on/off:
   - Ticket classification
   - AI summary
   - Reply suggestions
   - Knowledge base recommendations

### AI Settings

- **API Key**: Enter your OpenAI API key (or other provider)
- **Model Selection**: Choose AI model (GPT-4, GPT-3.5, etc.)
- **Confidence Threshold**: Set minimum confidence for suggestions
- **Data Privacy**: Configure what data is sent to AI

### AI Governance

- **Human-in-the-Loop**: AI never takes action without human approval
- **Audit Logging**: All AI suggestions and adoptions are logged
- **Opt-Out**: Allow individual users or teams to disable AI
- **Model Updates**: Schedule and review model updates

### Training the AI

While QueueDesk's AI is pre-trained, you can improve suggestions by:
- Using tags consistently
- Writing clear ticket resolutions
- Maintaining a good knowledge base
- Accepting/rejecting AI suggestions to provide feedback

## Reports and Analytics

### Built-in Reports

QueueDesk includes several pre-built reports:

#### Ticket Volume Reports
- Tickets created over time
- Tickets by queue
- Tickets by priority
- Tickets by requester department

#### Performance Reports
- First response time (FRT)
- Resolution time (RT)
- SLA compliance rate
- Backlog aging
- Agent performance

#### Trend Reports
- Ticket volume trends
- SLA performance trends
- Resolution rate trends
- Customer satisfaction trends

### Creating Custom Reports

1. Go to **Reports** > **New Report**
2. Select data source
3. Choose metrics and dimensions
4. Apply filters
5. Configure visualization (table, chart, graph)
6. Save and share

### Exporting Reports

- Export to CSV, Excel, or PDF
- Schedule automatic reports via email
- Share report links with team members

### Dashboard Widgets

Create a custom dashboard with:
- Real-time metrics
- Charts and graphs
- Ticket queues
- SLA status indicators

## Backup and Recovery

### Automated Backups

QueueDesk automatically backs up:
- Database (hourly)
- Files (daily)
- Configuration (daily)

### Manual Backups

1. Go to **Admin** > **Backups**
2. Click **Create Backup**
3. Select what to back up
4. Wait for backup to complete
5. Download the backup file

### Restoring from Backup

1. Go to **Admin** > **Backups**
2. Select the backup to restore
3. Click **Restore**
4. Review the warning
5. Confirm restoration

**Important**: Restoring a backup will overwrite current data.

### Backup Retention

- Automated backups: retained for 30 days
- Manual backups: retained until manually deleted
- Enterprise: custom retention policies

## Best Practices

### User Management

- Use the principle of least privilege
- Regularly review user access
- Deactivate former employees immediately
- Use groups/teams for easier management

### Queue Design

- Keep queues focused on specific functions
- Don't create too many queues
- Use routing rules to automate triage
- Monitor queue health regularly

### SLA Management

- Set realistic SLA targets
- Use business hours correctly
- Monitor SLA compliance closely
- Adjust SLAs based on performance data

### Security

- Enforce strong passwords
- Require 2FA for all admin users
- Use IP whitelisting if possible
- Regularly review audit logs
- Keep your QueueDesk instance updated

### Data Quality

- Encourage consistent use of tags and categories
- Train users on proper ticket categorization
- Regularly clean up old or duplicate tickets
- Maintain an up-to-date knowledge base

### Performance

- Monitor system performance
- Optimize slow-running reports
- Archive old data periodically
- Scale resources as your team grows

### Training and Documentation

- Train new users thoroughly
- Keep documentation updated
- Create quick reference guides
- Hold regular refresh sessions

## Troubleshooting for Admins

### Users can't log in

- Check if their account is active
- Verify their email address
- Reset their password
- Check SSO configuration (if applicable)

### Tickets aren't being created

- Check email integration settings
- Verify queue is active
- Review API configuration (if using API)
- Check spam folder

### SLA timers not working

- Verify business hours are set correctly
- Check SLA policy conditions
- Review ticket status changes
- Check audit logs for SLA events

### Email notifications not sending

- Verify email provider configuration
- Check spam folder
- Review notification settings
- Check email logs

For additional assistance, contact QueueDesk Support or refer to the [Troubleshooting Guide](./TROUBLESHOOTING.md).
