#!/bin/bash

echo "🧪 Running CodeCampus AI API Tests..."
echo "======================================"
echo ""

# Install pytest if not installed
pip install pytest pytest-asyncio -q

# Run tests
pytest test_endpoints.py -v --tb=short --color=yes

echo ""
echo "======================================"
echo "✅ Tests Complete!"
echo ""
echo "To run specific test class:"
echo "  pytest test_endpoints.py::TestAuthEndpoints -v"
echo ""
echo "To run specific test:"
echo "  pytest test_endpoints.py::TestAuthEndpoints::test_login_success -v"
echo ""

