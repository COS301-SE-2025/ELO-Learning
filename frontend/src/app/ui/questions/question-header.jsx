import Lives from '@/app/ui/lives';
import ProgressBar from '@/app/ui/progress-bar';
import { X } from 'lucide-react';
import Link from 'next/link';
export default function QuestionHeader({ currentStep, totalSteps, numLives }) {
  const handleClose = () => {
    localStorage.removeItem('questionsObj');
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
