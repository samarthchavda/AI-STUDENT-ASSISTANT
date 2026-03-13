# Google Cloud Console Setup - Step by Step

## ⚠️ This is the ONLY step you need to do manually!

The 403 error means Google doesn't recognize your localhost as an authorized origin.

---

## Step-by-Step Instructions (5 minutes)

### Step 1: Open Google Cloud Console
1. Go to: **https://console.cloud.google.com/apis/credentials**
2. Sign in with your Google account

### Step 2: Find Your OAuth Client ID
1. You'll see a list of credentials
2. Look for: **OAuth 2.0 Client IDs**
3. Find the one with ID: `671186665727-eljvsu4t9p1e6nun73smf2jjnvqm7e4s`
4. Click on it (click the name, not the ID)

### Step 3: Add Authorized JavaScript Origins
1. Scroll down to **Authorized JavaScript origins**
2. Click **+ ADD URI** button
3. Add these 4 URLs one by one:

```
http://localhost:3000
```
Click **+ ADD URI** again:
```
http://localhost:5173
```
Click **+ ADD URI** again:
```
http://127.0.0.1:3000
```
Click **+ ADD URI** again:
```
http://127.0.0.1:5173
```

### Step 4: Add Authorized Redirect URIs
1. Scroll down to **Authorized redirect URIs**
2. Click **+ ADD URI** button
3. Add the SAME 4 URLs:

```
http://localhost:3000
http://localhost:5173
http://127.0.0.1:3000
http://127.0.0.1:5173
```

### Step 5: Save Changes
1. Scroll to bottom
2. Click **SAVE** button (IMPORTANT!)
3. Wait for "Saved" confirmation message

### Step 6: Wait 5 Minutes
Google needs time to propagate changes globally.
- Get a coffee ☕
- Take a break 🧘
- Wait 5 minutes ⏰

---

## After 5 Minutes

### Restart Your Servers

**Terminal 1 - Backend:**
```bash
cd backend
python3 main.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Test Google OAuth

1. Open: **http://localhost:3000/auth**
2. Click **"Continue with Google"** button
3. Select your Google account
4. ✅ Should work now!

---

## Visual Checklist

```
Google Cloud Console
├── APIs & Services
│   └── Credentials
│       └── OAuth 2.0 Client IDs
│           └── Your Client ID (671186665727-...)
│               ├── Authorized JavaScript origins
│               │   ├── ✅ http://localhost:3000
│               │   ├── ✅ http://localhost:5173
│               │   ├── ✅ http://127.0.0.1:3000
│               │   └── ✅ http://127.0.0.1:5173
│               │
│               └── Authorized redirect URIs
│                   ├── ✅ http://localhost:3000
│                   ├── ✅ http://localhost:5173
│                   ├── ✅ http://127.0.0.1:3000
│                   └── ✅ http://127.0.0.1:5173
│
└── Click SAVE ✅
```

---

## Troubleshooting

### Q: I don't see my Client ID
**A:** Make sure you're in the correct Google Cloud project

### Q: I can't find "Authorized JavaScript origins"
**A:** You need to click on the Client ID name (not just view it)

### Q: I added the URLs but still getting 403
**A:** 
1. Did you click SAVE? (Most common mistake!)
2. Did you wait 5 minutes?
3. Did you restart both servers?
4. Try hard refresh (Cmd+Shift+R or Ctrl+Shift+R)

### Q: Still not working after 5 minutes
**A:**
1. Clear browser cache
2. Try incognito/private mode
3. Check you added ALL 4 URLs
4. Check for typos in URLs

---

## Quick Verification

After setup, check browser console (F12):

**Before Fix:**
```
❌ 403 Error
❌ Origin not allowed
❌ COOP policy error
```

**After Fix:**
```
✅ No 403 errors
✅ Google popup opens
✅ Login successful
```

---

## Alternative: Create New OAuth Client

If you can't find the existing client, create a new one:

1. Click **+ CREATE CREDENTIALS**
2. Select **OAuth client ID**
3. Application type: **Web application**
4. Name: **CodeCampus AI Local**
5. Add the 4 JavaScript origins
6. Add the 4 redirect URIs
7. Click **CREATE**
8. Copy the new Client ID
9. Update both `.env` files:
   - `backend/.env` → `GOOGLE_CLIENT_ID=new_id_here`
   - `frontend/.env` → `VITE_GOOGLE_CLIENT_ID=new_id_here`
10. Restart servers

---

## Summary

**What you need to do:**
1. ✅ Go to Google Cloud Console
2. ✅ Add 4 JavaScript origins
3. ✅ Add 4 redirect URIs
4. ✅ Click SAVE
5. ✅ Wait 5 minutes
6. ✅ Restart servers
7. ✅ Test

**That's it!** The backend and frontend code is already fixed. You just need to configure Google Cloud Console.

---

## Need Help?

If you're still stuck:
1. Take a screenshot of your Google Cloud Console
2. Check you're editing the correct Client ID
3. Verify you clicked SAVE
4. Wait the full 5 minutes

**The 403 error will disappear once you complete these steps!** 🎉
