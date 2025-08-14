'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import AnswerWrapper from '@/app/ui/answers/answer-wrapper';
import QuestionTemplate from '@/app/ui/question-template';
import QuestionFooter from '@/app/ui/questions/question-footer';
import QuestionHeader from '@/app/ui/questions/question-header';
import { validateAnswerEnhanced } from '@/utils/answerValidator';
import { resetXPCalculationState } from '@/utils/gameSession';

export default function QuestionsTracker({
  questions,
  submitCallback,
  lives,
  mode,
  resetXPState,
}) {
  const router = useRouter();

  // ✅ Safe array handling
  const allQuestions = questions || [];
  const totalSteps = allQuestions.length;

  // ✅ Safe initialization
  const [currQuestion, setCurrQuestion] = useState(allQuestions[0] || null);
  const [currAnswers, setCurrAnswers] = useState(currQuestion?.answers || []);
  const [currentStep, setCurrentStep] = useState(1);
  const [isDisabled, setIsDisabled] = useState(true);
  const [answer, setAnswer] = useState('');
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [numLives, setNumLives] = useState(lives || 5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  // ✅ Early return if no questions
  if (!allQuestions || allQuestions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8">
          <div className="text-4xl mb-4">📝</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            No Questions Available
          </h2>
          <p className="text-gray-600">
            No questions found for this practice session.
          </p>
        </div>
      </div>
    );
  }

  // ✅ Handle case where current question is null
  if (!currQuestion) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8">
          <div className="text-2xl text-gray-600">Loading question...</div>
        </div>
      </div>
    );
  }

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

  // Reset XP calculation state for new game session
  useEffect(() => {
    if (resetXPState) {
      const success = resetXPCalculationState();
      if (success) {
        console.log('🎮 New game session started - XP calculation state reset');
      }
    }
  }, [resetXPState]);

  const setLocalStorage = async () => {
    // Calculate time elapsed in seconds
    const timeElapsed = Math.round((Date.now() - questionStartTime) / 1000);

    const questionsObj = JSON.parse(
      localStorage.getItem('questionsObj') || '[]',
    );

    // Find the correct answer
    const correctAnswerObj = currAnswers.find((ans) => ans.isCorrect === true);
    const correctAnswerText = correctAnswerObj?.answer_text || correctAnswerObj;

    // ✅ Re-validate with new validator before storing
    const revalidatedResult = await validateAnswerEnhanced(
      answer,
      correctAnswerText,
      currQuestion?.questionText || '',
      currQuestion?.type || 'Math Input', // Use question type if available, fallback to Math Input
    );

    console.log('💾 Storing question with validation:', {
      studentAnswer: answer,
      correctAnswer: correctAnswerText,
      oldIsCorrect: isAnswerCorrect,
      newIsCorrect: revalidatedResult,
      questionText: currQuestion?.questionText?.substring(0, 50) + '...',
    });

    questionsObj.push({
      question: currQuestion,
      q_index: currentStep,
      answer: answer,
      isCorrect: revalidatedResult, // ✅ Use fresh validation instead of isAnswerCorrect
      actualAnswer: correctAnswerObj,
      timeElapsed: timeElapsed,
    });

    localStorage.setItem('questionsObj', JSON.stringify(questionsObj));
  };

  const handleLives = (validationResult) => {
    // Use the passed validation result instead of the old state
    if (!validationResult) {
      setNumLives((prev) => prev - 1);
      if (numLives <= 1) {
        router.push(`/end-screen?mode=${mode}`);
        return true;
      }
    }
    return false;
  };

  const submitAnswer = async () => {
    try {
      setIsSubmitting(true);

      // Get fresh validation result before handling lives
      const correctAnswerObj = currAnswers.find(
        (ans) => ans.isCorrect === true,
      );
      const correctAnswerText =
        correctAnswerObj?.answer_text || correctAnswerObj;

      const freshValidationResult = await validateAnswerEnhanced(
        answer,
        correctAnswerText,
        currQuestion?.questionText || '',
        currQuestion?.type || 'Math Input',
      );

      console.log('🔄 Fresh validation for life calculation:', {
        studentAnswer: answer,
        correctAnswer: correctAnswerText,
        isCorrect: freshValidationResult,
      });

      await setLocalStorage();
      const gameOver = handleLives(freshValidationResult);

      if (gameOver) {
        return;
      }

      // Increment the current step and reset states
      setCurrentStep((prev) => prev + 1);
      setIsDisabled(true);
      setAnswer('');
      setIsAnswerCorrect(false);

      if (currentStep >= allQuestions.length) {
        submitCallback();
        return;
      }

      // Safe access to next question
      const nextQuestion = allQuestions[currentStep] || null;
      setCurrQuestion(nextQuestion);
      setCurrAnswers(nextQuestion?.answers || []);
    } catch (error) {
      console.error('Error in submitAnswer:', error);

      // Show error feedback to user
      alert('Failed to submit answer. Please try again.');

      // Reset submitting state but don't move to next question
      setIsSubmitting(false);
    }
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
            question={currQuestion?.questionText || 'Loading...'}
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
