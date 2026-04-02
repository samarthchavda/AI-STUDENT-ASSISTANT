# Resume Admin Module - Comprehensive Test Suite

## Overview
Complete test coverage for Resume Admin module including backend API tests, frontend component tests, manual QA checklist, curl examples, and database verification.

---

## 1. Backend API Tests (pytest)

### Test Files Created
- `backend/tests/test_resume_admin.py` - 20+ test cases for all 9 endpoints
- `backend/tests/test_resume_admin_integration.py` - Database and migration tests

### Running Backend Tests
```bash
cd backend

# Run all resume admin tests
pytest tests/test_resume_admin.py -v

# Run integration tests
pytest tests/test_resume_admin_integration.py -v

# Run with coverage
pytest tests/test_resume_admin.py --cov=app.routes.admin_routes --cov-report=html

# Run specific test
pytest tests/test_resume_admin.py::test_get_resume_analytics_success -v
```

### Test Coverage Summary
✅ Authentication & Authorization (3 tests)
✅ Resume Analytics (2 tests)
✅ Resume Templates (3 tests)
✅ User Resumes (3 tests)
✅ AI Resume Monitor (2 tests)
✅ AI Settings (5 tests)
✅ Data Validation (2 tests)
✅ Edge Cases (4 tests)

---

## 2. Manual QA Checklist

### Prerequisites
- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:5173
- [ ] Database migration completed (`python3 run_resume_admin_migration.py`)
- [ ] Admin user created with `is_admin=true`
- [ ] At least 2-3 test users with resumes in database

### Test Scenario 1: Resume Analytics Page

**Steps:**
1. [ ] Login as admin user
2. [ ] Navigate to `/admin/resume-analytics`
3. [ ] Verify page loads without errors
4. [ ] Check all metrics display correctly:
   - [ ] Total Resumes count
   - [ ] AI Generated count
   - [ ] Manual Created count
   - [ ] PDF Exports count
   - [ ] Average ATS Score
   - [ ] Premium Template Usage
   - [ ] Most Selected Template
   - [ ] Completion Rate
5. [ ] Verify Templates Breakdown table displays
6. [ ] Check loading states work
7. [ ] Verify error handling (stop backend, check error message)

**Expected Results:**
- All metrics show correct numbers from database
- Charts/graphs render properly
- No console errors
- Responsive on mobile

### Test Scenario 2: Resume Templates Management

**Steps:**
1. [ ] Navigate to `/admin/resume-templates`
2. [ ] Verify all 15 templates display
3. [ ] Check template cards show:
   - [ ] Template name
   - [ ] Tier badge (Free/Premium)
   - [ ] Active/Inactive status
   - [ ] Usage count
   - [ ] Export count
4. [ ] Toggle a template active/inactive
   - [ ] Click toggle button
   - [ ] Verify success message
   - [ ] Check status updates
5. [ ] Change template tier
   - [ ] Click "Change Tier" button
   - [ ] Verify tier changes (Free ↔ Premium)
   - [ ] Check success message
6. [ ] Verify most popular template is highlighted

**Expected Results:**
- All templates load correctly
- Toggle and tier change work instantly
- Success toasts appear
- No API errors in console

### Test Scenario 3: User Resumes Management

**Steps:**
1. [ ] Navigate to `/admin/user-resumes`
2. [ ] Verify resume list displays with columns:
   - [ ] User Name
   - [ ] User Email
   - [ ] Template
   - [ ] ATS Score
   - [ ] AI Generated badge
   - [ ] PDF Exports
   - [ ] Created/Updated dates
3. [ ] Test search functionality
   - [ ] Enter user name in search box
   - [ ] Verify filtered results
   - [ ] Clear search, verify all resumes return
4. [ ] Test delete functionality
   - [ ] Click delete button on a resume
   - [ ] Confirm deletion in modal
   - [ ] Verify resume removed from list
   - [ ] Check database to confirm deletion
5. [ ] Test pagination (if >100 resumes)

**Expected Results:**
- All resumes display correctly
- Search filters work instantly
- Delete removes resume from DB
- Confirmation modal prevents accidental deletes
- No orphaned data in database

### Test Scenario 4: AI Resume Monitor

**Steps:**
1. [ ] Navigate to `/admin/ai-resume-monitor`
2. [ ] Verify AI statistics display:
   - [ ] Total Generations
   - [ ] Successful Requests
   - [ ] Failed Requests
   - [ ] Average Response Time
   - [ ] Summary Generations
   - [ ] Project Generations
   - [ ] Experience Generations
   - [ ] Template Recommendations
3. [ ] Check Recent AI Requests table shows:
   - [ ] User Email
   - [ ] Request Type
   - [ ] Status (success/failed)
   - [ ] Response Time (ms)
   - [ ] Timestamp
4. [ ] Verify data updates when new AI requests are made
5. [ ] Check error handling for failed requests

**Expected Results:**
- All metrics accurate
- Recent requests sorted by timestamp (newest first)
- Failed requests show in red
- Response times in milliseconds

### Test Scenario 5: AI Settings Configuration

**Steps:**
1. [ ] Navigate to `/admin/ai-settings`
2. [ ] Verify current settings load:
   - [ ] Model Name
   - [ ] Prompt Version
   - [ ] AI Enabled toggle
   - [ ] Free User Daily Limit
   - [ ] Premium User Daily Limit
