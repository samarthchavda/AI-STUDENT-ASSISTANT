"""
Manual test script to verify resume tracking works
Run this after logging in as a user to test tracking
"""
import requests
import json

# Configuration
BASE_URL = "http://localhost:8000"
# Get this token by logging in and copying from browser localStorage
TOKEN = input("Enter your JWT token (from localStorage): ").strip()

if not TOKEN:
    print("❌ Token required. Login first and copy token from browser.")
    exit(1)

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

print("\n🧪 Testing Resume Tracking Endpoints...")
print("=" * 50)

# Test 1: Track resume activity
print("\n✓ Test 1: Track Resume Activity")
print("-" * 50)

resume_data = {
    "template_id": "ats-clean",
    "template_name": "ATS Clean",
    "template_tier": "free",
    "ats_score": 85,
    "ai_generated": True,
    "resume_data": {
        "name": "Test User",
        "email": "test@example.com",
        "skills": ["Python", "JavaScript", "React"]
    }
}

response = requests.post(
    f"{BASE_URL}/api/career/resume-track",
    headers=headers,
    json=resume_data
)

print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")

if response.status_code == 200:
    print("✅ Resume tracking works!")
else:
    print("❌ Resume tracking failed!")
    exit(1)

# Test 2: Track PDF export
print("\n✓ Test 2: Track PDF Export")
print("-" * 50)

export_data = {
    "template_id": "ats-clean"
}

response = requests.post(
    f"{BASE_URL}/api/career/resume-track-export",
    headers=headers,
    json=export_data
)

print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")

if response.status_code == 200:
    print("✅ PDF export tracking works!")
else:
    print("❌ PDF export tracking failed!")

# Test 3: Verify data in database
print("\n✓ Test 3: Check Admin Endpoints")
print("-" * 50)

# Check if user is admin
response = requests.get(
    f"{BASE_URL}/api/admin/user-resumes",
    headers=headers
)

if response.status_code == 200:
    data = response.json()
    print(f"✅ Found {len(data.get('resumes', []))} resumes in admin panel")
    if len(data.get('resumes', [])) > 0:
        print(f"Latest resume: {data['resumes'][0]}")
elif response.status_code == 403:
    print("⚠️  You're not an admin. Login as admin to see tracked data.")
else:
    print(f"❌ Admin endpoint failed: {response.status_code}")

print("\n" + "=" * 50)
print("✅ Tracking test complete!")
print("\nNext steps:")
print("1. Login as admin user")
print("2. Go to http://localhost:5173/admin/user-resumes")
print("3. You should see the tracked resume")
print("4. Go to http://localhost:5173/admin/resume-analytics")
print("5. Check PDF export count")
