# 🚀 Production Deployment Guide

## What is Production?

**Development (હાલમાં):**
- તમારા computer પર run થાય છે
- localhost:3000 અને localhost:8000
- ફક્ત તમે જ access કરી શકો
- Testing માટે

**Production (Deploy કર્યા પછી):**
- Internet પર live થશે
- Real domain: www.codecampusai.com
- દુનિયામાં કોઈ પણ access કરી શકે
- Real users માટે

---

## 📋 Production Deployment Options

### Option 1: Vercel + Railway (Easiest & Free)
**Best for:** Beginners, Quick launch
**Cost:** Free tier available
**Time:** 30 minutes

### Option 2: AWS (Professional)
**Best for:** Scalability, Enterprise
**Cost:** ~$20-50/month
**Time:** 2-3 hours

### Option 3: DigitalOcean (Balanced)
**Best for:** Good balance of ease and control
**Cost:** ~$12-24/month
**Time:** 1-2 hours

---

## 🎯 Recommended: Vercel + Railway (Free Start)

### Step 1: Prepare Your Code

#### A. Update Environment Variables

**Backend (.env):**
```bash
# Change these for production!
ENVIRONMENT=production
SECRET_KEY=<generate-new-strong-key>  # MUST CHANGE!
DATABASE_URL=<railway-postgres-url>   # Will get from Railway

# Real API keys (not demo)
GEMINI_API_KEY=AIzaSyBeRgC7GkOKWx2mDy4c-0N5-nK2HgoukRk

# Frontend URL (will be your Vercel URL)
FRONTEND_URL=https://codecampusai.vercel.app
```

**Frontend (.env):**
```bash
VITE_API_URL=https://your-backend.railway.app/api
```

#### B. Update CORS in backend/main.py

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://codecampusai.vercel.app",  # Your Vercel domain
        "https://www.codecampusai.com",     # Your custom domain (if any)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### C. Generate Strong SECRET_KEY

```bash
# Run this in terminal:
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Copy output and paste in .env as SECRET_KEY
```

---

### Step 2: Deploy Database (Railway)

1. **Go to Railway.app**
   - Visit: https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Provision PostgreSQL"
   - Wait for database to be created

3. **Get Database URL**
   - Click on PostgreSQL service
   - Go to "Connect" tab
   - Copy "Postgres Connection URL"
   - Example: `postgresql://postgres:password@containers-us-west-123.railway.app:5432/railway`

4. **Update Backend .env**
   ```bash
   DATABASE_URL=<paste-railway-url-here>
   ```

---

### Step 3: Deploy Backend (Railway)

1. **Create GitHub Repository**
   ```bash
   # In your project folder
   git init
   git add .
   git commit -m "Initial commit"
   
   # Create repo on GitHub.com
   # Then:
   git remote add origin https://github.com/yourusername/codecampusai.git
   git push -u origin main
   ```

2. **Deploy on Railway**
   - Go to Railway.app
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select "backend" folder as root directory

3. **Add Environment Variables**
   - In Railway project settings
   - Go to "Variables" tab
   - Add all variables from backend/.env:
     - ENVIRONMENT=production
     - SECRET_KEY=<your-generated-key>
     - DATABASE_URL=${{Postgres.DATABASE_URL}} (auto-linked)
     - GEMINI_API_KEY=<your-key>
     - etc.

4. **Deploy**
   - Railway will automatically deploy
   - You'll get a URL like: `https://codecampusai-backend.railway.app`
   - Test: Visit `https://your-url.railway.app/` (should show API info)

---

### Step 4: Deploy Frontend (Vercel)

1. **Update Frontend .env**
   ```bash
   VITE_API_URL=https://your-backend.railway.app/api
   ```

2. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Update API URL for production"
   git push
   ```

3. **Deploy on Vercel**
   - Go to: https://vercel.com
   - Sign up with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Select "frontend" folder as root directory
   - Framework: Vite
   - Add environment variable:
     - VITE_API_URL=https://your-backend.railway.app/api
   - Click "Deploy"

4. **Get Your URL**
   - Vercel will give you: `https://codecampusai.vercel.app`
   - This is your live website!

---

### Step 5: Update Backend CORS

1. **Update backend/main.py**
   ```python
   allow_origins=[
       "https://codecampusai.vercel.app",  # Your actual Vercel URL
   ],
   ```

2. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Update CORS for production"
   git push
   ```

3. **Railway auto-deploys** - Wait 2-3 minutes

---

### Step 6: Test Production

1. **Visit Your Site**
   - Go to: `https://codecampusai.vercel.app`

2. **Test Features**
   - ✅ Register new account
   - ✅ Login
   - ✅ Send chat message
   - ✅ Test DSA feature
   - ✅ Test resume upload
   - ✅ Check all pages work

