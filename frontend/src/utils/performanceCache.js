// src/utils/performanceCache.js

const CACHE_DURATIONS = {
  QUICK: 2 * 60 * 1000, // 2 minutes - for frequently changing data (leaderboard)
  MEDIUM: 10 * 60 * 1000, // 10 minutes - for semi-static data (user achievements)
  LONG: 30 * 60 * 1000, // 30 minutes - for rarely changing data (questions)
};

export const performanceCache = {
  // Get cached data if still valid
  get: (key, maxAge = CACHE_DURATIONS.MEDIUM) => {
    // Check if we're on the server (no localStorage)
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const item = localStorage.getItem(`cache_${key}`);
      if (!item) return null;

      const { data, timestamp } = JSON.parse(item);
      const age = Date.now() - timestamp;

      if (age > maxAge) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }

      console.log(`📦 Cache HIT for ${key} (${Math.round(age / 1000)}s old)`);
      return data;
    } catch (error) {
      console.warn(`Cache get error for ${key}:`, error);
      return null;
    }
  },

  // Store data with timestamp
  set: (key, data) => {
    // Check if we're on the server (no localStorage)
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      const item = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(`cache_${key}`, JSON.stringify(item));
      console.log(`💾 Cache SET for ${key}`);
      return true;
    } catch (error) {
      console.warn(`Cache set error for ${key}:`, error);
      return false;
    }
  },

  // Remove specific cache
  remove: (key) => {
    localStorage.removeItem(`cache_${key}`);
    console.log(`🗑️ Cache REMOVED for ${key}`);
  },

  // Clear all performance cache (keep auth data)
  clear: () => {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith('cache_')) {
        localStorage.removeItem(key);
      }
    });
    console.log('🧹 Performance cache cleared');
  },

  // Force refresh - remove cache and fetch fresh
  refresh: (key) => {
    performanceCache.remove(key);
    console.log(`🔄 Cache REFRESH triggered for ${key}`);
  },
};

export { CACHE_DURATIONS };
