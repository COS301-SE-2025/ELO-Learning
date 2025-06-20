'use client';

import MathInputTemplate from '@/app/ui/math-keyboard/math-input-template';
import ProgressBar from '@/app/ui/progress-bar';
import { submitQuestionAnswer } from '@/utils/api';
import { Heart, X } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function MathKeyboardWrapper({ questions }) {
  // Remove frontend filtering since backend already filters
  const mathQuestions = questions;

  const totalSteps = mathQuestions.length;

  const [currQuestion, setCurrQuestion] = useState(mathQuestions[0]);
  const [currAnswers, setCurrAnswers] = useState(currQuestion?.answers || []);
  const [currentStep, setCurrentStep] = useState(1);
  const [isDisabled, setIsDisabled] = useState(true);

  // Math input specific states
  const [studentAnswer, setStudentAnswer] = useState('');
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [isValidExpression, setIsValidExpression] = useState(true);

  // Feedback state
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debug: Log state changes
  useEffect(() => {
    console.log('Student answer changed:', studentAnswer);
  }, [studentAnswer]);

  // Handle case where no math questions are available
  if (!mathQuestions || mathQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-900">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            No Math Questions Available
          </h2>
          <p className="text-gray-600 mb-6">
            There are currently no math input questions available for practice.
          </p>
          <Link
            href="/question-templates/multiple-choice"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Multiple Choice Instead
          </Link>
        </div>
      </div>
    );
  }

  // Enable/disable submit button based on math input validation
  useEffect(() => {
    setIsDisabled(!studentAnswer.trim() || !isValidExpression);
  }, [studentAnswer, isValidExpression]);

  const submitAnswer = async () => {
    setIsSubmitting(true);
    setShowFeedback(false);

    try {
      const result = await submitQuestionAnswer(
        currQuestion.Q_id,
        studentAnswer,
        'current-user-id',
      );

      if (result.success) {
        setFeedbackMessage(result.data.message);
        setShowFeedback(true);

        if (result.data.isCorrect && result.data.xpAwarded > 0) {
          console.log(`Awarded ${result.data.xpAwarded} XP!`);
        }
      }

      setTimeout(() => {
        moveToNextQuestion();
      }, 2000);
    } catch (error) {
      console.error('Error submitting math answer:', error);
      setFeedbackMessage('Error submitting answer. Please try again.');
      setShowFeedback(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const moveToNextQuestion = () => {
    if (currentStep >= totalSteps) {
      redirect('/dashboard');
      return;
    }

    setCurrentStep((prev) => prev + 1);
    setIsDisabled(true);
    setStudentAnswer('');
    setIsAnswerCorrect(false);
    setIsValidExpression(true);
    setShowFeedback(false);
    setFeedbackMessage('');

    const nextQuestion = mathQuestions[currentStep];
    setCurrQuestion(nextQuestion);
    setCurrAnswers(nextQuestion?.answers || []);
  };

  const getCorrectAnswer = () => {
    return (
      currQuestion.correctAnswer ||
      currAnswers.find((a) => a.isCorrect)?.answerText ||
      currAnswers.find((a) => a.isCorrect)?.answer_text ||
      ''
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 to-blue-900">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-300">
        <div className="flex items-center justify-between w-full py-4 px-4">
          <Link
            href="/practice"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-700" />
          </Link>

          <div className="flex-1 mx-4">
            <div className="text-sm text-gray-700 mb-1 text-center font-medium">
              Math Question {currentStep} of {totalSteps}
            </div>
            <ProgressBar progress={currentStep / totalSteps} />
          </div>

          <div className="flex items-center gap-2 text-pink-500">
            <Heart size={24} fill="#FF6E99" stroke="#FF6E99" />
            <span className="font-semibold text-lg">5</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Question Section */}
        <div className="bg-white rounded-xl shadow-xl p-8 border-2 border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 text-center leading-relaxed">
            {currQuestion.questionText}
          </h2>

          {/* Question metadata */}
          <div className="flex justify-center gap-3 mt-6">
            <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
              📚 {currQuestion.topic}
            </span>
            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
              🎯 {currQuestion.difficulty}
            </span>
            <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
              ⭐ {currQuestion.xpGain || 10} XP
            </span>
          </div>
        </div>

        {/* Math Input Section */}
        <div className="bg-white rounded-xl shadow-xl p-6 border-2 border-gray-200">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              🧮 Your Answer:
            </h3>
            <p className="text-gray-600">
              Use the keyboard below or type your mathematical expression
              directly
            </p>
          </div>

          <MathInputTemplate
            correctAnswer={getCorrectAnswer()}
            setStudentAnswer={setStudentAnswer}
            setIsAnswerCorrect={setIsAnswerCorrect}
            setIsValidExpression={setIsValidExpression}
            studentAnswer={studentAnswer}
          />
        </div>

        {/* Feedback Section */}
        {showFeedback && (
          <div className="animate-fade-in">
            <div
              className={`p-6 rounded-xl text-center font-bold text-lg shadow-xl border-2 ${
                feedbackMessage.includes('Correct') ||
                feedbackMessage.includes('Well done')
                  ? 'bg-green-50 text-green-800 border-green-300'
                  : 'bg-red-50 text-red-800 border-red-300'
              }`}
            >
              {feedbackMessage}
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="bg-white border-t-2 border-gray-300 p-6">
        <button
          type="button"
          disabled={isDisabled || isSubmitting}
          onClick={submitAnswer}
          className={`w-full px-6 py-4 rounded-xl font-bold text-xl transition-all duration-200 shadow-lg ${
            isDisabled || isSubmitting
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transform hover:scale-[1.02]'
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
              SUBMITTING...
            </div>
          ) : (
            'SUBMIT ANSWER'
          )}
        </button>

        {/* Status indicator */}
        <div className="mt-4 text-center">
          {isValidExpression && studentAnswer.trim() ? (
            <span className="text-green-600 font-semibold">
              ✅ Ready to submit!
            </span>
          ) : !studentAnswer.trim() ? (
            <span className="text-gray-600">
              Enter your mathematical expression above
            </span>
          ) : (
            <span className="text-red-600 font-semibold">
              ⚠️ Please check your expression format
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
