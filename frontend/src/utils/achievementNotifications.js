// utils/achievementNotifications.js
// Centralized helper for showing achievement notifications with better error handling

/**
 * Shows achievement notifications using the global notification system
 * @param {Array} achievements - Array of achievement objects to display
 * @param {number} maxRetries - Maximum number of retry attempts (default: 5)
 * @param {number} initialDelay - Initial delay in ms before first attempt (default: 1000)
 * @returns {Promise} - Resolves when notifications are shown, rejects on failure
 */
export function showAchievementNotifications(achievements, maxRetries = 5, initialDelay = 1000) {
  if (!achievements || achievements.length === 0) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let attempts = 0;

      const attemptNotification = () => {
        attempts++;
        
        if (typeof window === 'undefined') {
          reject(new Error('Window object not available'));
          return;
        }

        // Try showMultipleAchievements first (preferred method)
        if (window.showMultipleAchievements && typeof window.showMultipleAchievements === 'function') {
          try {
            window.showMultipleAchievements(achievements);
            resolve();
            return;
          } catch (error) {
            if (attempts < maxRetries) {
              setTimeout(attemptNotification, 1000);
              return;
            } else {
              reject(error);
              return;
            }
          }
        } 
        
        // Fallback to individual showAchievement calls
        else if (window.showAchievement && typeof window.showAchievement === 'function') {
          try {
            // Show achievements one by one with delays
            achievements.forEach((achievement, index) => {
              setTimeout(() => {
                window.showAchievement(achievement);
              }, index * 1000);
            });
            resolve();
            return;
          } catch (error) {
            if (attempts < maxRetries) {
              setTimeout(attemptNotification, 1000);
              return;
            } else {
              reject(error);
              return;
            }
          }
        } 
        
        // Neither function is available
        else {
          // On first attempt, listen for system ready event
          if (attempts === 1) {
            const handleSystemReady = () => {
              setTimeout(attemptNotification, 100);
            };
            
            window.addEventListener('achievementSystemReady', handleSystemReady, { once: true });
            
            // Cleanup listener if we exceed retries
            setTimeout(() => {
              window.removeEventListener('achievementSystemReady', handleSystemReady);
            }, maxRetries * 1000);
          }
          
          if (attempts < maxRetries) {
            setTimeout(attemptNotification, 1000 * attempts);
          } else {
            const errorMsg = `Achievement notification failed after ${maxRetries} attempts`;
            reject(new Error(errorMsg));
          }
        }
      };

      attemptNotification();
    }, initialDelay);
  });
}

/**
 * Shows a single achievement notification
 * @param {Object} achievement - Single achievement object to display
 * @param {number} maxRetries - Maximum number of retry attempts (default: 3)
 * @returns {Promise} - Resolves when notification is shown, rejects on failure
 */
export function showSingleAchievementNotification(achievement, maxRetries = 3) {
  return showAchievementNotifications([achievement], maxRetries);
}

/**
 * Checks if the achievement notification system is ready
 * @returns {boolean} - True if system is ready, false otherwise
 */
export function isAchievementSystemReady() {
  if (typeof window === 'undefined') {
    return false;
  }
  
  return !!(window.showAchievement || window.showMultipleAchievements);
}

/**
 * Waits for the achievement system to be ready
 * @param {number} timeout - Maximum wait time in milliseconds (default: 5000)
 * @returns {Promise<boolean>} - Resolves to true when ready, false on timeout
 */
export function waitForAchievementSystem(timeout = 5000) {
  return new Promise((resolve) => {
    if (isAchievementSystemReady()) {
      resolve(true);
      return;
    }

    const timeoutId = setTimeout(() => {
      window.removeEventListener('achievementSystemReady', handleReady);
      resolve(false);
    }, timeout);

    const handleReady = () => {
      clearTimeout(timeoutId);
      resolve(true);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('achievementSystemReady', handleReady, { once: true });
    } else {
      clearTimeout(timeoutId);
      resolve(false);
    }
  });
}

/**
 * Waits for the achievement system to be ready, then shows notifications
 * This is the recommended function to use for most cases
 * @param {Array} achievements - Array of achievement objects to display
 * @param {number} timeout - Maximum wait time in milliseconds (default: 3000)
 * @returns {Promise} - Resolves when notifications are shown
 */
export async function showAchievementNotificationsWhenReady(achievements, timeout = 3000) {
  if (!achievements || achievements.length === 0) {
    return Promise.resolve();
  }

  try {
    // Wait for system to be ready
    const isReady = await waitForAchievementSystem(timeout);
    
    if (isReady) {
      // System is ready, show notifications immediately
      return await showAchievementNotifications(achievements, 3, 0);
    } else {
      // System not ready after timeout, try anyway with retries
      return await showAchievementNotifications(achievements, 5, 500);
    }
  } catch (error) {
    console.error('Error in showAchievementNotificationsWhenReady:', error);
    throw error;
  }
}