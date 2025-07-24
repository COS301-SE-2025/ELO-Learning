'use client';

import { useEffect, useState } from 'react';
import { submitSinglePlayerAttempt } from '@/services/api';

export default function TotalXP() {
  const [totalXP, setTotalXP] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

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
      const questions = JSON.parse(localStorage.getItem('questionsObj')) || [];

      const userCookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith('user='));

      if (!userCookie) {
        console.error('User cookie not found');
        return;
      }

      const user = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
      const user_id = user.id;

      if (!user_id) {
        console.error('User ID not found');
        return;
      }

      for (const q of questions) {
        // Sanity checks
        if (!q.question || (!q.question.id && !q.question.Q_id)) {
          console.log(
            `Submitted question ${q.question.id || q.question.Q_id}: earned ${
              q.xpEarned
            }`,
          );
          continue; // skip this one
        }

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
            q.xpEarned = xpEarned || 0;

            const updatedUser = {
              ...user,
              xp: totalXP,
              currentLevel: leveledUp
                ? user.currentLevel + 1
                : user.currentLevel,
            };
            document.cookie = `user=${encodeURIComponent(
              JSON.stringify(updatedUser),
            )}; path=/`;
          } catch (err) {
            console.error(
              `Failed to submit question ${q.question.id || q.question.Q_id}:`,
              err.response?.data || err.message,
            );
          }
        } else {
          q.xpEarned = 0;
        }
      }
      const totalXPSum = questions.reduce(
        (acc, q) => acc + (q.xpEarned ?? 0),
        0,
      );

      console.log('Total XPSum calculated:', totalXPSum);
      setTotalXP(totalXPSum);
      // console.log('TotalXP:', totalXP);
      setIsLoading(false);
    }
    calculateTotalXP();
  }, []);

  if (isLoading) {
    return <div>Calculating XP...</div>;
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
