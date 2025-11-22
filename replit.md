# Promorang-x - Full Stack Application

## Project Overview
Promorang is a full-stack social influence monetization platform that enables creators, investors, and advertisers to interact through content shares, forecasts, and campaigns. The application is built with React + TypeScript + Vite on the frontend and Express.js on the backend, using Supabase for authentication and database.

## Current State
The project has been successfully configured to run in the Replit environment with:
- Frontend running on port 5000 (Vite dev server)
- Backend API running on port 3001 (Express.js)
- Both services integrated and communicating properly
- CORS configured for development mode
- Deployment configuration set up for static site hosting

## Project Architecture

### Frontend (`/frontend/`)
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 3.4
- **Port**: 5000 (configured for Replit)
- **Key Dependencies**:
  - React Router for navigation
  - Supabase client for auth and data
  - Recharts for data visualization
  - Framer Motion for animations
  - Radix UI for components

### Backend (`/backend/`)
- **Framework**: Express.js + Node.js
- **Port**: 3001 (localhost only)
- **Database**: Supabase (PostgreSQL)
- **Key Features**:
  - RESTful API with authentication
  - Content management (CRUD)
  - User profiles and portfolios
  - Social forecasts and shares
  - Advertiser campaigns
  - Growth hub features

### Database
- **Platform**: Supabase (PostgreSQL)
- **Location**: `https://dnysosmscoceplvcejkv.supabase.co`
- **Features**:
  - User authentication
  - Content shares and positions
  - Growth hub tasks and rewards
  - Advertiser campaigns

## Running the Project

### Development
The project runs automatically via the "Start Application" workflow which:
1. Starts the backend API server on localhost:3001
2. Starts the frontend dev server on 0.0.0.0:5000

Both services run concurrently and the frontend proxies API requests to the backend.

### Environment Variables
- **Frontend** (`frontend/.env`):
  - `VITE_SUPABASE_URL`: Supabase project URL
  - `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
  - `VITE_API_URL`: Backend API URL (http://localhost:3001)

- **Backend** (`backend/.env`):
  - `NODE_ENV`: Set to 'development' for local development
  - `PORT`: Backend server port (3001)
  - `FRONTEND_URL`: Frontend URL for CORS
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`: Supabase credentials
  - `JWT_SECRET`: Secret for JWT token signing

## Recent Changes (November 22, 2025)
1. Configured Vite to bind to 0.0.0.0:5000 with `allowedHosts: true` for Replit proxy support
2. Updated backend CORS to allow all origins in development mode while maintaining security in production
3. Set up workflow to run both frontend and backend with NODE_ENV=development
4. Updated .gitignore with comprehensive Node.js patterns
5. Configured deployment settings for static site hosting
6. Updated environment variables to use localhost:3001 for API communication

## Key API Endpoints
- `/api/health` - Health check endpoint
- `/api/auth/*` - Authentication (login, register, demo)
- `/api/users/*` - User management
- `/api/content/*` - Content CRUD operations
- `/api/drops/*` - Drops management
- `/api/social-forecasts/*` - Social predictions
- `/api/advertisers/*` - Advertiser operations
- `/api/growth/*` - Growth hub features
- `/api/portfolio/*` - User portfolio
- `/api/shares/*` - Content shares trading

## Demo Features
The application includes demo login functionality for testing:
- Creator Demo
- Investor Demo
- Advertiser Demo

Each demo provides a pre-configured user experience without requiring full authentication.

## Deployment
The project is configured for static deployment:
- **Build Command**: `npm run build` (builds frontend)
- **Public Directory**: `frontend/dist`
- **Deployment Target**: Static site
- The backend API would need to be deployed separately (e.g., to Vercel serverless functions)

## Notes
- The frontend uses Vite's proxy feature to route `/api/*` requests to the backend during development
- CORS is configured to allow all origins in development mode (NODE_ENV=development)
- In production, CORS only allows whitelisted origins for security
- The backend uses helmet for security headers
- Supabase handles user authentication and database operations
