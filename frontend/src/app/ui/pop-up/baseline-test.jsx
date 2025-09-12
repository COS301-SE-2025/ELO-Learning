'use client';
import { confirmBaselineTest } from '@/services/api';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function BaselineTestPopup({ user_id, onClose }) {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);

  const handleNo = async () => {
    // Just close the popup without updating the database
    // The option to take the baseline test will appear in the profile page
    onClose();
  };

  const handleYes = async () => {
    if (!user_id) {
      console.error('No user_id provided to BaselineTestPopup');
      return;
    }

    setLoading(true);
    try {
      // Set baseLineTest to true since user confirmed they want to take the test
      const response = await confirmBaselineTest(user_id);
      console.log('✅ confirmBaselineTest response:', response);

      // Update session with the returned user data
      if (response.user) {
        await update({
          user: {
            ...session.user,
            ...response.user, // Use the complete updated user data from backend
          },
        });
        console.log('✅ Session updated with backend response');
      } else {
        // Fallback: just update baseLineTest field
        await update({
          user: {
            ...session.user,
            baseLineTest: true,
          },
        });
        console.log('✅ Session updated with fallback baseLineTest');
      }

      // Navigate to baseline test
      router.push('/baseline-game');
    } catch (err) {
      console.error('Error confirming baseline test:', err);
      // Still navigate to test even if confirmation fails
      router.push('/baseline-game');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur">
      <div className="bg-[var(--background)] rounded-xl shadow-lg p-6 w-[90%] max-w-md">
        <h2 className="text-2xl font-bold">Take the Baseline Test?</h2>
        <p className="mt-2">
          This will help us assess your current skill level.
        </p>
        {/* <p className="text-[var(--radical-rose)] text-sm py-5">
          If you choose to skip it, it might be harder to climb the leader
          board.
        </p> */}

        <div className="mt-6 flex gap-4">
          <button
            className="flex-1 py-2 font-bold rounded-lg bg-[var(--vector-violet)] text-white hover:bg-[var(--blueprint-blue)] disabled:opacity-50"
            onClick={handleYes}
            disabled={loading}
          >
            Yes
          </button>
          <button
            className="flex-1 py-2 font-bold rounded-lg bg-[var(--grey)] hover:bg-[var(--vector-violet-light)] disabled:opacity-50"
            onClick={handleNo}
            disabled={loading}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}
