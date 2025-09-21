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
import MatchStats from '../ui/profile/match-stats';
import UserInfo from '../ui/profile/user-info';
import UsernameBlock from '../ui/profile/username-block';

export default function Page() {
  const { data: session, status } = useSession();
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

  // Fetch streak data when user is authenticated
  useEffect(() => {
    async function loadStreakData() {
      if (status === 'authenticated' && session?.user?.id) {
        try {
          const response = await fetchUserStreakInfo(session.user.id);
          if (response.success) {
            setStreakData(response.streak_data);
          }
        } catch (error) {
          console.warn('Failed to load streak data for profile:', error);
          // Set default streak data to prevent UI issues
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
