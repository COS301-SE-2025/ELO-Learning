// src/utils/performanceCache.js

const CACHE_DURATIONS = {
  QUICK: 2 * 60 * 1000, // 2 minutes - for frequently changing data (leaderboard)
  MEDIUM: 10 * 60 * 1000, // 10 minutes - for semi-static data (user achievements)
  LONG: 30 * 60 * 1000, // 30 minutes - for rarely changing data (questions)
};

// Safe JSON parsing with error handling
const safeJSONParse = (value) => {
  try {
    // Handle case where value is already an object
    if (typeof value === 'object' && value !== null) {
      return value;
    }
    
    // Handle empty or null values
    if (!value || value === 'undefined' || value === 'null') {
      return null;
    }
    
    // Try to parse as JSON
    return JSON.parse(value);
  } catch (error) {
    console.warn(`🚨 Cache: Invalid JSON data found, clearing corrupted entry:`, error.message);
    return null;
  }
};

// Safe JSON stringification
const safeJSONStringify = (value) => {
  try {
    return JSON.stringify(value);
  } catch (error) {
    console.warn(`🚨 Cache: Cannot stringify value:`, error.message);
    return null;
  }
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

      // Use safe JSON parsing to handle corrupted data
      const parsed = safeJSONParse(item);
      if (!parsed) {
        // Corrupted data found, remove it
        localStorage.removeItem(`cache_${key}`);
        console.log(`💨 Cache MISS for ${key} (corrupted data removed)`);
        return null;
      }

      const { data, timestamp } = parsed;
      
      // Check if the parsed object has the expected structure
      if (typeof timestamp !== 'number') {
        console.warn(`🚨 Cache: Invalid cache structure for ${key}, removing`);
        localStorage.removeItem(`cache_${key}`);
        return null;
      }

      const age = Date.now() - timestamp;

      if (age > maxAge) {
        localStorage.removeItem(`cache_${key}`);
        console.log(`💨 Cache EXPIRED for ${key}`);
        return null;
      }

      console.log(`📦 Cache HIT for ${key} (${Math.round(age / 1000)}s old)`);
      return data;
    } catch (error) {
      console.warn(`🚨 Cache get error for ${key}, clearing entry:`, error.message);
      // Clear the problematic cache entry
      try {
        localStorage.removeItem(`cache_${key}`);
      } catch (clearError) {
        console.warn(`🚨 Cache: Failed to clear corrupted entry:`, clearError.message);
      }
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
      
      const serialized = safeJSONStringify(item);
      if (!serialized) {
        console.warn(`🚨 Cache: Failed to serialize data for ${key}`);
        return false;
      }
      
      localStorage.setItem(`cache_${key}`, serialized);
      console.log(`💾 Cache SET for ${key}`);
      return true;
    } catch (error) {
      console.warn(`🚨 Cache set error for ${key}:`, error.message);
      return false;
    }
  },

  // Remove specific cache
  remove: (key) => {
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      localStorage.removeItem(`cache_${key}`);
      console.log(`🗑️ Cache REMOVED for ${key}`);
    } catch (error) {
      console.warn(`🚨 Cache remove error for ${key}:`, error.message);
    }
  },

  // Clear all performance cache (keep auth data)
  clear: () => {
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      });
      console.log('🧹 Performance cache cleared');
    } catch (error) {
      console.warn('🚨 Cache clear error:', error.message);
    }
  },

  // Force refresh - remove cache and fetch fresh
  refresh: (key) => {
    performanceCache.remove(key);
    console.log(`🔄 Cache REFRESH triggered for ${key}`);
  },

  // Get cache statistics (useful for debugging)
  getStats: () => {
    if (typeof window === 'undefined') {
      return { cacheEntries: 0, isServer: true };
    }
    
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      return {
        cacheEntries: cacheKeys.length,
        totalLocalStorageKeys: keys.length,
        isServer: false
      };
    } catch (error) {
      console.warn('🚨 Cache stats error:', error.message);
      return { cacheEntries: 0, error: true };
    }
  },
};

export { CACHE_DURATIONS };