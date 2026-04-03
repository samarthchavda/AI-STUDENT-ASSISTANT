-- Add subscription tracking fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS subscription_source VARCHAR(50) DEFAULT 'free',
ADD COLUMN IF NOT EXISTS plan_updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS plan_updated_at TIMESTAMP;

-- Update existing users with payment records to have 'payment' source
UPDATE users u
SET subscription_source = 'payment'
WHERE EXISTS (
    SELECT 1 FROM payments p 
    WHERE p.user_id = u.id 
    AND p.status = 'completed'
    AND u.plan::text != 'FREE'
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_subscription_source ON users(subscription_source);
CREATE INDEX IF NOT EXISTS idx_users_plan_updated_by ON users(plan_updated_by);

COMMENT ON COLUMN users.subscription_source IS 'Source of subscription: free, payment, admin_grant, promo';
COMMENT ON COLUMN users.plan_updated_by IS 'Admin user ID who granted/updated the plan';
COMMENT ON COLUMN users.plan_updated_at IS 'Timestamp when plan was last updated';
