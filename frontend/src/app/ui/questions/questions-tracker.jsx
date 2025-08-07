'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import AnswerWrapper from '@/app/ui/answers/answer-wrapper';
import QuestionTemplate from '@/app/ui/question-template';
import QuestionFooter from '@/app/ui/questions/question-footer';
import QuestionHeader from '@/app/ui/questions/question-header';
import { validateAnswerEnhanced } from '@/utils/answerValidator';
import { submitQuestionAnswer } from '@/utils/api';

export default function QuestionsTracker({ questions, lives, mode }) {
  const router = useRouter();
  const { data: session } = useSession();

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
  const [numLives, setNumLives] = useState(lives || 5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  // ✅ Early return if no questions
  if (!allQuestions || allQuestions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8">
          <div className="text-4xl mb-4">📝</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            No Questions Available
          </h2>
          <p className="text-gray-600">
            No questions found for this practice session.
          </p>
        </div>
      </div>
    );
  }

  // ✅ Handle case where current question is null
  if (!currQuestion) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8">
          <div className="text-2xl text-gray-600">Loading question...</div>
        </div>
      </div>
    );
  }

  //Effects
  useEffect(() => {
    if (answer) {
      setIsDisabled(false);
    }
  }, [answer]);

  // Set start time when question changes
  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currQuestion]);

  const setLocalStorage = async (validationResult = null) => {
    // Calculate time elapsed in seconds
    const timeElapsed = Math.round((Date.now() - questionStartTime) / 1000);

    const questionsObj = JSON.parse(
      localStorage.getItem('questionsObj') || '[]',
    );

    // Find the correct answer
    const correctAnswerObj = currAnswers.find((ans) => ans.isCorrect === true);
    const correctAnswerText = correctAnswerObj?.answer_text || correctAnswerObj;

    // Use provided validation result or re-validate
    const finalValidationResult =
      validationResult !== null
        ? validationResult
        : await validateAnswerEnhanced(
            answer,
            correctAnswerText,
            currQuestion?.questionText || '',
            currQuestion?.type || 'Math Input',
          );

    console.log('💾 Storing question with validation:', {
      studentAnswer: answer,
      correctAnswer: correctAnswerText,
      oldIsCorrect: isAnswerCorrect,
      newIsCorrect: finalValidationResult,
      questionText: currQuestion?.questionText?.substring(0, 50) + '...',
    });

    questionsObj.push({
      question: currQuestion,
      q_index: currentStep,
      answer: answer,
      isCorrect: finalValidationResult, // Use final validation result
      actualAnswer: correctAnswerObj,
      timeElapsed: timeElapsed,
    });

    localStorage.setItem('questionsObj', JSON.stringify(questionsObj));
  };

  const handleLives = (validationResult) => {
    // Use the passed validation result instead of the old state
    if (!validationResult) {
      setNumLives((prev) => prev - 1);
      if (numLives <= 1) {
        router.push(`/end-screen?mode=${mode}`);
        return true;
      }
    }
    return false;
  };

  const handleQuizComplete = () => {
    router.push(`/end-screen?mode=${mode}`);
  };

  const submitAnswer = async () => {
    setIsSubmitting(true);

    try {
      // Get authenticated user ID with better debugging
      const userString = localStorage.getItem('user');
      console.log('🔍 Raw user string from localStorage:', userString);
      
      const user = JSON.parse(userString || '{}');
      console.log('🔍 Parsed user object:', user);
      
      let userId = user.id;
      console.log('🔍 Extracted userId from localStorage:', userId);
      
      // Fallback to NextAuth session if no localStorage user
      if (!userId && session?.user?.id) {
        userId = session.user.id;
        console.log('🔍 Using userId from NextAuth session:', userId);
      }
      
      if (!userId) {
        console.error('❌ No authenticated user found');
        console.log('🔍 Available localStorage keys:', Object.keys(localStorage));
        console.log('🔍 User object keys:', Object.keys(user));
        console.log('🔍 Session data:', session);
        
        // Try to get user from token as another fallback
        if (typeof window !== 'undefined' && window.localStorage) {
          const token = localStorage.getItem('token');
          console.log('🔍 Available token:', token ? 'Found' : 'Not found');
        }
        
        throw new Error('User not authenticated - Please log in to continue');
      }

      // Call the API to submit the answer and check for achievements
      const result = await submitQuestionAnswer(
        currQuestion.Q_id,
        answer,
        userId,
        currQuestion.type,
      );

      // Get fresh validation result for consistent behavior
      const correctAnswerObj = currAnswers.find(
        (ans) => ans.isCorrect === true,
      );
      const correctAnswerText =
        correctAnswerObj?.answer_text || correctAnswerObj;

      const freshValidationResult = result.success
        ? result.data.isCorrect
        : await validateAnswerEnhanced(
            answer,
            correctAnswerText,
            currQuestion?.questionText || '',
            currQuestion?.type || 'Math Input',
          );

      console.log('🔄 API + validation result:', {
        studentAnswer: answer,
        correctAnswer: correctAnswerText,
        apiResult: result.success ? result.data.isCorrect : 'API failed',
        localValidation: freshValidationResult,
      });

      // 🎉 Handle achievement unlocks from API response!
      if (
        result.success &&
        result.data.unlockedAchievements &&
        result.data.unlockedAchievements.length > 0
      ) {
        console.log(
          '🏆 Practice achievements unlocked:',
          result.data.unlockedAchievements,
        );

        // Enhanced notification system with retry logic
        const showAchievementNotifications = (attempts = 0) => {
          if (typeof window !== 'undefined' && window.showMultipleAchievements) {
            try {
              window.showMultipleAchievements(result.data.unlockedAchievements);
              console.log('✅ Achievement notifications displayed successfully');
            } catch (notificationError) {
              console.error('❌ Error displaying achievement notifications:', notificationError);
              
              // Retry once after a short delay
              if (attempts < 1) {
                setTimeout(() => showAchievementNotifications(attempts + 1), 500);
              }
            }
          } else {
            console.error('❌ Achievement notification system not ready');
            console.log('Available window methods:', Object.keys(window).filter(k => k.includes('Achievement')));
            
            // Listen for the system ready event if it hasn't fired yet
            if (attempts === 0) {
              window.addEventListener('achievementSystemReady', () => {
                showAchievementNotifications(1);
              }, { once: true });
            }
            
            // Retry if system not ready and we haven't exceeded attempts
            if (attempts < 5) { // Increased retry attempts
              setTimeout(() => showAchievementNotifications(attempts + 1), 1000);
            } else {
              console.error('❌ Achievement notification system failed after 5 attempts');
            }
          }
        };

        // Initial attempt with 1 second delay
        setTimeout(() => showAchievementNotifications(), 1000);
      } else {
        console.log('ℹ️  No achievements unlocked for this practice question');
        if (!result.success) {
          console.warn('⚠️  API call was not successful:', result);
        }
      }

      await setLocalStorage(freshValidationResult);
      const gameOver = handleLives(freshValidationResult);

      if (gameOver) {
        return;
      }

      // Increment the current step and reset states
      setCurrentStep((prev) => prev + 1);
      setIsDisabled(true);
      setAnswer('');
      setIsAnswerCorrect(false);

      if (currentStep >= allQuestions.length) {
        handleQuizComplete();
        return;
      }

      // ✅ Safe access to next question
      const nextQuestion = allQuestions[currentStep] || null;
      setCurrQuestion(nextQuestion);
      setCurrAnswers(nextQuestion?.answers || []);
    } catch (error) {
      console.error('Error submitting answer to API:', error);

      // Fallback to local validation if API fails
      const correctAnswerObj = currAnswers.find(
        (ans) => ans.isCorrect === true,
      );
      const correctAnswerText =
        correctAnswerObj?.answer_text || correctAnswerObj;

      const freshValidationResult = await validateAnswerEnhanced(
        answer,
        correctAnswerText,
        currQuestion?.questionText || '',
        currQuestion?.type || 'Math Input',
      );

      await setLocalStorage(freshValidationResult);
      const gameOver = handleLives(freshValidationResult);

      if (gameOver) {
        return;
      }

      // Continue with local flow
      setCurrentStep((prev) => prev + 1);
      setIsDisabled(true);
      setAnswer('');
      setIsAnswerCorrect(false);

      if (currentStep >= allQuestions.length) {
        handleQuizComplete();
        return;
      }

      const nextQuestion = allQuestions[currentStep] || null;
      setCurrQuestion(nextQuestion);
      setCurrAnswers(nextQuestion?.answers || []);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        <QuestionHeader
          currentStep={currentStep}
          totalSteps={totalSteps}
          numLives={numLives}
        />
        <div>
          <QuestionTemplate
            question={currQuestion?.questionText || 'Loading...'}
          />
        </div>
        <div>
          <AnswerWrapper
            question={currQuestion}
            currAnswers={currAnswers}
            setAnswer={setAnswer}
            answer={answer}
            setIsAnswerCorrect={setIsAnswerCorrect}
          />
        </div>
      </div>
      <div>
        <QuestionFooter
          isDisabled={isDisabled}
          isSubmitting={isSubmitting}
          submitAnswer={submitAnswer}
        />
      </div>
    </div>
  );
}
