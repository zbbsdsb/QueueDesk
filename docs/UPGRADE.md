# QueueDesk Upgrade Guide

## Table of Contents
- [Introduction](#introduction)
- [Versioning](#versioning)
- [Pre-Upgrade Checklist](#pre-upgrade-checklist)
- [Upgrade Paths](#upgrade-paths)
- [Upgrading from 0.x to 1.0](#upgrading-from-0x-to-10)
- [Upgrading from 1.0.x](#upgrading-from-10x)
- [Rollback Procedures](#rollback-procedures)
- [Post-Upgrade Verification](#post-upgrade-verification)
- [Troubleshooting](#troubleshooting)

## Introduction

This guide provides step-by-step instructions for upgrading QueueDesk to the latest version. Always back up your data before performing an upgrade.

## Versioning

QueueDesk follows [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features, backwards compatible
- **PATCH**: Bug fixes, backwards compatible

Example: `1.2.3`
- Major: 1
- Minor: 2
- Patch: 3

## Pre-Upgrade Checklist

Before every upgrade, complete these steps:

### 1. Read Release Notes
Check the [Changelog](../CHANGELOG.md) for:
- Breaking changes
- New features
- Deprecations
- Known issues

### 2. Backup Your Data
```bash
# Backup database
docker-compose exec db pg_dump -U queuedesk queuedesk > backup_$(date +%Y%m%d_%H%M%S).sql
gzip backup_*.sql

# Backup files
docker-compose exec web tar -czf files_backup_$(date +%Y%m%d_%H%M%S).tar.gz /app/uploads

# Backup config
cp .env .env.backup_$(date +%Y%m%d_%H%M%S)
```

### 3. Test in Staging First
Always test upgrades in a staging environment:
1. Create a staging copy of production
2. Perform the upgrade
3. Verify all functionality
4. Check for errors
5. Only then upgrade production

### 4. Notify Users
- Announce maintenance window
- Inform users of expected downtime
- Communicate new features/changes

### 5. Prepare Rollback Plan
- Know how to roll back
- Have backups ready
- Test rollback procedure

## Upgrade Paths

### Supported Upgrade Paths
- **0.x → 1.0**: Follow [Upgrading from 0.x to 1.0](#upgrading-from-0x-to-10)
- **1.0.x → 1.0.y**: Patch upgrade (no breaking changes)
- **1.0.x → 1.y.z**: Minor upgrade (backwards compatible)

### Unsupported Paths
- Direct upgrade from pre-0.1 releases
- Skipping major versions (upgrade incrementally)

## Upgrading from 0.x to 1.0

This is a major upgrade with breaking changes. Please read carefully.

### Step 1: Review Breaking Changes

1. **Authentication System**
   - Supabase Auth replaces custom auth
   - Existing users need to reset passwords
   - OAuth providers require reconfiguration

2. **Database Schema**
   - Significant schema changes
   - Data migration required
   - Some tables renamed/reorganized

3. **API Changes**
   - API v1 replaces v0
   - Endpoint URLs changed
   - Authentication method updated
   - See [API Migration Guide](#api-migration)

4. **Configuration**
   - New environment variables required
   - Some variables renamed
   - Review [Configuration Reference](#configuration-reference)

### Step 2: Full Backup

```bash
# Stop services
docker-compose down

# Full database backup
docker-compose run --rm db pg_dumpall -U postgres > full_backup_$(date +%Y%m%d_%H%M%S).sql
gzip full_backup_*.sql

# Backup all volumes
mkdir -p backup_volumes
docker run --rm -v queuedesk_data:/data -v $(pwd)/backup_volumes:/backup alpine cp -r /data /backup/
```

### Step 3: Update Code

```bash
# Get latest code
git fetch origin
git checkout 1.0.0

# Review changes
git diff 0.x..1.0.0
```

### Step 4: Update Configuration

```bash
# Backup old config
cp .env .env.0.x

# Create new config from example
cp .env.example .env

# Migrate old config values to new format
# See Configuration Reference below
```

**New Required Environment Variables:**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# New in 1.0
FEATURE_AI_ENABLED=true
FEATURE_SLA_ENABLED=true
```

### Step 5: Database Migration

The 0.x to 1.0 migration is a multi-step process:

```bash
# Start database
docker-compose up -d db

# Wait for database to be ready
docker-compose run --rm wait-for db:5432

# Run pre-migration checks
docker-compose exec web npm run db:pre-migrate-check

# Run migration
docker-compose exec web npm run db:migrate -- --to 1.0.0

# Verify migration
docker-compose exec web npm run db:verify-migration
```

**If Migration Fails:**
1. Don't panic - you have backups!
2. Check error logs
3. Rollback using [Rollback Procedures](#rollback-procedures)
4. Fix issues in staging first
5. Try again

### Step 6: User Migration

Due to auth system changes, users need to be migrated:

```bash
# Run user migration script
docker-compose exec web npm run user:migrate

# Send password reset emails to all users
docker-compose exec web npm run user:send-reset-emails
```

### Step 7: Update Integrations

1. **Slack Integration**
   - Reconnect in admin settings
   - Update bot permissions

2. **Email Providers**
   - Reconfigure email settings
   - Verify sending works

3. **API Integrations**
   - Update to API v1
   - See [API Migration Guide](#api-migration)

### Step 8: Complete the Upgrade

```bash
# Start all services
docker-compose up -d

# Run post-upgrade tasks
docker-compose exec web npm run post-upgrade

# Verify installation
docker-compose exec web npm run health-check
```

## Upgrading from 1.0.x

For patch and minor releases, the process is simpler:

### Step 1: Check Changelog

Always review the [Changelog](../CHANGELOG.md) for:
- New features you might want to enable
- Deprecations
- Any manual actions needed

### Step 2: Backup

```bash
# Quick backup
docker-compose exec db pg_dump -U queuedesk queuedesk > quick_backup_$(date +%Y%m%d_%H%M%S).sql
```

### Step 3: Pull Updates

```bash
# Get latest code
git fetch origin
git checkout 1.0.x  # or specific tag

# Pull new images
docker-compose pull
```

### Step 4: Run Migrations

```bash
# Run database migrations
docker-compose exec web npm run db:migrate

# Check migration status
docker-compose exec web npm run db:migrate:status
```

### Step 5: Restart Services

```bash
# Restart with new version
docker-compose up -d --force-recreate
```

### Step 6: Verify

Check that everything works:
1. Log in works
2. Basic functionality
3. No errors in logs
4. Health checks pass

## Rollback Procedures

If something goes wrong, roll back immediately.

### Rollback from 1.0 to 0.x

```bash
# Stop services
docker-compose down

# Restore database
gunzip full_backup_*.sql.gz
docker-compose run --rm db psql -U postgres -f full_backup_*.sql

# Restore config
cp .env.0.x .env

# Checkout old version
git checkout 0.x

# Start old version
docker-compose up -d

# Verify
docker-compose exec web npm run health-check
```

### Rollback from 1.0.x to 1.0.y

```bash
# Stop services
docker-compose down

# Restore database
gunzip quick_backup_*.sql.gz
docker-compose exec db psql -U queuedesk -d queuedesk -f quick_backup_*.sql

# Checkout previous version
git checkout 1.0.y  # replace with actual version

# Restart
docker-compose up -d

# Verify
docker-compose exec web npm run health-check
```

## Post-Upgrade Verification

After every upgrade, verify:

### 1. Health Checks
```bash
# Check all services
docker-compose ps

# Check application health
curl http://localhost:3000/health

# Check database connection
docker-compose exec db psql -U queuedesk -d queuedesk -c "SELECT 1"
```

### 2. Basic Functionality
- [ ] Log in works
- [ ] Create ticket works
- [ ] View ticket list works
- [ ] Update ticket works
- [ ] Email notifications send
- [ ] Search works
- [ ] AI features (if enabled) work

### 3. Check Logs for Errors
```bash
# Check for errors
docker-compose logs web | grep -i error
docker-compose logs db | grep -i error
```

### 4. Verify Data Integrity
- [ ] Users still exist
- [ ] Tickets are all there
- [ ] Comments are intact
- [ ] Attachments work

### 5. Performance Check
- [ ] Page load times normal
- [ ] No slow queries
- [ ] API responds quickly

## Configuration Reference

### New Environment Variables in 1.0

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `FEATURE_AI_ENABLED` | No | Enable AI features (default: true) |
| `FEATURE_SLA_ENABLED` | No | Enable SLA features (default: true) |
| `REDIS_URL` | No | Redis for caching/queues |

### Renamed Environment Variables

| Old Name | New Name | Notes |
|----------|----------|-------|
| `DB_URL` | `DATABASE_URL` | Format unchanged |
| `EMAIL_API_KEY` | `RESEND_API_KEY` | If using Resend |

### Removed Environment Variables

- `AUTH_SECRET` (replaced by Supabase)
- `SESSION_SECRET` (replaced by Supabase)

## API Migration

### From API v0 to v1

#### Base URL Change
```javascript
// Old (v0)
const baseUrl = 'https://api.queuedesk.com/v0'

// New (v1)
const baseUrl = 'https://api.queuedesk.com/v1'
```

#### Authentication Change
```javascript
// Old (v0)
headers: { 'X-API-Key': 'your-key' }

// New (v1)
headers: { 'Authorization': 'Bearer your-key' }
```

#### Endpoint Changes

| v0 Endpoint | v1 Endpoint | Notes |
|-------------|-------------|-------|
| `GET /tickets` | `GET /tickets` | Same, new query params |
| `POST /tickets` | `POST /tickets` | Request body changed |
| `GET /tickets/:id` | `GET /tickets/:id` | Response format changed |
| `PUT /tickets/:id` | `PATCH /tickets/:id` | Method changed |
| `DELETE /tickets/:id` | Removed | Use status=closed instead |

See [API Documentation](./API.md) for full v1 API reference.

### Migration Example

```javascript
// Old (v0)
async function getTickets() {
  const response = await fetch('https://api.queuedesk.com/v0/tickets', {
    headers: { 'X-API-Key': process.env.API_KEY }
  })
  return response.json()
}

// New (v1)
async function getTickets() {
  const response = await fetch('https://api.queuedesk.com/v1/tickets', {
    headers: { 'Authorization': `Bearer ${process.env.API_KEY}` }
  })
  const data = await response.json()
  return data.tickets  // v1 wraps in object
}
```

## Troubleshooting

### Migration Failures

**Symptom**: Database migration fails with error

**Solutions**:
1. Check migration logs: `docker-compose logs web | grep -i migrate`
2. Verify backup exists
3. Rollback and investigate in staging
4. Check you have enough disk space
5. Verify database user has all permissions

### Post-Upgrade Login Issues

**Symptom**: Can't log in after upgrade

**Solutions**:
1. Clear cookies and try again
2. Request password reset
3. Check Supabase auth configuration
4. Verify user was migrated correctly:
   ```sql
   SELECT email, status FROM auth.users WHERE email = 'user@example.com'
   ```

### Missing Features

**Symptom**: Features don't show up after upgrade

**Solutions**:
1. Clear browser cache
2. Hard refresh: Ctrl+Shift+R
3. Check feature flags in admin settings
4. Verify environment variables set correctly

### Performance Degradation

**Symptom**: System slower after upgrade

**Solutions**:
1. Run database analyze:
   ```sql
   VACUUM ANALYZE;
   ```
2. Check for long-running queries
3. Verify indexes exist
4. Restart services to clear cache

### API Integration Breaks

**Symptom**: External integrations don't work

**Solutions**:
1. Update to API v1 endpoints
2. Update authentication header
3. Test with new API
4. Check API logs for errors

## Additional Resources

- [Changelog](../CHANGELOG.md)
- [API Documentation](./API.md)
- [Operations Guide](./OPERATIONS.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [GitHub Releases](https://github.com/queuedesk/queuedesk/releases)
- [Support](https://queuedesk.com/support)

## Need Help?

If you encounter issues not covered in this guide:
1. Check the [Troubleshooting Guide](./TROUBLESHOOTING.md)
2. Search [GitHub Issues](https://github.com/queuedesk/queuedesk/issues)
3. Contact support with:
   - Your current version
   - Version you're upgrading from
   - Error messages
   - Steps to reproduce
