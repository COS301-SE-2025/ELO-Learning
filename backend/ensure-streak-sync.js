/**
 * DAILY STREAK PROGRESS ENHANCEMENT
 * 
 * This script ensures all users have properly synchronized Daily Streak progress.
 * The progress tracking is already implemented - this just fixes any sync issues.
 */

import { supabase } from './database/supabaseClient.js';
import { triggerAchievementProgress } from './src/achievementRoutes.js';

/**
 * Main function to ensure all Daily Streak progress is properly synchronized
 */
async function ensureStreakProgressSync() {
  console.log('🔧 === ENSURING DAILY STREAK PROGRESS SYNC ===\n');

  try {
    // Get all users with active streaks
    const { data: usersWithStreaks, error: usersError } = await supabase
      .from('Users')
      .select('id, daily_streak, username')
      .gt('daily_streak', 0)
      .order('daily_streak', { ascending: false });

    if (usersError) throw usersError;

    console.log(`Found ${usersWithStreaks.length} users with active streaks`);
    console.log('\n🔥 Users with highest streaks:');
    usersWithStreaks.slice(0, 5).forEach((user, index) => {
      console.log(`  ${index + 1}. User ${user.id} (${user.username || 'No name'}): ${user.daily_streak} days`);
    });

    let syncedUsers = 0;
    let totalUnlocked = 0;

    console.log('\n🔄 Synchronizing progress for all users...');
    
    for (const user of usersWithStreaks) {
      try {
        // Sync this user's progress
        const result = await triggerAchievementProgress(
          user.id,
          'Daily Streak',
          user.daily_streak
        );

        syncedUsers++;
        
        if (result.unlockedAchievements?.length > 0) {
          totalUnlocked += result.unlockedAchievements.length;
          console.log(`📍 User ${user.id}: Unlocked ${result.unlockedAchievements.length} achievements`);
        }

        // Show progress every 10 users
        if (syncedUsers % 10 === 0) {
          console.log(`  ✅ Synced ${syncedUsers}/${usersWithStreaks.length} users...`);
        }

      } catch (error) {
        console.error(`❌ Error syncing user ${user.id}:`, error.message);
      }
    }

    console.log(`\n📊 Final Results:`);
    console.log(`  - ${syncedUsers}/${usersWithStreaks.length} users synchronized`);
    console.log(`  - ${totalUnlocked} total achievements unlocked`);

    // Verify a few users to confirm sync worked
    console.log('\n🔍 Verification - Sample of synced users:');
    const sampleUsers = usersWithStreaks.slice(0, 3);
    
    for (const user of sampleUsers) {
      const { data: progress } = await supabase
        .from('AchievementProgress')
        .select(`
          current_value,
          Achievements(name, condition_value)
        `)
        .eq('user_id', user.id)
        .eq('Achievements.condition_type', 'Daily Streak')
        .order('Achievements.condition_value');

      console.log(`\n  User ${user.id} - Streak: ${user.daily_streak} days`);
      if (progress && progress.length > 0) {
        progress.forEach(p => {
          const percent = Math.round((p.current_value / p.Achievements.condition_value) * 100);
          const status = p.current_value >= p.Achievements.condition_value ? '✅' : '📊';
          console.log(`    ${status} ${p.Achievements.name}: ${p.current_value}/${p.Achievements.condition_value} (${percent}%)`);
        });
      }
    }

    console.log('\n✅ === SYNC COMPLETED SUCCESSFULLY ===');
    
  } catch (error) {
    console.error('❌ Sync failed:', error);
  }
}

// Run the sync
ensureStreakProgressSync();
