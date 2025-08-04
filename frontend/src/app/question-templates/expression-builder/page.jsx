'use client';

import { useEffect, useState } from 'react';
import UniversalQuestionWrapper from '@/app/ui/universal-question-wrapper';
import { getQuestionsByType } from '@/utils/api';

export default function ExpressionBuilderPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoading(true);
        const result = await getQuestionsByType('Expression Builder', 10);

        if (!result.success) {
          console.error('Error:', result.error);
          setError(result.error);
          return;
        }

        const fetchedQuestions = result.data || [];
        
        if (fetchedQuestions.length === 0) {
          console.warn('No Expression Builder questions found');
          setError('No Expression Builder questions found in the database.');
          return;
        }

        console.log('Expression Builder questions fetched successfully:', fetchedQuestions.length);
        setQuestions(fetchedQuestions);
        setError(null);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred while loading questions.');
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800">Loading Expression Builder Questions...</h2>
          <p className="text-gray-600 mt-2">Please wait while we fetch your practice questions.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4 text-red-600">Error Loading Questions</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()} 
              className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <a 
              href="/practice" 
              className="block px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back to Practice
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="full-screen w-full h-full flex flex-col justify-between">
      <UniversalQuestionWrapper questions={questions} />
    </div>
  );
}