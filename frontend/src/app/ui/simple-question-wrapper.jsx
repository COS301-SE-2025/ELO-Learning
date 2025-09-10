'use client';

import { Heart, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import AnswerWrapper from '@/app/ui/answers/answer-wrapper';
import ProgressBar from '@/app/ui/progress-bar';
import QuestionTemplate from '@/app/ui/question-template';

export default function SimpleQuestionWrapper({ questions }) {
  const router = useRouter();

  // ✅ Safe array handling
  const allQuestions = questions || [];
  const totalSteps = allQuestions.length;

  // ✅ Safe initialization
  const [currQuestion, setCurrQuestion] = useState(allQuestions[0] || null);
  const [currAnswers, setCurrAnswers] = useState(currQuestion?.answers || []);
  const [currentStep, setCurrentStep] = useState(1);
  const [isDisabled, setIsDisabled] = useState(true);
  const [answer, setAnswer] = useState('');
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [isValidExpression, setIsValidExpression] = useState(true);
  const [numLives, setNumLives] = useState(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('lives') || '5');
    }
    return 5;
  }); // Add lives system

  // Feedback state
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Listen for life loss events from match questions
  useEffect(() => {
    const handleLifeLost = (event) => {
      console.log('🎮 Life lost event received:', event.detail);
      setNumLives(event.detail.newLives);

      // Show feedback for life loss
      setShowFeedback(true);
      setFeedbackMessage(`💔 Life Lost: ${event.detail.reason}`);

      // Auto-hide feedback after 3 seconds
      setTimeout(() => {
        setShowFeedback(false);
        setFeedbackMessage('');
      }, 3000);
    };

    window.addEventListener('lifeLost', handleLifeLost);

    return () => {
      window.removeEventListener('lifeLost', handleLifeLost);
    };
  }, []);

  // ✅ Handle case where no questions are available
  if (!allQuestions || allQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="text-4xl mb-4">📝</div>
          <h2 className="text-2xl font-bold mb-4">No Questions Available</h2>
          <p className="text-gray-600 mb-6">
            There are currently no questions available for practice.
          </p>
          <Link
            href="/practice"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Practice
          </Link>
        </div>
      </div>
    );
  }

  // ✅ Handle case where currQuestion is null
  if (!currQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-2xl text-gray-600">Loading question...</div>
        </div>
      </div>
    );
  }

  // ✅ Handle game over
  if (numLives <= 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="text-4xl mb-4">💔</div>
          <h2 className="text-2xl font-bold mb-4 text-red-600">Game Over!</h2>
          <p className="text-gray-600 mb-6">
            You've run out of lives. Don't worry, practice makes perfect!
          </p>
          <Link
            href="/practice"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  // Dynamic validation based on question type
  useEffect(() => {
    if (!currQuestion || !currQuestion.type) {
      setIsDisabled(true);
      return;
    }

    let isValid = false;

    switch (currQuestion.type) {
      case 'Multiple Choice':
      case 'True/False':
      case 'True-False':
        isValid = answer !== null && answer !== '';
        break;
      case 'Math Input':
        isValid = answer && answer.trim() && isValidExpression;
        break;
      case 'Open Response':
        isValid = answer && answer.trim().length > 0;
        break;
      case 'Expression Builder':
        isValid = answer && answer.trim() && isValidExpression;
        break;
      case 'Fill-in-the-Blank':
      case 'Fill-in-the-Blanks':
        isValid = answer && answer.trim().length > 0;
        break;
      case 'Match Question':
      case 'Matching':
        isValid = answer !== null && answer !== '';
        break;
      default:
        isValid = answer && answer.trim().length > 0;
    }

    setIsDisabled(!isValid);
  }, [answer, isValidExpression, currQuestion]);

  const moveToNextQuestion = () => {
    // Check if there's an incomplete match question before moving on
    if (typeof window.checkMatchQuestionCompletion === 'function') {
      window.checkMatchQuestionCompletion();
    }

    if (currentStep >= allQuestions.length) {
      console.log('🏁 Quiz completed!');
      handleQuizComplete();
      return;
    }

    setCurrentStep((prev) => prev + 1);
    setIsDisabled(true);
    setAnswer('');
    setIsAnswerCorrect(false);
    setIsValidExpression(true);
    setShowFeedback(false);
    setFeedbackMessage('');

    // ✅ Safe access to next question
    const nextQuestion = allQuestions[currentStep] || null;
    setCurrQuestion(nextQuestion);
    setCurrAnswers(nextQuestion?.answers || []);
  };

  const submitAnswer = () => {
    // Prevent double submission
    if (showFeedback) {
      return;
    }

    // Deduct life if answer is wrong
    if (!isAnswerCorrect) {
      setNumLives((prev) => {
        const newLives = prev - 1;

        // Update localStorage to keep it in sync (SSR-safe)
        if (typeof window !== 'undefined') {
          localStorage.setItem('lives', newLives.toString());
        }

        if (newLives <= 0) {
          // Game over - redirect to practice menu
          setTimeout(() => {
            router.push('/practice');
          }, 2500);
        }
        return newLives;
      });
    }

    setShowFeedback(true);
    setFeedbackMessage(
      isAnswerCorrect
        ? '🎉 Correct! Well done!'
        : '❌ Not quite right. Keep practicing!',
    );

    // Auto-advance after 2 seconds (or show game over message)
    setTimeout(() => {
      if (numLives > 1 || isAnswerCorrect) {
        moveToNextQuestion();
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full z-20 bg-[#201F1F]">
        <div className="flex items-center justify-between w-full py-4 px-4 max-w-4xl mx-auto">
          <Link href="/practice" className="p-2">
            <X size={24} className="text-white" />
          </Link>

          <div className="flex-1 mx-4">
            <ProgressBar progress={currentStep / totalSteps} />
          </div>

          <div className="flex items-center gap-2 text-white">
            <Heart size={24} fill="#FF6E99" stroke="#FF6E99" />
            <span className="font-semibold text-lg">{numLives}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-8 pb-35 md:pb-50 pt-24 max-w-4xl mx-auto px-4">
        {/* Question Section */}
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
              Question {currentStep} of {totalSteps}
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
              {currQuestion.type}
            </span>
          </div>

          <QuestionTemplate
            question={currQuestion?.questionText || 'Loading...'}
          />
        </div>

        {/* Answer Section */}
        <div className="px-8">
          <AnswerWrapper
            question={currQuestion}
            currAnswers={currAnswers}
            setAnswer={setAnswer}
            answer={answer}
            setIsAnswerCorrect={setIsAnswerCorrect}
            setIsValidExpression={setIsValidExpression}
          />
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div className="px-8">
            <div
              className={`p-4 rounded-lg text-center font-semibold ${
                isAnswerCorrect
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : 'bg-red-100 text-red-800 border border-red-300'
              }`}
            >
              {feedbackMessage}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 w-full z-20 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto p-4">
          <button
            onClick={submitAnswer}
            disabled={isDisabled || showFeedback}
            className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${
              isDisabled || showFeedback
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#7D32CE] text-white hover:bg-[#6B2BA6] shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
            }`}
          >
            {showFeedback ? 'Processing...' : 'Submit Answer'}
          </button>
        </div>
      </div>
    </div>
  );
}
