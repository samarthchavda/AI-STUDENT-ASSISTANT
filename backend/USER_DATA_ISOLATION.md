# User Data Isolation - Security Documentation

## Overview
All user data in the system is properly isolated. Each user can only access their own data through JWT authentication and database filtering.

## ✅ Security Measures Implemented

### 1. JWT Authentication Required
All sensitive endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

Without a valid token, users receive:
- **401 Unauthorized**: Invalid or expired token
- **403 Forbidden**: No token provided

### 2. User ID Filtering in Database Queries

All history and user-specific endpoints filter by `user_id`:

#### Aptitude Exam History
```sql
SELECT * FROM aptitude_exam_history 
WHERE user_id = :user_id 
ORDER BY exam_date DESC
```

#### Chat History
```python
db.query(ChatHistory).filter(
    ChatHistory.user_id == current_user.id
).order_by(ChatHistory.timestamp.desc())
```

#### Company Prep History
```python
db.query(UserPractice).filter(
    UserPractice.user_id == current_user.id
).order_by(UserPractice.practice_date.desc())
```

#### Usage Statistics
```sql
SELECT category, COUNT(*) as exam_count
FROM aptitude_exam_history
WHERE user_id = :user_id
GROUP BY category
```

### 3. Data Saving with User ID

All submissions automatically save with the authenticated user's ID:

#### Aptitude Exam Submission
```sql
INSERT INTO aptitude_exam_history 
(user_id, company, category, difficulty, score, ...)
VALUES (:user_id, ...)
```
Where `user_id = current_user.id` from JWT token.

#### Company Prep Practice
```python
practice_entry = UserPractice(
    user_id=current_user.id,
    company_name=payload.company,
    ...
)
```

#### Chat Messages
```python
chat_message = ChatHistory(
    user_id=current_user.id,
    role=message.role,
    content=message.content,
    ...
)
```

### 4. Protected Endpoints

All these endpoints require authentication:

| Endpoint | Method | Filters by user_id | Purpose |
|----------|--------|-------------------|---------|
| `/api/aptitude/test` | GET | ✅ (no-repeat logic) | Fetch questions |
| `/api/aptitude/submit` | POST | ✅ | Save exam results |
| `/api/aptitude/history` | GET | ✅ | Get exam history |
| `/api/aptitude/history/{id}` | GET | ✅ | Get exam details |
| `/api/aptitude/usage-stats` | GET | ✅ | Get usage stats |
| `/api/chat/history` | GET | ✅ | Get chat history |
| `/api/company-prep/history` | GET | ✅ | Get practice history |
| `/api/company-prep/answer/evaluate` | POST | ✅ | Save practice |

### 5. Public Endpoints (No Auth Required)

These endpoints don't need authentication as they don't expose user data:

| Endpoint | Purpose |
|----------|---------|
| `/api/aptitude/companies` | List available companies |
| `/api/aptitude/categories` | List question categories |
| `/api/aptitude/stats` | Question database stats |
| `/api/aptitude/practice-questions` | Public practice questions |
| `/api/aptitude/practice-categories` | Practice categories |

## 🔐 How Authentication Works

### 1. User Logs In
```typescript
// Frontend sends credentials
const response = await userAPI.login(email, password)
const { access_token, user } = response.data

// Store token in localStorage
localStorage.setItem('token', access_token)

// Store user in Zustand store
setUser(user)
```

### 2. API Requests Include Token
```typescript
// Axios interceptor automatically adds token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

### 3. Backend Validates Token
```python
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials
    
    # Decode JWT token
    payload = decode_token(token)
    email = payload.get("sub")
    
    # Fetch user from database
    user = db.query(User).filter(User.email == email).first()
    
    return user  # This user object is passed to endpoints
```

### 4. Endpoints Filter by User ID
```python
@router.get("/history")
async def get_exam_history(current_user = Depends(get_current_user)):
    query = """
        SELECT * FROM aptitude_exam_history
        WHERE user_id = :user_id  # ← User-specific filtering
        ORDER BY exam_date DESC
    """
    result = conn.execute(text(query), {"user_id": current_user.id})
