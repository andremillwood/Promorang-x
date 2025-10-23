# Promorang Frontend Development

## 🚀 Quick Start

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start frontend only (for UI development)
npm run dev

# Start backend only (for API development)
npm run dev:backend

# Start both frontend and backend (full-stack development)
npm run dev:full
```

## 🔐 OAuth Setup for Local Development

### 1. Environment Variables
Copy `.env` and configure:

```env
# Required for OAuth
VITE_MOCHA_CLIENT_ID=your_mocha_client_id
VITE_MOCHA_CLIENT_SECRET=your_mocha_client_secret
VITE_MOCHA_REDIRECT_URI=http://localhost:5173/auth/callback

# Supabase (already configured)
VITE_SUPABASE_URL=https://dnysosmscoceplvcejkv.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Local API (when running backend locally)
VITE_API_URL=http://localhost:8787/api
```

### 2. Mocha OAuth Configuration
1. Go to [Mocha Console](https://console.getmocha.com)
2. Create OAuth application
3. Set redirect URI: `http://localhost:5173/auth/callback`
4. Copy Client ID and Secret to `.env`

### 3. Local Backend Setup
```bash
# Install Wrangler CLI globally
npm install -g wrangler

# Login to Cloudflare
npx wrangler auth login

# Start local backend
npm run dev:backend
```

## 🏗️ Architecture

### Frontend (Vercel)
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Authentication**: Mocha OAuth
- **Deployment**: Static site on Vercel

### Backend (Cloudflare Workers)
- **Framework**: Hono
- **Database**: Cloudflare D1 (SQLite)
- **Authentication**: Mocha Users Service
- **File Storage**: AWS S3
- **Payments**: Stripe

## 📁 Project Structure

```
frontend/
├── src/
│   ├── react-app/          # Frontend React code
│   │   ├── components/     # UI components
│   │   ├── pages/         # Route components
│   │   └── hooks/         # Custom hooks
│   ├── worker/            # Cloudflare Workers (backend)
│   └── shared/            # Shared types
├── dist/                  # Built frontend
└── vercel.json           # Vercel deployment config
```

## 🔧 Available Scripts

- `npm run dev` - Start frontend development server
- `npm run dev:backend` - Start Cloudflare Workers locally
- `npm run dev:full` - Start both frontend and backend
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌐 API Endpoints

When running locally:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8787/api

When deployed:
- Frontend: Your Vercel URL
- Backend API: https://api.promorang.co/api

## 🔄 Development Workflow

1. **Frontend Development**
   ```bash
   npm run dev
   # Edit files in src/react-app/
   ```

2. **Backend Development**
   ```bash
   npm run dev:backend
   # Edit files in src/worker/
   ```

3. **Full-Stack Testing**
   ```bash
   npm run dev:full
   # Both frontend and backend running
   # Test OAuth flow end-to-end
   ```

## 🚀 Deployment

### Frontend to Vercel
```bash
# Deploy frontend
npx vercel --prod

# Or from frontend directory
cd frontend && npx vercel --prod
```

### Backend to Cloudflare
```bash
# Deploy backend
npx wrangler deploy

# Deploy from root
cd ../ && npx wrangler deploy
```

## 🔐 Authentication Flow

1. User clicks login → Redirected to Mocha OAuth
2. User authorizes → Redirected back with code
3. Frontend exchanges code for session token
4. Backend validates token and creates user record
5. User session established across frontend/backend
