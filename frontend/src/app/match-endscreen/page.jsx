'use client';
import Score from '@/app/ui/end-screen-ui/end-screen-score';
import Time from '@/app/ui/end-screen-ui/end-screen-total-time';
import TotalXP from '@/app/ui/end-screen-ui/end-screen-total-xp';
import { updateUserXP } from '@/services/api';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

function MatchEndScreenContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const result = searchParams.get('result');
  const [isWinner, setIsWinner] = useState(result === 'winner');
  const [isLoading, setIsLoading] = useState(false);

  const clearStorageAndRedirect = async () => {
    try {
      setIsLoading(true);

      // Get user data from cookie
      const userCookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith('user='));

      if (!userCookie) {
        console.error('User cookie not found');
        router.push('/dashboard');
        return;
      }

      // Decode the URL-encoded cookie value
      const encodedUserData = userCookie.split('=')[1];
      const decodedUserData = decodeURIComponent(encodedUserData);
      const userData = JSON.parse(decodedUserData);

      // Calculate XP earned - use ELO data if available, otherwise fall back to single-player logic
      let xpEarned = 0;
      const eloResults = localStorage.getItem('eloResults');

      if (eloResults) {
        // Use ELO-based XP for multiplayer matches
        const eloData = JSON.parse(eloResults);
        xpEarned = eloData.xpEarned || 0;
        console.log('Using ELO XP for database update:', xpEarned);
      } else {
        // Fall back to single-player XP calculation
        const questions = JSON.parse(
          localStorage.getItem('questionsObj') || '[]',
        );
        const correctAnswers = questions.filter(
          (question) => question.isCorrect == true,
        );
        xpEarned = correctAnswers.reduce(
          (accumulator, question) => accumulator + question.question.xpGain,
          0,
        );
        console.log('Using single-player XP for database update:', xpEarned);
      }

      if (xpEarned > 0) {
        // Calculate new total XP
        const newTotalXP = userData.xp + xpEarned;

        // Update user XP in database
        await updateUserXP(userData.id, newTotalXP);

        // Update the cookie with new XP value
        const updatedUserData = { ...userData, xp: newTotalXP };
        const updatedCookie = encodeURIComponent(
          JSON.stringify(updatedUserData),
          JSON.stringify(updatedUserData),
        );
        document.cookie = `user=${updatedCookie}; path=/`;
      }

      // Clear localStorage
      localStorage.removeItem('questionsObj');
      localStorage.removeItem('eloResults'); // Clear ELO data as well

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error claiming XP:', error);
      // Still redirect even if there's an error
      localStorage.removeItem('questionsObj');
      localStorage.removeItem('eloResults'); // Clear ELO data as well
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex md:flex-col md:items-center h-full p-5 md:p-10">
      <div className="flex items-center justify-between flex-col gap-4 ">
        <div className="mt-25 md:mt-0">
          <div className="flex items-center justify-center flex-col gap-0">
            <Image
              src="/ELO-Learning-Mascot.png"
              width={300}
              height={300}
              className="hidden md:block"
              alt="ELO Learning Mascot"
              priority
            />
            <Image
              src="/ELO-Learning-Mascot.png"
              width={200}
              height={200}
              className="block md:hidden"
              alt="ELO Learning Mascot"
              priority
            />
            <h1 className="text-2xl font-bold">
              {isWinner ? 'Winner' : 'Defeat'}
            </h1>
            <p className="text-center m-5 md:m-1">
              {isWinner
                ? 'Congratulations! You are doing an amazing job!'
                : 'Keep practicing! You are improving every day!'}
            </p>
          </div>
          <div className="flex flex-row items-center justify-center gap-8 my-7">
            <TotalXP />
            <Score />
            <Time />
          </div>
        </div>

        <div className="flex flex-col gap-4 mb-5">
          <button
            className="secondary-button w-full uppercase"
            onClick={clearStorageAndRedirect}
            disabled={isLoading}
          >
            {isLoading ? 'Claiming XP...' : 'Claim XP'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MatchEndScreenContent />
    </Suspense>
  );
}
