# API Quick Reference - New Features

## 🔓 Public API (No Authentication)

### Search Company Questions
```
GET /api/questions?company={company}&category={category}&difficulty={difficulty}&limit={limit}
```

**Examples:**
```bash
# Amazon questions
/api/questions?company=amazon

# Microsoft coding questions
/api/questions?company=microsoft&category=coding

# TCS easy questions (top 10)
/api/questions?company=tcs&difficulty=easy&limit=10
```

### Get Companies List
```
GET /api/companies
```

### Get Categories
```
GET /api/categories
```

### Get Difficulties
```
GET /api/difficulties
```

---

## 🔒 Admin API (Requires Admin Token)

### Get Users (with pagination & search)
```
GET /api/admin/users?skip={skip}&limit={limit}&search={search}
```

**Examples:**
```bash
# Get first 10 users
/api/admin/users?skip=0&limit=10

# Search Gmail users
/api/admin/users?search=gmail

# Search specific user
/api/admin/users?search=john@example.com
```

**Response:**
```json
{
  "total": 150,
  "users": [...]
}
```

### Add Company Question
```
POST /api/admin/company-questions
Content-Type: application/json

{
  "company_name": "Amazon",
  "question_text": "What is load balancing?",
  "category": "technical",
  "difficulty": "medium",
  "topic": "System Design",
  "year_asked": "2024",
  "frequency": 5
}
```

### Delete Company Question
```
DELETE /api/admin/company-questions/{id}
```

---

## 📊 Valid Values

### Categories:
- `technical`
- `coding`
- `hr`
- `dsa`
- `system_design`
- `aptitude`
- `behavioral`

### Difficulties:
- `easy`
- `medium`
- `hard`

---

## 🔒 Rate Limiting

- **Limit:** 100 requests per minute per IP/user
- **Headers:**
  - `X-RateLimit-Limit: 100`
  - `X-RateLimit-Remaining: 95`
  - `X-RateLimit-Reset: 1710331800`
- **Error:** 429 Too Many Requests

---

## 🧪 Quick Test Commands

### Test Public API:
```bash
curl http://localhost:8000/api/questions?company=amazon
curl http://localhost:8000/api/companies
```

### Test Admin API:
```bash
# Replace YOUR_TOKEN with actual admin token
TOKEN="YOUR_TOKEN"

# Search users
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/admin/users?search=gmail

# Add question
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"company_name":"Test","question_text":"Test question","category":"technical","difficulty":"medium"}' \
  http://localhost:8000/api/admin/company-questions

# Delete question (replace 1 with actual ID)
curl -X DELETE -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/admin/company-questions/1
```

---

## 📝 Frontend Integration

### TypeScript Examples:

```typescript
// Public API - No auth needed
const searchQuestions = async (company: string) => {
  const response = await fetch(
    `http://localhost:8000/api/questions?company=${company}`
  );
  return await response.json();
};

// Admin API - Search users
const searchUsers = async (search: string, token: string) => {
  const response = await fetch(
    `http://localhost:8000/api/admin/users?search=${search}`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  return await response.json();
};

// Admin API - Add question
const addQuestion = async (question: any, token: string) => {
  const response = await fetch(
    'http://localhost:8000/api/admin/company-questions',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(question)
    }
  );
  return await response.json();
};

// Admin API - Delete question
const deleteQuestion = async (id: number, token: string) => {
  const response = await fetch(
    `http://localhost:8000/api/admin/company-questions/${id}`,
    {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  return await response.json();
};
```

---

## 🎯 Use Cases

### For Students:
1. Search "Top Amazon interview questions"
2. Filter by difficulty (easy/medium/hard)
3. Filter by category (coding/technical/hr)
4. Get questions for specific companies

### For Admins:
1. Search users by email
2. Add questions manually
3. Delete duplicate questions
4. Monitor with pagination

### For Platform:
1. SEO optimization
2. Organic traffic growth
3. Company-specific landing pages
4. Interview prep resource

---

## 📖 Full Documentation

See `ADMIN_IMPROVEMENTS.md` for complete documentation.

---

## ✅ Status

All features implemented and tested:
- ✅ Public company questions API
- ✅ Admin user search
- ✅ Admin pagination
- ✅ Add/delete questions
- ✅ Rate limiting
- ✅ Security headers
- ✅ Request validation
