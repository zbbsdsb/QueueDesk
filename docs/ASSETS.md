# QueueDesk Screenshots & Assets Guide

## Overview

This guide covers all the screenshots and assets you'll need for the QueueDesk v1.0 launch, including:
- Required screenshots (with specifications)
- Social media graphics
- Product images
- Brand assets
- File naming conventions

---

## Required Screenshots

### Screenshot Specifications
- **Resolution:** 1920x1080 (16:9) -OR- 1280x720
- **Format:** PNG (preferred) or JPG
- **File size:** Under 2MB each
- **Style:** Clean, professional, feature-focused
- **Browser zoom:** 125% for better visibility

---

### 1. Marketing Landing Page
**URL:** `/`
**Purpose:** Show the homepage
**File name:** `01-landing-page.png`
**What to capture:**
- Full hero section with logo and tagline
- Key features overview
- Call-to-action buttons
- Clean, uncluttered view

**Tips:**
- Hide scrollbar (use incognito mode)
- No browser tabs visible
- Use clean browser window
- Capture from top to main CTA

---

### 2. End-User Portal - Ticket Submission
**URL:** `/app/new`
**Purpose:** Show simple ticket submission
**File name:** `02-user-submit-ticket.png`
**What to capture:**
- Ticket submission form
- Form fields filled with sample data
- Submit button
- Clean UI

**Sample data to use:**
- Title: "Cannot access my account"
- Description: "I've tried resetting my password but haven't received the email. My username is john@example.com. Can you help me regain access?"
- Priority: "High"

---

### 3. End-User Portal - Ticket List
**URL:** `/app/tickets`
**Purpose:** Show ticket tracking
**File name:** `03-user-ticket-list.png`
**What to capture:**
- List of user's tickets
- Ticket status indicators
- Dates and quick view

---

### 4. Agent Dashboard
**URL:** `/agent/dashboard`
**Purpose:** Show real-time stats and overview
**File name:** `04-agent-dashboard.png`
**What to capture:**
- Key metrics (open tickets, SLA breach risk, resolved today)
- Quick stats widgets
- Clean dashboard layout

**Sample data to set up:**
- Open tickets: 12
- Resolved today: 8
- SLA at risk: 2
- Avg response time: 1h 24m

---

### 5. Agent Console - Ticket Queue
**URL:** `/agent/tickets`
**Purpose:** Show AI classification in action
**File name:** `05-agent-ticket-queue.png`
**What to capture:**
- Ticket list with AI-assigned categories
- Priority indicators
- Quick view of multiple tickets
- AI classification tags visible

**Show tickets with:**
- Categories: "Bug", "Feature Request", "Question"
- Priorities: "Low", "Medium", "High", "Urgent"
- Queues: "Support", "Engineering", "Billing"

---

### 6. Agent Console - Ticket Detail (AI Summary)
**URL:** `/agent/tickets/[id]`
**Purpose:** Show AI summarization
**File name:** `06-agent-ticket-detail.png`
**What to capture:**
- Full ticket detail view
- AI-generated summary highlighted
- Original ticket content
- Ticket metadata

---

### 7. Agent Console - AI Suggested Replies
**URL:** `/agent/tickets/[id]`
**Purpose:** Show AI response suggestions
**File name:** `07-agent-ai-suggestions.png`
**What to capture:**
- Ticket detail with "Suggested Replies" section open
- 3 different suggestions visible
- One suggestion being previewed/selected
- Clean, helpful UI

---

### 8. Agent Console - Knowledge Base
**URL:** `/agent/knowledge`
**Purpose:** Show knowledge base integration
**File name:** `08-agent-knowledge-base.png`
**What to capture:**
- Knowledge base article list
- Search functionality
- Article categories

---

### 9. Admin Dashboard - User Management
**URL:** `/admin/users`
**Purpose:** Show admin capabilities
**File name:** `09-admin-users.png`
**What to capture:**
- User management interface
- Role assignments
- Team assignments
- Clean admin UI

