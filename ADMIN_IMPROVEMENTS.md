# Admin Panel Improvements & Company Questions API

## Overview
This document describes the 5 admin panel improvements and the powerful public company questions search API that was added to the platform.

---

## 🎯 Admin Panel Improvements

### 1. Pagination Count in GET /admin/users
**Before:**
```json
[
  {"id": 1, "email": "user@example.com", ...},
  {"id": 2, "email": "user2@example.com", ...}
]
```

**After:**
```json
{
  "total": 150,
  "users": [
    {"id": 1, "email": "user@example.com", ...},
    {"id": 2, "email": "user2@example.com", ...}
  ]
}
```

**Benefits:**
- Frontend can show "Page 1 of 15" easily
- Better UX with total count display
- Easier pagination implementation

**Usage:**
```bash
GET /api/admin/users?skip=0&limit=10
```

---

### 2. Search API for Users
**Endpoint:** `GET /api/admin/users?search=email`

**Examples:**
```bash
# Search for Gmail users
GET /api/admin/users?search=gmail

# Search for specific user
GET /api/admin/users?search=john@example.com

# Combine with pagination
GET /api/admin/users?search=gmail&skip=0&limit=20
```

**Response:**
```json
{
  "total": 45,
  "users": [
    {"id": 1, "email": "john@gmail.com", ...},
    {"id": 2, "email": "jane@gmail.com", ...}
  ]
}
```

**Benefits:**
- Quick user lookup
- Filter by email domain
- Find specific users instantly

---

### 3. Delete Company Question API
**Endpoint:** `DELETE /api/admin/company-questions/{id}`

**Example:**
```bash
DELETE /api/admin/company-questions/123
```

**Response:**
```json
{
  "message": "Question deleted successfully",
  "id": 123
}
```

**Use Cases:**
- Remove duplicate questions
- Delete outdated questions
- Clean up database

---

### 4. Add Company Question API
**Endpoint:** `POST /api/admin/company-questions`

**Request Body:**
```json
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

**Response:**
```json
{
  "id": 456,
  "company_name": "Amazon",
  "question_text": "What is load balancing?",
  "category": "technical",
  "difficulty": "medium",
  "frequency": 5,
  "topic": "System Design",
  "year_asked": "2024",
  "created_at": "2024-03-13T10:30:00"
}
```

**Valid Categories:**
- `technical`
- `coding`
- `hr`
- `dsa`
- `system_design`
- `aptitude`
- `behavioral`

**Valid Difficulties:**
- `easy`
- `medium`
- `hard`

**Benefits:**
- Manual question entry
- Quick database updates
- No CSV needed for single questions

---

### 5. Rate Limiting (Security)
**Configuration:** 100 requests per minute per IP/user

**How it Works:**
- Tracks requests per IP address
- Tracks requests per authenticated user
- Blocks excessive requests
- Returns 429 status code when limit exceeded

**Response Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1710331800
```

**Error Response (429):**
```json
{
  "detail": "Rate limit exceeded. Maximum 100 requests per minute.",
  "retry_after": 60
}
```

**Benefits:**
- Prevents spam attacks
- Protects server resources
- Fair usage for all users
- DDoS protection

---

## 🚀 Public Company Questions API

### Overview
This is the MOST POWERFUL feature for your platform. Users can search for top interview questions for any company without authentication.

### Endpoint: GET /api/questions

**Base URL:** `http://localhost:8000/api/questions`

### Parameters:
- `company` (required): Company name (e.g., Amazon, Microsoft, TCS)
- `category` (optional): Filter by category
- `difficulty` (optional): Filter by difficulty
- `limit` (optional): Number of questions (default: 20, max: 100)

---

### Examples:

#### 1. Get Amazon Interview Questions
```bash
GET /api/questions?company=amazon
```

**Response:**
```json
[
  {
    "id": 1,
    "company_name": "Amazon",
    "question_text": "What is load balancing?",
    "category": "technical",
    "difficulty": "hard",
    "topic": "System Design",
    "year_asked": "2024",
    "frequency": 15
  },
  {
    "id": 2,
    "company_name": "Amazon",
    "question_text": "Reverse a linked list",
    "category": "coding",
    "difficulty": "medium",
    "topic": "Linked Lists",
    "year_asked": "2024",
    "frequency": 12
  }
]
```

#### 2. Get Microsoft Coding Questions
```bash
GET /api/questions?company=microsoft&category=coding
```

#### 3. Get TCS Easy Questions
```bash
GET /api/questions?company=tcs&difficulty=easy
```

#### 4. Get Infosys HR Questions (Top 10)
```bash
GET /api/questions?company=infosys&category=hr&limit=10
```

---

### Additional Public Endpoints:

#### Get All Companies
```bash
GET /api/companies
```

**Response:**
```json
{
  "total_companies": 25,
  "companies": [
    {"name": "Amazon", "question_count": 150},
    {"name": "Microsoft", "question_count": 120},
    {"name": "TCS", "question_count": 80},
    {"name": "Infosys", "question_count": 75}
  ]
}
```

#### Get All Categories
```bash
GET /api/categories
```

