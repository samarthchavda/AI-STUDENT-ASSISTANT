#!/bin/bash

echo "🎨 Committing UI/UX Improvements..."
echo ""

git add .

git commit -m "Major UI/UX improvements - Modern design update

Frontend Enhancements:
- ✨ Added modern CSS framework with gradients and animations
- 🎨 Implemented glass morphism effects
- 🌈 Added gradient buttons with hover effects
- 📱 Improved responsive design
- ⚡ Added smooth animations (float, pulse, gradient)
- 🎯 Custom gradient scrollbar
- 💫 Modern card designs with hover effects
- 🏷️ Badge components (primary, success, warning)
- ⏳ Loading spinner animations

Page Updates:
- 🏠 HomePage: Animated hero section, gradient stats, modern features
- 🔐 AuthPage: Glass effect cards, modern inputs, better UX
- 💼 CareerPage: Enhanced upload UI, gradient buttons, modern tabs
- 🎨 Overall: Poppins font for headings, better spacing

New CSS Classes:
- btn-primary, btn-secondary (gradient buttons)
- feature-card, stat-card (modern cards)
- gradient-text (blue to purple gradient)
- glass-effect (glassmorphism)
- animate-float, animate-pulse-slow
- input-modern (modern form inputs)
- badge components

Color Scheme:
- Blue to Purple gradients
- Professional color palette
- Vibrant accent colors
- Better contrast and readability

Typography:
- Poppins for headings (modern, bold)
- Inter for body text (clean, readable)
- Better font sizes and line heights

Documentation:
- Added UI_IMPROVEMENTS.md with complete guide
- Added PDF_RESUME_UPLOAD.md
- Added DEMO_RESPONSES_UPDATE.md"

git push origin main

echo ""
echo "✅ UI improvements committed and pushed!"
echo "🎨 Your website now looks modern and professional!"
