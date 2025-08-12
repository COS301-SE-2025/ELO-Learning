// achievementRoutes.js
import express from 'express';
import { supabase } from '../database/supabaseClient.js';

const router = express.Router();

// Get all achievement categories
router.get('/achievement-categories', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('AchievementCategories')
      .select('*');

    if (error) throw error;

    res.status(200).json({ categories: data });
  } catch (err) {
    console.error('Error fetching achievement categories:', err.message);
    res.status(500).json({ error: 'Failed to fetch achievement categories' });
  }
});

// Get all achievements (optionally filtered by category)
router.get('/achievements', async (req, res) => {
  try {
    const { category_id } = req.query;
    let query = supabase
      .from('Achievements')
      .select('*, AchievementCategories(name)');

    if (category_id) {
      query = query.eq('category_id', category_id);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.status(200).json({ achievements: data });
  } catch (err) {
    console.error('Error fetching achievements:', err.message);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

// Get user's achievements (with authentication)
router.get('/users/:userId/achievements', async (req, res) => {
  try {
    const { userId } = req.params;

    // Add authentication check
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ error: 'You are unauthorized to make this request.' });
    }

    // First verify if the user exists
    const { data: user, error: userError } = await supabase
      .from('Users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('User fetch error:', userError.message);
      return res.status(404).json({ error: 'User not found' });
    }

    const { data: unlockedAchievements, error: unlockedError } = await supabase
      .from('UserAchievements')
      .select(
        'achievement_id, unlocked_at, Achievements(*, AchievementCategories(name))',
      )
      .eq('user_id', userId);

    if (unlockedError) {
      console.error('Unlocked achievements error:', unlockedError.message);
      return res
        .status(500)
        .json({ error: 'Failed to fetch unlocked achievements' });
    }

    // Get progress for locked achievements
    const { data: progress, error: progressError } = await supabase
      .from('AchievementProgress')
      .select('achievement_id, current_value, updated_at')
      .eq('user_id', userId);

    if (progressError) {
      console.error('Achievement progress error:', progressError.message);
      return res
        .status(500)
        .json({ error: 'Failed to fetch achievement progress' });
    }

    // Initialize empty arrays if no data
    const safeUnlockedAchievements = unlockedAchievements || [];
    const safeProgress = progress || [];

    // Combine unlocked achievements with progress data
    const achievementsWithProgress = safeUnlockedAchievements.map(
      (achievement) => ({
        ...achievement,
        progress:
          safeProgress.find(
            (p) => p.achievement_id === achievement.achievement_id,
          )?.current_value || 0,
      }),
    );

    res.status(200).json({ achievements: achievementsWithProgress });
  } catch (err) {
    console.error('Error fetching user achievements:', err.message);
    res.status(500).json({ error: 'Failed to fetch user achievements' });
  }
});

// Update achievement progress (with authentication, no XP rewards)
router.post('/users/:userId/achievements/progress', async (req, res) => {
  try {
    const { userId } = req.params;
    const { achievement_id, increment_by = 1 } = req.body;

    // Add authentication check
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ error: 'You are unauthorized to make this request.' });
    }

    // Get current progress
    const { data: currentProgress, error: progressError } = await supabase
      .from('AchievementProgress')
      .select('current_value')
      .eq('user_id', userId)
      .eq('achievement_id', achievement_id)
      .single();

    if (progressError && progressError.code !== 'PGRST116') throw progressError;

    const newValue = (currentProgress?.current_value || 0) + increment_by;

    // Update or insert progress
    const { data: updatedProgress, error: updateError } = await supabase
      .from('AchievementProgress')
      .upsert({
        user_id: userId,
        achievement_id,
        current_value: newValue,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (updateError) throw updateError;

    // Check if achievement should be unlocked (removed XP logic)
    const { data: achievement, error: achievementError } = await supabase
      .from('Achievements')
      .select('condition_value') // Removed xp_reward from select
      .eq('id', achievement_id)
      .single();

    if (achievementError) throw achievementError;

    let achievementUnlocked = false;

    if (newValue >= achievement.condition_value) {
      // Unlock achievement if not already unlocked
      const { error: unlockError } = await supabase
        .from('UserAchievements')
        .insert({
          user_id: userId,
          achievement_id,
          unlocked_at: new Date().toISOString(),
        })
        .select()
        .single();

      // Ignore if already unlocked (unique constraint violation)
      if (unlockError && unlockError.code !== '23505') throw unlockError;

      // Set flag if successfully unlocked (or if it was a duplicate)
      achievementUnlocked = true;
    }

    res.status(200).json({
      progress: updatedProgress,
      achievement_unlocked: achievementUnlocked,
    });
  } catch (err) {
    console.error('Error updating achievement progress:', err.message);
    res.status(500).json({ error: 'Failed to update achievement progress' });
  }
});

