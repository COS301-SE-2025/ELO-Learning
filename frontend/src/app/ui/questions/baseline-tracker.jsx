'use client';

import { useEffect, useState } from 'react';
import AnswerWrapper from '@/app/ui/answers/answer-wrapper';
import QuestionTemplate from '@/app/ui/question-template';
import QuestionFooter from '@/app/ui/questions/question-footer';
import BaselineQuestionHeader from '@/app/ui/questions/baseline-question-header';
import { updateUserElo } from '@/services/api';

export default function BaselineTracker({ questions, userId, onComplete }) {
  // Constants
  const totalSteps = 10; // Baseline test length

  // State
  const [currentQuestion, setCurrentQuestion] = useState(questions[0]);
  const [currentAnswers, setCurrentAnswers] = useState(questions[0]?.answers || []);
  const [currentStep, setCurrentStep] = useState(1);
  const [currentLevel, setCurrentLevel] = useState(5); // Start at level 5
  const [answer, setAnswer] = useState('');
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Enable/disable submit button based on answer
  useEffect(() => {
    setIsDisabled(!answer);
  }, [answer]);

  // Save question attempt to localStorage
  const saveAttempt = () => {
    const attempts = JSON.parse(localStorage.getItem('baselineQuestionsObj')) || [];
    
    attempts.push({
      question: currentQuestion,
      level: currentLevel,
      answer,
      isCorrect: isAnswerCorrect,
      actualAnswer: currentAnswers.find((ans) => ans.isCorrect === true)
    });

    localStorage.setItem('baselineQuestionsObj', JSON.stringify(attempts));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      saveAttempt();

      // Update level based on answer
      const nextLevel = isAnswerCorrect
        ? Math.min(currentLevel + 1, 10)
        : Math.max(currentLevel - 1, 1);
      setCurrentLevel(nextLevel);

      // Check if baseline test is complete
      if (currentStep >= totalSteps) {
        await updateUserElo(userId, nextLevel);
        onComplete(nextLevel);
        return;
      }

      // Find next question at appropriate level
      const nextQuestion = questions.find(q => q.level === nextLevel) || questions[0];
      setCurrentQuestion(nextQuestion);
      setCurrentAnswers(nextQuestion.answers || []);
      setCurrentStep(prev => prev + 1);
      setAnswer('');
      setIsAnswerCorrect(false);
      setIsDisabled(true);
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        <BaselineQuestionHeader
          currentStep={currentStep}
          totalSteps={totalSteps}
        />
        <div>
          <QuestionTemplate question={currentQuestion.questionText} />
        </div>
        <div>
          <AnswerWrapper
            question={currentQuestion}
            currAnswers={currentAnswers}
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
          submitAnswer={handleSubmit}
        />
      </div>
    </div>
  );
}
