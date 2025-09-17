'use client';
import ClickableAvatar from '@/app/ui/profile/clickable-avatar';
import { fetchUserStreakInfo } from '@/services/api';
import { initializeAchievementTracking } from '@/utils/gameplayAchievementHandler';
import { Cog } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAvatar } from '../context/avatar-context';
import { avatarColors, gradients } from '../ui/avatar/avatar-colors';
import Achievements from '../ui/profile/achievements';
import BaselineTestOption from '../ui/profile/baseline-test-option';
import MatchStats from '../ui/profile/match-stats';
import UserInfo from '../ui/profile/user-info';
import UsernameBlock from '../ui/profile/username-block';
import { fetchUserById } from '@/services/api';

export default function Profile() {
  const { data: session, status, update: updateSession } = useSession();
  const { avatar } = useAvatar();
  const [streakData, setStreakData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Listen for ELO updates
  useEffect(() => {
    const handleEloUpdate = () => {
      console.log('Profile: ELO update event received, refreshing...');
      setRefreshKey((prev) => prev + 1);
    };

    window.addEventListener('eloUpdated', handleEloUpdate);

    return () => {
      window.removeEventListener('eloUpdated', handleEloUpdate);
    };
  }, []);

  // Initialize achievement tracking when user logs in (no notifications)
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      initializeAchievementTracking(session.user.id);
    }
  }, [status, session?.user?.id]);

  // Refresh user data when profile page loads (in case session is stale)
  useEffect(() => {
    const refreshUserData = async () => {
      if (session?.user?.id) {
        try {
          console.log('🔄 Refreshing user data on profile page load...');
          const freshUserData = await fetchUserById(session.user.id);

          // Check if data has changed
          const hasChanged =
            freshUserData.baseLineTest !== session.user.baseLineTest ||
            freshUserData.currentLevel !== session.user.currentLevel ||
            freshUserData.elo_rating !== session.user.elo_rating;

          if (hasChanged) {
            console.log('🔄 User data changed, updating session...', {
              oldBaseLineTest: session.user.baseLineTest,
              newBaseLineTest: freshUserData.baseLineTest,
              oldCurrentLevel: session.user.currentLevel,
              newCurrentLevel: freshUserData.currentLevel,
            });

            await updateSession({
              user: {
                ...session.user,
                baseLineTest: freshUserData.baseLineTest,
                currentLevel: freshUserData.currentLevel,
                elo_rating: freshUserData.elo_rating,
                xp: freshUserData.xp,
                rank: freshUserData.rank,
              },
            });

            console.log('✅ Profile session updated successfully');
          } else {
            console.log('✅ User data is up to date');
          }
        } catch (error) {
          console.error('❌ Failed to refresh user data on profile:', error);
          // Continue with existing session data - don't let auth errors break the page
          console.log('🔄 Using existing session data due to auth error');
        }
      }
    };

    // Only try to refresh if we have a session and are authenticated
    if (status === 'authenticated') {
      refreshUserData();
    }
  }, [session?.user?.id, status, updateSession]);

  // Fetch streak data when user is authenticated
  useEffect(() => {
    async function loadStreakData() {
      if (status === 'authenticated' && session?.user?.id) {
        try {
          const response = await fetchUserStreakInfo(session.user.id);
          if (response.success) {
            setStreakData(response.streak_data);
          } else {
            // Set default if API response indicates failure
            setStreakData({ current_streak: 0 });
          }
        } catch (error) {
          console.warn('Failed to load streak data for profile:', error);
          // Set default streak data to prevent UI issues - continue gracefully
          setStreakData({ current_streak: 0 });
        }
      }
    }

    loadStreakData();
  }, [session?.user?.id, status, refreshKey]); // Add refreshKey to re-fetch when ELO updates

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'unauthenticated')
    return <div>Please sign in to view your profile.</div>;
  if (!session?.user) return <div>No user data available.</div>;

  const user = session.user;

  console.log('🔍 Profile page user data:', {
    id: user.id,
    username: user.username,
    baseLineTest: user.baseLineTest,
    baseLineTestType: typeof user.baseLineTest,
    currentLevel: user.currentLevel,
    elo_rating: user.elo_rating,
  });

  const getBackgroundStyle = (backgroundType) => {
    let style = { backgroundColor: '#421e68' };
    if (backgroundType && backgroundType.startsWith('solid-')) {
      const idx = parseInt(backgroundType.split('-')[1], 10);
      style = { backgroundColor: avatarColors[idx] || '#421e68' };
    } else if (backgroundType && backgroundType.startsWith('gradient-')) {
      const idx = parseInt(backgroundType.split('-')[1], 10);
      const g = gradients[idx];
      if (g) {
        style = {
          background: `linear-gradient(135deg, ${g.colors.join(', ')})`,
        };
      }
    }
    return style;
  };

  return (
    <div className="min-h-full flex flex-col">
      {/* Header section - FIXED at top */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-4 py-4"
        style={getBackgroundStyle(avatar?.background)}
      >
        <div className="flex-1"></div>
        <div className="flex-2 flex justify-center">
          <ClickableAvatar avatar={{ ...avatar, background: 'transparent' }} />
        </div>
        <div className="flex-1 flex justify-center">
          <Link
            href="settings"
            className="transition-transform hover:scale-105 active:scale-95"
          >
            <Cog stroke="black" size={40} />
          </Link>
        </div>
      </div>

      {/* Content section - scrollable */}
      <div className="flex-1 flex flex-col">
        <UsernameBlock
          username={user.username}
          name={user.name}
          surname={user.surname}
          date_joined={
            user.joinDate
              ? new Date(user.joinDate).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : 'N/A'
          }
        />

        <div className="flex flex-col space-y-4 pb-24">
          {/* Baseline Test Option - Show only if user hasn't taken it */}
          <BaselineTestOption userHasTakenBaseline={user.baseLineTest} />
          <UserInfo
            elo={user.elo_rating || user.eloRating || 0}
            xp={user.xp || 0}
            ranking={user.rank || 'Unranked'}
            streak={streakData?.current_streak || 0}
          />
          <MatchStats />
          <Achievements />
        </div>
      </div>
    </div>
  );
}
