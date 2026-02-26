# Vercel Deployment Guide

## ✅ Git Push Complete
All changes have been pushed to GitHub: https://github.com/samarthchavda/AI-STUDENT-ASSISTANT

## 🚀 Deploy to Vercel

### Step 1: Deploy Frontend (Vercel)

1. **Go to Vercel**: https://vercel.com
2. **Sign in** with your GitHub account
3. **Click "Add New Project"**
4. **Import your repository**: `samarthchavda/AI-STUDENT-ASSISTANT`
5. **Configure Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

6. **Add Environment Variables**:
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   ```
   (You'll get this URL after deploying backend)

7. **Click "Deploy"**

### Step 2: Deploy Backend (Railway)

Since Vercel doesn't support Python backends well, use Railway for backend:

1. **Go to Railway**: https://railway.app
2. **Sign in** with GitHub
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose**: `samarthchavda/AI-STUDENT-ASSISTANT`
6. **Configure**:
   - **Root Directory**: `backend`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

7. **Add Environment Variables**:
   ```
   DATABASE_URL=postgresql://user:password@host:port/dbname
   SECRET_KEY=your-secret-key-here
   OPENAI_API_KEY=your-openai-api-key-here
   GEMINI_API_KEY=your-gemini-api-key-here
   ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
   ```

8. **Add PostgreSQL Database**:
   - Click "New" → "Database" → "PostgreSQL"
   - Railway will auto-generate `DATABASE_URL`

9. **Deploy**

### Step 3: Update Frontend with Backend URL

1. Go back to **Vercel Dashboard**
2. Select your frontend project
3. Go to **Settings** → **Environment Variables**
4. Update `VITE_API_URL` with your Railway backend URL
5. **Redeploy** the frontend

### Step 4: Update CORS Settings

Update `backend/main.py` CORS origins with your Vercel URL:
```python
origins = [
    "https://your-app.vercel.app",
    "http://localhost:3000",
]
```

Then push changes:
```bash
git add backend/main.py
git commit -m "Update CORS for production"
git push origin main
```

Railway will auto-deploy the changes.

## 🔒 Security Checklist

- [ ] Change `SECRET_KEY` in production
- [ ] Update `ALLOWED_ORIGINS` with your Vercel URL
- [ ] Enable HTTPS only
- [ ] Set up custom domain (optional)
- [ ] Monitor API usage (OpenAI costs)
- [ ] Set up database backups

## 📊 Monitor Your App

**Vercel Dashboard**: Monitor frontend performance, logs, analytics
**Railway Dashboard**: Monitor backend logs, database, resource usage

## 🌐 Custom Domain (Optional)

### Vercel (Frontend):
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### Railway (Backend):
1. Go to Project Settings → Domains
2. Add custom domain for API
3. Update DNS records

## 💰 Cost Estimate

- **Vercel**: Free tier (100GB bandwidth, unlimited deployments)
- **Railway**: $5/month (includes PostgreSQL database)
- **OpenAI API**: Pay per use (~$0.002 per 1K tokens)
- **Total**: ~$5-10/month for small-medium traffic

## 🆘 Troubleshooting

**Frontend not loading?**
- Check `VITE_API_URL` is correct
- Check browser console for errors

**Backend errors?**
- Check Railway logs
- Verify all environment variables are set
- Check database connection

**CORS errors?**
- Update `ALLOWED_ORIGINS` in backend
- Redeploy backend

**Voice features not working?**
- Voice recognition requires HTTPS (Vercel provides this)
- Check browser compatibility (Chrome/Edge/Safari)

## 📝 Post-Deployment

1. Test all features:
   - Login/Register
   - Chat with AI
   - Voice recognition
   - Text-to-speech
   - Multi-language support

2. Share your app:
   - Frontend URL: `https://your-app.vercel.app`
   - Share with users!

---

**Need Help?** Check Vercel docs: https://vercel.com/docs
**Railway docs**: https://docs.railway.app
