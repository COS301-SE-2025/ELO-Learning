'use client';

import UniversalQuestionWrapper from '@/app/ui/universal-question-wrapper';
import { getQuestionsByType } from '@/utils/api';
import { useEffect, useState } from 'react';

export default function MatchQuestionPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoading(true);
        
        // First try to fetch from backend
        const result = await getQuestionsByType('Match Question', 10);

        if (result.success && result.data && result.data.length > 0) {
          console.log('Match Question questions fetched from backend:', result.data.length);
          setQuestions(result.data);
          setError(null);
          return;
        }

        // Fallback: Use sample questions if backend fails or has no data
        console.warn('Backend fetch failed or no questions found, using sample questions');
        const sampleQuestions = [
          {
            Q_id: 'sample-match-1',
            questionText: "Match the countries with their capitals:",
            type: "Match Question",
            subject: "Geography",
            difficulty: "Medium",
            answers: [
              { id: 1, answer_text: "France → Paris", isCorrect: true },
              { id: 2, answer_text: "Italy → Rome", isCorrect: true },
              { id: 3, answer_text: "Spain → Madrid", isCorrect: true },
              { id: 4, answer_text: "Germany → Berlin", isCorrect: true }
            ]
          },
          {
            Q_id: 'sample-match-2',
            questionText: "Match the programming languages with their primary use:",
            type: "Match Question",
            subject: "Computer Science",
            difficulty: "Medium",
            answers: [
              { id: 1, answer_text: "JavaScript | Web Development", isCorrect: true },
              { id: 2, answer_text: "Python | Data Science", isCorrect: true },
              { id: 3, answer_text: "Java | Enterprise Applications", isCorrect: true },
              { id: 4, answer_text: "C++ | System Programming", isCorrect: true }
            ]
          },
          {
            Q_id: 'sample-match-3',
            questionText: "Match the mathematical operations with their symbols:",
            type: "Match Question",
            subject: "Mathematics",
            difficulty: "Easy",
            answers: [
              { id: 1, answer_text: "Addition: +", isCorrect: true },
              { id: 2, answer_text: "Subtraction: -", isCorrect: true },
              { id: 3, answer_text: "Multiplication: ×", isCorrect: true },
              { id: 4, answer_text: "Division: ÷", isCorrect: true }
            ]
          }
        ];

        console.log('Using sample match questions:', sampleQuestions.length);
        setQuestions(sampleQuestions);
        setError(null);
      } catch (err) {
        console.error('Unexpected error:', err);
        
        // Even if there's an error, provide sample questions
        const sampleQuestions = [
          {
            Q_id: 'fallback-match-1',
            questionText: "Match the animals with their habitats:",
            type: "Match Question",
            subject: "Biology",
            difficulty: "Easy",
            answers: [
              { id: 1, answer_text: "Fish → Ocean", isCorrect: true },
              { id: 2, answer_text: "Bear → Forest", isCorrect: true },
              { id: 3, answer_text: "Eagle → Sky", isCorrect: true },
              { id: 4, answer_text: "Camel → Desert", isCorrect: true }
            ]
          }
        ];
        
        setQuestions(sampleQuestions);
        setError('Using sample questions (backend unavailable)');
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
          <h2 className="text-xl font-semibold text-gray-800">
            Loading Match Questions...
          </h2>
          <p className="text-gray-600 mt-2">
            Please wait while we fetch your practice questions.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4 text-red-600">
            Error Loading Questions
          </h2>
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
