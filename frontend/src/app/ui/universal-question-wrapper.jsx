// universal-question-wrapper.jsx

'use client';


import MathInputTemplate from '@/app/ui/math-keyboard/math-input-template';
import ProgressBar from '@/app/ui/progress-bar';
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
import FillInBlankTemplate from '@/app/ui/question-types/fill-in-blank';
import MatchQuestionTemplate from '@/app/ui/question-types/match-question';
import MultipleChoiceTemplate from '@/app/ui/question-types/multiple-choice';
import OpenResponseTemplate from '@/app/ui/question-types/open-response';
import TrueFalseTemplate from '@/app/ui/question-types/true-false';

export default function UniversalQuestionWrapper({ questions, numLives = 5 }) {
  const { data: session } = useSession(); 
  const allQuestions = questions || [];
  const totalSteps = allQuestions.length;

  console.log('🔥 UniversalQuestionWrapper - Received questions:', allQuestions);
  console.log('🔥 UniversalQuestionWrapper - Total questions:', totalSteps);

  //  Safe initialization
  const [currQuestion, setCurrQuestion] = useState(allQuestions[0] || null);
  const [currAnswers, setCurrAnswers] = useState(currQuestion?.answers || []);
  const [currentStep, setCurrentStep] = useState(1);
  const [isDisabled, setIsDisabled] = useState(true);

  //  Debug logging
  console.log('UniversalQuestionWrapper - currQuestion:', currQuestion);
  console.log(
    'UniversalQuestionWrapper - currQuestion.type:',
    currQuestion?.type,
  );
  console.log('UniversalQuestionWrapper - currAnswers:', currAnswers);

  // Universal answer state - can handle any answer type
  const [answer, setAnswer] = useState(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [isValidExpression, setIsValidExpression] = useState(true);

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
        console.log('🔍 Using userId from NextAuth session:', userId);
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

      console.log('🔍 REAL GAME DEBUG - Full API response:', result);
      console.log('🔍 REAL GAME DEBUG - Result success:', result.success);
      console.log('🔍 REAL GAME DEBUG - Result data:', result.data);

      if (result.success) {
        setFeedbackMessage(result.data.message);
        setShowFeedback(true);

        console.log('🔍 REAL GAME DEBUG - Checking for achievements in result.data...');
        console.log('🔍 REAL GAME DEBUG - unlockedAchievements exists:', !!result.data.unlockedAchievements);
        console.log('🔍 REAL GAME DEBUG - unlockedAchievements type:', typeof result.data.unlockedAchievements);
        console.log('🔍 REAL GAME DEBUG - unlockedAchievements value:', result.data.unlockedAchievements);

        // 🎉 Handle achievement unlocks!
        if (
          result.data.unlockedAchievements &&
          result.data.unlockedAchievements.length > 0
        ) {
          console.log(
            '🏆 Achievements unlocked:',
            result.data.unlockedAchievements,
          );

          // Try the main achievement system first, then fallback
          Promise.race([
            showAchievementNotificationsWhenReady(result.data.unlockedAchievements),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
          ])
          .then(() => {
            console.log('✅ Achievement notifications displayed successfully');
          })
          .catch(error => {
            console.error('❌ Main achievement system failed:', error);
            console.log('🔄 Using fallback notification system...');
            showAchievementWithFallback(result.data.unlockedAchievements);
          });
        } else {
          console.log('🤷 No achievements unlocked this time');
        }

        if (result.data.isCorrect && result.data.xpAwarded > 0) {
          console.log(`Awarded ${result.data.xpAwarded} XP!`);
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
        return <FillInBlankTemplate {...commonProps} />;

      case 'Match Question':
      case 'Matching':
        console.log('🔥 UniversalQuestionWrapper - Rendering MatchQuestionTemplate!', currQuestion);
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
      <div className="space-y-8 pb-35 md:pb-50 pt-24 max-w-4xl mx-auto px-4">
        {/* Question Section */}
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
              {currQuestion?.type || 'Loading...'}
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
              Question {currentStep} of {totalSteps}
            </span>
          </div>

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
    </div>
  );
}
