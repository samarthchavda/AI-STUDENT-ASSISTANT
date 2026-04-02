# Resume Activity Tracking - Implementation Guide

## Overview
Complete implementation of resume activity tracking for Admin Resume module. Tracks resume creation, editing, PDF exports, and AI usage for logged-in users only.

---

## What Was Implemented

### 1. Backend Tracking Service
**File:** `backend/app/services/resume_tracking_service.py`

**Functions:**
- `track_resume_activity()` - Tracks resume load/save/update
- `track_pdf_export()` - Increments PDF export count
- `track_ai_generation()` - Logs AI requests with status and response time

**Features:**
- Creates or updates `resume_tracking` records
- Stores resume data as JSONB
- Tracks ATS scores
- Marks AI-generated resumes
- Handles errors gracefully (doesn't fail main operations)

### 2. Backend API Endpoints
**File:** `backend/app/routes/career_routes.py`

**New Endpoints:**
- `POST /api/career/resume-track` - Track resume activity
- `POST /api/career/resume-track-export` - Track PDF export

**Updated Endpoints (with AI tracking):**
- `POST /api/career/resume-analyze` - Tracks AI analysis requests
- `POST /api/career/resume-enhance-section` - Tracks section enhancement
- `POST /api/career/resume-ai-action` - Tracks AI actions (summary, skills, bullets, demo)

**AI Tracking Details:**
- Measures response time in milliseconds
- Logs success/failure status
- Captures error messages on failure
- Request types: `resume_analysis`, `enhance_*`, `suggest_skills`, `enhance_bullets`, `generate_summary`, `generate_demo`

### 3. Frontend API Client
**File:** `frontend/src/api/client.ts`

**New Functions:**
- `careerAPI.trackResumeActivity()` - Track resume operations
- `careerAPI.trackPDFExport()` - Track PDF downloads

### 4. Resume Builder Tracking
**File:** `frontend/public/resume-builder/editor.html`

**Tracking Points:**
1. **Sample Data Load** - When user clicks "Load Sample Data"
   - Tracks with `ai_generated: true`
   - Captures full resume data

2. **Manual Edits** - When user edits any field
   - Debounced tracking (3 seconds after last edit)
   - Tracks with `ai_generated: false`
   - Updates existing record

3. **PDF Download** - When user clicks "Download PDF"
   - Increments `pdf_export_count`
   - Tracks template_id

**Functions Added:**
- `trackResumeActivity(aiGenerated)` - Main tracking function
- `debounceTrackActivity()` - Debounced tracking for edits
- `trackPDFExport()` - PDF download tracking

### 5. Career Page Tracking
**File:** `frontend/src/pages/resume/CareerPage.tsx`

**Tracking Points:**
- PDF download from resume analysis page
- Tracks template type used

---

## Data Flow

### Resume Load/Edit Flow
```
User loads sample data / edits resume
  ↓
trackResumeActivity() called
  ↓
POST /api/career/resume-track
  ↓
resume_tracking_service.track_resume_activity()
  ↓
Creates/updates resume_tracking record
  ↓
Admin sees in User Resumes & Resume Analytics
```

### PDF Export Flow
```
User clicks Download PDF
  ↓
PDF generated and downloaded
  ↓
trackPDFExport() called
  ↓
POST /api/career/resume-track-export
  ↓
resume_tracking_service.track_pdf_export()
  ↓
Increments pdf_export_count
  ↓
Admin sees updated count in Resume Analytics
```

### AI Generation Flow
```
User uses AI feature (summary, enhance, etc.)
  ↓
AI service called (start timer)
  ↓
Success or failure
  ↓
resume_tracking_service.track_ai_generation()
  ↓
Logs to ai_generation_logs
  ↓
Admin sees in AI Resume Monitor
```

---

## Database Tables Used

### resume_tracking
```sql
- id
- user_id (FK to users)
- template_id (e.g., 'ats-clean')
- template_name (e.g., 'ATS Clean')
- template_tier ('free' or 'premium')
- ats_score (0-100)
- ai_generated (boolean)
- pdf_export_count (incremented on each download)
- resume_data (JSONB - full resume content)
- created_at
- updated_at
```

### ai_generation_logs
```sql
- id
- user_id (FK to users)
- module ('resume')
- request_type (e.g., 'generate_summary', 'enhance_experience')
- status ('success' or 'failed')
- response_time_ms (milliseconds)
- error_message (if failed)
- created_at
```

---

## Admin Dashboard Integration

### User Resumes Page
Shows all tracked resumes with:
- User name and email
- Template used
- ATS score
- AI-generated badge
- PDF export count
- Created/updated dates
- Search by user name/email
- Delete functionality

### Resume Analytics Page
Shows aggregated statistics:
- Total resumes created
- AI-generated vs manual count
- Total PDF exports
- Average ATS score
- Premium template usage
- Most popular template
- Templates breakdown table

### AI Resume Monitor Page
Shows AI usage statistics:
- Total AI generations
- Success/failure rates
- Average response time
- Breakdown by request type
- Recent AI requests log

---

## Authentication & Security

### Logged-in Users Only
- All tracking requires valid JWT token
- Guest users (no token) are NOT tracked
- Tracking happens in background (doesn't block UI)
- Tracking failures don't affect user experience

### Token Validation
```javascript
const token = localStorage.getItem('token');
if (!token) {
  // Guest user - don't track
  return;
}
```

### Error Handling
- Backend: Catches exceptions, logs errors, doesn't fail main operation
- Frontend: Catches errors, logs to console, doesn't show to user
- Graceful degradation: If tracking fails, resume operations continue

---

## Testing

### Manual Testing Checklist

1. **Resume Builder - Sample Data**
   - [ ] Login as user
   - [ ] Go to Resume Builder
   - [ ] Select a template
   - [ ] Click "Load Sample Data"
   - [ ] Check Admin > User Resumes (should show new entry)
   - [ ] Check `ai_generated = true`

2. **Resume Builder - Manual Edit**
   - [ ] Edit any field (name, email, etc.)
   - [ ] Wait 3 seconds
   - [ ] Check Admin > User Resumes (should update `updated_at`)
   - [ ] Check `ai_generated = false`

3. **Resume Builder - PDF Download**
   - [ ] Click "Download PDF"
   - [ ] Check Admin > Resume Analytics
   - [ ] Verify PDF export count incremented

4. **Resume Analysis - PDF Download**
   - [ ] Go to Career > Resume Analysis
   - [ ] Upload/paste resume
   - [ ] Click "Analyze"
   - [ ] Click "Download Updated Resume"
   - [ ] Check Admin > Resume Analytics (export count++)

5. **AI Features**
   - [ ] Use any AI feature (summary, enhance, etc.)
   - [ ] Check Admin > AI Resume Monitor
   - [ ] Verify new log entry with response time

6. **Guest User (No Tracking)**
   - [ ] Logout
   - [ ] Use Resume Builder
   - [ ] Download PDF
   - [ ] Check Admin > User Resumes (should NOT show guest activity)

### API Testing

```bash
# Get admin token
TOKEN="your_admin_jwt_token"

# Test resume tracking
curl -X POST http://localhost:8000/api/career/resume-track \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "template_id": "ats-clean",
    "template_name": "ATS Clean",
    "template_tier": "free",
    "ats_score": 85,
    "ai_generated": true,
    "resume_data": {"name": "Test User"}
  }'

# Test PDF export tracking
curl -X POST http://localhost:8000/api/career/resume-track-export \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"template_id": "ats-clean"}'

# Check admin endpoints
curl -X GET http://localhost:8000/api/admin/user-resumes \
  -H "Authorization: Bearer $ADMIN_TOKEN"

curl -X GET http://localhost:8000/api/admin/resume-analytics \
  -H "Authorization: Bearer $ADMIN_TOKEN"

curl -X GET http://localhost:8000/api/admin/ai-resume-monitor \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## Deployment Checklist

- [ ] Database migration already run (resume_tracking, ai_generation_logs tables exist)
- [ ] Backend service file deployed
- [ ] Career routes updated
- [ ] Frontend API client updated
- [ ] Resume builder HTML files updated
- [ ] Career page updated
- [ ] Test with logged-in user
- [ ] Test with guest user (no tracking)
- [ ] Verify admin dashboard shows data

---

## Troubleshooting

### Tracking Not Working

**Check 1: User is logged in**
```javascript
console.log(localStorage.getItem('token')); // Should show JWT token
```

**Check 2: Backend receiving requests**
```bash
# Check backend logs for tracking calls
tail -f backend/logs/app.log | grep "Resume tracking"
```

**Check 3: Database tables exist**
```sql
SELECT COUNT(*) FROM resume_tracking;
SELECT COUNT(*) FROM ai_generation_logs;
```

**Check 4: Network requests**
- Open browser DevTools > Network tab
- Look for `/api/career/resume-track` calls
- Check response status (should be 200)

### Common Issues

**Issue:** "Table doesn't exist"
**Solution:** Run migration: `python3 run_resume_admin_migration.py`

**Issue:** "401 Unauthorized"
**Solution:** User token expired, login again

**Issue:** "Tracking error in console"
**Solution:** Check backend logs, verify API endpoint is correct

---

## Summary

✅ **Backend:** Tracking service + 2 new endpoints + AI tracking in 3 existing endpoints
✅ **Frontend:** API client functions + Resume builder tracking + Career page tracking
✅ **Database:** Uses existing resume_tracking and ai_generation_logs tables
✅ **Security:** Logged-in users only, graceful error handling
✅ **Admin Dashboard:** Fully integrated with User Resumes, Analytics, and AI Monitor

**All tracking is production-ready and non-blocking!** 🚀