// Get all achievements with user progress (for achievements page)
router.get('/users/:userId/achievements/all', async (req, res) => {
  try {
    const { userId } = req.params;

    // Add authentication check
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ error: 'You are unauthorized to make this request.' });
    }

    // Get all achievements
    const { data: allAchievements, error: achievementsError } = await supabase
      .from('Achievements')
      .select('*, AchievementCategories(name)')
      .order('category_id', { ascending: true });

    if (achievementsError) throw achievementsError;

    // Get user's unlocked achievements
    const { data: userAchievements, error: userError } = await supabase
      .from('UserAchievements')
      .select('achievement_id, unlocked_at')
      .eq('user_id', userId);

    if (userError) throw userError;

    // Get user's progress
    const { data: userProgress, error: progressError } = await supabase
      .from('AchievementProgress')
      .select('achievement_id, current_value')
      .eq('user_id', userId);

    if (progressError) throw progressError;

    // Combine all data
    const achievementsWithStatus = allAchievements.map((achievement) => {
      const unlocked = userAchievements.find(
        (ua) => ua.achievement_id === achievement.id,
      );
      const progress = userProgress.find(
        (up) => up.achievement_id === achievement.id,
      );

      return {
        ...achievement,
        unlocked: !!unlocked,
        unlocked_at: unlocked?.unlocked_at || null,
        current_progress: progress?.current_value || 0,
        progress_percentage: Math.min(
          100,
          Math.round(
            ((progress?.current_value || 0) / achievement.condition_value) *
              100,
          ),
        ),
      };
    });

    res.status(200).json({ achievements: achievementsWithStatus });
  } catch (err) {
    console.error('Error fetching user achievements status:', err.message);
    res.status(500).json({ error: 'Failed to fetch achievements status' });
  }
});

// Helper function to trigger achievement progress
// Manual achievement progress sync endpoint (for fixing missing progress)
router.post('/users/:userId/achievements/sync', async (req, res) => {
  try {
    const { userId } = req.params;

    // Add authentication check
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ error: 'You are unauthorized to make this request.' });
    }

    console.log(`🔄 Syncing achievements for user ${userId}...`);

    // Get all "Questions Answered" achievements to sync progress
    const { data: questionAchievements, error: achievementsError } = await supabase
      .from('Achievements')
      .select('id, name, condition_type, condition_value')
      .eq('condition_type', 'Questions Answered');

    if (achievementsError) {
      throw achievementsError;
    }

    // For each Questions Answered achievement, ensure there's a progress record
    let syncedCount = 0;
    for (const achievement of questionAchievements) {
      // Check if progress exists
      const { data: existingProgress, error: progressError } = await supabase
        .from('AchievementProgress')
        .select('current_value')
        .eq('user_id', userId)
        .eq('achievement_id', achievement.id)
        .single();

      // If no progress exists, create with 0 (will be updated next time user answers questions)
      if (progressError && progressError.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('AchievementProgress')
          .insert({
            user_id: userId,
            achievement_id: achievement.id,
            current_value: 0,
            updated_at: new Date().toISOString()
          });

        if (!insertError) {
          syncedCount++;
          console.log(`✅ Created progress record for: ${achievement.name}`);
        }
      }
    }

    res.status(200).json({ 
      message: `Synced ${syncedCount} achievement progress records`,
      synced_count: syncedCount 
    });
  } catch (err) {
    console.error('Error syncing achievement progress:', err.message);
    res.status(500).json({ error: 'Failed to sync achievement progress' });
  }
});

