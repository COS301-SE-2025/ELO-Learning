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
  submitCallback,
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
  const [numLives, setNumLives] = useState(lives || 5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  
  // 🏆 Achievement tracking
  const [questionAttempts, setQuestionAttempts] = useState({});

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
        setQuestionAttempts({}); // 🏆 Reset achievement tracking
      }
    }
  }, [resetXPState]);

  // 🏆 Add temporary achievement notification system for debugging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Simple notification system for debugging
      window.showAchievement = (achievement) => {
        console.log('🏆 showAchievement called:', achievement);
        
        // Create a simple notification div
        const notification = document.createElement('div');
        notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #10B981;
          color: white;
          padding: 16px 24px;
          border-radius: 8px;
          z-index: 9999;
          font-weight: bold;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          max-width: 300px;
          font-size: 14px;
        `;
        notification.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px;">
            🏆 
            <div>
              <div style="font-weight: bold;">${achievement.name || achievement.achievement_name}</div>
              <div style="font-size: 12px; opacity: 0.9;">${achievement.description || 'Achievement unlocked!'}</div>
            </div>
          </div>
        `;
        document.body.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 5000);
        
        // Slide in animation
        notification.animate([
          { transform: 'translateX(100%)', opacity: 0 },
          { transform: 'translateX(0)', opacity: 1 }
        ], { duration: 300, easing: 'ease-out' });
      };
      
      window.showMultipleAchievements = (achievements) => {
        console.log('🏆 showMultipleAchievements called:', achievements);
        achievements.forEach((ach, index) => {
          setTimeout(() => window.showAchievement(ach), index * 1200);
        });
      };
      
      // Dispatch ready event
      window.dispatchEvent(new Event('achievementSystemReady'));
      console.log('🎯 Achievement notification system ready');
    }
  }, []);

  // 🏆 Achievement Functions (add these without breaking existing flow)
  const checkPerfectSessionAchievement = async () => {
    if (!session?.user?.id) return;
    
    try {
      const questionsObj = JSON.parse(localStorage.getItem('questionsObj') || '[]');
      
      if (questionsObj.length < 10) return;

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
        const response = await fetch('/api/achievements/trigger', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: session.user.id,
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
          if (result.unlockedAchievements?.length > 0) {
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
    if (!session?.user?.id) return;

    try {
      const questionsObj = JSON.parse(localStorage.getItem('questionsObj') || '[]');
      
      if (questionsObj.length < 5) return;

      const correctAnswers = questionsObj.filter(q => q.isCorrect === true);
      
      if (correctAnswers.length < 5) return;

      const totalTime = correctAnswers.reduce((sum, q) => sum + (q.timeElapsed || 30), 0);
      const averageTime = totalTime / correctAnswers.length;
      const correctCount = correctAnswers.length;

      if (averageTime <= 15) {
        const response = await fetch(`/api/achievements/users/${session.user.id}/achievements/speed-solver`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
          if (result.unlockedAchievements?.length > 0) {
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
    if (!session?.user?.id) return;

    try {
      const response = await fetch(`/api/achievements/users/${session.user.id}/achievements/never-give-up`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, isCorrect, attemptNumber }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.unlockedAchievements?.length > 0) {
          showAchievementNotificationsWhenReady(data.unlockedAchievements)
            .catch(error => console.error('Failed to show Never Give Up achievement:', error));
        }
      }
    } catch (error) {
      console.error('Error checking Never Give Up achievement:', error);
    }
  };

  // 🏆 Add debug achievement testing function
  const testAchievement = async () => {
    console.log('🧪 Testing achievement system...');
    
    if (!session?.user?.id) {
      alert('❌ No user session found');
      return;
    }
    
    try {
      // Test 1: Direct API call
      const response = await fetch('/api/achievements/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          achievementType: 'Perfect Session',
          context: {
            consecutiveCorrect: 10,
            totalQuestions: 15,
            mode: 'practice'
          }
        }),
      });
      
      console.log('🎯 Test response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Test success:', result);
        
        if (result.unlockedAchievements?.length > 0) {
          showAchievementNotificationsWhenReady(result.unlockedAchievements);
        } else {
          // Test the notification system anyway
          window.showAchievement({
            name: 'Test Achievement',
            description: 'This is a test achievement notification'
          });
        }
      } else {
        const error = await response.json();
        console.error('❌ Test failed:', error);
        alert(`Test failed: ${JSON.stringify(error)}`);
      }
    } catch (error) {
      console.error('💥 Test error:', error);
      alert(`Test error: ${error.message}`);
    }
  };

  const setLocalStorage = async () => {
    // Calculate time elapsed in seconds
    const timeElapsed = Math.round((Date.now() - questionStartTime) / 1000);

    const questionsObj = JSON.parse(
      localStorage.getItem('questionsObj') || '[]',
    );

    // Find the correct answer
    const correctAnswerObj = currAnswers.find((ans) => ans.isCorrect === true);
    const correctAnswerText = correctAnswerObj?.answer_text || correctAnswerObj;

    // ✅ Re-validate with new validator before storing
    const revalidatedResult = await validateAnswerEnhanced(
      answer,
      correctAnswerText,
      currQuestion?.questionText || '',
      currQuestion?.type || 'Math Input',
    );

    console.log('💾 Storing question with validation:', {
      studentAnswer: answer,
      correctAnswer: correctAnswerText,
      oldIsCorrect: isAnswerCorrect,
      newIsCorrect: revalidatedResult,
      questionText: currQuestion?.questionText?.substring(0, 50) + '...',
    });

    questionsObj.push({
      question: currQuestion,
      q_index: currentStep,
      answer: answer,
      isCorrect: revalidatedResult,
      actualAnswer: correctAnswerObj,
      timeElapsed: timeElapsed,
    });

    localStorage.setItem('questionsObj', JSON.stringify(questionsObj));
  };

  const handleLives = (validationResult) => {
    if (!validationResult) {
      setNumLives((prev) => prev - 1);
      if (numLives <= 1) {
        router.push(`/end-screen?mode=${mode}`);
        return true;
      }
    }
    return false;
  };

  const submitAnswer = async () => {
    setIsSubmitting(true);

    try {
      // Get fresh validation result before handling lives
      const correctAnswerObj = currAnswers.find((ans) => ans.isCorrect === true);
      const correctAnswerText = correctAnswerObj?.answer_text || correctAnswerObj;

      const freshValidationResult = await validateAnswerEnhanced(
        answer,
        correctAnswerText,
        currQuestion?.questionText || '',
        currQuestion?.type || 'Math Input',
      );

      console.log('🔄 Fresh validation for life calculation:', {
        studentAnswer: answer,
        correctAnswer: correctAnswerText,
        isCorrect: freshValidationResult,
      });

      // 🏆 Track attempts for Never Give Up achievement
      const questionId = currQuestion?.Q_id || currQuestion?.id;
      if (questionId && session?.user?.id) {
        const currentAttempts = questionAttempts[questionId] || 0;
        const newAttemptCount = currentAttempts + 1;
        
        setQuestionAttempts(prev => ({
          ...prev,
          [questionId]: newAttemptCount
        }));

        // Check Never Give Up achievement if correct after multiple attempts
        if (freshValidationResult && newAttemptCount >= 5) {
          await checkNeverGiveUpAchievement(questionId, true, newAttemptCount);
        }
      }

      // 🏆 Submit to API for additional achievements (non-blocking)
      if (session?.user?.id) {
        console.log('🎯 ACHIEVEMENT DEBUG - Submitting question:', {
          userId: session.user.id,
          questionId: currQuestion?.Q_id || currQuestion?.id,
          isCorrect: freshValidationResult,
          timeSpent: Math.round((Date.now() - questionStartTime) / 1000),
          gameMode: mode
        });
        
        submitQuestionAnswer({
          userId: session.user.id,
          questionId: currQuestion?.Q_id || currQuestion?.id,
          userAnswer: answer,
          isCorrect: freshValidationResult,
          timeSpent: Math.round((Date.now() - questionStartTime) / 1000),
          gameMode: mode || 'practice',
          questionType: currQuestion?.type,
        }).then(result => {
          console.log('🎯 API RESPONSE:', result);
          
          // Handle achievement unlocks from API response
          if (result.success && result.data.unlockedAchievements?.length > 0) {
            console.log('🏆 ACHIEVEMENTS UNLOCKED:', result.data.unlockedAchievements);
            
            // 🚨 TEMPORARY DEBUG: Show alert for immediate feedback
            const achievementNames = result.data.unlockedAchievements
              .map(ach => ach.name || ach.achievement_name)
              .join(', ');
            console.log('🎉 Achievement names:', achievementNames);
            
            // Try the notification system
            showAchievementNotificationsWhenReady(result.data.unlockedAchievements)
              .then(() => console.log('✅ Notifications shown successfully'))
              .catch(error => {
                console.error('❌ Failed to show achievements:', error);
                // Fallback: show alert for debugging
                alert(`🏆 Achievement Unlocked: ${achievementNames}`);
              });
          } else {
            console.log('🤷 No achievements unlocked this time');
          }
        }).catch(error => {
          console.error('API submission failed (non-critical):', error);
        });
      }

      await setLocalStorage();
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
        // 🏆 Use enhanced callback with achievements
        enhancedSubmitCallback();
        return;
      }

      // ✅ Safe access to next question
      const nextQuestion = allQuestions[currentStep] || null;
      setCurrQuestion(nextQuestion);
      setCurrAnswers(nextQuestion?.answers || []);

    } catch (error) {
      console.error('Error in submitAnswer:', error);
      // Fallback to original flow if anything fails
      await setLocalStorage();
      const gameOver = handleLives(false);
      
      if (!gameOver) {
        setCurrentStep((prev) => prev + 1);
        setIsDisabled(true);
        setAnswer('');
        setIsAnswerCorrect(false);

        if (currentStep >= allQuestions.length) {
          if (submitCallback) submitCallback();
          return;
        }

        const nextQuestion = allQuestions[currentStep] || null;
        setCurrQuestion(nextQuestion);
        setCurrAnswers(nextQuestion?.answers || []);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🏆 Enhanced submitCallback wrapper
  const enhancedSubmitCallback = async () => {
    // Check achievements before calling original callback
    await checkPerfectSessionAchievement();
    await checkSpeedSolverAchievement();
    
    // Call the original submitCallback
    if (submitCallback && typeof submitCallback === 'function') {
      submitCallback();
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
        {/* 🧪 Debug Achievement Button - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-2 text-center">
            <button
              onClick={testAchievement}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
            >
              🧪 Test Achievements
            </button>
          </div>
        )}
      </div>
    </div>
  );
}