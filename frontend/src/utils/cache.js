// cache.js - FIXED VERSION
const CACHE_KEYS = {
  USER: 'user',
  TOKEN: 'token',
  NEXTAUTH_SESSION: 'nextauth_session',
  QUESTIONS: 'cached_questions',
  LEADERBOARD: 'cached_leaderboard',
  USER_ACHIEVEMENTS: 'user_achievements',
  USER_PROGRESS: 'user_progress',
  LAST_FETCH: 'last_fetch_timestamp',
  AUTH_PROVIDER: 'auth_provider',
  OAUTH_TOKEN: 'oauth_token',
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

      // FIX: Handle both cache format and raw tokens
      let parsedItem;
      try {
        parsedItem = JSON.parse(item);
      } catch (parseError) {
        // If JSON.parse fails, it might be a raw token - return it directly
        console.warn(`Cache key '${key}' contains non-JSON data, returning raw value`);
        return item; // Return the raw token/string
      }

      // Check if it's our cache format (has timestamp and expiryTime)
      if (parsedItem && typeof parsedItem === 'object' && 
          'timestamp' in parsedItem && 'expiryTime' in parsedItem) {
        
        const { data, timestamp, expiryTime } = parsedItem;
        const now = Date.now();

        // FIX: Correct expiry logic
        if (now > (timestamp + expiryTime)) {
          localStorage.removeItem(key);
          return null;
        }

        return data;
      } else {
        // It's not our cache format, but valid JSON - return as is
        return parsedItem;
      }
    } catch (error) {
      console.error('Cache get error:', error);
      // Try to return raw value as fallback
      try {
        return localStorage.getItem(key);
      } catch (fallbackError) {
        return null;
      }
    }
  },

  // NEW: Safe method to get raw values (for tokens)
  getRaw: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Cache getRaw error:', error);
      return null;
    }
  },

  // NEW: Safe method to set raw values (for tokens)
  setRaw: (key, value) => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('Cache setRaw error:', error);
      return false;
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

  // NEW: Clear everything (including raw tokens)
  clearAll: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Cache clearAll error:', error);
      return false;
    }
  },

  // NextAuth-specific methods
  setNextAuthSession: (session) => {
    try {
      cache.set(CACHE_KEYS.NEXTAUTH_SESSION, session, CACHE_EXPIRY.LONG);
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