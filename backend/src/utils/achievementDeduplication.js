/**
 * Request deduplication utility for preventing duplicate achievement processing
 * Can be used across different routes that process achievements
 */

// Global map to track recent achievement processing requests
const recentAchievementRequests = new Map();
const ACHIEVEMENT_CACHE_DURATION = 10000; // 10 seconds

/**
 * Generate a unique key for achievement processing requests
 */
export function generateAchievementKey(userId, achievementType, context = {}) {
  const contextStr = Object.keys(context).length > 0 ? JSON.stringify(context) : '';
  return `${userId}-${achievementType}-${contextStr}`;
}

/**
 * Check if this achievement request was processed recently
 */
export function isRecentAchievementRequest(userId, achievementType, context = {}) {
  const key = generateAchievementKey(userId, achievementType, context);
  
  if (recentAchievementRequests.has(key)) {
    const requestTime = recentAchievementRequests.get(key);
    if (Date.now() - requestTime < ACHIEVEMENT_CACHE_DURATION) {
      console.log(`🔄 ACHIEVEMENT DEDUP: Skipping recent request for ${key}`);
      return true;
    } else {
      // Expired - remove from cache
      recentAchievementRequests.delete(key);
    }
  }
  
  return false;
}

/**
 * Mark an achievement request as processed
 */
export function markAchievementProcessed(userId, achievementType, context = {}) {
  const key = generateAchievementKey(userId, achievementType, context);
  recentAchievementRequests.set(key, Date.now());
  
  // Clean up old entries
  for (const [cacheKey, timestamp] of recentAchievementRequests.entries()) {
    if (Date.now() - timestamp > ACHIEVEMENT_CACHE_DURATION) {
      recentAchievementRequests.delete(cacheKey);
    }
  }
}

/**
 * Clear all achievement request cache (useful for testing)
 */
export function clearAchievementCache() {
  recentAchievementRequests.clear();
  console.log('🧹 Achievement request cache cleared');
}

/**
 * Enhanced error handling for database constraint violations
 */
export function handleDatabaseConstraintError(error, context = '') {
  if (error && error.code === '23505') {
    // Unique constraint violation (duplicate key)
    console.log(`🔄 DUPLICATE CONSTRAINT: ${context} - ${error.message}`);
    return {
      isDuplicate: true,
      message: 'Resource already exists (handled gracefully)',
      shouldContinue: true
    };
  } else if (error && error.message && error.message.includes('duplicate key value violates unique constraint')) {
    // Text-based duplicate detection
    console.log(`🔄 DUPLICATE CONSTRAINT (text): ${context} - ${error.message}`);
    return {
      isDuplicate: true,
      message: 'Resource already exists (handled gracefully)',
      shouldContinue: true
    };
  } else if (error) {
    // Other database error
    console.error(`❌ DATABASE ERROR: ${context} - ${error.message}`);
    return {
      isDuplicate: false,
      message: error.message,
      shouldContinue: false
    };
  }
  
  return {
    isDuplicate: false,
    message: 'Success',
    shouldContinue: true
  };
}

/**
 * Safe achievement unlock with duplicate handling
 */
export async function safeUnlockAchievement(supabase, userId, achievementId, context = '') {
  try {
    console.log(`🏆 SAFE UNLOCK: Attempting to unlock achievement ${achievementId} for user ${userId}`);
    
    const { error: unlockError } = await supabase
      .from('UserAchievements')
      .insert({
        user_id: userId,
        achievement_id: achievementId,
        unlocked_at: new Date().toISOString(),
      });

    const errorResult = handleDatabaseConstraintError(unlockError, `Achievement ${achievementId} unlock ${context}`);
    
    if (errorResult.isDuplicate) {
      // Achievement already unlocked - this is OK
      return {
        success: true,
        wasNewUnlock: false,
        message: 'Achievement already unlocked'
      };
    } else if (!errorResult.shouldContinue) {
      // Real error occurred
      return {
        success: false,
        wasNewUnlock: false,
        error: errorResult.message
      };
    } else {
      // Successfully unlocked
      console.log(`✅ SAFE UNLOCK: Successfully unlocked achievement ${achievementId} for user ${userId}`);
      return {
        success: true,
        wasNewUnlock: true,
        message: 'Achievement unlocked successfully'
      };
    }
  } catch (error) {
    console.error(`❌ SAFE UNLOCK ERROR: ${context}`, error);
    return {
      success: false,
      wasNewUnlock: false,
      error: error.message
    };
  }
}

/**
 * Batch process achievements with deduplication
 */
export async function batchProcessAchievements(supabase, userId, achievementChecks) {
  const results = [];
  const errors = [];
  
  for (const { type, context, checkFunction } of achievementChecks) {
    try {
      // Check if this type was processed recently
      if (isRecentAchievementRequest(userId, type, context)) {
        console.log(`⏭️ BATCH: Skipping recent ${type} check for user ${userId}`);
        continue;
      }
      
      // Mark as being processed
      markAchievementProcessed(userId, type, context);
      
      // Run the achievement check
      const achievementResults = await checkFunction();
      
      if (achievementResults && achievementResults.length > 0) {
        results.push(...achievementResults);
        console.log(`✅ BATCH: ${type} check yielded ${achievementResults.length} achievements`);
      } else {
        console.log(`📊 BATCH: ${type} check completed (no new achievements)`);
      }
      
    } catch (error) {
      console.error(`❌ BATCH: Error in ${type} check:`, error);
      errors.push({ type, error: error.message });
    }
  }
  
  return { results, errors };
}
