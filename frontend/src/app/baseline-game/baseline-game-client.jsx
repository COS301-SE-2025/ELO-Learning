'use client';

import { useRouter } from 'next/navigation';
import BaselineTracker from '@/app/ui/questions/baseline-questions-tracker';

export default function BaselineGameClient({ questions, userId }) {
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

  return (
    <div className="full-screen w-full h-full flex flex-col justify-between">
      <BaselineTracker
        questions={questions}
        userId={userId}
        onComplete={handleCompletion}
      />
    </div>
  );
}
