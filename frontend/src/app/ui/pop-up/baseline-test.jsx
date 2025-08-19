'use client';
import axios from 'axios';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateUserElo } from '@/services/api';
import { useSession } from 'next-auth/react';

export default function BaselineTestPopup({ user_id, onClose }) {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);

  const handleNo = async () => {
    if (!user_id) {
      console.error('No user_id provided to BaselineTestPopup');
      return;
    }
    setLoading(true);
    try {
      // Call skip endpoint
      await updateUserElo(user_id, 100);
      update({
        user: {
          ...session.user,
          baseLineTest: true, // Set baseLineTest to true
        },
      });
    } catch (err) {
      console.error('Error skipping baseline test:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleYes = async () => {
    //just go to the test, do not set baseLineTest to true yet.
    router.push('/baseline');
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