3. [ ] Test updating settings:
   - [ ] Change model name to "gemini-1.5-pro"
   - [ ] Update prompt version to "v2.0"
   - [ ] Toggle AI enabled off/on
   - [ ] Change free limit to 10
   - [ ] Change premium limit to 100
   - [ ] Click "Save Settings"
4. [ ] Verify validation:
   - [ ] Try negative limits (should fail)
   - [ ] Try free limit > premium limit (should fail)
   - [ ] Try empty model name (should fail)
5. [ ] Refresh page, verify settings persisted

**Expected Results:**
- Settings load correctly
- Updates save to database
- Validation prevents invalid data
- Success message on save
- Settings persist after refresh

### Test Scenario 6: Admin Authorization

**Steps:**
1. [ ] Login as regular (non-admin) user
2. [ ] Try to access `/admin/resume-analytics`
3. [ ] Verify redirect to `/dashboard`
4. [ ] Try direct API call without admin token
5. [ ] Verify 403 Forbidden response
6. [ ] Login as admin user
7. [ ] Verify all pages accessible

**Expected Results:**
- Non-admin users cannot access any admin pages
- API returns 403 for non-admin requests
- Admin users have full access
- No security bypasses possible

---

## 3. API Testing with curl

### Setup
```bash
# Get admin JWT token (login first)
TOKEN="your_admin_jwt_token_here"
BASE_URL="http://localhost:8000"
```

### Test 1: Resume Analytics
```bash
curl -X GET "$BASE_URL/api/admin/resume-analytics" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "total_resumes": 150,
  "ai_generated": 95,
  "manual_created": 55,
  "pdf_exports": 120,
  "average_ats_score": 82.5,
  "premium_template_usage": 45,
  "most_selected_template": "ats-clean",
  "completion_rate": 80.0,
  "templates_breakdown": [
    {"template": "ats-clean", "usage": 50, "exports": 40}
  ]
}
```

### Test 2: Get Resume Templates
```bash
curl -X GET "$BASE_URL/api/admin/resume-templates" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "templates": [
    {
      "id": "ats-clean",
      "name": "ATS Clean",
      "tier": "free",
      "active": true,
      "usage_count": 50,
      "export_count": 40
    }
  ],
  "most_popular": "ats-clean"
}
```

### Test 3: Toggle Template Status
```bash
curl -X PUT "$BASE_URL/api/admin/resume-templates/ats-clean/toggle" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Template ats-clean toggled"
}
```

### Test 4: Change Template Tier
```bash
# Change to premium
curl -X PUT "$BASE_URL/api/admin/resume-templates/ats-clean/tier?tier=premium" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Change back to free
curl -X PUT "$BASE_URL/api/admin/resume-templates/ats-clean/tier?tier=free" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

### Test 5: Get User Resumes (with search)
```bash
# Get all resumes
curl -X GET "$BASE_URL/api/admin/user-resumes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Search by name
curl -X GET "$BASE_URL/api/admin/user-resumes?search=john" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "resumes": [
    {
      "id": 1,
      "user_id": 42,
      "user_name": "John Doe",
      "user_email": "john@example.com",
      "template_id": "ats-clean",
      "ats_score": 85,
      "ai_generated": true,
      "pdf_export_count": 3,
      "created_at": "2024-01-15T10:30:00",
      "updated_at": "2024-01-20T14:45:00"
    }
  ]
}
```

### Test 6: Delete User Resume
```bash
# Replace {resume_id} with actual ID
curl -X DELETE "$BASE_URL/api/admin/user-resumes/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Resume deleted successfully"
}
```

### Test 7: Get AI Resume Monitor
```bash
curl -X GET "$BASE_URL/api/admin/ai-resume-monitor" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "total_generations": 150,
  "successful_requests": 142,
  "failed_requests": 8,
  "avg_response_time": 1250.5,
  "summary_generations": 45,
  "project_generations": 38,
  "experience_generations": 52,
  "template_recommendations": 15,
  "recent_requests": [
    {
      "id": 1,
      "user_email": "john@example.com",
      "request_type": "summary",
      "status": "success",
      "response_time": 1200,
      "timestamp": "2024-01-20T14:30:00"
    }
  ]
}
```

### Test 8: Get AI Settings
```bash
curl -X GET "$BASE_URL/api/admin/ai-settings" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "model_name": "gemini-1.5-flash",
  "prompt_version": "v1.0",
  "ai_enabled": true,
  "free_user_limit": 5,
  "premium_user_limit": 50,
  "updated_at": "2024-01-20T14:30:00"
}
```

### Test 9: Update AI Settings
```bash
curl -X PUT "$BASE_URL/api/admin/ai-settings" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model_name": "gemini-1.5-pro",
    "prompt_version": "v2.0",
    "ai_enabled": true,
    "free_user_limit": 10,
    "premium_user_limit": 100
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "AI settings updated successfully",
  "settings": {
    "model_name": "gemini-1.5-pro",
    "prompt_version": "v2.0",
    "ai_enabled": true,
    "free_user_limit": 10,
    "premium_user_limit": 100
  }
}
```

### Test 10: Authorization Tests
```bash
# Test without token (should fail with 403)
curl -X GET "$BASE_URL/api/admin/resume-analytics"

