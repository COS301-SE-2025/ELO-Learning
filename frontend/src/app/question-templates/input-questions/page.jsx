'use client';
import MathKeyboardWrapper from '@/app/ui/math-keyboard/client-wrapper';
import { getQuestionsByType } from '@/utils/api';
import { useEffect, useState } from 'react';

export default function Page() {
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getQuestionsByType('Math Input').then((result) => {
      if (!result.success) {
        setError(result.error);
        setQuestions([]);
      } else {
        setQuestions(result.data || []);
        setError(null);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="full-screen w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl text-gray-600 mb-4">
            Loading questions...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="full-screen w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl text-red-600 mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Error Loading Questions
          </h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="full-screen w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📝</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            No Questions Available
          </h2>
          <p className="text-gray-600">
            No Math Input questions found in the database.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="full-screen w-full h-full flex flex-col justify-between">
      <MathKeyboardWrapper questions={questions} />
    </div>
  );
}
