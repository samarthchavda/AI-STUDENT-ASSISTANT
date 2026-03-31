-- Growth Features Migration for Startup
-- 1. Referral Tracking
-- 2. Transaction Logs
-- 3. User Engagement Tracking

-- ============================================================================
-- REFERRAL TRACKING
-- ============================================================================

-- Add referral columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by_code VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0;

-- Create referrals table for detailed tracking
CREATE TABLE IF NOT EXISTS referrals (
    id SERIAL PRIMARY KEY,
    referrer_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referred_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referral_code VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'completed', 'rewarded'
    reward_given BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    UNIQUE(referred_user_id)  -- Each user can only be referred once
);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_user_id);
CREATE INDEX idx_referrals_referred ON referrals(referred_user_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code);

-- ============================================================================
-- TRANSACTION LOGS (Enhanced Payments Table)
-- ============================================================================

-- Add more detailed transaction tracking columns
ALTER TABLE payments ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);  -- 'card', 'upi', 'netbanking', 'wallet'
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_gateway VARCHAR(50);  -- 'razorpay', 'stripe', 'paypal'
ALTER TABLE payments ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS billing_address TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS invoice_url TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refund_status VARCHAR(20);  -- 'none', 'partial', 'full'
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refund_amount INTEGER DEFAULT 0;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refund_date TIMESTAMP;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Create index for transaction lookups
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- ============================================================================
-- USER ENGAGEMENT TRACKING
-- ============================================================================

-- Add engagement columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS nudge_sent_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS nudge_count INTEGER DEFAULT 0;

-- Create user engagement logs table
CREATE TABLE IF NOT EXISTS user_engagement_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,  -- 'login', 'problem_solved', 'exam_taken', 'chat_sent', etc.
    action_details TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_engagement_user_id ON user_engagement_logs(user_id);
CREATE INDEX idx_engagement_action_type ON user_engagement_logs(action_type);
CREATE INDEX idx_engagement_created_at ON user_engagement_logs(created_at DESC);

-- ============================================================================
-- LEADERBOARD MANAGEMENT
-- ============================================================================

-- Add leaderboard management columns to dsa_user_stats
ALTER TABLE dsa_user_stats ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT TRUE;
ALTER TABLE dsa_user_stats ADD COLUMN IF NOT EXISTS custom_rank INTEGER;
ALTER TABLE dsa_user_stats ADD COLUMN IF NOT EXISTS rank_override BOOLEAN DEFAULT FALSE;
ALTER TABLE dsa_user_stats ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;
ALTER TABLE dsa_user_stats ADD COLUMN IF NOT EXISTS achievements TEXT;  -- JSON array

-- Create leaderboard history table for tracking rank changes
CREATE TABLE IF NOT EXISTS leaderboard_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rank INTEGER NOT NULL,
    total_solved INTEGER NOT NULL,
    accuracy INTEGER NOT NULL,
    total_score INTEGER NOT NULL,
    snapshot_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_leaderboard_history_user ON leaderboard_history(user_id);
CREATE INDEX idx_leaderboard_history_date ON leaderboard_history(snapshot_date DESC);

-- ============================================================================
-- EMAIL CAMPAIGN TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS email_campaigns (
    id SERIAL PRIMARY KEY,
    campaign_name VARCHAR(255) NOT NULL,
    campaign_type VARCHAR(50) NOT NULL,  -- 'nudge', 'promotion', 'announcement', 'welcome'
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    target_audience VARCHAR(50),  -- 'inactive', 'all', 'pro', 'free', etc.
    sent_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    sent_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS email_logs (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER REFERENCES email_campaigns(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL,  -- 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'
    sent_at TIMESTAMP DEFAULT NOW(),
    opened_at TIMESTAMP,
    clicked_at TIMESTAMP,
    error_message TEXT
);

CREATE INDEX idx_email_logs_campaign ON email_logs(campaign_id);
CREATE INDEX idx_email_logs_user ON email_logs(user_id);
CREATE INDEX idx_email_logs_status ON email_logs(status);

-- ============================================================================
-- REVENUE ANALYTICS
-- ============================================================================

CREATE TABLE IF NOT EXISTS revenue_analytics (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    total_revenue INTEGER DEFAULT 0,
    total_transactions INTEGER DEFAULT 0,
    new_pro_users INTEGER DEFAULT 0,
    new_basic_users INTEGER DEFAULT 0,
    churned_users INTEGER DEFAULT 0,
    refund_amount INTEGER DEFAULT 0,
    mrr INTEGER DEFAULT 0,  -- Monthly Recurring Revenue
    arr INTEGER DEFAULT 0,  -- Annual Recurring Revenue
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_revenue_analytics_date ON revenue_analytics(date DESC);
