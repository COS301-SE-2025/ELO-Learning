// hooks/useAchievementChecker.js
'use client';
import { fetchUserAchievementsWithStatus } from '@/services/api';
import achievementTracker from '@/utils/achievementTracker';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useRef } from 'react';

export default function useAchievementChecker(options = {}) {
  const { status, data: session } = useSession();
  const {
    checkOnMount = true,
    checkInterval = null, // Set to number (ms) for periodic checking
    debug = false,
  } = options;

  const lastCheckRef = useRef(0);
  const intervalRef = useRef(null);
  const hasMountedRef = useRef(false);

  const checkForNewAchievements = useCallback(async () => {
    if (status !== 'authenticated' || !session?.user?.id) {
      if (debug)
        console.log('🏆 Achievement check skipped - no authenticated session');
      return;
    }

    try {
      // Ensure the achievement tracker is set to the current user
      achievementTracker.setCurrentUser(session.user.id);

      if (debug)
        console.log('🏆 Fetching achievements for user:', session.user.id);

      const data = await fetchUserAchievementsWithStatus(session.user.id);

      if (!data || !Array.isArray(data)) {
        if (debug) console.log('🏆 No achievement data received');
        return;
      }

      // IMPORTANT: We DO NOT show notifications here
      // This hook only fetches data for display purposes
      // Notifications are ONLY shown during gameplay when achievements are earned

      if (debug) {
        const unlockedCount = data.filter(
          (ach) => ach.unlocked === true,
        ).length;
        console.log(
          `🏆 Fetched ${data.length} total achievements, ${unlockedCount} unlocked`,
        );
        console.log(
          '🏆 No notifications shown - this is data fetching, not gameplay',
        );
      }

      lastCheckRef.current = Date.now();
    } catch (error) {
      console.error('🏆 Error fetching achievements:', error);
    }
  }, [status, session?.user?.id, debug]);

  // Check on mount
  useEffect(() => {
    if (checkOnMount && status === 'authenticated') {
      // Small delay to ensure system is ready
      const timer = setTimeout(() => {
        if (!hasMountedRef.current) {
          hasMountedRef.current = true;
          checkForNewAchievements();
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [status, checkOnMount, checkForNewAchievements]);

  // Set up interval checking if requested
  useEffect(() => {
    if (
      checkInterval &&
      typeof checkInterval === 'number' &&
      status === 'authenticated'
    ) {
      intervalRef.current = setInterval(
        () => checkForNewAchievements(),
        checkInterval,
      );

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [checkInterval, status, checkForNewAchievements]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    checkForNewAchievements,
    lastCheck: lastCheckRef.current,
  };
}