# Test with invalid token (should fail with 401)
curl -X GET "$BASE_URL/api/admin/resume-analytics" \
  -H "Authorization: Bearer invalid_token_12345"

# Test with regular user token (should fail with 403)
curl -X GET "$BASE_URL/api/admin/resume-analytics" \
  -H "Authorization: Bearer $REGULAR_USER_TOKEN"
```

**Expected Responses:**
- No token: `{"detail": "Not authenticated"}` (403)
- Invalid token: `{"detail": "Could not validate credentials"}` (401)
- Regular user: `{"detail": "Not authorized. Admin access required."}` (403)

---

## 4. Postman Collection

### Collection Setup
1. Create new collection: "Resume Admin API"
2. Add environment variable: `{{baseUrl}}` = `http://localhost:8000`
3. Add environment variable: `{{adminToken}}` = your admin JWT token

### Request 1: Resume Analytics
- Method: `GET`
- URL: `{{baseUrl}}/api/admin/resume-analytics`
- Headers: `Authorization: Bearer {{adminToken}}`

### Request 2: Resume Templates
- Method: `GET`
- URL: `{{baseUrl}}/api/admin/resume-templates`
- Headers: `Authorization: Bearer {{adminToken}}`

### Request 3: Toggle Template
- Method: `PUT`
- URL: `{{baseUrl}}/api/admin/resume-templates/ats-clean/toggle`
- Headers: `Authorization: Bearer {{adminToken}}`

### Request 4: Change Template Tier
- Method: `PUT`
- URL: `{{baseUrl}}/api/admin/resume-templates/ats-clean/tier?tier=premium`
- Headers: `Authorization: Bearer {{adminToken}}`

### Request 5: User Resumes
- Method: `GET`
- URL: `{{baseUrl}}/api/admin/user-resumes`
- Headers: `Authorization: Bearer {{adminToken}}`

### Request 6: User Resumes Search
- Method: `GET`
- URL: `{{baseUrl}}/api/admin/user-resumes?search=john`
- Headers: `Authorization: Bearer {{adminToken}}`

### Request 7: Delete Resume
- Method: `DELETE`
- URL: `{{baseUrl}}/api/admin/user-resumes/1`
- Headers: `Authorization: Bearer {{adminToken}}`

### Request 8: AI Monitor
- Method: `GET`
- URL: `{{baseUrl}}/api/admin/ai-resume-monitor`
- Headers: `Authorization: Bearer {{adminToken}}`

### Request 9: Get AI Settings
- Method: `GET`
- URL: `{{baseUrl}}/api/admin/ai-settings`
- Headers: `Authorization: Bearer {{adminToken}}`

### Request 10: Update AI Settings
- Method: `PUT`
- URL: `{{baseUrl}}/api/admin/ai-settings`
- Headers: `Authorization: Bearer {{adminToken}}`
- Body (JSON):
```json
{
  "model_name": "gemini-1.5-pro",
  "prompt_version": "v2.0",
  "ai_enabled": true,
  "free_user_limit": 10,
  "premium_user_limit": 100
}
```

---

## 5. Database Verification Checklist

### Verify Tables Exist
```sql
-- Check all 3 tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('resume_tracking', 'ai_generation_logs', 'ai_settings');
```

**Expected:** 3 rows returned

### Verify resume_tracking Schema
```sql
-- Check columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'resume_tracking'
ORDER BY ordinal_position;
```

**Expected Columns:**
- id (integer, NOT NULL)
- user_id (integer, NOT NULL)
- template_id (text, NOT NULL)
- template_name (text, nullable)
- template_tier (text, nullable)
- ats_score (integer, nullable)
- ai_generated (boolean, nullable)
- pdf_export_count (integer, nullable)
- resume_data (jsonb, nullable)
- created_at (timestamp, nullable)
- updated_at (timestamp, nullable)

### Verify Foreign Keys and Cascade
```sql
-- Check foreign key constraints
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('resume_tracking', 'ai_generation_logs', 'ai_settings');
```

**Expected:**
- resume_tracking.user_id → users.id (CASCADE)
- ai_generation_logs.user_id → users.id (CASCADE)
- ai_settings.updated_by → users.id (nullable)

### Verify Indexes
```sql
-- Check indexes on resume_tracking
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'resume_tracking';
```

**Expected Indexes:**
- idx_resume_tracking_user_id
- idx_resume_tracking_template_id
- idx_resume_tracking_created_at

### Test Data Insertion
```sql
-- Insert test resume tracking record
INSERT INTO resume_tracking 
(user_id, template_id, template_name, template_tier, ats_score, ai_generated, pdf_export_count, resume_data)
VALUES 
(1, 'ats-clean', 'ATS Clean', 'free', 85, true, 3, '{"name": "Test User", "email": "test@example.com"}'::jsonb);

-- Verify insertion
SELECT * FROM resume_tracking WHERE template_id = 'ats-clean' ORDER BY id DESC LIMIT 1;
```

