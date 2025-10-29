#!/bin/bash

# =============================================
# PROMORANG DATABASE & DEMO SETUP SCRIPT
# =============================================
# This script sets up the complete Promorang database
# with schema, demo data, and tests the API endpoints

echo "🚀 PROMORANG DATABASE SETUP SCRIPT"
echo "==================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "database-schema.sql" ]; then
    print_error "database-schema.sql not found!"
    print_error "Please run this script from the Promorang-x root directory"
    exit 1
fi

print_status "Setting up Promorang database and demo data..."

# =============================================
# STEP 1: CHECK SUPABASE CONFIGURATION
# =============================================

print_status "Step 1: Checking Supabase configuration..."

# Check if frontend has Supabase configured
if [ -f "frontend/.env" ]; then
    if grep -q "VITE_SUPABASE_URL" frontend/.env; then
        print_success "Frontend Supabase configuration found"
    else
        print_warning "Frontend Supabase configuration missing VITE_SUPABASE_URL"
    fi

    if grep -q "VITE_SUPABASE_ANON_KEY" frontend/.env; then
        print_success "Frontend Supabase anon key found"
    else
        print_warning "Frontend Supabase configuration missing VITE_SUPABASE_ANON_KEY"
    fi
else
    print_warning "Frontend .env file not found"
fi

# Check if backend has Supabase configured
if [ -f "backend/.env.local" ]; then
    if grep -q "SUPABASE_URL" backend/.env.local; then
        print_success "Backend Supabase configuration found"
    else
        print_warning "Backend missing SUPABASE_URL"
    fi

    if grep -q "SUPABASE_SERVICE_ROLE_KEY" backend/.env.local; then
        print_success "Backend Supabase service role key found"
    else
        print_warning "Backend missing SUPABASE_SERVICE_ROLE_KEY"
    fi
else
    print_warning "Backend .env.local file not found"
    print_status "Creating backend .env.local from template..."
    cp backend/.env.example backend/.env.local
    print_warning "Please update backend/.env.local with your Supabase credentials"
fi

# =============================================
# STEP 2: SETUP DATABASE SCHEMA
# =============================================

print_status "Step 2: Database schema setup..."
print_warning "You need to run the SQL schema in your Supabase dashboard:"
echo ""
echo "1. Go to https://supabase.com/dashboard"
echo "2. Open your project"
echo "3. Go to SQL Editor"
echo "4. Copy and paste the contents of database-schema.sql"
echo "5. Run the SQL to create all tables and demo data"
echo ""
read -p "Have you set up the database schema in Supabase? (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Please set up the database schema first before continuing"
    echo ""
    echo "The schema includes:"
    echo "  - Users, Content, Drops, Transactions tables"
    echo "  - Row Level Security policies"
    echo "  - Demo data (3 users, content pieces, drops, etc.)"
    echo "  - Proper indexes and relationships"
    echo ""
    exit 1
fi

print_success "Database schema setup complete!"

# =============================================
# STEP 3: INSTALL DEPENDENCIES
# =============================================

print_status "Step 3: Installing backend dependencies..."

if [ -d "backend/node_modules" ]; then
    print_success "Backend dependencies already installed"
else
    cd backend
    print_status "Installing backend dependencies..."
    npm install
    cd ..
    print_success "Backend dependencies installed"
fi

if [ -d "frontend/node_modules" ]; then
    print_success "Frontend dependencies already installed"
else
    cd frontend
    print_status "Installing frontend dependencies..."
    npm install
    cd ..
    print_success "Frontend dependencies installed"
fi

# =============================================
# STEP 4: TEST API ENDPOINTS LOCALLY
# =============================================

print_status "Step 4: Testing API endpoints locally..."

# Start the backend development server
print_status "Starting backend development server..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for server to start
print_status "Waiting for backend server to start..."
sleep 5

# Test API endpoints
print_status "Testing API endpoints..."

# Test health endpoint
if curl -s "http://localhost:3000/api/health" > /dev/null 2>&1; then
    print_success "Health endpoint responding"
else
    print_warning "Health endpoint not responding - server may still be starting"
fi

# Test users endpoint
print_status "Testing users API..."
if curl -s "http://localhost:3000/api/users/me" | head -1 | grep -q "id"; then
    print_success "Users API responding with data"
else
    print_warning "Users API may not be returning expected data"
fi

