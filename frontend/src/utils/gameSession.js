// gameSession.js - Utility functions for managing game session state

/**
 * Reset XP calculation state to allow a new game session
 * Call this when starting a new single-player game
 */
export function resetXPCalculationState() {
  try {
    // Clear all XP calculation related session storage
    sessionStorage.removeItem('submittedOnce');
    sessionStorage.removeItem('calculatingXP');

    // Clear any existing questions data to ensure fresh start
    localStorage.removeItem('questionsObj');

    console.log('🔄 XP calculation state reset - ready for new game');
    return true;
  } catch (error) {
    console.error('❌ Error resetting XP calculation state:', error);
    return false;
  }
}

/**
 * Check if an XP calculation is currently in progress
 */
export function isXPCalculationInProgress() {
  try {
    return sessionStorage.getItem('calculatingXP') !== null;
  } catch (error) {
    console.error('❌ Error checking XP calculation state:', error);
    return false;
  }
}

/**
 * Check if XP has already been calculated for current session
 */
export function hasXPBeenCalculated() {
  try {
    return sessionStorage.getItem('submittedOnce') === 'true';
  } catch (error) {
    console.error('❌ Error checking XP submission state:', error);
    return false;
  }
}

/**
 * Force clear all game session data (emergency reset)
 */
export function forceResetGameSession() {
  try {
    // Clear all possible session storage keys
    const keysToRemove = [
      'submittedOnce',
      'calculatingXP',
      'questionsObj',
      'gameStartTime',
      'currentQuestion',
      'gameSession',
    ];

    keysToRemove.forEach((key) => {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    });

    console.log('🆘 Force reset completed - all game session data cleared');
    return true;
  } catch (error) {
    console.error('❌ Error in force reset:', error);
    return false;
  }
}
