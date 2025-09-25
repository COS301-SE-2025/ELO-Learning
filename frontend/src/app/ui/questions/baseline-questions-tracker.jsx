'use client';

import AnswerWrapper from '@/app/ui/answers/answer-wrapper';
import QuestionTemplate from '@/app/ui/question-template';
import BaselineQuestionHeader from '@/app/ui/questions/baseline-question-header';
import QuestionFooter from '@/app/ui/questions/question-footer';
import { fetchNextRandomBaselineQuestion, updateUserElo } from '@/services/api';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';

export default function QuestionsTracker({ questions, userId, onComplete }) {
  const router = useRouter();
  //Normal JS variables
  const allQuestions = questions || [];
  const totalSteps = 12; // Reduced from 15 to 12 questions for base test
  const { data: session, update } = useSession();

  //React hooks
  const [currQuestion, setCurrQuestion] = useState(null);
  const [currAnswers, setCurrAnswers] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [currentLevel, setCurrentLevel] = useState(5); // Start at level 5
  const [isDisabled, setIsDisabled] = useState(true);
  const [answer, setAnswer] = useState('');
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingNextQuestion, setLoadingNextQuestion] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true); // NEW: Track initial loading
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0); // Track performance
  const [levelHistory, setLevelHistory] = useState([5]); // Track level changes for bounce detection
  const [consecutiveAtLevel1Wrong, setConsecutiveAtLevel1Wrong] = useState(0); // Track level 1 failures
  const [consecutiveAtLevel10Right, setConsecutiveAtLevel10Right] = useState(0); // Track level 10 successes
  const [askedQuestionIds, setAskedQuestionIds] = useState(new Set()); // Track asked questions to prevent repeats

  // loading component
  const LoadingComponent = useMemo(
    () => (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="flex space-x-2 mb-4">
          {[0, 150, 300].map((delay) => (
            <div
              key={delay}
              className="animate-bounce rounded-full h-5 w-5 bg-[#FF6E99] mb-4"
              style={{ animationDelay: `${delay}ms` }}
            ></div>
          ))}
        </div>
        <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
          {isInitializing ? 'Loading Baseline Test...' : 'Next question...'}
        </p>
      </div>
    ),
    [isInitializing],
  );

  //Effects
  useEffect(() => {
    if (answer) {
      setIsDisabled(false);
    }
  }, [answer]);

  // Initialize question and answers when questions are available
  useEffect(() => {
    const initializeFirstQuestion = async () => {
      setIsInitializing(true);

      try {
        let firstQuestion;

        // Use provided questions first, only fetch from API if none available
        if (allQuestions.length > 0) {
          firstQuestion = allQuestions[0];
          console.log(' Using provided question:', firstQuestion);
        } else {
          // Only fetch from API if no questions were provided
          try {
            console.log(
              ' No provided questions, fetching from API at level 5...',
            );
            firstQuestion = await fetchNextRandomBaselineQuestion(5);
            console.log(' Initial question fetched from API:', firstQuestion);
          } catch (apiError) {
            console.log(' API fetch failed:', apiError);
            throw new Error('No questions available');
          }
        }

        if (firstQuestion) {
          // Add a small delay to show the loading animation
          await new Promise((resolve) => setTimeout(resolve, 1000));

          setCurrQuestion(firstQuestion);
          setCurrAnswers(firstQuestion.answers || firstQuestion.Answers || []);
          
          // Track this question as asked to prevent repeats
          setAskedQuestionIds(prev => new Set([...prev, firstQuestion.Q_id || firstQuestion.id]));
          
          console.log(' First question initialized');
        }
      } catch (error) {
        console.error(' Failed to initialize questions:', error);
        // You might want to show an error state here
      } finally {
        setIsInitializing(false);
      }
    };

    // Only initialize if we haven't already and we have userId
    if (userId && !currQuestion && isInitializing) {
      initializeFirstQuestion();
    }
  }, [allQuestions, userId, currQuestion, isInitializing]);

  // Function to detect if user is bouncing between levels
  const detectLevelBouncing = (newLevel, history) => {
    const updatedHistory = [...history, newLevel];
    setLevelHistory(updatedHistory);

    // Need at least 7 entries to detect 3 bounces (including initial level)
    if (updatedHistory.length < 7) return false;

    // Check last 6 level changes for bouncing pattern
    const recentLevels = updatedHistory.slice(-6);

    // Pattern: A -> B -> A -> B -> A -> B (3 complete bounces)
    const bouncePattern = [];
    for (let i = 1; i < recentLevels.length; i++) {
      bouncePattern.push(
        recentLevels[i] !== recentLevels[i - 1] ? 'change' : 'same',
      );
    }

    // Check if we have alternating pattern (change, change, change, change, change)
    const hasAlternatingPattern = bouncePattern.every(
      (change) => change === 'change',
    );

    // Additional check: ensure we're actually bouncing between just 2 levels
    const uniqueLevels = [...new Set(recentLevels)];
    const isBouncing = hasAlternatingPattern && uniqueLevels.length === 2;

    if (isBouncing) {
      console.log('🎯 Bounce pattern detected!', {
        recentLevels,
        bouncePattern,
        uniqueLevels,
      });
    }

    return isBouncing;
  };

  const setLocalStorage = () => {
    const questionsObj =
      JSON.parse(localStorage.getItem('baselineQuestionsObj')) || [];

    questionsObj.push({
      question: currQuestion,
      q_index: currentStep,
      answer: answer,
      isCorrect: isAnswerCorrect,
      actualAnswer: currAnswers.find((answer) => answer.isCorrect == true),
    });

    localStorage.setItem('baselineQuestionsObj', JSON.stringify(questionsObj));
  };

  // Function to fetch a unique question (not asked before)
  const fetchUniqueQuestion = async (level, maxAttempts = 10) => {
    let attempts = 0;
    let question = null;
    
    while (attempts < maxAttempts) {
      try {
        const fetchedQuestion = await fetchNextRandomBaselineQuestion(level);
        const questionId = fetchedQuestion.Q_id || fetchedQuestion.id;
        
        // Check if we've already asked this question
        if (!askedQuestionIds.has(questionId)) {
          question = fetchedQuestion;
          break;
        }
        
        console.log(`Question ${questionId} already asked, fetching another...`);
        attempts++;
      } catch (error) {
        console.error(`Attempt ${attempts + 1} failed:`, error);
        attempts++;
      }
    }
    
    if (!question) {
      console.warn('Could not find unique question, using fallback from provided questions');
      // Fallback: use provided questions if available
      const unusedQuestions = allQuestions.filter(q => 
        !askedQuestionIds.has(q.Q_id || q.id) && q.level === level
      );
      
      if (unusedQuestions.length > 0) {
        question = unusedQuestions[Math.floor(Math.random() * unusedQuestions.length)];
      } else {
        // Final fallback: use any unused question from provided questions
        const anyUnusedQuestions = allQuestions.filter(q => 
          !askedQuestionIds.has(q.Q_id || q.id)
        );
        if (anyUnusedQuestions.length > 0) {
          question = anyUnusedQuestions[Math.floor(Math.random() * anyUnusedQuestions.length)];
        }
      }
    }
    
    return question;
  };

  const submitAnswer = async () => {
    setLocalStorage();

    // Track correct answers for performance calculation
    if (isAnswerCorrect) {
      setCorrectAnswersCount((prev) => prev + 1);
    }

    // Update level based on answer
    const nextLevel = isAnswerCorrect
      ? Math.min(currentLevel + 1, 10)
      : Math.max(currentLevel - 1, 1);
    setCurrentLevel(nextLevel);

    // Track edge case patterns
    if (currentLevel === 1 && !isAnswerCorrect) {
      setConsecutiveAtLevel1Wrong((prev) => prev + 1);
    } else {
      setConsecutiveAtLevel1Wrong(0); // Reset if not at level 1 or got it right
    }

    if (currentLevel === 10 && isAnswerCorrect) {
      setConsecutiveAtLevel10Right((prev) => prev + 1);
    } else {
      setConsecutiveAtLevel10Right(0); // Reset if not at level 10 or got it wrong
    }

    // Check for bouncing pattern
    const isBouncing = detectLevelBouncing(nextLevel, levelHistory);

    // Check edge case termination conditions
    const level1Failure = consecutiveAtLevel1Wrong >= 1; // 2 wrong at level 1 (including current)
    const level10Success = consecutiveAtLevel10Right >= 1; // 2 right at level 10 (including current)

    // Early termination conditions
    const shouldEndTest =
      currentStep >= totalSteps ||
      isBouncing ||
      level1Failure ||
      level10Success;

    if (shouldEndTest) {
      setIsSubmitting(true);

      const endReason = isBouncing
        ? 'bounce_detection'
        : level1Failure
          ? 'level_1_failure'
          : level10Success
            ? 'level_10_mastery'
            : 'completed_all_questions';

      console.log(`🏁 Baseline test ending due to: ${endReason}`, {
        currentStep,
        totalSteps,
        isBouncing,
        level1Failure,
        level10Success,
        consecutiveAtLevel1Wrong:
          consecutiveAtLevel1Wrong +
          (currentLevel === 1 && !isAnswerCorrect ? 1 : 0),
        consecutiveAtLevel10Right:
          consecutiveAtLevel10Right +
          (currentLevel === 10 && isAnswerCorrect ? 1 : 0),
        levelHistory: [...levelHistory, nextLevel],
      });

      try {
        // Update user's ELO rating and baseline test status
        console.log(' Baseline test completed! Updating user ELO...', {
          userId,
          finalLevel: nextLevel,
          performance: {
            correctAnswers: correctAnswersCount,
            totalQuestions: totalSteps,
          },
        });

        // Calculate final performance data (adjust for early termination)
        const actualQuestionsAttempted = currentStep; // Current step represents questions attempted
        const finalCorrectCount = isAnswerCorrect
          ? correctAnswersCount + 1
          : correctAnswersCount;

        const testPerformance = {
          correctAnswers: finalCorrectCount,
          totalQuestions: actualQuestionsAttempted,
          endReason: endReason,
          levelHistory: [...levelHistory, nextLevel],
          edgeCaseData: {
            consecutiveAtLevel1Wrong:
              consecutiveAtLevel1Wrong +
              (currentLevel === 1 && !isAnswerCorrect ? 1 : 0),
            consecutiveAtLevel10Right:
              consecutiveAtLevel10Right +
              (currentLevel === 10 && isAnswerCorrect ? 1 : 0),
          },
        };

        console.log('📊 Final test performance:', testPerformance);

        const response = await updateUserElo(
          userId,
          nextLevel,
          testPerformance,
        );
        console.log(' User ELO updated successfully:', response);

        // Clear the popup interaction flag since user has now completed the test
        localStorage.removeItem(`baseline_popup_seen_${userId}`);

        // Update session with the returned user data
        if (response.user) {
          await update({
            user: {
              ...session.user,
              ...response.user, // Use complete updated user data from backend
            },
          });
          console.log(' Session updated with backend response');
        } else {
          // Fallback: manually update the fields
          await update({
            user: {
              ...session.user,
              baseLineTest: true,
              currentLevel: nextLevel,
              elo_rating: nextLevel,
            },
          });
          console.log(' Session updated with fallback data');
        }

        // Call the parent's completion handler if provided
        if (onComplete) {
          onComplete(nextLevel, response);
        } else {
          // Fallback: redirect directly (for backward compatibility)
          router.push(`/end-screen?mode=baseline&elo=${nextLevel}`);
        }
      } catch (error) {
        console.error('Failed to complete baseline test:', error);
        if (onComplete) {
          onComplete(nextLevel, null); // Call completion even on error
        } else {
          router.push(`/dashboard?error=baseline-completion-failed`);
        }
      }
      return;
    }

    // Increment the current step and reset states for next question
    setCurrentStep((prev) => prev + 1);
    setIsDisabled(true);
    setAnswer('');
    setIsAnswerCorrect(false);

    // Remove loading state - fetch next question immediately
    try {
      //fetch next random question from the database (ensuring no repeats)
      console.log('Fetching next unique question for step:', currentStep + 1, 'at level:', nextLevel);
      const nextQuestion = await fetchUniqueQuestion(nextLevel);
      
      if (nextQuestion) {
        console.log('Next unique question fetched:', nextQuestion);
        
        // Track this question as asked
        const questionId = nextQuestion.Q_id || nextQuestion.id;
        setAskedQuestionIds(prev => new Set([...prev, questionId]));
        
        // Set next question immediately without delay
        setCurrQuestion(nextQuestion);
        setCurrAnswers(nextQuestion.answers || []);
      } else {
        throw new Error('No unique question available');
      }
    } catch (error) {
      console.error('Failed to fetch next unique question:', error);
      // Fallback to using static questions if available
      if (allQuestions.length > currentStep) {
        const fallbackQuestion = allQuestions[currentStep];
        const questionId = fallbackQuestion.Q_id || fallbackQuestion.id;
        
        // Track this question as asked
        setAskedQuestionIds(prev => new Set([...prev, questionId]));
        
        setCurrQuestion(fallbackQuestion);
        setCurrAnswers(
          fallbackQuestion.answers || fallbackQuestion.Answers || [],
        );
      }
    }
  };

  // Show loading screen only during initialization
  if (isInitializing) {
    return LoadingComponent;
  }

  // Show error state if no question is available
  if (!currQuestion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg text-red-600">
          Failed to load baseline test questions.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="mt-4 px-4 py-2 bg-[#FF6E99] text-white rounded-lg hover:bg-[#FF5588]"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        <BaselineQuestionHeader
          currentStep={currentStep}
          totalSteps={totalSteps}
          userId={userId}
        />
        <div>
          <QuestionTemplate question={currQuestion.questionText} />
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
