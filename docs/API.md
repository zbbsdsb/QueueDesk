# QueueDesk API v1 Documentation

## Table of Contents
- [Introduction](#introduction)
- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [Errors](#errors)
- [Endpoints](#endpoints)
  - [Tickets](#tickets)
  - [Comments](#comments)
  - [Users](#users)
  - [Queues](#queues)
  - [Teams](#teams)
  - [Webhooks](#webhooks)
- [SDKs](#sdks)
- [Changelog](#changelog)

## Introduction

Welcome to the QueueDesk API! This API allows you to programmatically interact with QueueDesk to create tickets, manage users, and integrate with your internal systems.

**Base URL**: `https://api.queuedesk.com/v1`

**Content-Type**: All requests should use `application/json` unless otherwise specified.

## Authentication

QueueDesk uses API keys for authentication. You can generate API keys in the Admin Settings.

### Using Your API Key

Include your API key in the Authorization header:

```bash
curl https://api.queuedesk.com/v1/tickets \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Permission Scopes

API keys can have different scopes:

| Scope | Description |
|-------|-------------|
| `tickets:read` | Read tickets |
| `tickets:write` | Create and update tickets |
| `comments:read` | Read comments |
| `comments:write` | Create comments |
| `users:read` | Read user information |
| `users:write` | Manage users |
| `admin:full` | Full admin access |

## Rate Limiting

QueueDesk employs rate limiting to ensure fair usage:

| Plan | Requests per minute | Requests per hour |
|------|---------------------|-------------------|
| Free | 60 | 1000 |
| Pro | 300 | 5000 |
| Enterprise | Custom | Custom |

### Response Headers

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 55
X-RateLimit-Reset: 1672531200
```

### Rate Limit Exceeded

```json
{
  "error": "rate_limit_exceeded",
  "message": "Too many requests. Please try again later.",
  "retry_after": 60
}
```

## Errors

QueueDesk uses conventional HTTP status codes:

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - invalid parameters |
| 401 | Unauthorized - invalid API key |
| 403 | Forbidden - insufficient permissions |
| 404 | Not Found |
| 422 | Unprocessable Entity - validation error |
| 429 | Too Many Requests - rate limit exceeded |
| 500 | Server Error |

### Error Response Format

```json
{
  "error": "validation_error",
  "message": "Invalid request parameters",
  "details": [
    {
      "field": "subject",
      "message": "Subject is required"
    }
  ]
}
```

## Endpoints

### Tickets

#### List Tickets

```
GET /tickets
```

**Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | - | Filter by status |
| `queue_id` | string | - | Filter by queue |
| `assignee_id` | string | - | Filter by assignee |
| `priority` | string | - | Filter by priority |
| `created_before` | string | - | Created before date (ISO 8601) |
| `created_after` | string | - | Created after date (ISO 8601) |
| `limit` | integer | 25 | Number of results (max 100) |
| `offset` | integer | 0 | Pagination offset |

**Example Request**:

```bash
curl https://api.queuedesk.com/v1/tickets?status=open&limit=10 \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Example Response**:

```json
{
  "tickets": [
    {
      "id": "ticket_123abc",
      "ticket_number": "QD-456",
      "subject": "Login issues",
      "description": "Cannot log in to the system",
      "status": "open",
      "priority": "high",
      "queue_id": "queue_789",
      "assignee_id": "user_456",
      "requester_id": "user_123",
      "created_at": "2024-01-01T12:00:00Z",
      "updated_at": "2024-01-01T12:30:00Z"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 42
  }
}
```

#### Create Ticket

```
POST /tickets
```

**Request Body**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `subject` | string | Yes | Ticket subject |
| `description` | string | Yes | Ticket description |
| `queue_id` | string | Yes | Queue ID |
| `requester_id` | string | No | Requester user ID |
| `requester_email` | string | No | Requester email (if no user) |
| `priority` | string | No | Priority (low/medium/high/urgent) |
| `tags` | array | No | Array of tags |
| `custom_fields` | object | No | Custom field values |

**Example Request**:

```bash
curl https://api.queuedesk.com/v1/tickets \
  -X POST \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Cannot access dashboard",
    "description": "Getting a 403 error when trying to access the dashboard",
    "queue_id": "queue_123",
    "requester_email": "user@example.com",
    "priority": "high"
  }'
```

**Example Response**:

```json
{
  "id": "ticket_789xyz",
  "ticket_number": "QD-789",
  "subject": "Cannot access dashboard",
  "description": "Getting a 403 error when trying to access the dashboard",
  "status": "open",
  "priority": "high",
  "queue_id": "queue_123",
  "created_at": "2024-01-01T13:00:00Z"
}
```

#### Get Ticket

```
GET /tickets/{ticket_id}
```

**Example Request**:

```bash
curl https://api.queuedesk.com/v1/tickets/ticket_123abc \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Example Response**:

```json
{
  "id": "ticket_123abc",
  "ticket_number": "QD-456",
  "subject": "Login issues",
  "description": "Cannot log in to the system",
  "status": "in_progress",
  "priority": "high",
  "queue_id": "queue_789",
  "assignee_id": "user_456",
  "requester_id": "user_123",
  "requester": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "assignee": {
    "id": "user_456",
    "name": "Jane Smith",
    "email": "jane@example.com"
  },
  "comments": [
    {
      "id": "comment_1",
      "body": "I'm looking into this issue.",
      "author_id": "user_456",
      "public": true,
      "created_at": "2024-01-01T12:15:00Z"
    }
  ],
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:30:00Z"
}
```

#### Update Ticket

```
PATCH /tickets/{ticket_id}
```

**Request Body**:

| Field | Type | Description |
|-------|------|-------------|
| `subject` | string | Update subject |
| `description` | string | Update description |
| `status` | string | Update status |
| `priority` | string | Update priority |
| `assignee_id` | string | Assign to user |
| `queue_id` | string | Move to queue |
| `tags` | array | Replace tags |
| `custom_fields` | object | Update custom fields |

**Example Request**:

```bash
curl https://api.queuedesk.com/v1/tickets/ticket_123abc \
  -X PATCH \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress",
    "assignee_id": "user_456"
  }'
```

### Comments

#### List Comments

```
GET /tickets/{ticket_id}/comments
```

**Example Request**:

```bash
curl https://api.queuedesk.com/v1/tickets/ticket_123/comments \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Example Response**:

```json
{
  "comments": [
    {
      "id": "comment_1",
      "body": "I'm investigating this issue.",
      "author_type": "user",
      "author_id": "user_456",
      "public": true,
      "created_at": "2024-01-01T12:15:00Z"
    },
    {
      "id": "comment_2",
      "body": "Let me check the logs.",
      "author_type": "user",
      "author_id": "user_456",
      "public": false,
      "created_at": "2024-01-01T12:16:00Z"
    }
  ]
}
```

#### Create Comment

```
POST /tickets/{ticket_id}/comments
```

**Request Body**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `body` | string | Yes | Comment text |
| `public` | boolean | Yes | Public (true) or internal (false) |
| `author_id` | string | No | Author user ID (defaults to API key user) |

**Example Request**:

```bash
curl https://api.queuedesk.com/v1/tickets/ticket_123/comments \
  -X POST \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "This should be fixed now. Please try again.",
    "public": true
  }'
```

### Users

#### List Users

```
GET /users
```

**Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `role` | string | - | Filter by role |
| `team_id` | string | - | Filter by team |
| `search` | string | - | Search by name/email |
| `limit` | integer | 25 | Number of results |
| `offset` | integer | 0 | Pagination offset |

**Example Request**:

```bash
curl https://api.queuedesk.com/v1/users?role=agent \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Example Response**:

```json
{
  "users": [
    {
      "id": "user_123",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "agent",
      "team_ids": ["team_1"],
      "created_at": "2024-01-01T12:00:00Z"
    }
  ],
  "pagination": {
    "limit": 25,
    "offset": 0,
    "total": 15
  }
}
```

#### Get User

```
GET /users/{user_id}
```

### Queues

#### List Queues

```
GET /queues
```

**Example Request**:

```bash
curl https://api.queuedesk.com/v1/queues \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Example Response**:

```json
{
  "queues": [
    {
      "id": "queue_1",
      "name": "Support",
      "description": "General support queue",
      "team_id": "team_1",
      "ticket_count": 42,
      "created_at": "2024-01-01T12:00:00Z"
    }
  ]
}
```

#### Get Queue

```
GET /queues/{queue_id}
```

### Teams

#### List Teams

```
GET /teams
```

#### Get Team

```
GET /teams/{team_id}
```

### Webhooks

#### List Webhooks

```
GET /webhooks
```

#### Create Webhook

```
POST /webhooks
```

**Request Body**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | Yes | Webhook URL |
| `events` | array | Yes | Events to subscribe to |
| `active` | boolean | No | Whether webhook is active (default: true) |
| `secret` | string | No | Secret for signing |

**Supported Events**:
- `ticket.created`
- `ticket.updated`
- `ticket.comment_added`
- `ticket.status_changed`
- `ticket.assigned`

**Example Request**:

```bash
curl https://api.queuedesk.com/v1/webhooks \
  -X POST \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-server.com/webhook",
    "events": ["ticket.created", "ticket.updated"],
    "secret": "your_webhook_secret"
  }'
```

#### Webhook Payload

```json
{
  "event": "ticket.created",
  "timestamp": "2024-01-01T12:00:00Z",
  "data": {
    "id": "ticket_123",
    "ticket_number": "QD-456",
    "subject": "Login issues",
    "status": "open"
  }
}
```

#### Verifying Webhooks

QueueDesk signs webhook requests with a signature in the `X-QueueDesk-Signature` header:

```javascript
const crypto = require('crypto')

function verifySignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret)
  const digest = hmac.update(JSON.stringify(payload)).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))
}
```

## SDKs

### Node.js SDK

Install:

```bash
npm install queuedesk
```

Usage:

```javascript
const QueueDesk = require('queuedesk')

const client = new QueueDesk({
  apiKey: 'YOUR_API_KEY'
})

// List tickets
const tickets = await client.tickets.list({ status: 'open' })

// Create ticket
const ticket = await client.tickets.create({
  subject: 'Help needed',
  description: 'Having an issue with...',
  queue_id: 'queue_123'
})

// Add comment
await client.comments.create('ticket_123', {
  body: 'I can help with this',
  public: true
})
```

### Python SDK

Install:

```bash
pip install queuedesk
```

Usage:

```python
from queuedesk import QueueDesk

client = QueueDesk(api_key='YOUR_API_KEY')

# List tickets
tickets = client.tickets.list(status='open')

# Create ticket
ticket = client.tickets.create(
  subject='Help needed',
  description='Having an issue with...',
  queue_id='queue_123'
)
```

## Changelog

### v1.0.0 (2024-01-01)

- Initial API v1 release
- Tickets endpoints
- Comments endpoints
- Users endpoints
- Queues endpoints
- Webhooks support

### Migrating from v0 to v1

See the [Upgrade Guide](./UPGRADE.md#api-migration) for detailed migration instructions.

## Support

If you have any questions or need help with the API:

- Email: api@queuedesk.com
- Documentation: https://docs.queuedesk.com/api
- Status: https://status.queuedesk.com
