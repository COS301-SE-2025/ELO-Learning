'use client';
import { useState } from 'react';
import axios from 'axios';

export default function BaselineTestPopup({ user_id, onClose }) {
  const [loading, setLoading] = useState(false);

const handleNo = async () => {
    if (!user_id) {
      console.error("No user_id provided to BaselineTestPopup");
      return;
    }
    setLoading(true);
    try {
      // Call skip endpoint
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/baseline/skip`, {
        user_id,
      });

      // Remain on dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Error skipping baseline test:', err);
    } finally {
      setLoading(false);
    }
};

  const handleYes = async() => {
    //just go to the test, do not set baseLineTest to true yet.
    window.location.href = '/baseline';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 w-[90%] max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Take the Baseline Test?
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          This will help us assess your current skill level.
        </p>

        <div className="mt-6 flex gap-4">
          <button
            className="flex-1 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            onClick={handleYes}
            disabled={loading}
          >
            Yes
          </button>
          <button
            className="flex-1 py-2 rounded-lg bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-400 dark:hover:bg-gray-600 disabled:opacity-50"
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