export async function triggerAchievementProgress(
  userId,
  conditionType,
  increment = 1,
) {
  try {
    // Find all achievements that match this condition type
    // Only exclude ELO-specific types if they are being passed to this function
    let query = supabase
      .from('Achievements')
      .select('id, condition_type, condition_value')
      .eq('condition_type', conditionType);
    
    // Don't apply the exclusion filter - let each achievement type be processed
    const { data: achievements, error: achievementsError } = await query;

    if (achievementsError) {
      console.error('Error fetching achievements:', achievementsError.message);
      return { success: false, unlockedAchievements: [] };
    }

    const unlockedAchievements = [];

    // Update progress for each matching achievement directly
    for (const achievement of achievements) {
      try {
        // Get current progress
        const { data: currentProgress, error: progressError } = await supabase
          .from('AchievementProgress')
          .select('current_value')
          .eq('user_id', userId)
          .eq('achievement_id', achievement.id)
          .single();

        let currentValue = 0;
        if (!progressError && currentProgress) {
          currentValue = currentProgress.current_value;
        } else if (progressError && progressError.code === 'PGRST116') {
          // No progress record exists - this is common for new achievements
          console.log(`📝 No progress record found for achievement ${achievement.id}, starting from 0`);
          currentValue = 0;
        }

        let newValue;
        if (conditionType === 'Badges Collected') {
          // For Badge Collector, set to total count rather than increment
          newValue = increment; // increment is actually the total count for Badge Collector
        } else {
          // For normal achievements, increment the current value
          newValue = currentValue + increment;
        }

        // Upsert the progress with explicit conflict resolution
        const { error: upsertError } = await supabase
          .from('AchievementProgress')
          .upsert({
            user_id: userId,
            achievement_id: achievement.id,
            current_value: newValue,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id,achievement_id',
            ignoreDuplicates: false
          });

        if (upsertError) {
          console.error(`Error updating progress for achievement ${achievement.id}:`, upsertError.message);
          continue;
        }

        console.log(`📈 Progress updated: Achievement ${achievement.id} (${achievement.condition_type}) - ${newValue}/${achievement.condition_value} for user ${userId}`);

        // Check if achievement is now complete
        if (newValue >= achievement.condition_value) {
          // Check if user already has this achievement
          const { data: existing, error: existingError } = await supabase
            .from('UserAchievements')
            .select('user_id, achievement_id')
            .eq('user_id', userId)
            .eq('achievement_id', achievement.id)
            .single();

          // If not already unlocked, unlock it
          if (existingError && existingError.code === 'PGRST116') { // No rows found
            const { error: unlockError } = await supabase
              .from('UserAchievements')
              .insert({
                user_id: userId,
                achievement_id: achievement.id,
                unlocked_at: new Date().toISOString(),
              });

            if (!unlockError) {
              // Get achievement details for notification
              const { data: achievementDetails, error: detailsError } =
                await supabase
                  .from('Achievements')
                  .select('*, AchievementCategories(name)')
                  .eq('id', achievement.id)
                  .single();

              if (!detailsError && achievementDetails) {
                unlockedAchievements.push(achievementDetails);
                console.log(`✅ Unlocked achievement: ${achievementDetails.name} (${conditionType}: ${newValue}/${achievement.condition_value})`);
                
                // 🏆 NEW: Check for Badge Collector achievement after unlocking any achievement
                if (conditionType !== 'Badges Collected') { // Prevent infinite loop
                  const badgeCollectorResults = await checkBadgeCollectorAchievement(userId);
                  unlockedAchievements.push(...badgeCollectorResults);
                }
              }
            } else {
              console.error(`Error unlocking achievement ${achievement.id}:`, unlockError.message);
            }
          }
        } else {
          console.log(`📈 Progress updated: ${achievement.id} - ${newValue}/${achievement.condition_value}`);
        }
      } catch (error) {
        console.error(`Error updating achievement ${achievement.id}:`, error);
      }
    }

    return { success: true, unlockedAchievements };
  } catch (error) {
    console.error('Error in triggerAchievementProgress:', error);
    return { success: false, unlockedAchievements: [] };
  }
}

