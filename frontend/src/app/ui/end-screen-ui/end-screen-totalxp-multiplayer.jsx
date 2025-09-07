'use client';

import { submitMultiplayerResult, fetchUserById } from '@/services/api';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
//import { cache, CACHE_KEYS } from '@/utils/cache';

export default function TotalXPMP({ onLoadComplete, onResults }) {
  const [xpEarned, setXPEarned] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, update: updateSession } = useSession();

  // Function to update user data after multiplayer results
  async function updateUserDataAfterMultiplayer(user_id, results) {
    try {
      console.log('Updating user data after multiplayer results...');

      const latestUserData = {
        xp: results.newXP,
        currentLevel: results.currentLevel,
        rank: results.currentRank,
        eloRating: results.newElo,
      };

      // Update NextAuth session
      if (session?.user?.id) {
        console.log('Updating NextAuth session...');
        await updateSession({
          ...session,
          user: {
            ...session.user,
            ...latestUserData,
          },
        });
      }

      // Update cache
      // cache.set(CACHE_KEYS.USER(user_id), {
      //   ...(cache.get(CACHE_KEYS.USER(user_id)) || {}),
      //   ...latestUserData
      // });

      // Update cookie if exists
      const userCookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith('user='));

      if (userCookie) {
        console.log('Updating user cookie...');
        try {
          const userData = JSON.parse(
            decodeURIComponent(userCookie.split('=')[1]),
          );
          document.cookie = `user=${encodeURIComponent(
            JSON.stringify({
              ...userData,
              ...latestUserData,
            }),
          )}; path=/`;
        } catch (cookieError) {
          console.error('Error updating cookie:', cookieError);
        }
      }

      // Invalidate related caches
      // cache.remove(CACHE_KEYS.USER_ACHIEVEMENTS(user_id));
      // cache.remove(CACHE_KEYS.USER_PROGRESS(user_id));
      // cache.remove(CACHE_KEYS.LEADERBOARD);
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  }

  useEffect(() => {
    const processMultiplayerResults = async () => {
      try {
        setIsLoading(true);

        // Get match data from localStorage
        const matchData = JSON.parse(
          localStorage.getItem('multiplayerGameData'),
        );
        if (!matchData) {
          console.error('No multiplayer game data found');
          if (onLoadComplete) onLoadComplete();
          setIsLoading(false);
          return;
        }

        // Get current user ID
        let userId = session?.user?.id;
        if (!userId) {
          const userCookie = document.cookie
            .split('; ')
            .find((row) => row.startsWith('user='));
          if (userCookie) {
            const userData = JSON.parse(
              decodeURIComponent(userCookie.split('=')[1]),
            );
            userId = userData.id;
          }
        }

        if (!userId) {
          console.error('User not authenticated');
          setIsLoading(false);
          return;
        }

        // Calculate XP from correct answers (for display)
        const isPlayer1 = matchData.players[0] === userId;
        const playerResults = isPlayer1
          ? matchData.player1Results
          : matchData.player2Results;
        const parsedResults =
          typeof playerResults === 'string'
            ? JSON.parse(playerResults)
            : playerResults;

        // Calculate total XP from correct answers only
        const totalXPSum = Array.isArray(parsedResults)
          ? parsedResults.reduce(
              (sum, q) =>
                q?.isCorrect ? sum + (q.question?.xpGain || 0) : sum,
              0,
            )
          : 0;

        // Submit results for both players (but only process once per match)
        const response = await submitMultiplayerResult({
          player1_id: matchData.players[0],
          player2_id: matchData.players[1],
          score1: matchData.score1,
          xpTotal: matchData.totalXP,
        });

        // Check if we got an error response
        if (response.error) {
          console.error(
            'Error in multiplayer result submission:',
            response.message,
          );
          // Show fallback XP value
          setXPEarned(totalXPSum || 50);
        } else {
          // Find current user's results from the response
          const userResults = response.players?.find((p) => p.id === userId);
          if (userResults) {
            setXPEarned(userResults.xpEarned);

            if (onResults) {
              onResults({
                newElo: userResults.newElo,
                eloChange: userResults.eloChange,
                currentRank: userResults.currentRank,
              });
            }

            await updateUserDataAfterMultiplayer(userId, userResults);
          } else {
            // Fallback if user results not found
            console.warn('User results not found in API response');
            setXPEarned(totalXPSum || 50);
          }
        }

        // Clean up
        localStorage.removeItem('multiplayerGameData');

        if (onLoadComplete) onLoadComplete();
      } catch (error) {
        console.error('Error processing multiplayer results:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Add delay to ensure all data is ready
    const timer = setTimeout(processMultiplayerResults, 300);
    return () => clearTimeout(timer);
  }, [session?.user?.id, onLoadComplete]);

  // Loading state
  if (isLoading || xpEarned === null) {
    return (
      <div className="flex flex-col items-center justify-center">
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
      </div>
    );
  }

  return (
    <div className="border-1 border-[#4D5DED] rounded-[10px] w-[90px]">
      <div className="uppercase bg-[#4D5DED] p-2 rounded-t-[9px] text-[14px] font-bold text-center tracking-wide">
        XP
      </div>
      <div className="text-center text-[18px] font-bold py-3 px-5">
        {(xpEarned || 0).toFixed(0)}xp
      </div>
    </div>
  );
}
