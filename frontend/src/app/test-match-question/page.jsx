// test-match-question.jsx - Test component with sample data
'use client';

import MatchQuestionTemplate from '@/app/ui/question-types/match-question';
import { useState } from 'react';

export default function TestMatchQuestion() {
  // Sample question data in various formats to test our parsing
  const sampleQuestions = [
    {
      Q_id: 'test-1',
      questionText: 'Match the countries with their capitals:',
      type: 'Match Question',
      answers: [
        'France → Paris',
        'Italy → Rome',
        'Spain → Madrid',
        'Germany → Berlin'
      ],
      correct_answer: ['France → Paris', 'Italy → Rome', 'Spain → Madrid', 'Germany → Berlin']
    },
    {
      Q_id: 'test-2', 
      questionText: 'Match programming languages with their use:',
      type: 'Match Question',
      answers: [
        'JavaScript | Web Development',
        'Python | Data Science',
        'Java | Enterprise Apps',
        'C++ | System Programming'
      ],
      correct_answer: ['JavaScript | Web Development', 'Python | Data Science', 'Java | Enterprise Apps', 'C++ | System Programming']
    },
    {
      Q_id: 'test-3',
      questionText: 'Match math operations with symbols:', 
      type: 'Match Question',
      answers: [
        'Addition: +',
        'Subtraction: -',
        'Multiplication: ×',
        'Division: ÷'
      ],
      correct_answer: ['Addition: +', 'Subtraction: -', 'Multiplication: ×', 'Division: ÷']
    }
  ];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);

  const currentQuestion = sampleQuestions[currentQuestionIndex];

  const handleNextQuestion = () => {
    if (currentQuestionIndex < sampleQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswers([]);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswers([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              🧪 Match Question Test Component
            </h1>
            <p className="text-gray-600">
              Testing the match question component with sample data in different formats
            </p>
            <div className="mt-4 text-sm text-gray-500">
              Question {currentQuestionIndex + 1} of {sampleQuestions.length}
            </div>
          </div>

          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-blue-800 mb-2">Current Question Data:</h3>
              <pre className="text-xs text-blue-700 overflow-x-auto">
                {JSON.stringify(currentQuestion, null, 2)}
              </pre>
            </div>
          </div>

          {/* The actual match question component */}
          <MatchQuestionTemplate
            question={currentQuestion}
            selectedAnswers={selectedAnswers}
            setSelectedAnswers={setSelectedAnswers}
            isSubmitted={false}
            feedbackMessage=""
          />

          {/* Navigation controls */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400"
            >
              ← Previous Question
            </button>
            
            <button
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === sampleQuestions.length - 1}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600"
            >
              Next Question →
            </button>
          </div>

          {/* Debug info */}
          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Debug Info:</h3>
            <div className="text-sm text-gray-600">
              <div><strong>Selected Answers:</strong> {JSON.stringify(selectedAnswers)}</div>
              <div><strong>Question Type:</strong> {currentQuestion.type}</div>
              <div><strong>Answers Count:</strong> {currentQuestion.answers?.length || 0}</div>
              <div><strong>Format:</strong> {
                currentQuestion.answers?.[0]?.includes('→') ? 'Arrow (→)' :
                currentQuestion.answers?.[0]?.includes('|') ? 'Pipe (|)' :
                currentQuestion.answers?.[0]?.includes(':') ? 'Colon (:)' : 'Unknown'
              }</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
