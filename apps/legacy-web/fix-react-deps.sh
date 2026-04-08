#!/bin/bash

# Fix React version conflicts
npm install react@18.2.0 react-dom@18.2.0 react-is@18.2.0

# Clean up any duplicate React installations
rm -rf node_modules/.vite
rm -rf node_modules/.cache

# Reinstall all dependencies
npm install

echo "✅ React dependencies have been fixed. Please restart your development server."
