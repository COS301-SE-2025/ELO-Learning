'use client';
import Time from '@/app/ui/end-screen-ui/end-screen-total-time';
import TotalXPMP from '@/app/ui/end-screen-ui/end-screen-totalxp-multiplayer';
import { getSession, useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import EndELOChange from '../ui/end-screen-ui/end-screen-elo-change';
import LoadingScreen from '../ui/loading';

function MatchEndScreenContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const result = searchParams.get('result');
  const [isWinner, setIsWinner] = useState(result === 'winner');
  const [isLoading, setIsLoading] = useState(false);
  const [eloInfo, setEloInfo] = useState({ newElo: null, eloChange: null });
  const [xpReady, setXpReady] = useState(false);

  const claimXP = async () => {
    try {
      setIsLoading(true);

      // Get session from Next.js auth
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

      // Wait a bit to ensure session updates have propagated
      // This gives time for the ELO/XP updates to be reflected in the session
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
            <TotalXPMP
              onResults={(res) => {
                setEloInfo(res);
                setXpReady(true);
              }}
            />

            <EndELOChange eloChange={eloInfo.eloChange} />

            <Time />
          </div>
        </div>

        <div className="flex flex-col gap-4 mb-5">
          <button
            className="secondary-button w-full uppercase"
            onClick={claimXP}
            disabled={isLoading || !xpReady}
          >
            {isLoading
              ? 'Claiming Changes..'
              : !xpReady
                ? 'Calculating Changes...'
                : 'Claim Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingScreen message="Loading match results..." />}>
      <MatchEndScreenContent />
    </Suspense>
  );
}
