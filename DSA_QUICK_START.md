# DSA Module - Quick Start Guide

## 🚀 Start Using the DSA Module

### For Students:

#### 1. Practice Problems
```
Navigate to: /dsa
- Browse 10+ DSA problems
- Filter by difficulty (Easy/Medium/Hard)
- Filter by topic (Arrays, Strings, DP, etc.)
- See your solved/attempted status
```

#### 2. Solve a Problem
```
Click any problem → /dsa/problem/:slug
- Read problem statement
- Write code in Python/JavaScript/C++
- Use AI tools:
  • Get Hint - Subtle guidance
  • Explain Problem - Simplified explanation
  • Generate Solution - Full solution
  • Explain My Code - Code analysis
  • Fix My Code - Debug assistance
- Run code (test against visible cases)
- Submit code (test against all cases)
- View submission history
```

#### 3. Track Progress
```
Navigate to: /dsa/dashboard
- View your score and rank
- Check current streak
- See solved count by difficulty
- Review recent activity
- Monitor topic progress
```

#### 4. Compete
```
Navigate to: /dsa/leaderboard
- See your global rank
- View top performers
- Filter by time period
- Compare stats with others
```

---

### For Admins:

#### Monitor DSA Usage
```
Navigate to: /admin/dsa-analytics

DSA Stats Tab:
- Total submissions
- Acceptance rate
- Active users
- Most attempted questions
- Most solved questions
- Topic usage
- Difficulty success rates
- Top performers

AI Usage Tab:
- Total AI requests
- Breakdown by action type
- AI usage by question
- Top AI users
- Most common AI action
```

---

## 📊 Key Metrics Explained

### Score System:
- Easy problem solved = 1 point
- Medium problem solved = 2 points
- Hard problem solved = 3 points
- Points awarded only on first solve

### Streak System:
- Solve a problem today → Streak continues
- Solve on consecutive days → Streak increments
- Miss a day → Streak resets to 0
- Longest streak is saved

### Leaderboard Ranking:
1. Highest score wins
2. If tied, most problems solved wins
3. If still tied, longest streak wins

---

## 🎯 Quick Actions

### Student Actions:
| Action | Location | Result |
|--------|----------|--------|
| Browse problems | `/dsa` | See all questions |
| Solve problem | `/dsa/problem/:slug` | Write & submit code |
| Get AI hint | Problem page → AI tools | Receive guidance |
| View dashboard | `/dsa/dashboard` | See your stats |
| Check leaderboard | `/dsa/leaderboard` | See rankings |

### Admin Actions:
| Action | Location | Result |
|--------|----------|--------|
| View DSA stats | `/admin/dsa-analytics` | See usage metrics |
| Check AI usage | `/admin/dsa-analytics` → AI tab | See AI patterns |
| Monitor users | Admin analytics | Track engagement |

---

## 🔧 Technical Setup

### Backend Already Running:
- FastAPI server on port 8000
- PostgreSQL database connected
- All migrations applied
- Routes integrated

### Frontend Already Running:
- React app on port 5173
- All pages created
- Routes configured
- Services connected

### Database Tables:
- `dsa_submissions` - All submissions
- `dsa_user_progress` - User progress
- `dsa_ai_usage` - AI usage logs

---

## 📱 Navigation Map

```
Home (/)
  └─ Dashboard (/dashboard)
      └─ DSA Section
          ├─ Practice (/dsa)
          │   ├─ Dashboard button → /dsa/dashboard
          │   ├─ Leaderboard button → /dsa/leaderboard
          │   └─ Problem click → /dsa/problem/:slug
          │
          ├─ Dashboard (/dsa/dashboard)
          │   ├─ Practice button → /dsa
          │   └─ Leaderboard button → /dsa/leaderboard
          │
          └─ Leaderboard (/dsa/leaderboard)
              └─ Dashboard button → /dsa/dashboard

Admin Panel (/admin)
  └─ DSA Analytics (/admin/dsa-analytics)
      ├─ DSA Stats tab
      └─ AI Usage tab
```

---

## 🎨 UI Components

### Question List Page:
- Search bar
- Topic filter dropdown
- Difficulty filter dropdown
- Status filter (All/Solved/Unsolved)
- Progress summary cards
- Question table with status icons

### Problem Page:
- Problem statement (left)
- Code editor (right)
- Language selector
- Run button (visible tests)
- Submit button (all tests)
- AI tools section (5 buttons)
- History button
- Result panel (bottom)

### Dashboard Page:
- 4 metric cards (Score, Streak, Solved, Acceptance)
- Difficulty progress bars
- Activity stats grid
- Recently solved list
- Topic progress list

### Leaderboard Page:
- Period filter (All/Month/Week)
- Your rank card
- Top 3 podium
- Full rankings table

### Admin Analytics:
- Tab switcher (DSA/AI)
- Key metrics cards
- Charts and tables
- Top lists

---

## 💡 Tips for Students

### Maximize Your Score:
1. Start with Easy problems (quick points)
2. Move to Medium (better points)
3. Challenge yourself with Hard (best points)

### Build Your Streak:
1. Solve at least one problem daily
2. Set a reminder
3. Track your longest streak
4. Don't break the chain!

### Use AI Wisely:
1. Try solving first
2. Use hints when stuck
3. Learn from explanations
4. Understand generated solutions
5. Don't just copy-paste

### Climb the Leaderboard:
1. Solve more problems
2. Maintain your streak
3. Focus on harder problems
4. Practice consistently

---

## 🐛 Troubleshooting

### Problem: Code won't run
- Check syntax errors
- Verify language selection
- Ensure code compiles
- Try "Explain My Code" AI tool

### Problem: Tests failing
- Read test cases carefully
- Check edge cases
- Use "Fix My Code" AI tool
- Review problem constraints

### Problem: Streak not updating
- Ensure submission was accepted
- Check if it's a new day
- Verify problem was solved (not just attempted)

### Problem: Rank not showing
- Solve at least one problem
- Wait for leaderboard refresh
- Check if you're logged in

---

## 📞 Support

### For Technical Issues:
- Check browser console
- Verify network connection
- Clear cache and reload
- Contact admin

### For Feature Requests:
- Use feedback form
- Contact support
- Suggest improvements

---

## 🎉 Get Started Now!

1. **Login** to CodeCampus AI
2. **Navigate** to `/dsa`
3. **Pick** a problem (start with Easy)
4. **Solve** it (use AI if needed)
5. **Submit** your solution
6. **Check** your dashboard
7. **Compete** on the leaderboard!

---

**Happy Coding! 🚀**

Your journey to DSA mastery starts here. Practice daily, maintain your streak, and climb the leaderboard!
