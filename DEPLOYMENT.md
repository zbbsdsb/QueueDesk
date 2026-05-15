# QueueDesk Deployment Guide

This guide provides step-by-step instructions for deploying QueueDesk to various platforms, including Vercel, Railway, and Render.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Deploy to Vercel](#deploy-to-vercel)
4. [Deploy to Railway](#deploy-to-railway)
5. [Deploy to Render](#deploy-to-render)
6. [Environment Variables](#environment-variables)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying QueueDesk, ensure you have:

- A GitHub account
- A Supabase account (free tier available)
- Optional: OpenAI API key for AI features
- Optional: Resend account for email integration
- Optional: Slack account for Slack integration

---

## Supabase Setup

QueueDesk uses Supabase for authentication, database, and real-time features. Follow these steps to set up your Supabase project.

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up or log in
2. Click **New Project**
3. Fill in the project details:
   - Name: `QueueDesk` (or your preferred name)
   - Database Password: Create a strong password (save this!)
   - Region: Select the region closest to your users
4. Click **Create new project** and wait for it to provision (this may take a few minutes)

### 2. Run Database Migrations

1. In your Supabase project dashboard, go to **SQL Editor**
2. Click **New query**
3. Open `supabase/migrations/001_schema.sql` from the QueueDesk repository
4. Copy and paste the entire SQL content into the query editor
5. Click **Run** to execute the migration
6. Repeat for any additional migration files (like `002_mvp_code_sync.sql`) in order

### 3. Get Supabase Credentials

1. Go to **Project Settings** → **API**
2. Copy these values for later use:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **anon public** key
   - **service_role secret** key

---

## Deploy to Vercel

Vercel is the recommended platform for deploying Next.js applications like QueueDesk.

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/zbbsdsb/QueueDesk)

### Manual Deployment Steps

1. **Fork the Repository**
   - Fork [QueueDesk](https://github.com/zbbsdsb/QueueDesk) to your GitHub account

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Select your forked QueueDesk repository
   - Click **Import**

3. **Configure Project**
   - **Project Name**: `queuedesk` (or your preferred name)
   - **Framework Preset**: Should automatically detect `Next.js`
   - **Root Directory**: Leave as `.`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

4. **Add Environment Variables**
   - Click **Environment Variables**
   - Add all required variables from the [Environment Variables](#environment-variables) section below
   - At minimum, add:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `TICKET_TOKEN_SECRET` (generate a strong random string)

5. **Deploy**
   - Click **Deploy**
   - Wait for the build and deployment to complete (usually 2-5 minutes)

6. **Configure Custom Domain (Optional)**
   - After deployment, go to **Settings** → **Domains**
   - Add your custom domain and follow the DNS configuration instructions

---

## Deploy to Railway

Railway provides an easy way to deploy full-stack applications.

### One-Click Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/zbbsdsb/QueueDesk)

### Manual Deployment Steps

1. **Fork the Repository**
   - Fork [QueueDesk](https://github.com/zbbsdsb/QueueDesk) to your GitHub account

2. **Create a Railway Project**
   - Go to [railway.app/new](https://railway.app/new)
   - Select **Deploy from repo**
   - Connect your GitHub account
   - Select your forked QueueDesk repository

3. **Configure Environment Variables**
   - Go to **Variables** tab
   - Add all required variables (see [Environment Variables](#environment-variables))
   - The `railway.json` template is pre-configured to help with this

4. **Deploy**
   - Click **Deploy**
   - Wait for the deployment to complete

5. **Generate a Domain**
   - Go to **Settings** → **Networking**
   - Click **Generate Domain**

---

## Deploy to Render

Render is another great platform for deploying web applications.

### One-Click Deploy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/zbbsdsb/QueueDesk)

### Manual Deployment Steps

1. **Fork the Repository**
   - Fork [QueueDesk](https://github.com/zbbsdsb/QueueDesk) to your GitHub account

2. **Create a New Web Service**
   - Go to [render.com/new](https://render.com/new)
   - Select **Web Service**
   - Connect your GitHub account
   - Select your forked QueueDesk repository

3. **Configure Service**
   - **Name**: `queuedesk`
   - **Region**: Select the region closest to your users
   - **Branch**: `main` (or your preferred branch)
   - **Runtime**: Node
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Select your preferred plan (Starter is free for small projects)

4. **Add Environment Variables**
   - Click **Advanced**
   - Add all required environment variables
   - The `render.yaml` file is pre-configured to auto-generate some secrets

5. **Create Web Service**
   - Click **Create Web Service**
   - Wait for the deployment to complete

---

## Environment Variables

QueueDesk requires several environment variables to function properly. See [`.env.example`](./.env.example) for a complete template with descriptions.

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `TICKET_TOKEN_SECRET` | Secret for signing ticket tokens (generate strong random string) | `a1b2c3d4e5f6...` |

### Optional Variables

| Variable | Description |
|----------|-------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key for server-side operations |
| `OPENAI_API_KEY` | OpenAI API key for AI features |
| `RESEND_API_KEY` | Resend API key for email |
| `RESEND_WEBHOOK_SECRET` | Resend webhook secret |
| `RESEND_FROM_EMAIL` | Email address to send from |
| `CRON_SECRET` | Secret for cron job authentication |
| `NEXT_PUBLIC_APP_URL` | Your QueueDesk instance URL |
| `SLACK_BOT_TOKEN` | Slack bot token |
| `SLACK_SIGNING_SECRET` | Slack signing secret |

---

## Post-Deployment Verification

After deploying QueueDesk, follow these steps to verify everything is working:

### 1. Basic Functionality Check

1. Visit your deployed QueueDesk URL
2. Verify the landing page loads correctly
3. Click **Sign Up** and create a test account
4. Complete email verification if required
5. Log in with your test account
6. Verify you can access the requester portal (`/app`)

### 2. Database Connection Check

1. Go to your Supabase project dashboard
2. Navigate to **Table Editor**
3. Verify you can see tables created by the migration
4. Check that a `tenant` and `app_user` record were created when you signed up

### 3. AI Features (If Configured)

1. If you added an OpenAI API key, test ticket creation and see if AI suggestions appear

### 4. Email Integration (If Configured)

1. Test email notifications if you set up Resend

---

## Troubleshooting

### Common Deployment Issues

#### Build Fails on Vercel/Railway/Render

**Problem**: The deployment build fails with errors.

**Solutions**:
1. Check that all required environment variables are set
2. Verify Node.js version compatibility (use Node.js 20 or 22)
3. Check the build logs for specific error messages
4. Ensure all dependencies are listed in `package.json`
5. Try deploying the main branch first if you're using a feature branch

#### Cannot Connect to Supabase

**Problem**: Application shows database connection errors.

**Solutions**:
1. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
2. Ensure your Supabase project is not paused (free tier projects pause after 1 week of inactivity)
3. Check Supabase project status in the dashboard
4. Verify database migrations were run successfully

#### Authentication Issues

**Problem**: Cannot log in or sign up.

**Solutions**:
1. Check Supabase Auth settings are enabled for email/password
2. Verify email templates are configured (if using custom emails)
3. Check spam folder for verification emails
4. Ensure redirect URLs are configured in Supabase Auth settings

#### Environment Variables Not Working

**Problem**: Environment variables don't seem to be loading.

**Solutions**:
1. For Vercel: Re-deploy after setting environment variables (they only apply to new deployments)
2. Ensure variables are prefixed with `NEXT_PUBLIC_` if they need to be accessible in the browser
3. Never commit `.env` files to version control
4. Double-check variable names for typos

#### SLA Cron Job Not Running

**Problem**: SLA timers aren't updating.

**Solutions**:
1. For Vercel: Verify Vercel Crons are enabled in your project
2. Check that `CRON_SECRET` is set correctly
3. Verify the cron schedule in `vercel.json`
4. Check function logs for errors

---

## Support

If you're still having issues:
- Check the [GitHub Issues](https://github.com/zbbsdsb/QueueDesk/issues) page
- Search for similar issues in the repository
- Create a new issue with detailed information about your problem
