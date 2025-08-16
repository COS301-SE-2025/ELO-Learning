'use client';

import { useEffect, useState } from 'react';
import { handleBaselineComplete } from '@/app/baseline-game/actions';
import AnswerWrapper from '@/app/ui/answers/answer-wrapper';
import QuestionTemplate from '@/app/ui/question-template';
import QuestionFooter from '@/app/ui/questions/question-footer';
import BaselineQuestionHeader from '@/app/ui/questions/baseline-question-header';

export default function QuestionsTracker({
  questions,
  userId,
}) {
  //Normal JS variables
  const allQuestions = questions || [];
  const totalSteps = allQuestions.length;

  //React hooks
  const [currQuestion, setCurrQuestion] = useState(null);
  const [currAnswers, setCurrAnswers] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [currentLevel, setCurrentLevel] = useState(5); // Start at level 5
  const [isDisabled, setIsDisabled] = useState(true);
  const [answer, setAnswer] = useState('');
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    const questionsObj = JSON.parse(localStorage.getItem('baselineQuestionsObj')) || [];

    questionsObj.push({
      question: currQuestion,
      q_index: currentStep,
      answer: answer,
      isCorrect: isAnswerCorrect,
      actualAnswer: currAnswers.find((answer) => answer.isCorrect == true)
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

    if (currentStep >= allQuestions.length) {
      setIsSubmitting(true);
      try {
        await handleBaselineComplete(userId, nextLevel);
      } catch (error) {
        console.error('Failed to complete baseline test:', error);
      }
      return;
    }

    // Find next question at appropriate level
    const nextQuestion = allQuestions.find(q => q.level === nextLevel) || allQuestions[0];
    setCurrQuestion(nextQuestion);
    setCurrAnswers(nextQuestion.answers || []);
  };

  if (!currQuestion) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Loading questions...</p>
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
