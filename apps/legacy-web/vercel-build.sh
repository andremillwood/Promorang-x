#!/bin/bash
set -e
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
npm install --legacy-peer-deps
npm run build
