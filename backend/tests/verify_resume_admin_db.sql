-- Resume Admin Database Verification Script
-- Run with: psql -U your_user -d codecampus -f verify_resume_admin_db.sql

\echo '🔍 Verifying Resume Admin Database Setup...'
\echo '=========================================='

-- 1. Check tables exist
\echo ''
\echo '✓ Checking tables exist...'
SELECT 
    CASE 
        WHEN COUNT(*) = 3 THEN '✅ All 3 tables exist'
        ELSE '❌ Missing tables: ' || (3 - COUNT(*))::text
    END as status
FROM information_schema.tables 
WHERE table_name IN ('resume_tracking', 'ai_generation_logs', 'ai_settings');

-- 2. Check resume_tracking structure
\echo ''
\echo '✓ Checking resume_tracking columns...'
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'resume_tracking'
ORDER BY ordinal_position;

-- 3. Check ai_generation_logs structure
\echo ''
\echo '✓ Checking ai_generation_logs columns...'
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'ai_generation_logs'
ORDER BY ordinal_position;

-- 4. Check ai_settings structure
\echo ''
\echo '✓ Checking ai_settings columns...'
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'ai_settings'
ORDER BY ordinal_position;

-- 5. Check foreign keys
\echo ''
\echo '✓ Checking foreign key constraints...'
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table,
    rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('resume_tracking', 'ai_generation_logs', 'ai_settings')
ORDER BY tc.table_name;

-- 6. Check indexes
\echo ''
\echo '✓ Checking indexes...'
SELECT tablename, indexname
FROM pg_indexes
WHERE tablename IN ('resume_tracking', 'ai_generation_logs', 'ai_settings')
ORDER BY tablename, indexname;

-- 7. Check data counts
\echo ''
\echo '✓ Checking data counts...'
SELECT 
    'resume_tracking' as table_name,
    COUNT(*) as row_count
FROM resume_tracking
UNION ALL
SELECT 
    'ai_generation_logs',
    COUNT(*)
FROM ai_generation_logs
UNION ALL
SELECT 
    'ai_settings',
    COUNT(*)
FROM ai_settings;

-- 8. Check AI settings defaults
\echo ''
\echo '✓ Checking AI settings for resume module...'
SELECT 
    module,
    model_name,
    prompt_version,
    ai_enabled,
    free_user_limit,
    premium_user_limit,
    updated_at
FROM ai_settings 
WHERE module = 'resume';

-- 9. Check for orphaned records
\echo ''
\echo '✓ Checking for orphaned records...'
SELECT 
    'Orphaned resume_tracking' as issue,
    COUNT(*) as count
FROM resume_tracking rt
LEFT JOIN users u ON u.id = rt.user_id
WHERE u.id IS NULL
UNION ALL
SELECT 
    'Orphaned ai_generation_logs',
    COUNT(*)
FROM ai_generation_logs agl
LEFT JOIN users u ON u.id = agl.user_id
WHERE u.id IS NULL;

-- 10. Sample data from each table
\echo ''
\echo '✓ Sample data from resume_tracking (latest 5)...'
SELECT 
    id,
    user_id,
    template_id,
    ats_score,
    ai_generated,
    pdf_export_count,
    created_at
FROM resume_tracking
ORDER BY created_at DESC
LIMIT 5;

\echo ''
\echo '✓ Sample data from ai_generation_logs (latest 5)...'
SELECT 
    id,
    user_id,
    request_type,
    status,
    response_time_ms,
    created_at
FROM ai_generation_logs
WHERE module = 'resume'
ORDER BY created_at DESC
LIMIT 5;

\echo ''
\echo '=========================================='
\echo '✅ Database verification complete!'
\echo ''
\echo 'Next steps:'
\echo '1. If tables missing, run: python3 run_resume_admin_migration.py'
\echo '2. If orphaned records found, investigate and clean up'
\echo '3. If indexes missing, re-run migration'
