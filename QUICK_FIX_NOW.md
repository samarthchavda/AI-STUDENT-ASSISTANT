# 🚀 QUICK FIX - 2 MINUTES

## Problem Summary
- ❌ Backend NOT running (ERR_CONNECTION_TIMED_OUT)
- ❌ Google OAuth 403 error (localhost not configured)
- ✅ Code is already fixed (all redirects go to /dashboard)

---

## ⚡ SOLUTION (Choose ONE)

### Option 1: Email/Password Login (FASTEST - Works Immediately)

1. **Start Backend:**
```bash
cd backend
python3 main.py
```

2. **Wait for this message:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

3. **Go to:** http://localhost:5173

4. **Create Account:**
   - Email: `test@gmail.com`
   - Password: `Password@123`
   - Click "Create Account"

5. **Done!** You'll be redirected to Dashboard

---

### Option 2: Google OAuth (Requires Google Cloud Setup)

**Only if you want Google login. Takes 5-10 minutes.**

1. **Start Backend First:**
```bash
cd backend
python3 main.py
```

2. **Configure Google Cloud Console:**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Click your OAuth Client ID: `671186665727-eljvsu4t9p1e6nun73smf2jjnvqm7e4s`
   
3. **Add These URLs:**

   **Authorized JavaScript origins:**
   ```
   http://localhost:5173
   http://127.0.0.1:5173
   ```

   **Authorized redirect URIs:**
   ```
   http://localhost:5173
   http://127.0.0.1:5173
   ```

4. **Click SAVE**

5. **Wait 5 minutes** (Google needs time to update)

6. **Refresh your browser** and try Google login

---

## 🎯 RECOMMENDED: Use Option 1 (Email/Password)

**Why?**
- Works immediately
- No Google Cloud setup needed
- Same features as Google login
- You can add Google OAuth later

---

## ✅ What's Already Fixed in Code

1. ✅ All login/register redirects go to `/dashboard`
2. ✅ Password validation updated (8+ chars, 1 number, 1 special char)
3. ✅ CORS configured for Google OAuth
4. ✅ Security headers fixed
5. ✅ Refresh token storage added

---

## 🔥 Quick Test Commands

**Terminal 1 - Backend:**
```bash
cd backend
python3 main.py
```

**Terminal 2 - Frontend (if not running):**
```bash
cd frontend
npm run dev
```

**Browser:**
```
http://localhost:5173
```

---

## 📝 Test Account

**Email:** `test@gmail.com`  
**Password:** `Password@123`

This will work immediately after backend starts!

---

## ❓ Still Having Issues?

**Backend not starting?**
```bash
cd backend
pip install -r requirements.txt
python3 main.py
```

**Port already in use?**
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Then start again
python3 main.py
```

---

## 🎉 Success Indicators

✅ Backend shows: `INFO:     Uvicorn running on http://0.0.0.0:8000`  
✅ Frontend shows: Login page at http://localhost:5173  
✅ After login: Redirects to http://localhost:5173/dashboard  
✅ Dashboard shows: Your stats and placement tools

---

**Time to fix: 2 minutes with Option 1** ⚡