// Specific helper functions for different game events
export async function checkQuestionAchievements(userId, isCorrect) {
  const results = [];

  if (isCorrect) {
    // Trigger "Questions Answered" achievements
    const questionResult = await triggerAchievementProgress(
      userId,
      'Questions Answered',
      1,
    );
    results.push(questionResult);

    // Note: "Problems Solved" has been replaced with "Questions Answered" in the new achievement system
    // All question-based achievements now use "Questions Answered" condition type
  }

  return results.flatMap((r) => r.unlockedAchievements);
}

export async function checkMatchAchievements(userId) {
  const result = await triggerAchievementProgress(userId, 'Matches Played', 1);
  return result.unlockedAchievements;
}

export async function checkQueueAchievements(userId) {
  // For queue-based achievements like "Queue Warrior", "Matchmaker"
  const result = await triggerAchievementProgress(userId, 'Queue Joins', 1);
  return result.unlockedAchievements;
}

export async function checkFastSolveAchievements(userId, timeSpent, isCorrect) {
  // Only count fast solves for correct answers
  if (!isCorrect || !timeSpent || typeof timeSpent !== 'number') {
    return [];
  }

  // Define what constitutes a "fast solve" (10 seconds or less)
  const FAST_SOLVE_THRESHOLD = 10;
  
  if (timeSpent <= FAST_SOLVE_THRESHOLD) {
    console.log(`⚡ Fast solve detected: ${timeSpent}s (threshold: ${FAST_SOLVE_THRESHOLD}s)`);
    const result = await triggerAchievementProgress(userId, 'Fast Solves', 1);
    return result.unlockedAchievements;
  }
  
  return [];
}

export async function checkStreakAchievements(userId, days) {
  // For daily login/activity streaks
  const result = await triggerAchievementProgress(userId, 'Daily Streak', days);
  return result.unlockedAchievements;
}

export async function checkNeverGiveUpAchievement(userId, questionId, isCorrect, attemptNumber) {
  // "Never Give Up" achievement: Attempt the same tough problem 5 times until solved
  // Only track if this is a correct answer after multiple attempts
  if (!isCorrect || attemptNumber < 5) {
    return [];
  }

  console.log(`💪 Never Give Up achievement triggered: User ${userId} solved question ${questionId} on attempt ${attemptNumber}`);
  
  // Trigger the "Never Give Up" achievement (using existing "Problem Attempts" condition type)
  const result = await triggerAchievementProgress(userId, 'Problem Attempts', 5);
  return result.unlockedAchievements;
}

// New achievement functions for updated system
export async function checkTimeBasedAchievements(userId, sessionHour) {
  const results = [];
  
  // Check for Early Bird (6 AM - 9 AM)
  if (sessionHour >= 6 && sessionHour <= 9) {
    console.log(`🌅 Early Bird session detected at ${sessionHour}:00`);
    const morningResult = await triggerAchievementProgress(userId, 'Morning Sessions', 1);
    results.push(...morningResult.unlockedAchievements);
  }
  
  // Check for Night Owl (10 PM - 6 AM)
  if (sessionHour >= 22 || sessionHour <= 6) {
    console.log(`🦉 Night Owl session detected at ${sessionHour}:00`);
    const nightResult = await triggerAchievementProgress(userId, 'Night Sessions', 1);
    results.push(...nightResult.unlockedAchievements);
  }
  
  return results;
}

