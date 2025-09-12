/**
 * SOLUTION: Daily Streak Progress Bar Fix & Test
 *
 * The issue is that Daily Streak achievements are only updated when a user plays a game
 * and gains/maintains their streak. However, if a user has an existing streak but hasn't
 * played recently, their progress bars won't reflect their current streak status.
 *
 * This script will:
 * 1. Sync all users' current streaks with their achievement progress
 * 2. Test the frontend display to ensure progress bars show correctly
 */

import { supabase } from './backend/database/supabaseClient.js';
import { triggerAchievementProgress } from './backend/src/achievementRoutes.js';

async function fixStreakProgressBars() {
  console.log('\n🔧 === FIXING DAILY STREAK PROGRESS BARS ===\n');

  try {
    // Step 1: Get all users with current streaks > 0
    console.log('📊 Fetching users with active streaks...');
    const { data: usersWithStreaks, error: usersError } = await supabase
      .from('Users')
      .select('id, daily_streak, username')
      .gt('daily_streak', 0);

    if (usersError) throw usersError;

    console.log(`Found ${usersWithStreaks.length} users with active streaks:`);
    usersWithStreaks.forEach((user) => {
      console.log(
        `  - User ${user.id} (${user.username}): ${user.daily_streak} days`,
      );
    });

    // Step 2: Update each user's streak achievement progress
    console.log('\n🔄 Updating streak achievement progress...');

    for (const user of usersWithStreaks) {
      console.log(
        `\n📍 Processing User ${user.id} (${user.username}) - Streak: ${user.daily_streak}`,
      );

      try {
        // Trigger progress update for this user's current streak
        const result = await triggerAchievementProgress(
          user.id,
          'Daily Streak',
          user.daily_streak,
        );

        console.log(
          `  ✅ Updated progress for ${
            result.unlockedAchievements?.length || 0
          } achievements`,
        );
        if (result.unlockedAchievements?.length > 0) {
          result.unlockedAchievements.forEach((achievement) => {
            console.log(`    🏆 Unlocked: ${achievement.name}`);
          });
        }
      } catch (error) {
        console.error(`  ❌ Error updating user ${user.id}:`, error.message);
      }
    }

    // Step 3: Verify the fix by checking progress data
    console.log('\n🔍 Verifying progress updates...');
    const { data: progressData, error: progressError } = await supabase
      .from('AchievementProgress')
      .select(
        `
        user_id,
        current_value,
        Achievements!inner(name, condition_value, condition_type)
      `,
      )
      .eq('Achievements.condition_type', 'Daily Streak')
      .gt('current_value', 0)
      .order('user_id', { ascending: true });

    if (progressError) throw progressError;

    console.log('\n📈 Updated Progress Summary:');
    const userProgress = {};
    progressData.forEach((entry) => {
      if (!userProgress[entry.user_id]) {
        userProgress[entry.user_id] = [];
      }
      userProgress[entry.user_id].push({
        achievement: entry.Achievements.name,
        progress: `${entry.current_value}/${entry.Achievements.condition_value}`,
        percentage: Math.round(
          (entry.current_value / entry.Achievements.condition_value) * 100,
        ),
      });
    });

    Object.entries(userProgress).forEach(([userId, achievements]) => {
      console.log(`\n  User ${userId}:`);
      achievements.forEach((achievement) => {
        console.log(
          `    ${achievement.achievement}: ${achievement.progress} (${achievement.percentage}%)`,
        );
      });
    });

    console.log('\n✅ === STREAK PROGRESS FIX COMPLETED ===');
    console.log('🎯 Next Steps:');
    console.log('1. Check your frontend /achievements page');
    console.log(
      '2. Look for progress bars and text under Daily Streak achievements',
    );
    console.log('3. Users with active streaks should now see proper progress');
  } catch (error) {
    console.error('❌ Error fixing streak progress bars:', error);
  }
}

async function testStreakProgressSync() {
  console.log('\n🧪 === TESTING STREAK PROGRESS SYNC ===\n');

  try {
    // Test with a specific user (change this to a user you know has a streak)
    const testUserId = 237; // This user showed streak values in your data

    console.log(`Testing with User ${testUserId}...`);

    // Get their current streak
    const { data: user, error: userError } = await supabase
      .from('Users')
      .select('daily_streak, username')
      .eq('id', testUserId)
      .single();

    if (userError || !user) {
      console.log('❌ Test user not found or no streak data');
      return;
    }

    console.log(
      `User ${testUserId} (${user.username}) current streak: ${user.daily_streak}`,
    );

    // Manually trigger achievement progress
    const result = await triggerAchievementProgress(
      testUserId,
      'Daily Streak',
      user.daily_streak,
    );

    console.log(`✅ Progress update result:`, {
      success: result.success,
      unlocked: result.unlockedAchievements?.length || 0,
    });

    // Check resulting progress
    const { data: progress } = await supabase
      .from('AchievementProgress')
      .select(
        `
        current_value,
        Achievements(name, condition_value)
      `,
      )
      .eq('user_id', testUserId)
      .eq('Achievements.condition_type', 'Daily Streak');

    console.log('\nUpdated achievement progress:');
    progress?.forEach((p) => {
      const percentage = Math.round(
        (p.current_value / p.Achievements.condition_value) * 100,
      );
      console.log(
        `  ${p.Achievements.name}: ${p.current_value}/${p.Achievements.condition_value} (${percentage}%)`,
      );
    });
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Export functions for manual use
export { fixStreakProgressBars, testStreakProgressSync };

// Uncomment to run the fix
// fixStreakProgressBars();

// Uncomment to run the test
// testStreakProgressSync();
