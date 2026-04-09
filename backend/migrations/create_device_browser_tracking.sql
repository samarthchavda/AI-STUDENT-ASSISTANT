-- Device & Browser Analytics Migration
-- Tracks user devices, browsers, OS, screen sizes, and platform preferences

-- Create device_browser_logs table
CREATE TABLE IF NOT EXISTS device_browser_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(100),
    -- Device info
    device_type VARCHAR(50), -- desktop, mobile, tablet
    device_brand VARCHAR(100), -- Apple, Samsung, etc.
    device_model VARCHAR(100),
    -- Browser info
    browser_name VARCHAR(50), -- Chrome, Firefox, Safari, etc.
    browser_version VARCHAR(50),
    -- OS info
    os_name VARCHAR(50), -- Windows, macOS, iOS, Android, Linux
    os_version VARCHAR(50),
    -- Screen info
    screen_width INTEGER,
    screen_height INTEGER,
    screen_resolution VARCHAR(20), -- 1920x1080, etc.
    -- Network info
    connection_type VARCHAR(50), -- wifi, cellular, ethernet
    -- Location info (optional)
    country VARCHAR(100),
    city VARCHAR(100),
    timezone VARCHAR(100),
    -- Additional metadata
    user_agent TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_device_browser_user_id ON device_browser_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_device_browser_session ON device_browser_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_device_browser_device_type ON device_browser_logs(device_type);
CREATE INDEX IF NOT EXISTS idx_device_browser_browser ON device_browser_logs(browser_name);
CREATE INDEX IF NOT EXISTS idx_device_browser_os ON device_browser_logs(os_name);
CREATE INDEX IF NOT EXISTS idx_device_browser_created_at ON device_browser_logs(created_at);

-- Materialized view for device/browser summary
CREATE MATERIALIZED VIEW IF NOT EXISTS device_browser_summary AS
SELECT 
    -- Device stats
    device_type,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT session_id) as total_sessions,
    ROUND(COUNT(DISTINCT user_id)::numeric / (
        SELECT COUNT(DISTINCT user_id) FROM device_browser_logs
    ) * 100, 2) as user_percentage,
    
    -- Browser stats
    browser_name,
    browser_version,
    
    -- OS stats
    os_name,
    os_version,
    
    -- Screen stats
    MODE() WITHIN GROUP (ORDER BY screen_resolution) as most_common_resolution,
    ROUND(AVG(screen_width), 0) as avg_screen_width,
    ROUND(AVG(screen_height), 0) as avg_screen_height,
    
    -- Recent activity
    MAX(created_at) as last_seen
FROM device_browser_logs
GROUP BY device_type, browser_name, browser_version, os_name, os_version;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_device_browser_summary_device 
ON device_browser_summary(device_type);

-- Function to refresh device/browser summary
CREATE OR REPLACE FUNCTION refresh_device_browser_summary()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY device_browser_summary;
END;
$$ LANGUAGE plpgsql;

-- View for device type distribution
CREATE OR REPLACE VIEW device_type_distribution AS
SELECT 
    device_type,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT session_id) as total_sessions,
    ROUND(COUNT(DISTINCT user_id)::numeric / (
        SELECT COUNT(DISTINCT user_id) FROM device_browser_logs
    ) * 100, 2) as percentage
FROM device_browser_logs
WHERE device_type IS NOT NULL
GROUP BY device_type
ORDER BY unique_users DESC;

-- View for browser distribution
CREATE OR REPLACE VIEW browser_distribution AS
SELECT 
    browser_name,
    browser_version,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT session_id) as total_sessions,
    ROUND(COUNT(DISTINCT user_id)::numeric / (
        SELECT COUNT(DISTINCT user_id) FROM device_browser_logs
    ) * 100, 2) as percentage
FROM device_browser_logs
WHERE browser_name IS NOT NULL
GROUP BY browser_name, browser_version
ORDER BY unique_users DESC;

-- View for OS distribution
CREATE OR REPLACE VIEW os_distribution AS
SELECT 
    os_name,
    os_version,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT session_id) as total_sessions,
    ROUND(COUNT(DISTINCT user_id)::numeric / (
        SELECT COUNT(DISTINCT user_id) FROM device_browser_logs
    ) * 100, 2) as percentage
FROM device_browser_logs
WHERE os_name IS NOT NULL
GROUP BY os_name, os_version
ORDER BY unique_users DESC;

