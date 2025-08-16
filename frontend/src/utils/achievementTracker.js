// utils/achievementTracker.js
'use client';

class AchievementTracker {
  constructor() {
    this.notifiedAchievements = new Set();
    this.loadFromStorage();
  }

  // Load previously notified achievements from localStorage
  loadFromStorage() {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem('notified-achievements');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.notifiedAchievements = new Set(parsed);
        console.log('🏆 Loaded notified achievements:', parsed.length);
      }
    } catch (error) {
      console.error('🏆 Error loading notified achievements:', error);
      this.notifiedAchievements = new Set();
    }
  }

  // Save notified achievements to localStorage
  saveToStorage() {
    if (typeof window === 'undefined') return;
    
    try {
      const achievementIds = Array.from(this.notifiedAchievements);
      localStorage.setItem('notified-achievements', JSON.stringify(achievementIds));
      console.log('🏆 Saved notified achievements:', achievementIds.length);
    } catch (error) {
      console.error('🏆 Error saving notified achievements:', error);
    }
  }

  // Check if an achievement has already been notified
  hasBeenNotified(achievementId) {
    return this.notifiedAchievements.has(achievementId);
  }

  // Mark an achievement as notified
  markAsNotified(achievementId) {
    this.notifiedAchievements.add(achievementId);
    this.saveToStorage();
    console.log('🏆 Marked achievement as notified:', achievementId);
  }

  // Mark multiple achievements as notified
  markMultipleAsNotified(achievementIds) {
    achievementIds.forEach(id => this.notifiedAchievements.add(id));
    this.saveToStorage();
    console.log('🏆 Marked multiple achievements as notified:', achievementIds);
  }

  // Get only NEW unlocked achievements (not previously notified)
  getNewUnlockedAchievements(allAchievements) {
    if (!Array.isArray(allAchievements)) return [];

    const unlockedAchievements = allAchievements.filter(ach => ach.unlocked === true);
    const newUnlockedAchievements = unlockedAchievements.filter(ach => {
      const achievementId = ach.id || ach.achievement_id;
      return !this.hasBeenNotified(achievementId);
    });

    console.log('🏆 Achievement analysis:', {
      total: allAchievements.length,
      unlocked: unlockedAchievements.length,
      newUnlocked: newUnlockedAchievements.length,
      previouslyNotified: this.notifiedAchievements.size
    });

    return newUnlockedAchievements;
  }

  // Clear all notification history (useful for testing or user reset)
  clearNotificationHistory() {
    this.notifiedAchievements.clear();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('notified-achievements');
    }
    console.log('🏆 Cleared all notification history');
  }

  // Reset specific user's notification history (when switching users)
  resetForUser(userId) {
    // You could make this user-specific by using keys like `notified-achievements-${userId}`
    this.clearNotificationHistory();
    console.log('🏆 Reset notification history for user:', userId);
  }
}

// Create singleton instance
const achievementTracker = new AchievementTracker();

export default achievementTracker;