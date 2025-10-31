#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Starting Production Preflight Checks...${NC}"

# ========== 1. Environment Validation ==========
echo -e "\n${YELLOW}🔍 Validating Environment...${NC}"

# Check required commands
for cmd in node npm npx vercel jq curl; do
  if ! command -v $cmd &> /dev/null; then
    echo -e "${RED}❌ Error: $cmd is not installed${NC}"
    exit 1
  fi
done

echo -e "\n${GREEN}✅ Environment Validation${NC}"
echo "----------------------"

# Load environment variables from .env.production
if [ -f "../backend/.env.production" ]; then
  export $(grep -v '^#' ../backend/.env.production | xargs)
else
  echo -e "${RED}❌ Backend .env.production not found${NC}"
  exit 1
fi

# Required environment variables
REQUIRED_VARS=(
  "NODE_ENV"
  "API_BASE_URL"
  "SUPABASE_URL"
  "SUPABASE_SERVICE_KEY"
  "JWT_SECRET"
  "CORS_ALLOWED_ORIGINS"
)

# Check required variables
for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo -e "${RED}❌ Missing required variable: $var${NC}"
    exit 1
  else
    if [[ "$var" == *"KEY"* || "$var" == *"SECRET"* ]]; then
      echo -e "${GREEN}✓ Found ${var} (value hidden)${NC}"
    else
      echo -e "${GREEN}✓ Found ${var}=${!var}${NC}"
    fi
  fi
done

echo -e "\n${GREEN}🔒 Security Checks${NC}"
echo "---------------"

# Check for sensitive data in frontend
SENSITIVE_PATTERNS=(
  "SUPABASE_SERVICE_KEY"
  "JWT_SECRET"
  "DATABASE_URL"
  "[Pp]assword"
  "[Ss]ecret"
  "[Kk]ey"
  "[Tt]oken"
)

echo "🔍 Scanning frontend for sensitive data..."
for pattern in "${SENSITIVE_PATTERNS[@]}"; do
  if grep -r "$pattern" ../frontend/src --exclude-dir=node_modules | grep -v "VITE_" | grep -v ".env.example"; then
    echo -e "${RED}❌ Potential sensitive data found in frontend code: $pattern${NC}"
    exit 1
  fi
fi

# ========== 3. Dependency Checks ==========
echo -e "\n${YELLOW}📦 Checking Dependencies...${NC}"

# Check for outdated packages
echo -e "\n${YELLOW}🔄 Checking for outdated packages...${NC}"
npm outdated --depth=0 || true

# Check for security vulnerabilities
echo -e "\n${YELLOW}🔒 Checking for security vulnerabilities...${NC}"
npm audit --production

# ========== 4. TypeScript & Build Checks ==========
echo -e "\n${YELLOW}🔍 Running TypeScript Checks...${NC}"
cd ..
npm run type-check

# ========== 5. Test Suite ==========
echo -e "\n${YELLOW}🧪 Running Tests...${NC}
npm test

# ========== 6. Supabase Connection Test ==========
echo -e "\n${YELLOW}🔌 Testing Supabase Connection...${NC}"
if ! curl -s "$SUPABASE_URL/rest/v1/" | grep -q 'API URL'; then
  echo -e "${RED}❌ Error: Could not connect to Supabase${NC}"
  exit 1
else
  echo -e "${GREEN}✓ Successfully connected to Supabase${NC}"
fi

# ========== 7. Vercel Deployment Check ==========
echo -e "\n${YELLOW}🚀 Verifying Vercel Configuration...${NC}"
if ! vercel whoami &> /dev/null; then
  echo -e "${RED}❌ Error: Not logged in to Vercel${NC}"
  echo "Run: vercel login"
  exit 1
else
  echo -e "${GREEN}✓ Logged in to Vercel as $(vercel whoami)${NC}"
  
  # Check Vercel project link
  if [ -f ".vercel/project.json" ]; then
    echo -e "${GREEN}✓ Vercel project is linked${NC}"
  else
    echo -e "${YELLOW}⚠️  Vercel project not linked. Run: vercel link${NC}"
  fi
fi

# ========== 8. Final Status ==========
echo -e "\n${GREEN}✅ All preflight checks passed!${NC}"
echo -e "\n${YELLOW}🚀 Ready for deployment! Run 'vercel --prod' to deploy.${NC}"

exit 0
