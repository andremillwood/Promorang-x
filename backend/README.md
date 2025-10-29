# Promorang API Backend

This is the backend API for Promorang, deployed as Vercel serverless functions.

## 🚀 Quick Start

### Prerequisites

1. **Supabase Database** (Required)
   - Create a Supabase project at https://supabase.com
   - Run the database schema from `../database-schema.sql`
   - Note your project URL and API keys

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

### Local Development

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# The API will be available at http://localhost:3000/api/*
```

### Deployment

```bash
# Deploy to Vercel
npm run deploy

# Or deploy manually
npx vercel --prod
```

## 📁 Project Structure

```
backend/
├── api/                    # API routes (serverless functions)
│   ├── index.js           # Main application entry point
│   ├── auth.js            # Authentication routes (with logout endpoint)
│   ├── users.js           # User management routes (Supabase connected)
│   ├── content.js         # Content management routes (Supabase connected)
│   ├── drops.js           # Drops management routes (Supabase connected)
│   └── health.js          # Health check endpoint
├── lib/
│   └── supabase.js        # Supabase client configuration
├── package.json           # Dependencies and scripts
├── vercel.json           # Vercel deployment configuration
└── .env.local            # Local environment variables (create from .env.example)
```

## 🔗 API Endpoints

### Health Check
- `GET /api/health` - Check API status

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/me` - Get current user (Supabase connected)
- `GET /api/users/me/wallets` - Get user wallets (Supabase connected)
- `GET /api/users/me/transactions` - Get user transactions (Supabase connected)
- `PUT /api/users/:id` - Update user
- `POST /api/users/:id/follow` - Follow/unfollow user

### Content
- `GET /api/content` - Get all content (Supabase connected)
- `GET /api/content/:id` - Get content by ID (Supabase connected)
- `GET /api/content/:id/metrics` - Get content metrics (Supabase connected)
- `GET /api/content/:id/user-status` - Get user interaction status
- `GET /api/content/:id/sponsorship` - Get sponsorship data (Supabase connected)
- `POST /api/content/buy-shares` - Buy content shares (Supabase connected)
- `POST /api/content/social-action` - Record social actions (Supabase connected)
- `GET /api/content/sponsored` - Get sponsored content (Supabase connected)
- `POST /api/content` - Create new content (Supabase connected)
- `PUT /api/content/:id` - Update content (Supabase connected)
- `DELETE /api/content/:id` - Delete content (Supabase connected)
- `POST /api/content/:id/like` - Like/unlike content

### Drops (New Economy)
- `GET /api/drops` - Get all active drops (Supabase connected)
- `GET /api/drops/:id` - Get drop by ID (Supabase connected)
- `GET /api/drops/my-drops` - Get user's created drops
- `POST /api/drops` - Create new drop (Supabase connected)
- `PUT /api/drops/:id` - Update drop (Supabase connected)
- `POST /api/drops/:id/apply` - Apply to drop (Supabase connected)
- `GET /api/drops/:id/applications` - Get drop applications
- `POST /api/drops/:dropId/applications/:applicationId` - Approve/reject application

## 🔧 Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `JWT_SECRET` - Secret for JWT token generation
- `FRONTEND_URL` - Your frontend domain for CORS

## 🛠️ Development

### Adding New Routes

1. Create a new file in `api/` (e.g., `products.js`)
2. Export an Express router
3. Import and use it in `api/index.js`:

```javascript
const productsRouter = require('./products');
app.use('/api/products', productsRouter);
```

### Database Integration

The API now uses **Supabase** for all database operations:

```javascript
const supabase = require('../lib/supabase');

const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId);
```

All endpoints include fallback to mock data when Supabase is not configured.

## 🚀 Deployment

### Automatic Deployment
- Push to main branch triggers deployment
- Environment variables set in Vercel dashboard

### Manual Deployment
```bash
# Deploy to production
npm run deploy

# Deploy to preview
npx vercel

# Set environment variables
npx vercel env add SUPABASE_URL
npx vercel env add SUPABASE_SERVICE_ROLE_KEY
```

## 🔒 Security Features

- **Supabase RLS**: Row Level Security policies
- **CORS**: Configured for frontend domain
- **Input validation**: Using Zod schemas
- **Error handling**: Comprehensive error responses
- **Environment isolation**: Separate dev/prod configs

## 📊 Database Schema

Complete schema with:
- 15+ tables (users, content, drops, transactions, etc.)
- Row Level Security policies
- Optimized indexes
- Demo data pre-populated
- Triggers for auto-updating timestamps

Run `../database-schema.sql` in your Supabase SQL Editor.

## 🧪 Testing

### API Testing
```bash
# Test all endpoints
curl http://localhost:3000/api/health
curl http://localhost:3000/api/users/me
curl http://localhost:3000/api/content
curl http://localhost:3000/api/drops
```

### Production Testing
```bash
# Test production endpoints
curl https://promorang-api.vercel.app/api/users/me
curl https://promorang-api.vercel.app/api/content
curl https://promorang-api.vercel.app/api/drops
```

## 📈 Demo Data

The database includes demo data:
- 3 demo users (regular, creator, advertiser)
- Sample content pieces
- Active drops with different types
- Sample transactions and wallets
- Social interactions and achievements

## 🔍 Monitoring

- Health check endpoint: `/api/health`
- Error logging in production
- Vercel Analytics integration
- Database performance monitoring in Supabase

## 📝 Migration from Mock Data

All API endpoints have been updated to:
1. Use Supabase database queries when configured
2. Fall back to mock data when database not available
3. Include proper error handling and logging
4. Support all CRUD operations

**Ready for production deployment! 🎉**