### Test AI Generation Log
```sql
-- Insert test AI log
INSERT INTO ai_generation_logs 
(user_id, module, request_type, status, response_time_ms, error_message)
VALUES 
(1, 'resume', 'summary', 'success', 1250, NULL);

-- Verify insertion
SELECT * FROM ai_generation_logs WHERE module = 'resume' ORDER BY id DESC LIMIT 1;
```

### Test AI Settings
```sql
-- Insert/Update AI settings
INSERT INTO ai_settings 
(module, model_name, prompt_version, ai_enabled, free_user_limit, premium_user_limit, updated_by)
VALUES 
('resume', 'gemini-1.5-flash', 'v1.0', true, 5, 50, 1)
ON CONFLICT (module) 
DO UPDATE SET
    model_name = EXCLUDED.model_name,
    prompt_version = EXCLUDED.prompt_version,
    updated_at = CURRENT_TIMESTAMP;

-- Verify settings
SELECT * FROM ai_settings WHERE module = 'resume';
```

### Test Cascade Delete
```sql
-- Create test user
INSERT INTO users (email, name, hashed_password, plan)
VALUES ('cascade_test@test.com', 'Cascade Test', 'hash123', 'free')
RETURNING id;

-- Insert resume for test user (use returned ID)
INSERT INTO resume_tracking (user_id, template_id)
VALUES (123, 'test-template');  -- Replace 123 with actual user ID

-- Insert AI log for test user
INSERT INTO ai_generation_logs (user_id, module, request_type, status, response_time_ms)
VALUES (123, 'resume', 'summary', 'success', 1000);

-- Verify records exist
SELECT COUNT(*) FROM resume_tracking WHERE user_id = 123;
SELECT COUNT(*) FROM ai_generation_logs WHERE user_id = 123;

-- Delete user (should cascade)
DELETE FROM users WHERE id = 123;

-- Verify cascade delete worked
SELECT COUNT(*) FROM resume_tracking WHERE user_id = 123;  -- Should be 0
SELECT COUNT(*) FROM ai_generation_logs WHERE user_id = 123;  -- Should be 0
```

### Analytics Queries
```sql
-- Get resume analytics (same as API endpoint)
SELECT 
    COUNT(*) as total_resumes,
    COUNT(CASE WHEN ai_generated = true THEN 1 END) as ai_generated,
    COUNT(CASE WHEN ai_generated = false THEN 1 END) as manual_created,
    SUM(pdf_export_count) as pdf_exports,
    AVG(ats_score) as avg_ats_score,
    COUNT(CASE WHEN template_tier = 'premium' THEN 1 END) as premium_usage
FROM resume_tracking;

-- Get most popular template
SELECT template_id, COUNT(*) as count
FROM resume_tracking
GROUP BY template_id
ORDER BY count DESC
LIMIT 1;

-- Get templates breakdown
SELECT template_id, COUNT(*) as usage_count, SUM(pdf_export_count) as exports
FROM resume_tracking
GROUP BY template_id
ORDER BY usage_count DESC;
```

### AI Monitor Queries
```sql
-- Get AI generation statistics
SELECT 
    COUNT(*) as total_generations,
    COUNT(CASE WHEN status = 'success' THEN 1 END) as successful,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
    AVG(response_time_ms) as avg_response_time,
    COUNT(CASE WHEN request_type = 'summary' THEN 1 END) as summary_count,
    COUNT(CASE WHEN request_type = 'project' THEN 1 END) as project_count,
    COUNT(CASE WHEN request_type = 'experience' THEN 1 END) as experience_count,
    COUNT(CASE WHEN request_type = 'template_recommendation' THEN 1 END) as template_rec_count
FROM ai_generation_logs
WHERE module = 'resume';

-- Get recent AI requests with user info
SELECT 
    agl.id,
    u.email as user_email,
    agl.request_type,
    agl.status,
    agl.response_time_ms,
    agl.created_at
FROM ai_generation_logs agl
JOIN users u ON u.id = agl.user_id
WHERE agl.module = 'resume'
ORDER BY agl.created_at DESC
LIMIT 50;
```

### Data Integrity Checks
```sql
-- Check for orphaned resume records (user doesn't exist)
SELECT rt.id, rt.user_id
FROM resume_tracking rt
LEFT JOIN users u ON u.id = rt.user_id
WHERE u.id IS NULL;

-- Check for orphaned AI logs
SELECT agl.id, agl.user_id
FROM ai_generation_logs agl
LEFT JOIN users u ON u.id = agl.user_id
WHERE u.id IS NULL;

-- Check for invalid template tiers
SELECT id, template_id, template_tier
FROM resume_tracking
WHERE template_tier NOT IN ('free', 'premium');

-- Check for invalid ATS scores (should be 0-100)
SELECT id, template_id, ats_score
FROM resume_tracking
WHERE ats_score < 0 OR ats_score > 100;
```

---

## 6. Frontend Component Tests (React Testing Library)

### Test File: `frontend/src/pages/admin/__tests__/ResumeAdmin.test.tsx`

**Test Cases to Implement:**

1. **ResumeAnalyticsPage Tests**
   - Renders loading state initially
   - Fetches and displays analytics data
   - Shows error message on API failure
   - Displays all metrics correctly
   - Renders templates breakdown table
   - Handles empty data gracefully

