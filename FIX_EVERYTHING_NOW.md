# Fix Everything - One Time Solution

## DO THIS NOW (5 minutes)

### Step 1: Start Backend (REQUIRED)
```bash
# Open Terminal 1
cd backend
python3 main.py
```

**WAIT** until you see:
```
✅ Gemini AI initialized successfully
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 2: Use Regular Login (NOT Google)

Google OAuth needs Google Cloud Console setup (takes 10 minutes).

**Instead, use regular login NOW:**

1. Go to: http://localhost:5173/auth
2. Click "Sign Up"
3. Fill form:
   - Email: `test@example.com`
   - Name: `Test User`
   - Password: `Password@123`
   - Confirm: `Password@123`
4. Click "Create Account"
5. ✅ You're logged in!

---

## If Backend Won't Start

### Error: Port already in use
```bash
lsof -ti:8000 | xargs kill -9
cd backend
python3 main.py
```

### Error: Module not found
```bash
cd backend
pip install -r requirements.txt
python3 main.py
```

### Error: Database connection
```bash
brew services start postgresql
cd backend
python3 main.py
```

---

## Google OAuth (Optional - Do Later)

If you want Google login, do this AFTER regular login works:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click your OAuth Client ID
3. Add to "Authorized JavaScript origins":
   ```
   http://localhost:5173
   http://127.0.0.1:5173
   ```
4. Add to "Authorized redirect URIs":
   ```
   http://localhost:5173
   http://127.0.0.1:5173
   ```
5. Click SAVE
6. Wait 5 minutes
7. Restart backend

---

## Quick Test

```bash
# Test backend is running
curl http://localhost:8000/

# Should return JSON with "Welcome to CodeCampus AI API"
```

---

## Summary

**RIGHT NOW:**
1. ✅ Start backend: `cd backend && python3 main.py`
2. ✅ Use regular login (NOT Google)
3. ✅ Email: test@example.com, Password: Password@123

**LATER (Optional):**
- Configure Google Cloud Console for Google OAuth

**That's it!** 🎉
