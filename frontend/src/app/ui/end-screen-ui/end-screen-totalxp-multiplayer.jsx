'use client';

import { submitMultiplayerResult } from '@/services/api';
import { handleGameplayAchievements } from '@/utils/gameplayAchievementHandler';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function TotalXPMP({ onLoadComplete, onResults }) {
  const [xpEarned, setXpEarned] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasProcessed, setHasProcessed] = useState(false);
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
        elo_rating: results.newElo, // Add both variants for compatibility
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

        // Give the session update time to propagate
        await new Promise((resolve) => setTimeout(resolve, 100));
        console.log('NextAuth session updated successfully');

        // Dispatch a custom event to notify other components
        window.dispatchEvent(
          new CustomEvent('eloUpdated', {
            detail: { newElo: results.newElo, userId: user_id },
          }),
        );
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
      // Prevent duplicate processing
      if (hasProcessed) {
        console.log(
          '🔄 FRONTEND DEDUP: Multiplayer results already processed, skipping...',
        );
        return;
      }

      try {
        setIsLoading(true);
        setHasProcessed(true);

        // Get match data from localStorage
        const matchDataRaw = localStorage.getItem('multiplayerGameData');
        if (!matchDataRaw) {
          console.error('No multiplayer game data found');
          if (onLoadComplete) onLoadComplete();
          setIsLoading(false);
          return;
        }

        const matchData = JSON.parse(matchDataRaw);
        if (!matchData) {
          console.error('No multiplayer game data found');
          if (onLoadComplete) onLoadComplete();
          setIsLoading(false);
          return;
        }

        // SIMPLIFIED: Use basic results key without complex fingerprinting
        const resultsKey = `mp_results_${matchData.players[0]}_${
          matchData.players[1]
        }_${matchData.score1}_${Date.now()}`;

        // Check if results have already been processed (basic session storage check)
        const existingResults = sessionStorage.getItem(resultsKey);
        if (existingResults) {
          console.log(
            '🔄 FRONTEND DEDUP: Results found in session storage, using cached data...',
          );
          const cachedData = JSON.parse(existingResults);
          setXpEarned(cachedData.xpEarned || 0);
          if (onResults) {
            onResults({
              newElo: cachedData.newElo || 0,
              eloChange: cachedData.eloChange || 0,
              currentRank: cachedData.currentRank || 'Bronze',
            });
          }
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
            try {
              const userData = JSON.parse(
                decodeURIComponent(userCookie.split('=')[1]),
              );
              userId = userData.id;
            } catch (cookieError) {
              console.error('Error parsing user cookie:', cookieError);
            }
          }
        }

        if (!userId) {
          console.error('User not authenticated');
          setXpEarned(50);
          setIsLoading(false);
          if (onResults) {
            onResults({
              newElo: 0,
              eloChange: 0,
              currentRank: 'Bronze',
            });
          }
          return;
        }

        // Calculate XP from correct answers (for display fallback)
        const isPlayer1 = matchData.players[0] === userId;
        const playerResults = isPlayer1
          ? matchData.player1Results
          : matchData.player2Results;

        let parsedResults = [];
        try {
          parsedResults =
            typeof playerResults === 'string'
              ? JSON.parse(playerResults)
              : playerResults;
        } catch (parseError) {
          console.error('Error parsing player results:', parseError);
          parsedResults = [];
        }

        const totalXPSum = Array.isArray(parsedResults)
          ? parsedResults.reduce(
              (sum, q) =>
                q?.isCorrect ? sum + (q.question?.xpGain || 0) : sum,
              0,
            )
          : 0;

        console.log(
          `🎯 FRONTEND: Submitting multiplayer results - ${matchData.players[0]} vs ${matchData.players[1]}, score: ${matchData.score1}, totalXP: ${matchData.totalXP}`,
        );

        // Submit results (no fingerprint complexity)
        let response;
        try {
          response = await submitMultiplayerResult({
            player1_id: matchData.players[0],
            player2_id: matchData.players[1],
            score1: matchData.score1,
            xpTotal: matchData.totalXP,
          });

          console.log('✅ Multiplayer API response:', response);
        } catch (submitError) {
          console.error('Error submitting multiplayer result:', submitError);
          setXpEarned(totalXPSum || 50);
          if (onResults) {
            onResults({
              newElo: 0,
              eloChange: 0,
              currentRank: 'Bronze',
            });
          }
          if (onLoadComplete) onLoadComplete();
          setIsLoading(false);
          return;
        }

        // Process response
        if (
          response?.error ||
          !response?.players ||
          !Array.isArray(response.players)
        ) {
          console.error('Invalid response format:', response);
          setXpEarned(totalXPSum || 50);
          if (onResults) {
            onResults({
              newElo: 0,
              eloChange: 0,
              currentRank: 'Bronze',
            });
          }
        } else {
          const userResults = response.players?.find((p) => p.id === userId);
          if (userResults) {
            console.log('✅ Found user results:', userResults);

            const validatedXP = isNaN(userResults.xpEarned)
              ? totalXPSum || 50
              : userResults.xpEarned;
            const validatedEloChange = isNaN(userResults.eloChange)
              ? 0
              : userResults.eloChange;
            const validatedNewElo = isNaN(userResults.newElo)
              ? 0
              : userResults.newElo;

            setXpEarned(validatedXP);

            if (onResults) {
              onResults({
                newElo: validatedNewElo,
                eloChange: validatedEloChange,
                currentRank: userResults.currentRank || 'Bronze',
              });
            }

            await updateUserDataAfterMultiplayer(userId, {
              ...userResults,
              xpEarned: validatedXP,
              eloChange: validatedEloChange,
              newElo: validatedNewElo,
            });

            // Simple cache without complex fingerprinting
            sessionStorage.setItem(
              resultsKey,
              JSON.stringify({
                xpEarned: validatedXP,
                newElo: validatedNewElo,
                eloChange: validatedEloChange,
                currentRank: userResults.currentRank || 'Bronze',
                timestamp: Date.now(),
              }),
            );

            // Handle achievements
            if (
              userResults.achievements &&
              userResults.achievements.length > 0
            ) {
              try {
                await handleGameplayAchievements(
                  {
                    achievements: userResults.achievements,
                    achievementSummary: userResults.achievementSummary,
                  },
                  userId,
                  true,
                );
                console.log(
                  `🏆 Handled ${userResults.achievements.length} achievements for multiplayer match`,
                );
              } catch (achievementError) {
                console.error(
                  '🏆 Error handling multiplayer achievements:',
                  achievementError,
                );
              }
            }
          } else {
            console.warn('User results not found in API response');
            setXpEarned(totalXPSum || 50);
            if (onResults) {
              onResults({
                newElo: 0,
                eloChange: 0,
                currentRank: 'Bronze',
              });
            }
          }
        }

        // Clean up
        localStorage.removeItem('multiplayerGameData');
        console.log('🧹 Cleaned up localStorage multiplayerGameData');

        if (onLoadComplete) onLoadComplete();
      } catch (error) {
        console.error('Error processing multiplayer results:', error);
        setHasProcessed(false); // Reset on error to allow retry
        setXpEarned(50);
        if (onResults) {
          onResults({
            newElo: 0,
            eloChange: 0,
            currentRank: 'Bronze',
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Process results with a short delay
    const timer = setTimeout(processMultiplayerResults, 300);
    return () => clearTimeout(timer);
  }, [session?.user?.id, onLoadComplete, hasProcessed]);

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