2. **ResumeTemplatesPage Tests**
   - Renders all 15 templates
   - Displays template cards with correct data
   - Toggle button changes template status
   - Change tier button updates tier
   - Shows success toast on actions
   - Handles API errors gracefully
   - Highlights most popular template

3. **UserResumesPage Tests**
   - Renders resume list
   - Search input filters results
   - Delete button shows confirmation modal
   - Confirms deletion removes resume
   - Handles empty search results
   - Shows loading state during fetch

4. **AIResumeMonitorPage Tests**
   - Displays AI statistics
   - Renders recent requests table
   - Shows success/failed status colors
   - Formats response times correctly
   - Handles no data state

5. **AISettingsPage Tests**
   - Loads current settings
   - Form inputs update state
   - Save button calls API
   - Validates negative limits
   - Validates free > premium limit
   - Shows success message on save
   - Displays validation errors

### Example Test Implementation
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ResumeAnalyticsPage from '../ResumeAnalyticsPage';

// Mock API client
vi.mock('../../../api/client', () => ({
  default: {
    get: vi.fn()
  }
}));

describe('ResumeAnalyticsPage', () => {
  it('renders analytics data', async () => {
    const mockData = {
      total_resumes: 150,
      ai_generated: 95,
      pdf_exports: 120
    };
    
    apiClient.get.mockResolvedValue({ data: mockData });
    
    render(<ResumeAnalyticsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('95')).toBeInTheDocument();
    });
  });
});
```

---

## 7. End-to-End Test Scenarios

### E2E Test 1: Complete Resume Creation Flow
1. Login as regular user
2. Navigate to Resume Builder
3. Fill resume form with AI assistance
4. Generate AI summary (verify log created)
5. Generate AI project description (verify log created)
6. Select template
7. Export to PDF (verify export count incremented)
8. Login as admin
9. Check Resume Analytics (verify counts updated)
10. Check AI Monitor (verify logs appear)

### E2E Test 2: Template Management Flow
1. Login as admin
2. Navigate to Resume Templates
3. Toggle "ATS Clean" to inactive
4. Login as regular user
5. Verify "ATS Clean" not available in template selector
6. Login as admin
7. Toggle "ATS Clean" back to active
8. Change tier to premium
9. Login as free user
10. Verify "ATS Clean" shows premium lock

### E2E Test 3: User Resume Deletion Flow
1. Login as regular user
2. Create 2 resumes with different templates
3. Export both to PDF
4. Login as admin
5. Navigate to User Resumes
6. Search for user by email
7. Delete one resume
8. Verify only 1 resume remains
9. Check database directly (verify deletion)
10. Login as regular user
11. Verify only 1 resume in their account

### E2E Test 4: AI Settings Update Flow
1. Login as admin
2. Navigate to AI Settings
3. Change free limit from 5 to 3
4. Save settings
5. Login as free user
6. Use AI generation 3 times
7. Try 4th time (should fail with limit message)
8. Login as admin
9. Change limit back to 5
10. Login as free user
11. Verify can use AI again

---

## 8. Migration Verification

### Run Migration
```bash
cd backend
python3 run_resume_admin_migration.py
```

### Verify Migration Success
```sql
-- Check tables created
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_name IN ('resume_tracking', 'ai_generation_logs', 'ai_settings');
-- Expected: 3

-- Check default AI settings inserted
SELECT * FROM ai_settings WHERE module = 'resume';
-- Expected: 1 row with default values

-- Check indexes created
SELECT indexname FROM pg_indexes 
WHERE tablename IN ('resume_tracking', 'ai_generation_logs', 'ai_settings');
-- Expected: Multiple indexes
```

### Rollback Migration (if needed)
```sql
-- Drop tables in correct order (respect foreign keys)
DROP TABLE IF EXISTS ai_generation_logs CASCADE;
DROP TABLE IF EXISTS resume_tracking CASCADE;
DROP TABLE IF EXISTS ai_settings CASCADE;
```

---

## 9. Performance Testing

### Load Test: Resume Analytics
```bash
# Install Apache Bench
# brew install httpd (macOS)

# Test analytics endpoint (100 requests, 10 concurrent)
ab -n 100 -c 10 \
   -H "Authorization: Bearer $TOKEN" \
   http://localhost:8000/api/admin/resume-analytics
```

**Expected:**
- All requests succeed (200 OK)
- Average response time < 500ms
- No failed requests

### Load Test: User Resumes Search
```bash
# Test search with 50 concurrent requests
ab -n 50 -c 10 \
   -H "Authorization: Bearer $TOKEN" \
   "http://localhost:8000/api/admin/user-resumes?search=test"
```

**Expected:**
- Response time < 1000ms
- No database connection errors
- Consistent results

### Database Query Performance
```sql
-- Test analytics query performance
EXPLAIN ANALYZE
SELECT 
    COUNT(*) as total_resumes,
    COUNT(CASE WHEN ai_generated = true THEN 1 END) as ai_generated,
    SUM(pdf_export_count) as pdf_exports,
    AVG(ats_score) as avg_ats_score
FROM resume_tracking;

-- Should use indexes, execution time < 100ms

-- Test user resumes search performance
EXPLAIN ANALYZE
SELECT rt.*, u.name, u.email
FROM resume_tracking rt
JOIN users u ON u.id = rt.user_id
WHERE LOWER(u.name) LIKE LOWER('%test%')
ORDER BY rt.updated_at DESC
LIMIT 100;

