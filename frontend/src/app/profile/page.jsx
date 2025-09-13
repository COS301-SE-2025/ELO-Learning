'use client';
import ClickableAvatar from '@/app/ui/profile/clickable-avatar';
import { Cog } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useAvatar } from '../context/avatar-context';
import { gradients } from '../ui/avatar/avatar-colors';
import { AvatarColors } from '../ui/avatar/color';
import Achievements from '../ui/profile/achievements';
import BaselineTestOption from '../ui/profile/baseline-test-option';
import MatchStats from '../ui/profile/match-stats';
import UserInfo from '../ui/profile/user-info';
import UsernameBlock from '../ui/profile/username-block';
import useAchievementChecker from '@/hooks/useAchievementChecker';
import { fetchUserById } from '@/services/api';
import { useEffect } from 'react';

export default function Profile() {
  const { data: session, status, update: updateSession } = useSession();
  const { avatar } = useAvatar();

  // ACHIEVEMENT CHECKING
  useAchievementChecker({
    checkOnMount: true,
    debug: false, // Set to true if you want to see achievement logs
  });

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
        }
      }
    };

    refreshUserData();
  }, [session?.user?.id, updateSession]);

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'unauthenticated')
    return <div>Please sign in to view your profile.</div>;
  if (!session?.user) return <div>No user data available.</div>;

  const user = session.user;

  console.log('🔍 Profile page user data:', {
    id: user.id,
    username: user.username,
    baseLineTest: user.baseLineTest,
    currentLevel: user.currentLevel,
    elo_rating: user.elo_rating,
  });

  const getBackgroundStyle = (backgroundType) => {
    let style = { backgroundColor: '#421e68' };
    if (backgroundType && backgroundType.startsWith('solid-')) {
      const idx = parseInt(backgroundType.split('-')[1], 10);
      style = { backgroundColor: AvatarColors[idx] || '#421e68' };
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
          {' '}
          {/* Increased from pb-8 to pb-24 */}
          {/* Baseline Test Option - Show only if user hasn't taken it */}
          <BaselineTestOption userHasTakenBaseline={user.baseLineTest} />
          <UserInfo
            elo={user.elo_rating || 0}
            xp={user.xp || 0}
            ranking={user.rank || 'Unranked'}
          />
          <MatchStats />
          <Achievements />
        </div>
      </div>
    </div>
  );
}
