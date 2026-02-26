# Security Setup Guide

## 🚀 Quick Start

### 1. Install Security Dependencies

```bash
cd backend
pip install slowapi==0.1.9
```

Or install all dependencies:
```bash
pip install -r requirements.txt
```

### 2. Restart Backend

```bash
npm run dev
# or
python main.py
```

### 3. Test Security Features

#### Test Rate Limiting:
```bash
# Try to hit login endpoint more than 10 times in a minute
for i in {1..15}; do
  curl -X POST http://localhost:8000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"test123"}'
  echo "\nRequest $i"
done

# After 10 requests, you should see:
# {"detail":"Rate limit exceeded: 10 per 1 minute"}
```

#### Test Security Headers:
```bash
curl -I http://localhost:8000/

# You should see headers like:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
# Strict-Transport-Security: max-age=31536000
```

#### Test Request Validation:
```bash
# Try XSS attack
curl -X GET "http://localhost:8000/<script>alert('xss')</script>"

# Should return:
# {"detail":"Invalid request"}
```

---

## 🔒 Security Features

### Rate Limiting

**Endpoints Protected:**
- `/api/auth/register` - 5 requests/minute
- `/api/auth/login` - 10 requests/minute
- `/api/auth/google` - 10 requests/minute
- `/api/chat` - 30 requests/minute
- `/api/chat/stream` - 30 requests/minute
- `/` - 10 requests/minute
- `/api/health` - 20 requests/minute

**How it works:**
- Tracks requests by IP address for unauthenticated users
- Tracks requests by JWT token for authenticated users
- Returns `429 Too Many Requests` when limit exceeded
- Resets after the time window (1 minute)

### Security Headers

**Headers Added:**
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-XSS-Protection: 1; mode=block` - Enables XSS filter
- `Strict-Transport-Security` - Forces HTTPS (31536000 seconds = 1 year)
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer
- `Permissions-Policy` - Disables geolocation, microphone, camera

### Request Validation

**Protections:**
- **Payload size limit:** Max 10MB per request
- **Content-Type validation:** Only allows safe types
- **XSS detection:** Blocks `<script>`, `javascript:`, event handlers
- **SQL injection detection:** Blocks `UNION SELECT`, `DROP TABLE`, etc.
- **Path traversal detection:** Blocks `../` patterns

### Request Logging

**What's Logged:**
- Request method and path
- Client IP address
- Response status code
- Processing time
- Error types (not details)

**What's NOT Logged:**
- Passwords
- API keys
- JWT tokens
- Sensitive headers (Authorization, Cookie)

---

## 🛡️ Middleware Order

Middleware is applied in this order (important!):

1. **IPBlockingMiddleware** - Block suspicious IPs first
2. **RequestValidationMiddleware** - Validate request patterns
3. **SecurityHeadersMiddleware** - Add security headers
4. **RequestLoggingMiddleware** - Log requests
5. **CORSMiddleware** - Handle CORS (must be last)

---

## 📊 Monitoring

### Check Logs

```bash
# Backend logs show:
[REQUEST] POST /api/auth/login from 127.0.0.1 (auth endpoint)
[RESPONSE] /api/auth/login - Status: 200 - Time: 0.234s

[REQUEST] POST /api/chat from 127.0.0.1
[RESPONSE] /api/chat - Status: 200 - Time: 1.456s
```

### Check Rate Limit Status

```bash
# Response headers include:
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1234567890
```

---

## 🚨 Troubleshooting

### Rate Limit Too Strict?

Edit `backend/routes/auth_routes.py`:
```python
@rate_limit("10/minute")  # Change to "20/minute"
```

### Need to Block an IP?

Edit `backend/middleware.py`:
```python
class IPBlockingMiddleware(BaseHTTPMiddleware):
    BLOCKED_IPS = {"192.168.1.100", "10.0.0.50"}  # Add IPs here
```

### Disable Security for Testing?

Comment out middleware in `backend/main.py`:
```python
# app.add_middleware(IPBlockingMiddleware)
# app.add_middleware(RequestValidationMiddleware)
```

---

## ✅ Verification

After setup, verify everything works:

1. **Rate limiting works:**
   ```bash
   # Hit login 15 times, should get 429 after 10
   ```

2. **Security headers present:**
   ```bash
   curl -I http://localhost:8000/
   ```

3. **XSS blocked:**
   ```bash
   curl "http://localhost:8000/<script>alert(1)</script>"
   ```

4. **Chat still works:**
   - Go to http://localhost:3000/chat
   - Send a message
   - Should work normally

5. **Login still works:**
   - Go to http://localhost:3000/auth
   - Login with credentials
   - Should work normally

---

## 🎯 Production Checklist

Before deploying:

- [ ] Install slowapi: `pip install slowapi`
- [ ] Test rate limiting
- [ ] Test all endpoints still work
- [ ] Check logs for errors
- [ ] Configure CORS for production domain
- [ ] Enable HTTPS
- [ ] Set strong SECRET_KEY
- [ ] Monitor rate limit hits
- [ ] Set up alerts for blocked requests

---

**Security Status:** ✅ ENABLED
**Last Updated:** 2026-02-26

