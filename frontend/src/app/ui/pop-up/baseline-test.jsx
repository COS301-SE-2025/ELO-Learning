"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { skipBaselineTest, startBaselineTest } from "@/services/api";

export default function BaselineTestPopup({ userId, onClose }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleYes = async () => {
    setLoading(true);
    try {
      await startBaselineTest(userId); // this updates baseLineTest=true in backend
      router.push("/baseline"); // navigate to test page
    } catch (err) {
      console.error("Error starting baseline test", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNo = async () => {
    setLoading(true);
    try {
      await skipBaselineTest(userId);
      onClose();
    } catch (err) {
      console.error("Error skipping baseline test", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
        <h2 className="text-xl font-bold mb-4">Take the Baseline Test?</h2>
        <p className="mb-6 text-gray-700">
          This test helps determine your starting ELO rating for a personalised math journey.
        </p>
        <div className="flex justify-center gap-4">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={handleYes}
            disabled={loading}
          >
            Yes
          </button>
          <button
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
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
