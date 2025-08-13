'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import AnswerWrapper from '@/app/ui/answers/answer-wrapper';
import QuestionTemplate from '@/app/ui/question-template';
import QuestionFooter from '@/app/ui/questions/question-footer';
import QuestionHeader from '@/app/ui/questions/question-header';
import { showAchievementNotificationsWhenReady } from '@/utils/achievementNotifications';
import { validateAnswerEnhanced } from '@/utils/answerValidator';
import { submitQuestionAnswer } from '@/utils/api';
import { resetXPCalculationState } from '@/utils/gameSession';

export default function QuestionsTracker({
  questions,
  lives,
  mode,
  resetXPState,
}) {
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
  const [numLives, setNumLives] = useState(() => {
    // Reset lives to 5 and clear localStorage (only in browser)
    if (typeof window !== 'undefined') {
      localStorage.setItem('lives', '5');
    }
    return 5;
  });
  
  // Track question attempts for "Never Give Up" achievement
  const [questionAttempts, setQuestionAttempts] = useState({});

  // Listen for life loss events from match questions
  useEffect(() => {
    const handleMatchLifeLost = (event) => {
      const newLives = Math.max(0, event.detail.newLives);
      setNumLives(newLives);
      if (typeof window !== 'undefined') {
        localStorage.setItem('lives', newLives.toString());
      }
    };

    window.addEventListener('lifeLost', handleMatchLifeLost);
    
    return () => {
      window.removeEventListener('lifeLost', handleMatchLifeLost);
    };
  }, []);
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

  // Reset XP calculation state for new game session
  useEffect(() => {
    if (resetXPState) {
      const success = resetXPCalculationState();
      if (success) {
        setQuestionAttempts({});
      }
    }
  }, [resetXPState]);

  // Handle navigation when lives reach 0
  useEffect(() => {
    if (numLives <= 0) {
      router.push(`/end-screen?mode=${mode}`);
    }
  }, [numLives, mode, router]);

  const setLocalStorage = async (finalValidationResult) => {
    // Only proceed if we're in the browser
    if (typeof window === 'undefined') return;
    
    // Calculate time elapsed in seconds
    const timeElapsed = Math.round((Date.now() - questionStartTime) / 1000);

    const questionsObj = JSON.parse(
      localStorage.getItem('questionsObj') || '[]',
    );

    // Get ALL correct answers, not just the first one
    const correctAnswers = currAnswers
      .filter((answer) => answer.isCorrect)
      .map((answer) => answer.answer_text || answer.answerText)
      .filter(Boolean);

    // Check if student answer matches ANY of the correct answers
    let revalidatedResult = false;
    let matchedAnswer = null;
    let correctAnswerObj = null;

    for (const correctAnswer of correctAnswers) {
      const individualResult = await validateAnswerEnhanced(
        answer,
        correctAnswer,
        currQuestion?.questionText || '',
        currQuestion?.type || 'Math Input',
      );

      if (individualResult) {
        revalidatedResult = true;
        matchedAnswer = correctAnswer;
        // Find the original answer object for this matched answer
        correctAnswerObj = currAnswers.find(ans => 
          (ans.answer_text || ans.answerText) === correctAnswer
        );
        break; // Found a match, no need to check further
      }
    }

    // If no match found, use the first correct answer as fallback for storage
    if (!correctAnswerObj) {
      correctAnswerObj = currAnswers.find((ans) => ans.isCorrect === true);
    }

    questionsObj.push({
      question: currQuestion,
      q_index: currentStep,
      answer: answer,
      isCorrect: finalValidationResult,
      actualAnswer: correctAnswerObj,
      timeElapsed: timeElapsed,
    });

    localStorage.setItem('questionsObj', JSON.stringify(questionsObj));
  };

  const handleLives = (validationResult) => {
    // Use the passed validation result instead of the old state
    if (!validationResult) {
      setNumLives((prev) => {
        const newLives = Math.max(0, prev - 1);
        if (typeof window !== 'undefined') {
          localStorage.setItem('lives', newLives.toString());
        }
        return newLives;
      });
      
      if (numLives <= 1) {
        return true; // Game over
      }
    }
    return false;
  };

  const handleQuizComplete = () => {
    // Check for Perfect Session achievement before navigating
    checkPerfectSessionAchievement();
    
    // Check for Speed Solver achievement before navigating
    checkSpeedSolverAchievement();
    
    // Use setTimeout to ensure navigation happens after current render cycle
    setTimeout(() => {
      router.push(`/end-screen?mode=${mode}`);
    }, 0);
  };

  const checkPerfectSessionAchievement = async () => {
    try {
      const questionsObj = JSON.parse(localStorage.getItem('questionsObj') || '[]');
      
      if (questionsObj.length < 10) {
        return;
      }

      // Check for 10 consecutive correct answers
      let consecutiveCorrect = 0;
      let maxConsecutive = 0;
      
      for (const questionObj of questionsObj) {
        if (questionObj.isCorrect) {
          consecutiveCorrect++;
          maxConsecutive = Math.max(maxConsecutive, consecutiveCorrect);
        } else {
          consecutiveCorrect = 0;
        }
      }

      // If achieved 10 consecutive correct answers, trigger achievement
      if (maxConsecutive >= 10) {
        const userId = session?.user?.id;
        if (!userId) {
          return;
        }
        
        // Call achievement endpoint
        const response = await fetch('/api/achievements/trigger', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,
            achievementType: 'Perfect Session',
            context: {
              consecutiveCorrect: maxConsecutive,
              totalQuestions: questionsObj.length,
              mode: mode
            }
          }),
        });

        if (response.ok) {
          const result = await response.json();
          
          // Show achievement notification if unlocked
          if (result.unlockedAchievements && result.unlockedAchievements.length > 0) {
            showAchievementNotificationsWhenReady(result.unlockedAchievements)
              .catch(error => console.error('Failed to show Perfect Session achievement:', error));
          }
        }
      }
    } catch (error) {
      console.error('Error checking Perfect Session achievement:', error);
    }
  };

  const checkSpeedSolverAchievement = async () => {
    try {
      const userId = session?.user?.id;
      if (!userId) {
        return;
      }

      const questionsObj = JSON.parse(localStorage.getItem('questionsObj') || '[]');
      
      if (questionsObj.length < 5) {
        return;
      }

      // Calculate speed statistics for correct answers only
      const correctAnswers = questionsObj.filter(q => q.isCorrect === true);
      
      if (correctAnswers.length < 5) {
        return;
      }

      // Calculate average time for correct answers
      const totalTime = correctAnswers.reduce((sum, q) => {
        return sum + (q.timeElapsed || 30);
      }, 0);

      const averageTime = totalTime / correctAnswers.length;
      const correctCount = correctAnswers.length;

      // Only check if average time is reasonably fast (under 15 seconds)
      if (averageTime <= 15) {
        // Call Speed Solver achievement endpoint
        const response = await fetch(`/api/achievements/users/${userId}/achievements/speed-solver`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            averageTime,
            correctCount,
            sessionData: {
              totalQuestions: questionsObj.length,
              mode: mode,
              correctAnswers: correctAnswers.length
            }
          }),
        });

        if (response.ok) {
          const result = await response.json();
          
          // Show achievement notification if unlocked
          if (result.unlockedAchievements && result.unlockedAchievements.length > 0) {
            showAchievementNotificationsWhenReady(result.unlockedAchievements)
              .catch(error => console.error('Failed to show Speed Solver achievement:', error));
          }
        }
      }
    } catch (error) {
      console.error('Error checking Speed Solver achievement:', error);
    }
  };

  const checkNeverGiveUpAchievement = async (questionId, isCorrect, attemptNumber) => {
    try {
      const userId = session?.user?.id;
      if (!userId) {
        return;
      }

      const response = await fetch(`/api/achievements/users/${userId}/achievements/never-give-up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId,
          isCorrect,
          attemptNumber
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Show achievement notification if unlocked
        if (data.unlockedAchievements && data.unlockedAchievements.length > 0) {
          showAchievementNotificationsWhenReady(data.unlockedAchievements)
            .catch(error => console.error('Failed to show Never Give Up achievement:', error));
        }
      }
    } catch (error) {
      console.error('Error checking Never Give Up achievement:', error);
    }
  };

  const submitAnswer = async () => {
    setIsSubmitting(true);

    try {
      // Get ALL correct answers, not just the first one
      const correctAnswers = currAnswers
        .filter((answer) => answer.isCorrect)
        .map((answer) => answer.answer_text || answer.answerText)
        .filter(Boolean);

      // Check if student answer matches ANY of the correct answers
      let freshValidationResult = false;
      let matchedAnswer = null;

      for (const correctAnswer of correctAnswers) {
        const individualResult = await validateAnswerEnhanced(
          answer,
          correctAnswer,
          currQuestion?.questionText || '',
          currQuestion?.type || 'Math Input',
        );

        if (individualResult) {
          freshValidationResult = true;
          matchedAnswer = correctAnswer;
          break; // Found a match, no need to check further
        }
      }

      // Validate user session before submitting
      if (!session?.user?.id) {
        console.warn('No user session found, skipping achievement checks');
      }

      // Submit to API
      const result = await submitQuestionAnswer({
        userId: session?.user?.id,
        questionId: currQuestion?.Q_id || currQuestion?.id,
        userAnswer: answer,
        isCorrect: freshValidationResult,
        timeSpent: Math.round((Date.now() - questionStartTime) / 1000),
        gameMode: mode || 'practice',
        questionType: currQuestion?.type,
      });

      // Track attempts for "Never Give Up" achievement
      const questionId = currQuestion?.Q_id || currQuestion?.id;
      if (questionId) {
        const currentAttempts = questionAttempts[questionId] || 0;
        const newAttemptCount = currentAttempts + 1;
        
        // Update attempt count
        setQuestionAttempts(prev => ({
          ...prev,
          [questionId]: newAttemptCount
        }));

        // Check Never Give Up achievement if this is a correct answer after multiple attempts
        if (freshValidationResult && newAttemptCount >= 5 && session?.user?.id) {
          await checkNeverGiveUpAchievement(questionId, true, newAttemptCount);
        }
      }

      // Handle achievement unlocks from API response
      if (
        result.success &&
        result.data.unlockedAchievements &&
        result.data.unlockedAchievements.length > 0
      ) {
        showAchievementNotificationsWhenReady(result.data.unlockedAchievements)
          .catch(error => console.error('Failed to show achievements:', error));
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
