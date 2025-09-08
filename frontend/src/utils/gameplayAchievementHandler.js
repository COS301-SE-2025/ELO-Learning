// utils/gameplayAchievementHandler.js
// Frontend-only utility for handling achievement notifications from API responses
'use client';

import { showAchievementNotificationsWhenReady } from '@/utils/achievementNotifications';
import achievementTracker from '@/utils/achievementTracker';

/**
 * Handle achievement notifications from gameplay API responses
 * This should ONLY be called when receiving API responses that contain achievements
 * 
 * @param {Object} apiResponse - Response from gameplay API
 * @param {string|number} userId - Current user ID
 * @param {boolean} debug - Enable debug logging
 */
export async function handleGameplayAchievements(apiResponse, userId, debug = false) {
  if (!apiResponse || !userId) {
    if (debug) console.log('🏆 Frontend: No API response or user ID provided');
    return;
  }

  try {
    // Ensure we're tracking the correct user
    achievementTracker.setCurrentUser(userId);

    // Extract achievements from API response
    const achievements = apiResponse.achievements || apiResponse.newlyUnlocked || [];
    
    if (!Array.isArray(achievements) || achievements.length === 0) {
      if (debug) console.log('🏆 Frontend: No achievements in API response');
      return;
    }

    // Filter out achievements that have already been notified
    const notYetNotified = achievements.filter(ach => {
      const id = ach.id || ach.achievement_id;
      return !achievementTracker.hasBeenNotified(id);
    });

    if (notYetNotified.length === 0) {
      if (debug) console.log('🏆 Frontend: All achievements have already been notified');
      return;
    }

    if (debug) {
      console.log(`🏆 Frontend: Showing notifications for ${notYetNotified.length} newly unlocked achievements:`, 
        notYetNotified.map(ach => ach.name || ach.id));
    }

    // Show the notifications
    await showAchievementNotificationsWhenReady(notYetNotified, 3000, userId);

    // Mark as notified to prevent showing again
    const newNotifiedIds = notYetNotified.map(ach => ach.id || ach.achievement_id);
    achievementTracker.markMultipleAsNotified(newNotifiedIds);

    console.log(`🏆 Frontend: Successfully showed notifications for ${notYetNotified.length} achievements`);
    
  } catch (error) {
    console.error('🏆 Frontend: Error handling gameplay achievements:', error);
  }
}

/**
 * Check if an API response contains new achievements
 * @param {Object} apiResponse - Response from API
 * @returns {boolean} True if response contains achievements
 */
export function hasAchievements(apiResponse) {
  if (!apiResponse) return false;
  
  const achievements = apiResponse.achievements || apiResponse.newlyUnlocked || [];
  return Array.isArray(achievements) && achievements.length > 0;
}

/**
 * Initialize achievement tracking for a user without showing notifications
 * Call this when a user logs in to set up tracking
 * 
 * @param {string|number} userId - User ID to initialize
 */
export function initializeAchievementTracking(userId) {
  if (userId) {
    achievementTracker.setCurrentUser(userId);
    console.log('🏆 Frontend: Achievement tracking initialized for user:', userId);
  }
}

/**
 * Prevent notifications during login/page load
 * Call this to mark existing achievements as already notified
 * 
 * @param {Array} existingAchievements - All user's existing achievements
 * @param {string|number} userId - User ID
 */
export function preventLoginNotifications(existingAchievements, userId) {
  if (!existingAchievements || !Array.isArray(existingAchievements)) return;
  
  achievementTracker.setCurrentUser(userId);
  
  const unlockedAchievements = existingAchievements.filter(ach => ach.unlocked === true);
  const achievementIds = unlockedAchievements.map(ach => ach.id || ach.achievement_id);
  
  if (achievementIds.length > 0) {
    achievementTracker.markMultipleAsNotified(achievementIds);
    console.log(`🏆 Frontend: Marked ${achievementIds.length} existing achievements as already notified to prevent login notifications`);
  }
}
