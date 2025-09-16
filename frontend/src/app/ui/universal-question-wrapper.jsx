// universal-question-wrapper.jsx

'use client';

import MathInputTemplate from '@/app/ui/math-keyboard/math-input-template';
import ProgressBar from '@/app/ui/progress-bar';
import KeyboardWrapper from '@/components/KeyboardWrapper';
import { showAchievementNotificationsWhenReady } from '@/utils/achievementNotifications';
import { submitQuestionAnswer } from '@/utils/api';
import { showAchievementWithFallback } from '@/utils/fallbackAchievementNotifications';
import { Heart, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

// Import all question type components
import ExpressionBuilderTemplate from '@/app/ui/question-types/expression-builder';
import MatchQuestionTemplate from '@/app/ui/question-types/match-question';
import MultipleChoiceTemplate from '@/app/ui/question-types/multiple-choice';
import OpenResponseTemplate from '@/app/ui/question-types/open-response';
import TrueFalseTemplate from '@/app/ui/question-types/true-false';

export default function UniversalQuestionWrapper({ questions, numLives = 5 }) {
  const { data: session } = useSession();
  const allQuestions = questions || [];
  const totalSteps = allQuestions.length;

  //  Safe initialization
  const [currQuestion, setCurrQuestion] = useState(allQuestions[0] || null);
  const [currAnswers, setCurrAnswers] = useState(currQuestion?.answers || []);
  const [currentStep, setCurrentStep] = useState(1);
  const [isDisabled, setIsDisabled] = useState(true);

  // Universal answer state - can handle any answer type
  const [answer, setAnswer] = useState(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [isValidExpression, setIsValidExpression] = useState(true);

  // Keyboard state management
  const [keyboardState, setKeyboardState] = useState({
    isCustomKeyboardActive: false,
    isNativeKeyboardVisible: false,
    shouldUseCustomKeyboard: false,
    shouldUseNativeKeyboard: false,
    isMobile: false,
    keyboardHeight: 0,
  });

  // Handle keyboard state changes
  const handleKeyboardStateChange = (newState) => {
    setKeyboardState(newState);
  };

  // Feedback state
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  //  Handle case where no questions are available
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

  //  Handle case where currQuestion is null
  if (!currQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-2xl text-gray-600">Loading question...</div>
        </div>
      </div>
    );
  }

  // Dynamic validation based on question type
  useEffect(() => {
    //  Safe access to question type
    if (!currQuestion || !currQuestion.type) {
      setIsDisabled(true);
      return;
    }

    let isValid = false;

    switch (currQuestion.type) {
      case 'Multiple Choice':
        isValid = answer !== null;
        break;
      case 'Math Input':
        isValid = answer && answer.trim() && isValidExpression;
        break;
      case 'Open Response':
        isValid = answer && answer.trim().length >= 10; // Minimum 10 characters
        break;
      case 'Expression Builder':
        isValid = answer && answer.length > 0; // Has at least some tiles
        break;
      case 'Fill-in-the-Blank':
      case 'Fill-in-the-Blanks':
        isValid =
          answer &&
          Object.keys(answer).length > 0 &&
          Object.values(answer).every((val) => val && val.trim());
        break;
      case 'Match Question':
      case 'Matching':
        isValid = answer && Object.keys(answer).length > 0;
        break;
      case 'True/False':
      case 'True-False':
        isValid = answer !== null && (answer === 'True' || answer === 'False');
        break;
      default:
        isValid = answer !== null;
    }

    setIsDisabled(!isValid);
  }, [answer, isValidExpression, currQuestion]);

  const submitAnswer = async () => {
    setIsSubmitting(true);
    setShowFeedback(false);

    try {
      // Get authenticated user ID with fallback to session
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      let userId = user.id;

      // Fallback to NextAuth session if no localStorage user
      if (!userId && session?.user?.id) {
        userId = session.user.id;
      }

      if (!userId) {
        console.error('❌ No authenticated user found');
        setFeedbackMessage('Please log in to continue');
        setShowFeedback(true);
        return;
      }

      const result = await submitQuestionAnswer({
        questionId: currQuestion.Q_id,
        userId: userId,
        userAnswer: answer,
        questionType: currQuestion.type,
        gameMode: 'practice',
      });

      if (result.success) {
        setFeedbackMessage(result.data.message);
        setShowFeedback(true);

        // 🎉 Handle achievement unlocks!
        if (
          result.data.unlockedAchievements &&
          result.data.unlockedAchievements.length > 0
        ) {
          // Try the main achievement system first, then fallback
          Promise.race([
            showAchievementNotificationsWhenReady(
              result.data.unlockedAchievements,
            ),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Timeout')), 3000),
            ),
          ])
            .then(() => {
              // Achievement notifications displayed successfully
            })
            .catch((error) => {
              console.error('❌ Main achievement system failed:', error);
              showAchievementWithFallback(result.data.unlockedAchievements);
            });
        }

        if (result.data.isCorrect && result.data.xpAwarded > 0) {
          // XP awarded
        }
      }

      setTimeout(() => {
        moveToNextQuestion();
      }, 2000);
    } catch (error) {
      console.error('Error submitting answer:', error);
      setFeedbackMessage('Failed to submit answer. Please try again.');
      setShowFeedback(true);

      // Don't move to next question on error
      setIsSubmitting(false);
      return;
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
    setAnswer(null);
    setIsAnswerCorrect(false);
    setIsValidExpression(true);
    setShowFeedback(false);
    setFeedbackMessage('');

    // ✅ Safe access to next question
    const nextQuestion = allQuestions[currentStep] || null;
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

  // Render the appropriate question type component
  const renderQuestionComponent = () => {
    // ✅ Safe access to question type
    if (!currQuestion || !currQuestion.type) {
      return (
        <div className="text-center p-8">
          <div className="text-gray-600">Loading question content...</div>
        </div>
      );
    }

    const commonProps = {
      question: currQuestion,
      answers: currAnswers,
      setAnswer,
      setIsAnswerCorrect,
      answer,
    };

    switch (currQuestion.type) {
      case 'Multiple Choice':
        return <MultipleChoiceTemplate {...commonProps} />;

      case 'Math Input':
        return (
          <MathInputTemplate
            correctAnswer={getCorrectAnswer()}
            setStudentAnswer={setAnswer}
            setIsAnswerCorrect={setIsAnswerCorrect}
            setIsValidExpression={setIsValidExpression}
            studentAnswer={answer || ''}
          />
        );

      case 'Open Response':
        return <OpenResponseTemplate {...commonProps} />;

      case 'Expression Builder':
        return <ExpressionBuilderTemplate {...commonProps} />;

      case 'Fill-in-the-Blank':
      case 'Fill-in-the-Blanks':
        return (
          <div className="text-center p-8">
            <p className="text-yellow-600 font-medium">
              Fill-in-the-blank questions are not yet implemented.
            </p>
          </div>
        );

      case 'Match Question':
      case 'Matching':
        return <MatchQuestionTemplate {...commonProps} />;

      case 'True/False':
      case 'True-False':
        return <TrueFalseTemplate {...commonProps} />;

      default:
        return (
          <div className="text-center p-8">
            <p className="text-red-600">
              Unsupported question type: {currQuestion.type}
            </p>
          </div>
        );
    }
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
            <span className="font-semibold text-lg">{numLives}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <KeyboardWrapper
        question={currQuestion}
        onKeyboardStateChange={handleKeyboardStateChange}
        className="pb-35 md:pb-50 pt-24"
      >
        {/* Mobile keyboard status indicator */}
        {keyboardState.isMobile && (
          <div className="px-4 mb-4">
            <div
              className={`text-xs text-center py-2 px-3 rounded-lg ${
                keyboardState.shouldUseCustomKeyboard
                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                  : keyboardState.shouldUseNativeKeyboard
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-gray-50 text-gray-700 border border-gray-200'
              }`}
            >
              {keyboardState.shouldUseCustomKeyboard
                ? '📱 Custom Keyboard Mode'
                : keyboardState.shouldUseNativeKeyboard
                  ? '⌨️ Native Keyboard Mode'
                  : '🔧 Keyboard Mode: Auto'}
              {keyboardState.isCustomKeyboardActive && ' (Active)'}
              {keyboardState.isNativeKeyboardVisible &&
                ` (H:${keyboardState.keyboardHeight}px)`}
            </div>
          </div>
        )}

        {/* Question Section */}
        <div className="">
          <h2 className="text-2xl font-bold text-center leading-relaxed">
            {currQuestion?.questionText || 'Loading question...'}
          </h2>
        </div>

        {/* Question Type Component */}
        <div className="px-4">{renderQuestionComponent()}</div>

        {/* Feedback Section */}
        {showFeedback && (
          <div className="animate-fade-in px-4">
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
      </KeyboardWrapper>

      {/* Submit Button */}
      <div
        className={`flex fixed left-0 w-full z-10 px-4 py-4 bg-[#201F1F] ${
          keyboardState.isMobile && keyboardState.isNativeKeyboardVisible
            ? 'bottom-0' // Position above native keyboard
            : 'bottom-0'
        }`}
        style={{
          bottom:
            keyboardState.isMobile && keyboardState.isNativeKeyboardVisible
              ? `${keyboardState.keyboardHeight}px`
              : '0px',
          transition: 'bottom 0.3s ease-in-out',
        }}
      >
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
    </div>
  );
}
