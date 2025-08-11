'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import LeaderboardTable from '../ui/leaderboard-table';
import BaselineTestPopup from '../ui/pop-up/baseline-test';
import { fetchAllUsers, fetchBaselineTestValue } from '@/services/api';


export default function Page() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  // Memoized sorting function
  const sortUsers = useCallback((userData) => {
    return userData.sort((a, b) => {
      if (b.xp !== a.xp) return b.xp - a.xp;
      return a.username.localeCompare(b.username);
    });
  }, []);

  useEffect(() => {
    let mounted = true;
    let timeoutId;

async function loadDashboard() {
  try {
    setLoading(true);
    setError(null);

    //added
           const data = await fetchAllUsers();

        // Use setTimeout to defer sorting and avoid blocking the UI
        timeoutId = setTimeout(() => {
          if (mounted) {
            const sortedData = sortUsers([...data]); // Clone array before sorting
            setUsers(sortedData);
            setLoading(false);
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

    async function checkBaselineTest() {
      if (!session?.user?.id) return; // user not loaded yet

      try {
        // Option 2: fetch baseline test from backend
        const data = await fetchBaselineTestValue(session.user.id);
        if (data.baseLineTest === false) {
          setShowPopup(true);
        }
      } catch (error) {
        console.error('Failed to fetch baseline test:', error);
      }
    }

    if (status === 'authenticated') {
      checkBaselineTest();
      loadDashboard();
    }

//added


//     if (!mounted) return;

//     const currentUser = res.data.user;
//     setUser(currentUser);

//     if (currentUser.baseLineTest === false) {
//       setShowBaselinePopup(true);
//     }

//     console.log('Fetching /users/all...');
//     const usersRes = await axios.get('/users/all', { withCredentials: true });
//     console.log('/users/all response:', usersRes.data);

//     if (!mounted) return;

//     timeoutId = setTimeout(() => {
//       if (mounted) {
//         const sortedUsers = sortUsers([...usersRes.data]);
//         setUsers(sortedUsers);
//         setLoading(false);
//       }
//     }, 0);
//   } catch (err) {
//     console.error('Failed to load dashboard data:', err.response || err.message || err);
//     if (mounted) {
//       setError('Failed to load leaderboard. Please try again.');
//       setLoading(false);
//     }
//   }
// }


    //loadDashboard();
    //checkBaselineTest();

    //cleanup
    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [sortUsers, session?.user?.id, status]);

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
    []
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
    <>
      {showPopup && <BaselineTestPopup onClose={() => setShowPopup(false)} />}
      <div>
        <h1 className="text-3xl text-center py-10 md:py-5 mt-10 md:mt-0">
          Leaderboard
        </h1>
        <LeaderboardTable users={users} />
      </div>
    </>
  );
}