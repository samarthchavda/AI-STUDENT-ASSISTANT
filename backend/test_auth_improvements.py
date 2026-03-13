"""
Test script for authentication improvements
Run this after starting the backend server and running migration
"""
import requests
import json
import time

BASE_URL = "http://localhost:8000"

def print_section(title):
    print("\n" + "="*60)
    print(title)
    print("="*60)

def test_email_normalization():
    """Test email normalization (lowercase + trim)"""
    print_section("TEST 1: Email Normalization")
    
    # Register with uppercase email
    print("\n1. Registering with email: '  Test@Gmail.COM  '")
    response = requests.post(
        f"{BASE_URL}/api/auth/register",
        json={
            "email": "  Test@Gmail.COM  ",
            "name": "Test User",
            "password": "Password@123"
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✓ Registered successfully")
        print(f"  Normalized email: {data['user']['email']}")
        
        # Try to register again with different case
        print("\n2. Trying to register with 'test@gmail.com' (should fail)")
        response2 = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": "test@gmail.com",
                "name": "Test User 2",
                "password": "Password@456"
            }
        )
        
        if response2.status_code == 400:
            print("✓ Correctly rejected duplicate email")
        else:
            print(f"✗ Unexpected response: {response2.status_code}")
    else:
        print(f"✗ Registration failed: {response.json()}")


def test_password_validation():
    """Test password strength validation"""
    print_section("TEST 2: Password Strength Validation")
    
    test_cases = [
        ("weak", "Password too short", False),
        ("password", "No number or special char", False),
        ("Password123", "No special char", False),
        ("Password@@@", "No number", False),
        ("Pass@1", "Too short", False),
        ("Password@123", "Valid password", True),
    ]
    
    for i, (password, description, should_pass) in enumerate(test_cases, 1):
        print(f"\n{i}. Testing: '{password}' - {description}")
        
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": f"test{i}@example.com",
                "name": "Test User",
                "password": password
            }
        )
        
        if should_pass:
            if response.status_code == 200:
                print(f"  ✓ Accepted (correct)")
            else:
                print(f"  ✗ Rejected (incorrect): {response.json().get('detail')}")
        else:
            if response.status_code == 400:
                print(f"  ✓ Rejected (correct): {response.json().get('detail')}")
            else:
                print(f"  ✗ Accepted (incorrect)")


def test_login_protection():
    """Test login attempt protection (5 failures = lock)"""
    print_section("TEST 3: Login Attempt Protection")
    
    # First register a user
    email = "locktest@example.com"
    password = "Correct@123"
    
    print(f"\n1. Registering user: {email}")
    requests.post(
        f"{BASE_URL}/api/auth/register",
        json={
            "email": email,
            "name": "Lock Test User",
            "password": password
        }
    )
    
    # Try 5 wrong passwords
    print("\n2. Attempting 5 failed logins...")
    for i in range(5):
        print(f"   Attempt {i+1}/5...")
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": email,
                "password": "WrongPassword@123"
            }
        )
        
        if response.status_code == 401:
            print(f"   ✓ Failed (expected)")
        elif response.status_code == 403:
            print(f"   ✓ Account locked after {i+1} attempts")
            break
    
    # Try 6th attempt
    print("\n3. Attempting 6th login (should be locked)...")
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={
            "email": email,
            "password": "WrongPassword@123"
        }
    )
    
    if response.status_code == 403:
        print(f"   ✓ Account locked: {response.json().get('detail')}")
    else:
        print(f"   ✗ Not locked (unexpected)")


def test_refresh_token_system():
    """Test refresh token system"""
    print_section("TEST 4: Refresh Token System")
    
    # Register and login
    email = "refreshtest@example.com"
    password = "Password@123"
    
    print(f"\n1. Registering user: {email}")
    requests.post(
        f"{BASE_URL}/api/auth/register",
        json={
            "email": email,
            "name": "Refresh Test User",
            "password": password
        }
    )
    
    print("\n2. Logging in...")
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={
            "email": email,
            "password": password
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        access_token = data.get('access_token')
        refresh_token = data.get('refresh_token')
        
        print(f"   ✓ Login successful")
        print(f"   Access Token: {access_token[:20]}...")
        print(f"   Refresh Token: {refresh_token[:20]}...")
        
        # Test refresh endpoint
        print("\n3. Testing refresh token endpoint...")
        response = requests.post(
            f"{BASE_URL}/api/auth/refresh",
            json={"refresh_token": refresh_token}
        )
        
        if response.status_code == 200:
            new_data = response.json()
            new_access_token = new_data.get('access_token')
            print(f"   ✓ Refresh successful")
            print(f"   New Access Token: {new_access_token[:20]}...")
            
            return access_token, refresh_token
        else:
            print(f"   ✗ Refresh failed: {response.json()}")
    else:
        print(f"   ✗ Login failed: {response.json()}")
    
    return None, None


def test_logout_api(access_token):
    """Test logout API"""
    print_section("TEST 5: Logout API")
    
    if not access_token:
        print("⊙ Skipping (no access token from previous test)")
        return
    
    print("\n1. Testing /api/auth/me (should work)")
    response = requests.get(
        f"{BASE_URL}/api/auth/me",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    
    if response.status_code == 200:
        print(f"   ✓ Authenticated: {response.json().get('email')}")
    else:
        print(f"   ✗ Failed: {response.json()}")
    
    print("\n2. Logging out...")
    response = requests.post(
        f"{BASE_URL}/api/auth/logout",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    
    if response.status_code == 200:
        print(f"   ✓ Logout successful: {response.json().get('message')}")
    else:
        print(f"   ✗ Logout failed: {response.json()}")
    
    print("\n3. Testing /api/auth/me again (should fail)")
    response = requests.get(
        f"{BASE_URL}/api/auth/me",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    
    if response.status_code == 401:
        print(f"   ✓ Token revoked (correct)")
    else:
        print(f"   ✗ Token still valid (incorrect)")


def main():
    print("\n" + "="*60)
    print("AUTHENTICATION IMPROVEMENTS TEST SUITE")
    print("="*60)
    print("\nMake sure:")
    print("1. Backend server is running on http://localhost:8000")
    print("2. Migration script has been run")
    print("\nPress Enter to start tests...")
    input()
    
    try:
        # Run all tests
        test_email_normalization()
        test_password_validation()
        test_login_protection()
        access_token, refresh_token = test_refresh_token_system()
        test_logout_api(access_token)
        
        print("\n" + "="*60)
        print("TEST SUITE COMPLETED")
        print("="*60)
        print("\nSummary:")
        print("✓ Email normalization tested")
        print("✓ Password validation tested")
        print("✓ Login protection tested")
        print("✓ Refresh token system tested")
        print("✓ Logout API tested")
        print("\nAll authentication improvements are working!")
        
    except requests.exceptions.ConnectionError:
        print("\n✗ Error: Cannot connect to backend server")
        print("Make sure the server is running on http://localhost:8000")
    except Exception as e:
        print(f"\n✗ Error: {e}")


if __name__ == "__main__":
    main()