```

## 🧪 Testing User Isolation

### Manual Test
1. Create two different user accounts (User A and User B)
2. Login as User A, take an aptitude test
3. Logout, login as User B, take a different test
4. Check User A's history - should only see User A's tests
5. Check User B's history - should only see User B's tests

### Automated Test
```bash
cd backend
python3 test_user_isolation.py
```

Expected output:
```
✅ All history endpoints require authentication
✅ Unauthenticated users get 401/403
✅ Each user only sees their own data
```

## 🐛 Troubleshooting "Seeing Other Users' Data"

### Issue: Users seeing shared data

**Possible Causes:**

1. **Same Browser/Device**
   - Multiple users using same computer without logging out
   - Solution: Each user must logout before next user logs in

2. **Cached LocalStorage**
   - Old token still in localStorage
   - Solution: Clear browser data or use incognito mode

3. **Shared Account**
   - Multiple people using same email/password
   - Solution: Each person needs their own account

4. **Browser Not Sending Token**
   - Check DevTools → Network → Request Headers
   - Should see: `Authorization: Bearer eyJ...`
   - Solution: Verify axios interceptor is working

### Debug Steps

1. **Check Current User**
   ```javascript
   // In browser console
   console.log(localStorage.getItem('token'))
   console.log(useAppStore.getState().user)
   ```

2. **Verify API Request**
   - Open DevTools → Network tab
   - Click on `/aptitude/history` request
   - Check Headers → Authorization header exists
   - Check Response → Should only show current user's data

3. **Check Backend Logs**
   ```bash
   # Backend should log:
   🔍 User 123 plan: free
   📊 User 123 has taken 2 exams for company TCS
   ```

4. **Test with Different Browsers**
   - User A: Chrome
   - User B: Firefox
   - Verify each sees only their own data

### Force Logout All Users

If needed, clear all sessions:

```sql
-- Revoke all refresh tokens
UPDATE refresh_tokens SET revoked = true;

-- Or delete all tokens
DELETE FROM refresh_tokens;
```

Users will need to login again.

## 🔒 Security Best Practices

### Current Implementation ✅
- ✅ JWT tokens with 15-minute expiry
- ✅ Refresh tokens with 7-day expiry
- ✅ All queries filter by user_id
- ✅ Token validation on every request
- ✅ Secure password hashing (bcrypt)
- ✅ Rate limiting on all endpoints
- ✅ CORS configured for specific origins

### Additional Recommendations
- 🔄 Implement token rotation on refresh
- 🔄 Add IP-based session validation
- 🔄 Log all data access for audit trail
- 🔄 Add 2FA for admin accounts
- 🔄 Implement session timeout warnings

## 📊 Verification Checklist

Run this checklist to verify user isolation:

- [ ] Create 2 test accounts (test1@example.com, test2@example.com)
- [ ] Login as test1, take aptitude test, note the score
- [ ] Logout completely
- [ ] Login as test2, take different aptitude test
- [ ] Check test2's history - should NOT see test1's results
- [ ] Logout, login as test1 again
- [ ] Check test1's history - should see original test
- [ ] Open browser DevTools → Application → Local Storage
- [ ] Verify token changes when switching users
- [ ] Test in incognito mode to ensure no cache issues

## 🚨 If Issue Persists

If users are still seeing shared data after verification:

1. **Check Database**
   ```sql
   -- Verify user_id is being saved
   SELECT user_id, company, score, exam_date 
   FROM aptitude_exam_history 
   ORDER BY exam_date DESC 
   LIMIT 10;
   
   -- Should show different user_ids
   ```

2. **Check Frontend State**
   - Clear all browser data
   - Use incognito mode
   - Check if Zustand persist is causing issues

3. **Check Backend Logs**
   - Look for "User X has taken Y exams"
   - Verify user_id in logs matches expected user

4. **Contact Support**
   - Provide: Browser console logs
   - Provide: Network tab screenshots
   - Provide: Backend logs showing user_id

## 📝 Code References

- **Authentication**: `backend/app/core/auth.py` → `get_current_user()`
- **Aptitude History**: `backend/app/routes/aptitude_routes.py` → Line 598-665
- **Chat History**: `backend/app/routes/chat_routes.py` → Line 277-310
- **Company Prep**: `backend/app/routes/company_prep_routes.py` → Line 243-250
- **Frontend Store**: `frontend/src/store/useAppStore.ts`
- **Dashboard**: `frontend/src/pages/DashboardPage.tsx` → Line 132-170