export async function checkWeekendAchievements(userId, isWeekend) {
  if (isWeekend) {
    console.log('🎮 Weekend session detected');
    const result = await triggerAchievementProgress(userId, 'Weekend Sessions', 1);
    return result.unlockedAchievements;
  }
  return [];
}

export async function checkMarathonAchievements(userId, problemsInSession) {
  // For Marathon Session: 50 problems in a single sitting
  if (problemsInSession >= 50) {
    console.log(`🏃‍♂️ Marathon session detected: ${problemsInSession} problems`);
    const result = await triggerAchievementProgress(userId, 'Problems Per Session', problemsInSession);
    return result.unlockedAchievements;
  }
  return [];
}

export async function checkAccuracyAchievements(userId, accuracyData) {
  // For High Accuracy Streak achievements (Precision Master, Flawless Execution)
  // accuracyData should contain: { questionsAnswered, correctAnswers, currentAccuracy }
  const { questionsAnswered, correctAnswers, currentAccuracy } = accuracyData;
  
  if (currentAccuracy >= 0.95) { // 95%+ accuracy
    console.log(`🎯 High accuracy detected: ${(currentAccuracy * 100).toFixed(1)}%`);
    const result = await triggerAchievementProgress(userId, 'High Accuracy Streak', questionsAnswered);
    return result.unlockedAchievements;
  }
  
  return [];
}

export async function checkSubjectMasteryAchievements(userId, subject, isCorrect) {
  // For Subject Mastery achievements (Algebra Master, Geometry Genius)
  if (isCorrect && subject) {
    const subjectLower = subject.toLowerCase();
    console.log(`📚 Subject mastery progress: ${subject}`);
    const result = await triggerAchievementProgress(userId, 'Subject Questions Correct', 1);
    return result.unlockedAchievements;
  }
  return [];
}