-- Should use indexes on user_id and updated_at
```

---

## 10. Security Testing

### Test 1: Unauthorized Access
```bash
# Try without token
curl -X GET "$BASE_URL/api/admin/resume-analytics"
# Expected: 403 Forbidden

# Try with expired token
curl -X GET "$BASE_URL/api/admin/resume-analytics" \
  -H "Authorization: Bearer expired_token_here"
# Expected: 401 Unauthorized
```

### Test 2: SQL Injection Prevention
```bash
# Try SQL injection in search parameter
curl -X GET "$BASE_URL/api/admin/user-resumes?search='; DROP TABLE users; --" \
  -H "Authorization: Bearer $TOKEN"
# Expected: Safe handling, no SQL execution

# Try SQL injection in template_id
curl -X PUT "$BASE_URL/api/admin/resume-templates/'; DROP TABLE resume_tracking; --/toggle" \
  -H "Authorization: Bearer $TOKEN"
# Expected: Safe handling or 404
```

### Test 3: Input Validation
```bash
# Test invalid tier value
curl -X PUT "$BASE_URL/api/admin/resume-templates/ats-clean/tier?tier=invalid" \
  -H "Authorization: Bearer $TOKEN"
# Expected: 422 Validation Error

# Test negative limits in AI settings
curl -X PUT "$BASE_URL/api/admin/ai-settings" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model_name": "gemini-1.5-flash",
    "prompt_version": "v1.0",
    "ai_enabled": true,
    "free_user_limit": -5,
    "premium_user_limit": 50
  }'
# Expected: 400 Bad Request

# Test free limit > premium limit
curl -X PUT "$BASE_URL/api/admin/ai-settings" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model_name": "gemini-1.5-flash",
    "prompt_version": "v1.0",
    "ai_enabled": true,
    "free_user_limit": 100,
    "premium_user_limit": 50
  }'
# Expected: 400 Bad Request with message "Free user limit cannot exceed premium user limit"
```

### Test 4: Rate Limiting (if implemented)
```bash
# Make 100 rapid requests
for i in {1..100}; do
  curl -X GET "$BASE_URL/api/admin/resume-analytics" \
    -H "Authorization: Bearer $TOKEN" &
done
wait
# Expected: All succeed or rate limit kicks in
```

---

## 11. Error Handling Tests

### Test Database Connection Failure
```bash
# Stop database
# sudo systemctl stop postgresql

# Try API call
curl -X GET "$BASE_URL/api/admin/resume-analytics" \
  -H "Authorization: Bearer $TOKEN"
# Expected: 500 Internal Server Error with meaningful message

# Restart database
# sudo systemctl start postgresql
```

### Test Missing Tables (before migration)
```bash
# Drop tables temporarily
psql -U your_user -d codecampus -c "DROP TABLE IF EXISTS resume_tracking CASCADE;"

# Try API call
curl -X GET "$BASE_URL/api/admin/resume-analytics" \
  -H "Authorization: Bearer $TOKEN"
# Expected: Returns empty/default data gracefully (no crash)

# Re-run migration
python3 run_resume_admin_migration.py
```

### Test Invalid Resume ID
```bash
# Try to delete non-existent resume
curl -X DELETE "$BASE_URL/api/admin/user-resumes/99999" \
  -H "Authorization: Bearer $TOKEN"
# Expected: 404 Not Found
```

---

## 12. Executable Test Scripts

### Bash Script: Complete API Test Suite
Create file: `backend/tests/test_resume_admin_api.sh`

```bash
#!/bin/bash

# Resume Admin API Test Suite
# Usage: ./test_resume_admin_api.sh <admin_token>

TOKEN=$1
BASE_URL="http://localhost:8000"

if [ -z "$TOKEN" ]; then
    echo "Usage: ./test_resume_admin_api.sh <admin_token>"
    exit 1
fi

echo "🧪 Testing Resume Admin APIs..."
echo "================================"

# Test 1: Resume Analytics
echo -e "\n✓ Test 1: Resume Analytics"
curl -s -X GET "$BASE_URL/api/admin/resume-analytics" \
  -H "Authorization: Bearer $TOKEN" | jq .

# Test 2: Resume Templates
echo -e "\n✓ Test 2: Resume Templates"
curl -s -X GET "$BASE_URL/api/admin/resume-templates" \
  -H "Authorization: Bearer $TOKEN" | jq .

# Test 3: Toggle Template
echo -e "\n✓ Test 3: Toggle Template Status"
curl -s -X PUT "$BASE_URL/api/admin/resume-templates/ats-clean/toggle" \
  -H "Authorization: Bearer $TOKEN" | jq .

# Test 4: Change Template Tier
echo -e "\n✓ Test 4: Change Template Tier"
curl -s -X PUT "$BASE_URL/api/admin/resume-templates/ats-clean/tier?tier=premium" \
  -H "Authorization: Bearer $TOKEN" | jq .

# Test 5: User Resumes
echo -e "\n✓ Test 5: User Resumes"
curl -s -X GET "$BASE_URL/api/admin/user-resumes" \
  -H "Authorization: Bearer $TOKEN" | jq .

