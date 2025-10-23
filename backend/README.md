# Promorang API Backend

This is the backend API for Promorang, deployed as Vercel serverless functions.

## 🚀 Quick Start

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
│   ├── auth.js            # Authentication routes
│   ├── users.js           # User management routes
│   └── content.js         # Content management routes
├── package.json           # Dependencies and scripts
├── vercel.json           # Vercel deployment configuration
└── .env.example          # Environment variables template
```

## 🔗 API Endpoints

### Health Check
- `GET /api/health` - Check API status

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Users
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/me` - Get current user
- `PUT /api/users/:id` - Update user
- `POST /api/users/:id/follow` - Follow/unfollow user

### Content
- `GET /api/content` - Get all content (with pagination)
- `GET /api/content/:id` - Get content by ID
- `POST /api/content` - Create new content
- `PUT /api/content/:id` - Update content
- `DELETE /api/content/:id` - Delete content
- `POST /api/content/:id/like` - Like/unlike content

## 🔧 Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anon key
- `JWT_SECRET` - Secret for JWT token generation
- `FRONTEND_URL` - Your frontend domain for CORS

## 🛠️ Development

### Adding New Routes

1. Create a new file in `api/` (e.g., `products.js`)
2. Export an Express router
3. Import and use it in `api/index.js`:

```javascript
app.use('/api/products', require('./products'));
```

### Database Integration

Currently using mock data. Replace with your preferred database:

```javascript
// Example with Supabase
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
```

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
```

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Configured for frontend domain
- **Input validation**: Using Zod schemas
- **Error handling**: Comprehensive error responses

## 📊 Monitoring

- Health check endpoint: `/api/health`
- Error logging in production
- Vercel Analytics integration
