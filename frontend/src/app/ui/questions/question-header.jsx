import Lives from '@/app/ui/lives';
import ProgressBar from '@/app/ui/progress-bar';
import { X } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function QuestionHeader({ currentStep, totalSteps, numLives }) {
  // Initialize game session when component mounts (game starts)
  useEffect(() => {
    // Generate unique game session ID when game starts
    const gameSessionId =
      Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentGameSession', gameSessionId);
    }
    console.log('🎮 Started new game session:', gameSessionId);

    // Clear any previous XP calculation states
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('submittedOnce');
      sessionStorage.removeItem('calculatingXP');
    }
    console.log('🧹 Cleared previous game states');
  }, []);

  const handleClose = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('questionsObj');
      localStorage.removeItem('currentGameSession');
      sessionStorage.removeItem('submittedOnce');
      sessionStorage.removeItem('calculatingXP');
    }
    console.log('🚪 Game ended - cleaned up session data');
  };
  return (
    <div className="fixed top-0 left-0 w-full z-20 bg-[#201F1F] p-5">
      <div className="flex flex-row items-center justify-between w-full py-2 gap-2">
        <Link href="/dashboard" onClick={handleClose}>
          <X size={24} />
        </Link>
        <div className="flex-1">
          <ProgressBar progress={currentStep / totalSteps} />
        </div>
        <Lives numberOfLives={numLives} />
      </div>
    </div>
  );
}