export async function checkLeaderboardAchievements(userId) {
  try {
    console.log(`🏆 Checking leaderboard position achievements for user ${userId}`);

    // Get all users ordered by XP (descending) to determine leaderboard position
    const { data: allUsers, error: usersError } = await supabase
      .from('Users')
      .select('id, xp')
      .order('xp', { ascending: false });

    if (usersError) {
      console.error('Error fetching users for leaderboard:', usersError.message);
      return [];
    }

    if (!allUsers || allUsers.length === 0) {
      console.log('No users found for leaderboard calculation');
      return [];
    }

    // Find user's position in leaderboard (1-based ranking)
    const userPosition = allUsers.findIndex(user => user.id === userId) + 1;
    
    if (userPosition === 0) {
      console.log(`User ${userId} not found in leaderboard`);
      return [];
    }

    const totalUsers = allUsers.length;
    const percentile = (userPosition / totalUsers) * 100;

    console.log(`📊 User ${userId} leaderboard stats: Position ${userPosition}/${totalUsers} (${percentile.toFixed(1)}th percentile)`);

    // Get all leaderboard achievements to check multiple thresholds
    const { data: leaderboardAchievements, error: achievementsError } = await supabase
      .from('Achievements')
      .select('id, name, description, condition_value')
      .eq('condition_type', 'Leaderboard Position')
      .order('condition_value', { ascending: true });

    if (achievementsError) {
      console.error('Error fetching leaderboard achievements:', achievementsError.message);
      return [];
    }

    if (!leaderboardAchievements || leaderboardAchievements.length === 0) {
      console.log('No leaderboard achievements found');
      return [];
    }

    const unlockedAchievements = [];

    // Check different percentile thresholds based on achievement names
    for (const achievement of leaderboardAchievements) {
      let thresholdPercentile;
      
      // Determine threshold based on achievement name/description
      if (achievement.name.toLowerCase().includes('top 1%') || achievement.name.toLowerCase().includes('mastermind')) {
        thresholdPercentile = 1;
      } else if (achievement.name.toLowerCase().includes('top 5%') || achievement.name.toLowerCase().includes('legend')) {
        thresholdPercentile = 5;
      } else if (achievement.name.toLowerCase().includes('top 10%') || achievement.name.toLowerCase().includes('elite')) {
        thresholdPercentile = 10;
      } else {
        // Default to top 10% if unclear
        thresholdPercentile = 10;
      }

      if (percentile <= thresholdPercentile) {
        console.log(`🎯 User qualifies for ${achievement.name} (${percentile.toFixed(1)}th percentile ≤ ${thresholdPercentile}%)`);
        
        // For leaderboard achievements, we need to handle them differently than regular achievements
        // Check if user already has this achievement
        const { data: existing, error: existingError } = await supabase
          .from('UserAchievements')
          .select('user_id, achievement_id')
          .eq('user_id', userId)
          .eq('achievement_id', achievement.id)
          .single();

        // If not already unlocked, unlock it directly
        if (existingError && existingError.code === 'PGRST116') { // No rows found
          const { error: unlockError } = await supabase
            .from('UserAchievements')
            .insert({
              user_id: userId,
              achievement_id: achievement.id,
              unlocked_at: new Date().toISOString(),
            });

          if (!unlockError) {
            // Get achievement details for notification
            const { data: achievementDetails, error: detailsError } = await supabase
              .from('Achievements')
              .select('*, AchievementCategories(name)')
              .eq('id', achievement.id)
              .single();

            if (!detailsError && achievementDetails) {
              unlockedAchievements.push(achievementDetails);
              console.log(`✅ Unlocked leaderboard achievement: ${achievementDetails.name} (Position ${userPosition}/${totalUsers} - ${percentile.toFixed(1)}th percentile)`);
            }
          } else {
            console.error(`Error unlocking leaderboard achievement ${achievement.id}:`, unlockError.message);
          }
        } else if (!existingError) {
          console.log(`📋 User already has leaderboard achievement: ${achievement.name}`);
        }
      } else {
        console.log(`📈 User doesn't qualify for ${achievement.name} yet (${percentile.toFixed(1)}th percentile > ${thresholdPercentile}%)`);
      }
    }

    return unlockedAchievements;
  } catch (error) {
    console.error('Error in checkLeaderboardAchievements:', error);
    return [];
  }
}

export async function checkBadgeCollectorAchievement(userId) {
  try {
    console.log(`🏆 Checking Badge Collector achievement for user ${userId}`);
    
    // Count total unlocked achievements for the user (excluding Badge Collector itself to avoid infinite loop)
    const { data: userAchievements, error: countError } = await supabase
      .from('UserAchievements')
      .select('achievement_id, Achievements!inner(condition_type)')
      .eq('user_id', userId)
      .neq('Achievements.condition_type', 'Badges Collected');

    if (countError) {
      console.error('Error counting user achievements:', countError.message);
      return [];
    }

    const totalBadges = userAchievements?.length || 0;
    console.log(`📊 User ${userId} has ${totalBadges} non-badge-collector badges`);

    if (totalBadges === 0) {
      console.log('⚠️  User has no badges yet, skipping Badge Collector check');
      return [];
    }

    // Check current Badge Collector progress to see if we need to update
    const { data: currentBadgeProgress, error: progressError } = await supabase
      .from('AchievementProgress')
      .select('current_value, achievement_id, Achievements!inner(condition_type)')
      .eq('user_id', userId)
      .eq('Achievements.condition_type', 'Badges Collected');

    if (progressError) {
      console.error('Error checking Badge Collector progress:', progressError.message);
    }

    // Only update if the badge count has changed
    const currentBadgeCount = currentBadgeProgress?.[0]?.current_value || 0;
    if (currentBadgeCount === totalBadges) {
      console.log(`📊 Badge count unchanged (${totalBadges}), skipping update`);
      return [];
    }

    // Trigger Badge Collector achievements based on total count
    const badgeResult = await triggerAchievementProgress(
      userId,
      'Badges Collected',
      totalBadges // Set to total count, not increment
    );

    if (badgeResult.unlockedAchievements.length > 0) {
      console.log(`🎉 Badge Collector achievements unlocked:`, badgeResult.unlockedAchievements.map(a => a.name));
    }

    return badgeResult.unlockedAchievements;
  } catch (error) {
    console.error('Error in checkBadgeCollectorAchievement:', error);
    return [];
  }
}

