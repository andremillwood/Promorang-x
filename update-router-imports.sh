#!/bin/bash

# Update all instances of 'from "react-router"' to 'from "react-router-dom"' in .tsx and .ts files
find /Users/bumblebeecreative/Documents/GitHub/Promorang-x/frontend/src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/from "react-router"/from "react-router-dom"/g' {} \;

echo "All react-router imports have been updated to use react-router-dom"
