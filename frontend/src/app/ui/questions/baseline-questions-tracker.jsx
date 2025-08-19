'use client';

import AnswerWrapper from '@/app/ui/answers/answer-wrapper';
import QuestionTemplate from '@/app/ui/question-template';
import BaselineQuestionHeader from '@/app/ui/questions/baseline-question-header';
import QuestionFooter from '@/app/ui/questions/question-footer';
import { fetchNextRandomBaselineQuestion, updateUserElo } from '@/services/api';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function QuestionsTracker({ questions, userId }) {
  const router = useRouter();
  //Normal JS variables
  const allQuestions = questions || [];
  const totalSteps = allQuestions.length;
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
  const [loadingNextQuestion, setLoadingNextQuestion] = useState(false); // NEW

  //Effects
  useEffect(() => {
    if (answer) {
      setIsDisabled(false);
    }
  }, [answer]);

  // Initialize question and answers when questions are available
  useEffect(() => {
    if (allQuestions.length > 0) {
      console.log('Initializing first question from:', allQuestions);
      const firstQuestion = allQuestions[0];
      setCurrQuestion(firstQuestion);
      setCurrAnswers(firstQuestion.answers || firstQuestion.Answers || []);
    }
  }, [allQuestions]);

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

    // Increment the current step and reset states
    setCurrentStep((prev) => prev + 1);
    setIsDisabled(true);
    setAnswer('');
    setIsAnswerCorrect(false);

    // Show loading animation
    setLoadingNextQuestion(true);

    //fetch next random question from the database
    console.log('Fetching next question for step:', currentStep + 1);
    const nextQuestion = await fetchNextRandomBaselineQuestion(nextLevel);
    console.log('Next question fetched:', nextQuestion);

    if (currentStep >= allQuestions.length) {
      setIsSubmitting(true);
      setLoadingNextQuestion(false); // Hide loading
      try {
        // Update user's ELO rating and baseline test status
        await updateUserElo(userId, nextLevel);
        update({
          user: {
            ...session.user,
            baseLineTest: true,
            elo_rating: nextLevel, // Update ELO rating in session
            level: nextLevel, // Update level in session
          },
        });

        // Redirect to end screen with baseline mode and elo rating
        router.push(`/end-screen?mode=baseline&elo=${nextLevel}`);
      } catch (error) {
        console.error('Failed to complete baseline test:', error);
        router.push(`/dashboard?error=baseline-completion-failed`);
      }
      return;
    }

    // Find next question at appropriate level
    setCurrQuestion(nextQuestion);
    setCurrAnswers(nextQuestion.answers || []);
    setLoadingNextQuestion(false); // Hide loading
  };

  // Loading animation (copied from dashboard)
  const LoadingAnimation = (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex flex-row items-center justify-center gap-5">
        {[0, 150, 300].map((delay) => (
          <div
            key={delay}
            className="animate-bounce rounded-full h-5 w-5 bg-[#FF6E99] mb-4"
            style={{ animationDelay: `${delay}ms` }}
          ></div>
        ))}
      </div>
      <div className="text-lg font-bold text-center">
        Loading next question...
      </div>
    </div>
  );

  if (!currQuestion) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Loading questions...</p>
      </div>
    );
  }

  // Show loading animation when fetching next question
  if (loadingNextQuestion) {
    return LoadingAnimation;
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
