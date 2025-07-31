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
export async function triggerAchievementProgress(userId, conditionType, increment = 1) {
  try {
    // Find all achievements that match this condition type (exclude ELO for now)
    const { data: achievements, error: achievementsError } = await supabase
      .from('Achievements')
      .select('id, condition_type, condition_value')
      .eq('condition_type', conditionType)
      .not('condition_type', 'in', '("ELO Rating Reached","Personal Best Achieved","Comeback Completed","Consecutive Improvements")');

    if (achievementsError) {
      console.error('Error fetching achievements:', achievementsError.message);
      return { success: false, unlockedAchievements: [] };
    }

    const unlockedAchievements = [];

    // Update progress for each matching achievement
    for (const achievement of achievements) {
      try {
        const response = await fetch(`http://localhost:3000/users/${userId}/achievements/progress`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer system-internal' // You might want to handle this differently
          },
          body: JSON.stringify({
            achievement_id: achievement.id,
            increment_by: increment
          })
        });

        const result = await response.json();
        
        if (result.achievement_unlocked) {
          // Get achievement details for notification
          const { data: achievementDetails, error: detailsError } = await supabase
            .from('Achievements')
            .select('*, AchievementCategories(name)')
            .eq('id', achievement.id)
            .single();

          if (!detailsError && achievementDetails) {
            unlockedAchievements.push(achievementDetails);
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
export async function checkQuestionAchievements(userId, isCorrect) {
  const results = [];
  
  if (isCorrect) {
    // Trigger "Questions Answered" achievements
    const questionResult = await triggerAchievementProgress(userId, 'Questions Answered', 1);
    results.push(questionResult);
    
    // Trigger "Problems Solved" achievements (for New Challenger)
    const problemResult = await triggerAchievementProgress(userId, 'Problems Solved', 1);
    results.push(problemResult);
  }
  
  return results.flatMap(r => r.unlockedAchievements);
}

export async function checkMatchAchievements(userId) {
  const result = await triggerAchievementProgress(userId, 'Matches Played', 1);
  return result.unlockedAchievements;
}

export async function checkStreakAchievements(userId, days) {
  // For daily login/activity streaks
  const result = await triggerAchievementProgress(userId, 'Daily Streak', days);
  return result.unlockedAchievements;
}

export async function checkProfileAchievements(userId) {
  // For profile customization achievements
  const result = await triggerAchievementProgress(userId, 'Customizations Unlocked', 1);
  return result.unlockedAchievements;
}

export default router;