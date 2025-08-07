'use client';
import { fetchAllAchievements, fetchUserAchievementsWithStatus } from '@/services/api';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

export default function AchievementDatabaseTest() {
  const { data: session } = useSession();
  const [allAchievements, setAllAchievements] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const [loading, setLoading] = useState(false);

  const runDiagnostic = async () => {
    if (!session?.user?.id) {
      alert('Please log in first');
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 Running achievement diagnostic...');
      
      // Get all achievements from database
      const allAch = await fetchAllAchievements();
      console.log('📋 All achievements in database:', allAch);
      setAllAchievements(allAch);

      // Get user's achievements with status
      const userAch = await fetchUserAchievementsWithStatus(session.user.id);
      console.log('👤 User achievements with status:', userAch);
      setUserAchievements(userAch);

      // Find question-based achievements specifically
      const questionAchievements = allAch.filter(a => 
        a.condition_type === 'Questions Answered' || 
        a.condition_type === 'Problems Solved'
      );
      console.log('❓ Question-based achievements:', questionAchievements);

    } catch (error) {
      console.error('❌ Diagnostic failed:', error);
      alert('Diagnostic failed: ' + error.message);
    }
    setLoading(false);
  };

  const questionBasedAchievements = allAchievements.filter(a => 
    a.condition_type === 'Questions Answered' || 
    a.condition_type === 'Problems Solved'
  );

  const userQuestionAchievements = userAchievements.filter(a => 
    a.condition_type === 'Questions Answered' || 
    a.condition_type === 'Problems Solved'
  );

  return (
    <div className="p-6 bg-gray-900 rounded-lg m-4">
      <h3 className="text-white text-lg font-bold mb-4">🔍 Achievement Database Diagnostic</h3>
      
      <button
        onClick={runDiagnostic}
        disabled={loading || !session?.user}
        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded mb-4"
      >
        {loading ? 'Running Diagnostic...' : 'Run Diagnostic'}
      </button>

      {!session?.user && (
        <p className="text-red-400 mb-4">Please log in to run diagnostic</p>
      )}

      {allAchievements.length > 0 && (
        <div className="space-y-4">
          <div>
            <h4 className="text-white font-medium mb-2">
              📋 Question-Based Achievements in Database ({questionBasedAchievements.length})
            </h4>
            <div className="bg-gray-800 p-3 rounded max-h-48 overflow-y-auto">
              {questionBasedAchievements.map(achievement => (
                <div key={achievement.id} className="text-sm text-gray-300 py-1">
                  ID: {achievement.id} | {achievement.name} | 
                  Type: {achievement.condition_type} | 
                  Value: {achievement.condition_value}
                </div>
              ))}
            </div>
          </div>

          {userAchievements.length > 0 && (
            <div>
              <h4 className="text-white font-medium mb-2">
                👤 Your Question Progress ({userQuestionAchievements.length})
              </h4>
              <div className="bg-gray-800 p-3 rounded max-h-48 overflow-y-auto">
                {userQuestionAchievements.map(achievement => (
                  <div key={achievement.id} className="text-sm text-gray-300 py-1">
                    {achievement.name}: {achievement.current_progress || 0}/{achievement.condition_value} 
                    {achievement.unlocked ? ' ✅ UNLOCKED' : ' 🔒 Locked'}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-gray-400">
            💡 Check browser console for detailed logs
          </div>
        </div>
      )}
    </div>
  );
}
