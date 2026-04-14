# ⚡ Quick Start Guide - CodeCampus AI

## 🎯 Get Your Platform Live in 30 Minutes

### Step 1: Database (5 minutes)
1. Go to [supabase.com](https://supabase.com) → Sign up
2. Create new project → Copy DATABASE_URL
3. Run migrations: Open SQL Editor → Paste all files from `backend/migrations/`

### Step 2: Backend (10 minutes)
1. Go to [render.com](https://render.com) → Sign up
2. New Web Service → Connect GitHub repo
3. Settings:
   - Root Directory: `backend`
   - Build: `pip install -r requirements.txt`
   - Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 2`
4. Add environment variables from `backend/.env.production.example`
5. Deploy → Copy backend URL

### Step 3: Frontend (10 minutes)
1. Go to [vercel.com](https://vercel.com) → Sign up
2. Import GitHub repo
3. Settings:
   - Root Directory: `frontend`
   - Framework: Vite
4. Add environment variables:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx
   ```
5. Deploy → Your site is live! 🎉

### Step 4: Get API Keys (5 minutes)
1. **Gemini AI**: [ai.google.dev](https://ai.google.dev) → Get API Key
2. **Razorpay**: [razorpay.com](https://razorpay.com) → Sign up → Get Test Keys
3. Add both to Render environment variables → Redeploy

### Step 5: Test Everything
1. Visit your Vercel URL
2. Sign up → Login → Try AI Chat
3. Test aptitude questions
4. Check DSA problems
5. ✅ Done!

---

## 🚨 Common Issues

**Backend not responding?**
- Check Render logs
- Verify DATABASE_URL is correct
- Ensure migrations ran

**Frontend can't connect?**
- Check VITE_API_URL in Vercel
- Verify CORS settings in backend
- Check browser console for errors

**AI not working?**
- Verify GEMINI_API_KEY in Render
- Check API quota limits

---

## 📞 Need Help?

Read full guide: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

**Your platform is now live! Share it with friends and start getting users! 🚀**
