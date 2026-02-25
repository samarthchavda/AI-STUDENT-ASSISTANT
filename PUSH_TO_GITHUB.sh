#!/bin/bash

echo "🚀 Pushing CodeCampus AI to GitHub..."
echo ""

# Initialize git if not already done
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
fi

# Check if remote exists
if git remote | grep -q "origin"; then
    echo "✅ Remote 'origin' already exists"
else
    echo "🔗 Adding remote repository..."
    git remote add origin https://github.com/samarthchavda/AI-STUDENT-ASSISTANT.git
fi

# Add all files
echo "📝 Adding files..."
git add .

# Commit
echo "💾 Committing changes..."
git commit -m "Rebrand to CodeCampus AI - Placement preparation platform

Major Changes:
- Rebranded from AI Student Assistant to CodeCampus AI
- Focused on engineering students and placement preparation
- Added personalized roadmap feature description
- Added resume analyzer with ATS scoring
- Updated all branding (logo, titles, descriptions)
- Created comprehensive PROJECT_BRIEF.md
- Updated README with placement-focused features
- Modified frontend UI/UX for engineering students
- Enhanced admin panel documentation

Features:
- Personalized 3-month placement roadmaps
- Resume analyzer with ATS scoring
- Mock interviews (company-specific)
- DSA practice and coding help
- Progress tracking and analytics
- Admin panel for user management

Target Audience: Engineering students (CSE, IT, ECE, EE, Mech, Civil)
Target Roles: Frontend, Backend, Full Stack, Data Analyst, DevOps, etc.

Tech Stack: React + TypeScript, FastAPI, PostgreSQL, OpenAI/Anthropic APIs"

# Set branch to main
echo "🌿 Setting branch to main..."
git branch -M main

# Push to GitHub
echo "⬆️  Pushing to GitHub..."
git push -u origin main --force

echo ""
echo "✅ Successfully pushed to GitHub!"
echo "🔗 View at: https://github.com/samarthchavda/AI-STUDENT-ASSISTANT"
echo ""
echo "📝 Next steps:"
echo "   1. Go to your GitHub repository"
echo "   2. Update repository description"
echo "   3. Add topics: ai, placement, engineering, fastapi, react, typescript"
echo "   4. Enable GitHub Pages (optional)"
echo "   5. Add collaborators (if needed)"