export async function checkProfileAchievements(userId) {
  // For profile customization achievements
  const result = await triggerAchievementProgress(
    userId,
    'Customizations Unlocked',
    1,
  );
  return result.unlockedAchievements;
}

export async function checkEloAchievements(userId, newEloRating) {
  try {
    if (!newEloRating || typeof newEloRating !== 'number') {
      return [];
    }

    console.log(
      `🎯 Checking ELO achievements for user ${userId} with rating ${newEloRating}`,
    );

    // Get all ELO rating achievements
    const { data: eloAchievements, error: achievementsError } = await supabase
      .from('Achievements')
      .select('id, name, condition_value, description')
      .eq('condition_type', 'ELO Rating Reached')
      .order('condition_value', { ascending: true });

    if (achievementsError) {
      console.error(
        'Error fetching ELO achievements:',
        achievementsError.message,
      );
      return [];
    }

    if (!eloAchievements || eloAchievements.length === 0) {
      console.log('No ELO achievements found');
      return [];
    }

    // Get user's already unlocked achievements to avoid duplicates
    const { data: userAchievements, error: userError } = await supabase
      .from('UserAchievements')
      .select('achievement_id')
      .eq('user_id', userId)
      .in(
        'achievement_id',
        eloAchievements.map((a) => a.id),
      );

    if (userError) {
      console.error('Error fetching user achievements:', userError.message);
      return [];
    }

    const unlockedIds = (userAchievements || []).map((ua) => ua.achievement_id);
    const newlyUnlockedAchievements = [];

    // Check each ELO achievement
    for (const achievement of eloAchievements) {
      // Skip if already unlocked
      if (unlockedIds.includes(achievement.id)) {
        continue;
      }

      // Check if user's ELO rating meets the requirement
      if (newEloRating >= achievement.condition_value) {
        try {
          // Unlock the achievement
          const { error: unlockError } = await supabase
            .from('UserAchievements')
            .insert({
              user_id: userId,
              achievement_id: achievement.id,
              unlocked_at: new Date().toISOString(),
            });

          // Ignore duplicate errors (achievement already unlocked)
          if (unlockError && unlockError.code !== '23505') {
            console.error(
              `Error unlocking achievement ${achievement.id}:`,
              unlockError.message,
            );
            continue;
          }

          // Get full achievement details for response
          const { data: fullAchievement, error: detailsError } = await supabase
            .from('Achievements')
            .select('*, AchievementCategories(name)')
            .eq('id', achievement.id)
            .single();

          if (!detailsError && fullAchievement) {
            newlyUnlockedAchievements.push(fullAchievement);
            console.log(
              `✅ Unlocked ELO achievement: ${achievement.name} (Rating ${achievement.condition_value})`,
            );
          }
        } catch (error) {
          console.error(
            `Error processing achievement ${achievement.id}:`,
            error,
          );
        }
      }
    }

    console.log(
      `🏆 Unlocked ${newlyUnlockedAchievements.length} new ELO achievements`,
    );
    return newlyUnlockedAchievements;
  } catch (error) {
    console.error('Error in checkEloAchievements:', error);
    return [];
  }
}

