// Example usage of the practice XP calculator
// You can integrate this into your end-screen or practice completion flow

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import {
  getPracticeSessionXP,
  submitPracticeSessionXP,
} from '../utils/practiceXP';

export default function PracticeEndScreen() {
  const { data: session } = useSession();
  const [xpResult, setXpResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Calculate and award XP when component mounts
  useEffect(() => {
    const awardPracticeXP = async () => {
      if (!session?.user?.id) return;

      setLoading(true);

      try {
        // Get questionsObj from localStorage
        const questionsObj =
          JSON.parse(localStorage.getItem('questionsObj')) || [];

        if (questionsObj.length === 0) {
          console.log('No practice questions found in localStorage');
          setLoading(false);
          return;
        }

        // Get current user XP (you might get this from session or API)
        const currentXP = session.user.xp || 0;

        // Submit practice session XP
        const result = await submitPracticeSessionXP(
          session.user.id,
          questionsObj,
          currentXP,
        );

        setXpResult(result);

        if (result.success) {
          console.log('🎉 Practice XP awarded successfully!', result);

          // Optionally clear the questionsObj since session is complete
          // localStorage.removeItem('questionsObj');
        } else {
          console.error('Failed to award practice XP:', result.error);
        }
      } catch (error) {
        console.error('Error awarding practice XP:', error);
        setXpResult({
          success: false,
          error: error.message,
          xpEarned: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    awardPracticeXP();
  }, [session]);

  // Preview XP calculation without submitting
  const previewXP = () => {
    const preview = getPracticeSessionXP();
    console.log('XP Preview:', preview);
    return preview;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Calculating your XP...</p>
        </div>
      </div>
    );
  }

  if (!xpResult) {
    return <div>No practice session data found.</div>;
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        Practice Session Complete! 🎉
      </h2>

      {xpResult.success ? (
        <div className="space-y-4">
          {/* XP Earned */}
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              +{xpResult.xpEarned} XP
            </div>
            <p className="text-gray-600">{xpResult.message}</p>
          </div>

          {/* Session Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Session Summary</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Questions: {xpResult.summary.totalQuestions}</div>
              <div>Correct: {xpResult.summary.correctAnswers}</div>
              <div>Accuracy: {xpResult.summary.accuracy}%</div>
              <div>Avg Time: {xpResult.summary.averageTime}s</div>
            </div>
          </div>

          {/* XP Breakdown */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">XP Breakdown</h3>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Base XP:</span>
                <span>{Math.round(xpResult.summary.baseXP * 0.6)}</span>
              </div>
              <div className="flex justify-between">
                <span>Bonuses:</span>
                <span>{xpResult.summary.bonusXP}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-1">
                <span>Total:</span>
                <span>{xpResult.xpEarned} XP</span>
              </div>
            </div>
          </div>

          {/* New Total XP */}
          <div className="text-center pt-4 border-t">
            <p className="text-gray-600">Total XP: {xpResult.newTotalXP}</p>
          </div>
        </div>
      ) : (
        <div className="text-center text-red-600">
          <p>Failed to award XP: {xpResult.error}</p>
        </div>
      )}
    </div>
  );
}

// Alternative: Manual trigger function you can call anywhere
export async function awardPracticeXP(userId, currentUserXP) {
  const questionsObj = JSON.parse(localStorage.getItem('questionsObj')) || [];

  if (questionsObj.length === 0) {
    console.log('No practice questions to award XP for');
    return { success: false, error: 'No questions found' };
  }

  return await submitPracticeSessionXP(userId, questionsObj, currentUserXP);
}
