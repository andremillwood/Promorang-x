#!/bin/bash

# Navigate to the frontend directory
cd frontend

# Install frontend dependencies
echo "Installing frontend dependencies..."
npm install jwt-decode @types/jwt-decode

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env <<EOL
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# API
VITE_API_URL=http://localhost:3000

# JWT
JWT_SECRET=your_secure_jwt_secret_change_this_in_production

# Supabase Service Role (only for backend)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
EOL
    echo "Created .env file. Please update it with your actual credentials."
fi

echo "Frontend setup complete!"
