'use client'

import { useSessionWithCache } from '@/hooks/useSessionWithCache';
import { fetchUserAchievements, fetchUserAchievementsWithStatus, submitSinglePlayerAttempt } from '@/services/api';
import { useState } from 'react';

export default function TestAchievementsDebug() {
  const session = useSessionWithCache();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const testAuthentication = async () => {
    if (!session?.user?.id) {
      setResults('No session found. Please log in.');
      return;
    }

    setLoading(true);
    try {
      console.log('Testing authentication with user:', session.user);
      
      // Test fetching user achievements
      const achievements = await fetchUserAchievements(session.user.id);
      console.log('User achievements:', achievements);
      
      const achievementsWithStatus = await fetchUserAchievementsWithStatus(session.user.id);
      console.log('User achievements with status:', achievementsWithStatus);
      
      setResults({
        userId: session.user.id,
        achievements,
        achievementsWithStatus,
        sessionData: session,
      });
    } catch (error) {
      console.error('Authentication test failed:', error);
      setResults({
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
    }
    setLoading(false);
  };

  const testSinglePlayerSubmission = async () => {
    if (!session?.user?.id) {
      setResults('No session found. Please log in.');
      return;
    }

    setLoading(true);
    try {
      console.log('Testing single player submission...');
      
      // Submit a test question attempt
      const response = await submitSinglePlayerAttempt({
        user_id: session.user.id,
        question_id: 1, // Test with question 1
        isCorrect: true,
        timeSpent: 30,
      });
      
      console.log('Single player response:', response);
      
      setResults({
        submissionResponse: response,
        unlockedAchievements: response.unlockedAchievements,
      });
    } catch (error) {
      console.error('Single player submission test failed:', error);
      setResults({
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
    }
    setLoading(false);
  };

  const testMultipleSubmissions = async () => {
    if (!session?.user?.id) {
      setResults('No session found. Please log in.');
      return;
    }

    setLoading(true);
    try {
      console.log('Testing multiple single player submissions...');
      
      const allResults = [];
      
      // Submit 5 correct answers to trigger "Quick Thinker" and other achievements
      for (let i = 0; i < 5; i++) {
        const response = await submitSinglePlayerAttempt({
          user_id: session.user.id,
          question_id: 1 + i, // Use different question IDs
          isCorrect: true,
          timeSpent: 25 + i * 2, // Vary time
        });
        
        console.log(`Submission ${i + 1} response:`, response);
        allResults.push({
          submission: i + 1,
          response: response,
          newAchievements: response.unlockedAchievements || [],
        });
        
        // Short delay between submissions
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const totalNewAchievements = allResults.flatMap(r => r.newAchievements);
      console.log('Total new achievements unlocked:', totalNewAchievements);
      
      setResults({
        multipleSubmissions: allResults,
        totalNewAchievements,
        summary: {
          totalSubmissions: allResults.length,
          achievementsUnlocked: totalNewAchievements.length,
        }
      });
    } catch (error) {
      console.error('Multiple submissions test failed:', error);
      setResults({
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Achievement System Debug</h1>
      
      <div className="mb-4">
        <p><strong>Session Status:</strong> {session?.status || 'No session'}</p>
        <p><strong>User ID:</strong> {session?.user?.id || 'Not logged in'}</p>
        <p><strong>Username:</strong> {session?.user?.username || 'N/A'}</p>
      </div>
      
      <div className="space-y-4">
        <button
          onClick={testAuthentication}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Authentication & Fetch Achievements'}
        </button>
        
        <button
          onClick={testSinglePlayerSubmission}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Single Player Submission'}
        </button>

        <button
          onClick={testMultipleSubmissions}
          disabled={loading}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Multiple Submissions (Force Achievements)'}
        </button>
      </div>
      
      {results && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h2 className="text-lg font-semibold mb-2">Results:</h2>
          <pre className="whitespace-pre-wrap text-sm overflow-auto">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
