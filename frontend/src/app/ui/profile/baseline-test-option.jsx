'use client';
import { useRouter } from 'next/navigation';

export default function BaselineTestOption({ userHasTakenBaseline }) {
  const router = useRouter();

  console.log(
    ' BaselineTestOption rendered with userHasTakenBaseline:',
    userHasTakenBaseline,
  );

  // Don't show this component if user has already taken the baseline test
  if (userHasTakenBaseline) {
    console.log(' User has taken baseline test, hiding component');
    return null;
  }

  console.log('Showing baseline test option for user');

  const handleTakeBaselineTest = () => {
    // Navigate directly to baseline test page
    router.push('/baseline-game');
  };

  return (
    <div className="mx-4 bg-[var(--background)] border border-[var(--radical-rose)] rounded-lg p-4 mb-4 shadow-sm">
      <div className="flex flex-col items-center text-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--radical-rose)] flex items-center justify-center">
            <span className="text-white text-sm font-bold">!</span>
          </div>
          <h3 className="font-bold text-lg text-[var(--radical-rose)]">
            Baseline Test Not Completed
          </h3>
        </div>
        <div className="flex-1">
          <p className="text-sm text-[var(--text-secondary)] mb-3">
            You haven't taken the baseline test yet. Tap below to take it now.
          </p>
          <button
            onClick={handleTakeBaselineTest}
            className="w-full py-2 px-4 bg-[var(--radical-rose)] text-white font-medium rounded-lg hover:bg-[var(--vector-violet)] transition-colors"
          >
            Take Baseline Test
          </button>
        </div>
      </div>
    </div>
  );
}