---

### 10. Admin Dashboard - Queue Configuration
**URL:** `/admin/queues`
**Purpose:** Show queue setup
**File name:** `10-admin-queues.png`
**What to capture:**
- Queue list
- Configuration options
- Team assignments

---

### 11. Admin Dashboard - SLA Configuration
**URL:** `/admin/sla`
**Purpose:** Show SLA management
**File name:** `11-admin-sla.png`
**What to capture:**
- SLA rules setup
- Time thresholds
- Escalation settings

---

### 12. Slack Integration
**URL:** `/admin/integrations/slack` (or Slack screenshot)
**Purpose:** Show Slack integration
**File name:** `12-slack-integration.png`
**What to capture:**
- Slack notification from QueueDesk
- Quick actions visible
- Clean integration UI

**Alternatives:**
- Slack message showing ticket notification
- Slack integration configuration page

---

### 13. GitHub Repository Page
**URL:** `https://github.com/zbbsdsb/QueueDesk`
**Purpose:** Show open-source project
**File name:** `13-github-repo.png`
**What to capture:**
- GitHub repo page
- README visible
- Stars/forks visible
- Deploy buttons

---

## Social Media Graphics

### Twitter/X (2:1 Ratio)
- **Size:** 1200x628px
- **Format:** PNG or JPG
- **File names:**
  - `social-twitter-card.png` - Main launch graphic
  - `social-twitter-feature-ai.png` - AI feature focus
  - `social-twitter-feature-open-source.png` - Open source focus

### LinkedIn (1.91:1 Ratio)
- **Size:** 1200x628px (same as Twitter works well)
- **Format:** PNG or JPG
- **File names:**
  - `social-linkedin-card.png`

### Instagram/Facebook (1:1 Ratio)
- **Size:** 1080x1080px
- **Format:** PNG or JPG
- **File names:**
  - `social-square-launch.png`

### Product Hunt Thumbnail
- **Size:** 1280x720px
- **Format:** PNG
- **File name:** `product-hunt-thumbnail.png`

---

## Brand Assets

### Logo Files
- **Logo (PNG - transparent):** `logo-transparent.png`
- **Logo (PNG - white background):** `logo-white-bg.png`
- **Logo (SVG):** `logo.svg`
- **Icon (favicon):** `favicon.ico`
- **Icon (PNG - various sizes):**
  - `icon-16.png`
  - `icon-32.png`
  - `icon-64.png`
  - `icon-128.png`
  - `icon-256.png`
  - `icon-512.png`

### Color Palette
Document your brand colors:

```css
/* Primary Colors */
--primary: #[YOUR_PRIMARY_COLOR]
--primary-dark: #[YOUR_PRIMARY_DARK]
--primary-light: #[YOUR_PRIMARY_LIGHT]

/* Secondary Colors */
--secondary: #[YOUR_SECONDARY_COLOR]

/* Neutrals */
--background: #ffffff
--surface: #f9fafb
--text-primary: #111827
--text-secondary: #6b7280
--border: #e5e7eb
```

### Typography
- **Headings:** [Your heading font]
- **Body:** [Your body font]
- **Monospace:** [Your monospace font]

---

## File Naming & Organization

