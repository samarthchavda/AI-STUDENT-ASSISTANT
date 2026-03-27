# Render Deployment & Keep-Alive Setup

## Quick Setup for Instant Google OAuth

### 1. Deploy Backend to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `codecampus-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: Free (or paid for better performance)

5. Add Environment Variables:
   ```
   DATABASE_URL=your_supabase_connection_string
   SECRET_KEY=your_secret_key_here
   GOOGLE_CLIENT_ID=your_google_client_id
   GEMINI_API_KEY=your_gemini_key
   FRONTEND_URLS=https://your-frontend.vercel.app
   ```

### 2. Run Database Optimization

After first deployment:
```bash
# SSH into Render or run locally
python3 backend/run_google_auth_optimization.py
```

This creates indexes for 10-100x faster queries.

### 3. Setup Keep-Alive (Prevent Cold Starts)

#### Option A: cron-job.org (Recommended - Free)

1. Go to https://cron-job.org/en/
2. Sign up (free)
3. Create new cron job:
   - **Title**: CodeCampus Keep-Alive
   - **URL**: `https://your-backend.onrender.com/ping`
   - **Schedule**: Every 10 minutes
   - **Method**: GET
   - **Timeout**: 30 seconds

#### Option B: UptimeRobot (Free)

1. Go to https://uptimerobot.com
2. Sign up (free)
3. Add Monitor:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: CodeCampus Backend
   - **URL**: `https://your-backend.onrender.com/ping`
   - **Monitoring Interval**: 5 minutes

#### Option C: GitHub Actions (Free)

Create `.github/workflows/keep-alive.yml`:
```yaml
name: Keep Render Alive

on:
  schedule:
    - cron: '*/10 * * * *'  # Every 10 minutes
  workflow_dispatch:  # Manual trigger

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Backend
        run: |
          curl -f https://your-backend.onrender.com/ping || exit 0
```

### 4. Update Frontend Environment

Update `frontend/.env`:
```env
VITE_API_URL=https://your-backend.onrender.com
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 5. Deploy Frontend to Vercel

```bash
cd frontend
vercel --prod
```

Or connect GitHub repo to Vercel for auto-deployment.

## Performance Expectations

### With Keep-Alive Active
- ✅ First request: 200-500ms
- ✅ Google OAuth: 300-600ms
- ✅ No cold starts

### Without Keep-Alive
- ⚠️ First request after 15min idle: 10-30 seconds (cold start)
- ✅ Subsequent requests: 200-500ms

## Verify Setup

### Test Keep-Alive
```bash
curl https://your-backend.onrender.com/ping
```

Expected response:
```json
{
  "status": "alive",
  "timestamp": "2024-03-27T10:30:00.123456",
  "message": "Server is warm and ready"
}
```

### Test Google OAuth Speed
1. Open browser DevTools → Network tab
2. Login with Google
3. Check timing for `/api/auth/google` request
4. Should be <1 second

### Monitor Render Logs
```
✅ Database connection pool warmed up
🚀 AI Student Assistant v1.0.0 starting...
📊 Environment: production
🔐 Google OAuth: Enabled
💾 Database pool: size=10, max_overflow=20
⚡ Keep-alive endpoint: /ping (use for Render)
```

## Troubleshooting

### Cold Starts Still Happening?
- Verify cron job is running (check cron-job.org dashboard)
- Check Render logs for `/ping` requests
- Ensure cron interval is <14 minutes (Render sleeps after 15min)

### Google OAuth Still Slow?
- Check database indexes: `SELECT * FROM pg_indexes WHERE tablename = 'users';`
- Verify connection pool: Check Render logs for "Database connection pool warmed up"
- Test locally first: `cd backend && uvicorn app.main:app --reload`

### Database Connection Issues?
- Verify `DATABASE_URL` in Render environment variables
- Check Supabase connection pooler settings
- Increase `pool_size` in `backend/app/core/database.py` if needed

## Cost Optimization

### Free Tier (Render + Vercel + Supabase)
- ✅ Backend: Render Free (with keep-alive)
- ✅ Frontend: Vercel Free
- ✅ Database: Supabase Free
- ✅ Keep-Alive: cron-job.org Free
- **Total**: $0/month

### Paid Tier (Better Performance)
- 💰 Backend: Render Starter ($7/month) - No cold starts
- ✅ Frontend: Vercel Free
- 💰 Database: Supabase Pro ($25/month) - Better performance
- **Total**: $32/month

## Production Checklist

- [ ] Backend deployed to Render
- [ ] Database optimization migration run
- [ ] Keep-alive cron job configured
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set correctly
- [ ] Google OAuth tested and working
- [ ] Response time <1 second verified
- [ ] Monitoring setup (optional)
