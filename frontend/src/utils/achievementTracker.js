// utils/achievementTracker.js
'use client';

class AchievementTracker {
  constructor() {
    this.notifiedAchievements = new Set();
    this.currentUserId = null;
    this.lastNotificationTime = 0;
    this.RATE_LIMIT_MS = 2000; // Minimum 2 seconds between notification calls
    this.debugMode = false; // Enhanced debug logging
    this.isInitializing = false; // Track if we're in initial load phase
    this.loadFromStorage();
  }

  // Set the current user ID and load their specific notification history
  setCurrentUser(userId) {
    if (this.currentUserId === userId) return; // No change needed

    // Save current user's data before switching
    if (this.currentUserId) {
      this.saveToStorage();
    }

    // Switch to new user
    this.currentUserId = userId;
    this.notifiedAchievements = new Set();
    this.isInitializing = true; // Mark as initializing

    if (userId) {
      this.loadFromStorage();
      console.log('🏆 Switched to user:', userId);
      console.log(
        '🏆 Loaded notification history:',
        this.notifiedAchievements.size,
        'achievements',
      );

      // Allow some time for initialization before allowing notifications
      setTimeout(() => {
        this.isInitializing = false;
        console.log('🏆 User initialization complete for:', userId);
      }, 3000); // 3 second initialization period
    } else {
      this.isInitializing = false;
      console.log('🏆 Cleared user session');
    }
  }

  // Get user-specific localStorage key
  getStorageKey() {
    return this.currentUserId
      ? `notified-achievements-${this.currentUserId}`
      : 'notified-achievements';
  }

