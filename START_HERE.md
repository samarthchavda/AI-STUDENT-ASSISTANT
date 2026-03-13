# ⚡ START HERE - 30 SECONDS FIX

## Your Issues:
1. ❌ Login not working → Backend not running
2. ❌ Showing auth page → You're at wrong URL

## Fix (2 commands):

### 1. Start Backend:
```bash
cd backend
python3 main.py
```

**Wait for:** `INFO: Uvicorn running on http://0.0.0.0:8000`

### 2. Open Home Page:

In browser, go to:
```
http://localhost:5173
```

**NOT** `http://localhost:5173/auth`

---

## ✅ What Works Now:

### Without Login (Public Pages):
- ✅ Home page: http://localhost:5173
- ✅ Services page
- ✅ About page  
- ✅ Pricing page

### With Login (After Creating Account):
- ✅ Dashboard
- ✅ Chat / Placement Copilot
- ✅ Exam Prep
- ✅ Coding Help
- ✅ Career / Resume Upload
- ✅ Company Prep

---

## 🎯 To Create Account:

1. Go to home page: http://localhost:5173
2. Click "Get Your Roadmap Free" button
3. Fill form:
   - Email: `test@gmail.com`
   - Password: `Password@123`
4. Click "Create Account"
5. Done! Redirects to Dashboard ✅

---

## 🔥 Quick Test:

**Backend running?**
```bash
curl http://localhost:8000
```

Should show: `{"message": "Welcome to CodeCampus AI API"}`

**Frontend working?**

Open: http://localhost:5173

Should show: Home page with "Ace Your Placements"

---

## 🆘 Problems?

**Port 8000 busy:**
```bash
lsof -ti:8000 | xargs kill -9
cd backend && python3 main.py
```

**Module errors:**
```bash
cd backend
pip install -r requirements.txt
python3 main.py
```

---

## 📝 Summary:

1. **Start backend** → `cd backend && python3 main.py`
2. **Open home** → http://localhost:5173
3. **Browse freely** → No login needed
4. **Login when ready** → Click button, create account

**Time: 30 seconds** ⚡

---

**Google OAuth 403 Error?**

Ignore it! Use email/password login instead. Works perfectly.

To fix Google OAuth (optional, takes 10 min):
- Add `http://localhost:5173` to Google Cloud Console
- See `GOOGLE_CLOUD_SETUP.md` for details

But you don't need it! Email login works great. ✅
