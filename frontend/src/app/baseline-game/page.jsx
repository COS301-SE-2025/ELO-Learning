'use client';
import { fetchAllBaselineQuestions } from '@/services/api';
import { useEffect, useState } from 'react';
import BaselineGameClient from './baseline-game-client';

export const dynamic = 'force-dynamic';

export default function BaselineGamePage() {
  const [allQuestions, setAllQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        // Fetch all baseline questions
        const questions = await fetchAllBaselineQuestions();
        console.log('Baseline questions fetched:', questions);

        if (!questions || questions.length === 0) {
          throw new Error('No questions available');
        }

        // Ensure we have the correct structure for the questions
        const normalizedQuestions = questions.map((q) => ({
          ...q,
          answers: q.answers || q.Answers || [], // Normalize the answers property
          level: q.level || 5, // Ensure each question has a level
        }));

        setAllQuestions(normalizedQuestions);
      } catch (err) {
        console.error('Failed to fetch baseline questions:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#FF6E99] mx-auto"></div>
          <p className="mt-4 text-lg">Loading baseline questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <h2 className="text-xl font-bold mb-2">Error Loading Questions</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return <BaselineGameClient questions={allQuestions} />;
}
