#!/bin/bash

# Check for bad imports
if grep -r "from 'react-router'" ./src | grep -v "react-router-dom"; then
  echo "❌ Invalid import detected: use 'react-router-dom' instead of 'react-router'"
  exit 1
fi

# Verify environment
if [ -z "$VITE_API_BASE_URL" ] || [ -z "$VITE_SUPABASE_URL" ]; then
  echo "❌ Missing required environment variables"
  exit 1
fi

echo "✅ Preflight checks passed!"
exit 0
