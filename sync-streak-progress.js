/**
 * ONE-TIME FIX: Sync Daily Streak Achievement Progress
 * 
 * This script fixes the Daily Streak progress display issue by updating
 * all users' Daily Streak achievement progress to reflect their best
 * achieved streak (longest_daily_streak) rather than current streak.
 */

import { supabase } from './backend/database/supabaseClient.js';

async function fixDailyStreakProgress() {
  console.log('\n🔧 === FIXING DAILY STREAK ACHIEVEMENT PROGRESS ===\n');

  try {
    // Step 1: Get all users with their best streaks
    console.log('📊 Fetching all users with streak data...');
    const { data: users, error: usersError } = await supabase
      .from('Users')
      .select('id, username, daily_streak, longest_daily_streak')
      .gt('longest_daily_streak', 0);

    if (usersError) throw usersError;

    console.log(`Found ${users.length} users with streak history`);

    // Step 2: Get all Daily Streak achievements
    const { data: streakAchievements, error: achievementsError } = await supabase
      .from('Achievements')
      .select('id, name, condition_value')
      .eq('condition_type', 'Daily Streak')
      .order('condition_value', { ascending: true });

    if (achievementsError) throw achievementsError;

    console.log(`Found ${streakAchievements.length} Daily Streak achievements:`);
    streakAchievements.forEach(achievement => {
      console.log(`  - ${achievement.name}: ${achievement.condition_value} days`);
    });

    // Step 3: Update progress for each user
    console.log('\n🔄 Updating achievement progress...');
    
    let updatedCount = 0;
    for (const user of users) {
      const bestStreak = user.longest_daily_streak;
      
      console.log(`\n📍 User ${user.id} (${user.username}): Best streak ${bestStreak} days`);
      
      for (const achievement of streakAchievements) {
        // Calculate what the progress should be
        const progressValue = Math.min(bestStreak, achievement.condition_value);
        
        // Only update if user achieved at least some progress toward this achievement
        if (progressValue > 0) {
          const { error: upsertError } = await supabase
            .from('AchievementProgress')
            .upsert({
              user_id: user.id,
              achievement_id: achievement.id,
              current_value: progressValue,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'user_id,achievement_id',
              ignoreDuplicates: false,
            });

          if (upsertError) {
            console.error(`  ❌ Error updating ${achievement.name}:`, upsertError.message);
          } else {
            console.log(`  ✅ ${achievement.name}: ${progressValue}/${achievement.condition_value}`);
            updatedCount++;
          }
        }
      }
    }

    console.log(`\n✅ Updated ${updatedCount} achievement progress entries`);

    // Step 4: Show final results
    console.log('\n📈 Verification - Sample updated progress:');
    const { data: sampleProgress } = await supabase
      .from('AchievementProgress')
      .select(`
        user_id,
        current_value,
        Achievements!inner(name, condition_value)
      `)
      .eq('Achievements.condition_type', 'Daily Streak')
      .gt('current_value', 0)
      .limit(10);

    sampleProgress?.forEach(entry => {
      const percentage = Math.round((entry.current_value / entry.Achievements.condition_value) * 100);
      console.log(`  User ${entry.user_id}: ${entry.Achievements.name} = ${entry.current_value}/${entry.Achievements.condition_value} (${percentage}%)`);
    });

    console.log('\n🎯 === FIX COMPLETED ===');
    console.log('✅ Daily Streak achievement progress has been fixed!');
    console.log('📱 Check your frontend /achievements page - progress bars should now display correctly');

  } catch (error) {
    console.error('❌ Error fixing Daily Streak progress:', error);
  }
}

// Run the fix
fixDailyStreakProgress().catch(console.error);