**Response:**
```json
{
  "categories": [
    {"value": "technical", "name": "Technical"},
    {"value": "coding", "name": "Coding"},
    {"value": "hr", "name": "Hr"},
    {"value": "dsa", "name": "Dsa"},
    {"value": "system_design", "name": "System Design"}
  ]
}
```

#### Get All Difficulty Levels
```bash
GET /api/difficulties
```

**Response:**
```json
{
  "difficulties": [
    {"value": "easy", "name": "Easy"},
    {"value": "medium", "name": "Medium"},
    {"value": "hard", "name": "Hard"}
  ]
}
```

---

## 🎨 Frontend Integration Examples

### 1. Admin User Search
```typescript
// Search for users
const searchUsers = async (searchTerm: string) => {
  const response = await fetch(
    `http://localhost:8000/api/admin/users?search=${searchTerm}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  const data = await response.json();
  console.log(`Found ${data.total} users`);
  return data;
};
```

### 2. Add Company Question
```typescript
// Add new question
const addQuestion = async (question: any) => {
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
```

### 3. Delete Company Question
```typescript
// Delete question
const deleteQuestion = async (questionId: number) => {
  const response = await fetch(
    `http://localhost:8000/api/admin/company-questions/${questionId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return await response.json();
};
```

### 4. Public Company Questions Search
```typescript
// Search Amazon questions (no auth needed!)
const searchCompanyQuestions = async (company: string) => {
  const response = await fetch(
    `http://localhost:8000/api/questions?company=${company}&limit=20`
  );
  return await response.json();
};

// Usage
const amazonQuestions = await searchCompanyQuestions('amazon');
console.log(amazonQuestions);
```

---

## 🔒 Security Features

### Rate Limiting
- **Global:** 100 requests/minute per IP/user
- **Specific endpoints:** Can have custom limits
- **Headers:** Shows remaining requests
- **Protection:** Against spam and DDoS

### Request Validation
- Checks for XSS attacks
- Validates SQL injection patterns
- Blocks path traversal attempts
- Validates content types

### Security Headers
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: enabled
- Strict-Transport-Security: enabled

---

## 📊 Use Cases

### For Students:
1. Search "Top Amazon interview questions"
2. Filter by difficulty (easy/medium/hard)
3. Filter by category (coding/technical/hr)
4. Prepare for specific companies

### For Platform:
1. SEO goldmine - rank for "Amazon interview questions"
2. Attract organic traffic
3. Build question database
4. Become go-to interview prep platform

### For Admins:
1. Manage users efficiently with search
2. Add questions manually or via CSV
3. Delete duplicate/outdated questions
4. Monitor with rate limiting

---

## 🚀 Next Steps

### Frontend Development:
1. Create Company Questions Search Page
2. Add search bar with company autocomplete
3. Display questions with filters
4. Add pagination for results

### Database Population:
1. Upload CSV files with company questions
2. Use bulk upload API
3. Manually add high-quality questions
4. Encourage user contributions

### SEO Optimization:
1. Create landing pages for each company
2. Add meta tags for search engines
3. Generate sitemap with question URLs
4. Build backlinks to question pages

---

## 📝 Testing

### Test Admin Endpoints:
```bash
# Test user search
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8000/api/admin/users?search=gmail"

# Test add question
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"company_name":"Amazon","question_text":"Test question","category":"technical","difficulty":"medium"}' \
  "http://localhost:8000/api/admin/company-questions"

# Test delete question
curl -X DELETE -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8000/api/admin/company-questions/1"
```

### Test Public API:
```bash
# Test company search (no auth needed!)
curl "http://localhost:8000/api/questions?company=amazon"

# Test with filters
curl "http://localhost:8000/api/questions?company=microsoft&category=coding&difficulty=medium"

# Test companies list
curl "http://localhost:8000/api/companies"
```

### Test Rate Limiting:
```bash
# Send 101 requests quickly to trigger rate limit
for i in {1..101}; do
  curl "http://localhost:8000/api/questions?company=amazon"
done
```

---

## ✅ Summary

### What Was Added:
1. ✅ Pagination count in GET /admin/users
2. ✅ Search API for users by email
3. ✅ DELETE /admin/company-questions/{id}
4. ✅ POST /admin/company-questions (manual add)
5. ✅ Rate limiting (100 requests/minute)
6. ✅ Public company questions search API
7. ✅ Additional helper endpoints (companies, categories, difficulties)

### Files Modified:
- `backend/routes/admin_routes.py` - Admin improvements
- `backend/routes/public_routes.py` - New public API
- `backend/middleware.py` - Rate limiting middleware
- `backend/main.py` - Added public routes and rate limiting

### Benefits:
- Better admin panel UX
- Powerful public API for users
- Enhanced security with rate limiting
- SEO optimization potential
- Platform differentiation

---

## 🎉 Your Platform is Now Ready!

The platform now has:
- Complete admin management tools
- Public company questions API
- Rate limiting for security
- Search and filter capabilities
- Ready for production deployment

This makes your platform a real interview preparation tool that can compete with major platforms!