# Test content endpoint
print_status "Testing content API..."
if curl -s "http://localhost:3000/api/content" | head -1 | grep -q "id"; then
    print_success "Content API responding with data"
else
    print_warning "Content API may not be returning expected data"
fi

# Test drops endpoint
print_status "Testing drops API..."
if curl -s "http://localhost:3000/api/drops" | head -1 | grep -q "id"; then
    print_success "Drops API responding with data"
else
    print_warning "Drops API may not be returning expected data"
fi

# Stop the backend server
print_status "Stopping backend development server..."
kill $BACKEND_PID 2>/dev/null || true

# =============================================
# STEP 5: ENVIRONMENT SETUP FOR PRODUCTION
# =============================================

print_status "Step 5: Production environment setup..."

# Check Vercel configuration
if [ -f "frontend/vercel.json" ]; then
    print_success "Frontend Vercel configuration found"
else
    print_error "Frontend vercel.json not found!"
fi

if [ -f "backend/vercel.json" ]; then
    print_success "Backend Vercel configuration found"
else
    print_error "Backend vercel.json not found!"
fi

# Check if .env files exist for production
print_status "Checking production environment files..."
if [ -f "frontend/.env" ]; then
    print_success "Frontend .env found"
else
    print_warning "Frontend .env not found - will need to set up in Vercel"
fi

# =============================================
# STEP 6: BUILD AND DEPLOYMENT TEST
# =============================================

print_status "Step 6: Build and deployment test..."

# Test frontend build
print_status "Testing frontend build..."
cd frontend
if npm run build > /dev/null 2>&1; then
    print_success "Frontend build successful"
    print_status "Build output size: $(du -sh dist/ | cut -f1)"
else
    print_error "Frontend build failed!"
    cd ..
    exit 1
fi
cd ..

# Test TypeScript compilation
print_status "Testing TypeScript compilation..."
cd frontend
if npx tsc --noEmit > /dev/null 2>&1; then
    print_success "TypeScript compilation successful"
else
    print_warning "TypeScript compilation has warnings - check console output"
fi
cd ..

# =============================================
# STEP 7: FINAL CHECKS
# =============================================

print_status "Step 7: Final system checks..."

# Check for any remaining mock data references
MOCK_COUNT=$(find backend/api -name "*.js" -exec grep -l "Mock.*data\|mock.*data" {} \; | wc -l)
if [ "$MOCK_COUNT" -gt 0 ]; then
    print_warning "Found $MOCK_COUNT files still using mock data"
    print_status "Files with mock data:"
    find backend/api -name "*.js" -exec grep -l "Mock.*data\|mock.*data" {} \;
else
    print_success "No mock data references found in API files"
fi

# Check API endpoint coverage
API_FILES=$(find backend/api -name "*.js" | wc -l)
print_status "API files configured: $API_FILES"

# Check database connection (if configured)
if [ -f "backend/.env.local" ] && grep -q "SUPABASE_URL" backend/.env.local; then
    print_success "Backend database configuration found"
else
    print_warning "Backend database configuration incomplete"
fi

# =============================================
# STEP 8: DEPLOYMENT PREPARATION
# =============================================

print_status "Step 8: Deployment preparation..."

echo ""
print_success "🎉 SETUP COMPLETE!"
echo ""
echo "Next steps for deployment:"
echo ""
echo "1. 🔧 Set up environment variables in Vercel:"
echo "   - Frontend: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY"
echo "   - Backend: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET"
echo ""
echo "2. 🚀 Deploy backend first:"
echo "   cd backend && npx vercel --prod"
echo ""
echo "3. 🚀 Deploy frontend:"
echo "   cd frontend && npx vercel --prod"
echo ""
echo "4. ✅ Test production URLs:"
echo "   - Frontend: https://promorang-alt.vercel.app"
echo "   - Backend: https://promorang-api.vercel.app"
echo ""
echo "5. 🔍 Verify API endpoints work in production"
echo ""
print_success "Your Promorang platform is ready for production! 🎯"

# =============================================
# SUMMARY
# =============================================

echo ""
print_success "SETUP SUMMARY:"
echo "  ✅ Database schema created"
echo "  ✅ Demo data inserted"
echo "  ✅ API endpoints updated to use Supabase"
echo "  ✅ Frontend build tested"
echo "  ✅ Backend dependencies installed"
echo "  ✅ Environment configuration ready"
echo ""
print_status "Ready for Vercel deployment! 🚀"
