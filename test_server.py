#!/usr/bin/env python
import requests

# Test basic endpoints and static files
base_url = 'http://localhost:8000'

print("Testing Django server...")

# Test main page
try:
    response = requests.get(base_url, timeout=5)
    print(f"Main page: {response.status_code}")
    if response.status_code == 200:
        print("✓ Main page loads")
    else:
        print(f"✗ Main page failed: {response.status_code}")
except Exception as e:
    print(f"✗ Main page error: {e}")

# Test admin page
try:
    response = requests.get(f"{base_url}/admin/", timeout=5)
    print(f"Admin page: {response.status_code}")
    if response.status_code == 200:
        print("✓ Admin page loads")
    else:
        print(f"✗ Admin page failed: {response.status_code}")
except Exception as e:
    print(f"✗ Admin page error: {e}")

# Test API endpoint (should return 401 without auth)
try:
    response = requests.get(f"{base_url}/api/users/me/", timeout=5)
    print(f"API /users/me: {response.status_code}")
    if response.status_code == 401:
        print("✓ API endpoint responds correctly (401 unauthorized)")
    else:
        print(f"✗ API endpoint failed: {response.status_code}")
except Exception as e:
    print(f"✗ API endpoint error: {e}")

# Test static CSS file
try:
    response = requests.get(f"{base_url}/static/assets/index-BRtdc1s2.css", timeout=5)
    print(f"CSS file: {response.status_code}, Content-Type: {response.headers.get('content-type', 'unknown')}")
    if response.status_code == 200 and 'text/css' in response.headers.get('content-type', ''):
        print("✓ CSS file served with correct MIME type")
    else:
        print(f"✗ CSS file failed or wrong MIME type: {response.status_code}, {response.headers.get('content-type')}")
except Exception as e:
    print(f"✗ CSS file error: {e}")

# Test static JS file
try:
    response = requests.get(f"{base_url}/static/assets/index-DF7M4FkH.js", timeout=5)
    print(f"JS file: {response.status_code}, Content-Type: {response.headers.get('content-type', 'unknown')}")
    if response.status_code == 200 and 'application/javascript' in response.headers.get('content-type', ''):
        print("✓ JS file served with correct MIME type")
    else:
        print(f"✗ JS file failed or wrong MIME type: {response.status_code}, {response.headers.get('content-type')}")
except Exception as e:
    print(f"✗ JS file error: {e}")

print("Testing complete.")