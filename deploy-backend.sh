#!/bin/bash

# Navigate to the backend directory
cd "$(dirname "$0")/backend"

# Install dependencies
npm install

# Build the project (if needed)
npm run build

# Deploy to Vercel
npx vercel --prod
