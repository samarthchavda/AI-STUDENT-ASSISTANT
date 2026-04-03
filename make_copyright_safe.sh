#!/bin/bash
# Make CodeCampus AI completely copyright-safe

echo "🔒 Making CodeCampus AI Copyright-Safe..."
echo ""

# Step 1: Remove LeetCode references from AI service
echo "Step 1: Removing platform references from AI service..."
sed -i.bak 's/LeetCodeLink/ProblemReference/g' backend/app/services/ai_service.py
sed -i.bak 's/https:\/\/leetcode\.com\/problems\//CodeCampus Problem: /g' backend/app/services/ai_service.py
sed -i.bak 's/LeetCode-style/interview-style/g' backend/app/services/ai_service.py
sed -i.bak 's/LeetCode/coding platform/g' backend/app/services/ai_service.py
sed -i.bak 's/HackerRank/coding platform/g' backend/app/services/ai_service.py
sed -i.bak 's/GeeksforGeeks/coding platform/g' backend/app/services/ai_service.py

# Step 2: Update documentation
echo "Step 2: Updating documentation..."
sed -i.bak 's/rivals LeetCode, HackerRank, and CodeChef/provides comprehensive coding practice/g' DSA_MODULE_COMPLETE.md
sed -i.bak 's/LeetCode/external platforms/g' *.md

# Step 3: Update backend scripts
echo "Step 3: Cleaning backend scripts..."
sed -i.bak 's/LeetCode-style/interview-style/g' backend/scripts/*.py 2>/dev/null || true

# Step 4: Update models
echo "Step 4: Updating database models..."
sed -i.bak 's/LeetCode IDs or references/Problem references/g' backend/app/models/__init__.py

echo ""
echo "✅ Copyright cleanup complete!"
echo ""
echo "Next steps:"
echo "1. Review changes in .bak files"
echo "2. Test the application"
echo "3. Commit changes"
