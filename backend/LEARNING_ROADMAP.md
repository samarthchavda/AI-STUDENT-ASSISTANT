# 🎓 Backend Learning Roadmap - From Zero to Hero

## 📌 For Complete Beginners

If you have **zero knowledge** of backend development, follow this step-by-step roadmap to understand your CodeCampus AI backend.

---

## 🗺️ Learning Path Overview

```
Week 1-2: Basics (Python, HTTP, APIs)
   ↓
Week 3-4: FastAPI Fundamentals
   ↓
Week 5-6: Database & SQLAlchemy
   ↓
Week 7-8: Authentication & Security
   ↓
Week 9-10: Your Backend Code
```

---

## 📚 Phase 1: Prerequisites (Week 1-2)

### 1.1 Python Basics (If you don't know Python)

**What to Learn:**
- Variables, data types (string, int, list, dict)
- Functions and classes
- Imports and modules
- Error handling (try/except)

**Resources:**
- [Python.org Tutorial](https://docs.python.org/3/tutorial/) (Free)
- [Python for Beginners - YouTube](https://www.youtube.com/watch?v=rfscVS0vtbw) (Free)

**Practice:**
```python
# Example: Understanding functions
def greet(name):
    return f"Hello, {name}!"

result = greet("Samarth")
print(result)  # Output: Hello, Samarth!
```

---

### 1.2 HTTP & REST APIs Basics

**What to Learn:**
- What is HTTP? (Request/Response)
- HTTP Methods: GET, POST, PUT, DELETE
- Status Codes: 200 (OK), 404 (Not Found), 500 (Error)
- JSON format

**Key Concepts:**
```
Client (Browser/App) → HTTP Request → Server (Backend)
                                          ↓
Client (Browser/App) ← HTTP Response ← Server (Backend)
```

**Example Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Example Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

**Resources:**
- [HTTP Crash Course - YouTube](https://www.youtube.com/watch?v=iYM2zFP3Zn0) (Free)
- [REST API Tutorial](https://restfulapi.net/) (Free)

---

## 📚 Phase 2: FastAPI Fundamentals (Week 3-4)

### 2.1 What is FastAPI?

FastAPI is a **Python framework** for building APIs (backend servers).

**Think of it like this:**
- **Frontend** (React/HTML) = Restaurant Menu (what customers see)
- **Backend** (FastAPI) = Kitchen (where food is prepared)
- **Database** (PostgreSQL) = Storage Room (where ingredients are stored)

---

### 2.2 Your First FastAPI App

**Install FastAPI:**
```bash
pip install fastapi uvicorn
```

**Create `hello.py`:**
```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello World"}

@app.get("/greet/{name}")
def greet(name: str):
    return {"message": f"Hello, {name}!"}
```

**Run it:**
```bash
uvicorn hello:app --reload
```

**Test it:**
- Open browser: http://localhost:8000
- Try: http://localhost:8000/greet/Samarth

**What's happening?**
1. `@app.get("/")` = When someone visits `/`, run this function
2. `return {"message": "..."}` = Send JSON response back
3. `uvicorn` = Server that runs your FastAPI app

---

### 2.3 Understanding Routes (Endpoints)

**Routes = URLs that your API responds to**

```python
@app.get("/users")           # GET request to /users
def get_users():
    return [{"id": 1, "name": "John"}]

@app.post("/users")          # POST request to /users
def create_user(name: str):
    return {"id": 2, "name": name}

@app.get("/users/{user_id}") # GET request to /users/123
def get_user(user_id: int):
    return {"id": user_id, "name": "John"}
```

**Resources:**
- [FastAPI Tutorial](https://fastapi.tiangolo.com/tutorial/) (Official, Free)
- [FastAPI Crash Course - YouTube](https://www.youtube.com/watch?v=7t2alSnE2-I) (Free)

---

## 📚 Phase 3: Database & SQLAlchemy (Week 5-6)

### 3.1 What is a Database?

**Database = Excel sheet on steroids**

Instead of storing data in variables (which disappear when server restarts), we store in a database.

**Example:**
```
Users Table:
+----+-------------------+----------+
| id | email             | name     |
+----+-------------------+----------+
| 1  | john@example.com  | John Doe |
| 2  | jane@example.com  | Jane Doe |
+----+-------------------+----------+
```

---

### 3.2 SQLAlchemy Basics

**SQLAlchemy = Python library to talk to databases**

**Define a Model (Table):**
```python
from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True)
    name = Column(String)
```

**Query the Database:**
```python
# Get all users
users = db.query(User).all()

# Get one user by email
user = db.query(User).filter(User.email == "john@example.com").first()

# Create new user
new_user = User(email="new@example.com", name="New User")
db.add(new_user)
db.commit()
```

**Resources:**
- [SQLAlchemy Tutorial](https://docs.sqlalchemy.org/en/20/tutorial/) (Official)
- [Database Basics - YouTube](https://www.youtube.com/watch?v=HXV3zeQKqGY) (Free)

---

## 📚 Phase 4: Authentication & Security (Week 7-8)

### 4.1 What is Authentication?

**Authentication = Proving who you are**

**Flow:**
```
1. User registers → Password is hashed → Stored in database
2. User logs in → Password verified → JWT token generated
3. User makes request → JWT token sent → Server verifies token
```

---

### 4.2 Password Hashing

**Never store passwords in plain text!**

```python
# BAD ❌
password = "mypassword123"  # Anyone can read it!

# GOOD ✅
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"])

hashed = pwd_context.hash("mypassword123")
# Result: $2b$12$KIXxJ5vZxZ... (unreadable)

# Verify password
is_valid = pwd_context.verify("mypassword123", hashed)
```

---

### 4.3 JWT Tokens

**JWT = Digital ID card**

When user logs in, server gives them a JWT token. User sends this token with every request to prove identity.

```python
from jose import jwt

# Create token
token = jwt.encode(
    {"user_id": 1, "email": "user@example.com"},
    "secret-key",
    algorithm="HS256"
)

# Verify token
payload = jwt.decode(token, "secret-key", algorithms=["HS256"])
print(payload)  # {"user_id": 1, "email": "user@example.com"}
```

**Resources:**
- [JWT.io](https://jwt.io/) (Decode tokens)
- [Authentication Tutorial - YouTube](https://www.youtube.com/watch?v=UBUNrFtufWo) (Free)

---

## 📚 Phase 5: Understanding Your Backend (Week 9-10)

Now you're ready to understand your CodeCampus AI backend!

### 5.1 Start Here: Read Files in This Order

#### **Day 1-2: Configuration & Setup**
1. **`backend/requirements.txt`** - See what libraries are used
2. **`backend/.env`** - Understand environment variables
3. **`backend/app/core/config.py`** - How settings are loaded

**What to understand:**
- What is `DATABASE_URL`?
- What is `SECRET_KEY` used for?
- What is `GEMINI_API_KEY`?

---

#### **Day 3-4: Database Models**
4. **`backend/app/core/database.py`** - Database connection
5. **`backend/app/models/__init__.py`** - All database tables

**What to understand:**
- What tables exist? (User, ChatHistory, RefreshToken, etc.)
- What columns does each table have?
- How are tables related? (Foreign keys)

**Exercise:**
```python
# Draw this on paper:
User Table
├── id (Primary Key)
├── email
├── name
└── plan

ChatHistory Table
├── id (Primary Key)
├── user_id (Foreign Key → User.id)
├── role
└── content
```

---

#### **Day 5-6: Authentication**
6. **`backend/app/core/auth.py`** - Password hashing, JWT tokens
7. **`backend/app/routes/auth_routes.py`** - Login, register, Google OAuth

**What to understand:**
- How is password hashed?
- How is JWT token created?
- What happens when user logs in?

**Exercise:**
```
Trace the login flow:
1. User sends email + password
2. Backend finds user in database
3. Backend verifies password
4. Backend creates JWT token
5. Backend sends token to user
```

---

#### **Day 7-8: API Routes**
8. **`backend/app/routes/chat_routes.py`** - Chat endpoints
9. **`backend/app/routes/aptitude_routes.py`** - Aptitude test endpoints

**What to understand:**
- What does `/api/chat` endpoint do?
- What does `/api/aptitude/test` endpoint do?
- How are requests validated?

**Exercise:**
```
Pick one endpoint and trace it:
1. What URL is it?
2. What HTTP method? (GET/POST)
3. What data does it expect?
4. What does it return?
5. What database queries does it run?
```

---

#### **Day 9-10: AI Service & Middleware**
10. **`backend/app/services/ai_service.py`** - Gemini AI integration
11. **`backend/app/core/middleware.py`** - Security, rate limiting
12. **`backend/app/main.py`** - App initialization

**What to understand:**
- How does AI chat work?
- What security measures are in place?
- How is the app initialized?

---

### 5.2 Hands-On Practice

#### **Exercise 1: Add a Simple Endpoint**

Add this to `backend/app/routes/auth_routes.py`:

```python
@router.get("/hello")
def hello_world():
    return {"message": "Hello from CodeCampus AI!"}
```

Test it: http://localhost:8000/api/auth/hello

---

#### **Exercise 2: Query the Database**

Add this to `backend/app/routes/auth_routes.py`:

```python
@router.get("/count-users")
def count_users(db: Session = Depends(get_db)):
    count = db.query(User).count()
    return {"total_users": count}
```

Test it: http://localhost:8000/api/auth/count-users

---

#### **Exercise 3: Understand a Complete Flow**

**Trace the `/api/chat` endpoint:**

1. **User sends request:**
```json
POST /api/chat
{
  "messages": [{"role": "user", "content": "Hello"}]
}
```

2. **Backend receives request** (`chat_routes.py`)
```python
@router.post("/chat")
async def chat(chat_request: ChatRequest, ...):
```

3. **Backend checks authentication** (`get_current_user`)
```python
current_user: User = Depends(get_current_user)
```

4. **Backend checks daily limit** (`check_user_limit`)
```python
if user.queries_today >= 25:
    raise HTTPException(403, "Daily limit reached")
```

5. **Backend calls AI service** (`ai_service.py`)
```python
response = ai_service.chat_completion(messages)
```

6. **Backend saves to database** (`ChatHistory`)
```python
db.add(ChatHistory(user_id=user.id, content=response))
db.commit()
```

7. **Backend returns response**
```json
{
  "response": "Hello! How can I help you?"
}
```

---

## 🎯 Key Concepts to Master

### 1. **Request → Response Flow**
```
Client → FastAPI Route → Database Query → AI Service → Response → Client
```

### 2. **Dependency Injection**
```python
def my_route(db: Session = Depends(get_db), user = Depends(get_current_user)):
    # db and user are automatically provided by FastAPI
```

### 3. **Middleware**
```
Request → Middleware 1 → Middleware 2 → Route Handler → Response
```

### 4. **Database Sessions**
```python
db = SessionLocal()  # Open connection
try:
    # Do database operations
    db.commit()
finally:
    db.close()  # Always close connection
```

---

## 🛠️ Debugging Tips

### 1. **Add Print Statements**
```python
@router.post("/chat")
async def chat(chat_request: ChatRequest):
    print(f"📨 Received message: {chat_request.messages}")
    response = ai_service.chat_completion(...)
    print(f"🤖 AI response: {response}")
    return {"response": response}
```

### 2. **Use FastAPI Docs**
Visit http://localhost:8000/docs to test endpoints interactively

### 3. **Check Logs**
```bash
# Run server with logs
uvicorn app.main:app --reload --log-level debug
```

### 4. **Use Postman/Thunder Client**
Test API endpoints without writing frontend code

---

## 📖 Recommended Learning Resources

### Free Resources
1. **FastAPI Official Tutorial** - https://fastapi.tiangolo.com/tutorial/
2. **SQLAlchemy Tutorial** - https://docs.sqlalchemy.org/en/20/tutorial/
3. **Python for Beginners** - https://www.python.org/about/gettingstarted/
4. **HTTP Basics** - https://developer.mozilla.org/en-US/docs/Web/HTTP

### YouTube Channels
1. **Tech With Tim** - Python & FastAPI tutorials
2. **Corey Schafer** - Python fundamentals
3. **Traversy Media** - Web development basics
4. **freeCodeCamp** - Full courses

### Practice Platforms
1. **LeetCode** - Python practice
2. **HackerRank** - Backend challenges
3. **Postman** - API testing

---

## 🎓 Study Plan (10 Weeks)

### Week 1-2: Python Basics
- [ ] Variables, functions, classes
- [ ] Lists, dictionaries, loops
- [ ] Error handling
- [ ] Imports and modules

### Week 3-4: FastAPI
- [ ] Create first FastAPI app
- [ ] Understand routes and endpoints
- [ ] Request/response models
- [ ] Path and query parameters

### Week 5-6: Database
- [ ] SQL basics (SELECT, INSERT, UPDATE, DELETE)
- [ ] SQLAlchemy models
- [ ] Database queries
- [ ] Relationships (Foreign Keys)

### Week 7-8: Authentication
- [ ] Password hashing
- [ ] JWT tokens
- [ ] Protected routes
- [ ] OAuth (Google Sign-In)

### Week 9-10: Your Backend
- [ ] Read all files in order
- [ ] Trace request flows
- [ ] Add simple endpoints
- [ ] Modify existing features

---

## 💡 Pro Tips

1. **Don't rush** - Take time to understand each concept
2. **Code along** - Type code yourself, don't just read
3. **Break things** - Experiment and see what happens
4. **Ask questions** - Use ChatGPT, Stack Overflow, Reddit
5. **Build projects** - Create your own simple API
6. **Read documentation** - Official docs are your best friend

---

## 🚀 Next Steps After Mastering Backend

1. **Add new features** to your backend
2. **Optimize performance** (caching, indexing)
3. **Write tests** (pytest)
4. **Deploy to production** (Render, AWS, Heroku)
5. **Learn advanced topics** (WebSockets, GraphQL, Microservices)

---

## 📞 Need Help?

- **Stuck on a concept?** → Ask ChatGPT or search Stack Overflow
- **Code not working?** → Check logs, add print statements
- **Want to learn more?** → Follow the resources above

---

**Remember:** Every expert was once a beginner. Take it one step at a time! 🎯

**Good luck on your backend learning journey!** 🚀
