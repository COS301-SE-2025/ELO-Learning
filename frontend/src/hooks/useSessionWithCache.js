import { signOut, useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { cache, CACHE_EXPIRY, CACHE_KEYS } from '../utils/cache'

// Custom hook to manage session data with caching
export function useSessionWithCache() {
  const { data: session, status, update } = useSession()

  // Cache session data when it changes
  useEffect(() => {
    if (status === 'authenticated' && session) {
      cache.setNextAuthSession(session)
    } else if (status === 'unauthenticated') {
      cache.clearNextAuthSession()
    }
  }, [session, status])

  // Enhanced session object with cache integration
  const enhancedSession = {
    ...session,
    status,
    update,
    // Helper methods for common operations
    getUserData: () => {
      return session?.user || cache.get(CACHE_KEYS.USER)
    },
    getXP: () => {
      const user = session?.user || cache.get(CACHE_KEYS.USER)
      return user?.xp || 0
    },
    getUsername: () => {
      const user = session?.user || cache.get(CACHE_KEYS.USER)
      return (
        user?.username || user?.name || user?.email?.split('@')[0] || 'User'
      )
    },
  }

  return enhancedSession
}

// Session management utilities
export const sessionManager = {
  // Update cached user data (useful after API calls that change user data)
  updateCachedUserData: (updatedUserData) => {
    const cachedSession = cache.get(CACHE_KEYS.NEXTAUTH_SESSION)
    if (cachedSession) {
      const updatedSession = {
        ...cachedSession,
        user: {
          ...cachedSession.user,
          ...updatedUserData,
        },
      }
      cache.setNextAuthSession(updatedSession)
    }

    // Also update the standalone user cache
    const cachedUser = cache.get(CACHE_KEYS.USER)
    if (cachedUser) {
      cache.set(
        CACHE_KEYS.USER,
        { ...cachedUser, ...updatedUserData },
        CACHE_EXPIRY.LONG,
      )
    }
  },

  // Get current user data from cache (for when NextAuth session isn't available)
  getCachedUserData: () => {
    const cachedSession = cache.get(CACHE_KEYS.NEXTAUTH_SESSION)
    if (cachedSession?.user) {
      return cachedSession.user
    }
    return cache.get(CACHE_KEYS.USER)
  },

  // Check if user is authenticated (works with cache)
  isAuthenticated: () => {
    const cachedSession = cache.get(CACHE_KEYS.NEXTAUTH_SESSION)
    return !!cachedSession?.user
  },

  // Enhanced signout that clears cache
  signOut: async (options = {}) => {
    // Clear our cache first
    cache.clearNextAuthSession()
    cache.clear() // Clear all cached data

    // Then use NextAuth signOut
    return signOut({
      callbackUrl: '/',
      ...options,
    })
  },
}

export default useSessionWithCache
