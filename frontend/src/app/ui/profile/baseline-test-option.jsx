'use client';
import { confirmBaselineTest } from '@/services/api';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function BaselineTestOption({ userHasTakenBaseline }) {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const [loading, setLoading] = useState(false);

  console.log(
    '🔍 BaselineTestOption rendered with userHasTakenBaseline:',
    userHasTakenBaseline,
  );

  // Don't show this component if user has already taken the baseline test
  if (userHasTakenBaseline) {
    console.log(' User has taken baseline test, hiding component');
    return null;
  }

  console.log('Showing baseline test option for user');

  const handleTakeBaselineTest = async () => {
    setLoading(true);
    try {
      // Confirm baseline test participation (sets baseLineTest to true in DB)
      if (session?.user?.id) {
        const response = await confirmBaselineTest(session.user.id);
        console.log('confirmBaselineTest response:', response);

        // Update session with the returned user data
        if (response.user) {
          await updateSession({
            user: {
              ...session.user,
              ...response.user, // Use the complete updated user data from backend
            },
          });
          console.log('Session updated with backend response');
        } else {
          // Fallback: just update baseLineTest field
          await updateSession({
            user: {
              ...session.user,
              base_line_test: true,
            },
          });
          console.log('Session updated with fallback baseLineTest');
        }
      }

      // Navigate to baseline test page
      router.push('/baseline-game');
    } catch (error) {
      console.error('Error confirming baseline test:', error);
      // Still navigate to test even if confirmation fails
      router.push('/baseline-game');
    } finally {
      setLoading(false);
    }
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
            You haven't taken the baseline test yet. Tap here to take it now.
          </p>
          <button
            onClick={handleTakeBaselineTest}
            disabled={loading}
            className="w-full py-2 px-4 bg-[var(--radical-rose)] text-white font-medium rounded-lg hover:bg-[var(--vector-violet)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Take Baseline Test'}
          </button>
        </div>
      </div>
    </div>
  );
}
