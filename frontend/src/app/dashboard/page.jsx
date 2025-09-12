'use client';
import { fetchUsersByRank, fetchUserById } from '@/services/api';
import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import LeaderboardTable from '../ui/leaderboard-table';
import BaselineTestPopup from '../ui/pop-up/baseline-test';

import useAchievementChecker from '@/hooks/useAchievementChecker';

export default function Page() {
  // const { data: session, status } = useSession();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortType, setSortType] = useState('xp');
  const { data: session, status, update: updateSession } = useSession();
  const [showPopup, setShowPopup] = useState(false);
  const searchParams = useSearchParams();

  // ACHIEVEMENT CHECKING
  useAchievementChecker({
    checkOnMount: true,
    debug: false, // Set to true if you want to see achievement logs
  });

  // Function to update session with leaderboard data
  const updateSessionWithLeaderboardData = async (leaderboardData) => {
    try {
      // You can customize this based on what data you want to add to the session
      await updateSession({
        ...session,
        leaderboardData: leaderboardData,
        lastLeaderboardUpdate: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to update session with leaderboard data:', error);
    }
  };

  // Sorting function for XP or ELO
  const sortUsers = (userData, type = 'xp') => {
    return userData.sort((a, b) => {
      if (type === 'elo') {
        if ((b.elo ?? 0) !== (a.elo ?? 0)) return (b.elo ?? 0) - (a.elo ?? 0);
      } else {
        if (b.xp !== a.xp) return b.xp - a.xp;
      }
      return a.username.localeCompare(b.username);
    });
  };

  useEffect(() => {
    let mounted = true;
    let timeoutId;

    // Check if user is returning from baseline test completion
    const refreshFromBaseline = async () => {
      const baselineCompleted = searchParams.get('baseline_completed');
      if (baselineCompleted === 'true' && session?.user?.id) {
        console.log(
          '🔄 User returned from baseline test, refreshing user data...',
        );
        try {
          // Fetch fresh user data from database
          const freshUserData = await fetchUserById(session.user.id);

          // Update session with fresh data
          await updateSession({
            user: {
              ...session.user,
              baseLineTest: freshUserData.baseLineTest,
              currentLevel: freshUserData.currentLevel,
              elo_rating: freshUserData.elo_rating,
            },
          });

          console.log('✅ Session refreshed after baseline completion');
        } catch (error) {
          console.error('❌ Failed to refresh user data:', error);
        }
      }
    };

    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        // Only fetch leaderboard if user has a rank
        if (session?.user?.rank == null) {
          setUsers([]);
          setLoading(false);
          return;
        }

        const data = await fetchUsersByRank(session.user.rank);

        // Use setTimeout to defer sorting and avoid blocking the UI
        timeoutId = setTimeout(async () => {
          if (mounted) {
            const sortedData = sortUsers([...data], sortType); // Clone array before sorting
            setUsers(sortedData);
            setLoading(false);

            // Update session with fresh leaderboard data
            await updateSessionWithLeaderboardData(data);
          }
        }, 0);
      } catch (error) {
        console.error('Failed to load users:', error);
        if (mounted) {
          setError('Failed to load leaderboard. Please try again.');
          setLoading(false);
        }
      }
    }

    if (status === 'loading') return; // Don't load users while session is loading

    async function checkBaselineTest() {
      if (!session?.user?.id) return; // user not loaded yet

      try {
        console.log('🔍 Checking baseline test status...', {
          baseLineTest: session.user.baseLineTest,
          joinDate: session.user.joinDate,
        });

        // Only show popup for newly registered users (within 24 hours) who haven't taken the baseline test
        if (session.user.baseLineTest === false && session.user.joinDate) {
          const joinDate = new Date(session.user.joinDate);
          const now = new Date();
          const hoursSinceJoin = (now - joinDate) / (1000 * 60 * 60); // Convert to hours

          console.log('⏰ Hours since join:', hoursSinceJoin);

          // Only show popup if user joined within the last 24 hours
          if (hoursSinceJoin <= 24) {
            console.log('📋 Showing baseline test popup for new user');
            setShowPopup(true);
          } else {
            console.log('⏰ User joined more than 24 hours ago, no popup');
          }
        } else {
          console.log('✅ User has taken baseline test or no join date');
        }
      } catch (error) {
        console.error('Failed to check baseline test status:', error);
      }
    }

    if (status === 'authenticated') {
      refreshFromBaseline().then(() => {
        checkBaselineTest();
        loadDashboard();
      });
    }

    //cleanup
    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [session?.user?.rank, session?.user?.baseLineTest, sortType]); // Added baseLineTest to dependencies

  // Auto-refresh leaderboard every 2 minutes to get fresh data
  useEffect(() => {
    const interval = setInterval(async () => {
      console.log('🔄 Auto-refreshing leaderboard data...');
      try {
        // Fixed: Use fetchUsersByRank instead of fetchAllUsers
        if (session?.user?.rank != null) {
          const data = await fetchUsersByRank(session.user.rank);
          const sortedData = sortUsers([...data], sortType);
          setUsers(sortedData);
          await updateSessionWithLeaderboardData(data);
        }
      } catch (error) {
        console.error('Auto-refresh failed:', error);
      }
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [session?.user?.rank, sortType]);

  const LoadingComponent = useMemo(
    () => (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="flex flex-row items-center justify-center gap-5">
          {[0, 150, 300].map((delay) => (
            <div
              key={delay}
              className="animate-bounce rounded-full h-5 w-5 bg-[#FF6E99] mb-4"
              style={{ animationDelay: `${delay}ms` }}
            ></div>
          ))}
        </div>
        <div className="text-lg font-bold text-center">
          Loading leaderboard...
        </div>
      </div>
    ),
    [],
  );

  if (loading) return LoadingComponent;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1>Leaderboard</h1>
        <div className="text-red-500 text-lg font-bold mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="main-button"
        >
          Retry
        </button>
      </div>
    );
  }

  // Handler for dropdown change
  const handleSortTypeChange = (type) => {
    setSortType(type);
  };

  return (
    <>
      {/* {showPopup && <BaselineTestPopup onClose={() => setShowPopup(false)} />} */}
      {showPopup && (
        <BaselineTestPopup
          user_id={session?.user?.id}
          onClose={() => setShowPopup(false)}
        />
      )}

      <div>
        <h1 className="text-3xl text-center py-10 md:py-5 mt-10 md:mt-0">
          Leaderboard
        </h1>
        {session?.user?.rank != null ? (
          <h2 className="text-center text-2xl font-bold pb-5">
            Rank: <span className="text-[#FF6E99]">{session.user.rank}</span>
          </h2>
        ) : (
          <p className="text-center text-md pb-5 text-[#FF6E99]">
            Answer some questions to get ranked!
          </p>
        )}
        {session?.user?.rank != null && (
          <LeaderboardTable
            users={users}
            sortType={sortType}
            onSortTypeChange={handleSortTypeChange}
          />
        )}
      </div>
    </>
  );
}
