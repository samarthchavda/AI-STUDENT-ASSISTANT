# Authentication Quick Reference

## 🔐 New Endpoints

### 1. Register (with password validation)
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "Password@123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": {...}
}
```

---

### 2. Login (with account locking)
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password@123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": {...}
}
```

**Error (Account Locked):**
```json
{
  "detail": "Account locked. Try again in 12 minutes"
}
```

---

### 3. Refresh Token (NEW)
```bash
POST /api/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGc..."
}
```

**Response:**
```json
{
  "access_token": "eyJhbGc...",  // New token
  "refresh_token": "eyJhbGc...",  // Same token
  "token_type": "bearer",
  "user": {...}
}
```

---

### 4. Logout (NEW)
```bash
POST /api/auth/logout
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:**
```json
{
  "message": "Successfully logged out",
  "detail": "All tokens have been revoked"
}
```

---

### 5. Get Current User (NEW)
```bash
GET /api/auth/me
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "plan_type": "free",
  "is_admin": false,
  "auth_provider": "local",
  "created_at": "2024-03-13T10:00:00"
}
```

---

## 📋 Password Requirements

✅ Minimum 8 characters
✅ At least 1 letter (A-Z, a-z)
✅ At least 1 number (0-9)
✅ At least 1 special character (@$!%*#?&)

**Valid Examples:**
- `Password@123`
- `MyPass123!`
- `Secure#2024`

---

## 🔒 Security Features

### Email Normalization
```
Input:  "  Test@Gmail.COM  "
Output: "test@gmail.com"
```

### Login Protection
- 5 failed attempts = 15 minute lock
- Auto-reset on successful login

### Token Lifetimes
- Access Token: 15 minutes
- Refresh Token: 7 days

### OAuth Improvements
- Google users: `hashed_password = NULL`
- Provider tracking: `auth_provider = "google"`

---

## 🚀 Frontend Integration

### Login Flow
```typescript
const login = async (email: string, password: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  // Store tokens
  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('refresh_token', data.refresh_token);
  localStorage.setItem('user', JSON.stringify(data.user));
  
  return data;
};
```

### Auto-Refresh
```typescript
// Axios interceptor
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      const response = await axios.post('/api/auth/refresh', {
        refresh_token: refreshToken
      });
      
      const { access_token } = response.data;
      localStorage.setItem('access_token', access_token);
      
      error.config.headers['Authorization'] = `Bearer ${access_token}`;
      return axios(error.config);
    }
    
    return Promise.reject(error);
  }
);
```

### Logout
```typescript
const logout = async () => {
  const token = localStorage.getItem('access_token');
  
  await fetch('/api/auth/logout', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  localStorage.clear();
  window.location.href = '/login';
};
```

---

## 🧪 Testing

### Test Password Validation
```bash
# Valid
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test","password":"Password@123"}'

# Invalid (no special char)
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test","password":"Password123"}'
```

### Test Refresh Token
```bash
# Login
LOGIN=$(curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password@123"}')

# Extract refresh token
REFRESH_TOKEN=$(echo $LOGIN | jq -r '.refresh_token')

# Refresh
curl -X POST http://localhost:8000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refresh_token\": \"$REFRESH_TOKEN\"}"
```

### Test Logout
```bash
# Logout
curl -X POST http://localhost:8000/api/auth/logout \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Try to use old token (should fail)
curl -H "Authorization: Bearer $ACCESS_TOKEN" \
  http://localhost:8000/api/auth/me
```

---

## 🔄 Migration

```bash
cd backend
python3 migrate_auth_improvements.py
```

---

## ✅ Checklist

- [ ] Run migration script
- [ ] Test password validation
- [ ] Test login protection
- [ ] Test refresh token flow
- [ ] Test logout functionality
- [ ] Update frontend to store refresh token
- [ ] Add auto-refresh interceptor
- [ ] Test Google OAuth still works
- [ ] Deploy to production

---

## 📖 Full Documentation

See `AUTH_IMPROVEMENTS.md` for complete documentation.
