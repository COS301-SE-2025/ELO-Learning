'use client';
import { updateAchievementProgress } from '@/services/api';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

export default function AchievementDebugTest() {
  const { data: session } = useSession();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState([]);

  const testAchievementProgress = async (achievementId, conditionType, increment = 1) => {
    if (!session?.user?.id) {
      alert('Please log in first');
      return;
    }

    setTesting(true);
    try {
      const result = await updateAchievementProgress(session.user.id, achievementId, increment);
      const newResult = {
        timestamp: new Date().toLocaleTimeString(),
        achievementId,
        conditionType,
        increment,
        result,
      };
      setResults(prev => [newResult, ...prev].slice(0, 10)); // Keep last 10 results
      
      if (result.achievement_unlocked) {
        alert(`🎉 Achievement unlocked! Check for notifications.`);
      }
      
      console.log('✅ Achievement progress test result:', result);
    } catch (error) {
      console.error('❌ Achievement progress test failed:', error);
      setResults(prev => [{
        timestamp: new Date().toLocaleTimeString(),
        achievementId,
        conditionType,
        increment,
        error: error.message,
      }, ...prev].slice(0, 10));
    }
    setTesting(false);
  };

  // Test data - these should match achievements in your database
  const testAchievements = [
    { id: 1, name: 'First Steps', conditionType: 'Questions Answered' },
    { id: 2, name: 'Problem Solver', conditionType: 'Problems Solved' },
    { id: 3, name: 'Rising Star', conditionType: 'Questions Answered' },
    { id: 4, name: 'Math Veteran', conditionType: 'Questions Answered' },
  ];

  if (!session?.user) {
    return <div className="p-4 bg-red-100 text-red-800">Please log in to test achievements</div>;
  }

  return (
    <div className="p-6 bg-gray-800 rounded-lg m-4">
      <h3 className="text-white text-lg font-bold mb-4">🧪 Achievement Progress Tester</h3>
      <p className="text-gray-400 text-sm mb-4">
        User ID: {session.user.id} | Username: {session.user.username}
      </p>
      
      <div className="grid grid-cols-2 gap-3 mb-6">
        {testAchievements.map((achievement) => (
          <button
            key={achievement.id}
            onClick={() => testAchievementProgress(achievement.id, achievement.conditionType, 1)}
            disabled={testing}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors"
          >
            {testing ? 'Testing...' : `+1 ${achievement.name}`}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <h4 className="text-white font-medium">Test Results:</h4>
        <div className="max-h-64 overflow-y-auto space-y-2">
          {results.length === 0 ? (
            <p className="text-gray-400 text-sm">No tests run yet</p>
          ) : (
            results.map((result, index) => (
              <div key={index} className="bg-gray-700 p-3 rounded text-sm">
                <div className="text-gray-300">
                  <strong>{result.timestamp}</strong> - Achievement {result.achievementId} (+{result.increment})
                </div>
                {result.error ? (
                  <div className="text-red-400">❌ Error: {result.error}</div>
                ) : (
                  <div className="text-green-400">
                    ✅ Success: {result.result?.achievement_unlocked ? '🎉 UNLOCKED!' : 'Progress updated'}
                    {result.result?.progress && (
                      <div className="text-gray-400">Progress: {result.result.progress.current_value}</div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
