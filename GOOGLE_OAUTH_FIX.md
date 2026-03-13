# Google OAuth Error Fix

## Errors You're Seeing

1. **403 Error** - Origin not allowed
2. **Cross-Origin-Opener-Policy** - COOP policy blocking
3. **ERR_CONNECTION_RESET** - Backend connection issue

## Root Causes

1. Google Client ID not configured for your origin
2. Missing CORS headers in backend
3. Backend middleware blocking requests

---

## Solution: 3 Steps

### Step 1: Configure Google Cloud Console

Go to: https://console.cloud.google.com/apis/credentials

1. Select your project
2. Click on your OAuth 2.0 Client ID
3. Add Authorized JavaScript origins:
   ```
   http://localhost:3000
   http://localhost:5173
   http://127.0.0.1:3000
   http://127.0.0.1:5173
   ```
4. Add Authorized redirect URIs:
   ```
   http://localhost:3000
   http://localhost:5173
   http://127.0.0.1:3000
   http://127.0.0.1:5173
   ```
5. Click **Save**

---

### Step 2: Update Backend CORS

The backend needs to allow Google OAuth origins.

I'll update the files now...


### Step 3: Restart Both Servers

```bash
# Terminal 1: Restart Backend
cd backend
python3 main.py

# Terminal 2: Restart Frontend
cd frontend
npm run dev
```

---

## What Was Fixed

### Backend Changes

1. **CORS Configuration** (`backend/main.py`)
   - Added Google OAuth origin
   - Added OPTIONS method
   - Added expose_headers
   - Added max_age for preflight caching

2. **Security Headers** (`backend/middleware.py`)
   - Changed X-Frame-Options from DENY to SAMEORIGIN
   - Removed restrictive COOP for /auth/google endpoint
   - Allows Google OAuth popup to work

### Frontend Changes

1. **Password Validation** (`frontend/src/pages/AuthPage.tsx`)
   - Updated to match new backend requirements
   - 8+ characters
   - 1 letter, 1 number, 1 special char
   - Shows hint in UI

2. **Token Storage**
   - Now stores both access_token and refresh_token
   - Supports new refresh token system

---

## Testing

### Test 1: Regular Login/Register
```bash
# Should work with strong password
Email: test@example.com
Password: Password@123
```

### Test 2: Google OAuth
1. Click "Continue with Google"
2. Select your Google account
3. Should redirect to /pricing or /admin

### Test 3: Check Console
- No more 403 errors
- No more COOP errors
- No more connection reset errors

---

## Troubleshooting

### Still Getting 403?
1. Go to Google Cloud Console
2. Make sure you added ALL these origins:
   - http://localhost:3000
   - http://localhost:5173
   - http://127.0.0.1:3000
   - http://127.0.0.1:5173
3. Click SAVE (important!)
4. Wait 5 minutes for changes to propagate

### Still Getting COOP Error?
1. Clear browser cache
2. Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
3. Try incognito mode

### Backend Connection Reset?
1. Check backend is running on port 8000
2. Check no firewall blocking
3. Check .env file has correct GOOGLE_CLIENT_ID

---

## Verification Commands

```bash
# Check backend is running
curl http://localhost:8000/

# Check CORS headers
curl -I http://localhost:8000/api/auth/google

# Check Google Client ID in frontend
cd frontend
cat .env | grep GOOGLE_CLIENT_ID

# Check Google Client ID in backend
cd backend
cat .env | grep GOOGLE_CLIENT_ID
```

---

## Summary

✅ Fixed CORS configuration
✅ Fixed security headers for OAuth
✅ Updated password validation
✅ Added refresh token support
✅ Updated UI hints

**Google OAuth should now work perfectly!** 🎉
