// hooks/useAchievementChecker.js
'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';
import { fetchUserAchievementsWithStatus } from '@/services/api';
import { showAchievementNotificationsWhenReady } from '@/utils/achievementNotifications';
import achievementTracker from '@/utils/achievementTracker';

export default function useAchievementChecker(options = {}) {
  const { status, data: session } = useSession();
  const { 
    checkOnMount = true, 
    checkInterval = null, // Set to number (ms) for periodic checking
    debug = false 
  } = options;
  
  const lastCheckRef = useRef(0);
  const intervalRef = useRef(null);

  const checkForNewAchievements = async () => {
    if (status !== 'authenticated' || !session?.user?.id) {
      if (debug) console.log('🏆 Achievement check skipped - no authenticated session');
      return;
    }

    try {
      if (debug) console.log('🏆 Checking for achievements for user:', session.user.id);
      
      const data = await fetchUserAchievementsWithStatus(session.user.id);
      
      if (!data || !Array.isArray(data)) {
        if (debug) console.log('🏆 No achievement data received');
        return;
      }

      // Find NEW unlocked achievements (not previously notified)
      const newUnlockedAchievements = achievementTracker.getNewUnlockedAchievements(data);
      
      if (debug) {
        console.log(`🏆 Found ${newUnlockedAchievements.length} NEW unlocked achievements`);
      }

      // Show notifications only for NEW achievements
      if (newUnlockedAchievements.length > 0) {
        await showAchievementNotificationsWhenReady(newUnlockedAchievements);
        
        // Mark as notified so they don't show again
        const achievementIds = newUnlockedAchievements.map(ach => ach.id || ach.achievement_id);
        achievementTracker.markMultipleAsNotified(achievementIds);
        
        if (debug) console.log('🏆 Achievement notifications triggered successfully');
      }

      lastCheckRef.current = Date.now();
    } catch (error) {
      console.error('🏆 Error checking achievements:', error);
    }
  };

  // Check on mount
  useEffect(() => {
    if (checkOnMount && status === 'authenticated') {
      // Small delay to ensure notification system is ready
      const timer = setTimeout(checkForNewAchievements, 1000);
      return () => clearTimeout(timer);
    }
  }, [status, checkOnMount]);

  // Set up interval checking if requested
  useEffect(() => {
    if (checkInterval && typeof checkInterval === 'number' && status === 'authenticated') {
      intervalRef.current = setInterval(checkForNewAchievements, checkInterval);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [checkInterval, status]);

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
    lastCheck: lastCheckRef.current
  };
}