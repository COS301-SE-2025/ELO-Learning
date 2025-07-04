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
      <div className="min-h-screen flex items-center justify-center ">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4">
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
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full z-20 bg-[#201F1F]">
        <div className="flex items-center justify-between w-full py-4 px-4 max-w-4xl mx-auto">
          <Link href="/practice" className="p-2">
            <X size={24} />
          </Link>

          <div className="flex-1 mx-4">
            {/* <div className="text-sm text-gray-700 mb-1 text-center font-medium">
              Math Question {currentStep} of {totalSteps}
            </div> */}
            <ProgressBar progress={currentStep / totalSteps} />
          </div>

          <div className="flex items-center gap-2">
            <Heart size={24} fill="#FF6E99" stroke="#FF6E99" />
            <span className="font-semibold text-lg">5</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-11 pb-35 md:pb-50 pt-24 max-w-4xl mx-auto">
        {/* Question Section */}
        <div className=" p-8 ">
          <h2 className="text-2xl font-bold text-center leading-relaxed">
            {currQuestion.questionText}
          </h2>

          {/* Question metadata */}
          {/* <div className="flex justify-center gap-3 mt-6">
            <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
              📚 {currQuestion.topic}
            </span>
            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
              🎯 {currQuestion.difficulty}
            </span>
            <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
              ⭐ {currQuestion.xpGain || 10} XP
            </span>
          </div> */}
        </div>

        {/* Math Input Section */}
        <div className="">
          <div className="mb-4">
            <p className="">
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
      <div className="flex fixed bottom-0 left-0 w-full z-10 px-4 py-4 bg-[#201F1F]">
        <div className="flex flex-col justify-center md:m-auto max-w-2xl mx-auto">
          <button
            type="button"
            disabled={isDisabled || isSubmitting}
            onClick={submitAnswer}
            className={`w-full md:m-auto ${
              isDisabled || isSubmitting ? 'disabled_button' : 'main-button'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="w-6 h-6 border-3 rounded-full animate-spin mr-3"></div>
                SUBMITTING...
              </div>
            ) : (
              'SUBMIT'
            )}
          </button>
          {/* Status indicator */}
          {/* <div className="mt-4 text-center">
            {isValidExpression && studentAnswer.trim() ? (
              <span className="text-green-600 font-semibold">
                Ready to submit!
              </span>
            ) : !studentAnswer.trim() ? (
              <span className="text-[#696969]">
                Enter your mathematical expression above
              </span>
            ) : (
              <span className="text-red-600 font-semibold">
                Please check your expression format
              </span>
            )}
          </div> */}
        </div>
      </div>
    </div>
  );
}
