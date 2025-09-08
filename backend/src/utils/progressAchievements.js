// Progress Achievement Functions
import { supabase } from '../../database/supabaseClient.js';

// Cache achievement IDs to avoid repeated lookups
let achievementIdCache = null;

/**
 * Get achievement IDs from database (with caching)
 */
async function getAchievementIds() {
  if (achievementIdCache) return achievementIdCache;

  try {
    const { data, error } = await supabase
      .from('Achievements')
      .select('id, name')
      .in('name', [
        'Personal Best Achieved',
        'Comeback Completed',
        'Consecutive Improvements',
      ]);

    if (error) {
      console.error('Error fetching achievement IDs:', error.message);
      return {};
    }

    if (!data || data.length === 0) {
      console.log(
        '⚠️ No progress achievements found in database. They may need to be created.',
      );
      return {};
    }

    achievementIdCache = data.reduce((acc, achievement) => {
      acc[achievement.name] = achievement.id;
      return acc;
    }, {});

    console.log(
      `✅ Loaded ${data.length} progress achievement IDs:`,
      Object.keys(achievementIdCache),
    );
    return achievementIdCache;
  } catch (error) {
    console.error('Error in getAchievementIds:', error.message);
    return {};
  }
}

/**
 * Trigger achievement unlock
 */
