# Google OAuth 403 Error - Simple Fix

## The Problem
```
❌ 403 Error: The given origin is not allowed for the given client ID
```

## The Solution (One Step!)

### Go to Google Cloud Console and add your localhost URLs

**Link:** https://console.cloud.google.com/apis/credentials

---

## What to Add

### Authorized JavaScript origins:
```
http://localhost:3000
http://localhost:5173
http://127.0.0.1:3000
http://127.0.0.1:5173
```

### Authorized redirect URIs:
```
http://localhost:3000
http://localhost:5173
http://127.0.0.1:3000
http://127.0.0.1:5173
```

---

## How to Add Them

1. **Open:** https://console.cloud.google.com/apis/credentials
2. **Click** on your OAuth 2.0 Client ID
3. **Scroll** to "Authorized JavaScript origins"
4. **Click** "+ ADD URI" 
5. **Paste** each URL above (one at a time)
6. **Repeat** for "Authorized redirect URIs"
7. **Click** SAVE at the bottom
8. **Wait** 5 minutes

---

## Then Restart

```bash
# Terminal 1
cd backend
python3 main.py

# Terminal 2
cd frontend
npm run dev
```

---

## Test

1. Go to: http://localhost:3000/auth
2. Click "Continue with Google"
3. ✅ Should work!

---

## Why This Happens

Google OAuth requires you to whitelist which domains can use your Client ID. 

By default, `localhost` is NOT whitelisted for security reasons.

You must manually add it in Google Cloud Console.

---

## Still Getting 403?

**Checklist:**
- [ ] Did you click SAVE in Google Cloud Console?
- [ ] Did you wait 5 minutes after saving?
- [ ] Did you restart both servers?
- [ ] Did you add ALL 4 URLs?
- [ ] Did you add them to BOTH sections (origins AND redirects)?

**If yes to all:** Clear browser cache and try incognito mode.

---

## That's It!

The code is already fixed. You just need to configure Google Cloud Console.

**See `GOOGLE_CLOUD_SETUP.md` for detailed step-by-step instructions with screenshots.**
