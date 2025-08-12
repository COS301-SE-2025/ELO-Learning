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
      console.log('🎮 Match question life lost:', event.detail);
      const newLives = Math.max(0, event.detail.newLives); // Ensure lives don't go below 0
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
        console.log('🎮 New game session started - XP calculation state reset');
        // Also reset question attempts for new session
        setQuestionAttempts({});
        console.log('💪 Question attempts reset for new session');
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

    console.log('💾 Storing question with validation:', {
      studentAnswer: answer,
      correctAnswers: correctAnswers,
      oldIsCorrect: isAnswerCorrect,
      newIsCorrect: finalValidationResult,
      matchedAnswer: matchedAnswer,
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
      // Check for Perfect Session in any mode (practice, single-player, multiplayer)
      console.log(`🏅 Perfect Session check for mode: ${mode}`);

      // Get the completed session from localStorage
      const questionsObj = JSON.parse(localStorage.getItem('questionsObj') || '[]');
      
      if (questionsObj.length < 10) {
        console.log('🏅 Perfect Session check skipped - less than 10 questions completed');
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

      console.log('🏅 Perfect Session analysis:', {
        totalQuestions: questionsObj.length,
        maxConsecutiveCorrect: maxConsecutive,
        perfectSessionQualified: maxConsecutive >= 10
      });

      // If achieved 10 consecutive correct answers, trigger achievement
      if (maxConsecutive >= 10) {
        const userId = session?.user?.id;
        if (!userId) {
          console.log('🏅 Perfect Session achievement skipped - no user ID');
          return;
        }

        console.log('🏆 Perfect Session achievement earned! Triggering achievement...');
        
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
          console.log('🏆 Perfect Session achievement result:', result);
          
          // Show achievement notification if unlocked
          if (result.unlockedAchievements && result.unlockedAchievements.length > 0) {
            console.log('🏆 Perfect Session achievement unlocked!', result.unlockedAchievements);
            
            // Use the existing achievement notification system
            const showAchievementNotifications = (attempts = 0) => {
              if (typeof window !== 'undefined' && window.showMultipleAchievements) {
                try {
                  window.showMultipleAchievements(result.unlockedAchievements);
                  console.log('✅ Perfect Session achievement notification displayed');
                } catch (notificationError) {
                  console.error('❌ Error displaying Perfect Session achievement notification:', notificationError);
                  
                  if (attempts < 2) {
                    setTimeout(() => showAchievementNotifications(attempts + 1), 500);
                  }
                }
              } else {
                console.error('❌ Achievement notification system not ready for Perfect Session');
                
                if (attempts < 3) {
                  setTimeout(() => showAchievementNotifications(attempts + 1), 1000);
                } else {
                  console.error('❌ Perfect Session achievement notification failed after 3 attempts');
                }
              }
            };

            // Show achievement notification with a slight delay
            setTimeout(() => showAchievementNotifications(), 500);
          }
        } else {
          console.error('🏆 Failed to trigger Perfect Session achievement:', response.status, response.statusText);
        }
      }
    } catch (error) {
      console.error('🏆 Error checking Perfect Session achievement:', error);
    }
  };

  const checkSpeedSolverAchievement = async () => {
    try {
      const userId = session?.user?.id;
      if (!userId) {
        console.log('⚡ Speed Solver achievement skipped - no user ID');
        return;
      }

      console.log('⚡ Checking Speed Solver achievements...');

      // Get the completed session from localStorage
      const questionsObj = JSON.parse(localStorage.getItem('questionsObj') || '[]');
      
      if (questionsObj.length < 5) {
        console.log('⚡ Speed Solver check skipped - less than 5 questions completed');
        return;
      }

      // Calculate speed statistics for correct answers only
      const correctAnswers = questionsObj.filter(q => q.isCorrect === true);
      
      if (correctAnswers.length < 5) {
        console.log(`⚡ Speed Solver check skipped - only ${correctAnswers.length} correct answers`);
        return;
      }

      // Calculate average time for correct answers
      const totalTime = correctAnswers.reduce((sum, q) => {
        // timeElapsed is stored in seconds
        return sum + (q.timeElapsed || 30); // default 30s if no time recorded
      }, 0);

      const averageTime = totalTime / correctAnswers.length;
      const correctCount = correctAnswers.length;

      console.log('⚡ Speed Solver analysis:', {
        totalQuestions: questionsObj.length,
        correctCount,
        averageTime: averageTime.toFixed(2),
        totalTime
      });

      // Only check if average time is reasonably fast (under 15 seconds)
      if (averageTime <= 15) {
        console.log(`🏃 Triggering Speed Solver check: ${correctCount} correct answers in ${averageTime.toFixed(2)}s average`);
        
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
          console.log('⚡ Speed Solver achievement result:', result);
          
          // Show achievement notification if unlocked
          if (result.unlockedAchievements && result.unlockedAchievements.length > 0) {
            console.log('🏆 Speed Solver achievement unlocked!', result.unlockedAchievements);
            
            // Use the existing achievement notification system
            const showAchievementNotifications = (attempts = 0) => {
              if (typeof window !== 'undefined' && window.showMultipleAchievements) {
                try {
                  window.showMultipleAchievements(result.unlockedAchievements);
                  console.log('✅ Speed Solver achievement notification displayed');
                } catch (notificationError) {
                  console.error('❌ Error displaying Speed Solver achievement notification:', notificationError);
                  
                  if (attempts < 2) {
                    setTimeout(() => showAchievementNotifications(attempts + 1), 500);
                  }
                }
              } else {
                console.error('❌ Achievement notification system not ready for Speed Solver');
                
                if (attempts < 3) {
                  setTimeout(() => showAchievementNotifications(attempts + 1), 1000);
                } else {
                  console.error('❌ Speed Solver achievement notification failed after 3 attempts');
                }
              }
            };

            // Show achievement notification with a slight delay
            setTimeout(() => showAchievementNotifications(), 500);
          }
        } else {
          console.error('🏆 Failed to trigger Speed Solver achievement:', response.status, response.statusText);
        }
      } else {
        console.log(`⚡ Average time too slow for Speed Solver: ${averageTime.toFixed(2)}s (threshold: 15s)`);
      }
    } catch (error) {
      console.error('⚡ Error checking Speed Solver achievement:', error);
    }
  };

  const checkNeverGiveUpAchievement = async (questionId, isCorrect, attemptNumber) => {
    try {
      const userId = session?.user?.id;
      if (!userId) {
        console.log('💪 Never Give Up achievement skipped - no user ID');
        return;
      }

      console.log(`💪 Checking Never Give Up: Question ${questionId}, Attempt ${attemptNumber}, Correct: ${isCorrect}`);

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
        console.log('💪 Never Give Up achievement response:', data);
        
        // Show achievement notification if unlocked
        if (data.unlockedAchievements && data.unlockedAchievements.length > 0) {
          const showAchievementNotifications = (attempts = 0) => {
            if (typeof window !== 'undefined' && window.showMultipleAchievements) {
              try {
                window.showMultipleAchievements(data.unlockedAchievements);
                console.log('✅ Never Give Up achievement notification displayed');
              } catch (notificationError) {
                console.error('❌ Error displaying Never Give Up achievement notification:', notificationError);
                
                if (attempts < 2) {
                  setTimeout(() => showAchievementNotifications(attempts + 1), 500);
                }
              }
            } else {
              console.error('❌ Achievement notification system not ready for Never Give Up');
              
              if (attempts < 3) {
                setTimeout(() => showAchievementNotifications(attempts + 1), 1000);
              } else {
                console.error('❌ Never Give Up achievement notification failed after 3 attempts');
              }
            }
          };

          // Show achievement notification with a slight delay
          setTimeout(() => showAchievementNotifications(), 500);
        }
      } else {
        console.error('💪 Failed to check Never Give Up achievement:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('💪 Error checking Never Give Up achievement:', error);
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
        console.warn('⚠️ No user session found, skipping achievement checks');
      }

      // Submit to API
      const result = await submitQuestionAnswer({
        userId: session?.user?.id,
        questionId: currQuestion?.id,
        userAnswer: answer,
        isCorrect: freshValidationResult,
        timeSpent: Math.round((Date.now() - questionStartTime) / 1000),
      });

      console.log('🔄 API + validation result:', {
        studentAnswer: answer,
        correctAnswers: correctAnswers,
        apiResult: result.success ? result.data.isCorrect : 'API failed',
        localValidation: freshValidationResult,
        matchedAnswer: matchedAnswer,
        userId: session?.user?.id,
      });

      // 💪 Track attempts for "Never Give Up" achievement
      const questionId = currQuestion?.id;
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
          console.log(`💪 Potential Never Give Up achievement: Question ${questionId} solved on attempt ${newAttemptCount}`);
          await checkNeverGiveUpAchievement(questionId, true, newAttemptCount);
        } else if (!freshValidationResult) {
          console.log(`💪 Tracking attempt ${newAttemptCount} for question ${questionId} (incorrect)`);
        } else if (freshValidationResult && newAttemptCount >= 5 && !session?.user?.id) {
          console.log('💪 Never Give Up achievement skipped - no user session');
        }
      }

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