3. **Check Logs**
   - Railway: Check backend logs
   - Vercel: Check frontend logs

---

## 🔒 Production Security Checklist

Before going live:

- [x] Rate limiting enabled ✅
- [x] Security headers enabled ✅
- [x] Request validation enabled ✅
- [ ] Change SECRET_KEY to strong random value
- [ ] Use real API keys (not demo)
- [ ] Update CORS to production domain only
- [ ] Test all features work
- [ ] Check database connection
- [ ] Monitor logs for errors
- [ ] Set up error alerts

---

## 💰 Cost Breakdown

### Free Tier (Good for Start):
- **Railway:** Free $5 credit/month
  - PostgreSQL: ~$5/month
  - Backend API: Free (with credit)
- **Vercel:** Free
  - Frontend hosting: Free
  - Custom domain: Free
- **Total:** ~$0-5/month

### Paid Tier (For Growth):
- **Railway:** $20/month
  - Better performance
  - More resources
- **Vercel:** Free (enough for most)
- **Total:** ~$20/month

### Custom Domain (Optional):
- **Domain:** ~$10-15/year
  - Buy from: Namecheap, GoDaddy
  - Example: codecampusai.com

---

## 🌐 Custom Domain Setup (Optional)

### If you buy codecampusai.com:

1. **Add to Vercel (Frontend)**
   - Vercel Dashboard → Settings → Domains
   - Add: codecampusai.com
   - Follow DNS instructions

2. **Add to Railway (Backend)**
   - Railway Dashboard → Settings → Domains
   - Add: api.codecampusai.com
   - Follow DNS instructions

3. **Update CORS**
   ```python
   allow_origins=[
       "https://codecampusai.com",
       "https://www.codecampusai.com",
   ],
   ```

4. **Update Frontend .env**
   ```bash
   VITE_API_URL=https://api.codecampusai.com/api
   ```

---

## 📊 Monitoring & Maintenance

### Check Health:
```bash
# Backend health
curl https://your-backend.railway.app/api/health

# Should return:
{
  "status": "healthy",
  "environment": "production",
  "database": "connected"
}
```

### Monitor Logs:
- **Railway:** Dashboard → Logs
- **Vercel:** Dashboard → Logs

### Set Up Alerts:
- Railway: Settings → Notifications
- Vercel: Settings → Notifications

---

## 🐛 Common Issues & Solutions

### Issue 1: CORS Error
**Error:** "Access blocked by CORS policy"
**Solution:** 
- Check backend CORS settings
- Make sure frontend URL is in allow_origins

### Issue 2: Database Connection Failed
**Error:** "Could not connect to database"
**Solution:**
- Check DATABASE_URL is correct
- Check Railway PostgreSQL is running

### Issue 3: API Key Not Working
**Error:** "API key not found"
**Solution:**
- Check environment variables in Railway
- Make sure GEMINI_API_KEY is set

### Issue 4: Rate Limit Too Strict
**Error:** "Rate limit exceeded"
**Solution:**
- Increase limits in backend/routes/auth_routes.py
- Redeploy

---

## 🚀 Quick Deploy Commands

```bash
# 1. Prepare code
git add .
git commit -m "Ready for production"
git push

# 2. Railway auto-deploys backend
# 3. Vercel auto-deploys frontend

# 4. Test
curl https://your-backend.railway.app/api/health
```

---

## 📱 Share Your App

After deployment, share:
- **Website:** https://codecampusai.vercel.app
- **API Docs:** https://your-backend.railway.app/docs

Share on:
- LinkedIn
- Twitter
- WhatsApp
- College groups
- Friends

---

## 🎯 Next Steps After Deployment

1. **Monitor Usage**
   - Check Railway dashboard daily
   - Monitor costs

2. **Collect Feedback**
   - Share with 10 friends
   - Get feedback
   - Fix issues

3. **Add Analytics**
   - Google Analytics
   - Track user behavior

4. **Marketing**
   - Social media posts
   - College groups
   - LinkedIn

5. **Scale**
   - If users grow, upgrade Railway plan
   - Add more features

---

## ✅ Production Checklist

- [ ] Code pushed to GitHub
- [ ] Database created on Railway
- [ ] Backend deployed on Railway
- [ ] Frontend deployed on Vercel
- [ ] Environment variables set
- [ ] CORS updated
- [ ] SECRET_KEY changed
- [ ] All features tested
- [ ] Custom domain added (optional)
- [ ] Monitoring set up
- [ ] Shared with friends

---

**Time to Deploy:** 30-60 minutes
**Cost:** Free to start
**Difficulty:** Easy

**Need Help?** Check:
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs

