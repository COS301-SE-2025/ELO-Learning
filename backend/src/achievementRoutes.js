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

// Get user's unlocked achievements using proper junction table
router.get('/users/:userId/achievements', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('🔍 Fetching achievements for user:', userId);

    // Check authorization header
    const authHeader = req.headers.authorization;
    console.log('🔍 Auth header:', authHeader ? 'Present' : 'Missing');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log(
        '🔐 No authorization header - returning empty achievements for new user',
      );
      return res.status(200).json({
        achievements: [],
        message:
          'No authentication - returning empty achievements for new user',
      });
    }

    // Verify user exists first
    const { data: user, error: userError } = await supabase
      .from('Users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('❌ User fetch error:', userError.message);
      console.log('🎯 User not found - returning empty achievements');
      return res.status(200).json({
        achievements: [],
        message: 'User not found - returning empty achievements',
      });
    }

    console.log('✅ User found:', user);

    // Get user's unlocked achievements using the junction table
    const { data: userAchievements, error: achievementError } = await supabase
      .from('UserAchievements')
      .select(
        `
        unlocked_at,
        Achievements (
          id,
          name,
          description,
          condition_type,
          condition_value,
          icon_path,
          AchievementCategories (
            name
          )
        )
      `,
      )
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });

    if (achievementError) {
      console.error('❌ Achievement fetch error:', achievementError.message);
      return res.status(500).json({
        error: 'Failed to fetch user achievements',
        details: achievementError.message,
      });
    }

    console.log(
      `✅ Found ${userAchievements?.length || 0} achievements for user`,
    );

    // Format the response
    const formattedAchievements = (userAchievements || []).map((ua) => ({
      id: ua.Achievements.id,
      name: ua.Achievements.name,
      description: ua.Achievements.description,
      condition_type: ua.Achievements.condition_type,
      condition_value: ua.Achievements.condition_value,
      icon_path: ua.Achievements.icon_path,
      category: ua.Achievements.AchievementCategories?.name || 'General',
      unlocked_at: ua.unlocked_at,
    }));

    return res.status(200).json({
      achievements: formattedAchievements,
      total: formattedAchievements.length,
      message: `Found ${formattedAchievements.length} unlocked achievements`,
    });
  } catch (error) {
    console.error('❌ Achievement route error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
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

    async function syncUserAchievements(userId) {
      try {
        console.log(`Syncing achievements for user ${userId}...`);

        // Get all "Questions Answered" achievements to sync progress
        const { data: questionAchievements, error: achievementsError } =
          await supabase
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
          const { data: existingProgress, error: progressError } =
            await supabase
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
                updated_at: new Date().toISOString(),
              });

            if (!insertError) {
              syncedCount++;
              console.log(`Created progress record for: ${achievement.name}`);
            }
          }
        }

        return {
          message: `Synced ${syncedCount} achievement progress records`,
          synced_count: syncedCount,
        };
      } catch (err) {
        throw err;
      }
    }

    const result = await syncUserAchievements(userId);
    res.status(200).json(result);
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
  console.log(`🚀 ACHIEVEMENT DEBUG - triggerAchievementProgress called:`, {
    userId,
    conditionType,
    increment,
  });

  try {
    // Find all achievements that match this condition type
    // Only exclude ELO-specific types if they are being passed to this function
    let query = supabase
      .from('Achievements')
      .select('id, condition_type, condition_value')
      .eq('condition_type', conditionType);

    // Don't apply the exclusion filter - let each achievement type be processed
    const { data: achievements, error: achievementsError } = await query;

    console.log(`🔍 ACHIEVEMENT DEBUG - Database query result:`, {
      achievementsError: achievementsError?.message,
      achievementsCount: achievements?.length || 0,
      achievements: achievements?.map((a) => ({
        id: a.id,
        name: a.name,
        condition_value: a.condition_value,
      })),
    });

    if (achievementsError) {
      console.error(
        '❌ Error fetching achievements:',
        achievementsError.message,
      );
      return { success: false, unlockedAchievements: [] };
    }

    if (!achievements || achievements.length === 0) {
      console.log(
        `🤷 ACHIEVEMENT DEBUG - No achievements found for condition type: ${conditionType}`,
      );
      return { success: true, unlockedAchievements: [] };
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
          .upsert(
            {
              user_id: userId,
              achievement_id: achievement.id,
              current_value: newValue,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: 'user_id,achievement_id',
              ignoreDuplicates: false,
            },
          );

        if (upsertError) {
          console.error(
            `Error updating progress for achievement ${achievement.id}:`,
            upsertError.message,
          );
          continue;
        }

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
          if (existingError && existingError.code === 'PGRST116') {
            // No rows found
            const { error: unlockError } = await supabase
              .from('UserAchievements')
              .insert({
                user_id: userId,
                achievement_id: achievement.id,
                unlocked_at: new Date().toISOString(),
              });

            // Handle duplicate key errors gracefully (achievement already unlocked by another request)
            if (!unlockError || unlockError.code === '23505') {
              // Success or duplicate key constraint violation (already unlocked)
              if (unlockError && unlockError.code === '23505') {
                console.log(
                  `🔄 Achievement ${achievement.id} already unlocked (duplicate key handled gracefully)`,
                );
              }

              // Get achievement details for notification (only if not a duplicate error)
              if (!unlockError) {
                const { data: achievementDetails, error: detailsError } =
                  await supabase
                    .from('Achievements')
                    .select('*, AchievementCategories(name)')
                    .eq('id', achievement.id)
                    .single();

                if (!detailsError && achievementDetails) {
                  unlockedAchievements.push(achievementDetails);

                  // Check for Badge Collector achievement after unlocking any achievement
                  if (conditionType !== 'Badges Collected') {
                    // Prevent infinite loop
                    const badgeCollectorResults =
                      await checkBadgeCollectorAchievement(userId);
                    unlockedAchievements.push(...badgeCollectorResults);
                  }
                }
              }
            } else {
              console.error(
                `Error unlocking achievement ${achievement.id}:`,
                unlockError.message,
              );
            }
          }
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
export async function checkQuestionAchievements(
  userId,
  isCorrect,
  gameMode = null,
) {
  console.log(`🎯 ACHIEVEMENT DEBUG - checkQuestionAchievements called with:`, {
    userId,
    isCorrect,
    gameMode,
  });

  const results = [];

  if (isCorrect) {
    console.log(
      `🎯 ACHIEVEMENT DEBUG - Answer is correct, triggering "Questions Answered" progress...`,
    );
    // Always trigger "Questions Answered" achievements for any correct answer
    const questionResult = await triggerAchievementProgress(
      userId,
      'Questions Answered',
      1,
    );
    console.log(`🎯 ACHIEVEMENT DEBUG - triggerAchievementProgress returned:`, {
      success: questionResult.success,
      unlockedCount: questionResult.unlockedAchievements?.length || 0,
      achievements:
        questionResult.unlockedAchievements?.map((a) => a.name) || [],
    });
    results.push(questionResult);
  } else {
    console.log(
      `🎯 ACHIEVEMENT DEBUG - Answer is incorrect, skipping achievement checks`,
    );
  }

  const flatResults = results.flatMap((r) => r.unlockedAchievements || []);
  console.log(
    `🎯 ACHIEVEMENT DEBUG - Final checkQuestionAchievements result:`,
    {
      flatResultsLength: flatResults.length,
      achievements: flatResults.map((a) => a.name),
    },
  );
  return flatResults;
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
    const result = await triggerAchievementProgress(userId, 'Fast Solves', 1);
    return result.unlockedAchievements;
  }

  return [];
}

export async function checkStreakAchievements(userId, currentStreak) {
  try {
    console.log(
      `🔥 Checking streak achievements for user ${userId}, current streak: ${currentStreak}`,
    );

    if (!currentStreak || currentStreak <= 0) {
      console.log('🤷 No streak to check achievements for');
      return [];
    }

    // Get all Daily Streak achievements to check multiple milestones
    const { data: streakAchievements, error: achievementsError } =
      await supabase
        .from('Achievements')
        .select('id, name, description, condition_value')
        .eq('condition_type', 'Daily Streak')
        .order('condition_value', { ascending: true });

    if (achievementsError) {
      console.error(
        'Error fetching streak achievements:',
        achievementsError.message,
      );
      return [];
    }

    if (!streakAchievements || streakAchievements.length === 0) {
      console.log('No streak achievements found in database');
      return [];
    }

    console.log(
      `📋 Found ${streakAchievements.length} streak achievements to check`,
    );

    // Get user's already unlocked achievements to avoid duplicates
    const { data: userAchievements, error: userError } = await supabase
      .from('UserAchievements')
      .select('achievement_id')
      .eq('user_id', userId)
      .in(
        'achievement_id',
        streakAchievements.map((a) => a.id),
      );

    if (userError) {
      console.error('Error fetching user achievements:', userError.message);
      return [];
    }

    const unlockedIds = (userAchievements || []).map((ua) => ua.achievement_id);
    const newlyUnlockedAchievements = [];

    // Check each streak achievement
    for (const achievement of streakAchievements) {
      // Skip if already unlocked
      if (unlockedIds.includes(achievement.id)) {
        console.log(`⏭️ Skipping ${achievement.name} - already unlocked`);
        continue;
      }

      // Check if user's current streak meets the requirement
      if (currentStreak >= achievement.condition_value) {
        console.log(
          `🎯 User qualifies for ${achievement.name} (${currentStreak} >= ${achievement.condition_value})`,
        );

        try {
          // Update achievement progress to the current streak value
          const { error: upsertError } = await supabase
            .from('AchievementProgress')
            .upsert(
              {
                user_id: userId,
                achievement_id: achievement.id,
                current_value: currentStreak, // Set to current streak, not increment
                updated_at: new Date().toISOString(),
              },
              {
                onConflict: 'user_id,achievement_id',
                ignoreDuplicates: false,
              },
            );

          if (upsertError) {
            console.error(
              `Error updating progress for streak achievement ${achievement.id}:`,
              upsertError.message,
            );
            continue;
          }

          // Unlock the achievement
          const { error: unlockError } = await supabase
            .from('UserAchievements')
            .insert({
              user_id: userId,
              achievement_id: achievement.id,
              unlocked_at: new Date().toISOString(),
            });

          // Handle duplicate key errors gracefully (achievement already unlocked by another request)
          if (!unlockError || unlockError.code === '23505') {
            // Success or duplicate key constraint violation (already unlocked)
            if (unlockError && unlockError.code === '23505') {
              console.log(
                `🔄 Streak achievement ${achievement.id} already unlocked (duplicate key handled gracefully)`,
              );
              continue; // Skip this achievement, don't add to results
            }

            // Get full achievement details for response (only if not a duplicate error)
            const { data: fullAchievement, error: detailsError } =
              await supabase
                .from('Achievements')
                .select('*, AchievementCategories(name)')
                .eq('id', achievement.id)
                .single();

            if (!detailsError && fullAchievement) {
              newlyUnlockedAchievements.push(fullAchievement);
              console.log(
                `🏆 Unlocked streak achievement: ${achievement.name}`,
              );
            }
          } else {
            console.error(
              `Error unlocking streak achievement ${achievement.id}:`,
              unlockError.message,
            );
            continue;
          }
        } catch (error) {
          console.error(
            `Error processing streak achievement ${achievement.id}:`,
            error,
          );
        }
      } else {
        console.log(
          `📊 ${achievement.name}: ${currentStreak}/${achievement.condition_value} days`,
        );
      }
    }

    console.log(
      `🏆 Unlocked ${newlyUnlockedAchievements.length} new streak achievements`,
    );
    return newlyUnlockedAchievements;
  } catch (error) {
    console.error('Error in checkStreakAchievements:', error);
    return [];
  }
}

export async function checkNeverGiveUpAchievement(
  userId,
  questionId,
  isCorrect,
  attemptNumber,
) {
  // "Never Give Up" achievement: Attempt the same tough problem 5 times until solved
  // Only track if this is a correct answer after multiple attempts
  if (!isCorrect || attemptNumber < 5) {
    return [];
  }

  // Trigger the "Never Give Up" achievement (using existing "Problem Attempts" condition type)
  const result = await triggerAchievementProgress(
    userId,
    'Problem Attempts',
    5,
  );
  return result.unlockedAchievements;
}

// New achievement functions for updated system
export async function checkTimeBasedAchievements(userId, sessionHour) {
  const results = [];

  // Check for Early Bird (6 AM - 9 AM)
  if (sessionHour >= 6 && sessionHour <= 9) {
    const morningResult = await triggerAchievementProgress(
      userId,
      'Morning Sessions',
      1,
    );
    results.push(...morningResult.unlockedAchievements);
  }

  // Check for Night Owl (10 PM - 6 AM)
  if (sessionHour >= 22 || sessionHour <= 6) {
    const nightResult = await triggerAchievementProgress(
      userId,
      'Night Sessions',
      1,
    );
    results.push(...nightResult.unlockedAchievements);
  }

  return results;
}

export async function checkWeekendAchievements(userId, isWeekend) {
  if (isWeekend) {
    const result = await triggerAchievementProgress(
      userId,
      'Weekend Sessions',
      1,
    );
    return result.unlockedAchievements;
  }
  return [];
}

export async function checkMarathonAchievements(userId, problemsInSession) {
  // For Marathon Session: 50 problems in a single sitting
  if (problemsInSession >= 50) {
    const result = await triggerAchievementProgress(
      userId,
      'Problems Per Session',
      problemsInSession,
    );
    return result.unlockedAchievements;
  }
  return [];
}

export async function checkAccuracyAchievements(userId, accuracyData) {
  // For High Accuracy Streak achievements (Precision Master, Flawless Execution)
  // accuracyData should contain: { questionsAnswered, correctAnswers, currentAccuracy }
  const { questionsAnswered, correctAnswers, currentAccuracy } = accuracyData;

  if (currentAccuracy >= 0.95) {
    // 95%+ accuracy
    const result = await triggerAchievementProgress(
      userId,
      'High Accuracy Streak',
      questionsAnswered,
    );
    return result.unlockedAchievements;
  }

  return [];
}

export async function checkSubjectMasteryAchievements(
  userId,
  subject,
  isCorrect,
) {
  // For Subject Mastery achievements (Algebra Master, Geometry Genius)
  if (isCorrect && subject) {
    const subjectLower = subject.toLowerCase();
    // Subject mastery progress
    const result = await triggerAchievementProgress(
      userId,
      'Subject Questions Correct',
      1,
    );
    return result.unlockedAchievements;
  }
  return [];
}

// Replace your existing checkTopicMasteryAchievements function in achievementRoutes.js with this:

export async function checkTopicMasteryAchievements(
  userId,
  topicName,
  isCorrect,
) {
  // Only process correct answers
  if (!isCorrect || !topicName) {
    return [];
  }

  // Enhanced topic name mapping - maps your database topics to specific achievements
  const topicToAchievementMapping = {
    // Direct name matches
    Algebra: ['Algebra Master'],
    Geometry: ['Geometry Genius'],
    Trigonometry: ['Trigonometry Virtuoso'],
    Calculus: ['Calculus Conqueror'],
    Statistics: ['Stats Maestro'],
    'Statistics & Probability': ['Stats Maestro'],
    'Financial Mathematics': ['Financial Wizard'],
    'Sequences & Series': ['Sequence Sage'],
    'Sequences and Series': ['Sequence Sage'],
    'Functions & Graphs': ['Graph Guru'],
    'Functions and Graphs': ['Graph Guru'],

    // Add more variations as needed
    Probability: ['Stats Maestro'],
    Finance: ['Financial Wizard'],
    Functions: ['Graph Guru'],
    Graphs: ['Graph Guru'],
    Sequences: ['Sequence Sage'],
  };

  // Find which achievements this topic should trigger
  const achievementNames = topicToAchievementMapping[topicName];

  if (!achievementNames || achievementNames.length === 0) {
    return [];
  }

  const unlockedAchievements = [];

  // Process each achievement for this topic
  for (const achievementName of achievementNames) {
    try {
      // Find the specific achievement by name
      const { data: achievement, error: achievementError } = await supabase
        .from('Achievements')
        .select('id, name, condition_type, condition_value, description')
        .eq('name', achievementName)
        .eq('condition_type', 'Subject Questions Correct')
        .single();

      if (achievementError || !achievement) {
        continue;
      }

      // Get current progress for this specific achievement
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
        currentValue = 0;
      }

      const newValue = currentValue + 1;

      // Update progress for this specific achievement
      const { error: upsertError } = await supabase
        .from('AchievementProgress')
        .upsert(
          {
            user_id: userId,
            achievement_id: achievement.id,
            current_value: newValue,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,achievement_id',
            ignoreDuplicates: false,
          },
        );

      if (upsertError) {
        console.error(
          `Error updating progress for ${achievement.name}:`,
          upsertError.message,
        );
        continue;
      }

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
        if (existingError && existingError.code === 'PGRST116') {
          // No rows found
          const { error: unlockError } = await supabase
            .from('UserAchievements')
            .insert({
              user_id: userId,
              achievement_id: achievement.id,
              unlocked_at: new Date().toISOString(),
            });

          if (!unlockError) {
            // Get full achievement details for notification
            const { data: achievementDetails, error: detailsError } =
              await supabase
                .from('Achievements')
                .select('*, AchievementCategories(name)')
                .eq('id', achievement.id)
                .single();

            if (!detailsError && achievementDetails) {
              unlockedAchievements.push(achievementDetails);
            }
          } else {
            console.error(
              `Error unlocking ${achievement.name}:`,
              unlockError.message,
            );
          }
        }
      }
    } catch (error) {
      console.error(
        `Error processing achievement "${achievementName}":`,
        error,
      );
    }
  }

  return unlockedAchievements;
}

