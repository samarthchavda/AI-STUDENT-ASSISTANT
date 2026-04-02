#!/bin/bash

# Resume Admin API Test Suite
# Usage: ./test_resume_admin_api.sh <admin_token>

TOKEN=$1
BASE_URL="http://localhost:8000"

if [ -z "$TOKEN" ]; then
    echo "Usage: ./test_resume_admin_api.sh <admin_token>"
    echo ""
    echo "To get admin token:"
    echo "1. Login as admin user"
    echo "2. Copy JWT token from browser localStorage or API response"
    exit 1
fi

echo "🧪 Testing Resume Admin APIs..."
echo "================================"
echo "Base URL: $BASE_URL"
echo "Token: ${TOKEN:0:20}..."
echo ""

# Test 1: Resume Analytics
echo "✓ Test 1: Resume Analytics"
echo "GET /api/admin/resume-analytics"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/admin/resume-analytics" \
  -H "Authorization: Bearer $TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Status: $HTTP_CODE"
    echo "$BODY" | jq .
else
    echo "❌ Status: $HTTP_CODE"
    echo "$BODY"
fi
echo ""

# Test 2: Resume Templates
echo "✓ Test 2: Resume Templates"
echo "GET /api/admin/resume-templates"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/admin/resume-templates" \
  -H "Authorization: Bearer $TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Status: $HTTP_CODE"
    echo "$BODY" | jq '.templates | length' | xargs echo "Templates count:"
else
    echo "❌ Status: $HTTP_CODE"
    echo "$BODY"
fi
echo ""

# Test 3: Toggle Template
echo "✓ Test 3: Toggle Template Status"
echo "PUT /api/admin/resume-templates/ats-clean/toggle"
RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/api/admin/resume-templates/ats-clean/toggle" \
  -H "Authorization: Bearer $TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Status: $HTTP_CODE"
    echo "$BODY" | jq .
else
    echo "❌ Status: $HTTP_CODE"
    echo "$BODY"
fi
echo ""

# Test 4: Change Template Tier
echo "✓ Test 4: Change Template Tier to Premium"
echo "PUT /api/admin/resume-templates/ats-clean/tier?tier=premium"
RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/api/admin/resume-templates/ats-clean/tier?tier=premium" \
  -H "Authorization: Bearer $TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Status: $HTTP_CODE"
    echo "$BODY" | jq .
else
    echo "❌ Status: $HTTP_CODE"
    echo "$BODY"
fi
echo ""

# Test 5: User Resumes
echo "✓ Test 5: User Resumes"
echo "GET /api/admin/user-resumes"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/admin/user-resumes" \
  -H "Authorization: Bearer $TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Status: $HTTP_CODE"
    echo "$BODY" | jq '.resumes | length' | xargs echo "Resumes count:"
else
    echo "❌ Status: $HTTP_CODE"
    echo "$BODY"
fi
echo ""

# Test 6: User Resumes Search
echo "✓ Test 6: User Resumes Search"
echo "GET /api/admin/user-resumes?search=test"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/admin/user-resumes?search=test" \
  -H "Authorization: Bearer $TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Status: $HTTP_CODE"
    echo "$BODY" | jq '.resumes | length' | xargs echo "Filtered resumes:"
else
    echo "❌ Status: $HTTP_CODE"
    echo "$BODY"
fi
echo ""

# Test 7: AI Resume Monitor
echo "✓ Test 7: AI Resume Monitor"
echo "GET /api/admin/ai-resume-monitor"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/admin/ai-resume-monitor" \
  -H "Authorization: Bearer $TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Status: $HTTP_CODE"
    echo "$BODY" | jq '{total: .total_generations, success: .successful_requests, failed: .failed_requests, avg_time: .avg_response_time}'
else
    echo "❌ Status: $HTTP_CODE"
    echo "$BODY"
fi
echo ""

# Test 8: Get AI Settings
echo "✓ Test 8: Get AI Settings"
echo "GET /api/admin/ai-settings"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/admin/ai-settings" \
  -H "Authorization: Bearer $TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Status: $HTTP_CODE"
    echo "$BODY" | jq .
else
    echo "❌ Status: $HTTP_CODE"
    echo "$BODY"
fi
echo ""

# Test 9: Update AI Settings
echo "✓ Test 9: Update AI Settings"
echo "PUT /api/admin/ai-settings"
RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/api/admin/ai-settings" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model_name": "gemini-1.5-pro",
    "prompt_version": "v2.0",
    "ai_enabled": true,
    "free_user_limit": 10,
    "premium_user_limit": 100
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Status: $HTTP_CODE"
    echo "$BODY" | jq .
else
    echo "❌ Status: $HTTP_CODE"
    echo "$BODY"
fi
echo ""

# Test 10: Authorization - No Token
echo "✓ Test 10: Authorization Test (No Token)"
echo "GET /api/admin/resume-analytics (no token)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/admin/resume-analytics")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "403" ] || [ "$HTTP_CODE" = "401" ]; then
    echo "✅ Status: $HTTP_CODE (correctly blocked)"
else
    echo "❌ Status: $HTTP_CODE (should be 403 or 401)"
fi
echo ""

echo "================================"
echo "✅ All API tests completed!"
echo ""
echo "Summary:"
echo "- 9 endpoint tests executed"
echo "- 1 authorization test executed"
echo "- Check responses above for details"
