'use client';

import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

import AnswerWrapper from '@/app/ui/answers/answer-wrapper';
import QuestionTemplate from '@/app/ui/question-template';
import QuestionFooter from '@/app/ui/questions/question-footer';
import QuestionHeader from '@/app/ui/questions/question-header';
import { Question as ApiQuestion } from '@/services/api';

interface Answer {
  id: number;
  answer_text: string;
  isCorrect: boolean;
}

interface QuestionStorageObject {
  question: ApiQuestion;
  q_index: number;
  answer: string;
  isCorrect: boolean;
  actualAnswer: Answer;
  timeElapsed: number;
}

interface QuestionsTrackerProps {
  questions: ApiQuestion[];
  submitCallback: () => void;
  lives: number;
  mode: string;
}

export default function QuestionsTracker({
  questions,
  submitCallback,
  lives,
  mode,
}: QuestionsTrackerProps) {
  //Normal JS variables
  const allQuestions: ApiQuestion[] = questions;
  const totalSteps: number = allQuestions.length;

  //React hooks
  const [currQuestion, setCurrQuestion] = useState<ApiQuestion>(
    allQuestions[0],
  );
  const [currAnswers, setCurrAnswers] = useState<Answer[]>(
    currQuestion.answers || [],
  );

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isDisabled, setIsDisabled] = useState<boolean>(true);
  const [answer, setAnswer] = useState<string>('');
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean>(false);
  const [numLives, setNumLives] = useState<number>(lives);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Add timer state
  const [questionStartTime, setQuestionStartTime] = useState<number>(
    Date.now(),
  );

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

  const setLocalStorage = (): void => {
    // Calculate time elapsed in seconds
    const timeElapsed = Math.round((Date.now() - questionStartTime) / 1000);

    const questionsData = localStorage.getItem('questionsObj');
    const questionsObj: QuestionStorageObject[] = questionsData
      ? JSON.parse(questionsData)
      : [];

    questionsObj.push({
      question: currQuestion,
      q_index: currentStep,
      answer: answer,
      isCorrect: isAnswerCorrect,
      actualAnswer: currAnswers.find((answer) => answer.isCorrect === true)!,
      timeElapsed: timeElapsed, // Add time elapsed in seconds
    });

    localStorage.setItem('questionsObj', JSON.stringify(questionsObj));
  };

  const handleLives = (): void => {
    if (!isAnswerCorrect) {
      setNumLives((prev) => prev - 1);
      if (numLives <= 1) {
        redirect(`/end-screen?mode=${mode}`);
      }
    }
  };

  const submitAnswer = (): void => {
    setIsSubmitting(true);

    setLocalStorage();
    handleLives();

    // Increment the current step and reset states
    setCurrentStep((prev) => prev + 1);
    setIsDisabled(true);
    setAnswer('');
    setIsAnswerCorrect(false);
    setIsSubmitting(false);

    if (currentStep >= allQuestions.length) {
      submitCallback(); // Call the callback to notify the parent component
      return;
    }

    setCurrQuestion(allQuestions[currentStep]);
    setCurrAnswers(allQuestions[currentStep].answers || []);
    // Note: questionStartTime will be updated by the useEffect above
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
            question={currQuestion.questionText}
            // calculation={currQuestion.calculation || ''}
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
