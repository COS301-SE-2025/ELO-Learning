import ProgressBar from '@/app/ui/progress-bar';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function BaselineQuestionHeader({
  currentStep,
  totalSteps,
  userId,
}) {
  const router = useRouter();
  const [showExitDialog, setShowExitDialog] = useState(false);

  const handleExitClick = () => {
    setShowExitDialog(true);
  };

  const handleConfirmExit = () => {
    // Clear any baseline test data
    localStorage.removeItem('baselineQuestionsObj');
    localStorage.removeItem('baselineFinalElo');
    localStorage.removeItem('baselineAssignedRank');

    // Clear the popup interaction flag so user can see the popup again if needed
    if (userId) {
      localStorage.removeItem(`baseline_popup_seen_${userId}`);
    }

    // Navigate back to dashboard
    router.push('/dashboard');
  };

  const handleCancelExit = () => {
    setShowExitDialog(false);
  };

  return (
    <>
      <div className="fixed top-0 left-0 w-full z-20 bg-[#201F1F] p-5">
        <div className="flex flex-row items-center justify-between w-full py-2 gap-2">
          <button
            onClick={handleExitClick}
            className="text-white hover:text-gray-300"
          >
            <X size={24} />
          </button>
          <div className="flex-1">
            <ProgressBar progress={currentStep / totalSteps} />
          </div>
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      {showExitDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur">
          <div className="bg-[var(--background)] rounded-xl shadow-lg p-6 w-[90%] max-w-md">
            <h2 className="text-2xl font-bold">Exit Baseline Test?</h2>
            <p className="mt-2">
              Are you sure you want to exit the baseline test? Your progress
              will be lost and you can take the test again later.
            </p>

            <div className="mt-6 flex gap-4">
              <button
                className="flex-1 py-2 font-bold rounded-lg bg-red-600 text-white hover:bg-red-700"
                onClick={handleConfirmExit}
              >
                Yes, Exit Test
              </button>
              <button
                className="flex-1 py-2 font-bold rounded-lg bg-[var(--vector-violet)] text-white hover:bg-[var(--blueprint-blue)]"
                onClick={handleCancelExit}
              >
                Continue Test
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
