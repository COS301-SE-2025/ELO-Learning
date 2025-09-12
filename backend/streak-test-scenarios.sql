-- SQL commands to simulate different days for testing

-- 1. Reset user to simulate "yesterday" activity (will increment streak)
UPDATE "Users" 
SET last_daily_activity = '2025-09-11' 
WHERE id = '237';

-- 2. Reset user to simulate "2 days ago" activity (will reset streak to 1)
UPDATE "Users" 
SET last_daily_activity = '2025-09-10' 
WHERE id = '237';

-- 3. Reset user to have no activity (will start first streak)
UPDATE "Users" 
SET last_daily_activity = NULL, daily_streak = 0, longest_daily_streak = 0 
WHERE id = '237';

-- 4. Set up a long streak from yesterday
UPDATE "Users" 
SET last_daily_activity = '2025-09-11', daily_streak = 10, longest_daily_streak = 15 
WHERE id = '237';

-- 5. Simulate a week gap (will reset streak)
UPDATE "Users" 
SET last_daily_activity = '2025-09-05' 
WHERE id = '237';

-- Check current state
SELECT id, daily_streak, longest_daily_streak, last_daily_activity 
FROM "Users" 
WHERE id = '237';
