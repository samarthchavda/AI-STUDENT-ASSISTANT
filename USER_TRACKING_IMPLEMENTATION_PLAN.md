# 📊 User Tracking Features - Implementation Plan

## Overview
This document outlines the step-by-step implementation plan for adding comprehensive user tracking features to the admin panel.

---

## ✅ Already Implemented Features

1. **User Sessions** - Real-time online/offline status
2. **Audit Logs** - Admin action tracking
3. **Chat History** - User conversation logs
4. **Aptitude Exam History** - Exam attempts and scores
5. **Subscription Tracking** - Payment and plan history
6. **User Progress** - Learning progress tracking
7. **AI Usage Analytics** - Token usage and costs
8. **Broadcast Campaigns** - Notification delivery stats
9. **Company Questions** - Question bank statistics
10. **DSA Submissions** - Code submission tracking

---

## 🎯 Features to Implement (Priority Order)

### Phase 1: Core Analytics (Week 1)

#### Feature 1: ⏱️ Time Tracking Dashboard
**Status:** 🔴 Not Started

**What to Track:**
- Daily active time per user
- Session duration
- Time spent on each page/feature
- Peak usage hours
- Average session length

**Database Tables:**
```sql
CREATE TABLE user_activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    page_url VARCHAR(500),
    feature_name VARCHAR(100),
    action_type VARCHAR(50), -- page_view, feature_use, button_click
    duration_seconds INTEGER,
    session_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_activity_user_id ON user_activity_logs(user_id);
CREATE INDEX idx_user_activity_created_at ON user_activity_logs(created_at);
```

**Backend Endpoints:**
- `POST /api/tracking/activity` - Log user activity
- `GET /api/admin/time-tracking/summary` - Get time tracking summary
- `GET /api/admin/time-tracking/user/{user_id}` - Get user-specific time data
- `GET /api/admin/time-tracking/peak-hours` - Get peak usage hours

**Frontend Components:**
- Time Tracking Dashboard Card
- Daily Active Time Chart
- Peak Hours Heatmap
- Session Duration Distribution
- User-wise Time Breakdown Table

**Admin UI Design:**
```
┌─────────────────────────────────────────────────────────┐
│  ⏱️  Time Tracking Dashboard                            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  📊 Summary Cards (Row 1)                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Avg Time │ │ Total    │ │ Active   │ │ Peak     │  │
│  │ 45 min   │ │ 1,234 hr │ │ 156 users│ │ 6-8 PM   │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                          │
│  📈 Charts (Row 2)                                      │
│  ┌────────────────────┐ ┌────────────────────┐         │
│  │ Daily Active Time  │ │ Peak Hours Heatmap │         │
│  │ (Line Chart)       │ │ (24-hour grid)     │         │
│  └────────────────────┘ └────────────────────┘         │
│                                                          │
│  📋 User Table (Row 3)                                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ User | Today | This Week | Avg Session | Status │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ ...  | ...   | ...       | ...         | ...    │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

#### Feature 2: 🎓 Learning Behavior Analytics
**Status:** 🔴 Not Started

**What to Track:**
- Most practiced topics
- Difficulty preference
- Favorite companies
- Study patterns (time of day)
- Topic switching frequency

**Database Tables:**
```sql
CREATE TABLE learning_behavior_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    topic VARCHAR(100),
    category VARCHAR(100),
    difficulty VARCHAR(20),
    company VARCHAR(100),
    action_type VARCHAR(50), -- start_practice, complete_question, skip_question
    time_of_day VARCHAR(20), -- morning, afternoon, evening, night
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_learning_behavior_user_id ON learning_behavior_logs(user_id);
```

**Backend Endpoints:**
- `POST /api/tracking/learning-behavior` - Log learning activity
- `GET /api/admin/learning-behavior/summary` - Get behavior summary
- `GET /api/admin/learning-behavior/user/{user_id}` - User-specific behavior
- `GET /api/admin/learning-behavior/trends` - Learning trends

**Frontend Components:**
- Learning Behavior Dashboard
- Topic Preference Chart (Pie/Donut)
- Difficulty Distribution Chart
- Study Time Heatmap
- Company Preference Bar Chart

**Admin UI Design:**
```
┌─────────────────────────────────────────────────────────┐
│  🎓 Learning Behavior Analytics                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  📊 Top Metrics (Row 1)                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Most     │ │ Preferred│ │ Top      │ │ Peak     │  │
│  │ Practiced│ │ Difficulty│ │ Company  │ │ Study    │  │
│  │ SQL      │ │ Medium   │ │ TCS      │ │ Evening  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                          │
│  📈 Charts (Row 2)                                      │
│  ┌────────────────────┐ ┌────────────────────┐         │
│  │ Topic Distribution │ │ Study Time Pattern │         │
│  │ (Donut Chart)      │ │ (Heatmap)          │         │
│  └────────────────────┘ └────────────────────┘         │
│                                                          │
│  📋 User Preferences Table (Row 3)                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │ User | Top Topic | Difficulty | Fav Company     │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

