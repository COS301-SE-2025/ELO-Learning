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
  const totalSteps = 15; // Fixed to 15 questions for base test
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
        <p className="text-lg text-gray-600 dark:text-gray-300">
          {isInitializing
            ? 'Loading Baseline Test...'
            : 'Loading next question...'}
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

        // Try to fetch a random question at level 5 first
        try {
          console.log(' Fetching initial baseline question at level 5...');
          firstQuestion = await fetchNextRandomBaselineQuestion(5);
          console.log(' Initial question fetched from API:', firstQuestion);
        } catch (apiError) {
          console.log(' API fetch failed, using fallback questions:', apiError);
          // Fallback to provided questions if API fails
          if (allQuestions.length > 0) {
            firstQuestion = allQuestions[0];
            console.log(' Using fallback question:', firstQuestion);
          } else {
            throw new Error('No questions available');
          }
        }

        if (firstQuestion) {
          // Add a small delay to show the loading animation
          await new Promise((resolve) => setTimeout(resolve, 1000));

          setCurrQuestion(firstQuestion);
          setCurrAnswers(firstQuestion.answers || firstQuestion.Answers || []);
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

  const submitAnswer = async () => {
    setLocalStorage();

    // Update level based on answer
    const nextLevel = isAnswerCorrect
      ? Math.min(currentLevel + 1, 10)
      : Math.max(currentLevel - 1, 1);
    setCurrentLevel(nextLevel);

    // Check if this was the last question BEFORE incrementing
    if (currentStep >= totalSteps) {
      setIsSubmitting(true);
      try {
        // Update user's ELO rating and baseline test status
        console.log(' Baseline test completed! Updating user ELO...', {
          userId,
          finalLevel: nextLevel,
        });

        const response = await updateUserElo(userId, nextLevel);
        console.log(' User ELO updated successfully:', response);

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

    // Show loading animation
    setLoadingNextQuestion(true);

    try {
      //fetch next random question from the database
      console.log('Fetching next question for step:', currentStep + 1);
      const nextQuestion = await fetchNextRandomBaselineQuestion(nextLevel);
      console.log('Next question fetched:', nextQuestion);

      // Add minimum delay to show loading animation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Find next question at appropriate level
      setCurrQuestion(nextQuestion);
      setCurrAnswers(nextQuestion.answers || []);
    } catch (error) {
      console.error(' Failed to fetch next question:', error);
      // Fallback to using static questions if available
      if (allQuestions.length > currentStep) {
        const fallbackQuestion = allQuestions[currentStep];
        setCurrQuestion(fallbackQuestion);
        setCurrAnswers(
          fallbackQuestion.answers || fallbackQuestion.Answers || [],
        );
      }
    } finally {
      setLoadingNextQuestion(false); // Hide loading
    }
  };

  // Show loading screen during initialization or when loading next question
  if (isInitializing || loadingNextQuestion) {
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