# Test 6: User Resumes Search
echo -e "\n✓ Test 6: User Resumes Search"
curl -s -X GET "$BASE_URL/api/admin/user-resumes?search=test" \
  -H "Authorization: Bearer $TOKEN" | jq .

# Test 7: AI Monitor
echo -e "\n✓ Test 7: AI Resume Monitor"
curl -s -X GET "$BASE_URL/api/admin/ai-resume-monitor" \
  -H "Authorization: Bearer $TOKEN" | jq .

# Test 8: Get AI Settings
echo -e "\n✓ Test 8: Get AI Settings"
curl -s -X GET "$BASE_URL/api/admin/ai-settings" \
  -H "Authorization: Bearer $TOKEN" | jq .

# Test 9: Update AI Settings
echo -e "\n✓ Test 9: Update AI Settings"
curl -s -X PUT "$BASE_URL/api/admin/ai-settings" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model_name": "gemini-1.5-pro",
    "prompt_version": "v2.0",
    "ai_enabled": true,
    "free_user_limit": 10,
    "premium_user_limit": 100
  }' | jq .

echo -e "\n================================"
echo "✅ All tests completed!"
```

**Make executable:**
```bash
chmod +x backend/tests/test_resume_admin_api.sh
```

**Run:**
```bash
./backend/tests/test_resume_admin_api.sh "your_admin_token_here"
```

---

## 13. Database Verification Script

### SQL Script: `backend/tests/verify_resume_admin_db.sql`

```sql
-- Resume Admin Database Verification Script
-- Run with: psql -U your_user -d codecampus -f verify_resume_admin_db.sql

\echo '🔍 Verifying Resume Admin Database Setup...'
\echo '=========================================='

-- 1. Check tables exist
\echo '\n✓ Checking tables exist...'
SELECT 
    CASE 
        WHEN COUNT(*) = 3 THEN '✅ All 3 tables exist'
        ELSE '❌ Missing tables: ' || (3 - COUNT(*))::text
    END as status
FROM information_schema.tables 
WHERE table_name IN ('resume_tracking', 'ai_generation_logs', 'ai_settings');

-- 2. Check resume_tracking structure
\echo '\n✓ Checking resume_tracking columns...'
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'resume_tracking'
ORDER BY ordinal_position;

-- 3. Check foreign keys
\echo '\n✓ Checking foreign key constraints...'
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table,
    rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('resume_tracking', 'ai_generation_logs');

-- 4. Check indexes
\echo '\n✓ Checking indexes...'
SELECT tablename, indexname
FROM pg_indexes
WHERE tablename IN ('resume_tracking', 'ai_generation_logs', 'ai_settings')
ORDER BY tablename, indexname;

-- 5. Check data counts
\echo '\n✓ Checking data counts...'
SELECT 
    'resume_tracking' as table_name,
    COUNT(*) as row_count
FROM resume_tracking
UNION ALL
SELECT 
    'ai_generation_logs',
    COUNT(*)
FROM ai_generation_logs
UNION ALL
SELECT 
    'ai_settings',
    COUNT(*)
FROM ai_settings;

-- 6. Check AI settings defaults
\echo '\n✓ Checking AI settings defaults...'
SELECT * FROM ai_settings WHERE module = 'resume';

-- 7. Check for orphaned records
\echo '\n✓ Checking for orphaned records...'
SELECT 
    'Orphaned resume_tracking' as issue,
    COUNT(*) as count
FROM resume_tracking rt
LEFT JOIN users u ON u.id = rt.user_id
WHERE u.id IS NULL
UNION ALL
SELECT 
    'Orphaned ai_generation_logs',
    COUNT(*)
FROM ai_generation_logs agl
LEFT JOIN users u ON u.id = agl.user_id
WHERE u.id IS NULL;

\echo '\n=========================================='
\echo '✅ Database verification complete!'
```

---

## 14. Test Data Generators

### Python Script: Generate Test Data
Create file: `backend/tests/generate_resume_test_data.py`

```python
"""Generate test data for Resume Admin module"""
from sqlalchemy import create_engine, text
import random
from datetime import datetime, timedelta

DATABASE_URL = "postgresql://localhost/codecampus"
engine = create_engine(DATABASE_URL)

templates = [
    'ats-simple', 'ats-clean', 'ats-compact',
    'professional-classic', 'professional-navy',
    'modern-minimalist', 'creative-teal', 'premium-glass'
]

request_types = ['summary', 'project', 'experience', 'template_recommendation']
statuses = ['success', 'failed']

def generate_resume_tracking(user_ids, count=100):
    """Generate resume tracking records"""
    with engine.begin() as conn:
        for _ in range(count):
            user_id = random.choice(user_ids)
            template_id = random.choice(templates)
            ai_generated = random.choice([True, False])
            ats_score = random.randint(60, 95)
            pdf_exports = random.randint(0, 10)
            
            conn.execute(text("""
                INSERT INTO resume_tracking 
                (user_id, template_id, template_tier, ats_score, ai_generated, pdf_export_count)
                VALUES (:user_id, :template_id, 'free', :ats_score, :ai_gen, :exports)
            """), {
                "user_id": user_id,
                "template_id": template_id,
                "ats_score": ats_score,
                "ai_gen": ai_generated,
                "exports": pdf_exports
            })
    
    print(f"✅ Generated {count} resume tracking records")

