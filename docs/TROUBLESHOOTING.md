# QueueDesk v1.0 Troubleshooting Guide

## Table of Contents
- [Introduction](#introduction)
- [Getting Started](#getting-started)
- [Installation Issues](#installation-issues)
- [Database Issues](#database-issues)
- [Authentication Issues](#authentication-issues)
- [Email Issues](#email-issues)
- [Performance Issues](#performance-issues)
- [AI Feature Issues](#ai-feature-issues)
- [File Upload Issues](#file-upload-issues)
- [Slack Integration Issues](#slack-integration-issues)
- [SLA Issues](#sla-issues)
- [API Issues](#api-issues)
- [Logging and Debugging](#logging-and-debugging)
- [Getting Help](#getting-help)

## Introduction

This guide helps you diagnose and resolve common issues with QueueDesk. Use this as your first stop when encountering problems before contacting support.

## Getting Started

### Before You Begin

1. **Check the Basics**
   - Is the service running?
   - Are there any error messages?
   - When did the issue start?
   - What changed recently?

2. **Gather Information**
   - QueueDesk version
   - Browser/OS version
   - Error messages and screenshots
   - Steps to reproduce
   - Log files (if applicable)

3. **Check Status**
   - SaaS: Check status.queuedesk.com
   - Self-hosted: Check your monitoring dashboards

### Quick Diagnostic Steps

1. **Clear Browser Cache**
   ```
   Ctrl+Shift+Delete (Windows/Linux)
   Cmd+Shift+Delete (Mac)
   ```

2. **Try Incognito Mode**
   - Disable extensions
   - Rule out caching issues

3. **Check Browser Console**
   ```
   F12 → Console tab
   Look for red error messages
   ```

4. **Check Server Logs**
   ```bash
   docker-compose logs web
   docker-compose logs db
   ```

## Installation Issues

### Docker Container Won't Start

**Symptoms:**
- Container exits immediately
- "Connection refused" errors

**Diagnosis:**
```bash
# Check container status
docker-compose ps

# View container logs
docker-compose logs web

# Check port conflicts
netstat -tulpn | grep 3000
```

**Solutions:**
1. **Port Already In Use**
   ```bash
   # Find and stop the conflicting process
   lsof -i :3000
   kill -9 <PID>
   ```

2. **Missing Environment Variables**
   - Verify `.env` file exists
   - Check all required variables are set
   - Compare with `.env.example`

3. **Database Connection Issues**
   - Verify database is running
   - Check `DATABASE_URL` is correct
   - Test connection manually
   ```bash
   docker-compose exec db psql -U queuedesk -d queuedesk
   ```

### Database Migration Failed

**Symptoms:**
- Error during `npm run db:migrate`
- Schema mismatch errors

**Solutions:**
1. **Check Migration Status**
   ```bash
   docker-compose exec web npm run db:migrate:status
   ```

2. **Roll Back Last Migration**
   ```bash
   docker-compose exec web npm run db:migrate:down
   ```

3. **Restore from Backup**
   - If migrations failed and data is corrupted
   - Restore from latest backup
   - Try migrations again

### npm install Fails

**Symptoms:**
- Dependency installation errors
- Network timeouts
- Permission issues

**Solutions:**
1. **Clear npm Cache**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Use a Registry Mirror**
   ```bash
   npm config set registry https://registry.npmmirror.com
   ```

3. **Check File Permissions**
   ```bash
   # Fix permissions on project directory
   sudo chown -R $USER:$USER .
   ```

## Database Issues

### Connection Refused

**Symptoms:**
- `ECONNREFUSED` when connecting to database
- "No database connection" errors

**Diagnosis:**
```bash
# Check if database container is running
docker-compose ps db

# Test database connection
docker-compose exec web node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()', (err, res) => {
  console.log(err || res.rows[0]);
  pool.end();
});
"
```

**Solutions:**
1. **Restart Database**
   ```bash
   docker-compose restart db
   ```

2. **Check Database Credentials**
   - Verify `DATABASE_URL` in `.env`
   - Confirm username/password are correct

3. **Verify Database Exists**
   ```bash
   docker-compose exec db psql -U postgres -l
   ```

### Slow Database Queries

**Symptoms:**
- Pages load slowly
- Timeout errors
- High CPU usage by database

**Diagnosis:**
```sql
-- Check for long-running queries
SELECT pid, now() - query_start as duration, query
FROM pg_stat_activity
WHERE state = 'active'
ORDER BY duration DESC;

-- Check for missing indexes
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0;
```

**Solutions:**
1. **Add Missing Indexes**
   ```sql
   -- Example: Add index on common query column
   CREATE INDEX idx_tickets_created_at ON tickets(created_at);
   ```

2. **Optimize Queries**
   - Look for N+1 queries
   - Use pagination for large datasets
   - Cache frequent queries

3. **Increase Database Resources**
   - Allocate more memory
   - Add CPU cores
   - Use faster storage

### Database Disk Full

**Symptoms:**
- "No space left on device" errors
- Database becomes read-only

**Solutions:**
1. **Clean Up Old Data**
   ```sql
   -- Archive old closed tickets
   DELETE FROM tickets WHERE status = 'closed' AND closed_at < NOW() - INTERVAL '2 years';
   ```

2. **Increase Disk Space**
   - Resize volume
   - Add additional storage

3. **Vacuum Database**
   ```sql
   VACUUM ANALYZE;
   ```

## Authentication Issues

### Can't Log In

**Symptoms:**
- "Invalid credentials" error
- "User not found" error
- Login button does nothing

**Diagnosis:**
1. Check browser console for errors
2. Verify user exists in database
3. Check authentication service logs

**Solutions:**
1. **Reset Password**
   - Use "Forgot password" feature
   - Or reset via admin panel

2. **Check User Status**
   ```sql
   SELECT email, status FROM users WHERE email = 'user@example.com';
   ```
   - Make sure account is active, not suspended

3. **Clear Session Cookies**
   - Browser settings → Clear cookies
   - Or use incognito mode

4. **Verify Supabase Configuration**
   - Check Supabase URL and keys
   - Confirm auth service is enabled

### OAuth/Social Login Not Working

**Symptoms:**
- OAuth buttons don't respond
- Error after redirect
- "Callback URL mismatch"

**Solutions:**
1. **Check Callback URLs**
   - Verify callback URLs in OAuth provider settings
   - Must match exactly (including protocol and port)

2. **Verify Client ID/Secret**
   - Double-check credentials are correct
   - No trailing spaces

3. **Check Redirect URI Configuration**
   - In Supabase dashboard → Authentication → URL Configuration
   - Add your domain to allowed redirect URLs

### Session Expires Frequently

**Symptoms:**
- Getting logged out unexpectedly
- "Session expired" errors

**Solutions:**
1. **Check Session Configuration**
   - Verify JWT expiration settings
   - Adjust session timeout if needed

2. **Check for Concurrent Logins**
   - Some configurations limit concurrent sessions
   - Check audit logs for multiple login events

3. **Verify Cookie Settings**
   - Ensure cookies are being set correctly
   - Check SameSite and Secure attributes

## Email Issues

### Emails Not Sending

**Symptoms:**
- No confirmation emails
- Notifications not being sent
- "Email failed to send" errors

**Diagnosis:**
```bash
# Check email service logs
docker-compose logs web | grep -i email
```

**Solutions:**
1. **Verify Email Configuration**
   - Check `.env` for email provider settings
   - Verify API key/SMTP credentials

2. **Test Email Sending**
   ```bash
   docker-compose exec web node -e "
   const { resend } = require('./src/lib/email');
   resend.emails.send({
     from: 'test@yourdomain.com',
     to: 'your-email@example.com',
     subject: 'Test',
     html: '<p>Test email</p>'
   }).then(console.log).catch(console.error);
   "
   ```

3. **Check Email Provider Status**
   - Resend status page
   - SMTP server status

4. **Check Spam Folder**
   - Emails might be marked as spam
   - Add sender to contacts

### Email Intake Not Creating Tickets

**Symptoms:**
- Emails sent to queue address don't create tickets
- No errors visible

**Solutions:**
1. **Verify Email Forwarding**
   - Confirm emails are being forwarded correctly
   - Check forwarding service logs

2. **Check Webhook Configuration**
   - Verify webhook URL is correct
   - Check webhook signature validation

3. **Review Email Processing Logs**
   ```bash
   docker-compose logs web | grep -i "email intake"
   ```

4. **Check for Bounced Emails**
   - Look for bounce notifications
   - Verify email address validity

## Performance Issues

### Slow Page Loads

**Symptoms:**
- Pages take seconds to load
- Loading spinners stay visible
- Timeout errors

**Diagnosis:**
1. **Check Browser DevTools**
   - F12 → Network tab
   - Look for slow requests

2. **Check Server Response Times**
   - Look at APM (Application Performance Monitoring)
   - Check logs for slow queries

**Solutions:**
1. **Enable Caching**
   - Configure Redis
   - Enable CDN for static assets

2. **Optimize Database Queries**
   - Add missing indexes
   - Optimize slow queries
   - Use pagination

3. **Scale Resources**
   - Add more application servers
   - Upgrade database instance
   - Use load balancer

### High Memory Usage

**Symptoms:**
- System slowdowns
- Out-of-memory crashes
- Container restarts

**Solutions:**
1. **Check Memory Leaks**
   - Use tools like `clinic.js`
   - Look for growing memory usage over time

2. **Optimize Image Processing**
   - Use streaming for large files
   - Downsize images on upload

3. **Adjust Memory Limits**
   ```yaml
   # docker-compose.yml
   services:
     web:
       deploy:
         resources:
           limits:
             memory: 4G
   ```

4. **Restart Periodically**
   - Set up health checks
   - Configure auto-restart policies

### Background Jobs Stuck

**Symptoms:**
- Notifications not being sent
- AI tasks not completing
- Queue backlog growing

**Solutions:**
1. **Check Queue Status**
   ```bash
   docker-compose exec web npm run queue:status
   ```

2. **Restart Queue Workers**
   ```bash
   docker-compose restart worker
   ```

3. **Clear Stuck Jobs**
   ```bash
   docker-compose exec web npm run queue:clear
   ```

4. **Increase Worker Count**
   ```yaml
   # docker-compose.yml
   worker:
     deploy:
       replicas: 3
   ```

## AI Feature Issues

### AI Suggestions Not Appearing

**Symptoms:**
- No AI classification suggestions
- No reply suggestions
- No ticket summaries

**Diagnosis:**
```bash
# Check AI service logs
docker-compose logs web | grep -i ai
```

**Solutions:**
1. **Verify API Key**
   - Check `OPENAI_API_KEY` in `.env`
   - Confirm key has sufficient credits
   - Verify key permissions

2. **Test API Connectivity**
   ```bash
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer $OPENAI_API_KEY"
   ```

3. **Check Feature Flags**
   - Verify AI features are enabled in admin settings
   - Check user/team permissions

4. **Review Content Filters**
   - Some content may trigger safety filters
   - Check logs for "content policy" errors

### AI Responses Are Low Quality

**Symptoms:**
- Irrelevant suggestions
- Inaccurate classifications
- Poor summaries

**Solutions:**
1. **Use Better Model**
   ```bash
   # .env
   AI_MODEL=gpt-4  # instead of gpt-3.5-turbo
   ```

2. **Provide More Context**
   - Ensure tickets have detailed descriptions
   - Add relevant tags and categories

3. **Fine-Tune Prompts**
   - Customize prompt templates
   - Provide examples of good responses

4. **Train with Your Data**
   - Use fine-tuning (Enterprise only)
   - Provide feedback on suggestions

### AI Requests Timing Out

**Symptoms:**
- "AI service unavailable" errors
- Long waits for suggestions

**Solutions:**
1. **Increase Timeout**
   ```bash
   # .env
   AI_TIMEOUT=60000  # 60 seconds
   ```

2. **Add Retry Logic**
   - Configure automatic retries for transient errors
   - Implement exponential backoff

3. **Use Streaming**
   - For long responses, enable streaming
   - Show partial results as they come in

4. **Fallback to Cached**
   - Have cached suggestions ready
   - Show "Thinking..." indicator

## File Upload Issues

### Uploads Failing

**Symptoms:**
- "Upload failed" errors
- Files don't appear after upload
- Progress bar stuck

**Solutions:**
1. **Check File Size**
   - Maximum file size is 25MB
   - Compress large files before upload

2. **Check File Type**
   - Verify file type is allowed
   - Check allowed extensions list

3. **Check Storage Configuration**
   - Verify S3/Storage provider credentials
   - Check bucket permissions

4. **Test Upload Manually**
   ```bash
   # Test with AWS CLI
   aws s3 cp test-file.txt s3://your-bucket/test/
   ```

### Uploads Slow

**Symptoms:**
- Takes a long time to upload files
- Browser freezes during upload

**Solutions:**
1. **Use Chunked Uploads**
   - Enable for large files
   - Shows progress better

2. **Compress Files First**
   - Zip multiple files
   - Compress images before upload

3. **Check Network Speed**
   - Verify internet connection
   - Try on different network

4. **Use CDN**
   - Upload through CDN endpoint
   - Better worldwide performance

## Slack Integration Issues

### Slack Notifications Not Sending

**Symptoms:**
- No messages in Slack channels
- "Slack integration failed" errors

**Solutions:**
1. **Reconnect Slack**
   - Go to Admin → Integrations → Slack
   - Disconnect and reconnect

2. **Check Bot Permissions**
   - Verify bot has required scopes
   - Check bot is in the channel

3. **Test Webhook**
   ```bash
   curl -X POST https://slack.com/api/chat.postMessage \
     -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"channel":"#general","text":"Test message"}'
   ```

### Slack Interactions Not Working

**Symptoms:**
- Buttons in Slack don't work
- Modal windows won't open

**Solutions:**
1. **Verify Request URL**
   - Check in Slack app settings
   - Must be HTTPS and publicly accessible

2. **Check Signing Secret**
   - Verify `SLACK_SIGNING_SECRET` is correct
   - No extra whitespace

3. **Review Interaction Logs**
   ```bash
   docker-compose logs web | grep -i slack
   ```

## SLA Issues

### SLA Timers Not Working

**Symptoms:**
- SLA countdown not showing
- SLA status incorrect
- No breach notifications

**Solutions:**
1. **Verify SLA Policy**
   - Check policy is active
   - Verify conditions are met
   - Check business hours configuration

2. **Check Cron Jobs**
   - Verify SLA monitor is running
   - Check cron job logs
   ```bash
   docker-compose logs worker | grep -i sla
   ```

3. **Recalculate SLA**
   ```bash
   docker-compose exec web npm run sla:recalculate
   ```

### SLA Breaches Not Detected

**Symptoms:**
- Tickets breaching SLA but no alerts
- SLA compliance reports inaccurate

**Solutions:**
1. **Check Time Zone Settings**
   - Verify server time zone
   - Check user/organization time zone
   - Confirm business hours use correct time zone

2. **Check Status Transitions**
   - Verify ticket status changes reset SLA correctly
   - Check if "waiting for customer" pauses timer

3. **Review Notification Settings**
   - Confirm alerts are enabled
   - Check notification recipients
   - Verify notification channels

## API Issues

### API Authentication Fails

**Symptoms:**
- "Invalid API key" error
- "Unauthorized" responses
- 401 status codes

**Solutions:**
1. **Verify API Key**
   - Check key hasn't expired
   - Confirm key has required permissions
   - No extra whitespace in key

2. **Check Authentication Header**
   ```bash
   # Correct format
   curl -H "Authorization: Bearer your-api-key" https://api.queuedesk.com/v1/tickets
   ```

3. **Verify IP Whitelist**
   - Check if your IP is allowed
   - Update whitelist if needed

### API Rate Limits Hit

**Symptoms:**
- "Too many requests" error
- 429 status codes

**Solutions:**
1. **Implement Retries with Backoff**
   ```javascript
   // Example with exponential backoff
   async function fetchWithRetry(url, options, retries = 3) {
     try {
       const response = await fetch(url, options);
       if (response.status === 429 && retries > 0) {
         const waitTime = Math.pow(2, 3 - retries) * 1000;
         await new Promise(r => setTimeout(r, waitTime));
         return fetchWithRetry(url, options, retries - 1);
       }
       return response;
     } catch (e) {
       if (retries > 0) {
         return fetchWithRetry(url, options, retries - 1);
       }
       throw e;
     }
   }
   ```

2. **Batch Requests**
   - Use bulk endpoints if available
   - Combine multiple operations

3. **Upgrade Plan**
   - Higher rate limits on paid plans

### API Response Slow

**Symptoms:**
- API takes seconds to respond
- Timeout errors

**Solutions:**
1. **Use Pagination**
   - Don't fetch all records at once
   - Use `limit` and `offset` parameters

2. **Request Only Needed Fields**
   - Use `fields` parameter to select specific fields
   - Reduces response size

3. **Cache Responses**
   - Cache frequent API calls
   - Set appropriate TTL

## Logging and Debugging

### Enabling Debug Logging

**Temporarily Enable Debug Logs:**
```bash
# .env
LOG_LEVEL=debug
```

**Restart Services:**
```bash
docker-compose restart web worker
```

### Where to Find Logs

**Docker Compose:**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f web
docker-compose logs -f db
```

**System Logs (Linux):**
```bash
# System logs
journalctl -u queuedesk -f

# Kernel logs
dmesg -w
```

### Using the Debugger

**Node.js Debugger:**
```bash
# Start with debug flag
docker-compose exec web node --inspect=0.0.0.0:9229 server.js
```

**Connect with Chrome DevTools:**
1. Open `chrome://inspect`
2. Click "Configure"
3. Add `localhost:9229`
4. Click "Inspect"

## Getting Help

### When to Contact Support

Contact QueueDesk support if:
- You've tried all steps in this guide
- Issue is critical (SEV-1/SEV-2)
- Data loss has occurred
- Security issue suspected

### What to Include

When contacting support, provide:
1. QueueDesk version
2. Environment (SaaS/Self-hosted)
3. Steps to reproduce
4. Error messages and screenshots
5. Log files (redact sensitive data!)
6. When the issue started
7. Any recent changes

### Support Channels

- **Email**: support@queuedesk.com
- **Status Page**: status.queuedesk.com
- **Documentation**: docs.queuedesk.com
- **Community**: community.queuedesk.com (Enterprise only)
- **Phone**: +1-555-QUEUEDESK (Enterprise only)

### Response Times

- **Critical (SEV-1)**: 15 minutes
- **High (SEV-2)**: 1 hour
- **Medium (SEV-3)**: 4 hours
- **Low (SEV-4)**: 1 business day

## Additional Resources

- [Operations Guide](./OPERATIONS.md)
- [Admin Guide](./ADMIN_GUIDE.md)
- [API Documentation](./API.md)
- [Security Documentation](../SECURITY.md)
- [GitHub Issues](https://github.com/queuedesk/queuedesk/issues)
- [Changelog](../CHANGELOG.md)
