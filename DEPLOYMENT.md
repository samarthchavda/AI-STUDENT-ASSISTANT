# 🚀 CodeCampus AI - Production Deployment Guide

## Overview
This guide will help you deploy CodeCampus AI to production with:
- **Frontend**: Vercel (Free tier)
- **Backend**: Render.com (Free tier) or Railway
- **Database**: Supabase (Free tier)

---

## 📋 Prerequisites

Before deploying, ensure you have:

1. ✅ GitHub account
2. ✅ Vercel account (sign up at vercel.com)
3. ✅ Render account (sign up at render.com) OR Railway account
4. ✅ Supabase account (sign up at supabase.com)
5. ✅ Google Gemini API key (get from ai.google.dev)
6. ✅ Razorpay account (sign up at razorpay.com)

---

## 🗄️ Step 1: Setup Database (Supabase)

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization and set:
   - **Project Name**: codecampus-ai
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to your users (e.g., Mumbai for India)
4. Click "Create new project"

### 1.2 Get Database URL
1. Go to Project Settings → Database
2. Copy the **Connection String** (URI format)
3. Replace `[YOUR-PASSWORD]` with your database password
4. Save this as `DATABASE_URL`

Example:
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

### 1.3 Run Migrations
1. Open SQL Editor in Supabase
2. Run all migration files from `backend/migrations/` folder in order
3. Or use the migration scripts:
```bash
cd backend
python run_all_migrations.py
```

---

## 🔧 Step 2: Setup Backend (Render.com)

### 2.1 Create Web Service
1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: codecampus-ai-backend
   - **Region**: Singapore (closest to India)
   - **Branch**: main
   - **Root Directory**: backend
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 2`
   - **Plan**: Free

### 2.2 Add Environment Variables
In Render dashboard, add these environment variables:

```env
DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres
GEMINI_API_KEY=your_gemini_api_key_here
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
JWT_SECRET_KEY=your_super_secret_jwt_key_minimum_32_characters_long
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ENVIRONMENT=production
FRONTEND_URLS=https://ai-student-assistant-xi.vercel.app,https://your-custom-domain.com
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_secret
```

### 2.3 Deploy
1. Click "Create Web Service"
2. Wait 5-10 minutes for first deployment
3. Copy your backend URL: `https://codecampus-ai-backend.onrender.com`

### 2.4 Keep Backend Warm (Prevent Cold Starts)
Render free tier sleeps after 15 minutes of inactivity. To keep it warm:

