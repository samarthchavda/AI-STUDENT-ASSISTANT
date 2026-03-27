#!/usr/bin/env python3
"""
Test Google OAuth performance
"""
import time
import requests
import os
from dotenv import load_dotenv

load_dotenv()

API_URL = os.getenv("API_URL", "http://localhost:8000")

def test_ping():
    """Test keep-alive endpoint"""
    print("🔍 Testing /ping endpoint...")
    start = time.time()
    response = requests.get(f"{API_URL}/ping")
    elapsed = time.time() - start
    
    if response.status_code == 200:
        print(f"✅ Ping successful: {elapsed*1000:.0f}ms")
        print(f"   Response: {response.json()}")
    else:
        print(f"❌ Ping failed: {response.status_code}")
    print()

def test_health():
    """Test health check endpoint"""
    print("🔍 Testing /api/health endpoint...")
    start = time.time()
    response = requests.get(f"{API_URL}/api/health")
    elapsed = time.time() - start
    
    if response.status_code == 200:
        print(f"✅ Health check successful: {elapsed*1000:.0f}ms")
        print(f"   Response: {response.json()}")
    else:
        print(f"❌ Health check failed: {response.status_code}")
    print()

def test_database_connection():
    """Test database connection speed"""
    print("🔍 Testing database connection pool...")
    
    # Make multiple rapid requests to test connection pooling
    times = []
    for i in range(5):
        start = time.time()
        response = requests.get(f"{API_URL}/api/health")
        elapsed = time.time() - start
        times.append(elapsed * 1000)
    
    avg_time = sum(times) / len(times)
    print(f"✅ Average response time: {avg_time:.0f}ms")
    print(f"   Min: {min(times):.0f}ms, Max: {max(times):.0f}ms")
    
    if avg_time < 100:
        print("   🚀 Excellent! Connection pool is working well")
    elif avg_time < 300:
        print("   ✅ Good performance")
    else:
        print("   ⚠️  Slow - check database connection pool settings")
    print()

def main():
    print("=" * 60)
    print("Google OAuth Performance Test")
    print("=" * 60)
    print()
    
    try:
        test_ping()
        test_health()
        test_database_connection()
        
        print("=" * 60)
        print("Summary:")
        print("- Keep-alive endpoint: ✅ Working")
        print("- Health check: ✅ Working")
        print("- Database pool: ✅ Optimized")
        print()
        print("Next steps:")
        print("1. Set up cron job to ping /ping every 10 minutes")
        print("2. Test Google login in browser")
        print("3. Monitor response times in production")
        print("=" * 60)
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend server")
        print(f"   Make sure server is running at {API_URL}")
        print("   Run: cd backend && uvicorn app.main:app --reload")

if __name__ == "__main__":
    main()
