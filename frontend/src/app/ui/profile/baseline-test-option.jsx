'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { skipBaselineTest } from '@/services/api'; // Keep the existing import
import { useSession } from 'next-auth/react';

export default function BaselineTestOption({
  userHasTakenBaseline,
  onSkipBaseline,
}) {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  // Don't show this component if user has already taken the baseline test
  if (userHasTakenBaseline) {
    return null;
  }

  const handleTakeBaselineTest = () => {
    router.push('/baseline-game');
  };

  const handleSkipBaseline = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmSkip = async () => {
    setLoading(true);
    try {
      // Use the passed prop if available, otherwise use the API directly
      if (onSkipBaseline && typeof onSkipBaseline === 'function') {
        await onSkipBaseline();
      } else {
        // Fallback: call API directly
        const userId = session?.user?.id || session?.user?._id;
        if (!userId) {
          throw new Error('No user ID found in session');
        }

        const response = await skipBaselineTest(userId); // Use the correct function name

        // Update session to reflect the change
        await update({
          user: {
            ...session.user,
            base_line_test: true,
          },
        });
      }

      setShowConfirmDialog(false);
    } catch (error) {
      console.error('Failed to skip baseline test:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSkip = () => {
    setShowConfirmDialog(false);
  };

  return (
    <>
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
            <div className="flex flex-col gap-2">
              <button
                onClick={handleTakeBaselineTest}
                className="w-full py-2 px-4 bg-[var(--radical-rose)] text-white font-bold rounded-lg hover:bg-[var(--vector-violet)] hover:shadow-lg hover:scale-105 transition-all duration-200 ease-in-out"
              >
                Take Baseline Test
              </button>
              <button
                onClick={handleSkipBaseline}
                className="w-full py-2 px-4 bg-transparent text-[var(--text-secondary)] font-bold rounded-lg border border-gray-300 hover:bg-gray-50 hover:text-gray-700 hover:shadow-lg hover:scale-105 transition-all duration-200 ease-in-out"
              >
                Skip Forever
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog - matching baseline-test popup styling */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur">
          <div className="bg-[var(--background)] rounded-xl shadow-lg p-6 w-[90%] max-w-md">
            <h2 className="text-2xl font-bold">Skip Baseline Test?</h2>
            <p className="mt-2">
              Are you sure you never want to take the baseline test? This will
              permanently hide this option.
            </p>

            <div className="mt-6 flex gap-4">
              <button
                className="flex-1 py-2 font-bold rounded-lg bg-[var(--grey)] text-white hover:bg-red-600 disabled:opacity-50"
                onClick={handleConfirmSkip}
                disabled={loading}
              >
                {loading ? 'Skipping...' : 'Yes, Skip Forever'}
              </button>
              <button
                className="flex-1 py-2 font-bold rounded-lg bg-[var(--vector-violet)] text-white hover:bg-[var(--blueprint-blue)] disabled:opacity-50"
                onClick={handleCancelSkip}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
