// Avatar Unlockables Routes
// Backend API routes for managing avatar unlockables

import { Router } from 'express';
import { supabase } from '../database/supabaseClient.js';

const router = Router();

// Avatar unlockables mapping (matches the frontend)
const AVATAR_UNLOCKABLES_MAP = {
  // Eyes (Achievement IDs 4-31 unlock Eye 15-32)
  4: 'EYE_15', // Quick Thinker
  5: 'EYE_16', // Problem Solver
  6: 'EYE_17', // Math Master
  7: 'EYE_18', // Badge Collector
  8: 'EYE_19', // Rising Star
  9: 'EYE_20', // Calculating Contender
  10: 'EYE_21', // Algebra Ace
  11: 'EYE_22', // Trigonometry Titan
  12: 'EYE_23', // Math Grandmaster
  13: 'EYE_24', // Peak Performance
  14: 'EYE_25', // Comeback Kid
  15: 'EYE_26', // Consistent Climber
  16: 'EYE_27', // New Challenger
  17: 'EYE_28', // Precision Pro
  19: 'EYE_29', // Perfect Session
  20: 'EYE_30', // Speed Solver
  21: 'EYE_31', // Learn from Mistakes
  22: 'EYE_32', // Weekend Warrior

  // Mouth (Achievement IDs 23-43 unlock Mouth 15-32)
  23: 'MOUTH_15', // Marathon Session
  24: 'MOUTH_16', // Queue Warrior
  26: 'MOUTH_17', // Match Rookie
  27: 'MOUTH_18', // Match Veteran
  28: 'MOUTH_19', // Match Expert
  29: 'MOUTH_20', // Never Give Up
  30: 'MOUTH_21', // Avatar Stylist
  32: 'MOUTH_22', // Streak 1
  33: 'MOUTH_23', // Streak 7
  34: 'MOUTH_24', // Streak 10
  35: 'MOUTH_25', // Streak 15
  36: 'MOUTH_26', // Streak 20
  38: 'MOUTH_27', // Matchmaker
  39: 'MOUTH_28', // Century Solver
  40: 'MOUTH_29', // Math Genius
  41: 'MOUTH_30', // Queue Legend
  42: 'MOUTH_31', // Speed Demon
  43: 'MOUTH_32', // Lightning Fast

  // Moustache (Achievement IDs 44-47 unlock Moustache 4-7)
  44: 'MOUSTACHE_4', // Time Master
  45: 'MOUSTACHE_5', // Elite Performer
  46: 'MOUSTACHE_6', // Rising Legend
  47: 'MOUSTACHE_7', // Mathematical Mastermind

  // Glasses (Achievement IDs 48-54 unlock Glasses 2-10)
  48: 'GLASSES_2', // Number Ninja
  49: 'GLASSES_5', // Formula Fighter
  50: 'GLASSES_6', // Calculus Champion
  51: 'GLASSES_7', // Question Champion
  52: 'GLASSES_8', // Algebra Master
  53: 'GLASSES_9', // Geometry Genius
  54: 'GLASSES_10', // Night Owl
  72: 'GLASSES_3', // Streak 30

  // Hats (Achievement IDs 55-71 unlock various hats)
  55: 'bucket-hat', // Early Bird
  56: 'bunny', // Speed Runner
  60: 'cat', // Precision Master
  61: 'crown', // Flawless Execution
  63: 'daisy', // Trigonometry Virtuoso
  64: 'fedora', // Calculus Conqueror
  65: 'jester-hat', // Stats Maestro
  66: 'wizard-hat', // Financial Wizard
  67: 'sherrif', // Sequence Sage
  68: 'sombrero', // Graph Guru
  69: 'straw-hat', // Personal Best Achieved
  70: 'top-hat', // Comeback Completed
  71: 'pirate-hat', // Consecutive Improvements
};

/**
 * Get all unlocked avatar items for a user
 * GET /api/avatar-unlockables/users/:userId/unlocked
 */
router.get('/users/:userId/unlocked', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user's unlocked achievements
    const { data: userAchievements, error: achievementsError } = await supabase
      .from('UserAchievements')
      .select('achievement_id, unlocked_at')
      .eq('user_id', userId);

    if (achievementsError) {
      console.error('Error fetching user achievements:', achievementsError);
      return res.status(500).json({
        error: 'Failed to fetch user achievements',
        details: achievementsError.message,
      });
    }

    // Always unlock basic items (items not mentioned in the CSV mapping)
    const unlockedItems = new Set([
      // Basic Eyes (Eye 1-14 are always unlocked, Eye 15-32 require achievements)
      'EYE_1',
      'EYE_2',
      'EYE_3',
      'EYE_4',
      'EYE_5',
      'EYE_6',
      'EYE_7',
      'EYE_8',
      'EYE_9',
      'EYE_10',
      'EYE_11',
      'EYE_12',
      'EYE_13',
      'EYE_14',

      // Basic Mouths (Mouth 1-14 are always unlocked, Mouth 15-32 require achievements)
      'MOUTH_1',
      'MOUTH_2',
      'MOUTH_3',
      'MOUTH_4',
      'MOUTH_5',
      'MOUTH_6',
      'MOUTH_7',
      'MOUTH_8',
      'MOUTH_9',
      'MOUTH_10',
      'MOUTH_11',
      'MOUTH_12',
      'MOUTH_13',
      'MOUTH_14',

      // Basic Moustaches (Moustache 1-3 are always unlocked, Moustache 4-7 require achievements)
      'MOUSTACHE_1',
      'MOUSTACHE_2',
      'MOUSTACHE_3',

      // Basic Glasses (Glasses 1 and 4 are always unlocked, others require achievements)
      'GLASSES_1',
      'GLASSES_4',

      // Basic Hats (basic hats are always unlocked, special hats require achievements)
      'Nothing',
      'beanie',
      'beret',
      'bow',

      // None options are always unlocked
      'none',
    ]);

    // Add achievement-based unlocks
    if (userAchievements && userAchievements.length > 0) {
      const unlockedAchievementIds = userAchievements.map(
        (ua) => ua.achievement_id,
      );

      Object.entries(AVATAR_UNLOCKABLES_MAP).forEach(
        ([achievementId, unlockableId]) => {
          if (unlockedAchievementIds.includes(parseInt(achievementId))) {
            unlockedItems.add(unlockableId);
          }
        },
      );
    }

    res.json({
      userId,
      unlockedItems: Array.from(unlockedItems),
      totalUnlocked: unlockedItems.size,
    });
  } catch (error) {
    console.error('Error in avatar unlockables route:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
});

