# 🧪 Testing Guide

## What Are Automated Tests?

Tests automatically check if your API works correctly. Instead of manually testing each feature, tests do it for you in seconds!

---

## 🚀 Quick Start

### 1. Install Test Dependencies

```bash
cd backend
pip install pytest pytest-asyncio
```

### 2. Run All Tests

**Linux/Mac:**
```bash
chmod +x run_tests.sh
./run_tests.sh
```

**Windows:**
```bash
run_tests.bat
```

**Or directly:**
```bash
pytest test_endpoints.py -v
```

---

## 📊 Test Coverage

### ✅ Tests Included:

#### 1. Health Endpoints (2 tests)
- ✅ Root endpoint returns API info
- ✅ Health check endpoint works

#### 2. Authentication (5 tests)
- ✅ User registration works
- ✅ Duplicate email rejected
- ✅ Login with correct credentials
- ✅ Login with wrong password fails
- ✅ Login with non-existent user fails

#### 3. Chat Endpoints (4 tests)
- ✅ Chat requires authentication
- ✅ Chat works with authentication
- ✅ Get chat history
- ✅ Clear chat history

#### 4. Exam Endpoints (3 tests)
- ✅ Mock test generation
- ✅ Previous year question solving
- ✅ Study plan generation

#### 5. Coding Endpoints (3 tests)
- ✅ Code explanation
- ✅ DSA problem hints
- ✅ Project guidance

#### 6. Career Endpoints (2 tests)
- ✅ Resume analysis
- ✅ Interview preparation

#### 7. Rate Limiting (1 test)
- ✅ Rate limit enforced on login

#### 8. Security Headers (1 test)
- ✅ Security headers present

#### 9. Error Handling (3 tests)
- ✅ 404 for invalid endpoints
- ✅ Invalid JSON handled
- ✅ Missing fields handled

**Total: 24 automated tests** ✅

---

## 📖 Understanding Test Output

### Successful Test:
```
test_endpoints.py::TestAuthEndpoints::test_login_success PASSED [100%]
```
✅ Green = Test passed

### Failed Test:
```
test_endpoints.py::TestAuthEndpoints::test_login_success FAILED [100%]
AssertionError: assert 401 == 200
```
❌ Red = Test failed (shows what went wrong)

### Example Output:
```
🧪 Running CodeCampus AI API Tests...
======================================

test_endpoints.py::TestHealthEndpoints::test_root_endpoint PASSED
test_endpoints.py::TestHealthEndpoints::test_health_check PASSED
test_endpoints.py::TestAuthEndpoints::test_register_new_user PASSED
test_endpoints.py::TestAuthEndpoints::test_login_success PASSED
...

====================================== 24 passed in 5.23s ======================================
✅ Tests Complete!
```

---

## 🎯 Running Specific Tests

### Run One Test Class:
```bash
pytest test_endpoints.py::TestAuthEndpoints -v
```

### Run One Specific Test:
```bash
pytest test_endpoints.py::TestAuthEndpoints::test_login_success -v
```

### Run Tests Matching Pattern:
```bash
pytest test_endpoints.py -k "auth" -v
```

### Run with More Details:
```bash
pytest test_endpoints.py -v --tb=long
```

---

## 🔧 Before Running Tests

### 1. Make Sure Backend is NOT Running
```bash
# Stop backend if running
# Tests will start their own test server
```

### 2. Database Should Be Set Up
```bash
# Tests use your configured database
# Make sure DATABASE_URL is set in .env
```

### 3. API Keys Should Be Set
```bash
# Tests need GEMINI_API_KEY in .env
# Otherwise some tests will use demo mode
```

---

## 🐛 Troubleshooting

### Issue: "ModuleNotFoundError: No module named 'pytest'"
**Solution:**
```bash
pip install pytest pytest-asyncio
```

### Issue: "Database connection failed"
**Solution:**
```bash
# Check DATABASE_URL in .env
# Make sure PostgreSQL is running
```

### Issue: "Rate limit exceeded"
**Solution:**
```bash
# Wait 1 minute and run tests again
# Or temporarily increase rate limits
```

### Issue: Tests fail with "401 Unauthorized"
**Solution:**
```bash
# Check if SECRET_KEY is set in .env
# Make sure auth endpoints are working
```

---

## 📝 Adding New Tests

### Example: Test New Endpoint

```python
class TestNewFeature:
    """Test new feature endpoints"""
    
    def test_new_endpoint(self):
        """Test description"""
        headers = {"Authorization": f"Bearer {user_token}"}
        response = client.post("/api/new-endpoint",
            json={"data": "test"},
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "result" in data
```

---

## 🎯 When to Run Tests

### Before Committing Code:
```bash
pytest test_endpoints.py -v
```

### Before Deploying:
```bash
pytest test_endpoints.py -v
# Make sure all tests pass!
```

### After Adding New Feature:
```bash
# Add test for new feature
# Run all tests to make sure nothing broke
pytest test_endpoints.py -v
```

### Daily (Optional):
```bash
# Run tests daily to catch issues early
pytest test_endpoints.py -v
```

---

## 📊 Test Statistics

After running tests, you'll see:
```
====================================== 24 passed in 5.23s ======================================
```

- **24 passed** = All tests successful ✅
- **5.23s** = Time taken
- **0 failed** = No errors ✅

---

## 🚀 CI/CD Integration (Advanced)

### GitHub Actions (Automatic Testing):

Create `.github/workflows/test.yml`:
```yaml
name: Run Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.9
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      - name: Run tests
        run: |
          cd backend
          pytest test_endpoints.py -v
```

Now tests run automatically on every push! 🎉

---

## ✅ Test Checklist

Before deploying to production:

- [ ] All tests pass locally
- [ ] No failed tests
- [ ] No skipped tests
- [ ] Tests run in under 10 seconds
- [ ] New features have tests
- [ ] Security tests pass
- [ ] Rate limiting tests pass
- [ ] Error handling tests pass

---

## 📞 Need Help?

**Test failing?**
1. Read the error message carefully
2. Check which assertion failed
3. Fix the code
4. Run test again

**All tests failing?**
1. Check database connection
2. Check .env file
3. Check backend dependencies installed
4. Try running backend manually first

---

**Happy Testing!** 🧪✅

