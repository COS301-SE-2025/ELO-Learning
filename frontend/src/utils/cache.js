const CACHE_KEYS = {
  USER: 'user',
  TOKEN: 'token',
  NEXTAUTH_SESSION: 'nextauth_session', // For NextAuth session data
  QUESTIONS: 'cached_questions',
  LEADERBOARD: 'cached_leaderboard',
  USER_ACHIEVEMENTS: 'user_achievements',
  USER_PROGRESS: 'user_progress',
  LAST_FETCH: 'last_fetch_timestamp',
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

      const { data, timestamp, expiryTime } = JSON.parse(item);
      const now = Date.now();

      if (now - timestamp > expiryTime) {
        localStorage.removeItem(key);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Cache get error:', error);
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
