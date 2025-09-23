'use client';
import { updateUserXP } from '@/services/api';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function PracticeXP({ onLoadComplete }) {
  const [totalXP, setTotalXP] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasCalculated, setHasCalculated] = useState(false); // Prevent multiple calculations
  const { data: session, update: updateSession } = useSession();

  // Calculate XP from practice session
  const calculatePracticeXP = (questionsObj) => {
    if (!Array.isArray(questionsObj) || questionsObj.length === 0) {
      return 0;
    }

    let totalXP = 0;

    // Process each question
    for (const questionData of questionsObj) {
      const { question, isCorrect, timeElapsed } = questionData;

      if (!question || !isCorrect) continue;

      const questionXP = question.xpGain || 0;
      let earnedXP = questionXP;

      // Time bonus (quick answers get bonus)
      if (timeElapsed <= 10) {
        earnedXP += questionXP * 0.2; // 20% bonus for fast answers
      }

      // Difficulty bonus
      const difficulty = question.difficulty?.toLowerCase();
      if (difficulty === 'hard') {
        earnedXP += questionXP * 0.3; // 30% bonus for hard questions
      } else if (difficulty === 'medium') {
        earnedXP += questionXP * 0.2; // 20% bonus for medium questions
      } else if (difficulty === 'easy') {
        earnedXP += questionXP * 0.1; // 10% bonus for easy questions
      }

      // Level bonus (higher level questions give more XP)
      const levelBonus = (question.level || 1) * 2;
      earnedXP += levelBonus;

      totalXP += Math.round(earnedXP);
    }

    // Apply practice session scaling (60% of calculated XP)
    return Math.round(totalXP * 0.6);
  };

  // Update user's XP in the database
  const updateDatabaseXP = async (userId, newTotalXP) => {
    try {
      const result = await updateUserXP(userId, newTotalXP);
      console.log('✅ XP updated successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Error updating XP:', error);
      throw error;
    }
  };

  // Update session data after XP update
  const updateSessionData = async (newTotalXP) => {
    if (session?.user) {
      await updateSession({
        ...session,
        user: {
          ...session.user,
          xp: newTotalXP,
        },
      });

      // Update cookie if it exists
      const userCookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith('user='));

      if (userCookie) {
        try {
          const encodedUserData = userCookie.split('=')[1];
          const decodedUserData = decodeURIComponent(encodedUserData);
          const userData = JSON.parse(decodedUserData);

          const updatedUserData = { ...userData, xp: newTotalXP };
          const updatedCookie = encodeURIComponent(
            JSON.stringify(updatedUserData),
          );
          document.cookie = `user=${updatedCookie}; path=/`;

          console.log('✅ User cookie updated with new XP:', newTotalXP);
        } catch (cookieError) {
          console.error('❌ Error updating user cookie:', cookieError);
        }
      }
    }
  };

  useEffect(() => {
    const calculateAndAwardXP = async () => {
      // Prevent multiple executions
      if (hasCalculated) {
        console.log('XP already calculated, skipping...');
        return;
      }

      // Check for duplicate calculation prevention
      const practiceSessionId = localStorage.getItem('practiceSessionId');
      const lastCalculatedSession = sessionStorage.getItem(
        'lastCalculatedPracticeSession',
      );

      if (practiceSessionId && practiceSessionId === lastCalculatedSession) {
        console.log(
          'Practice XP already calculated for this session, skipping...',
        );
        setTotalXP(0);
        setIsLoading(false);
        if (onLoadComplete) onLoadComplete();
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Check if we have a session and user ID
        if (!session?.user?.id) {
          console.log('No user session, waiting...');
          return;
        }

        console.log('🔄 Starting practice XP calculation...');
        setHasCalculated(true); // Mark as calculated to prevent re-runs

        // Get questions from localStorage
        const questionsData = localStorage.getItem('questionsObj');
        if (!questionsData) {
          console.log('No questions data found in localStorage');
          setTotalXP(0);
          setIsLoading(false);
          if (onLoadComplete) onLoadComplete();
          return;
        }

        const questions = JSON.parse(questionsData);
        if (!Array.isArray(questions) || questions.length === 0) {
          console.log('No valid questions found');
          setTotalXP(0);
          setIsLoading(false);
          if (onLoadComplete) onLoadComplete();
          return;
        }

        console.log(
          `Processing ${questions.length} questions for XP calculation`,
        );

        // Calculate XP earned from practice session
        const earnedXP = calculatePracticeXP(questions);
        setTotalXP(earnedXP);

        console.log(`Calculated XP: +${earnedXP}`);

        // If no XP earned, no need to update database
        if (earnedXP <= 0) {
          setIsLoading(false);
          if (onLoadComplete) onLoadComplete();
          return;
        }

        // Get current user XP and calculate new total
        const currentUserXP = session.user.xp || 0;
        const newTotalXP = currentUserXP + earnedXP;

        console.log(
          `Updating XP: ${currentUserXP} + ${earnedXP} = ${newTotalXP}`,
        );

        // Update XP in database
        await updateDatabaseXP(session.user.id, newTotalXP);

        // Update session data
        await updateSessionData(newTotalXP);

        // Mark this session as calculated
        if (practiceSessionId) {
          sessionStorage.setItem(
            'lastCalculatedPracticeSession',
            practiceSessionId,
          );
        }

        console.log(
          `🎉 Practice XP awarded successfully: +${earnedXP} XP (Total: ${newTotalXP})`,
        );
      } catch (error) {
        console.error('❌ Error calculating/awarding practice XP:', error);
        setError(error.message);
        setHasCalculated(false); // Reset flag on error so user can retry
      } finally {
        setIsLoading(false);
        if (onLoadComplete) onLoadComplete();
      }
    };

    // Only run calculation when we have a session and haven't calculated yet
    if (session?.user?.id && !hasCalculated) {
      calculateAndAwardXP();
    } else if (session === null) {
      // Session is explicitly null (not loading, user not authenticated)
      console.warn('No authenticated session');
      setIsLoading(false);
      if (onLoadComplete) onLoadComplete();
    }
  }, [session?.user?.id, hasCalculated]); // Only depend on user ID and calculation flag

  //   if (isLoading) {
  //     return (
  //       <div className="border-1 border-[var(--radical-rose)] rounded-[10px] w-[90px]">
  //         <div className="uppercase bg-[var(--radical-rose)] p-2 rounded-t-[9px] text-[14px] font-bold text-center tracking-wide">
  //           XP
  //         </div>
  //         <div className="text-center text-[12px] font-bold py-3 px-2">
  //           Calculating...
  //         </div>
  //       </div>
  //     );
  //   }

  if (error) {
    return (
      <div className="border-1 border-red-500 rounded-[10px] w-[90px]">
        <div className="uppercase bg-red-500 p-2 rounded-t-[9px] text-[14px] font-bold text-center tracking-wide text-white">
          XP
        </div>
        <div className="text-center text-[12px] font-bold py-3 px-2 text-red-500">
          Error
        </div>
      </div>
    );
  }

  return (
    <div className="border-1 border-[var(--radical-rose)] rounded-[10px] w-[90px]">
      <div className="uppercase bg-[var(--radical-rose)] p-2 rounded-t-[9px] text-[14px] font-bold text-center tracking-wide">
        XP
      </div>
      <div className="text-center text-[18px] font-bold py-3 px-5">
        +{totalXP}
      </div>
    </div>
  );
}
