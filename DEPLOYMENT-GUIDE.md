# =============================================
# PROMORANG DEPLOYMENT GUIDE
# Complete setup for production deployment
# =============================================

## 🚀 Quick Start

### 1. Database Setup (REQUIRED FIRST)

**Before deploying, you must set up the Supabase database:**

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create a new project
   - Note your project URL and API keys

2. **Run Database Schema**
   ```bash
   # Copy the SQL schema to Supabase SQL Editor
   # Go to: Your Project > SQL Editor > New Query
   # Paste contents of database-schema.sql
   # Run the query
   ```

3. **Verify Demo Data**
   - Check that users, content, and drops tables are populated
   - You should see 3 demo users and sample content

### 2. Environment Configuration

#### Backend Environment (`.env.local`)
```bash
cp backend/.env.example backend/.env.local
```

Update `backend/.env.local` with your Supabase credentials:
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
JWT_SECRET=your-secure-jwt-secret
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

#### Frontend Environment (`.env`)
The frontend `.env` should already be configured with:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_BASE_URL=https://your-backend-domain.vercel.app/api
```

### 3. Local Testing (Optional)

Test everything works locally before deploying:

```bash
# Start backend
cd backend && npm run dev

# In another terminal, start frontend
cd frontend && npm run dev

# Test API endpoints
curl http://localhost:3000/api/users/me
curl http://localhost:3000/api/content
curl http://localhost:3000/api/drops
```

### 4. Production Deployment

#### Deploy Backend First
```bash
cd backend

# Link to Vercel (first time only)
npx vercel link

# Set environment variables in Vercel dashboard
# Or use CLI:
npx vercel env add SUPABASE_URL
npx vercel env add SUPABASE_SERVICE_ROLE_KEY
npx vercel env add JWT_SECRET

# Deploy to production
npx vercel --prod
```

#### Deploy Frontend
```bash
cd frontend

# Link to Vercel (first time only)
npx vercel link

# Set environment variables in Vercel dashboard
npx vercel env add VITE_SUPABASE_URL
npx vercel env add VITE_SUPABASE_ANON_KEY
npx vercel env add VITE_API_BASE_URL

# Deploy to production
npx vercel --prod
```

## 🔧 Environment Variables Setup

### Vercel Dashboard Setup

**Backend Variables (promorang-api.vercel.app):**
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key from Supabase
- `JWT_SECRET` - Random secure string for JWT tokens
- `FRONTEND_URL` - Your frontend domain (e.g., https://promorang-alt.vercel.app)

**Frontend Variables (promorang-alt.vercel.app):**
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Anon key from Supabase
- `VITE_API_BASE_URL` - Your backend API URL

## 🗄️ Database Schema

The `database-schema.sql` includes:

- **15+ Tables**: Users, Content, Drops, Transactions, etc.
- **Demo Data**: 3 users, sample content, active drops
- **RLS Policies**: Row Level Security for data protection
- **Indexes**: Optimized for performance
- **Triggers**: Auto-update timestamps and follower counts

## 🧪 Testing

### API Endpoint Tests
```bash
# Test user endpoints
curl https://promorang-api.vercel.app/api/users/me
curl https://promorang-api.vercel.app/api/users/1

# Test content endpoints
curl https://promorang-api.vercel.app/api/content
curl https://promorang-api.vercel.app/api/content/1

# Test drops endpoints
curl https://promorang-api.vercel.app/api/drops
curl https://promorang-api.vercel.app/api/drops/1
```

### Frontend Tests
1. Open https://promorang-alt.vercel.app
2. Check browser console for errors
3. Test user registration/login flow
4. Verify content loads properly
5. Test drop creation and application

## 🔍 Troubleshooting

### Common Issues

**API Returns 500 Errors:**
- Check Supabase credentials in Vercel
- Verify database schema was applied correctly
- Check Vercel function logs: `npx vercel logs`

**Frontend Shows Blank Page:**
- Check browser console for JavaScript errors
- Verify VITE_API_BASE_URL points to correct backend
- Check Vercel deployment status

**Database Connection Issues:**
- Verify SUPABASE_SERVICE_ROLE_KEY has correct permissions
- Check if database schema was applied
- Test connection: `npx supabase status`

### Logs and Monitoring

```bash
# Backend logs
npx vercel logs promorang-api

# Frontend logs
npx vercel logs promorang-alt

# Check function performance
npx vercel ls
```

## 📊 Demo Data Included

The database comes pre-populated with:

- **3 Demo Users**:
  - Demo User (regular user with premium tier)
  - Top Creator (super tier creator)
  - Demo Brand (advertiser)

- **Sample Content**: Instagram, TikTok, YouTube posts
- **Active Drops**: Various types (paid, proof, move drops)
- **Transactions & Wallets**: Sample financial data
- **Social Actions**: Likes, shares, comments

## 🎯 Production Checklist

- [ ] Supabase project created and configured
- [ ] Database schema applied successfully
- [ ] Demo data verified in Supabase dashboard
- [ ] Backend environment variables set in Vercel
- [ ] Frontend environment variables set in Vercel
- [ ] Backend deployed and API endpoints tested
- [ ] Frontend deployed and loading properly
- [ ] All API endpoints returning real data (not mock)
- [ ] User authentication working
- [ ] Content creation and drops working

## 🚀 Post-Deployment

After successful deployment:

1. **Test User Flows**:
   - User registration/login
   - Content browsing and investment
   - Drop creation and application
   - Social interactions (likes, shares)

2. **Monitor Performance**:
   - Set up Vercel Analytics
   - Monitor API response times
   - Check error rates

3. **Scale Considerations**:
   - Database connection pooling
   - API rate limiting
   - Content delivery optimization

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Vercel function logs
3. Verify environment variables in Vercel dashboard
4. Test database connectivity from backend functions

**Ready for production! 🎉**
