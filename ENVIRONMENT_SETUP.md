# 🔐 Environment Variables Setup Guide

## Overview
This guide helps you setup all required environment variables for production deployment.

---

## 🗄️ Database (Supabase)

### Get DATABASE_URL
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database
4. Copy "Connection String" (URI format)
5. Replace `[YOUR-PASSWORD]` with your database password

**Format:**
```
postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres
```

**Example:**
```
postgresql://postgres:MySecurePass123@db.abcdefgh.supabase.co:5432/postgres
```

---

## 🤖 AI Service (Google Gemini)

### Get GEMINI_API_KEY
1. Go to [ai.google.dev](https://ai.google.dev)
2. Click "Get API Key"
3. Create new project or select existing
4. Click "Create API Key"
5. Copy the key (starts with `AIza...`)

**Format:**
```
AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Free Tier Limits:**
- 60 requests per minute
- 1,500 requests per day
- Perfect for starting out!

---

## 💳 Payment Gateway (Razorpay)

### Get Razorpay Keys

#### Test Keys (For Development)
1. Go to [razorpay.com](https://razorpay.com)
2. Sign up and login
3. Go to Settings → API Keys
4. Click "Generate Test Key"
5. Copy both Key ID and Secret

**Format:**
```
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=YYYYYYYYYYYYYYYYYYYYYYYY
```

#### Live Keys (For Production)
1. Complete KYC verification (takes 2-3 days)
2. Once approved, go to Settings → API Keys
3. Click "Generate Live Key"
4. Copy both Key ID and Secret

**Format:**
```
RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=YYYYYYYYYYYYYYYYYYYYYYYY
```

**⚠️ Important:**
- Use test keys during development
- Switch to live keys only after KYC approval
- Never commit keys to GitHub

---

## 🔐 Authentication (JWT)

### Generate JWT_SECRET_KEY

**Option 1: Using Python**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Option 2: Using OpenSSL**
```bash
openssl rand -base64 32
```

**Option 3: Online Generator**
Go to [randomkeygen.com](https://randomkeygen.com) and copy "CodeIgniter Encryption Keys"

**Format:**
```
JWT_SECRET_KEY=your_super_secret_random_string_minimum_32_characters_long
```

**Example:**
```
JWT_SECRET_KEY=8f7d6e5c4b3a2918f7d6e5c4b3a2918f7d6e5c4b3a29
```

---

## 🔑 Google OAuth (Optional)

### Get Google OAuth Credentials

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create new project or select existing
3. Go to "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure consent screen:
   - App name: CodeCampus AI
   - User support email: your email
   - Developer contact: your email
6. Create OAuth client:
   - Application type: Web application
   - Name: CodeCampus AI Web
   - Authorized JavaScript origins:
     - `https://ai-student-assistant-xi.vercel.app`
     - `http://localhost:5173` (for development)
   - Authorized redirect URIs:
     - `https://ai-student-assistant-xi.vercel.app/auth/callback`
     - `http://localhost:5173/auth/callback`
7. Copy Client ID and Client Secret

**Format:**
```
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-XXXXXXXXXXXXXXXXXXXXXXXX
```

---

## 📧 Email (Optional - For Notifications)

### Setup Gmail SMTP

1. Enable 2-Factor Authentication on your Gmail
2. Go to Google Account → Security → App Passwords
3. Generate new app password for "Mail"
4. Copy the 16-character password

**Format:**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your.email@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop
```

**Alternative Services:**
- SendGrid (free 100 emails/day)
- Mailgun (free 5,000 emails/month)
- AWS SES (very cheap)

---

## 🎨 Frontend Environment Variables

### Vercel Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

```env
# Backend API URL
VITE_API_URL=https://your-backend-url.onrender.com

# Razorpay (use same keys as backend)
VITE_RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXXXXX

# Google OAuth (optional)
VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com

# Analytics (optional)
VITE_GA_TRACKING_ID=G-XXXXXXXXXX

# Environment
VITE_ENVIRONMENT=production
```

---

## 🖥️ Backend Environment Variables

### Render Environment Variables

Add these in Render Dashboard → Environment → Environment Variables:

```env
# Database
DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres

# AI Service
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Payment Gateway
RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=YYYYYYYYYYYYYYYYYYYYYYYY

# Authentication
JWT_SECRET_KEY=your_super_secret_random_string_minimum_32_characters
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Google OAuth (optional)
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-XXXXXXXXXXXXXXXXXXXXXXXX

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your.email@gmail.com
SMTP_PASSWORD=your_app_password

# Application
ENVIRONMENT=production
APP_NAME=CodeCampus AI
APP_VERSION=1.0.0

# Frontend URLs (comma-separated, no spaces)
FRONTEND_URLS=https://ai-student-assistant-xi.vercel.app,https://your-custom-domain.com

# Security
ALLOWED_HOSTS=*
CORS_ORIGINS=https://ai-student-assistant-xi.vercel.app

# Rate Limiting
RATE_LIMIT_PER_MINUTE=100
RATE_LIMIT_PER_HOUR=1000

# Logging
LOG_LEVEL=INFO
```

---

## 🔒 Security Best Practices

### ✅ DO
- Use strong, random secrets (32+ characters)
- Use different secrets for dev and prod
- Store secrets in environment variables
- Use `.env` files locally (add to `.gitignore`)
- Rotate secrets periodically
- Use separate database for production

### ❌ DON'T
- Commit secrets to GitHub
- Share secrets in chat/email
- Use weak or predictable secrets
- Reuse secrets across projects
- Store secrets in code
- Use production keys in development

---

## 📝 Environment Files

### Development (.env)
Create `backend/.env` for local development:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/codecampus
GEMINI_API_KEY=AIzaSy...
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
JWT_SECRET_KEY=dev_secret_key_for_testing_only
ENVIRONMENT=development
```

Create `frontend/.env` for local development:
```env
VITE_API_URL=http://localhost:8000
VITE_RAZORPAY_KEY_ID=rzp_test_...
```

### Production
- **Never** create `.env` files in production
- Use hosting platform's environment variable settings
- Vercel: Dashboard → Settings → Environment Variables
- Render: Dashboard → Environment → Environment Variables

---

## ✅ Verification Checklist

Before deploying, verify:

- [ ] DATABASE_URL connects successfully
- [ ] GEMINI_API_KEY has quota available
- [ ] RAZORPAY keys are correct (test or live)
- [ ] JWT_SECRET_KEY is strong and random
- [ ] FRONTEND_URLS includes your domain
- [ ] All required variables are set
- [ ] No secrets in GitHub repository
- [ ] Test keys work in development
- [ ] Live keys work in production

---

## 🚨 Troubleshooting

### Database Connection Failed
- Check DATABASE_URL format
- Verify password is correct
- Ensure Supabase project is active
- Check IP restrictions (disable for Render)

### AI Not Working
- Verify GEMINI_API_KEY is correct
- Check API quota limits
- Ensure key has proper permissions

### Payment Failing
- Verify Razorpay keys are correct
- Check if using test/live keys appropriately
- Ensure KYC is completed for live keys

### CORS Errors
- Check FRONTEND_URLS includes your domain
- Verify CORS_ORIGINS is set correctly
- Ensure no trailing slashes in URLs

---

## 📞 Need Help?

If you're stuck:
1. Double-check all environment variables
2. Review error logs in Render/Vercel
3. Test each service individually
4. Check service status pages
5. Contact support if needed

---

## 🎯 Quick Setup Commands

### Generate all secrets at once:
```bash
# JWT Secret
echo "JWT_SECRET_KEY=$(python -c 'import secrets; print(secrets.token_urlsafe(32))')"

# Random password
echo "DB_PASSWORD=$(python -c 'import secrets; print(secrets.token_urlsafe(16))')"
```

### Test database connection:
```bash
cd backend
python -c "from app.core.database import engine; engine.connect(); print('✅ Database connected!')"
```

### Test Gemini API:
```bash
cd backend
python -c "from app.services.ai_service import ai_service; print('✅ AI configured!' if ai_service.use_ai else '❌ AI not configured')"
```

---

**All set? Great! Now follow [DEPLOYMENT.md](./DEPLOYMENT.md) to deploy! 🚀**