#### Feature 3: 📈 Performance Trends
**Status:** 🔴 Not Started

**What to Track:**
- Score improvement over time
- Weak areas identification
- Strong topics
- Progress graphs
- Accuracy trends

**Database Tables:**
```sql
CREATE TABLE performance_trends (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    topic VARCHAR(100),
    category VARCHAR(100),
    difficulty VARCHAR(20),
    score_percent DECIMAL(5,2),
    accuracy_percent DECIMAL(5,2),
    time_taken_seconds INTEGER,
    questions_attempted INTEGER,
    questions_correct INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_performance_trends_user_id ON performance_trends(user_id);
CREATE INDEX idx_performance_trends_created_at ON performance_trends(created_at);
```

**Backend Endpoints:**
- `POST /api/tracking/performance` - Log performance data
- `GET /api/admin/performance/trends` - Get performance trends
- `GET /api/admin/performance/user/{user_id}` - User performance history
- `GET /api/admin/performance/weak-areas` - Identify weak areas
- `GET /api/admin/performance/improvements` - Top improvers

**Frontend Components:**
- Performance Trends Dashboard
- Score Improvement Line Chart
- Weak Areas Heatmap
- Strong Topics Bar Chart
- Accuracy Trends Chart
- Top Improvers Leaderboard

**Admin UI Design:**
```
┌─────────────────────────────────────────────────────────┐
│  📈 Performance Trends Analytics                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  📊 Overview (Row 1)                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Avg Score│ │ Top      │ │ Most     │ │ Accuracy │  │
│  │ +12%     │ │ Improver │ │ Improved │ │ 78%      │  │
│  │ This Week│ │ John Doe │ │ SQL      │ │ Overall  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                          │
│  📈 Charts (Row 2)                                      │
│  ┌────────────────────┐ ┌────────────────────┐         │
│  │ Score Improvement  │ │ Weak Areas Heatmap │         │
│  │ (Line Chart)       │ │ (Grid)             │         │
│  └────────────────────┘ └────────────────────┘         │
│                                                          │
│  🏆 Top Improvers (Row 3)                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Rank | User | Improvement | From | To | Topic   │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

### Phase 2: Engagement & Retention (Week 2)

#### Feature 4: 🔄 Engagement Metrics
**Status:** 🔴 Not Started

**What to Track:**
- Daily/Weekly/Monthly active users (DAU/WAU/MAU)
- Retention rate (7-day, 30-day)
- Churn prediction
- Feature adoption rate
- Stickiness ratio (DAU/MAU)

**Database Tables:**
```sql
CREATE TABLE engagement_metrics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    metric_date DATE,
    is_active_daily BOOLEAN DEFAULT FALSE,
    is_active_weekly BOOLEAN DEFAULT FALSE,
    is_active_monthly BOOLEAN DEFAULT FALSE,
    features_used TEXT[], -- Array of feature names
    session_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_engagement_metrics_user_id ON engagement_metrics(user_id);
