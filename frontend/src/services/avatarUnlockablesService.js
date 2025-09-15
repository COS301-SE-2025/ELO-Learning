// Avatar Unlockables Service
// Manages avatar items that are locked behind achievements

import axios from 'axios';

// Create axios instance that matches the one in api.js
const getBaseURL = () => {
  // Use a dedicated test/CI API URL if provided
  if (process.env.NODE_ENV === 'test' || process.env.CI) {
    return (
      process.env.NEXT_PUBLIC_API_TEST_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'https://api.your-production-domain.com'
    );
  }
  // Default to production API URL
  return (
    process.env.NEXT_PUBLIC_API_URL || 'https://api.your-production-domain.com'
  );
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: process.env.NODE_ENV === 'test' ? 5000 : 30000,
});

// Avatar unlockables mapping based on the CSV data
export const AVATAR_UNLOCKABLES_MAP = {
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
 * Get the avatar item type from an unlockable ID
 */
export function getAvatarItemType(unlockableId) {
  if (unlockableId.startsWith('EYE_')) return 'eyes';
  if (unlockableId.startsWith('MOUTH_')) return 'mouth';
  if (unlockableId.startsWith('MOUSTACHE_')) return 'moustache';
  if (unlockableId.startsWith('GLASSES_')) return 'glasses';
  // All other hat types
  return 'hats';
}

/**
 * Check if a specific avatar item is unlocked for a user
 */
export function isAvatarItemUnlocked(unlockableId, userAchievements) {
  if (!userAchievements || !Array.isArray(userAchievements)) {
    return false;
  }

  // Find the achievement that unlocks this item
  const achievementId = Object.keys(AVATAR_UNLOCKABLES_MAP).find(
    (id) => AVATAR_UNLOCKABLES_MAP[id] === unlockableId,
  );

  if (!achievementId) {
    // If no achievement is required, item is always unlocked
    return true;
  }

  // Check if the user has unlocked the required achievement
  const achievement = userAchievements.find(
    (ach) => ach.id === parseInt(achievementId) && ach.unlocked === true,
  );

  return !!achievement;
}

/**
 * Get all unlocked avatar items for a user (using backend API)
 */
export async function getUserUnlockedAvatarItems(userId) {
  try {
    const response = await axiosInstance.get(
      `/api/avatar-unlockables/users/${userId}/unlocked`,
    );
    return response.data.unlockedItems || [];
  } catch (error) {
    console.error('Error getting user unlocked avatar items:', error);
    // Return basic items on error (same as backend default)
    return [
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
      'MOUSTACHE_1',
      'MOUSTACHE_2',
      'MOUSTACHE_3',
      'GLASSES_1',
      'GLASSES_4',
      'Nothing',
      'beanie',
      'beret',
      'bow',
      'none',
    ];
  }
}

/**
 * Get all locked avatar items for a user with their required achievements (using backend API)
 */
export async function getUserLockedAvatarItems(userId) {
  try {
    const response = await axiosInstance.get(
      `/api/avatar-unlockables/users/${userId}/locked`,
    );
    return response.data.lockedItems || [];
  } catch (error) {
    console.error('Error getting user locked avatar items:', error);
    return [];
  }
}

/**
 * Check if user can use a specific avatar item
 */
export function canUseAvatarItem(itemId, unlockedItems) {
  return unlockedItems.includes(itemId);
}

/**
 * Get the achievement required to unlock an avatar item
 */
export function getRequiredAchievement(unlockableId, userAchievements) {
  const achievementId = Object.keys(AVATAR_UNLOCKABLES_MAP).find(
    (id) => AVATAR_UNLOCKABLES_MAP[id] === unlockableId,
  );

  if (!achievementId || !userAchievements) {
    return null;
  }

  return userAchievements.find((ach) => ach.id === parseInt(achievementId));
}

/**
 * Check if a specific avatar item is unlocked (using backend API)
 */
export async function checkAvatarItemUnlocked(userId, itemId) {
  try {
    const response = await axiosInstance.get(
      `/api/avatar-unlockables/users/${userId}/check/${itemId}`,
    );
    return response.data.isUnlocked || false;
  } catch (error) {
    console.error('Error checking avatar item unlock status:', error);
    return false;
  }
}
