# QueueDesk v1.0 Operations Guide

## Table of Contents
- [Introduction](#introduction)
- [Deployment Options](#deployment-options)
- [Infrastructure Requirements](#infrastructure-requirements)
- [Installation Guide](#installation-guide)
- [Configuration](#configuration)
- [Monitoring](#monitoring)
- [Backup and Recovery](#backup-and-recovery)
- [Scaling](#scaling)
- [Security](#security)
- [Maintenance](#maintenance)
- [Disaster Recovery](#disaster-recovery)
- [Incident Response](#incident-response)
- [Performance Tuning](#performance-tuning)

## Introduction

This guide provides comprehensive operational procedures for running QueueDesk in production environments. It covers deployment, configuration, monitoring, maintenance, and troubleshooting procedures for system administrators and DevOps teams.

## Deployment Options

### SaaS Deployment

QueueDesk is available as a managed SaaS solution:
- No infrastructure management required
- Automatic updates and backups
- 99.9% uptime SLA
- Multi-region redundancy
- 24/7 support

Benefits:
- Quick setup (minutes, not days)
- No maintenance overhead
- Scales automatically
- Enterprise-grade security

### Self-Hosted Deployment

For organizations requiring full control:
- Deploy on your own infrastructure
- Full data sovereignty
- Custom configurations
- Air-gapped deployment option

## Infrastructure Requirements

### Minimum Requirements (Development/Small Team)

- **CPU**: 2 cores
- **Memory**: 4 GB RAM
- **Storage**: 20 GB SSD
- **OS**: Linux (Ubuntu 20.04+ recommended)
- **Docker**: 20.10+ or compatible container runtime

### Recommended Requirements (Production - 100 Users)

- **CPU**: 4 cores
- **Memory**: 8 GB RAM
- **Storage**: 100 GB SSD
- **OS**: Linux (Ubuntu 20.04+/RHEL 8+)
- **Database**: PostgreSQL 13+
- **Redis**: 6+ (for caching and queues)

### Enterprise Requirements (500+ Users)

- **CPU**: 8+ cores
- **Memory**: 16+ GB RAM
- **Storage**: 500+ GB SSD (with backups)
- **Database**: PostgreSQL 13+ (primary + replica)
- **Redis**: 6+ (cluster mode recommended)
- **Load Balancer**: Nginx or HAProxy
- **Object Storage**: S3-compatible (for attachments)

### Cloud Provider Support

QueueDesk can be deployed on:
- **AWS**: EC2, ECS, EKS
- **Azure**: Virtual Machines, AKS
- **Google Cloud**: Compute Engine, GKE
- **DigitalOcean**: Droplets, Kubernetes
- **Vercel**: For frontend (Next.js optimized)
- **Railway**: Simplified deployment
- **Render**: Full-stack hosting

## Installation Guide

### Docker Compose Installation (Recommended for Self-Hosted)

1. **Prerequisites**
   ```bash
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   
   # Install Docker Compose
   sudo apt-get install docker-compose-plugin
   ```

2. **Download QueueDesk**
   ```bash
   git clone https://github.com/your-org/queuedesk.git
   cd queuedesk
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. **Start Services**
   ```bash
   docker-compose up -d
   ```

5. **Initialize Database**
   ```bash
   docker-compose exec web npm run db:migrate
   docker-compose exec web npm run db:seed
   ```

6. **Access QueueDesk**
   - Open http://localhost:3000
   - Log in with admin credentials from the seed

### Kubernetes Deployment

1. **Create Namespace**
   ```bash
   kubectl create namespace queuedesk
   ```

2. **Deploy Using Helm**
   ```bash
   helm repo add queuedesk https://charts.queuedesk.com
   helm install queuedesk queuedesk/queuedesk \
     --namespace queuedesk \
     -f values.yaml
   ```

3. **Verify Deployment**
   ```bash
   kubectl get pods -n queuedesk
   kubectl get services -n queuedesk
   ```

### Vercel Deployment (Frontend)

1. **Connect Repository**
   - Go to vercel.com
   - Import your QueueDesk repository

2. **Configure Environment Variables**
   - Set all required variables in Vercel dashboard

3. **Deploy**
   - Click "Deploy"
   - Vercel automatically builds and deploys

### Railway Deployment

1. **Connect Repository**
   - Go to railway.app
   - New Project → Deploy from repo

2. **Add Services**
   - Add PostgreSQL database
   - Add Redis (optional)
   - Add web service

3. **Configure**
   - Set environment variables
   - Connect services

4. **Deploy**
   - Railway handles the rest

## Configuration

### Environment Variables

Key configuration options:

```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://queuedesk.yourcompany.com

# Database
DATABASE_URL=postgresql://user:pass@host:5432/queuedesk

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Redis (optional, for caching)
REDIS_URL=redis://localhost:6379

# Email
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_123456789
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@yourdomain.com
SMTP_PASS=your-smtp-password

# AI
OPENAI_API_KEY=sk-your-openai-key
AI_MODEL=gpt-4

# Storage
STORAGE_PROVIDER=s3
S3_BUCKET=queuedesk-attachments
S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this
ENCRYPTION_KEY=your-encryption-key-for-sensitive-data

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
```

### Database Configuration

**PostgreSQL Tuning (postgresql.conf):**
```ini
# Connection Settings
max_connections = 100

# Memory Settings
shared_buffers = 2GB
effective_cache_size = 6GB
work_mem = 32MB
maintenance_work_mem = 512MB

# Checkpoint Settings
min_wal_size = 1GB
max_wal_size = 4GB
checkpoint_completion_target = 0.9

# Query Tuning
random_page_cost = 1.1
effective_io_concurrency = 200
```

### Application Configuration

**Queue Settings:**
- Configure job queues for email, AI, notifications
- Set concurrency limits
- Configure retry policies

**Rate Limiting:**
- API rate limits
- Login attempt limits
- File upload limits

**Cache Settings:**
- TTL for cached data
- Cache invalidation rules

## Monitoring

### System Metrics

Monitor key metrics:

- **CPU Usage**: Keep below 70% average
- **Memory Usage**: Keep below 80%
- **Disk Space**: Keep at least 20% free
- **Network Traffic**: Monitor for anomalies
- **Database Connections**: Monitor connection pool usage

### Application Metrics

- **Request Rate**: Requests per second
- **Error Rate**: 5xx and 4xx errors
- **Response Time**: P95, P99 latency
- **Queue Lengths**: Background job queues
- **SLA Compliance**: Ticket response times

### Logging

**Log Levels:**
- `error`: Critical errors requiring attention
- `warn`: Warnings about potential issues
- `info`: General operational information
- `debug`: Detailed debugging information

**Log Retention:**
- Production: 30 days
- Debug logs: 7 days
- Audit logs: 1 year (or per compliance requirements)

**Log Aggregation:**
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Grafana Loki
- Datadog
- Sentry (for error tracking)

### Health Checks

QueueDesk provides health check endpoints:

```
/health
/health/live
/health/ready
/health/db
/health/cache
/health/email
```

**Sample Health Check Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.0",
  "checks": {
    "database": "healthy",
    "cache": "healthy",
    "email": "healthy"
  }
}
```

### Alerting

Set up alerts for:

- **Critical**:
  - Service down
  - Database not responding
  - High error rate (>5%)

- **Warning**:
  - High CPU usage (>80% for 5 minutes)
  - Low disk space (<10% free)
  - SLA breach rate increasing

- **Info**:
  - Deployment completed
  - Backup completed
  - New version available

## Backup and Recovery

### Database Backups

**Automated Backups:**
```bash
# pg_dump for PostgreSQL
pg_dump -U queuedesk -h localhost queuedesk > backup_$(date +%Y%m%d_%H%M%S).sql

# Compress
gzip backup_*.sql
```

**Backup Schedule:**
- Full backup: Daily at 2 AM
- Transaction logs: Every 15 minutes (WAL archiving)
- Retention: 30 days daily, 12 monthly

### File Backups

- User uploads and attachments
- Configuration files
- SSL certificates

**Using S3/Object Storage:**
```bash
aws s3 sync /path/to/attachments s3://queuedesk-backups/attachments/$(date +%Y%m%d)/
```

### Backup Verification

Regularly test backups:
- Monthly restore tests
- Verify data integrity
- Test application works with restored data

### Recovery Procedures

**Database Recovery:**
```bash
# Stop application
docker-compose stop web

# Restore from backup
gunzip backup_20240101_020000.sql.gz
psql -U queuedesk -h localhost queuedesk < backup_20240101_020000.sql

# Restart application
docker-compose up -d
```

## Scaling

### Horizontal Scaling

Add more application servers:
```yaml
# docker-compose.yml
services:
  web:
    deploy:
      replicas: 3
```

With a load balancer:
- Nginx
- HAProxy
- Cloud provider load balancer (AWS ALB, etc.)

### Database Scaling

**Read Replicas:**
- Offload read queries
- Improve query performance
- Provide failover capability

**Connection Pooling:**
- Use PgBouncer
- Configure pool size appropriately
- Monitor connection usage

### Caching Strategy

Implement multi-layer caching:
1. **Application Cache**: Redis for frequent data
2. **Response Cache**: CDN for static assets
3. **Database Cache**: Materialized views, query caching

**Cache Invalidation:**
- Time-based expiration
- Event-based invalidation
- Write-through caching

## Security

### Network Security

- **Firewall Rules**: Restrict incoming traffic
- **HTTPS Only**: Enforce TLS 1.2+
- **WAF**: Web Application Firewall (Cloudflare, AWS WAF, etc.)
- **Private Network**: Keep database in private subnet

### Application Security

- **Regular Updates**: Keep QueueDesk and dependencies updated
- **Dependency Scanning**: Scan for vulnerabilities
- **Input Validation**: All inputs validated server-side
- **CSRF Protection**: Built-in CSRF tokens
- **XSS Protection**: Output encoding

### Data Security

- **Encryption at Rest**: Database encryption
- **Encryption in Transit**: TLS for all communications
- **Key Management**: Use secure key vault (AWS KMS, HashiCorp Vault)
- **Data Masking**: Mask sensitive data in logs and UI

### Access Control

- **Principle of Least Privilege**: Grant minimum necessary permissions
- **Multi-Factor Authentication**: Require for admin accounts
- **Session Management**: Short-lived sessions, secure cookies
- **Audit Logs**: Log all access and changes

### Compliance

- **GDPR**: Data subject rights, consent management
- **HIPAA**: (If applicable) BAA, access controls, audit logs
- **SOC 2**: Security, availability, confidentiality
- **ISO 27001**: Information security management

## Maintenance

### Regular Tasks

**Daily:**
- Check system health
- Review error logs
- Verify backups completed

**Weekly:**
- Review performance metrics
- Check security updates
- Rotate secrets if needed

**Monthly:**
- Test backup restoration
- Review user access
- Archive old data
- Performance audit

**Quarterly:**
- Security audit
- Capacity planning review
- DR test

### Update Procedures

1. **Backup First**
   ```bash
   docker-compose exec db pg_dump queuedesk > pre-update-backup.sql
   ```

2. **Pull Updates**
   ```bash
   git pull
   docker-compose pull
   ```

3. **Apply Database Migrations**
   ```bash
   docker-compose exec web npm run db:migrate
   ```

4. **Restart Services**
   ```bash
   docker-compose up -d --force-recreate
   ```

5. **Verify**
   - Check logs for errors
   - Test key functionality
   - Confirm health checks pass

### Data Archiving

Archive old tickets:
- Move closed tickets older than 2 years to archive
- Keep audit logs and metadata
- Maintain search capability
- Compress archived data

## Disaster Recovery

### Recovery Point Objective (RPO)

- Database: 15 minutes (WAL archiving)
- Files: 24 hours (daily backups)
- Acceptable data loss: <= 15 minutes

### Recovery Time Objective (RTO)

- Partial outage: 30 minutes
- Full outage: 4 hours
- Critical: Hot standby available

### DR Plan

1. **Detection**
   - Monitoring alerts trigger
   - Confirm outage
   - Assess impact

2. **Response**
   - Activate DR team
   - Declare incident
   - Communicate status

3. **Recovery**
   - Fail over to standby
   - Restore from backups if needed
   - Bring services online

4. **Verification**
   - Test functionality
   - Verify data integrity
   - Confirm performance

5. **Post-Mortem**
   - Document incident
   - Identify root cause
   - Update procedures

### Failover Process

**Database Failover:**
1. Promote replica to primary
2. Update application connection strings
3. Verify application works
4. Rebuild old primary as new replica

**Full Site Failover:**
1. Switch DNS to DR site
2. Activate DR infrastructure
3. Restore latest backups
4. Verify all services
5. Communicate to users

## Incident Response

### Severity Levels

- **SEV-1 (Critical)**: Full outage, data loss
- **SEV-2 (High)**: Major feature unavailable, performance severely degraded
- **SEV-3 (Medium)**: Minor feature issue, performance impact
- **SEV-4 (Low)**: Cosmetic issues, documentation problems

### Response Time Targets

- SEV-1: 15 minutes response, 4 hours resolution
- SEV-2: 1 hour response, 24 hours resolution
- SEV-3: 4 hours response, 3 days resolution
- SEV-4: 1 business day response, 1 week resolution

### Incident Communication

- **Status Page**: Update public status page
- **Internal**: Update team via Slack/Teams
- **Customers**: Email notifications for SEV-1/2
- **Post-Incident**: Public report within 3 business days

### Root Cause Analysis (RCA)

For all SEV-1 and SEV-2 incidents:
1. Timeline of events
2. Root cause identified
3. Contributing factors
4. Impact assessment
5. Remediation actions
6. Prevention measures

## Performance Tuning

### Database Tuning

**Index Optimization:**
- Monitor slow queries
- Add missing indexes
- Remove unused indexes

**Query Optimization:**
- Avoid N+1 queries
- Use pagination for large datasets
- Optimize JOIN operations

**Connection Pooling:**
- Configure appropriate pool size
- Monitor connection usage
- Use PgBouncer for PostgreSQL

### Application Tuning

**Caching Strategy:**
- Cache frequently accessed data
- Use Redis for shared cache
- Implement cache warming

**Background Jobs:**
- Prioritize critical jobs
- Set appropriate concurrency
- Monitor queue backlogs

**Frontend Optimization:**
- Enable gzip compression
- Use CDN for static assets
- Implement code splitting
- Optimize images

### Server Tuning

**Linux Kernel Parameters:**
```ini
# /etc/sysctl.conf
net.core.somaxconn = 65535
net.core.netdev_max_backlog = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.ip_local_port_range = 1024 65535
```

**File Descriptors:**
```ini
# /etc/security/limits.conf
* soft nofile 65535
* hard nofile 65535
```

### Load Testing

Regular load testing:
- Simulate peak traffic
- Identify bottlenecks
- Test scalability
- Validate SLA compliance

**Tools:**
- k6
- Artillery
- Apache JMeter
- Locust

### APM (Application Performance Monitoring)

Use APM tools:
- New Relic
- Datadog APM
- OpenTelemetry + Jaeger
- Sentry

Monitor:
- Transaction traces
- Database queries
- External API calls
- Error rates

## Additional Resources

- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [Upgrade Guide](./UPGRADE.md)
- [API Documentation](./API.md)
- [Security Documentation](../SECURITY.md)
- [Support Contacts](../README.md#support)
