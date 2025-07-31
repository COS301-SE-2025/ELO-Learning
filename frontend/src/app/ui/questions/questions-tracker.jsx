'use client';

import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

import AnswerWrapper from '@/app/ui/answers/answer-wrapper';
import QuestionTemplate from '@/app/ui/question-template';
import QuestionFooter from '@/app/ui/questions/question-footer';
import QuestionHeader from '@/app/ui/questions/question-header';

export default function QuestionsTracker({
  questions,
  submitCallback,
  lives,
  mode,
}) {
  if (!questions || questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div>Loading questions...</div>
        </div>
      </div>
    );
  }

  //Normal JS variables
  const allQuestions = questions;
  const totalSteps = allQuestions.length;

  //React hooks
  const [currQuestion, setCurrQuestion] = useState(allQuestions[0]);
  const [currAnswers, setCurrAnswers] = useState(allQuestions[0]?.answers || []);

  const [currentStep, setCurrentStep] = useState(1);
  const [isDisabled, setIsDisabled] = useState(true);
  const [answer, setAnswer] = useState('');
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [numLives, setNumLives] = useState(lives);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add timer state
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

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

  const setLocalStorage = () => {
    // Calculate time elapsed in seconds
    const timeElapsed = Math.round((Date.now() - questionStartTime) / 1000);

    const questionsObj = JSON.parse(localStorage.getItem('questionsObj')) || [];

    questionsObj.push({
      question: currQuestion,
      q_index: currentStep,
      answer: answer,
      isCorrect: isAnswerCorrect,
      actualAnswer: currAnswers.find((answer) => answer.isCorrect == true),
      timeElapsed: timeElapsed, // Add time elapsed in seconds
    });

    localStorage.setItem('questionsObj', JSON.stringify(questionsObj));
  };

  const handleLives = () => {
    if (!isAnswerCorrect) {
      setNumLives((prev) => prev - 1);
      if (numLives <= 1) {
        redirect(`/end-screen?mode=${mode}`);
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
