import { cache, CACHE_KEYS } from '../utils/cache';
import { updateUserXP as apiUpdateUserXP } from './api';

// Enhanced API functions that work with NextAuth and caching
export const enhancedAPI = {
  // Update user XP and sync with session/cache
  async updateUserXP(userId, newXP) {
    try {
      // Call the original API
      const result = await apiUpdateUserXP(userId, newXP);

      if (result) {
        // Update NextAuth session cache
        const { sessionManager } = await import('../hooks/useSessionWithCache');
        sessionManager.updateCachedUserData({ xp: newXP });

        // Also update standalone user cache
        const cachedUser = cache.get(CACHE_KEYS.USER);
        if (cachedUser) {
          cache.set(CACHE_KEYS.USER, { ...cachedUser, xp: newXP });
        }
      }

      return result;
    } catch (error) {
      console.error('Failed to update user XP:', error);
      throw error;
    }
  },

  // Submit answer and update user data if XP is awarded
  async submitAnswerWithXPUpdate(questionId, answer, userId) {
    try {
      // This would be your existing submit answer API call
      const response = await fetch('http://localhost:3000/submit-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify({
          questionId,
          answer,
          userId,
        }),
      });

      const result = await response.json();

      // If XP was awarded, update the cached user data
      if (result.xpAwarded && result.updatedUser) {
        const { sessionManager } = await import('../hooks/useSessionWithCache');
        sessionManager.updateCachedUserData({
          xp: result.updatedUser.xp,
          // Add any other updated fields
        });
      }

      return result;
    } catch (error) {
      console.error('Failed to submit answer:', error);
      throw error;
    }
  },

  // Get auth token (works with NextAuth)
  getAuthToken() {
    const nextAuthSession = cache.get(CACHE_KEYS.NEXTAUTH_SESSION);
    if (nextAuthSession?.accessToken) {
      return nextAuthSession.accessToken;
    }

    // Fallback to localStorage token
    return localStorage.getItem('token');
  },

  // Cached fetch functions
  async fetchUserDataWithCache(userId) {
    const cacheKey = `user_${userId}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    try {
      const { fetchUserById } = await import('./api');
      const userData = await fetchUserById(userId);

      // Cache for 5 minutes
      cache.set(cacheKey, userData, 5 * 60 * 1000);

      return userData;
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      throw error;
    }
  },

  // Clear all user-related cache when logging out
  clearUserCache() {
    cache.clear();
    // Also clear any user-specific cache keys
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('user_') || key.startsWith('cache_')) {
        localStorage.removeItem(key);
      }
    });
  },
};

export default enhancedAPI;