export async function checkLeaderboardAchievements(userId) {
  try {
    console.log(
      `🏆 Checking leaderboard position achievements for user ${userId}`,
    );

    // Get all users ordered by XP (descending) to determine leaderboard position
    const { data: allUsers, error: usersError } = await supabase
      .from('Users')
      .select('id, xp')
      .order('xp', { ascending: false });

    if (usersError) {
      console.error(
        'Error fetching users for leaderboard:',
        usersError.message,
      );
      return [];
    }

    if (!allUsers || allUsers.length === 0) {
      console.log('No users found for leaderboard calculation');
      return [];
    }

    // Find user's position in leaderboard (1-based ranking)
    const userPosition = allUsers.findIndex((user) => user.id === userId) + 1;

    if (userPosition === 0) {
      console.log(`User ${userId} not found in leaderboard`);
      return [];
    }

    const totalUsers = allUsers.length;
    const percentile = (userPosition / totalUsers) * 100;

    // User leaderboard stats processed

    // Get all leaderboard achievements to check multiple thresholds
    const { data: leaderboardAchievements, error: achievementsError } =
      await supabase
        .from('Achievements')
        .select('id, name, description, condition_value')
        .eq('condition_type', 'Leaderboard Position')
        .order('condition_value', { ascending: true });

    if (achievementsError) {
      console.error(
        'Error fetching leaderboard achievements:',
        achievementsError.message,
      );
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
      if (
        achievement.name.toLowerCase().includes('top 1%') ||
        achievement.name.toLowerCase().includes('mastermind')
      ) {
        thresholdPercentile = 1;
      } else if (
        achievement.name.toLowerCase().includes('top 5%') ||
        achievement.name.toLowerCase().includes('legend')
      ) {
        thresholdPercentile = 5;
      } else if (
        achievement.name.toLowerCase().includes('top 10%') ||
        achievement.name.toLowerCase().includes('elite')
      ) {
        thresholdPercentile = 10;
      } else {
        // Default to top 10% if unclear
        thresholdPercentile = 10;
      }

      if (percentile <= thresholdPercentile) {
        // User qualifies for this achievement

        // For leaderboard achievements, we need to handle them differently than regular achievements
        // Check if user already has this achievement
        const { data: existing, error: existingError } = await supabase
          .from('UserAchievements')
          .select('user_id, achievement_id')
          .eq('user_id', userId)
          .eq('achievement_id', achievement.id)
          .single();

        // If not already unlocked, unlock it directly
        if (existingError && existingError.code === 'PGRST116') {
          // No rows found
          const { error: unlockError } = await supabase
            .from('UserAchievements')
            .insert({
              user_id: userId,
              achievement_id: achievement.id,
              unlocked_at: new Date().toISOString(),
            });

          // Handle duplicate key errors gracefully
          if (!unlockError || unlockError.code === '23505') {
            // Success or duplicate key constraint violation (already unlocked)
            if (unlockError && unlockError.code === '23505') {
              console.log(
                `🔄 Leaderboard achievement ${achievement.id} already unlocked (duplicate key handled gracefully)`,
              );
              continue; // Skip this achievement, don't add to results
            }

            // Get achievement details for notification (only if not a duplicate error)
            const { data: achievementDetails, error: detailsError } =
              await supabase
                .from('Achievements')
                .select('*, AchievementCategories(name)')
                .eq('id', achievement.id)
                .single();

            if (!detailsError && achievementDetails) {
              unlockedAchievements.push(achievementDetails);
            }
          } else {
            console.error(
              `Error unlocking leaderboard achievement ${achievement.id}:`,
              unlockError.message,
            );
          }
        }
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

    if (totalBadges === 0) {
      return [];
    }

    // Check current Badge Collector progress to see if we need to update
    const { data: currentBadgeProgress, error: progressError } = await supabase
      .from('AchievementProgress')
      .select(
        'current_value, achievement_id, Achievements!inner(condition_type)',
      )
      .eq('user_id', userId)
      .eq('Achievements.condition_type', 'Badges Collected');

    if (progressError) {
      console.error(
        'Error checking Badge Collector progress:',
        progressError.message,
      );
    }

    // Only update if the badge count has changed
    const currentBadgeCount = currentBadgeProgress?.[0]?.current_value || 0;
    if (currentBadgeCount === totalBadges) {
      return [];
    }

    // Trigger Badge Collector achievements based on total count
    const badgeResult = await triggerAchievementProgress(
      userId,
      'Badges Collected',
      totalBadges, // Set to total count, not increment
    );

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

          // Handle duplicate key errors gracefully
          if (!unlockError || unlockError.code === '23505') {
            // Success or duplicate key constraint violation (already unlocked)
            if (unlockError && unlockError.code === '23505') {
              console.log(
                `🔄 ELO achievement ${achievement.id} already unlocked (duplicate key handled gracefully)`,
              );
              continue; // Skip this achievement, don't add to results
            }

            // Get full achievement details for response (only if not a duplicate error)
            const { data: fullAchievement, error: detailsError } =
              await supabase
                .from('Achievements')
                .select('*, AchievementCategories(name)')
                .eq('id', achievement.id)
                .single();

            if (!detailsError && fullAchievement) {
              newlyUnlockedAchievements.push(fullAchievement);
            }
          } else {
            console.error(
              `Error unlocking achievement ${achievement.id}:`,
              unlockError.message,
            );
            continue;
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

    // Validate requirements - now works for all modes
    if (consecutiveCorrect < 10) {
      return res.status(400).json({
        success: false,
        error: `Need 10 consecutive correct answers, got ${consecutiveCorrect}`,
      });
    }

    // Check if Perfect Session achievement exists in database
    const { data: perfectSessionAchievements, error: achievementError } =
      await supabase
        .from('Achievements')
        .select('*')
        .eq('name', 'Perfect Session')
        .eq('condition_type', 'Perfect Session Completed');

    if (achievementError) {
      console.error(
        'Error fetching Perfect Session achievement:',
        achievementError,
      );
      return res.status(500).json({
        success: false,
        error: 'Failed to check Perfect Session achievement',
      });
    }

    if (
      !perfectSessionAchievements ||
      perfectSessionAchievements.length === 0
    ) {
      return res.status(404).json({
        success: false,
        error: 'Perfect Session achievement not configured in database',
      });
    }

    const perfectSessionAchievement = perfectSessionAchievements[0];

    // Check if user already has this achievement
    const { data: existingUnlock, error: unlockCheckError } = await supabase
      .from('UserAchievements')
      .select('*')
      .eq('user_id', userId)
      .eq('achievement_id', perfectSessionAchievement.id);

    if (unlockCheckError) {
      console.error(
        'Error checking existing Perfect Session unlock:',
        unlockCheckError,
      );
      return res.status(500).json({
        success: false,
        error: 'Failed to check existing achievement',
      });
    }

    if (existingUnlock && existingUnlock.length > 0) {
      return res.json({
        success: true,
        message: 'Perfect Session achievement already unlocked',
        unlockedAchievements: [],
      });
    }

    // Unlock the Perfect Session achievement
    const { data: newUnlock, error: unlockError } = await supabase
      .from('UserAchievements')
      .insert({
        user_id: userId,
        achievement_id: perfectSessionAchievement.id,
        unlocked_at: new Date().toISOString(),
      })
      .select('*, Achievements(*, AchievementCategories(name))');

    if (unlockError) {
      console.error(
        'Error unlocking Perfect Session achievement:',
        unlockError,
      );
      return res.status(500).json({
        success: false,
        error: 'Failed to unlock Perfect Session achievement',
      });
    }

    console.log('🏆 Perfect Session achievement unlocked!', newUnlock);

    const unlockedAchievement = newUnlock[0];
    const achievementData = {
      id: unlockedAchievement.achievement_id,
      name: unlockedAchievement.Achievements.name,
      description: unlockedAchievement.Achievements.description,
      icon_path: unlockedAchievement.Achievements.icon_path,
      category: unlockedAchievement.Achievements.AchievementCategories?.name,
      unlocked_at: unlockedAchievement.unlocked_at,
      context: {
        consecutiveCorrect,
        totalQuestions,
        mode,
      },
    };

    res.json({
      success: true,
      message: 'Perfect Session achievement unlocked!',
      unlockedAchievements: [achievementData],
    });
  } catch (error) {
    console.error('Perfect Session achievement error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Never Give Up Achievement Endpoint - Track problem attempts
router.post('/users/:userId/achievements/never-give-up', async (req, res) => {
  try {
    const { userId } = req.params;
    const { questionId, isCorrect, attemptNumber } = req.body;

    // Check for Never Give Up achievement
    const unlockedAchievements = await checkNeverGiveUpAchievement(
      userId,
      questionId,
      isCorrect,
      attemptNumber,
    );

    res.json({
      success: true,
      message:
        unlockedAchievements.length > 0
          ? 'Never Give Up achievement unlocked!'
          : 'Attempt tracked',
      unlockedAchievements,
      context: {
        questionId,
        attemptNumber,
        isCorrect,
      },
    });
  } catch (error) {
    console.error('Never Give Up achievement error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Speed Solver Achievement Endpoint
router.post('/users/:userId/achievements/speed-solver', async (req, res) => {
  try {
    const { userId } = req.params;
    const { averageTime, correctCount, sessionData } = req.body;

    console.log(
      `⚡ Speed Solver check for user ${userId}: ${correctCount} questions, ${averageTime}s average`,
    );

    // Validate input
    if (!averageTime || !correctCount || correctCount < 5) {
      return res.json({
        success: false,
        message: 'Need at least 5 correct answers to qualify for Speed Solver',
        unlockedAchievements: [],
      });
    }

    // Check for Speed Solver achievements
    const unlockedAchievements = await checkSpeedSolverAchievements(
      userId,
      averageTime,
      correctCount,
    );

    res.json({
      success: true,
      message:
        unlockedAchievements.length > 0
          ? 'Speed Solver achievement unlocked!'
          : 'Speed tracked',
      unlockedAchievements,
      context: {
        averageTime,
        correctCount,
        sessionData,
      },
    });
  } catch (error) {
    console.error('Speed Solver achievement error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Learn from Mistakes Achievement Endpoint
router.post(
  '/users/:userId/achievements/learn-from-mistakes',
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { questionId, isCorrect, previouslyIncorrect, attemptHistory } =
        req.body;

      // Check for Learn from Mistakes achievements
      const unlockedAchievements = await checkLearnFromMistakesAchievements(
        userId,
        questionId,
        isCorrect,
        previouslyIncorrect,
      );

      res.json({
        success: true,
        message:
          unlockedAchievements.length > 0
            ? 'Learn from Mistakes achievement unlocked!'
            : 'Learning progress tracked',
        unlockedAchievements,
        context: {
          questionId,
          isCorrect,
          previouslyIncorrect,
          attemptHistory,
        },
      });
    } catch (error) {
      console.error('Learn from Mistakes achievement error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  },
);

// Speed Solver Achievement - Fast consecutive correct answers
export async function checkSpeedSolverAchievements(
  userId,
  averageTime,
  correctCount,
) {
  // Speed Solver: Answer multiple questions correctly with low average time
  // averageTime should be in seconds, correctCount is number of consecutive correct answers

  if (!averageTime || !correctCount || correctCount < 5) {
    return [];
  }

  // Define speed thresholds
  const SPEED_THRESHOLDS = {
    'Lightning Solver': { maxTime: 8, minQuestions: 5 }, // 5 questions under 8s each
    'Speed Master': { maxTime: 10, minQuestions: 10 }, // 10 questions under 10s each
    'Velocity Champion': { maxTime: 12, minQuestions: 20 }, // 20 questions under 12s each
  };

  console.log(
    `⚡ Speed Solver check: ${correctCount} correct answers, ${averageTime}s average`,
  );

  const unlockedAchievements = [];

  for (const [achievementName, criteria] of Object.entries(SPEED_THRESHOLDS)) {
    if (
      averageTime <= criteria.maxTime &&
      correctCount >= criteria.minQuestions
    ) {
      console.log(
        `🏃 Potential ${achievementName}: ${correctCount} questions in ${averageTime}s avg`,
      );

      const result = await triggerAchievementProgress(
        userId,
        'Speed Solver',
        1,
        {
          achievementName,
          averageTime,
          correctCount,
          criteria,
        },
      );

      unlockedAchievements.push(...result.unlockedAchievements);
    }
  }

  return unlockedAchievements;
}

// Learn from Mistakes Achievement - Answer question correctly after getting it wrong
export async function checkLearnFromMistakesAchievements(
  userId,
  questionId,
  isCorrect,
  previouslyIncorrect = false,
) {
  // Only trigger if this is a correct answer AND the user previously got this question wrong
  if (!isCorrect || !previouslyIncorrect) {
    return [];
  }

  // Learn from Mistakes: User corrected question after being wrong

  // Trigger the "Learn from Mistakes" achievement progress
  const result = await triggerAchievementProgress(
    userId,
    'Learn from Mistakes',
    1,
    {
      questionId,
      correctedAnswer: true,
    },
  );

  if (result.unlockedAchievements.length > 0) {
    console.log(
      `🎓 Learn from Mistakes achievement unlocked for user ${userId}!`,
    );
  }

  return result.unlockedAchievements;
}

// Mistake Recovery Achievement - Get back on track after multiple wrong answers
export async function checkMistakeRecoveryAchievements(
  userId,
  correctAnswersAfterMistakes,
  mistakeCount,
) {
  // Recovery after making multiple mistakes
  if (
    !correctAnswersAfterMistakes ||
    correctAnswersAfterMistakes < 3 ||
    mistakeCount < 3
  ) {
    return [];
  }

  // Mistake recovery progress calculated

  const result = await triggerAchievementProgress(
    userId,
    'Mistake Recovery',
    1,
    {
      correctAnswersAfterMistakes,
      mistakeCount,
    },
  );

  return result.unlockedAchievements;
}

// Generic achievement trigger endpoint for manual use
router.post('/achievements/trigger', async (req, res) => {
  try {
    const { userId, achievementType, increment = 1, gameMode } = req.body;

    if (!userId || !achievementType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, achievementType',
      });
    }

    // Trigger the achievement progress
    const result = await triggerAchievementProgress(
      userId,
      achievementType,
      increment,
    );

    // Also trigger practice-specific achievements if in practice mode
    if (
      gameMode === 'practice' &&
      achievementType === 'Questions Answered' &&
      increment > 0
    ) {
      // Practice mode - triggering additional practice achievements
      try {
        const practiceResult = await triggerAchievementProgress(
          userId,
          'Practice Questions',
          increment,
        );
        result.unlockedAchievements.push(
          ...practiceResult.unlockedAchievements,
        );
      } catch (practiceError) {
        console.log(
          'Practice achievement trigger failed (non-critical):',
          practiceError.message,
        );
      }
    }

    res.json({
      success: true,
      message: `Achievement progress updated for ${achievementType}`,
      unlockedAchievements: result.unlockedAchievements || [],
    });
  } catch (error) {
    console.error('Manual achievement trigger error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Test endpoint for debugging achievements
router.post('/test-achievement/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { conditionType = 'Questions Answered', increment = 1 } = req.body;

    console.log(
      `🧪 TEST ENDPOINT - Manual achievement trigger for user ${userId}`,
    );

    // Directly call the trigger function
    const result = await triggerAchievementProgress(
      userId,
      conditionType,
      increment,
    );

    console.log(`🧪 TEST RESULT:`, result);

    res.json({
      success: true,
      message: `Triggered ${conditionType} achievement for user ${userId}`,
      result,
    });
  } catch (error) {
    console.error('🧪 TEST ERROR:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Badge Collector Sync Endpoint - Fix existing count discrepancies
router.post('/sync-badge-collector/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`🔧 BADGE COLLECTOR SYNC - Starting sync for user ${userId}`);

    // Get current count of unlocked achievements (excluding Badge Collector to avoid loops)
    const { data: userAchievements, error: countError } = await supabase
      .from('UserAchievements')
      .select('achievement_id, Achievements!inner(name, condition_type)')
      .eq('user_id', userId)
      .neq('Achievements.condition_type', 'Badges Collected');

    if (countError) {
      console.error('Error counting user achievements:', countError.message);
      return res.status(500).json({
        success: false,
        error: 'Failed to count user achievements',
      });
    }

    const actualBadgeCount = userAchievements?.length || 0;
    console.log(
      `📊 User ${userId} has ${actualBadgeCount} actual achievements unlocked`,
    );

    // Get current Badge Collector progress
    const { data: badgeProgress, error: progressError } = await supabase
      .from('AchievementProgress')
      .select(
        'current_value, achievement_id, Achievements!inner(name, condition_type)',
      )
      .eq('user_id', userId)
      .eq('Achievements.condition_type', 'Badges Collected');

    if (progressError) {
      console.error(
        'Error getting Badge Collector progress:',
        progressError.message,
      );
    }

    const currentBadgeProgress = badgeProgress?.[0]?.current_value || 0;
    console.log(
      `📈 Badge Collector shows: ${currentBadgeProgress}/${actualBadgeCount}`,
    );

    // Force update Badge Collector progress to match actual count
    const badgeCollectorResult = await triggerAchievementProgress(
      userId,
      'Badges Collected',
      actualBadgeCount, // Set to actual total count
    );

    // Get updated progress after sync
    const { data: updatedProgress, error: updatedError } = await supabase
      .from('AchievementProgress')
      .select(
        'current_value, achievement_id, Achievements!inner(name, condition_type)',
      )
      .eq('user_id', userId)
      .eq('Achievements.condition_type', 'Badges Collected');

    const newBadgeProgress = updatedProgress?.[0]?.current_value || 0;

    res.json({
      success: true,
      message: `Badge Collector sync completed for user ${userId}`,
      sync_results: {
        actual_badge_count: actualBadgeCount,
        previous_badge_progress: currentBadgeProgress,
        new_badge_progress: newBadgeProgress,
        was_sync_needed: currentBadgeProgress !== actualBadgeCount,
        newly_unlocked_achievements:
          badgeCollectorResult.unlockedAchievements || [],
      },
    });
  } catch (error) {
    console.error('🔧 BADGE COLLECTOR SYNC ERROR:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// 🔥 Streak management endpoints
router.get('/users/:userId/streak', async (req, res) => {
  try {
    const { userId } = req.params;

    // Import streak calculator functions
    const { getUserStreakInfo } = await import('./utils/streakCalculator.js');

    const streakInfo = await getUserStreakInfo(userId);

    res.json({
      success: streakInfo.success,
      streak_data: {
        current_streak: streakInfo.currentStreak,
        longest_streak: streakInfo.longestStreak,
        last_activity: streakInfo.lastActivity,
      },
    });
  } catch (error) {
    console.error('Error getting user streak:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user streak',
    });
  }
});

router.post('/users/:userId/streak/update', async (req, res) => {
  try {
    const { userId } = req.params;

    // Import streak calculator functions
    const { updateUserStreak } = await import('./utils/streakCalculator.js');

    const streakResult = await updateUserStreak(userId);

    if (streakResult.success) {
      // Check for streak achievements
      const streakAchievements = await checkStreakAchievements(
        userId,
        streakResult.currentStreak,
      );

      res.json({
        success: true,
        message: streakResult.message,
        streak_data: {
          current_streak: streakResult.currentStreak,
          longest_streak: streakResult.longestStreak,
        },
        unlocked_achievements: streakAchievements,
      });
    } else {
      res.status(400).json({
        success: false,
        error: streakResult.message,
      });
    }
  } catch (error) {
    console.error('Error updating user streak:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user streak',
    });
  }
});

router.get('/streaks/leaderboard', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Import streak calculator functions
    const { getStreakLeaderboard } = await import(
      './utils/streakCalculator.js'
    );

    const leaderboard = await getStreakLeaderboard(parseInt(limit));

    res.json({
      success: true,
      leaderboard,
    });
  } catch (error) {
    console.error('Error getting streak leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get streak leaderboard',
    });
  }
});

export default router;