-- View for screen resolution distribution
CREATE OR REPLACE VIEW screen_resolution_distribution AS
SELECT 
    screen_resolution,
    screen_width,
    screen_height,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT session_id) as total_sessions,
    ROUND(COUNT(DISTINCT user_id)::numeric / (
        SELECT COUNT(DISTINCT user_id) FROM device_browser_logs WHERE screen_resolution IS NOT NULL
    ) * 100, 2) as percentage,
    -- Categorize screen size
    CASE 
        WHEN screen_width >= 1920 THEN 'Large (1920+)'
        WHEN screen_width >= 1366 THEN 'Medium (1366-1919)'
        WHEN screen_width >= 768 THEN 'Small (768-1365)'
        ELSE 'Mobile (<768)'
    END as screen_category
FROM device_browser_logs
WHERE screen_resolution IS NOT NULL
GROUP BY screen_resolution, screen_width, screen_height
ORDER BY unique_users DESC;

-- View for mobile vs desktop usage
CREATE OR REPLACE VIEW mobile_vs_desktop AS
WITH device_categories AS (
    SELECT 
        CASE 
            WHEN device_type IN ('mobile', 'tablet') THEN 'Mobile'
            WHEN device_type = 'desktop' THEN 'Desktop'
            ELSE 'Unknown'
        END as category,
        user_id,
        session_id,
        created_at
    FROM device_browser_logs
)
SELECT 
    category,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT session_id) as total_sessions,
    ROUND(COUNT(DISTINCT user_id)::numeric / (
        SELECT COUNT(DISTINCT user_id) FROM device_categories
    ) * 100, 2) as user_percentage,
    ROUND(COUNT(DISTINCT session_id)::numeric / (
        SELECT COUNT(DISTINCT session_id) FROM device_categories
    ) * 100, 2) as session_percentage
FROM device_categories
GROUP BY category
ORDER BY unique_users DESC;

-- View for user device preferences
CREATE OR REPLACE VIEW user_device_preferences AS
WITH user_devices AS (
    SELECT 
        user_id,
        device_type,
        browser_name,
        os_name,
        COUNT(*) as usage_count,
        MAX(created_at) as last_used
    FROM device_browser_logs
    GROUP BY user_id, device_type, browser_name, os_name
),
user_primary_device AS (
    SELECT DISTINCT ON (user_id)
        user_id,
        device_type as primary_device,
        browser_name as primary_browser,
        os_name as primary_os,
        usage_count,
        last_used
    FROM user_devices
    ORDER BY user_id, usage_count DESC, last_used DESC
)
SELECT 
    u.id as user_id,
    u.name,
    u.email,
    u.plan,
    upd.primary_device,
    upd.primary_browser,
    upd.primary_os,
    upd.usage_count,
    upd.last_used,
    -- Count unique devices used
    (SELECT COUNT(DISTINCT device_type) FROM device_browser_logs WHERE user_id = u.id) as devices_used,
    -- Multi-device user flag
    CASE 
        WHEN (SELECT COUNT(DISTINCT device_type) FROM device_browser_logs WHERE user_id = u.id) > 1 
        THEN true 
        ELSE false 
    END as is_multi_device_user
FROM users u
LEFT JOIN user_primary_device upd ON u.id = upd.user_id
WHERE u.is_admin = false
ORDER BY upd.usage_count DESC;

-- View for geographic distribution
CREATE OR REPLACE VIEW geographic_distribution AS
SELECT 
    country,
    city,
    timezone,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT session_id) as total_sessions,
    ROUND(COUNT(DISTINCT user_id)::numeric / (
        SELECT COUNT(DISTINCT user_id) FROM device_browser_logs WHERE country IS NOT NULL
    ) * 100, 2) as percentage
FROM device_browser_logs
WHERE country IS NOT NULL
GROUP BY country, city, timezone
ORDER BY unique_users DESC;

-- View for connection type distribution
CREATE OR REPLACE VIEW connection_type_distribution AS
SELECT 
    connection_type,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT session_id) as total_sessions,
    ROUND(COUNT(DISTINCT user_id)::numeric / (
        SELECT COUNT(DISTINCT user_id) FROM device_browser_logs WHERE connection_type IS NOT NULL
    ) * 100, 2) as percentage
FROM device_browser_logs
WHERE connection_type IS NOT NULL
GROUP BY connection_type
ORDER BY unique_users DESC;

-- View for device trends over time
CREATE OR REPLACE VIEW device_trends AS
SELECT 
    DATE(created_at) as usage_date,
    device_type,
    COUNT(DISTINCT user_id) as daily_users,
    COUNT(DISTINCT session_id) as daily_sessions
FROM device_browser_logs
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE(created_at), device_type
ORDER BY usage_date DESC, daily_users DESC;
