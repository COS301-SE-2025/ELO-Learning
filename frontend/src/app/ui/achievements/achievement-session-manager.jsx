'use client';
import achievementTracker from '@/utils/achievementTracker';
import { useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';

/**
 * Component to manage achievement tracker user sessions
 * This ensures that notification history is user-specific
 */
export default function AchievementSessionManager() {
  const { data: session, status } = useSession();
  const lastUserIdRef = useRef(null);

  useEffect(() => {
    if (status === 'loading') return;

    const currentUserId = session?.user?.id || null;
    const lastUserId = lastUserIdRef.current;

    // Only update if the user has actually changed
    if (currentUserId !== lastUserId) {
      console.log('🏆 User session changed:', {
        from: lastUserId,
        to: currentUserId,
      });

      try {
        // Set the current user in achievement tracker
        achievementTracker.setCurrentUser(currentUserId);

        // Update the ref only after successful update
        lastUserIdRef.current = currentUserId;
      } catch (error) {
        console.error('🏆 Failed to update achievement tracker:', error);

        // Attempt recovery by clearing the tracker state
        try {
          achievementTracker.setCurrentUser(null);
          console.log('🏆 Achievement tracker reset to safe state');
        } catch (recoveryError) {
          console.error(
            '🏆 Failed to recover achievement tracker:',
            recoveryError,
          );
        }
      }
    }
  }, [session, status]);

  // This component doesn't render anything
  return null;
}
