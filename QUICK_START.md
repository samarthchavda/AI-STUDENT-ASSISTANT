# Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide will help you quickly set up and test all the new features.

---

## Step 1: Install Dependencies (2 minutes)

### macOS
```bash
# System dependencies
brew install tesseract poppler libmagic

# Python packages
cd backend
pip install -r requirements.txt
```

### Ubuntu/Debian
```bash
# System dependencies
sudo apt-get install tesseract-ocr poppler-utils libmagic1

# Python packages
cd backend
pip install -r requirements.txt
```

---

## Step 2: Run Migration (1 minute)

```bash
cd backend
python3 migrate_auth_improvements.py
```

**Expected output:**
```
✓ Users table updated successfully
✓ refresh_tokens table created successfully
✓ token_blacklist table created successfully
✓ Updated X Google OAuth users
✓ Migration completed successfully!
```

---

## Step 3: Start Server (30 seconds)

```bash
cd backend
python3 main.py
```

**Expected output:**
```
✅ Gemini AI initialized successfully
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

## Step 4: Test Features (1.5 minutes)

### Test 1: Public API (No Auth)
```bash
# Get companies
curl http://localhost:8000/api/companies

# Search Amazon questions
curl http://localhost:8000/api/questions?company=amazon
```

### Test 2: Register with Strong Password
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "Password@123"
  }'
```

**Expected:** Returns access_token + refresh_token

### Test 3: Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password@123"
  }'
```

**Expected:** Returns tokens

### Test 4: Refresh Token
```bash
# Save refresh token from login response
REFRESH_TOKEN="your_refresh_token_here"

curl -X POST http://localhost:8000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refresh_token\": \"$REFRESH_TOKEN\"}"
```

**Expected:** Returns new access_token

---

## Step 5: Run Test Scripts (Optional)

```bash
cd backend

# Test admin features
python3 test_new_features.py

# Test auth features
python3 test_auth_improvements.py
```

---

## 🎯 Quick Feature Tests

### Test ATS Score
```bash
curl -X POST http://localhost:8000/api/career/resume-ats-score \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "resumeText": "John Doe\nSoftware Engineer\nSkills: Python, React, SQL\nExperience: Built web applications"
  }'
```

### Test Job Match
```bash
curl -X POST http://localhost:8000/api/career/job-match \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "resume_text=Skills: Python, React, SQL" \
  -F "job_description=Required: Python, React, AWS, Docker"
```

### Test Rate Limiting
```bash
# Send 11 requests quickly (11th should fail)
for i in {1..11}; do
  curl http://localhost:8000/api/categories
done
```

---

## ✅ Verification Checklist

After setup, verify these work:

- [ ] Server starts without errors
- [ ] Migration completes successfully
- [ ] Public API works (no auth)
- [ ] Register with strong password works
- [ ] Login returns refresh token
- [ ] Refresh token works
- [ ] Rate limiting blocks after limit
- [ ] ATS score endpoint works
- [ ] Job match endpoint works

---

## 🔧 Troubleshooting

### Issue: Migration fails
**Solution:** Check database connection in `.env` file

### Issue: OCR not working
**Solution:** Install tesseract and poppler
```bash
# macOS
brew install tesseract poppler

# Ubuntu
sudo apt-get install tesseract-ocr poppler-utils
```

### Issue: python-magic error
**Solution:** Install libmagic
```bash
# macOS
brew install libmagic

# Ubuntu
sudo apt-get install libmagic1
```

### Issue: Rate limiting not working
**Solution:** Check middleware is loaded in `main.py`

---

## 📖 Next Steps

1. ✅ Setup complete
2. ✅ Features tested
3. ⏳ Update frontend
4. ⏳ Deploy to production

---

## 📚 Full Documentation

For detailed information, see:
- `COMPLETE_IMPLEMENTATION_SUMMARY.md` - Complete overview
- `ADMIN_IMPROVEMENTS.md` - Admin features
- `AUTH_IMPROVEMENTS.md` - Auth security
- `CAREER_IMPROVEMENTS.md` - Career features
- `LATEST_UPDATES.md` - All updates

---

## 🎉 You're Ready!

Your platform is now running with:
- ✅ Enterprise security
- ✅ Refresh tokens
- ✅ Rate limiting
- ✅ ATS scoring
- ✅ Job matching
- ✅ OCR support

**Start building your frontend! 🚀**