/**
 * Get all locked avatar items for a user with achievement details
 * GET /api/avatar-unlockables/users/:userId/locked
 */
router.get('/users/:userId/locked', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user's achievements with progress
    const { data: achievements, error: achievementsError } =
      await supabase.from('Achievements').select(`
        id,
        name,
        description,
        condition_value,
        UserAchievements!left(user_id, unlocked_at),
        AchievementProgress!left(user_id, current_value)
      `);

    if (achievementsError) {
      console.error('Error fetching achievements:', achievementsError);
      return res.status(500).json({
        error: 'Failed to fetch achievements',
        details: achievementsError.message,
      });
    }

    // Get user's specific achievements separately to avoid complex filtering
    const { data: userAchievements, error: userAchievementsError } =
      await supabase
        .from('UserAchievements')
        .select('achievement_id, unlocked_at')
        .eq('user_id', userId);

    if (userAchievementsError) {
      console.error('Error fetching user achievements:', userAchievementsError);
      return res.status(500).json({
        error: 'Failed to fetch user achievements',
        details: userAchievementsError.message,
      });
    }

    // Get user's achievement progress separately
    const { data: userProgress, error: userProgressError } = await supabase
      .from('AchievementProgress')
      .select('achievement_id, current_value')
      .eq('user_id', userId);

    if (userProgressError) {
      console.error('Error fetching user progress:', userProgressError);
      return res.status(500).json({
        error: 'Failed to fetch user progress',
        details: userProgressError.message,
      });
    }

    // Create maps for easy lookup
    const unlockedAchievements = new Set(
      userAchievements?.map((ua) => ua.achievement_id) || [],
    );
    const progressMap = new Map(
      userProgress?.map((p) => [p.achievement_id, p.current_value]) || [],
    );

    const lockedItems = [];

    Object.entries(AVATAR_UNLOCKABLES_MAP).forEach(
      ([achievementId, unlockableId]) => {
        const achievement = achievements.find(
          (a) => a.id === parseInt(achievementId),
        );

        if (achievement) {
          const isUnlocked = unlockedAchievements.has(parseInt(achievementId));

          if (!isUnlocked) {
            const progress = progressMap.get(parseInt(achievementId)) || 0;
            const progressPercentage = Math.min(
              100,
              Math.round((progress / achievement.condition_value) * 100),
            );

            lockedItems.push({
              unlockableId,
              achievementId: parseInt(achievementId),
              achievementName: achievement.name,
              achievementDescription: achievement.description,
              progress,
              progressPercentage,
              conditionValue: achievement.condition_value,
            });
          }
        }
      },
    );

    res.json({
      userId,
      lockedItems,
      totalLocked: lockedItems.length,
    });
  } catch (error) {
    console.error('Error in locked avatar unlockables route:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
});

/**
 * Check if specific avatar item is unlocked
 * GET /api/avatar-unlockables/users/:userId/check/:itemId
 */
router.get('/users/:userId/check/:itemId', async (req, res) => {
  try {
    const { userId, itemId } = req.params;

    // Check if this item requires an achievement
    const achievementId = Object.keys(AVATAR_UNLOCKABLES_MAP).find(
      (id) => AVATAR_UNLOCKABLES_MAP[id] === itemId,
    );

    if (!achievementId) {
      // No achievement required, always unlocked
      return res.json({
        itemId,
        isUnlocked: true,
        reason: 'No achievement required',
      });
    }

    // Check if user has the required achievement
    const { data: userAchievement, error } = await supabase
      .from('UserAchievements')
      .select('unlocked_at')
      .eq('user_id', userId)
      .eq('achievement_id', parseInt(achievementId))
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking achievement:', error);
      return res.status(500).json({
        error: 'Failed to check achievement',
        details: error.message,
      });
    }

    res.json({
      itemId,
      isUnlocked: !!userAchievement,
      requiredAchievementId: parseInt(achievementId),
      unlockedAt: userAchievement?.unlocked_at || null,
    });
  } catch (error) {
    console.error('Error in check avatar unlockable route:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
});

export default router;
