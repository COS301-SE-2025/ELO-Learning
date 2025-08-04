'use client';

import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

import QuestionNumber from '@/app/ui/memo/question-num';
import RightAnswer from '@/app/ui/memo/right-answer';
import WrongAnswer from '@/app/ui/memo/wrong-answer';
import QuestionTemplate from '@/app/ui/question-template';

export default function Page() {
  const [questions, setQuestions] = useState([]); // Start with empty array
  const [currQuestion, setCurrQuestion] = useState(null);
  const [answer, setAnswer] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [index, setIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const tempQuestions = JSON.parse(localStorage.getItem('questionsObj') || '[]'); // Fallback to empty array
      
      if (tempQuestions.length === 0) {
        // No questions found, redirect to dashboard
        redirect('/dashboard');
        return;
      }
      
      setQuestions(tempQuestions);
      setCurrQuestion(tempQuestions[0]);
      setCorrectAnswer(tempQuestions[0].actualAnswer);
      setAnswer(tempQuestions[0].answer);
      setIsCorrect(tempQuestions[0].isCorrect);
      setIsLoading(false);
    }
  }, []);

  const nextPage = () => {
    if (index === questions.length - 1) {
      localStorage.removeItem('questionsObj');
      redirect('/dashboard');
    }
    setIndex((prev) => prev + 1);
  };

  const prevPage = () => {
    setIndex((prev) => prev - 1);
  };

  useEffect(() => {
    if (questions.length > 0 && questions[index]) {
      setCurrQuestion(questions[index]);
      setCorrectAnswer(questions[index].actualAnswer);
      setAnswer(questions[index].answer);
      setIsCorrect(questions[index].isCorrect);
    }
  }, [index, questions]);

  // Show loading state during SSR and initial client load
  if (isLoading || !currQuestion) {
    return (
      <div className="full-screen w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="full-screen w-full h-full flex flex-col justify-between">
      <div>
        <QuestionNumber index={currQuestion?.q_index} />
      </div>
      <div>
        <QuestionTemplate question={currQuestion?.question?.questionText} />
      </div>
      <div className="md:flex md:flex-col md:m-auto md:w-[50%]">
        <div>
          <p className="text-xl">Your answer:</p>
          {isCorrect ? (
            <RightAnswer answer={answer} />
          ) : (
            <WrongAnswer answer={answer} />
          )}
        </div>
        <div>
          <p className="text-xl">System answer:</p>
          <RightAnswer answer={correctAnswer?.answer_text} />
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