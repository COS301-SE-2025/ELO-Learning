'use client';

import MathInputTemplate from '@/app/ui/math-keyboard/math-input-template';
import ProgressBar from '@/app/ui/progress-bar';
import AchievementNotification from '@/app/ui/achievements/achievement-notification';
import { submitQuestionAnswer } from '@/utils/api';
import { Heart, X } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function MathKeyboardWrapper({ questions }) {
  // ✅ Add client-side mounting check to prevent SSR issues
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ During SSR or before mounting, show loading
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-2xl text-gray-600">Loading questions...</div>
        </div>
      </div>
    );
  }

  // ✅ Safe array handling
  const mathQuestions = questions || [];
  const totalSteps = mathQuestions.length;

  // ✅ Safe initialization with null check
  const [currQuestion, setCurrQuestion] = useState(mathQuestions[0] || null);
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

  // 🎉 Achievement notification state
  const [currentAchievement, setCurrentAchievement] = useState(null);
  const [showAchievementNotification, setShowAchievementNotification] =
    useState(false);
  const [achievementQueue, setAchievementQueue] = useState([]);

  // Debug: Log state changes
  useEffect(() => {
    console.log('Student answer changed:', studentAnswer);
  }, [studentAnswer]);

  // ✅ Handle case where no math questions are available
  if (!mathQuestions || mathQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="text-4xl mb-4">📝</div>
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

  // ✅ Handle case where currQuestion is null (safety check)
  if (!currQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-2xl text-gray-600">Loading question...</div>
        </div>
      </div>
    );
  }

  // Enable/disable submit button based on math input validation
  useEffect(() => {
    setIsDisabled(!studentAnswer.trim() || !isValidExpression);
  }, [studentAnswer, isValidExpression]);

  // 🎉 Handle multiple achievement notifications
  const showNextAchievement = () => {
    if (achievementQueue.length > 0) {
      const nextAchievement = achievementQueue[0];
      setCurrentAchievement(nextAchievement);
      setShowAchievementNotification(true);
      setAchievementQueue((prev) => prev.slice(1)); // Remove shown achievement from queue
    }
  };

  // 🎉 Handle achievement notification close
  const handleAchievementNotificationClose = () => {
    setShowAchievementNotification(false);
    setCurrentAchievement(null);

    // Show next achievement if any in queue
    setTimeout(() => {
      showNextAchievement();
    }, 500);
  };

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

        // 🎉 Handle achievement unlocks!
        if (
          result.data.unlockedAchievements &&
          result.data.unlockedAchievements.length > 0
        ) {
          console.log(
            '🏆 Achievements unlocked:',
            result.data.unlockedAchievements,
          );

          // Add achievements to queue and show first one
          setAchievementQueue(result.data.unlockedAchievements);
          setTimeout(() => {
            showNextAchievement();
          }, 1000); // Wait 1 second after feedback before showing achievement
        }

        // 🎯 Update user XP in localStorage
        if (result.data.newXP) {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          const updatedUser = { ...user, xp: result.data.newXP };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          console.log(`💰 XP updated: ${result.data.newXP}`);
        }

        if (result.data.isCorrect && result.data.xpAwarded > 0) {
          console.log(`Awarded ${result.data.xpAwarded} XP!`);
        }
      } else {
        setFeedbackMessage(result.error || 'Error submitting answer');
        setShowFeedback(true);
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

    // ✅ Safe access to next question
    const nextQuestion = mathQuestions[currentStep] || null;
    setCurrQuestion(nextQuestion);
    setCurrAnswers(nextQuestion?.answers || []);
  };

  const getCorrectAnswer = () => {
    return (
      currQuestion?.correctAnswer ||
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
        <div className="p-8">
          <h2 className="text-2xl font-bold text-center leading-relaxed">
            {currQuestion?.questionText || 'Loading question...'}
          </h2>
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
        </div>
      </div>

      {/* 🎉 Achievement Notification */}
      <AchievementNotification
        achievement={currentAchievement}
        show={showAchievementNotification}
        onClose={handleAchievementNotificationClose}
        duration={4000}
      />
    </div>
  );
}