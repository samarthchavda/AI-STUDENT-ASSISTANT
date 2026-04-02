# Resume Admin - Quick Test Guide

## 🚀 Quick Start

### 1. Run Backend Tests (30 seconds)
```bash
cd backend
pytest tests/test_resume_admin.py -v
```

### 2. Run API Tests with curl (1 minute)
```bash
# Get your admin token first (login as admin, copy JWT from browser)
cd backend
./tests/test_resume_admin_api.sh "your_admin_token_here"
```

### 3. Verify Database (10 seconds)
```bash
psql -U your_user -d codecampus -f backend/tests/verify_resume_admin_db.sql
```

### 4. Generate Test Data (optional)
```bash
cd backend
python3 tests/generate_resume_test_data.py
```

### 5. Run Frontend Tests
```bash
cd frontend
npm test -- ResumeAdmin.test.tsx
```

---

## 📋 Manual Testing (5 minutes)

1. Login as admin: http://localhost:5173/login
2. Go to Admin Panel: http://localhost:5173/admin
3. Click each Resume Admin menu item:
   - Resume Analytics ✓
   - Resume Templates ✓
   - User Resumes ✓
   - AI Resume Monitor ✓
   - AI Settings ✓
4. Test one action in each page (toggle, search, save)

---

## 🔍 Quick Checks

### Backend Running?
```bash
curl http://localhost:8000/health
```

### Database Connected?
```bash
psql -U your_user -d codecampus -c "SELECT COUNT(*) FROM resume_tracking;"
```

### Migration Done?
```bash
psql -U your_user -d codecampus -c "\dt" | grep resume
```

### Am I Admin?
```sql
SELECT email, is_admin FROM users WHERE email = 'your_email@example.com';
```

---

## 📊 Test Coverage

- ✅ 24+ Backend pytest cases
- ✅ 15+ Frontend component tests
- ✅ 10 curl API tests
- ✅ 6 Manual QA scenarios
- ✅ 4 E2E test flows
- ✅ Database verification queries
- ✅ Performance tests
- ✅ Security tests

**Total: 70+ test cases covering all functionality**

---

## 🐛 Common Issues

**"Table doesn't exist"**
→ Run: `python3 run_resume_admin_migration.py`

**"Admin access required"**
→ Run: `UPDATE users SET is_admin = true WHERE email = 'your@email.com';`

**"Connection refused"**
→ Start backend: `cd backend && python3 -m uvicorn app.main:app --reload`

**Frontend errors**
→ Check: `cd frontend && npm run type-check`

---

## 📚 Full Documentation

See `RESUME_ADMIN_TEST_SUITE.md` for complete test documentation.
