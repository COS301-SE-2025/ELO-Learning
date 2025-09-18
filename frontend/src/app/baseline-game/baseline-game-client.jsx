'use client';

import BaselineTracker from '@/app/ui/questions/baseline-questions-tracker';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function BaselineGameClient({ questions }) {
  const { data: session, status, update: updateSession } = useSession();

  const router = useRouter();

  const handleCompletion = async (finalElo, backendResponse) => {
    try {
      console.log('🎯 Baseline test completed with ELO:', finalElo);
      console.log('🎯 Backend response:', backendResponse);

      // Update session to reflect baseline test completion
      if (session?.user) {
        console.log('🔄 Updating session after baseline completion...');

        // Use the updated user data from the backend if available
        if (backendResponse?.user) {
          await updateSession({
            user: {
              ...session.user,
              ...backendResponse.user, // Use complete updated user data
            },
          });
          console.log('✅ Session updated with backend user data');
        } else {
          // Fallback: manually update the fields
          await updateSession({
            user: {
              ...session.user,
              baseLineTest: true,
              currentLevel: finalElo,
              elo_rating: finalElo,
            },
          });
          console.log('✅ Session updated with fallback data');
        }
      }

      // Get the actual calculated ELO and rank from backend response
      const calculatedElo = backendResponse?.elo_rating || finalElo;
      const assignedRank = backendResponse?.rank || 'Unranked';

      // Save the final ELO rating to localStorage for the end screen
      localStorage.setItem('baselineFinalElo', calculatedElo.toString());
      localStorage.setItem('baselineAssignedRank', assignedRank);

      console.log('🚀 Redirecting to end screen...');
      // Redirect to end screen with baseline mode and calculated ELO
      router.push(
        `/end-screen?mode=baseline&elo=${calculatedElo}&rank=${assignedRank}`,
      );
    } catch (error) {
      console.error('Error completing baseline:', error);
      // Still try to go to end screen even if session update fails
      const fallbackElo = finalElo; // Use level as fallback
      localStorage.setItem('baselineFinalElo', fallbackElo.toString());
      localStorage.setItem('baselineAssignedRank', 'Unranked');
      router.push(`/end-screen?mode=baseline&elo=${fallbackElo}&rank=Unranked`);
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
