'use client';
import EndELO from '@/app/ui/end-screen-ui/end-screen-elo';
import PracticeXP from '@/app/ui/end-screen-ui/end-screen-practice-xp';
import Score from '@/app/ui/end-screen-ui/end-screen-score';
import Time from '@/app/ui/end-screen-ui/end-screen-total-time';
import TotalXP from '@/app/ui/end-screen-ui/end-screen-total-xp';
import { getSession, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { redirect, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function EndScreen() {
  const { data: session, update: updateSession } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = searchParams.get('mode');
  const eloRating = searchParams.get('elo');
  const assignedRank = searchParams.get('rank');
  const [isLoading, setIsLoading] = useState(false);
  const [xpReady, setXpReady] = useState(false);
  const [practiceXpReady, setPracticeXpReady] = useState(false);

  const [mistakes, setMistakes] = useState(0);
  useEffect(() => {
    const questions = JSON.parse(localStorage.getItem('questionsObj')) || [];
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

      /*
      // Get user data from cookie
      const userCookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith('user='));

        if (!userCookie) {
          console.error('User cookie not found and no session available');
          console.log('Available cookies:', document.cookie);
          console.log('Session data:', session);

          // Don't redirect immediately, just show error
          setIsLoading(false);
          return;
        }

      // Decode the URL-encoded cookie value
      const encodedUserData = userCookie.split('=')[1];
      const decodedUserData = decodeURIComponent(encodedUserData);
      const userData = JSON.parse(decodedUserData);

      */

      //Get session from Next.js auth
      const currentSession = await getSession();

      if (!currentSession || !currentSession.user) {
        console.error('No authenticated session found');
        router.push('/dashboard');
        return;
      }

      const userData = currentSession.user;

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

      // Wait for session updates to propagate
      console.log('Waiting for session updates to propagate...');
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Force a session refresh to ensure we have the latest data
      await updateSession();
      console.log('Session refreshed, proceeding with navigation...');

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
          {mode !== 'baseline' && (
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
          )}
          {mode === 'practice' && (
            <div>
              <div className="flex flex-row items-center justify-center gap-8 my-7">
                <PracticeXP onLoadComplete={() => setPracticeXpReady(true)} />
                <Score />
                <Time />
              </div>
            </div>
          )}
          {mode === 'single-player' && (
            <div className="flex flex-row items-center justify-center gap-8 my-7">
              <TotalXP onLoadComplete={() => setXpReady(true)} />
              <Score />
              <Time />
            </div>
          )}
          {/* Blocks with information */}
          {mode === 'baseline' && (
            <div className="h-full flex flex-col items-center justify-center gap-4 my-7">
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
              <h2 className="text-2xl font-bold text-center text-[var(--vector-violet-light)]">
                Baseline Test Complete!
              </h2>
              <p className="text-lg text-center mb-5">
                Congratulations! You've completed your baseline assessment.
              </p>
              <p className="text-lg font-bold">Your starting ELO and rank:</p>
              <div className="flex flex-row gap-4 items-center mb-8">
                <EndELO newElo={eloRating ? parseFloat(eloRating) : null} />
                <div className="border-1 border-[#FF6E99] rounded-[10px] w-[120px]">
                  <div className="uppercase bg-[#FF6E99] p-2 rounded-t-[9px] text-[14px] font-bold text-center tracking-wide">
                    RANK
                  </div>
                  <div className="text-center text-[18px] font-bold py-3 px-5">
                    {assignedRank || '—'}
                  </div>
                </div>
              </div>

              <button
                className="main-button mt-10 uppercase"
                onClick={() => {
                  localStorage.removeItem('baselineQuestionsObj');
                  localStorage.removeItem('baselineFinalElo');
                  localStorage.removeItem('baselineAssignedRank');
                  router.push('/dashboard?baseline_completed=true');
                }}
              >
                Start Your Learning Journey
              </button>
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
                disabled={!practiceXpReady}
              >
                {!practiceXpReady ? 'Calculating XP...' : 'Finish session'}
              </button>
            </div>
          )}
          {mode === 'single-player' && (
            <button
              className="secondary-button w-full uppercase"
              onClick={calculateXP}
              disabled={isLoading || !xpReady}
            >
              {isLoading
                ? 'Claiming XP...'
                : !xpReady
                  ? 'Calculating...'
                  : 'Claim XP'}
            </button>
          )}
          {/* this is where i will change the baseline end screen button */}
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
