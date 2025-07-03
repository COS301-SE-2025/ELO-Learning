'use client';

import Lives from '@/app/ui/lives';
import MCTemplate from '@/app/ui/mc-template';
import ProgressBar from '@/app/ui/progress-bar';
import QuestionTemplate from '@/app/ui/question-template';
import { X } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Answer {
  id: number;
  answer_text: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  questionText: string;
  answers: Answer[];
  calculation?: string;
  // Add other question properties as needed
}

interface QuestionStorageObject {
  question: Question;
  q_index: number;
  selectedAnswer: Answer | null;
  actualAnswer: Answer;
}

interface ClientWrapperProps {
  questions: Question[];
}

export default function ClientWrapper({ questions }: ClientWrapperProps) {
  const allQuestions: Question[] = questions;

  const totalSteps: number = allQuestions.length;

  const [currQuestion, setCurrQuestion] = useState<Question>(allQuestions[0]);
  //   console.log('Current Question:', currQuestion);
  const [currAnswers, setCurrAnswers] = useState<Answer[]>(
    currQuestion.answers || [],
  );

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isDisabled, setIsDisabled] = useState<boolean>(true);
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null);
  const [isSelectedAnswerCorrect, setIsSelectedAnswerCorrect] =
    useState<boolean>(false);
  const [numLives, setNumLives] = useState<number>(5);

  // const [questionsObj, setQuestionsObj] = useState([]);

  useEffect(() => {
    if (selectedAnswer) {
      setIsDisabled(false);
    }
  }, [selectedAnswer]);

  const submitAnswer = (): void => {
    const questionsData = localStorage.getItem('questionsObj');
    const questionsObj: QuestionStorageObject[] = questionsData
      ? JSON.parse(questionsData)
      : [];

    questionsObj.push({
      question: currQuestion,
      q_index: currentStep,
      selectedAnswer: selectedAnswer,
      actualAnswer: currAnswers.find((answer) => answer.isCorrect === true)!,
    });

    localStorage.setItem('questionsObj', JSON.stringify(questionsObj));

    if (!isSelectedAnswerCorrect) {
      setNumLives((prev) => prev - 1);
      if (numLives <= 1) {
        redirect('/end-screen');
      }
    }
    setCurrentStep((prev) => prev + 1);
    setIsDisabled(true);
    setSelectedAnswer(null);
    setIsSelectedAnswerCorrect(false);

    if (currentStep === allQuestions.length) {
      redirect('/end-screen');
    }

    setCurrQuestion(allQuestions[currentStep]);
    setCurrAnswers(allQuestions[currentStep].answers || []);
  };

  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        <div className="flex flex-row items-center justify-between w-full py-2 gap-2">
          <Link href="/dashboard">
            <X size={24} />
          </Link>
          <div className="flex-1">
            <ProgressBar progress={currentStep / totalSteps} />
          </div>
          <Lives numberOfLives={numLives} />
        </div>
        <div>
          <QuestionTemplate
            question={currQuestion.questionText}
            // calculation={currQuestion.calculation || ''}
          />
        </div>
        <div className="m-2">
          <MCTemplate
            answers={currAnswers}
            setSelectedAnswer={setSelectedAnswer}
            setIsSelectedAnswerCorrect={setIsSelectedAnswerCorrect}
          />
        </div>
      </div>
      <div className="flex flex-col justify-center items-center md:w-[50%] md:m-auto">
        <button
          type="button"
          disabled={isDisabled}
          onClick={submitAnswer}
          className={`${
            isDisabled ? 'disabled_button' : 'main-button'
          } px-4 py-5 w-full mt-10 `}
        >
          SUBMIT
        </button>
      </div>
    </div>
  );
}
