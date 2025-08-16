'use client';
import { fetchAllUsers } from '@/services/api';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import LeaderboardTable from '../ui/leaderboard-table';
import useAchievementChecker from '@/hooks/useAchievementChecker';
export default function Page() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session, status, update: updateSession } = useSession();

  // ACHIEVEMENT CHECKING
  useAchievementChecker({
    checkOnMount: true,
    debug: false // Set to true if you want to see achievement logs
  });

  // Memoize the sorting function to avoid recreating it on every render
  const sortUsers = useCallback((userData) => {
    return userData.sort((a, b) => {
      if (b.xp !== a.xp) return b.xp - a.xp;
      return a.username.localeCompare(b.username);
    });
  }, []);

  // Function to update session with fresh leaderboard data
  const updateSessionWithLeaderboardData = useCallback(async (leaderboardUsers) => {
    if (!session?.user?.id || !leaderboardUsers.length) return;

    // Find current user in leaderboard data
    const currentUserInLeaderboard = leaderboardUsers.find(
      user => user.id === session.user.id
    );

    if (currentUserInLeaderboard && currentUserInLeaderboard.xp !== session.user.xp) {
      console.log('🔄 Updating session with fresh leaderboard data...');
      console.log('Session XP:', session.user.xp, '→ Leaderboard XP:', currentUserInLeaderboard.xp);
      
      try {
        await updateSession({
          ...session,
          user: {
            ...session.user,
            xp: currentUserInLeaderboard.xp,
            currentLevel: currentUserInLeaderboard.currentLevel || session.user.currentLevel,
            username: currentUserInLeaderboard.username || session.user.username,
          },
        });
        console.log('✅ Session updated with fresh XP:', currentUserInLeaderboard.xp);
      } catch (error) {
        console.error('❌ Failed to update session:', error);
      }
    }
  }, [session, updateSession]);

  useEffect(() => {
    let mounted = true;
    let timeoutId;

    async function loadUsers() {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchAllUsers();

        // Use setTimeout to defer sorting and avoid blocking the UI
        timeoutId = setTimeout(async () => {
          if (mounted) {
            const sortedData = sortUsers([...data]); // Clone array before sorting
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

    loadUsers();

    // Cleanup function
    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [sortUsers, updateSessionWithLeaderboardData]);

  // Auto-refresh leaderboard every 2 minutes to get fresh data
  useEffect(() => {
    const interval = setInterval(async () => {
      console.log('🔄 Auto-refreshing leaderboard data...');
      try {
        const data = await fetchAllUsers(true); // Force refresh
        const sortedData = sortUsers([...data]);
        setUsers(sortedData);
        await updateSessionWithLeaderboardData(data);
      } catch (error) {
        console.error('Auto-refresh failed:', error);
      }
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [sortUsers, updateSessionWithLeaderboardData]);

  // Memoize the loading component to prevent unnecessary re-renders
  const LoadingComponent = useMemo(
    () => (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="flex flex-row items-center justify-center gap-5">
          <div
            className="animate-bounce rounded-full h-5 w-5 bg-[#FF6E99] mb-4"
            style={{ animationDelay: '0ms' }}
          ></div>
          <div
            className="animate-bounce rounded-full h-5 w-5 bg-[#FF6E99] mb-4"
            style={{ animationDelay: '150ms' }}
          ></div>
          <div
            className="animate-bounce rounded-full h-5 w-5 bg-[#FF6E99] mb-4"
            style={{ animationDelay: '300ms' }}
          ></div>
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

  return (
    <div>
      <h1 className="text-3xl text-center py-10 md:py-5 mt-10 md:mt-0">
        Leaderboard
      </h1>
      <LeaderboardTable users={users} />
    </div>
  );
}