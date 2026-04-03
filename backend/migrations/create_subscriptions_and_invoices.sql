-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_name VARCHAR(50) NOT NULL,
    billing_cycle VARCHAR(20) NOT NULL, -- 'monthly', 'yearly', 'lifetime'
    source VARCHAR(50) DEFAULT 'payment', -- 'payment', 'admin_grant', 'promo', 'free'
    amount_paid INTEGER DEFAULT 0, -- in paise
    currency VARCHAR(10) DEFAULT 'INR',
    razorpay_payment_id VARCHAR(255),
    razorpay_order_id VARCHAR(255),
    razorpay_subscription_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'expired', 'cancelled'
    starts_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id INTEGER REFERENCES subscriptions(id) ON DELETE SET NULL,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    plan_name VARCHAR(50) NOT NULL,
    billing_cycle VARCHAR(20) NOT NULL,
    amount_paid INTEGER NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    payment_id VARCHAR(255),
    order_id VARCHAR(255),
    validity_period VARCHAR(100),
    invoice_date TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create payment_webhooks table for logging
CREATE TABLE IF NOT EXISTS payment_webhooks (
    id SERIAL PRIMARY KEY,
    event_id VARCHAR(255) UNIQUE NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Update payments table to add order_id
ALTER TABLE payments ADD COLUMN IF NOT EXISTS order_id VARCHAR(255);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS signature VARCHAR(500);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS notes JSONB;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON subscriptions(expires_at);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_event_id ON payment_webhooks(event_id);
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_processed ON payment_webhooks(processed);

-- Add comments
COMMENT ON TABLE subscriptions IS 'User subscription records with expiry tracking';
COMMENT ON TABLE invoices IS 'Invoice/bill records for payments';
COMMENT ON TABLE payment_webhooks IS 'Razorpay webhook event logs';
