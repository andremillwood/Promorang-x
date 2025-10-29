#!/bin/bash

echo "🧪 Testing Promorang Authentication System"
echo "=========================================="

BASE_URL="http://localhost:3001/api"
FRONTEND_URL="http://localhost:5173"

echo ""
echo "1. Testing Health Endpoint..."
curl -s -X GET "$BASE_URL/health" | jq . 2>/dev/null || curl -s -X GET "$BASE_URL/health"

echo ""
echo "2. Testing Demo Creator Login..."
curl -s -X POST "$BASE_URL/auth/demo/creator" -H "Content-Type: application/json" | jq . 2>/dev/null || curl -s -X POST "$BASE_URL/auth/demo/creator" -H "Content-Type: application/json"

echo ""
echo "3. Testing Demo Investor Login..."
curl -s -X POST "$BASE_URL/auth/demo/investor" -H "Content-Type: application/json" | jq . 2>/dev/null || curl -s -X POST "$BASE_URL/auth/demo/investor" -H "Content-Type: application/json"

echo ""
echo "4. Testing Demo Advertiser Login..."
curl -s -X POST "$BASE_URL/auth/demo/advertiser" -H "Content-Type: application/json" | jq . 2>/dev/null || curl -s -X POST "$BASE_URL/auth/demo/advertiser" -H "Content-Type: application/json"

echo ""
echo "5. Testing Google OAuth URL..."
curl -s -X GET "$BASE_URL/auth/oauth/google/url" | jq . 2>/dev/null || curl -s -X GET "$BASE_URL/auth/oauth/google/url"

echo ""
echo "6. Testing Frontend Connection..."
if curl -s -I "$FRONTEND_URL" | head -1 | grep -q "200\|301\|302"; then
    echo "✅ Frontend is running"
else
    echo "❌ Frontend is not responding"
fi

echo ""
echo "7. Testing CORS and Proxy..."
curl -s -X OPTIONS "$BASE_URL/auth/demo/creator" -H "Origin: $FRONTEND_URL" -v 2>&1 | grep -i "access-control\|origin" | head -5

echo ""
echo "=========================================="
echo "🎯 Authentication System Test Complete!"
echo ""
echo "Demo Accounts Available:"
echo "  Creator:    creator@demo.com    / demo123"
echo "  Investor:   investor@demo.com   / demo123"
echo "  Advertiser: advertiser@demo.com / demo123"
echo ""
echo "To test in browser:"
echo "  1. Go to: $FRONTEND_URL"
echo "  2. Click 'Quick Demo' buttons on the page"
echo "  3. Or go to: $FRONTEND_URL/auth"
echo "  4. Use demo credentials above"
echo "=========================================="
