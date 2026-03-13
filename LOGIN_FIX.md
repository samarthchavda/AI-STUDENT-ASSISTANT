# Login Not Working - Quick Fix

## Problem
Backend server is not running on port 8000.

## Solution

### Step 1: Start Backend Server

```bash
# Open Terminal 1
cd backend
python3 main.py
```

**Expected output:**
```
✅ Gemini AI initialized successfully
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 2: Start Frontend Server

```bash
# Open Terminal 2
cd frontend
npm run dev
```

**Expected output:**
```
VITE ready in XXX ms
Local: http://localhost:5173/
```

### Step 3: Test Login

1. Go to: http://localhost:5173/auth
2. Try these credentials:

**Option 1: Create New Account**
- Email: `your@email.com`
- Password: `Password@123` (must have 8+ chars, 1 number, 1 special char)
- Name: `Your Name`

**Option 2: Use Existing Account**
- If you already registered, use those credentials

---

## Common Issues

### Issue 1: Backend won't start
**Error:** `Address already in use`

**Solution:**
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Then start again
cd backend
python3 main.py
```

### Issue 2: Database connection error
**Error:** `could not connect to server`

**Solution:**
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# If not running, start it
brew services start postgresql

# Then restart backend
cd backend
python3 main.py
```

### Issue 3: Module not found
**Error:** `ModuleNotFoundError: No module named 'X'`

**Solution:**
```bash
cd backend
pip install -r requirements.txt
python3 main.py
```

### Issue 4: Password validation error
**Error:** `Password must contain at least one special character`

**Solution:**
Use a strong password with:
- 8+ characters
- 1 letter (A-Z or a-z)
- 1 number (0-9)
- 1 special char (@$!%*#?&)

**Valid examples:**
- `Password@123`
- `MyPass123!`
- `Secure#2024`

---

## Verification

### Check Backend is Running
```bash
curl http://localhost:8000/
```

**Expected:** JSON response with "Welcome to CodeCampus AI API"

### Check Frontend is Running
Open browser: http://localhost:5173/

**Expected:** Homepage loads

---

## Quick Test

1. **Backend running?** ✅
   ```bash
   curl http://localhost:8000/
   ```

2. **Frontend running?** ✅
   Open: http://localhost:5173/

3. **Can register?** ✅
   - Go to /auth
   - Fill form with strong password
   - Click "Create Account"

4. **Can login?** ✅
   - Use same credentials
   - Click "Sign In"
   - Should redirect to /dashboard

---

## Still Not Working?

### Check Browser Console (F12)
Look for errors like:
- `Network Error` → Backend not running
- `401 Unauthorized` → Wrong credentials
- `400 Bad Request` → Password too weak

### Check Backend Terminal
Look for errors like:
- Database connection errors
- Module import errors
- Port already in use

### Restart Everything
```bash
# Terminal 1: Stop backend (Ctrl+C), then:
cd backend
python3 main.py

# Terminal 2: Stop frontend (Ctrl+C), then:
cd frontend
npm run dev

# Browser: Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
```

---

## Summary

**Most Common Issue:** Backend not running

**Quick Fix:**
1. Open terminal
2. `cd backend`
3. `python3 main.py`
4. Wait for "Uvicorn running on http://0.0.0.0:8000"
5. Try login again

**That's it!** 🎉
