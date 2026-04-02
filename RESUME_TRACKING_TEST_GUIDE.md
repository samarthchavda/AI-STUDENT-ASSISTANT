# Resume Tracking - Testing Guide

## ✅ Migration Completed
Tables created successfully:
- `resume_tracking` (0 records)
- `ai_generation_logs` (0 records)  
- `ai_settings` (1 record - defaults)

---

## 🧪 How to Test

### Step 1: Test Resume Builder Tracking

1. **Login as user**
   - Go to http://localhost:5173/login
   - Login with your account

2. **Open Resume Builder**
   - Go to http://localhost:5173/career/resume-templates
   - Select any template (e.g., "ATS Clean")

3. **Load Sample Data**
   - Click "Load Sample Data" button
   - Open browser console (F12)
   - Look for: `✓ Resume activity tracked: {success: true, resume_id: 1}`

4. **Edit Resume**
   - Change name, email, or any field
   - Wait 3 seconds
   - Check console for: `✓ Resume activity tracked`

5. **Download PDF**
   - Click "Download PDF" button
   - Check console for: `✓ PDF export tracked: {success: true}`

### Step 2: Check Admin Panel

1. **Login as admin**
   - Logout current user
   - Login with admin account

2. **Check User Resumes**
   - Go to http://localhost:5173/admin/user-resumes
   - You should see the resume you created
   - Check: user name, template, AI-generated badge

3. **Check Resume Analytics**
   - Go to http://localhost:5173/admin/resume-analytics
   - Should show:
     - Total Resumes: 1
     - AI Generated: 1 (if you loaded sample data)
     - PDF Exports: 1 (if you downloaded)

4. **Check AI Monitor**
   - Go to http://localhost:5173/admin/ai-resume-monitor
   - Should show AI requests if you used any AI features

---

## 🔍 Debugging

### Check Browser Console
Open browser console (F12) and look for:
- `✓ Resume activity tracked` - Success
- `✗ Tracking failed` - Error with status code
- `⊘ Tracking skipped - guest user` - Not logged in

### Check Backend Logs
```bash
# Start backend with logs visible
cd backend
python3 -m uvicorn app.main:app --reload --port 8000
```

Look for:
- `❌ Resume tracking error:` - Backend error
- POST requests to `/api/career/resume-track`

### Manual API Test
```bash
# Run the test script
cd backend
python3 test_tracking_manually.py

# Enter your JWT token when prompted
# (Get from browser: localStorage.getItem('token'))
```

### Check Database Directly
```bash
cd backend
python3 -c "
import sys
sys.path.insert(0, '.')
from app.core.database import engine
from sqlalchemy import text

conn = engine.connect()

# Check resume_tracking
result = conn.execute(text('SELECT * FROM resume_tracking ORDER BY created_at DESC LIMIT 5'))
print('Resume Tracking Records:')
for row in result:
    print(row)

# Check ai_generation_logs  
result = conn.execute(text('SELECT * FROM ai_generation_logs ORDER BY created_at DESC LIMIT 5'))
print('\nAI Generation Logs:')
for row in result:
    print(row)

conn.close()
"
```

---

## 🐛 Common Issues

### Issue 1: "⊘ Tracking skipped - guest user"
**Cause:** Not logged in
**Solution:** Login first, then use resume builder

### Issue 2: "✗ Tracking failed: 401"
**Cause:** Token expired or invalid
**Solution:** Logout and login again to get fresh token

### Issue 3: "✗ Tracking failed: 500"
**Cause:** Backend error (check backend logs)
**Solution:** 
- Check backend is running
- Check database connection
- Verify migration ran successfully

### Issue 4: No data in admin panel
**Cause:** Tracking calls not being made
**Solution:**
- Check browser console for tracking logs
- Verify you're logged in (check localStorage.getItem('token'))
- Check Network tab for API calls

### Issue 5: "Table doesn't exist"
**Cause:** Migration not run
**Solution:** 
```bash
cd backend
python3 run_resume_admin_migration.py
```

---

## ✅ Expected Behavior

### For Logged-in Users:
- ✓ Sample data load → tracked with `ai_generated: true`
- ✓ Manual edits → tracked after 3 seconds (debounced)
- ✓ PDF download → increments export count
- ✓ AI features → logged in ai_generation_logs
- ✓ All activity visible in admin panel

### For Guest Users:
- ⊘ No tracking (console shows "skipped")
- ⊘ Can use resume builder normally
- ⊘ No data in admin panel

---

## 📊 Verification Checklist

After testing, verify:
- [ ] Browser console shows tracking success messages
- [ ] No errors in browser console
- [ ] Backend logs show POST requests
- [ ] Admin > User Resumes shows your resume
- [ ] Admin > Resume Analytics shows correct counts
- [ ] PDF export count increments on each download
- [ ] Guest users don't create tracking records

---

## 🚀 Quick Test Command

```bash
# 1. Start backend
cd backend && python3 -m uvicorn app.main:app --reload --port 8000

# 2. Start frontend (in new terminal)
cd frontend && npm run dev

# 3. Test in browser
# - Login at http://localhost:5173/login
# - Go to http://localhost:5173/career/resume-templates
# - Select template, load sample data, download PDF
# - Open console (F12) - should see tracking logs

# 4. Check admin panel
# - Login as admin
# - Go to http://localhost:5173/admin/user-resumes
# - Should see your resume
```

---

## 📝 Notes

- Tracking is **non-blocking** - if it fails, resume operations continue
- Tracking requires **valid JWT token** - guest users are not tracked
- Tracking is **debounced** (3 seconds) to avoid excessive API calls
- All tracking logs to **browser console** for debugging
- Backend errors are logged but don't affect user experience

**Migration Status:** ✅ Completed
**Tables Status:** ✅ Created
**Tracking Status:** ✅ Ready to test
