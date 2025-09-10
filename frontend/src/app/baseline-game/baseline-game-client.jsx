'use client';

import BaselineTracker from '@/app/ui/questions/baseline-questions-tracker';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function BaselineGameClient({ questions }) {
  const { data: session, status } = useSession();

  const router = useRouter();

  const handleCompletion = async (finalElo) => {
    try {
      // Save the final ELO rating to localStorage for the end screen
      localStorage.setItem('baselineFinalElo', finalElo.toString());
      // Redirect to end screen with baseline mode
      router.push(`/end-screen?mode=baseline&elo=${finalElo}`);
    } catch (error) {
      console.error('Error completing baseline:', error);
      router.push('/dashboard?error=baseline-failed');
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }
  if (status === 'authenticated') {
    return (
      <div className="full-screen w-full h-full flex flex-col justify-between">
        <BaselineTracker
          questions={questions}
          userId={session.user.id}
          onComplete={handleCompletion}
        />
      </div>
    );
  }
  return (
    <div className="flex justify-center items-center h-full">
      <p>Please log in to play the baseline game.</p>
    </div>
  );
}
