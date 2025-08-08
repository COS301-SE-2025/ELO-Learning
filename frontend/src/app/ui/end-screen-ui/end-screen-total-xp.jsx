'use client';

import { submitSinglePlayerAttempt, fetchUserById } from '@/services/api';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { cache, CACHE_KEYS } from '@/utils/cache';

export default function TotalXP({ onLoadComplete }) {
  const [totalXP, setTotalXP] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, update: updateSession } = useSession();

  // Function to update user data in session/cookies after XP calculation
  async function updateUserDataAfterXP(user_id, xpEarned, questions) {
    try {
      console.log('🔄 Updating user session data with new XP values...');

      // Get the latest values from the backend response
      // The last successful question submission should have the most up-to-date user data
      let latestUserData = null;

      // Find the most recent successful submission response
      for (let i = questions.length - 1; i >= 0; i--) {
        const q = questions[i];
        if (q.totalXP && q.leveledUp !== undefined) {
          latestUserData = {
            totalXP: q.totalXP,
            leveledUp: q.leveledUp,
            currentLevel: q.leveledUp
              ? (session?.user?.currentLevel || 1) + 1
              : session?.user?.currentLevel || 1,
          };
          break;
        }
      }

      // Fallback: fetch latest user data from database if not found in responses
      if (!latestUserData) {
        console.log('🔄 Fetching latest user data from database...');
        try {
          const freshUserData = await fetchUserById(user_id);
          latestUserData = {
            totalXP: freshUserData.xp,
            currentLevel: freshUserData.currentLevel,
            leveledUp: false, // We don't know if they leveled up, so assume false
          };
          console.log('✅ Retrieved fresh user data from database');
        } catch (fetchError) {
          console.error('❌ Error fetching fresh user data:', fetchError);
          return; // Exit if we can't get updated data
        }
      }

      if (latestUserData) {
        // Update NextAuth session if user is authenticated via NextAuth
        if (session?.user?.id) {
          console.log('🔄 Updating NextAuth session...');
          await updateSession({
            ...session,
            user: {
              ...session.user,
              xp: latestUserData.totalXP,
              currentLevel: latestUserData.currentLevel,
            },
          });

          // Update cache as well
          cache.set(CACHE_KEYS.USER, {
            ...session.user,
            xp: latestUserData.totalXP,
            currentLevel: latestUserData.currentLevel,
          });

          console.log(
            '✅ NextAuth session updated - XP:',
            latestUserData.totalXP,
            'Level:',
            latestUserData.currentLevel,
          );
        }

        // Update cookie-based user data if it exists
        const userCookie = document.cookie
          .split('; ')
          .find((row) => row.startsWith('user='));

        if (userCookie) {
          console.log('🔄 Updating user cookie...');
          try {
            const encodedUserData = userCookie.split('=')[1];
            const decodedUserData = decodeURIComponent(encodedUserData);
            const userData = JSON.parse(decodedUserData);

            // Update the cookie with new values
            const updatedUserData = {
              ...userData,
              xp: latestUserData.totalXP,
              currentLevel: latestUserData.currentLevel,
            };

            document.cookie = `user=${encodeURIComponent(
              JSON.stringify(updatedUserData),
            )}; path=/`;
            console.log(
              '✅ User cookie updated - XP:',
              latestUserData.totalXP,
              'Level:',
              latestUserData.currentLevel,
            );
          } catch (cookieError) {
            console.error('❌ Error updating user cookie:', cookieError);
          }
        }

        console.log(
          '🎉 User data successfully updated! XP earned this session:',
          xpEarned,
        );
        console.log(
          '📊 New totals - XP:',
          latestUserData.totalXP,
          'Level:',
          latestUserData.currentLevel,
        );

        // Clear user-related caches to force fresh data fetch in other components
        cache.remove(CACHE_KEYS.USER);
        cache.remove(CACHE_KEYS.USER_ACHIEVEMENTS);
        cache.remove(CACHE_KEYS.USER_PROGRESS);
        cache.remove(CACHE_KEYS.LEADERBOARD); // This might have changed if user leveled up
        console.log('🗑️ Cleared user-related caches to ensure fresh data');
      } else {
        console.warn('⚠️ No updated user data found, session data not updated');
      }
    } catch (error) {
      console.error('❌ Error updating user data after XP calculation:', error);
    }
  }

  /*   useEffect(() => {
    const questions = JSON.parse(localStorage.getItem('questionsObj'));
    const correctAnswers = questions.filter(
      (question) => question.isCorrect == true,
    );
    const totalXPSum = correctAnswers.reduce(
      (accumulator, question) => accumulator + question.question.xpGain,
      0,
    );

    setTotalXP(totalXPSum);
  }, []);
  */

  useEffect(() => {
    async function calculateTotalXP() {
      try {
        // FIRST: Create a unique session identifier
        const sessionId =
          Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        const submissionKey = 'xp-calculation-' + sessionId;

        // SECOND: Check if any XP calculation is already in progress or completed
        const existingSubmission = sessionStorage.getItem('submittedOnce');
        const inProgressSubmission = sessionStorage.getItem('calculatingXP');

        if (existingSubmission === 'true') {
          console.log('❌ XP already calculated, loading cached results...');
          // Load previously calculated XP from localStorage if available
          const questions =
            JSON.parse(localStorage.getItem('questionsObj')) || [];
          const totalXPSum = questions.reduce(
            (acc, q) => acc + (q.xpEarned ?? 0),
            0,
          );
          if (totalXPSum > 0) {
            setTotalXP(Math.round(totalXPSum));
            setIsLoading(false);
            if (onLoadComplete) {
              onLoadComplete();
            }
            return;
          }
        }

        if (inProgressSubmission) {
          console.log('❌ XP calculation already in progress, aborting...');
          setIsLoading(false);
          return;
        }

        // THIRD: Mark calculation as in progress IMMEDIATELY
        sessionStorage.setItem('calculatingXP', sessionId);
        sessionStorage.setItem('submittedOnce', 'true');

        console.log('✅ Starting XP calculation with session:', sessionId);

        let user_id = null;

        // Try NextAuth session first
        if (session?.user?.id) {
          user_id = session.user.id;
          console.log('Using NextAuth session for user ID:', user_id);
        } else {
          // Fallback to cookie-based authentication
          const userCookie = document.cookie
            .split('; ')
            .find((row) => row.startsWith('user='));

          if (!userCookie) {
            console.error(
              'User not authenticated - no session or user cookie found',
            );
            setIsLoading(false);
            return;
          }

          try {
            // Decode the URL-encoded cookie value
            const encodedUserData = userCookie.split('=')[1];
            const decodedUserData = decodeURIComponent(encodedUserData);
            const userData = JSON.parse(decodedUserData);

            if (!userData || !userData.id) {
              console.error('Invalid user data in cookie');
              setIsLoading(false);
              return;
            }

            user_id = userData.id;
            console.log(
              'Using cookie-based authentication for user ID:',
              user_id,
            );
          } catch (cookieError) {
            console.error('Error parsing user cookie:', cookieError);
            setIsLoading(false);
            return;
          }
        }

        const questions =
          JSON.parse(localStorage.getItem('questionsObj')) || [];
        console.log(
          `📊 Processing ${questions.length} questions for XP calculation`,
        );

        // Process each question
        for (const q of questions) {
          // Sanity checks
          if (!q.question || (!q.question.id && !q.question.Q_id)) {
            console.log(
              `⚠️ Skipping question with missing ID: ${
                q.question?.id || q.question?.Q_id
              }`,
            );
            continue; // skip this one
          }

          try {
            const response = await submitSinglePlayerAttempt({
              user_id,
              question_id: q.question.id || q.question.Q_id,
              isCorrect: q.isCorrect,
              timeSpent: q.timeTaken || 30,
            });
            const { xpEarned, totalXP, leveledUp } = response;
            q.xpEarned = Math.round(xpEarned) || 0;

            // Store the latest user data from backend response
            q.totalXP = totalXP;
            q.leveledUp = leveledUp;

            console.log(
              `✅ Submitted question ${
                q.question.id || q.question.Q_id
              }: earned ${q.xpEarned} XP (Total: ${totalXP})`,
            );
          } catch (err) {
            console.error(
              `❌ Failed to submit question ${
                q.question.id || q.question.Q_id
              }:`,
              err.response?.data || err.message,
            );
          }
        }

        console.log('💾 Storing XP results in localStorage...');
        localStorage.setItem('questionsObj', JSON.stringify(questions));

        const totalXPSum = questions.reduce(
          (acc, q) => acc + (q.xpEarned ?? 0),
          0,
        );

        console.log(
          '✅ XP calculation completed! Total XP earned:',
          totalXPSum,
        );

        // Update user session/cookie data with new values
        await updateUserDataAfterXP(user_id, totalXPSum, questions);

        setTotalXP(Math.round(totalXPSum));
        setIsLoading(false);
        if (onLoadComplete) {
          onLoadComplete();
        }
      } catch (error) {
        console.error('❌ Error in calculateTotalXP:', error);
        setIsLoading(false);
      } finally {
        // Clean up the in-progress flag but keep the completed flag
        sessionStorage.removeItem('calculatingXP');
        console.log('🧹 Cleaned up calculation session');
      }
    }
    calculateTotalXP();
  }, [session]);

  // Cleanup effect to prevent memory leaks and stuck states
  useEffect(() => {
    return () => {
      // Clear any in-progress calculation markers when component unmounts
      sessionStorage.removeItem('calculatingXP');
      console.log('🔄 Component unmounted - cleaned up calculation session');
    };
  }, []);

  if (isLoading) {
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
    <div className="border-1 border-[#FF6E99] rounded-[10px] w-[90px]">
      <div className="uppercase bg-[#FF6E99] p-2 rounded-t-[9px] text-[14px] font-bold text-center tracking-wide">
        XP
      </div>
      <div className="text-center text-[18px] font-bold py-3 px-5">
        {totalXP.toFixed(0)}xp
      </div>
    </div>
  );
}