  // Load previously notified achievements from localStorage for current user
  loadFromStorage() {
    if (typeof window === 'undefined') return;

    try {
      const storageKey = this.getStorageKey();
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.notifiedAchievements = new Set(parsed);
        console.log(
          `🏆 Loaded notified achievements for user ${this.currentUserId}:`,
          parsed.length,
        );
      }
    } catch (error) {
      console.error('🏆 Error loading notified achievements:', error);
      this.notifiedAchievements = new Set();
    }
  }

  // Save notified achievements to localStorage for current user
  saveToStorage() {
    if (typeof window === 'undefined') return;

    try {
      const achievementIds = Array.from(this.notifiedAchievements);
      const storageKey = this.getStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(achievementIds));
      console.log(
        `🏆 Saved notified achievements for user ${this.currentUserId}:`,
        achievementIds.length,
      );
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
    console.log(
      `🏆 Marked achievement as notified for user ${this.currentUserId}:`,
      achievementId,
    );
  }

  // Mark multiple achievements as notified
  markMultipleAsNotified(achievementIds) {
    const previousCount = this.notifiedAchievements.size;
    achievementIds.forEach((id) => this.notifiedAchievements.add(id));
    this.saveToStorage();

    console.log(
      `🏆 Marked ${achievementIds.length} achievements as notified for user ${this.currentUserId}. Total notified: ${previousCount} -> ${this.notifiedAchievements.size}`,
    );

    this.logNotificationEvent('achievements_marked_as_notified', {
      count: achievementIds.length,
      achievementIds: achievementIds,
      totalNotified: this.notifiedAchievements.size,
    });
  }

  // Get only NEW unlocked achievements (not previously notified)
  getNewUnlockedAchievements(allAchievements) {
    if (!Array.isArray(allAchievements)) return [];

    const unlockedAchievements = allAchievements.filter(
      (ach) => ach.unlocked === true,
    );
    const newUnlockedAchievements = unlockedAchievements.filter((ach) => {
      const achievementId = ach.id || ach.achievement_id;
      return !this.hasBeenNotified(achievementId);
    });

    // Enhanced telemetry logging
    this.logNotificationEvent('achievements_analyzed', {
      total: allAchievements.length,
      unlocked: unlockedAchievements.length,
      newUnlocked: newUnlockedAchievements.length,
      previouslyNotified: this.notifiedAchievements.size,
      newAchievementIds: newUnlockedAchievements.map(
        (ach) => ach.id || ach.achievement_id,
      ),
    });

    return newUnlockedAchievements;
  }

  // Check if enough time has passed since last notification (rate limiting)
  canShowNotifications() {
    const now = Date.now();
    const timeSinceLastNotification = now - this.lastNotificationTime;
    const canShow = timeSinceLastNotification >= this.RATE_LIMIT_MS;

    // Additional check: don't show notifications during initialization
    if (this.isInitializing) {
      console.log('🏆 Notifications blocked: user is initializing');
      return false;
    }

    if (!canShow) {
      console.log(
        `🏆 Rate limited: ${
          this.RATE_LIMIT_MS - timeSinceLastNotification
        }ms remaining`,
      );
    }

    return canShow;
  }

  // Update the last notification time
  updateNotificationTime() {
    this.lastNotificationTime = Date.now();
  }

  // Get only NEW unlocked achievements with rate limiting
  getNewUnlockedAchievementsWithRateLimit(allAchievements) {
    if (!this.canShowNotifications()) {
      this.logNotificationEvent('rate_limited', {
        timeUntilNext:
          this.RATE_LIMIT_MS - (Date.now() - this.lastNotificationTime),
      });
      return [];
    }

    const newAchievements = this.getNewUnlockedAchievements(allAchievements);

    if (newAchievements.length > 0) {
      this.logNotificationEvent('new_achievements_ready', {
        count: newAchievements.length,
        achievements: newAchievements.map((ach) => ({
          id: ach.id || ach.achievement_id,
          name: ach.name,
        })),
      });
    }

    return newAchievements;
  }

  // Force end initialization phase (for testing or explicit control)
  endInitialization() {
    this.isInitializing = false;
    console.log(
      '🏆 Initialization phase ended manually for user:',
      this.currentUserId,
    );
  }

  // Check if currently in initialization phase
  isInitializingUser() {
    return this.isInitializing;
  }

  // Clear all notification history (useful for testing or user reset)
  clearNotificationHistory() {
    this.notifiedAchievements.clear();
    if (typeof window !== 'undefined' && this.currentUserId) {
      localStorage.removeItem(this.getStorageKey());
    }
    console.log(
      `🏆 Cleared notification history for user ${this.currentUserId}`,
    );
  }

  // Reset specific user's notification history (when switching users)
  resetForUser(userId) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`notified-achievements-${userId}`);
    }

    if (this.currentUserId === userId) {
      this.notifiedAchievements.clear();
    }

    console.log('🏆 Reset notification history for user:', userId);
  }

  // Clear notification history for all users (admin function)
  clearAllUserHistory() {
    if (typeof window === 'undefined') return;

    // Get all localStorage keys that match our pattern
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('notified-achievements')) {
        keysToRemove.push(key);
      }
    }

    // Remove all matching keys
    keysToRemove.forEach((key) => localStorage.removeItem(key));

    // Clear current instance
    this.notifiedAchievements.clear();

    console.log(
      '🏆 Cleared notification history for all users:',
      keysToRemove.length,
      'keys removed',
    );
  }

  // Force show all unlocked achievements (debug function)
  forceShowAllUnlocked() {
    this.notifiedAchievements.clear();
    this.saveToStorage();
    this.lastNotificationTime = 0; // Reset rate limiting too
    console.log(
      '🏆 Force showing all unlocked achievements - cleared notification history and rate limiting',
    );
  }

  // Enhanced logging for telemetry and debugging
  logNotificationEvent(eventType, data = {}) {
    const logData = {
      eventType,
      userId: this.currentUserId,
      notifiedCount: this.notifiedAchievements.size,
      timestamp: Date.now(),
      canShowNotifications: this.canShowNotifications(),
      timeSinceLastNotification: Date.now() - this.lastNotificationTime,
      debugMode: this.debugMode,
      ...data,
    };

    // Always log important events, debug mode enables verbose logging
    if (
      this.debugMode ||
      [
        'rate_limited',
        'achievements_marked_as_notified',
        'new_achievements_ready',
      ].includes(eventType)
    ) {
      console.log(`🏆 Achievement notification event: ${eventType}`, logData);
    }

    // Optional: Send to analytics service (only in production)
    if (
      typeof window !== 'undefined' &&
      window.gtag &&
      process.env.NODE_ENV === 'production'
    ) {
      try {
        window.gtag('event', 'achievement_notification', {
          event_category: 'achievements',
          event_label: eventType,
          custom_parameters: {
            user_id: logData.userId,
            event_type: eventType,
            count: data.count || 0,
          },
        });
      } catch (error) {
        // Silently fail analytics
        if (this.debugMode) {
          console.warn('🏆 Analytics logging failed:', error);
        }
      }
    }

    return logData;
  }
}

