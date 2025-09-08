import { supabase } from '../../database/supabaseClient.js';

/**
 * Calculate days between two date strings (YYYY-MM-DD format)
 */
function daysBetween(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000;
  const firstDate = new Date(date1);
  const secondDate = new Date(date2);
  
  return Math.round(Math.abs((secondDate - firstDate) / oneDay));
}

/**
 * Updates the user's daily streak based on their activity
 */
export async function updateUserStreak(userId) {
  try {
    console.log(`🔥 Updating streak for user ${userId}`);

    // Get current streak data from database
    const { data: userData, error: userError } = await supabase
      .from('Users')
      .select('daily_streak, longest_daily_streak, last_daily_activity')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user streak data:', userError?.message);
      return {
        success: false,
        currentStreak: 0,
        longestStreak: 0,
        message: 'User not found'
      };
    }

    const { 
      daily_streak: currentStreak = 0, 
      longest_daily_streak: longestStreak = 0, 
      last_daily_activity: lastActivity 
    } = userData;

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    const lastActivityDate = lastActivity;

    let newStreak = currentStreak;
    let newLongestStreak = longestStreak;
    let shouldUpdate = true;
    let message = '';

    // Determine streak logic
    if (!lastActivityDate) {
      // First activity ever
      newStreak = 1;
      message = 'First day streak started!';
    } else if (lastActivityDate === today) {
      // Already had activity today - no change
      shouldUpdate = false;
      message = 'Already updated streak today';
      return {
        success: true,
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        message
      };
    } else {
      // Calculate days difference
      const diffDays = daysBetween(lastActivityDate, today);

      if (diffDays === 1) {
        // Yesterday was last activity - continue streak
        newStreak = currentStreak + 1;
        message = `Streak continued! Day ${newStreak}`;
      } else if (diffDays > 1) {
        // More than 1 day gap - reset streak
        newStreak = 1;
        message = 'Streak reset due to missed day(s)';
      } else {
        // Handle edge case
        shouldUpdate = false;
        message = 'Date calculation error';
        return {
          success: false,
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
          message
        };
      }
    }

    // Update longest streak if current streak exceeds it
    if (newStreak > longestStreak) {
      newLongestStreak = newStreak;
      message += ` New personal best!`;
    }

    // Update database if changes are needed
    if (shouldUpdate) {
      const { error: updateError } = await supabase
        .from('Users')
        .update({
          daily_streak: newStreak,
          longest_daily_streak: newLongestStreak,
          last_daily_activity: today
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating user streak:', updateError.message);
        return {
          success: false,
          currentStreak: currentStreak,
          longestStreak: longestStreak,
          message: 'Database update failed'
        };
      }
    }

    return {
      success: true,
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      message
    };

  } catch (error) {
    console.error('Error in updateUserStreak:', error);
    return {
      success: false,
      currentStreak: 0,
      longestStreak: 0,
      message: 'Internal error'
    };
  }
}

/**
 * Gets the current streak information for a user without updating it
 */
export async function getUserStreakInfo(userId) {
  try {
    const { data: userData, error: userError } = await supabase
      .from('Users')
      .select('daily_streak, longest_daily_streak, last_daily_activity')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return {
        success: false,
        currentStreak: 0,
        longestStreak: 0,
        lastActivity: null
      };
    }

    return {
      success: true,
      currentStreak: userData.daily_streak || 0,
      longestStreak: userData.longest_daily_streak || 0,
      lastActivity: userData.last_daily_activity
    };
  } catch (error) {
    console.error('Error getting user streak info:', error);
    return {
      success: false,
      currentStreak: 0,
      longestStreak: 0,
      lastActivity: null
    };
  }
}