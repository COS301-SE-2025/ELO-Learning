'use client';
import Score from '@/app/ui/end-screen-ui/end-screen-score';
import Time from '@/app/ui/end-screen-ui/end-screen-total-time';
import TotalXP from '@/app/ui/end-screen-ui/end-screen-total-xp';
import { updateUserXP } from '@/services/api';
import Image from 'next/image';
import Link from 'next/link';
import { redirect, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function EndScreen() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = searchParams.get('mode');
  const [isLoading, setIsLoading] = useState(false);

  const [mistakes, setMistakes] = useState(0);
  useEffect(() => {
    const questions = JSON.parse(localStorage.getItem('questionsObj'));
    const correctAnswers = questions.filter(
      (question) => question.isCorrect == true,
    );
    setMistakes(questions.length - correctAnswers.length);
  }, []);

  const clearStorageAndRedirect = () => {
    localStorage.removeItem('questionsObj');
    redirect(`/dashboard`);
  };

  const calculateXP = async () => {
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

      // Calculate XP earned using the same logic as TotalXP component
      const questions = JSON.parse(
        localStorage.getItem('questionsObj') || '[]',
      );
      /*
      const correctAnswers = questions.filter(
        (question) => question.isCorrect == true,
      );
      const xpEarned = correctAnswers.reduce(
        (accumulator, question) => accumulator + question.question.xpGain,
        0,
      );

      if (xpEarned > 0) {
        // Calculate new total XP
        const newTotalXP = userData.xp + xpEarned;

        // Update user XP in database
        await updateUserXP(userData.id, newTotalXP);

        // Update the cookie with new XP value
        const updatedUserData = { ...userData, xp: newTotalXP };
        const updatedCookie = encodeURIComponent(
          JSON.stringify(updatedUserData),
        );
        document.cookie = `user=${updatedCookie}; path=/`;
      }
*/
      // Clear localStorage
      localStorage.removeItem('questionsObj');

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error claiming XP:', error);
      // Still redirect even if there's an error
      localStorage.removeItem('questionsObj');
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
              {mistakes} {mistakes === 1 ? 'Mistake' : 'Mistakes'}
            </h1>
            <p className="text-center m-5 md:m-1">
              Continue upskilling your maths! You are doing an amazing job!
            </p>
          </div>
          {mode === 'practice' && (
            <div className="flex flex-row items-center justify-center gap-8 my-7">
              <Score />
              <Time />
            </div>
          )}
          {mode === 'single-player' && (
            <div className="flex flex-row items-center justify-center gap-8 my-7">
              <TotalXP />
              <Score />
              <Time />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 mb-5">
          {mode === 'practice' && (
            <div className="flex flex-col gap-2">
              <Link className="btn-link" href="/memo">
                <button className="main-button w-full uppercase">
                  View the memo
                </button>
              </Link>
              <button
                className="secondary-button w-full uppercase"
                onClick={clearStorageAndRedirect}
              >
                Finish session
              </button>
            </div>
          )}
          {mode === 'single-player' && (
            <button
              className="secondary-button w-full uppercase"
              onClick={calculateXP}
              disabled={isLoading}
            >
              {isLoading ? 'Claiming XP...' : 'Claim XP'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EndScreen />
    </Suspense>
  );
}
