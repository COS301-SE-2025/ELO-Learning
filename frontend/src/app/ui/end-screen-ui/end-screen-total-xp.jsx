'use client';

import { submitSinglePlayerAttempt } from '@/services/api';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function TotalXP({ onLoadComplete }) {
  const [totalXP, setTotalXP] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session, status } = useSession();

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
    console.log('TotalXP useEffect triggered');
    console.log('Session status:', status);
    console.log('Session data:', session);
    
    async function calculateTotalXP() {
      // Wait for session to load
      if (status === 'loading') {
        return;
      }
      
      let userFromStorage = null;
      
      // Try to get user data from NextAuth session first
      if (status === 'authenticated' && session?.user) {
        // Use NextAuth session data
        console.log('Using NextAuth session data');
      } else {
        // Try to get user data from localStorage or cookie as fallback
        console.log('NextAuth session not available, trying fallback methods');
        try {
          const userCookie = document.cookie
            .split('; ')
            .find(row => row.startsWith('user='));
          
          if (userCookie) {
            const encodedUserData = userCookie.split('=')[1];
            const decodedUserData = decodeURIComponent(encodedUserData);
            userFromStorage = JSON.parse(decodedUserData);
            console.log('Using user data from cookie:', userFromStorage);
          } else {
            // Fallback to localStorage
            const userData = localStorage.getItem('user');
            if (userData) {
              userFromStorage = JSON.parse(userData);
              console.log('Using user data from localStorage:', userFromStorage);
            }
          }
        } catch (error) {
          console.error('Error getting user from storage:', error);
          setError('Unable to retrieve user data');
        }
      }

      //Prevent duplicate submissions
      if (sessionStorage.getItem('submittedOnce') === 'true') {
        console.log('Already submitted, loading cached results...');
        const questions = JSON.parse(localStorage.getItem('questionsObj')) || [];
        // Calculate XP from stored results if already submitted
        const totalXPSum = questions.reduce(
          (acc, q) => acc + (q.xpEarned ?? 0),
          0,
        );
        setTotalXP(Math.round(totalXPSum));
        setIsLoading(false);
        if (onLoadComplete) {
          onLoadComplete();
        }
        return;
      }
      sessionStorage.setItem('submittedOnce', 'true');

      const questions = JSON.parse(localStorage.getItem('questionsObj')) || [];
      const user = session?.user || userFromStorage;
      const user_id = user?.id;

      if (!user_id) {
        console.error('User ID not found');
        console.log('Available user data:', user);
        setError('User authentication required');
        // Calculate XP without submitting to backend
        const totalXPSum = questions.reduce(
          (acc, q) => {
            if (q.isCorrect && q.question?.xpGain) {
              return acc + q.question.xpGain;
            }
            return acc;
          },
          0,
        );
        setTotalXP(Math.round(totalXPSum));
        setIsLoading(false);
        if (onLoadComplete) {
          onLoadComplete();
        }
        return;
      }

      //  console.log('Sending questions to backend:', questions);
      for (const q of questions) {
        // Sanity checks
        if (!q.question || (!q.question.id && !q.question.Q_id)) {
          console.log(
            `Skipping question ${q.question?.id || q.question?.Q_id}: missing ID`,
          );
          continue; // skip this one
        }
        /*
        if (q.isCorrect) {
          try {
            const response = await submitSinglePlayerAttempt({
              user_id,
              question_id: q.question.id || q.question.Q_id,
              isCorrect: true,
              timeSpent: q.timeTaken || 30,
            });
            // q.xpEarned = response?.xpEarned || 0;
            // const { xpEarned } = response;
            // q.xpEarned = xpEarned;

            const { xpEarned, totalXP, leveledUp } = response;
            q.xpEarned = Math.round(xpEarned) || 0;

            // Note: Session data will be updated on next page load
            // You might want to trigger a session refresh here if needed
            console.log('XP updated successfully', {
              user: user.username,
              newXP: totalXP,
              leveledUp: leveledUp ? user.currentLevel + 1 : user.currentLevel,
            });
          } catch (err) {
            console.error(
              `Failed to submit question ${q.question.id || q.question.Q_id}:`,
              err.response?.data || err.message
            );
          }
        } else {
          q.xpEarned = 0;
        }
    */

        try {
          const response = await submitSinglePlayerAttempt({
            user_id,
            question_id: q.question.id || q.question.Q_id,
            isCorrect: q.isCorrect,
            timeSpent: q.timeTaken || 30,
          });
          const { xpEarned, totalXP, leveledUp } = response;
          q.xpEarned = Math.round(xpEarned) || 0;

          const updatedUser = {
            ...user,
            xp: totalXP,
            currentLevel: leveledUp ? user.currentLevel + 1 : user.currentLevel,
          };
          document.cookie = `user=${encodeURIComponent(
            JSON.stringify(updatedUser),
          )}; path=/`;
        } catch (err) {
          console.error(
            `Failed to submit question ${q.question.id || q.question.Q_id}:`,
            err.response?.data || err.message,
          );
          // Set XP to 0 for failed submissions
          q.xpEarned = 0;
        }
      }
      const totalXPSum = questions.reduce(
        (acc, q) => acc + (q.xpEarned ?? 0),
        0,
      );

      console.log('Total XPSum calculated:', totalXPSum);
      setTotalXP(Math.round(totalXPSum));
      // console.log('TotalXP:', totalXP);
      setIsLoading(false);
      if (onLoadComplete) {
        onLoadComplete();
      }
    }
    calculateTotalXP();
  }, [session, status]);

  if (isLoading || status === 'loading') {
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
  
  // Show error state if authentication failed but still show calculated XP
  if (error) {
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
