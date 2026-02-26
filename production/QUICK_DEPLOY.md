# ⚡ Quick Deploy Guide (30 Minutes)

## 🎯 Goal
તમારી website internet પર live કરવી

## 📦 What You Need
- GitHub account
- Railway account (free)
- Vercel account (free)
- 30 minutes

---

## 🚀 5 Simple Steps

### Step 1: Push to GitHub (5 min)

```bash
# Terminal માં:
git init
git add .
git commit -m "Initial commit"

# GitHub.com પર:
# 1. New repository બનાવો: "codecampusai"
# 2. પછી terminal માં:

git remote add origin https://github.com/YOUR_USERNAME/codecampusai.git
git push -u origin main
```

---

### Step 2: Deploy Database (5 min)

1. Go to: **railway.app**
2. Sign up with GitHub
3. Click "New Project" → "Provision PostgreSQL"
4. Click PostgreSQL → "Connect" → Copy URL
5. Save URL (need it later)

---

### Step 3: Deploy Backend (10 min)

1. Railway.app → "New Project" → "Deploy from GitHub"
2. Select your repo → Choose "backend" folder
3. Add Variables:
   ```
   ENVIRONMENT=production
   SECRET_KEY=<run: python -c "import secrets; print(secrets.token_urlsafe(32))">
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   GEMINI_API_KEY=AIzaSyBeRgC7GkOKWx2mDy4c-0N5-nK2HgoukRk
   ```
4. Wait for deploy (2-3 min)
5. Copy your URL: `https://xxxxx.railway.app`

---

### Step 4: Deploy Frontend (5 min)

1. Go to: **vercel.com**
2. Sign up with GitHub
3. "New Project" → Import your repo
4. Root Directory: `frontend`
5. Framework: Vite
6. Add Variable:
   ```
   VITE_API_URL=https://your-backend.railway.app/api
   ```
7. Click "Deploy"
8. Copy your URL: `https://xxxxx.vercel.app`

---

### Step 5: Update CORS (5 min)

1. Edit `backend/main.py`:
   ```python
   allow_origins=[
       "https://your-frontend.vercel.app",  # Your Vercel URL
   ],
   ```

2. Push to GitHub:
   ```bash
   git add .
   git commit -m "Update CORS"
   git push
   ```

3. Railway auto-deploys (wait 2 min)

---

## ✅ Test Your Live Site

1. Visit: `https://your-frontend.vercel.app`
2. Register account
3. Login
4. Send chat message
5. ✅ Working? Congrats! 🎉

---

## 🔗 Your URLs

**Frontend (Users visit):**
```
https://codecampusai.vercel.app
```

**Backend (API):**
```
https://codecampusai-backend.railway.app
```

**API Docs:**
```
https://codecampusai-backend.railway.app/docs
```

---

## 💰 Cost

- Railway: Free $5 credit/month
- Vercel: Free forever
- **Total: FREE** 🎉

---

## 📱 Share Your App

```
🚀 Check out my AI placement prep app!

Website: https://your-app.vercel.app

Features:
✅ AI Chat Assistant
✅ DSA Problem Solver
✅ Resume Analyzer
✅ Mock Interviews
✅ Multi-language (English, Hindi, Gujarati)

Built with: React + FastAPI + PostgreSQL + Gemini AI

Feedback welcome! 🙏
```

---

## 🐛 If Something Breaks

### Frontend not loading?
- Check Vercel logs
- Check VITE_API_URL is correct

### Backend error?
- Check Railway logs
- Check DATABASE_URL is set
- Check GEMINI_API_KEY is set

### CORS error?
- Check backend/main.py allow_origins
- Must match your Vercel URL exactly

### Database error?
- Check Railway PostgreSQL is running
- Check DATABASE_URL in variables

---

## 🎯 Next Steps

1. ✅ Deploy (30 min)
2. 📱 Share with 10 friends
3. 📊 Get feedback
4. 🔧 Fix issues
5. 📈 Add more features
6. 💰 Add custom domain (optional)

---

## 📞 Need Help?

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Or ask me! 😊

---

**Time:** 30 minutes
**Cost:** FREE
**Difficulty:** Easy

**Let's go! 🚀**