// Perfect Session Achievement Endpoint
router.post('/users/:userId/achievements/perfect-session', async (req, res) => {
  try {
    const { userId } = req.params;
    const { consecutiveCorrect, totalQuestions, mode } = req.body;

    console.log('🎯 Perfect Session achievement request:', {
      userId,
      consecutiveCorrect,
      totalQuestions,
      mode
    });

    // Validate requirements - now works for all modes
    if (consecutiveCorrect < 10) {
      return res.status(400).json({
        success: false,
        error: `Need 10 consecutive correct answers, got ${consecutiveCorrect}`
      });
    }

    // Check if Perfect Session achievement exists in database
    const { data: perfectSessionAchievements, error: achievementError } = await supabase
      .from('Achievements')
      .select('*')
      .eq('achievement_name', 'Perfect Session')
      .eq('condition_type', 'Perfect Session Completed');

    if (achievementError) {
      console.error('❌ Error fetching Perfect Session achievement:', achievementError);
      return res.status(500).json({
        success: false,
        error: 'Failed to check Perfect Session achievement'
      });
    }

    if (!perfectSessionAchievements || perfectSessionAchievements.length === 0) {
      console.log('⚠️ Perfect Session achievement not found in database');
      return res.status(404).json({
        success: false,
        error: 'Perfect Session achievement not configured in database'
      });
    }

    const perfectSessionAchievement = perfectSessionAchievements[0];
    console.log('🎯 Found Perfect Session achievement:', perfectSessionAchievement);

    // Check if user already has this achievement
    const { data: existingUnlock, error: unlockCheckError } = await supabase
      .from('UserAchievements')
      .select('*')
      .eq('user_id', userId)
      .eq('achievement_id', perfectSessionAchievement.id);

    if (unlockCheckError) {
      console.error('❌ Error checking existing Perfect Session unlock:', unlockCheckError);
      return res.status(500).json({
        success: false,
        error: 'Failed to check existing achievement'
      });
    }

    if (existingUnlock && existingUnlock.length > 0) {
      console.log('📋 User already has Perfect Session achievement');
      return res.json({
        success: true,
        message: 'Perfect Session achievement already unlocked',
        unlockedAchievements: []
      });
    }

    // Unlock the Perfect Session achievement
    const { data: newUnlock, error: unlockError } = await supabase
      .from('UserAchievements')
      .insert({
        user_id: userId,
        achievement_id: perfectSessionAchievement.id,
        unlocked_at: new Date().toISOString()
      })
      .select('*, Achievements(*, AchievementCategories(name))');

    if (unlockError) {
      console.error('❌ Error unlocking Perfect Session achievement:', unlockError);
      return res.status(500).json({
        success: false,
        error: 'Failed to unlock Perfect Session achievement'
      });
    }

    console.log('🏆 Perfect Session achievement unlocked!', newUnlock);

    const unlockedAchievement = newUnlock[0];
    const achievementData = {
      id: unlockedAchievement.achievement_id,
      name: unlockedAchievement.Achievements.achievement_name,
      description: unlockedAchievement.Achievements.description,
      badge_icon_url: unlockedAchievement.Achievements.badge_icon_url,
      category: unlockedAchievement.Achievements.AchievementCategories?.name,
      unlocked_at: unlockedAchievement.unlocked_at,
      context: {
        consecutiveCorrect,
        totalQuestions,
        mode
      }
    };

    res.json({
      success: true,
      message: 'Perfect Session achievement unlocked!',
      unlockedAchievements: [achievementData]
    });

  } catch (error) {
    console.error('❌ Perfect Session achievement error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Never Give Up Achievement Endpoint - Track problem attempts
router.post('/users/:userId/achievements/never-give-up', async (req, res) => {
  try {
    const { userId } = req.params;
    const { questionId, isCorrect, attemptNumber } = req.body;

    console.log(`🎯 Never Give Up check: User ${userId}, Question ${questionId}, Attempt ${attemptNumber}, Correct: ${isCorrect}`);

    // Check for Never Give Up achievement
    const unlockedAchievements = await checkNeverGiveUpAchievement(userId, questionId, isCorrect, attemptNumber);

    res.json({
      success: true,
      message: unlockedAchievements.length > 0 ? 'Never Give Up achievement unlocked!' : 'Attempt tracked',
      unlockedAchievements,
      context: {
        questionId,
        attemptNumber,
        isCorrect
      }
    });

  } catch (error) {
    console.error('❌ Never Give Up achievement error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