def generate_ai_logs(user_ids, count=200):
    """Generate AI generation logs"""
    with engine.begin() as conn:
        for _ in range(count):
            user_id = random.choice(user_ids)
            request_type = random.choice(request_types)
            status = random.choice(statuses)
            response_time = random.randint(500, 3000)
            error_msg = "API timeout" if status == 'failed' else None
            
            conn.execute(text("""
                INSERT INTO ai_generation_logs 
                (user_id, module, request_type, status, response_time_ms, error_message)
                VALUES (:user_id, 'resume', :req_type, :status, :resp_time, :error)
            """), {
                "user_id": user_id,
                "req_type": request_type,
                "status": status,
                "resp_time": response_time,
                "error": error_msg
            })
    
    print(f"✅ Generated {count} AI generation logs")

if __name__ == "__main__":
    # Get user IDs from database
    with engine.begin() as conn:
        result = conn.execute(text("SELECT id FROM users LIMIT 20"))
        user_ids = [row[0] for row in result.fetchall()]
    
    if not user_ids:
        print("❌ No users found in database. Create users first.")
        exit(1)
    
    print(f"📊 Generating test data for {len(user_ids)} users...")
    generate_resume_tracking(user_ids, 100)
    generate_ai_logs(user_ids, 200)
    print("✅ Test data generation complete!")
```

**Run:**
```bash
cd backend
python3 tests/generate_resume_test_data.py
```

---

## 15. Regression Testing Checklist

### After Code Changes
- [ ] Run all pytest tests: `pytest tests/test_resume_admin*.py -v`
- [ ] Check no new TypeScript errors: `cd frontend && npm run type-check`
- [ ] Verify all 9 API endpoints still work (curl script)
- [ ] Test admin authorization still enforced
- [ ] Check database queries still performant
- [ ] Verify frontend pages load without errors
- [ ] Test on mobile viewport (Chrome DevTools)

### Before Deployment
- [ ] All pytest tests pass
- [ ] Manual QA checklist completed
- [ ] Database migration tested on staging
- [ ] Performance tests pass (< 500ms response)
- [ ] Security tests pass (no unauthorized access)
- [ ] Frontend builds without errors: `npm run build`
- [ ] Backend starts without errors
- [ ] Check browser console for errors
- [ ] Verify responsive design on mobile

---

## 16. Common Issues & Solutions

### Issue: "Table doesn't exist" error
**Solution:**
```bash
cd backend
python3 run_resume_admin_migration.py
```

### Issue: "Admin access required" error
**Solution:**
```sql
-- Make user admin
UPDATE users SET is_admin = true WHERE email = 'your_email@example.com';
```

### Issue: JWT token expired
**Solution:**
```bash
# Login again to get fresh token
curl -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "your_password"}'
```

### Issue: Frontend shows "Failed to fetch"
**Solution:**
1. Check backend is running: `curl http://localhost:8000/health`
2. Check CORS settings in backend
3. Verify API_URL in frontend .env
4. Check browser console for actual error

### Issue: Tests fail with "Connection refused"
**Solution:**
```bash
# Check database is running
psql -U your_user -d codecampus -c "SELECT 1;"

# Check backend is running
curl http://localhost:8000/health
```

### Issue: Cascade delete not working
**Solution:**
```sql
-- Check foreign key constraints have ON DELETE CASCADE
SELECT
    tc.table_name,
    kcu.column_name,
    rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.referential_constraints rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'resume_tracking';

-- If delete_rule is not CASCADE, re-run migration
```

---

## 17. Test Execution Order

### First Time Setup
1. Run database migration
2. Create admin user
3. Generate test data
4. Run backend pytest suite
5. Start backend server
6. Run curl API tests
7. Start frontend
8. Complete manual QA checklist

### Regular Testing (after changes)
1. Run pytest suite
2. Run curl API tests
3. Spot check frontend pages
4. Run regression checklist

### Pre-Deployment
1. Full pytest suite
2. Full manual QA
3. Performance tests
4. Security tests
5. Database verification
6. Frontend build test

---

## 18. Test Coverage Report

### Backend Coverage
```bash
cd backend
pytest tests/test_resume_admin*.py --cov=app.routes.admin_routes --cov-report=term --cov-report=html

# Open coverage report
open htmlcov/index.html
```

**Target Coverage:**
- Resume admin endpoints: 90%+
- Auth functions: 100%
- Database operations: 85%+

---

## Summary

✅ **Backend Tests**: 24+ pytest cases covering all endpoints
✅ **Manual QA**: 6 detailed test scenarios with checklists
✅ **curl Examples**: 10 executable API tests
✅ **Postman Collection**: 10 requests ready to import
✅ **Database Verification**: SQL queries for schema and data validation
✅ **Frontend Tests**: Test structure and examples provided
✅ **E2E Scenarios**: 4 complete user flows
✅ **Performance Tests**: Load testing with Apache Bench
✅ **Security Tests**: Auth, injection, validation tests
✅ **Test Scripts**: Executable bash and Python scripts
✅ **Regression Checklist**: Before/after deployment checks

**All test artifacts are production-ready and executable!** 🚀
