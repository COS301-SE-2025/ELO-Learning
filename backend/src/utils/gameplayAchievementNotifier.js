// Backend-only utility for processing gameplay achievements
// Does NOT handle frontend notifications - only formats data for API responses

/**
 * Format achievements for API response
 * @param {Array} achievements - Achievements from database
 * @param {string|number} userId - User ID
 * @param {boolean} debug - Debug logging
 * @returns {Object} API response object
 */
export function formatAchievementsForResponse(achievements, userId, debug = false) {
  if (!achievements || !Array.isArray(achievements)) {
    if (debug) console.log('🏆 Backend: No achievements to format');
    return {
      achievements: [],
      achievementSummary: null
    };
  }

  try {
    const formattedAchievements = achievements.map(ach => ({
      id: ach.id || ach.achievement_id,
      name: ach.name || 'Achievement Unlocked',
      description: ach.description || 'You unlocked an achievement!',
      unlocked_at: ach.unlocked_at || new Date().toISOString(),
      category: ach.AchievementCategories?.name || 'General',
      ...ach
    }));

    if (debug) {
      console.log(`🏆 Backend: Formatted ${formattedAchievements.length} achievements for user ${userId}`);
    }

    return {
      achievements: formattedAchievements,
      achievementSummary: {
        totalUnlocked: formattedAchievements.length,
        newCount: formattedAchievements.length,
        hasNewAchievements: formattedAchievements.length > 0
      }
    };
    
  } catch (error) {
    console.error('🏆 Backend: Error formatting achievements:', error);
    return {
      achievements: [],
      achievementSummary: null
    };
  }
}