CREATE INDEX idx_engagement_metrics_date ON engagement_metrics(metric_date);
```

**Backend Endpoints:**
- `GET /api/admin/engagement/dau-wau-mau` - Get DAU/WAU/MAU
- `GET /api/admin/engagement/retention` - Get retention rates
- `GET /api/admin/engagement/churn-risk` - Get churn risk users
- `GET /api/admin/engagement/feature-adoption` - Feature adoption rates
- `GET /api/admin/engagement/stickiness` - Stickiness ratio

**Frontend Components:**
- Engagement Dashboard
- DAU/WAU/MAU Line Chart
- Retention Cohort Table
- Churn Risk Users List
- Feature Adoption Funnel
- Stickiness Gauge

---

#### Feature 5: 💡 Feature Usage Analytics
**Status:** 🔴 Not Started

**What to Track:**
- Most used features
- Least used features
- Feature-wise time spent
- New feature adoption
- Feature drop-off points

**Database Tables:**
```sql
CREATE TABLE feature_usage_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    feature_name VARCHAR(100),
    feature_category VARCHAR(50), -- practice, exam, ai-chat, resume, etc.
    action_type VARCHAR(50), -- open, use, complete, abandon
    duration_seconds INTEGER,
    success BOOLEAN,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_feature_usage_user_id ON feature_usage_logs(user_id);
CREATE INDEX idx_feature_usage_feature ON feature_usage_logs(feature_name);
```

---

### Phase 3: Advanced Analytics (Week 3)

#### Feature 6: 📱 Device & Browser Analytics
#### Feature 7: 🎯 Goal Tracking
#### Feature 8: 🔔 Notification Engagement
#### Feature 9: 💰 Revenue Analytics
#### Feature 10: 🤝 Referral Tracking

---

### Phase 4: Intelligence & Insights (Week 4)

#### Feature 11: 📊 Cohort Analysis
#### Feature 12: 🎮 Gamification Metrics
#### Feature 13: 🔍 Search & Filter Usage
#### Feature 14: 🚫 Error Tracking
#### Feature 15: 📍 User Journey Mapping

---

## 🎨 Design Principles

### Admin Dashboard Layout
```
┌─────────────────────────────────────────────────────────┐
│  Header: CodeCampus Admin                               │
├──────────┬──────────────────────────────────────────────┤
│          │                                               │
│ Sidebar  │  Main Content Area                           │
│          │                                               │
│ • Stats  │  ┌─────────────────────────────────────┐    │
│ • Users  │  │ Feature Dashboard                   │    │
│ • Track  │  │                                     │    │
│   - Time │  │ Summary Cards                       │    │
│   - Learn│  │ Charts & Graphs                     │    │
│   - Perf │  │ Data Tables                         │    │
│   - Engage│ │                                     │    │
│ • Content│  └─────────────────────────────────────┘    │
│          │                                               │
└──────────┴──────────────────────────────────────────────┘
```

### Color Scheme
- **Primary:** Blue (#3B82F6)
- **Success:** Green (#10B981)
- **Warning:** Yellow (#F59E0B)
- **Danger:** Red (#EF4444)
- **Info:** Purple (#8B5CF6)
- **Neutral:** Gray (#6B7280)

### Component Standards
- **Cards:** Rounded corners (rounded-2xl), shadow-sm, border
- **Charts:** Recharts library, responsive, tooltips
- **Tables:** Sortable, filterable, paginated
- **Buttons:** Gradient backgrounds, hover effects
- **Icons:** Lucide React icons

---

## 🚀 Implementation Steps

### For Each Feature:

1. **Database Migration**
   - Create migration file
   - Add indexes
   - Test migration

2. **Backend API**
   - Create routes
   - Add validation
   - Write tests
   - Document endpoints

3. **Frontend Tracking**
   - Add tracking hooks
   - Implement event logging
   - Test data collection

4. **Admin Dashboard**
   - Create dashboard component
   - Add charts and visualizations
   - Implement filters
   - Add export functionality

5. **Testing**
   - Unit tests
   - Integration tests
   - UI tests
   - Performance tests

6. **Documentation**
   - Update API docs
   - Add user guide
   - Create admin manual

---

## 📝 Notes

- All tracking should be GDPR compliant
- Add opt-out mechanism for users
- Implement data retention policies
- Use background jobs for heavy analytics
- Cache frequently accessed data
- Add rate limiting to tracking endpoints

---

## ✅ Completion Checklist

- [ ] Phase 1: Core Analytics (3 features)
- [ ] Phase 2: Engagement & Retention (2 features)
- [ ] Phase 3: Advanced Analytics (5 features)
- [ ] Phase 4: Intelligence & Insights (5 features)
- [ ] Documentation complete
- [ ] Tests passing
- [ ] Performance optimized
- [ ] Security reviewed
- [ ] Deployed to production

---

**Last Updated:** December 2024
**Status:** Planning Phase
**Next Action:** Start with Feature 1 - Time Tracking Dashboard
