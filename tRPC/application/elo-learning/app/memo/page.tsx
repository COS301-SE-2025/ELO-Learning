'use client';

import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

import QuestionNumber from '@/app/ui/memo/question-num';
import RightAnswer from '@/app/ui/memo/right-answer';
import WrongAnswer from '@/app/ui/memo/wrong-answer';
import QuestionTemplate from '@/app/ui/question-template';

interface Question {
  id: number;
  questionText: string;
  xpGain: number;
}

interface Answer {
  id: number;
  answer_text: string;
  isCorrect: boolean;
}

interface QuestionObject {
  question: Question;
  q_index: number;
  answer: string;
  isCorrect: boolean;
  actualAnswer: Answer;
  timeElapsed: number;
}

export default function Page() {
  const [questions, setQuestions] = useState<QuestionObject[]>([]);
  const [currQuestion, setCurrQuestion] = useState<QuestionObject | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState<Answer | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [index, setIndex] = useState<number>(0);

  useEffect(() => {
    const questionsData = localStorage.getItem('questionsObj');
    if (questionsData) {
      const tempQuestions: QuestionObject[] = JSON.parse(questionsData);
      setQuestions(tempQuestions);
      setCurrQuestion(tempQuestions[index]);
      setCorrectAnswer(tempQuestions[index].actualAnswer);
      setAnswer(tempQuestions[index].answer);
      setIsCorrect(tempQuestions[index].isCorrect);
    }
  }, [index]);

  const nextPage = (): void => {
    if (index === questions.length - 1) {
      localStorage.removeItem('questionsObj');
      redirect('/dashboard');
    }
    setIndex((prev: number) => prev + 1);
  };

  const prevPage = (): void => {
    setIndex((prev: number) => prev - 1);
  };

  useEffect(() => {
    if (questions.length > 0) {
      setCurrQuestion(questions[index]);
      setCorrectAnswer(questions[index].actualAnswer);
      setAnswer(questions[index].answer);
      setIsCorrect(questions[index].isCorrect);
    }
  }, [index, questions]);

  return (
    <div className="full-screen w-full h-full flex flex-col justify-between">
      <div>
        <QuestionNumber index={currQuestion?.q_index || 1} />
      </div>
      <div>
        <QuestionTemplate
          question={currQuestion?.question?.questionText || ''}
          // calculation={''}
        />
      </div>
      <div className="md:flex md:flex-col md:m-auto md:w-[50%]">
        <div>
          <p className="text-xl">Your answer:</p>
          {isCorrect ? (
            <RightAnswer answer={answer || ''} />
          ) : (
            <WrongAnswer answer={answer || ''} />
          )}
        </div>
        <div>
          <p className="text-xl">System answer:</p>
          <RightAnswer answer={correctAnswer?.answer_text || ''} />
        </div>
      </div>
      <div className="flex flex-row items-center justify-between w-full gap-4 md:w-[50%] md:m-auto">
        {index !== 0 && (
          <button onClick={prevPage} className="secondary-button">
            Previous
          </button>
        )}
        {index < questions.length - 1 && (
          <button onClick={nextPage} className="main-button">
            Next
          </button>
        )}
        {index === questions.length - 1 && (
          <button onClick={nextPage} className="main-button">
            Finish
          </button>
        )}
      </div>
    </div>
  );
}
