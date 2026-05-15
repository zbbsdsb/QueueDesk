# QueueDesk Production Guide

This guide covers best practices, security considerations, performance optimization, monitoring, backup strategies, and scaling for running QueueDesk in production.

## Table of Contents

1. [Production Environment Best Practices](#production-environment-best-practices)
2. [Security Configuration Checklist](#security-configuration-checklist)
3. [Performance Optimization](#performance-optimization)
4. [Monitoring and Observability](#monitoring-and-observability)
5. [Backup Strategies](#backup-strategies)
6. [Scaling Considerations](#scaling-considerations)
7. [Database Maintenance Guide](#database-maintenance-guide)

---

## Production Environment Best Practices

### Environment Setup

#### 1. Separate Environments
Maintain at least three separate environments:
- **Development**: Local development environment
- **Staging**: Pre-production environment for testing
- **Production**: Live customer-facing environment

Each environment should have its own:
- Supabase project
- Environment variables
- API keys and secrets
- Backup policies

#### 2. Environment Variables
Never commit `.env` files to version control. Use platform-specific secret management:
- **Vercel**: Environment Variables in Project Settings
- **Railway**: Variables tab
- **Render**: Environment section
- **Supabase**: Vault for sensitive secrets

#### 3. Node.js Version
Use the LTS (Long-Term Support) version of Node.js (currently Node.js 20 or 22) for production.

### Code and Deployment Practices

#### 1. Automated Deployments
- Use CI/CD pipelines (GitHub Actions, GitLab CI, etc.)
- Run linting and tests before deployment
- Deploy to staging first, then promote to production
- Use blue-green deployments for zero-downtime updates

#### 2. Version Tagging
- Use semantic versioning (e.g., `v1.0.0`, `v1.1.0`)
- Tag production releases in Git
- Maintain a `CHANGELOG.md` file
- Keep release notes for each version

#### 3. Feature Flags
Use feature flags to:
- Roll out new features gradually
- Disable features without full deployment
- A/B test new functionality

---

## Security Configuration Checklist

### Authentication & Authorization

- [ ] Enable email confirmation in Supabase Auth
- [ ] Set up password strength requirements
- [ ] Enable session timeout (default: 1 week, consider shorter for sensitive environments)
- [ ] Use HTTPS everywhere (enforced in `next.config.ts`)
- [ ] Implement role-based access control (RBAC) for admin/agent/requester
- [ ] Rotate Supabase service role key periodically
- [ ] Disable unused authentication providers

### Application Security

- [ ] Set strong, unique values for `TICKET_TOKEN_SECRET` and `CRON_SECRET`
- [ ] Keep `SUPABASE_SERVICE_ROLE_KEY` secure (never expose to client-side)
- [ ] Enable all security headers in `next.config.ts`
- [ ] Set up Content Security Policy (CSP)
- [ ] Validate and sanitize all user inputs
- [ ] Use parameterized queries (Supabase handles this by default)
- [ ] Regularly update dependencies (`npm audit`, `npm update`)
- [ ] Enable rate limiting for API endpoints

### Data Protection

- [ ] Enable encryption at rest in Supabase
- [ ] Enable encryption in transit (SSL/TLS)
- [ ] Set up database backups (see [Backup Strategies](#backup-strategies))
- [ ] Implement data retention policies
- [ ] Anonymize or pseudonymize data where possible
- [ ] Have a data deletion process for user accounts

### Network Security

- [ ] Use a custom domain with SSL/TLS certificate
- [ ] Enable HSTS (Strict-Transport-Security header)
- [ ] Configure DNS security (DNSSEC)
- [ ] Restrict database access to trusted IPs (in Supabase Dashboard)
- [ ] Use a Web Application Firewall (WAF) if available

### Compliance

- [ ] Document data processing activities
- [ ] Provide privacy policy and terms of service
- [ ] Implement cookie consent if required by law (GDPR, CCPA, etc.)
- [ ] Keep audit logs enabled (Supabase + custom audit tables)

---

## Performance Optimization

### Frontend Optimization

#### 1. Next.js Built-in Optimizations
QueueDesk already uses Next.js optimizations, but ensure:
- `reactStrictMode: true` (enabled in `next.config.ts`)
- `compress: true` (enabled)
- Image optimization using `next/image`
- Code splitting with dynamic imports

#### 2. Bundle Analysis
Regularly analyze your bundle size:
```bash
# Install bundle analyzer
npm install @next/bundle-analyzer --save-dev

# Add to next.config.ts and run
ANALYZE=true npm run build
```

#### 3. Caching
- Use Supabase Realtime subscriptions where appropriate
- Implement client-side caching for frequently accessed data
- Use HTTP caching headers for static assets

### Backend & Database Optimization

#### 1. Database Indexes
The migration file (`001_schema.sql`) includes indexes, but monitor query performance:
- Use Supabase's **Query Performance** report
- Add missing indexes for slow queries
- Remove unused indexes

#### 2. Connection Pooling
For high-traffic deployments:
- Use Supabase's connection pooling
- Avoid opening too many database connections
- Reuse connections where possible

#### 3. Query Optimization
- Use Supabase's select statements to fetch only needed columns
- Implement pagination for large datasets
- Use count estimates instead of exact counts for large tables
- Avoid N+1 query problems

### Caching Strategy

| Layer | Tool/Method | TTL | Use Case |
|-------|-------------|-----|----------|
| Browser | HTTP Cache Headers | Short (minutes) | Static assets |
| CDN | Vercel Edge Network / Railway CDN | Medium (hours) | Marketing pages |
| Application | In-memory / Redis | Variable | Session data, frequent queries |
| Database | PostgreSQL caching | Automatic | Query results |

---

## Monitoring and Observability

### Application Monitoring

#### 1. Error Tracking
Set up error tracking with:
- **Sentry**: `npm install @sentry/nextjs`
- **LogRocket**
- **Datadog**

Key events to track:
- Authentication failures
- Database errors
- API errors
- User-facing errors

#### 2. Performance Monitoring
Monitor:
- Page load times
- API response times
- Database query times
- Bundle sizes

#### 3. User Analytics
Track:
- Active users
- Feature usage
- Conversion funnels
- Support ticket metrics

### Infrastructure Monitoring

#### 1. Platform-Specific Monitoring
- **Vercel**: Vercel Analytics, Function Logs
- **Railway**: Railway Metrics, Logs
- **Render**: Render Metrics, Log Streams

#### 2. Key Metrics to Monitor
- CPU usage
- Memory usage
- Disk I/O
- Network traffic
- Request rate
- Error rate
- Response time percentiles (p50, p95, p99)

### Logging Best Practices

1. **Structured Logging**: Use JSON format for logs
2. **Log Levels**: Use appropriate levels (debug, info, warn, error)
3. **Correlation IDs**: Include trace IDs for request correlation
4. **Avoid Sensitive Data**: Never log passwords, API keys, or PII
5. **Centralized Logging**: Aggregate logs in one place

### Alerting

Set up alerts for:
- High error rates (>5%)
- Slow API responses (>2s p95)
- Database connection issues
- Authentication spikes (potential brute force attacks)
- Disk space warnings

---

## Backup Strategies

### Database Backups

#### 1. Supabase Automated Backups
Supabase provides automatic backups:
- **Free Plan**: Daily backups for 7 days
- **Pro Plan**: Daily backups for 30 days + point-in-time recovery
- **Enterprise Plan**: Custom backup policies

Enable and configure backups in **Supabase Dashboard → Database → Backups**

#### 2. Manual Backups
Regularly export your database manually:
```bash
# Using Supabase CLI
supabase db dump --db-url postgresql://... > backup-$(date +%Y%m%d).sql

# Or using pg_dump
pg_dump "postgresql://postgres:password@db.your-project.supabase.co:5432/postgres" > backup-$(date +%Y%m%d).sql
```

Store backups:
- In a secure, encrypted location
- In multiple geographic regions
- With versioning enabled

#### 3. Test Restorations
Regularly test restoring from backups (quarterly at minimum):
1. Create a test Supabase project
2. Restore the backup
3. Verify data integrity
4. Test application functionality

### File Storage Backups

If using Supabase Storage or other file storage:
- Enable versioning
- Set up cross-region replication
- Regularly sync to a backup bucket

---

## Scaling Considerations

### Vertical vs. Horizontal Scaling

| Approach | When to Use | How |
|----------|-------------|-----|
| Vertical Scaling | Small to medium traffic | Upgrade your hosting plan (more CPU/RAM) |
| Horizontal Scaling | High traffic, high availability | Add more instances/containers |

### Scaling the Database

1. **Read Replicas**: Offload read queries to replicas
2. **Connection Pooling**: Use PgBouncer for connection management
3. **Partitioning**: Partition large tables by date or tenant
4. **Sharding**: For very large multi-tenant deployments (advanced)

### Scaling the Application

1. **Stateless Design**: QueueDesk is designed to be stateless
2. **Session Storage**: Use Supabase Auth sessions (stored in cookies/JWT)
3. **Auto-Scaling**: Enable auto-scaling on your hosting platform
4. **Edge Functions**: Move some logic to edge functions for lower latency

### Caching for Scale

1. **CDN**: Cache static assets at the edge
2. **Redis**: Add a Redis cache for frequently accessed data
3. **Database Query Caching**: Use Supabase's built-in caching or implement application-level caching

### Queue Management

For background tasks (email sending, AI processing):
- Use a queue system like BullMQ
- Process tasks asynchronously
- Monitor queue lengths and worker status

---

## Database Maintenance Guide

### Regular Maintenance Tasks

| Task | Frequency | How to Perform |
|------|-----------|----------------|
| Vacuum Database | Weekly | Supabase auto-vacuums, but monitor bloat |
| Analyze Tables | Weekly | `ANALYZE;` or let auto-analyze handle |
| Reindex | Monthly | `REINDEX;` or selectively reindex |
| Review Query Performance | Weekly | Check Supabase Query Performance report |
| Review Logs | Daily | Check for errors and warnings |
| Test Backups | Quarterly | Restore and verify |

### Vacuum and Analyze

PostgreSQL requires regular vacuuming to:
- Reclaim storage from deleted rows
- Update query planner statistics
- Prevent transaction ID wraparound

Supabase auto-vacuums, but you can monitor in **Database → Maintenance**

### Reindexing

Over time, indexes can become fragmented. Reindex periodically:

```sql
-- Reindex a specific table
REINDEX TABLE ticket;

-- Reindex a specific index
REINDEX INDEX idx_ticket_queue_status_created;

-- Reindex the entire database (maintenance window!)
REINDEX DATABASE postgres;
```

### Monitoring Database Health

Key metrics to watch in Supabase Dashboard:
- **Query Performance**: Slow queries, long-running queries
- **Connections**: Active vs. idle connections
- **Storage**: Database size, table sizes
- **Replication**: Lag (if using read replicas)
- **Locks**: Long-held locks

### Archive Old Data

Implement data archiving for:
- Closed tickets older than X years
- Audit logs older than Y months
- Old notifications

Options:
1. **Soft Delete**: Mark as deleted but keep in database
2. **Archive Table**: Move to a separate archive table
3. **External Storage**: Export to cold storage (S3, etc.)

### Schema Changes

When deploying schema changes in production:
1. Test thoroughly in staging first
2. Write backward-compatible migrations
3. Deploy during maintenance window
4. Have a rollback plan
5. Monitor performance after deployment

---

## Disaster Recovery Plan

### 1. RTO and RPO
Define your Recovery Time Objective (RTO) and Recovery Point Objective (RPO):
- **RTO**: How quickly you need to restore service
- **RPO**: How much data you can afford to lose

### 2. Incident Response Steps

1. **Detection**: Identify the issue via monitoring/alerting
2. **Assessment**: Determine impact and scope
3. **Containment**: Limit damage (e.g., disable problematic feature)
4. **Recovery**: Restore service from backups or failover
5. **Root Cause Analysis**: Understand what happened
6. **Prevention**: Implement fixes to prevent recurrence

### 3. Communication Plan

- Inform users about downtime
- Provide regular status updates
- Post-incident report after resolution

---

## Support and Maintenance

### SLA (Service Level Agreement)
Define your SLA for your users:
- Uptime target (e.g., 99.9%)
- Support response times
- Maintenance window schedule

### Documentation
Keep documentation up to date:
- Architecture diagrams
- Runbooks for common issues
- Contact information for responsible parties

---

## Additional Resources

- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/production-checklist)
- [Next.js Production Deployment](https://nextjs.org/docs/deployment)
- [Vercel Production Best Practices](https://vercel.com/docs/concepts/deployments/best-practices)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