### Directory Structure
```
assets/
├── screenshots/
│   ├── 01-landing-page.png
│   ├── 02-user-submit-ticket.png
│   ├── 03-user-ticket-list.png
│   ├── 04-agent-dashboard.png
│   ├── 05-agent-ticket-queue.png
│   ├── 06-agent-ticket-detail.png
│   ├── 07-agent-ai-suggestions.png
│   ├── 08-agent-knowledge-base.png
│   ├── 09-admin-users.png
│   ├── 10-admin-queues.png
│   ├── 11-admin-sla.png
│   ├── 12-slack-integration.png
│   └── 13-github-repo.png
├── social/
│   ├── social-twitter-card.png
│   ├── social-twitter-feature-ai.png
│   ├── social-twitter-feature-open-source.png
│   ├── social-linkedin-card.png
│   └── social-square-launch.png
├── brand/
│   ├── logo-transparent.png
│   ├── logo-white-bg.png
│   ├── logo.svg
│   ├── favicon.ico
│   └── icons/
│       ├── icon-16.png
│       ├── icon-32.png
│       ├── icon-64.png
│       ├── icon-128.png
│       ├── icon-256.png
│       └── icon-512.png
└── product-hunt/
    └── product-hunt-thumbnail.png
```

---

## Screenshot Checklist

### Pre-Screenshot Setup
- [ ] Clean up desktop/browser
- [ ] Use incognito mode
- [ ] Set browser zoom to 125%
- [ ] Hide bookmarks bar
- [ ] Close all irrelevant tabs
- [ ] Set up sample/demo data
- [ ] Test all flows first

### Screenshot Capture
- [ ] Capture at 1920x1080 resolution
- [ ] Use PNG format
- [ ] Keep file sizes under 2MB
- [ ] Capture full relevant area
- [ ] No sensitive data visible
- [ ] Use consistent sample data

### Post-Processing
- [ ] Crop if needed (keep consistent aspect ratio)
- [ ] Add subtle drop shadow (optional)
- [ ] Add annotations/arrows if helpful
- [ ] Compress files
- [ ] Verify file names match convention

---

## Tools for Capture & Editing

### Screenshot Tools
- **CleanShot X:** Great for Mac, annotations built-in
- **Snagit:** All-in-one capture + editing
- **ShareX:** Free, powerful, Windows only
- **Screenshot.app (Mac):** Built-in, basic
- **Snipping Tool (Windows):** Built-in, basic

### Editing Tools
- **Figma:** Great for social graphics, team collaboration
- **Canva:** Easy templates for social media
- **Photoshop:** Professional editing
- **GIMP:** Free alternative to Photoshop

### Compression Tools
- **TinyPNG:** Great online compression
- **Squoosh:** Free, open-source compression
- **ImageOptim:** Mac app for batch compression

---

## Distribution Checklist

### Add to Website
- [ ] Screenshots on landing page
- [ ] Screenshots on features page
- [ ] Demo video embedded
- [ ] Open graph tags set

### Add to GitHub
- [ ] Screenshots in README
- [ ] Screenshots in repo assets
- [ ] Social preview set
- [ ] Release assets uploaded

### Add to Product Hunt
- [ ] Thumbnail uploaded
- [ ] Screenshots added (up to 5)
- [ ] Video added

### Social Media Ready
- [ ] Twitter graphic ready
- [ ] LinkedIn graphic ready
- [ ] Square graphics ready (Instagram/Facebook)

---

## Sample Data Suggestions

For consistent, realistic-looking screenshots:

### Sample Users
- John Smith - john@example.com (End User)
- Sarah Johnson - sarah@example.com (Support Agent)
- Mike Chen - mike@example.com (Admin/Manager)
- Emily Davis - emily@example.com (Support Agent)

### Sample Teams
- Support Team
- Engineering Team
- Billing Team

### Sample Queues
- General Support
- Technical Issues
- Billing & Payments
- Feature Requests
- Bug Reports

### Sample Tickets
1. "Cannot access my account" (High Priority, Billing Queue)
2. "Feature request: Dark mode" (Low Priority, Feature Request Queue)
3. "Bug: Login page not loading" (High Priority, Engineering Queue)
4. "Question: How to export data?" (Medium Priority, Support Queue)
5. "Invoice not received" (Urgent Priority, Billing Queue)

### Sample Knowledge Base Articles
- "Password Reset Guide"
- "Getting Started with QueueDesk"
- "How to Configure SLA Rules"
- "Slack Integration Setup"