// Create singleton instance
const achievementTracker = new AchievementTracker();

// Export debug functions for testing (available in browser console)
if (typeof window !== 'undefined') {
  window.clearAllAchievementNotifications = () => {
    achievementTracker.clearAllUserHistory();
    console.log('🧹 All achievement notification history cleared');
  };

  window.clearUserAchievementNotifications = (userId) => {
    if (userId) {
      achievementTracker.resetForUser(userId);
      console.log(`🧹 Cleared achievement notifications for user: ${userId}`);
    } else {
      console.log('❌ Please provide a userId');
    }
  };

  window.getAchievementNotificationStatus = () => {
    const status = {
      currentUser: achievementTracker.currentUserId,
      notifiedCount: achievementTracker.notifiedAchievements.size,
      notifiedAchievements: Array.from(achievementTracker.notifiedAchievements),
      lastNotificationTime: achievementTracker.lastNotificationTime,
      canShowNotifications: achievementTracker.canShowNotifications(),
      isInitializing: achievementTracker.isInitializing,
      timeUntilNextAllowed: Math.max(
        0,
        achievementTracker.RATE_LIMIT_MS -
          (Date.now() - achievementTracker.lastNotificationTime),
      ),
    };
    console.table(status);
    return status;
  };

  window.endAchievementInitialization = () => {
    achievementTracker.endInitialization();
    console.log('🔄 Achievement initialization phase ended manually');
  };

  window.forceShowAllAchievements = () => {
    achievementTracker.forceShowAllUnlocked();
    console.log(
      '🔄 Forced all achievements to show - clear notification history and rate limiting',
    );
  };

  window.enableAchievementDebugMode = () => {
    achievementTracker.debugMode = true;
    console.log('🔍 Achievement debug mode enabled - detailed logging active');
  };

  window.disableAchievementDebugMode = () => {
    achievementTracker.debugMode = false;
    console.log('🔍 Achievement debug mode disabled');
  };

  // Show available debug commands
  window.showAchievementDebugCommands = () => {
    const commands = {
      'clearAllAchievementNotifications()':
        'Clear notification history for all users',
      'clearUserAchievementNotifications(userId)':
        'Clear notifications for specific user',
      'getAchievementNotificationStatus()':
        'Show current notification system status',
      'endAchievementInitialization()': 'End initialization phase manually',
      'forceShowAllAchievements()':
        'Force show all unlocked achievements (clears history)',
      'enableAchievementDebugMode()': 'Enable detailed debug logging',
      'disableAchievementDebugMode()': 'Disable debug logging',
      'showAchievementDebugCommands()': 'Show this help menu',
    };

    console.log('🏆 Achievement Debug Commands:');
    console.table(commands);
    return commands;
  };

  console.log(
    '🏆 Achievement debug functions loaded. Type showAchievementDebugCommands() for help.',
  );
}

export default achievementTracker;
