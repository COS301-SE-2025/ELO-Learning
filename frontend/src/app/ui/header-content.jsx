// FIXED header-content.jsx
'use client';

import clsx from 'clsx';
import { Flame, Gem, Trophy, Zap } from 'lucide-react';

import { fetchUserStreakInfo } from '@/services/api';
import { useSession } from 'next-auth/react'; // ← CHANGED: Use NextAuth directly
import { memo, useEffect, useMemo, useState } from 'react';

const HeaderContent = memo(function HeaderContent() {
  const { data: session, status } = useSession(); // ← SIMPLIFIED: Just use NextAuth
  const [streakData, setStreakData] = useState(null);

  // Memoize user data processing
  const userData = useMemo(() => {
    if (status !== 'authenticated' || !session?.user) {
      return null;
    }

    return {
      username:
        session.user.username ||
        session.user.name ||
        session.user.email?.split('@')[0] ||
        'User',
      xp: Math.round(session.user.xp || 0),
      rank: session.user.rank,
      elo_rating: session.user.elo_rating,
    };
  }, [session, status]);

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
          console.warn('Failed to load streak data for header:', error);
          // Set default streak data to prevent UI issues
          setStreakData({ current_streak: 0 });
        }
      }
    }

    loadStreakData();
  }, [session?.user?.id, status]);

  // Show loading state while session is being loaded
  if (status === 'loading') {
    return (
      <div className="w-full md:w-auto">
        <div
          className={clsx(
            'flex h-[48px] w-full items-start justify-center gap-6 rounded-md p-3 text-sm font-medium md:flex-col md:h-auto md:gap-4 md:justify-start md:p-2 md:px-5 md:w-auto',
          )}
        >
          <div className="flex items-center gap-2">
            <Trophy size={24} fill="#FF8000" stroke="#FF8000" />
            <div className="h-4 w-16 bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center gap-2">
            <Gem size={24} fill="#50eeff" stroke="#50eeff" />
            <div className="h-4 w-12 bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={24} fill="#FFD000" stroke="#FFD000" />
            <div className="h-4 w-12 bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center gap-2">
            <Flame size={24} fill="#FF4500" stroke="#FF4500" />
            <div className="h-4 w-8 bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (status !== 'authenticated' || !userData) {
    return null;
  }

  return (
    <div className="w-full md:w-auto">
      <div
        className={clsx(
          'flex h-[48px] w-full items-start justify-center gap-6 rounded-md p-3 text-sm font-medium md:flex-col md:h-auto md:gap-4 md:justify-start md:p-2 md:px-5 md:w-auto',
        )}
      >
        {/* <div className="flex items-center gap-2">
          <p className="text-lg font-bold">{userData.username}</p>
        </div> */}
        <div className="flex items-center gap-2">
          <Trophy size={24} fill="#FF8000" stroke="#FF8000" />
          <p>{userData.elo_rating}</p>
        </div>
        <div className="flex items-center gap-2">
          <Gem size={24} fill="#50eeff" stroke="#50eeff" />
          <p>{userData.rank}</p>
        </div>

        <div className="flex items-center gap-2">
          <Zap size={24} fill="#FFD000" stroke="#FFD000" />
          <p>{userData.xp}xp</p>
        </div>

        {/* Daily Streak Display */}
        <div className="flex items-center gap-2">
          <Flame size={24} fill="#FF4500" stroke="#FF4500" />
          <p>{streakData?.current_streak || 0}</p>
        </div>
      </div>
    </div>
  );
});

export default HeaderContent;
