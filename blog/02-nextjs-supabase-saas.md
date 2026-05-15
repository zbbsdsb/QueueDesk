---
title: Next.js 16 + Supabase: Best Practices for Building SaaS Applications
date: 2026-05-15
author: QueueDesk Team
category: Engineering
tags: [nextjs, supabase, saas, webdev, typescript]
---

# Next.js 16 + Supabase: Best Practices for Building SaaS Applications

Building a SaaS application from scratch is challenging. You need to handle authentication, multi-tenancy, real-time features, and more—all while maintaining a great developer experience. At QueueDesk, we found that Next.js 16 and Supabase form an incredible foundation for SaaS development. Here are the best practices we learned along the way.

## Why Next.js 16 + Supabase?

This combination gives you:
- ✅ Full-stack TypeScript support
- ✅ Built-in authentication
- ✅ Real-time database subscriptions
- ✅ Row Level Security for multi-tenancy
- ✅ Server-side rendering for SEO
- ✅ Edge functions for API routes
- ✅ One-click deployment options

## Project Structure & Organization

We organized QueueDesk using Next.js 16 App Router's route groups:

```
src/app/
├── (marketing)/          # Public marketing pages
│   └── page.tsx
├── (auth)/               # Login, register, password reset
│   ├── login/
│   ├── register/
│   └── layout.tsx
├── (app)/                # End-user portal
│   ├── app/
│   │   ├── tickets/
│   │   ├── new/
│   │   └── profile/
│   └── layout.tsx
├── (agent)/              # Agent console
│   ├── agent/
│   │   ├── dashboard/
│   │   ├── tickets/
│   │   ├── queues/
│   │   └── knowledge/
│   └── layout.tsx
├── (admin)/              # Admin dashboard
│   ├── admin/
│   │   ├── users/
│   │   ├── teams/
│   │   ├── queues/
│   │   └── settings/
│   └── layout.tsx
└── api/                  # API routes
    ├── ai/
    ├── tickets/
    ├── approvals/
    └── ...
```

### Why route groups?
- Separate concerns without affecting URL structure
- Different layouts for different user types
- Clean organization of related routes

## Authentication Implementation

### Supabase Auth Setup

We use Supabase Auth for all authentication needs. Here's our setup:

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Middleware for Route Protection

Next.js Middleware is perfect for protecting routes:

```typescript
// middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protect routes based on authentication and role
  if (request.nextUrl.pathname.startsWith('/admin') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}
```

## Multi-Tenancy with Row Level Security

This is the most critical part of SaaS development. Here's how we implement it:

### Database Schema Pattern

Every table includes a `tenant_id`:

```sql
CREATE TABLE ticket (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenant(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ticket ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users see own tenant tickets"
  ON ticket FOR ALL
  USING (tenant_id = app.current_tenant_id());
```

### Helper Function

We created a helper function to get the current tenant ID:

```sql
CREATE FUNCTION app.current_tenant_id()
RETURNS UUID AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
  SELECT (app.current_tenant()).id INTO v_tenant_id;
  RETURN v_tenant_id;
END;
$$ LANGUAGE plpgsql STABLE;
```

## Data Fetching Patterns

### Server Components (Recommended)

Use Server Components for data fetching whenever possible:

```typescript
// app/agent/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = createClient()
  
  const { data: tickets } = await supabase
    .from('ticket')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div>
      <h1>Dashboard</h1>
      <TicketsList tickets={tickets} />
    </div>
  )
}
```

### Client Components with Realtime

For interactive features, use Client Components with realtime subscriptions:

```typescript
// components/TicketsList.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function TicketsList({ initialTickets }) {
  const [tickets, setTickets] = useState(initialTickets)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('tickets')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ticket' },
        (payload) => {
          // Handle realtime updates
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return <div>{/* Render tickets */}</div>
}
```

## API Routes Best Practices

### Keep API Routes Clean

Separate concerns by moving business logic to lib directory:

```typescript
// app/api/tickets/route.ts
import { createClient } from '@/lib/supabase/server'
import { createTicket } from '@/lib/tickets/service'

export async function POST(request: Request) {
  const supabase = createClient()
  const body = await request.json()
  
  try {
    const ticket = await createTicket(supabase, body)
    return Response.json(ticket)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 })
  }
}
```

### Type Safety Everywhere

Define types for all API requests and responses:

```typescript
// lib/types.ts
export interface CreateTicketRequest {
  title: string
  description?: string
  queue_id: string
}

export interface Ticket {
  id: string
  title: string
  description?: string
  status: string
  created_at: string
}
```

## Deployment Strategy

### Environment Variables

Use environment-specific variables:

```
# .env.local (development)
NEXT_PUBLIC_SUPABASE_URL=your-dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-dev-anon-key

# .env.production (production)
NEXT_PUBLIC_SUPABASE_URL=your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
```

### One-Click Deployments

Add deployment buttons to your README:

```markdown
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/your-repo)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/your-org/your-repo)
```

## Performance Optimization

### Code Splitting

Next.js automatically code-splits by route, but you can optimize further:

```typescript
// Dynamic import for heavy components
const Chart = dynamic(() => import('@/components/Chart'), {
  loading: () => <Skeleton />,
  ssr: false
})
```

### Image Optimization

Use Next.js Image component:

```typescript
import Image from 'next/image'

<Image
  src="/logo.png"
  alt="Logo"
  width={120}
  height={120}
  priority
/>
```

## Testing Strategy

### Unit Tests

Test business logic in isolation:

```typescript
// lib/tickets/service.test.ts
import { createTicket } from './service'

test('creates ticket with correct properties', async () => {
  const supabase = createMockSupabaseClient()
  const ticket = await createTicket(supabase, {
    title: 'Test Ticket',
    queue_id: 'queue-123'
  })
  
  expect(ticket.title).toBe('Test Ticket')
  expect(ticket.status).toBe('open')
})
```

### E2E Tests

Use Playwright for end-to-end testing:

```typescript
// e2e/ticket-flow.spec.ts
import { test, expect } from '@playwright/test'

test('submit and view ticket', async ({ page }) => {
  await page.goto('/app/new')
  await page.fill('[name="title"]', 'Test Ticket')
  await page.click('button[type="submit"]')
  
  await expect(page).toHaveURL(/\/app\/tickets\/.*/)
})
```

## Security Best Practices

1. **Never expose admin secrets** to the client
2. **Use RLS for all data access**
3. **Validate all user input** on the server
4. **Use HTTPS everywhere**
5. **Implement rate limiting** for API endpoints
6. **Keep dependencies updated**

## Conclusion

Next.js 16 + Supabase is a powerful combination for building SaaS applications. The key takeaways are:

- Use route groups for organization
- Leverage RLS for multi-tenancy
- Prefer Server Components for data fetching
- Keep API routes clean and typed
- Test business logic in isolation

By following these patterns, you can build scalable, maintainable SaaS applications faster than ever before.

---

**Want to see these patterns in action?** Check out the [QueueDesk source code](https://github.com/zbbsdsb/QueueDesk) to see how we implement these best practices!