async function unlockAchievement(userId, achievementName) {
  try {
    const achievementIds = await getAchievementIds();
    const achievementId = achievementIds[achievementName];

    if (!achievementId) {
      console.log(
        `⚠️ Achievement "${achievementName}" not found in database - skipping unlock`,
      );
      return null;
    }

    // Check if already unlocked
    const { data: existing } = await supabase
      .from('UserAchievements')
      .select('id')
      .eq('user_id', userId)
      .eq('achievement_id', achievementId)
      .single();

    if (existing) {
      console.log(
        `📋 Achievement "${achievementName}" already unlocked for user ${userId}`,
      );
      return null;
    }

    // Unlock the achievement
    const { data, error } = await supabase
      .from('UserAchievements')
      .insert({
        user_id: userId,
        achievement_id: achievementId,
        unlocked_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) {
      console.error(
        `❌ Error unlocking achievement "${achievementName}":`,
        error.message,
      );
      return null;
    }

    console.log(
      `🏆 Achievement unlocked: "${achievementName}" for user ${userId}`,
    );

    // Create a simple achievement object for return
    return {
      id: data.achievement_id,
      name: achievementName,
      unlocked_at: data.unlocked_at,
      user_id: data.user_id,
    };
  } catch (error) {
    console.error('❌ Error in unlockAchievement:', error.message);
    return null;
  }
}

/**
 * Check for "Peak Performance" achievement - Personal Best ELO reached
 */
export async function checkPersonalBestAchievement(
  userId,
  newEloRating,
  currentBestElo,
) {
  try {
    // Only trigger if this is a new personal best
    if (newEloRating > currentBestElo) {
      console.log(
        `🎯 New personal best for user ${userId}: ${newEloRating} (was ${currentBestElo})`,
      );

      const achievement = await unlockAchievement(
        userId,
        'Personal Best Achieved',
      );
      return achievement ? [achievement] : [];
    }

    return [];
  } catch (error) {
    console.error('Error in checkPersonalBestAchievement:', error);
    return [];
  }
}

/**
 * Check for "Comeback Kid" achievement - Recover from a 3+ point ELO drop
 * Simplified logic: Track when ELO drops 3+ points, then award when it recovers
 */
export async function checkComebackAchievement(
  userId,
  newEloRating,
  bestEloRating,
  lastEloDrop,
) {
  try {
    const unlockedAchievements = [];

    // Calculate current drop from best
    const currentDropFromBest = bestEloRating - newEloRating;

    // If user has dropped 3+ points from their best, track it
    if (currentDropFromBest >= 3) {
      // Update the tracked drop (we'll store the lowest point)
      const lowestPoint = Math.min(newEloRating, lastEloDrop || newEloRating);
      return {
        achievements: [],
        updateData: { last_elo_drop: lowestPoint },
      };
    }

    // If user had a previous drop and has now recovered above their best
    if (lastEloDrop > 0 && newEloRating >= bestEloRating) {
      const dropAmount = bestEloRating - lastEloDrop;

      // Only award if the drop was 3+ points
      if (dropAmount >= 3) {
        console.log(
          `💪 Comeback! User ${userId} recovered from ${lastEloDrop} to ${newEloRating} (drop was ${dropAmount} points)`,
        );

        const achievement = await unlockAchievement(
          userId,
          'Comeback Completed',
        );
        if (achievement) {
          unlockedAchievements.push(achievement);
        }

        // Reset the drop tracking
        return {
          achievements: unlockedAchievements,
          updateData: { last_elo_drop: 0 },
        };
      }
    }

    return { achievements: [], updateData: {} };
  } catch (error) {
    console.error('Error in checkComebackAchievement:', error);
    return { achievements: [], updateData: {} };
  }
}

/**
 * Check for "Consistent Climber" achievement - 5 consecutive ELO improvements
 * Improvement = ending a session with higher ELO than you started
 */
export async function checkConsecutiveImprovementsAchievement(
  userId,
  newEloRating,
  sessionStartElo,
  currentStreak,
) {
  try {
    let newStreak = currentStreak || 0;
    const unlockedAchievements = [];

    // Check if this session was an improvement
    const sessionImprovement = newEloRating - sessionStartElo;

    if (sessionImprovement > 0) {
      // Session resulted in ELO gain
      newStreak += 1;
      console.log(
        `📈 Session improvement: +${sessionImprovement} ELO. Streak: ${newStreak}`,
      );

      // Check if achievement threshold reached
      if (newStreak === 5) {
        console.log(
          `🔥 5 consecutive improvements achieved for user ${userId}!`,
        );

        const achievement = await unlockAchievement(
          userId,
          'Consecutive Improvements',
        );
        if (achievement) {
          unlockedAchievements.push(achievement);
        }
      }
    } else if (sessionImprovement < 0) {
      // Session resulted in ELO loss - reset streak
      console.log(
        `📉 Session resulted in -${Math.abs(
          sessionImprovement,
        )} ELO. Streak reset.`,
      );
      newStreak = 0;
    }
    // If sessionImprovement === 0, maintain current streak

    return {
      achievements: unlockedAchievements,
      updateData: {
        consecutive_improvements: newStreak,
        last_session_elo: newEloRating, // Update for next session comparison
      },
    };
  } catch (error) {
    console.error('Error in checkConsecutiveImprovementsAchievement:', error);
    return { achievements: [], updateData: {} };
  }
}

/**
 * Master function to check all progress achievements
 * @param {string} userId - User's id (not auth_id)
 * @param {number} newEloRating - Current ELO rating after session
 * @param {number} sessionStartElo - ELO rating at the start of this session
 */
export async function checkAllProgressAchievements(
  userId,
  newEloRating,
  sessionStartElo,
) {
  try {
    const allUnlockedAchievements = [];
    const updates = {};

    // Fetch user's current data - try with progress fields first, fallback to basic fields
    let { data: user, error: userError } = await supabase
      .from('Users')
      .select(
        'id, elo_rating, best_elo_rating, last_session_elo, consecutive_improvements, last_elo_drop',
      )
      .eq('id', userId)
      .single();

    if (userError) {
      console.log(
        '⚠️ Progress tracking fields not found, trying basic fields...',
      );
      // Fallback to basic user data if progress fields don't exist
      const { data: basicUser, error: basicError } = await supabase
        .from('Users')
        .select('id, elo_rating')
        .eq('id', userId)
        .single();

      if (basicError) {
        console.error('Error fetching user data:', basicError);
        return [];
      }

      // Create user object with default progress values
      user = {
        ...basicUser,
        best_elo_rating: null,
        last_session_elo: null,
        consecutive_improvements: null,
        last_elo_drop: null,
      };

      console.log('📝 Using default progress values for user', userId);
    }

    // Initialize values if first time or fields don't exist
    const currentBestElo = user.best_elo_rating || sessionStartElo;
    const lastSessionElo = user.last_session_elo || sessionStartElo;
    const currentStreak = user.consecutive_improvements || 0;
    const lastEloDrop = user.last_elo_drop || 0;

    // 1. Check Personal Best Achievement
    const personalBestAchievements = await checkPersonalBestAchievement(
      userId,
      newEloRating,
      currentBestElo,
    );
    allUnlockedAchievements.push(...personalBestAchievements);

    // Update best ELO if needed
    if (newEloRating > currentBestElo) {
      updates.best_elo_rating = newEloRating;
    }

    // 2. Check Comeback Achievement
    const comebackResult = await checkComebackAchievement(
      userId,
      newEloRating,
      updates.best_elo_rating || currentBestElo,
      lastEloDrop,
    );
    allUnlockedAchievements.push(...comebackResult.achievements);
    Object.assign(updates, comebackResult.updateData);

    // 3. Check Consecutive Improvements Achievement
    const consecutiveResult = await checkConsecutiveImprovementsAchievement(
      userId,
      newEloRating,
      sessionStartElo,
      currentStreak,
    );
    allUnlockedAchievements.push(...consecutiveResult.achievements);
    Object.assign(updates, consecutiveResult.updateData);

    // Update user's progress tracking data (only if fields exist)
    if (Object.keys(updates).length > 0) {
      console.log('🔄 Attempting to update progress tracking data:', updates);

      const { error: updateError } = await supabase
        .from('Users')
        .update(updates)
        .eq('id', userId);

      if (updateError) {
        console.error(
          '⚠️ Error updating user progress data (fields may not exist):',
          updateError.message,
        );
        console.log(
          '💡 To fix this, run the database migration to add progress tracking fields',
        );
        // Don't fail the whole function if progress tracking update fails
      } else {
        console.log('✅ Progress tracking data updated successfully');
      }
    }

    return allUnlockedAchievements;
  } catch (error) {
    console.error('Error checking progress achievements:', error);
    return [];
  }
}

/**
 * Initialize progress tracking for a user
 * Call this when a user starts their first session
 */
export async function initializeProgressTracking(userId, initialElo) {
  try {
    const { error } = await supabase
      .from('Users')
      .update({
        best_elo_rating: initialElo,
        last_session_elo: initialElo,
        consecutive_improvements: 0,
        last_elo_drop: 0,
      })
      .eq('id', userId);

    if (error) {
      console.error('Error initializing progress tracking:', error);
    }
  } catch (error) {
    console.error('Error in initializeProgressTracking:', error);
  }
}
