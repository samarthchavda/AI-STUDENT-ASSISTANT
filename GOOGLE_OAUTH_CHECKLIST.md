# Google OAuth Fix Checklist

## ✅ Quick Fix Steps

### 1. Google Cloud Console (5 minutes)
- [ ] Go to https://console.cloud.google.com/apis/credentials
- [ ] Select your OAuth 2.0 Client ID
- [ ] Add Authorized JavaScript origins:
  - [ ] `http://localhost:3000`
  - [ ] `http://localhost:5173`
  - [ ] `http://127.0.0.1:3000`
  - [ ] `http://127.0.0.1:5173`
- [ ] Add Authorized redirect URIs (same 4 URLs)
- [ ] Click **SAVE**
- [ ] Wait 5 minutes for changes to propagate

### 2. Backend Already Fixed ✅
- [x] CORS updated in `backend/main.py`
- [x] Security headers fixed in `backend/middleware.py`
- [x] Google OAuth origin added
- [x] COOP policy relaxed for /auth/google

### 3. Frontend Already Fixed ✅
- [x] Password validation updated
- [x] Refresh token support added
- [x] UI hints added
- [x] Token storage improved

### 4. Restart Servers
```bash
# Terminal 1: Backend
cd backend
python3 main.py

# Terminal 2: Frontend  
cd frontend
npm run dev
```

### 5. Test
- [ ] Open http://localhost:3000/auth
- [ ] Click "Continue with Google"
- [ ] Select Google account
- [ ] Should redirect successfully
- [ ] No errors in console

---

## Common Issues

### Issue: Still getting 403
**Solution:** 
1. Double-check Google Cloud Console settings
2. Make sure you clicked SAVE
3. Wait 5 minutes
4. Clear browser cache

### Issue: COOP error
**Solution:**
1. Hard refresh browser (Cmd+Shift+R)
2. Try incognito mode
3. Restart backend server

### Issue: Connection reset
**Solution:**
1. Check backend running on port 8000
2. Check .env file has correct GOOGLE_CLIENT_ID
3. Restart backend

---

## Verification

### Check Backend
```bash
curl http://localhost:8000/
# Should return: {"message": "Welcome to CodeCampus AI API"}
```

### Check CORS
```bash
curl -I http://localhost:8000/api/auth/google
# Should show: Access-Control-Allow-Origin header
```

### Check Console
Open browser console (F12):
- No 403 errors ✅
- No COOP errors ✅
- No connection reset ✅

---

## Success Indicators

✅ Google button appears
✅ Clicking opens Google popup
✅ Selecting account works
✅ Redirects to /pricing or /admin
✅ User logged in successfully
✅ No errors in console

---

## Need Help?

1. Check `GOOGLE_OAUTH_FIX.md` for detailed explanation
2. Verify all checklist items above
3. Check browser console for specific errors
4. Restart both servers

**Everything should work now!** 🎉
