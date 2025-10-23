## Promorang - Full Stack Application

This is the complete Promorang application with both frontend and backend components.

## 🏗️ Architecture

### Frontend (Vercel Static Site)
- **Location**: `/frontend/`
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Deployment**: Vercel static site

### Backend (Vercel Serverless Functions)
- **Location**: `/backend/`
- **Project**: `promorang-api` (separate Vercel project)
- **Framework**: Express.js + Node.js
- **Database**: Supabase (recommended)
- **Deployment**: Vercel serverless functions

## 🚀 Deployment

### Frontend Deployment
```bash
# Deploy frontend to Vercel
cd frontend
npx vercel --prod
```

### Backend Deployment
```bash
# Deploy backend to promorang-api Vercel project
cd backend
npx vercel --prod
```

## 📁 Project Structure

```
promorang/
├── frontend/              # React SPA (Vercel static)
│   ├── src/react-app/     # Frontend code
│   ├── dist/             # Built files
│   └── vercel.json       # Frontend deployment config
│
└── backend/              # API (Vercel serverless)
    ├── api/              # API routes
    │   ├── index.js      # Main application
    │   ├── auth.js       # Authentication routes
    │   ├── users.js      # User management
    │   └── content.js    # Content management
    ├── package.json      # Backend dependencies
    ├── vercel.json       # Backend deployment config
    └── README.md         # Backend documentation
```

## 🔗 API Integration

The frontend communicates with the backend through:
- **Production**: `https://api.promorang.co/api/*`
- **Development**: Deploy backend separately for testing

## 🔄 Authentication Flow

1. Frontend handles UI/UX for authentication
2. Backend handles actual authentication logic
3. Supabase Auth manages user sessions
4. JWT tokens for API authorization

## 🛠️ Development

### Frontend Development
```bash
cd frontend
npm run dev        # Start frontend server
npm run build      # Build for production
```

### Backend Development
```bash
cd backend
npm run dev        # Start backend server locally
npm run deploy     # Deploy to production
```

### Full Stack Development
1. Deploy backend to `promorang-api` project first
2. Update frontend `.env` with backend URL
3. Develop frontend with live backend

## 📋 Setup Checklist

- [ ] Deploy backend to `promorang-api` Vercel project
- [ ] Configure backend environment variables in Vercel
- [ ] Update frontend `.env` with correct API URL
- [ ] Deploy frontend to main Vercel project
- [ ] Test end-to-end authentication flow
- [ ] Configure production database
- [ ] Set up monitoring and error tracking

## 🔧 Environment Variables

### Frontend (.env)
```
VITE_API_URL=https://api.promorang.co/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Backend (.env)
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

## 📚 Documentation

- [Frontend README](./frontend/README.md) - Frontend development guide
- [Backend README](./backend/README.md) - Backend development guide

## 🎯 Next Steps

1. **Deploy Backend**: Set up the `promorang-api` Vercel project
2. **Configure Database**: Set up Supabase or your preferred database
3. **Implement Authentication**: Connect Supabase Auth to backend
4. **Add Real API Logic**: Replace mock functions with real database operations
5. **Deploy Frontend**: Deploy frontend with correct API endpoints

**Your full-stack application structure is now ready for deployment!** 🎉
