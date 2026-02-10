-- Manual Database Migration for last_request_at column
-- Run this SQL if the Python migration script fails

-- Check if column exists
SELECT COUNT(*) as column_exists
FROM information_schema.COLUMNS 
WHERE TABLE_NAME = 'marketing_source_configs' 
AND COLUMN_NAME = 'last_request_at';

-- If column_exists = 0, run this:
ALTER TABLE marketing_source_configs 
ADD COLUMN last_request_at DATETIME;

-- Verify column was added
DESCRIBE marketing_source_configs;
