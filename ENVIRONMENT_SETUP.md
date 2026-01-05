# Environment Setup Guide

This guide ensures consistent authentication and CORS configuration across localhost and production environments.

## Table of Contents
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [CORS Configuration](#cors-configuration)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### Local Development

1. **Backend Setup**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your values (see below)
   npm install
   npm run dev
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   cp .env.example .env
   # Edit .env with your values (see below)
   npm install
   npm run dev
   ```

3. **Verify Setup**
   ```bash
   cd backend
   npm run test:cors
   ```

### Production Deployment

1. **Set Vercel Environment Variables** (see [Production Environment Variables](#production-environment-variables))
2. **Deploy Backend**
   ```bash
   cd backend
   npx vercel deploy --prod --yes
   ```
3. **Deploy Frontend**
   ```bash
   cd frontend
   npx vercel deploy --prod --yes
   ```
4. **Verify Production**
   ```bash
   cd backend
   npm run test:cors:prod
   ```

---

## Environment Variables

### Backend (.env)

**Required for Development:**
```bash
# Environment
NODE_ENV=development
PORT=3001

# CORS - Critical for frontend-backend communication
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000

# Supabase (use your actual values or demo values)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=dev_jwt_secret_change_in_production

# Demo logins
DEMO_LOGINS_ENABLED=true
```

**Optional:**
```bash
# Integrations
MANYCHAT_SECRET=your_secure_random_string

# Payments
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# AWS S3
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
S3_BUCKET_NAME=your_bucket
```

### Frontend (.env)

**Required for Development:**
```bash
# Environment
VITE_APP_ENV=development

# API Configuration - Must match backend
VITE_API_URL=http://localhost:3001
VITE_API_BASE_URL=http://localhost:3001

# Supabase (must match backend)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**Optional:**
```bash
# Feature Flags
VITE_ENABLE_DEBUG=true
VITE_ENABLE_ANALYTICS=false

# Payments
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## CORS Configuration

### How It Works

The backend uses a **unified CORS strategy** that works in both development and production:

1. **Environment-Based Defaults:**
   - **Development:** Automatically allows `localhost:5173`, `localhost:3000`, and their `127.0.0.1` variants
   - **Production:** Automatically allows `https://promorang.co`, `https://www.promorang.co`, and Vercel preview URLs

2. **Override with Environment Variable:**
   - Set `CORS_ORIGINS` to a comma-separated list of allowed origins
   - Example: `CORS_ORIGINS=http://localhost:5173,https://custom-domain.com`

3. **Automatic www/non-www Expansion:**
   - The system automatically allows both `example.com` and `www.example.com` variants

### Production Environment Variables

Set these in **Vercel Dashboard** → **Project Settings** → **Environment Variables**:

#### Backend (promorang-api)
```
NODE_ENV=production
CORS_ORIGINS=https://promorang.co,https://www.promorang.co,https://promorang-alt.vercel.app
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_production_jwt_secret_CHANGE_THIS
DEMO_LOGINS_ENABLED=true
```

#### Frontend (promorang-alt)
```
VITE_ENV=production
VITE_API_URL=https://api.promorang.co
VITE_API_BASE_URL=https://api.promorang.co
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## Testing

### Local CORS Test

Test that your local backend accepts requests from your local frontend:

```bash
cd backend
npm run test:cors
```

**Expected Output:**
```
✅ Health endpoint is accessible
✅ CORS preflight passed
✅ Auth endpoint is accessible
🎉 All tests passed!
```

### Production CORS Test

Test that your production backend accepts requests from your production frontend:

```bash
cd backend
npm run test:cors:prod
```

### Manual Testing

1. **Start both servers locally:**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev
   
   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

2. **Open browser to** `http://localhost:5173`

3. **Open DevTools Console** and check for CORS errors

4. **Try logging in** - should work without CORS errors

---

## Deployment

### Deployment Checklist

Before deploying to production:

- [ ] All environment variables set in Vercel
- [ ] `CORS_ORIGINS` includes production domains
- [ ] `JWT_SECRET` is a strong random string (not the dev default)
- [ ] Supabase credentials are production values
- [ ] Local CORS test passes (`npm run test:cors`)

### Deploy Commands

**Backend:**
```bash
cd backend
npx vercel deploy --prod --yes
```

**Frontend:**
```bash
cd frontend
npx vercel deploy --prod --yes
```

**After Deployment:**
```bash
cd backend
npm run test:cors:prod
```

---

## Troubleshooting

### CORS Error: "No 'Access-Control-Allow-Origin' header"

**Symptoms:**
```
Access to fetch at 'https://api.promorang.co/api/auth/login' from origin 
'https://www.promorang.co' has been blocked by CORS policy
```

**Solutions:**

1. **Check Backend Logs:**
   ```bash
   npx vercel logs --follow
   ```
   Look for: `[CORS] Allowed origins: [...]`

2. **Verify Environment Variables:**
   - Go to Vercel Dashboard → promorang-api → Settings → Environment Variables
   - Ensure `CORS_ORIGINS` includes your frontend domain
   - Redeploy after changes

3. **Test CORS Configuration:**
   ```bash
   npm run test:cors:prod
   ```

4. **Check for Typos:**
   - Ensure no trailing slashes in URLs
   - Ensure correct protocol (http vs https)
   - Ensure www vs non-www matches

### Authentication Fails Locally

**Symptoms:**
- Login works in production but not locally
- "Authentication service unavailable" error

**Solutions:**

1. **Check Backend is Running:**
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **Verify Frontend API URL:**
   ```bash
   # In frontend/.env
   VITE_API_URL=http://localhost:3001  # NOT https, NOT production URL
   ```

3. **Check Supabase Credentials:**
   - Ensure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set in `backend/.env`
   - Or use demo mode: `DEMO_LOGINS_ENABLED=true`

4. **Restart Both Servers:**
   ```bash
   # Stop both (Ctrl+C)
   cd backend && npm run dev
   cd frontend && npm run dev
   ```

### Production Works But Localhost Doesn't

**Symptoms:**
- Can log in on production
- CORS errors or auth failures on localhost

**Solutions:**

1. **Verify Local Environment Files Exist:**
   ```bash
   ls backend/.env
   ls frontend/.env
   ```

2. **Check CORS_ORIGINS in backend/.env:**
   ```bash
   CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
   ```

3. **Ensure Frontend Points to Local Backend:**
   ```bash
   # frontend/.env
   VITE_API_URL=http://localhost:3001
   ```

4. **Clear Browser Cache:**
   - Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
   - Or use incognito mode

### Environment Variables Not Taking Effect

**Symptoms:**
- Changed `.env` but behavior didn't change
- Vercel shows old values

**Solutions:**

1. **Restart Development Servers:**
   - Environment variables are loaded on startup
   - Stop (Ctrl+C) and restart both servers

2. **For Vercel:**
   - Changes to environment variables require redeployment
   - After updating in Vercel Dashboard, redeploy:
     ```bash
     npx vercel deploy --prod --yes
     ```

3. **Check File Location:**
   - `.env` must be in the correct directory
   - Backend: `/backend/.env`
   - Frontend: `/frontend/.env`

---

## Best Practices

1. **Never Commit `.env` Files**
   - They're in `.gitignore` for a reason
   - Use `.env.example` as a template

2. **Use Strong Secrets in Production**
   - Generate random JWT_SECRET: `openssl rand -base64 32`
   - Never use default/dev secrets in production

3. **Test Before Deploying**
   - Run `npm run test:cors` locally
   - Verify login works locally before deploying

4. **Keep Environments in Sync**
   - When adding new env vars, update both `.env.example` files
   - Document new variables in this guide

5. **Monitor Production**
   - Check Vercel logs after deployment
   - Run `npm run test:cors:prod` after each deploy
   - Test login on production immediately after deployment

---

## Quick Reference

### Common Commands

```bash
# Local development
npm run dev                    # Start dev server
npm run test:cors              # Test CORS locally

# Production
npx vercel deploy --prod --yes # Deploy to production
npm run test:cors:prod         # Test production CORS
npx vercel logs --follow       # View production logs

# Troubleshooting
curl http://localhost:3001/api/health  # Check backend is running
curl https://api.promorang.co/api/health  # Check production backend
```

### Environment Variable Locations

- **Local Development:** `.env` files (not committed)
- **Production:** Vercel Dashboard → Settings → Environment Variables
- **Templates:** `.env.example` files (committed)

---

## ManyChat Integration

### Overview

The ManyChat integration allows automatic syncing of Instagram follower data to user profiles in Promorang. When a user connects their Instagram account via ManyChat, their follower count is automatically imported and converted to influence points.

### Setup

1. **Generate a Secure Secret**
   ```bash
   # Generate a random secret (macOS/Linux)
   openssl rand -hex 32
   
   # Or use Node.js
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Set Environment Variable**
   
   **Local Development** (`backend/.env`):
   ```bash
   MANYCHAT_SECRET=your_generated_secret_here
   ```
   
   **Production** (Vercel Dashboard → promorang-api → Environment Variables):
   ```
   MANYCHAT_SECRET=your_generated_secret_here
   ```

3. **Configure ManyChat Webhook**
   
   In your ManyChat flow, add an "External Request" action:
   
   - **URL**: `https://api.promorang.co/api/manychat/followers`
   - **Method**: POST
   - **Headers**:
     ```
     Content-Type: application/json
     Authorization: Bearer YOUR_MANYCHAT_SECRET
     ```
   - **Body** (JSON):
     ```json
     {
       "name": "{{first name}} {{last name}}",
       "email": "{{email}}",
       "phone": "{{phone}}",
       "instagram": "{{custom_field.instagram_username}}",
       "followers": "{{custom_field.follower_count}}"
     }
     ```

### Testing

**1. Check Endpoint Status**
```bash
# Should return webhook information
curl https://api.promorang.co/api/manychat/followers
```

**2. Test Webhook Locally**
```bash
curl -X POST http://localhost:3001/api/manychat/followers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_MANYCHAT_SECRET" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+1234567890",
    "instagram": "testuser",
    "followers": "5000"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "points_awarded": 50,
  "user_id": "uuid-here",
  "follower_count": 5000
}
```

**3. Test from ManyChat**

Use ManyChat's "Test" button in the External Request action. You should see:
- Status: 200 OK
- Response body with `success: true`

### How It Works

1. **Follower Count → Points Conversion**
   - Formula: `points = follower_count * 0.01`
   - Example: 5,000 followers = 50 points

2. **User Matching**
   - First tries to match by email
   - Falls back to Instagram username
   - Creates new user if no match found

3. **Data Updates**
   - Updates follower count
   - Adds influence points
   - Updates contact information (name, email, phone)

### Troubleshooting

**"Forbidden" Error (403)**
- Check that `MANYCHAT_SECRET` is set in Vercel environment variables
- Verify the Authorization header matches: `Bearer YOUR_SECRET`
- Ensure there's no extra whitespace in the secret

**"Not Found" Error (404)**
- Verify backend is deployed with latest code
- Check that `/api/manychat` route is registered in `backend/api/index.ts`

**"Missing instagram or follower count" Error (400)**
- Ensure ManyChat is sending both `instagram` and `followers` fields
- Check that follower count is a valid number

**User Not Created/Updated**
- Check Vercel logs: `npx vercel logs --follow`
- Verify Supabase credentials are set correctly
- Ensure `users` table exists with required columns

### Required Database Columns

The `users` table must have these columns:
- `id` (uuid, primary key)
- `name` (text)
- `email` (text, nullable)
- `phone` (text, nullable)
- `instagram_username` (text)
- `follower_count` (integer)
- `influence_points` (integer)
- `total_points` (integer)

### Support

If you encounter issues not covered here:
1. Check Vercel logs: `npx vercel logs --follow`
2. Run smoke tests: `npm run test:cors` or `npm run test:cors:prod`
3. Review browser DevTools Console and Network tab
4. Check this guide's Troubleshooting section