1. Go to [cron-job.org](https://cron-job.org)
2. Create free account
3. Add new cron job:
   - **URL**: `https://your-backend-url.onrender.com/ping`
   - **Schedule**: Every 10 minutes
   - **Method**: GET

---

## 🎨 Step 3: Setup Frontend (Vercel)

### 3.1 Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: frontend
   - **Build Command**: `npm run build`
   - **Output Directory**: dist

### 3.2 Add Environment Variables
In Vercel dashboard → Settings → Environment Variables:

```env
VITE_API_URL=https://codecampus-ai-backend.onrender.com
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxx
```

### 3.3 Deploy
1. Click "Deploy"
2. Wait 2-3 minutes
3. Your site will be live at: `https://your-project.vercel.app`

### 3.4 Add Custom Domain (Optional)
1. Go to Vercel → Settings → Domains
2. Add your custom domain (e.g., codecampusai.com)
3. Update DNS records as instructed
4. SSL certificate will be auto-generated

---

## 🔑 Step 4: Setup API Keys

### 4.1 Google Gemini AI
1. Go to [ai.google.dev](https://ai.google.dev)
2. Click "Get API Key"
3. Create new project or select existing
4. Copy API key
5. Add to backend environment variables as `GEMINI_API_KEY`

### 4.2 Razorpay Payment Gateway
1. Go to [razorpay.com](https://razorpay.com)
2. Sign up and complete KYC
3. Go to Settings → API Keys
4. Generate Live Keys (after KYC approval)
5. Copy:
   - Key ID → `RAZORPAY_KEY_ID`
   - Key Secret → `RAZORPAY_KEY_SECRET`
6. Add to both frontend and backend environment variables

### 4.3 Google OAuth (Optional)
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://your-frontend-url.vercel.app`
   - `http://localhost:5173` (for development)
6. Copy Client ID and Secret
7. Add to backend environment variables

---

## ✅ Step 5: Verify Deployment

### 5.1 Test Backend
Visit: `https://your-backend-url.onrender.com/`

Should return:
```json
{
  "message": "Welcome to CodeCampus AI API",
  "status": "running",
  "version": "1.0.0"
}
```

### 5.2 Test Frontend
1. Visit your Vercel URL
2. Try these features:
   - ✅ Homepage loads
   - ✅ Sign up / Login works
   - ✅ AI Chat responds
   - ✅ Aptitude tests load
   - ✅ DSA problems display
   - ✅ Payment page opens

### 5.3 Test API Connection
Open browser console on frontend and check for:
- ❌ No CORS errors
- ❌ No 401/403 errors
- ✅ API calls succeed

---

## 🔒 Step 6: Security Checklist

- [ ] All API keys are in environment variables (not in code)
- [ ] JWT_SECRET_KEY is strong (32+ characters)
- [ ] Database password is secure
- [ ] CORS is configured correctly
- [ ] HTTPS is enabled (automatic on Vercel/Render)
- [ ] Rate limiting is enabled
- [ ] SQL injection protection (using SQLAlchemy ORM)
- [ ] XSS protection headers enabled

---

## 📊 Step 7: Monitoring & Analytics

### 7.1 Setup Error Tracking
Consider adding:
- **Sentry** for error tracking
- **LogRocket** for session replay
- **Google Analytics** for user analytics

### 7.2 Monitor Performance
- Vercel Analytics (built-in)
- Render Metrics (built-in)
- Supabase Dashboard for database queries

---

## 🚨 Troubleshooting

### Backend not responding
1. Check Render logs: Dashboard → Logs
2. Verify environment variables are set
3. Check database connection
4. Ensure migrations ran successfully

### Frontend can't connect to backend
1. Check CORS settings in `backend/app/main.py`
2. Verify `VITE_API_URL` in Vercel environment variables
3. Check browser console for errors
4. Ensure backend is not sleeping (use cron job)

### Database connection failed
1. Verify DATABASE_URL format
2. Check Supabase project is active
3. Ensure IP restrictions are disabled (or add Render IPs)
4. Test connection using SQL editor

### Payment not working
1. Verify Razorpay keys are correct
2. Check if KYC is completed (for live keys)
3. Test with test keys first (`rzp_test_xxxxx`)
4. Check webhook configuration

---

## 🎯 Post-Deployment Tasks

1. **Update README.md** with live URLs
2. **Create backup strategy** for database
3. **Setup monitoring alerts**
4. **Document API endpoints**
5. **Create user documentation**
6. **Setup customer support email**
7. **Add privacy policy & terms of service**
8. **Submit to Google for indexing**
9. **Create social media accounts**
10. **Launch marketing campaign**

---

## 💰 Cost Breakdown (Free Tier)

| Service | Free Tier | Limits |
|---------|-----------|--------|
| Vercel | ✅ Free | 100GB bandwidth/month |
| Render | ✅ Free | 750 hours/month, sleeps after 15min |
| Supabase | ✅ Free | 500MB database, 2GB bandwidth |
| Gemini AI | ✅ Free | 60 requests/minute |
| **Total** | **₹0/month** | Good for 1000-5000 users |

### When to Upgrade?
- **Vercel Pro** (₹1,500/month): More bandwidth, better analytics
- **Render Starter** (₹500/month): No sleep, better performance
- **Supabase Pro** (₹1,800/month): More storage, better support

---

## 📞 Support

If you face issues:
1. Check logs in Render/Vercel dashboard
2. Review this guide again
3. Check GitHub Issues
4. Contact: support@codecampusai.com

---

## 🎉 Congratulations!

Your CodeCampus AI platform is now live! 🚀

**Next Steps:**
1. Share with friends and get feedback
2. Monitor user behavior
3. Fix bugs quickly
4. Add new features based on user requests
5. Scale when you hit free tier limits

**Good luck with your startup! 💪**
