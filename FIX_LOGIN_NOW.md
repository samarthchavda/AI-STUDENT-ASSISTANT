# 🔥 FIX LOGIN - 1 COMMAND

## The Problem
Backend is NOT running. That's why you see:
- ❌ `ERR_CONNECTION_TIMED_OUT`
- ❌ Google OAuth 403 error
- ❌ Login not working

## The Solution (30 seconds)

### Step 1: Start Backend
```bash
./START_BACKEND.sh
```

**Wait for this message:**
```
✅ Backend starting on http://localhost:8000
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 2: Login
Go to: http://localhost:5173

**Create new account:**
- Email: `test@gmail.com`
- Password: `Password@123`
- Click "Create Account"

**Done!** ✅

---

## Alternative: Manual Start

If script doesn't work:

```bash
cd backend
python3 main.py
```

---

## Google OAuth (Optional)

**Current Status:** Not configured in Google Cloud Console

**To Fix:**
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click your OAuth Client ID
3. Add to "Authorized JavaScript origins":
   - `http://localhost:5173`
   - `http://127.0.0.1:5173`
4. Add to "Authorized redirect URIs":
   - `http://localhost:5173`
   - `http://127.0.0.1:5173`
5. Click SAVE
6. Wait 5 minutes

**But you don't need this!** Email/password login works perfectly.

---

## ✅ Success Check

After starting backend, you should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

Then login will work! 🎉

---

## 🆘 Still Not Working?

**Error: "Port already in use"**
```bash
lsof -ti:8000 | xargs kill -9
./START_BACKEND.sh
```

**Error: "Module not found"**
```bash
cd backend
pip install -r requirements.txt
python3 main.py
```

**Error: "python3 not found"**
```bash
# Install Python 3.8+ first
brew install python3
```

---

**Time to fix: 30 seconds** ⚡
