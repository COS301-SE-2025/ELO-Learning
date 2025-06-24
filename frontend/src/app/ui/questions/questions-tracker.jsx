'use client';

import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

import AnswerWrapper from '@/app/ui/answers/answer-wrapper';
import QuestionTemplate from '@/app/ui/question-template';
import QuestionFooter from '@/app/ui/questions/question-footer';
import QuestionHeader from '@/app/ui/questions/question-header';
export default function QuestionsTracker({ questions, submitCallback }) {
  //Normal JS variables
  const allQuestions = questions;
  const totalSteps = allQuestions.length;

  //React hooks
  const [currQuestion, setCurrQuestion] = useState(allQuestions[0]);
  const [currAnswers, setCurrAnswers] = useState(currQuestion.answers || []);

  const [currentStep, setCurrentStep] = useState(1);
  const [isDisabled, setIsDisabled] = useState(true);
  const [answer, setAnswer] = useState('');
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [numLives, setNumLives] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  //Effects
  useEffect(() => {
    if (answer) {
      setIsDisabled(false);
    }
  }, [answer]);

  const setLocalStorage = () => {
    const questionsObj = JSON.parse(localStorage.getItem('questionsObj')) || [];

    questionsObj.push({
      question: currQuestion,
      q_index: currentStep,
      answer: answer,
      isCorrect: isAnswerCorrect,
      actualAnswer: currAnswers.find((answer) => answer.isCorrect == true),
    });

    localStorage.setItem('questionsObj', questionsObj);

    localStorage.setItem('questionsObj', JSON.stringify(questionsObj));
  };

  const handleLives = () => {
    if (!isAnswerCorrect) {
      setNumLives((prev) => prev - 1);
      if (numLives <= 1) {
        redirect('/end-screen');
      }
    }
  };

  const submitAnswer = () => {
    setLocalStorage();
    handleLives();

    // Increment the current step and reset states
    setCurrentStep((prev) => prev + 1);
    setIsDisabled(true);
    setAnswer('');
    setIsAnswerCorrect(false);

    if (currentStep === allQuestions.length) {
      submitCallback(); // Call the callback to notify the parent component
      return;
    }

    setCurrQuestion(allQuestions[currentStep]);
    setCurrAnswers(allQuestions[currentStep].answers || []);
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
