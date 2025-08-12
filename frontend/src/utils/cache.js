const CACHE_KEYS = {
  USER: 'user',
  TOKEN: 'token',
  NEXTAUTH_SESSION: 'nextauth_session', // For NextAuth session data
  QUESTIONS: 'cached_questions',
  LEADERBOARD: 'cached_leaderboard',
  USER_ACHIEVEMENTS: 'user_achievements',
  USER_PROGRESS: 'user_progress',
  LAST_FETCH: 'last_fetch_timestamp',
  AUTH_PROVIDER: 'auth_provider',
};

const CACHE_EXPIRY = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 24 * 60 * 60 * 1000, // 24 hours
};

export const cache = {
  set: (key, data, expiryTime = CACHE_EXPIRY.MEDIUM) => {
    try {
      const item = {
        data,
        timestamp: Date.now(),
        expiryTime,
      };
      localStorage.setItem(key, JSON.stringify(item));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  },

  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      // Try to parse as cache format first
      let parsed;
      try {
        parsed = JSON.parse(item);
      } catch (parseError) {
        // If JSON parsing fails, this might be legacy data stored as plain string
        console.warn(`Cache item "${key}" is not in expected format, treating as legacy data:`, parseError.message);
        
        // Special handling for JWT tokens (they start with 'eyJ')
        if (key === CACHE_KEYS.TOKEN && item.startsWith('eyJ')) {
          console.log('Detected legacy JWT token, migrating to proper cache format');
          // Migrate legacy JWT token to proper cache format
          cache.set(key, item);
          return item;
        }
        
        // For other legacy data, return the raw string but remove it to force refresh
        localStorage.removeItem(key);
        return item.startsWith('{') || item.startsWith('[') ? null : item;
      }

      // Check if it's in the expected cache format
      if (parsed && typeof parsed === 'object' && parsed.hasOwnProperty('data') && parsed.hasOwnProperty('timestamp')) {
        const { data, timestamp, expiryTime } = parsed;
        const now = Date.now();

        if (now - timestamp > expiryTime) {
          localStorage.removeItem(key);
          return null;
        }

        return data;
      } else {
        // If it's not in cache format, treat as legacy data
        console.warn(`Cache item "${key}" is not in expected cache format, removing legacy data`);
        localStorage.removeItem(key);
        return null;
      }
    } catch (error) {
      console.error('Cache get error:', error);
      // Remove corrupted cache item
      try {
        localStorage.removeItem(key);
      } catch (removeError) {
        console.error('Failed to remove corrupted cache item:', removeError);
      }
      return null;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Cache remove error:', error);
      return false;
    }
  },

  clear: () => {
    try {
      Object.values(CACHE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  },

  // NextAuth-specific methods
  setNextAuthSession: (session) => {
    try {
      cache.set(CACHE_KEYS.NEXTAUTH_SESSION, session, CACHE_EXPIRY.LONG);
      // Also cache user data separately for easier access
      if (session?.user) {
        cache.set(CACHE_KEYS.USER, session.user, CACHE_EXPIRY.LONG);
      }
      return true;
    } catch (error) {
      console.error('NextAuth session cache error:', error);
      return false;
    }
  },

  getNextAuthSession: () => {
    return cache.get(CACHE_KEYS.NEXTAUTH_SESSION);
  },

  clearNextAuthSession: () => {
    try {
      cache.remove(CACHE_KEYS.NEXTAUTH_SESSION);
      cache.remove(CACHE_KEYS.USER);
      return true;
    } catch (error) {
      console.error('NextAuth session clear error:', error);
      return false;
    }
  },
};

export { CACHE_EXPIRY, CACHE_KEYS };

