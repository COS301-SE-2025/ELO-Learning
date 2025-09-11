'use client';
import { fetchUserStreakInfo, updateUserStreak } from '@/services/api';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

/**
 * StreakDisplay Component
 * Shows current streak count with fire emoji and longest streak record
 * Follows the existing UI design system of the leaderboard and other components
 * Also handles automatic streak updates when component mounts (daily login tracking)
 */
export default function StreakDisplay({ onError }) {
  const { data: session, status } = useSession();
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdatingStreak, setIsUpdatingStreak] = useState(false);

  useEffect(() => {
    async function loadAndUpdateStreak() {
      if (status === 'loading') return;
      
      if (status !== 'authenticated' || !session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // First, try to update the user's streak (for daily login tracking)
        // This is done silently and won't show errors if it fails
        try {
          setIsUpdatingStreak(true);
          const updateResponse = await updateUserStreak(session.user.id);
          console.log('🔥 Streak update result:', updateResponse);
          
          // If streak was updated and achievements were unlocked, show them
          if (updateResponse.success && updateResponse.unlocked_achievements?.length > 0) {
            console.log('🏆 Streak achievements unlocked:', updateResponse.unlocked_achievements);
            // Let the achievement system handle showing these if available
            if (window.showMultipleAchievements) {
              window.showMultipleAchievements(updateResponse.unlocked_achievements);
            }
          }
        } catch (updateError) {
          console.warn('Streak update failed (non-critical):', updateError);
        } finally {
          setIsUpdatingStreak(false);
        }

        // Then fetch the current streak data to display
        const response = await fetchUserStreakInfo(session.user.id);
        
        if (response.success) {
          setStreakData(response.streak_data);
        } else {
          setError('Failed to load streak data');
        }
      } catch (err) {
        console.error('Error loading streak data:', err);
        setError('Failed to load streak data');
        // Notify parent component about error if callback provided
        if (onError) {
          onError(err);
        }
      } finally {
        setLoading(false);
      }
    }

    loadAndUpdateStreak();
  }, [session?.user?.id, status]);

  // Don't render anything if user is not authenticated
  if (status !== 'authenticated' || !session?.user?.id) {
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <div className="bg-[#2A2A2A] rounded-lg p-4 mb-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-4 bg-gray-600 rounded w-20 mb-2"></div>
            <div className="h-6 bg-gray-600 rounded w-16"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-600 rounded w-24 mb-2"></div>
            <div className="h-6 bg-gray-600 rounded w-12"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-[#2A2A2A] rounded-lg p-4 mb-6 border border-red-500/20">
        <div className="flex items-center justify-center">
          <span className="text-red-400 text-sm">Unable to load streak data</span>
        </div>
      </div>
    );
  }

  const currentStreak = streakData?.current_streak || 0;
  const longestStreak = streakData?.longest_streak || 0;

  return (
    <div className="bg-[#2A2A2A] rounded-lg p-4 mb-6 border border-gray-700/20 hover:border-[#FF6E99]/20 transition-colors">
      <div className="flex items-center justify-between">
        {/* Current Streak */}
        <div className="flex flex-col">
          <span className="text-gray-400 text-sm font-medium mb-1">
            Current Streak
          </span>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <span className="text-2xl font-bold text-white">
              {currentStreak}
            </span>
            <span className="text-gray-300 text-lg">
              {currentStreak === 1 ? 'day' : 'days'}
            </span>
            {isUpdatingStreak && (
              <span className="text-xs text-gray-500 ml-2">Updating...</span>
            )}
          </div>
        </div>

        {/* Longest Streak */}
        <div className="flex flex-col text-right">
          <span className="text-gray-400 text-sm font-medium mb-1">
            Personal Best
          </span>
          <div className="flex items-center gap-2 justify-end">
            <span className="text-xl">🏆</span>
            <span className="text-xl font-bold text-[#FF6E99]">
              {longestStreak}
            </span>
            <span className="text-gray-300 text-base">
              {longestStreak === 1 ? 'day' : 'days'}
            </span>
          </div>
        </div>
      </div>

      {/* Motivational message */}
      <div className="mt-3 pt-3 border-t border-gray-700/30">
        {currentStreak === 0 ? (
          <p className="text-gray-400 text-sm text-center">
            🎯 Start your learning streak today!
          </p>
        ) : currentStreak >= longestStreak && currentStreak > 1 ? (
          <p className="text-[#FF6E99] text-sm text-center">
            🎉 New personal best! Keep it going!
          </p>
        ) : (
          <p className="text-gray-400 text-sm text-center">
            💪 Keep building your streak!
          </p>
        )}
      </div>
    </div>
  );
}
