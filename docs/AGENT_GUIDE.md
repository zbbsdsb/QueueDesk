# QueueDesk v1.0 Agent Guide

## Table of Contents
- [Introduction](#introduction)
- [Getting Started](#getting-started)
- [Agent Dashboard](#agent-dashboard)
- [Ticket Management](#ticket-management)
- [Working with Tickets](#working-with-tickets)
- [AI-Powered Features](#ai-powered-features)
- [Internal Collaboration](#internal-collaboration)
- [Knowledge Base](#knowledge-base)
- [Agent Settings](#agent-settings)
- [Best Practices](#best-practices)

## Introduction

Welcome to QueueDesk Agent Console! This guide will help you efficiently manage tickets, collaborate with your team, leverage AI features, and deliver exceptional support.

## Getting Started

### Accessing the Agent Console

1. Navigate to your QueueDesk workspace URL
2. Log in with your agent credentials
3. You'll be directed to the Agent Dashboard

### First-Time Setup

1. Review your profile settings
2. Configure notification preferences
3. Familiarize yourself with the queues you're assigned to
4. Set up your status (Available, Away, Offline)

## Agent Dashboard

Your dashboard provides a real-time overview of your workload and team performance.

### Key Dashboard Sections

- **Stats Cards**: 
  - Tickets assigned to you
  - Open tickets
  - SLA at risk
  - Resolved today
- **Recent Activity**: Latest ticket updates
- **Queue Overview**: Ticket distribution across queues
- **Performance Metrics**: Your individual performance (first response time, resolution time, etc.)

### Customizing the Dashboard

- Click the gear icon to configure which widgets appear
- Rearrange widgets by dragging and dropping
- Save multiple dashboard layouts for different contexts

## Ticket Management

### Viewing Your Queue

1. Click **Tickets** in the sidebar
2. You'll see a list of tickets with:
   - Ticket number and subject
   - Status indicator
   - Priority badge
   - SLA countdown (if applicable)
   - Last activity time
   - Requester information

### Filtering and Sorting

Use the filter bar to narrow down tickets:
- **Status**: New, In Progress, Waiting on Requester, etc.
- **Queue**: Select specific queues
- **Priority**: P1, P2, P3, P4
- **Assignee**: Tickets assigned to you, unassigned, or specific agents
- **Date Range**: Creation or last updated date
- **Tags**: Filter by applied tags

Sort options:
- SLA urgency (highest risk first)
- Priority
- Creation date
- Last updated

### Claiming Tickets

For unassigned tickets:
1. Select one or more tickets
2. Click **Claim** to assign them to yourself
3. Or use bulk actions for multiple tickets

## Working with Tickets

### Opening a Ticket

Click on any ticket to view the full details. The ticket view includes:

#### Ticket Information Panel (Left Sidebar)
- Requester details
- Ticket metadata (status, priority, queue, tags)
- SLA status and timers
- Approval status (if applicable)
- Activity timeline

#### Main Content Area
- Ticket subject and description
- Conversation thread (public comments and internal notes)
- Attachments
- AI summary and suggestions

#### Action Buttons (Top Right)
- Change status
- Reassign ticket
- Change priority
- Add tags
- Escalate

### Updating Ticket Status

| Status | When to Use |
|--------|-------------|
| New | Ticket just received, not yet worked on |
| In Progress | Actively working on the ticket |
| Waiting on Requester | Need more information from requester |
| Waiting on Approval | Ticket requires managerial approval |
| On Hold | Blocked by external dependencies |
| Resolved | Issue has been addressed |
| Closed | Ticket is fully completed (auto or manual) |

To change status:
1. Click the status dropdown
2. Select the new status
3. Optionally add a comment explaining the change
4. Save

### Communicating with Requesters

#### Sending a Public Reply

1. In the comment composer, select **Public Reply**
2. Type your message
3. Attach files if needed
4. Use AI to draft a response (see [AI-Powered Features](#ai-powered-features))
5. Review and edit
6. Click **Send**

Public replies are visible to the requester and trigger notifications.

#### Adding Internal Notes

1. Select **Internal Note**
2. Type your message
3. @mention teammates to notify them
4. Attach files if needed
5. Click **Add Note**

Internal notes are only visible to agents and admins.

### Ticket Actions

#### Reassigning Tickets

1. Click **Reassign**
2. Search for and select a new assignee
3. Optionally add a note explaining the reassignment
4. Confirm

#### Changing Priority

1. Click the priority badge
2. Select new priority level:
   - P1 - Critical (immediate attention)
   - P2 - High (same business day)
   - P3 - Medium (next business day)
   - P4 - Low (within 3 business days)
3. Save

#### Adding Tags

1. Click **Tags**
2. Select from existing tags or create new ones
3. Tags help with categorization, reporting, and AI suggestions

#### Uploading Attachments

- Drag and drop files into the comment area
- Click the attachment icon to browse files
- Max file size: 25MB
- All attachments are scanned for security

#### Resolving Tickets

1. Click **Resolve**
2. Optionally send a closing message to the requester
3. Select a resolution code (if required)
4. Confirm

The ticket will move to **Resolved** status. After the configured auto-close period, it will become **Closed**.

#### Reopening Resolved Tickets

If the requester responds to a resolved ticket:
1. The ticket automatically returns to **In Progress**
2. You'll receive a notification
3. Review the new information and continue working

## AI-Powered Features

QueueDesk provides AI assistance to help you work more efficiently.

### AI Classification Suggestions

When you open a new ticket, AI automatically suggests:
- Appropriate category
- Correct queue
- Relevant tags
- Priority level

To apply suggestions:
1. Review the suggestions in the AI panel
2. Click to accept individual suggestions or **Accept All**
3. Edit manually if needed
4. All actions are logged in the audit trail

### AI Summary

Get an instant summary of long ticket threads:
1. Click **Generate Summary** in the AI panel
2. Review the concise summary
3. Use it to quickly understand context when接手 (taking over) tickets

### AI Draft Replies

Let AI help you compose responses:
1. Click **Suggest Reply**
2. AI generates a draft based on ticket context and knowledge base
3. Edit and personalize the draft
4. Send when ready

**Important**: AI never sends messages automatically. You always review and approve before sending.

### AI Suggested Knowledge Articles

AI recommends relevant knowledge base articles:
1. Review suggested articles in the AI panel
2. Click to view full article
3. Insert article link or content into your reply

## Internal Collaboration

### @Mentions

Notify teammates by @mentioning them in internal notes:
1. Type @ followed by their name
2. Select from the dropdown
3. They'll receive a notification with a link to the ticket

### Reassigning to Teams

To reassign to a different team:
1. Click **Reassign**
2. Select the target team instead of an individual
3. The ticket goes to their queue for triage

### Shared Drafts

Collaborate on responses:
1. Start drafting a reply
2. Click **Save as Draft**
3. Teammates can view and edit the draft
4. When ready, one person sends it

### Ticket Transfer Checklist

When transferring tickets, include:
- Summary of what's been done
- Next steps needed
- Any relevant context
- Contact info for key stakeholders

## Knowledge Base

### Accessing Knowledge

1. Click **Knowledge** in the sidebar
2. Browse categories or search
3. View articles, FAQs, and procedures

### Using Knowledge in Tickets

- Copy article snippets directly into replies
- Link to articles for requesters to read
- Suggest articles to AI for better draft responses

### Contributing to Knowledge

If you have permission:
1. Click **New Article**
2. Draft your content with formatting
3. Add tags for discoverability
4. Submit for review or publish

## Agent Settings

### Profile Settings

1. Click your avatar > **Profile Settings**
2. Update:
   - Display name
   - Contact information
   - Avatar
   - Time zone

### Notification Preferences

Configure how and when you're notified:
- Ticket assigned to you
- Ticket updated (status, comments)
- SLA warnings and breaches
- @mentions
- Approvals needed

Choose notification channels:
- In-app
- Email
- Slack (if integrated)

### Availability Status

Set your status to manage ticket routing:
- **Available**: Can receive new ticket assignments
- **Away**: Won't receive new assignments, still receive notifications
- **Offline**: Won't receive assignments or most notifications

### Quick Replies

Create reusable response templates:
1. Go to **Settings** > **Quick Replies**
2. Click **New Quick Reply**
3. Name it (e.g., "Password Reset Instructions")
4. Write the template content
5. Use variables like `{{requester_name}}`
6. Save

To use:
- In the reply composer, type `/` and search for your quick reply
- Select it, customize as needed, and send

## Best Practices

### Ticket Triage

1. **Prioritize by SLA**: Address at-risk tickets first
2. **Use AI suggestions**: They're trained on historical data
3. **Set clear expectations**: Let requesters know timelines early
4. **Keep status updated**: Always reflect current state

### Communication

- **Be timely**: Aim to respond within SLA targets
- **Be clear**: Avoid jargon, use simple language
- **Be thorough**: Answer all questions in one reply when possible
- **Use templates**: Save time with quick replies
- **Personalize**: Templates are a starting point, not the final word

### Internal Notes

- **Document everything**: Important decisions, context, workarounds
- **Be specific**: Include dates, names, and ticket numbers
- **Use @mentions**: Bring in the right people at the right time
- **Keep it professional**: Remember notes are part of the record

### SLA Management

- **Monitor timers**: Keep an eye on the SLA countdown
- **Pause when appropriate**: Use "Waiting on Requester" to stop the clock
- **Communicate delays**: If you might breach, tell the requester early
- **Learn from breaches**: Analyze why they happened and improve

### Knowledge Management

- **Search first**: Check the knowledge base before replying
- **Contribute**: When you solve a unique problem, consider documenting it
- **Keep it updated**: If you find outdated info, flag it for review

### Self-Care

- **Manage your queue**: Don't let tickets pile up
- **Take breaks**: Step away regularly
- **Ask for help**: Escalate when needed
- **Celebrate wins**: Acknowledge when you resolve tough tickets

## Troubleshooting for Agents

### I can't see a ticket

- Check if you're in the right queue
- Verify your permissions with an admin
- Ensure filters aren't hiding it

### AI suggestions aren't appearing

- Make sure AI features are enabled for your workspace
- Check if the ticket has enough content for AI to analyze
- Contact an admin if issues persist

### Notifications aren't working

- Verify your notification settings
- Check spam folder for email notifications
- Confirm your status isn't suppressing notifications

For additional support, contact your workspace administrator.
