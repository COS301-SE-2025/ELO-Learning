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
  const [numLives, setNumLives] = useState(() => {
    // Reset lives to 5 and clear localStorage (only in browser)
    if (typeof window !== 'undefined') {
      localStorage.setItem('lives', '5');
    }
    return 5;
  });

  // Listen for life loss events from match questions
  useEffect(() => {
    const handleMatchLifeLost = (event) => {
      console.log('🎮 Match question life lost:', event.detail);
      const newLives = Math.max(0, event.detail.newLives); // Ensure lives don't go below 0
      setNumLives(newLives);
      if (typeof window !== 'undefined') {
        localStorage.setItem('lives', newLives.toString());
      }
    };

    window.addEventListener('lifeLost', handleMatchLifeLost);
    
    return () => {
      window.removeEventListener('lifeLost', handleMatchLifeLost);
    };
  }, []);
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

  // Handle navigation when lives reach 0
  useEffect(() => {
    if (numLives <= 0) {
      router.push(`/end-screen?mode=${mode}`);
    }
  }, [numLives, mode, router]);

  const setLocalStorage = async () => {
    // Only proceed if we're in the browser
    if (typeof window === 'undefined') return;
    
    // Calculate time elapsed in seconds
    const timeElapsed = Math.round((Date.now() - questionStartTime) / 1000);

    const questionsObj = JSON.parse(
      localStorage.getItem('questionsObj') || '[]',
    );

    // Get ALL correct answers, not just the first one
    const correctAnswers = currAnswers
      .filter((answer) => answer.isCorrect)
      .map((answer) => answer.answer_text || answer.answerText)
      .filter(Boolean);

    // Check if student answer matches ANY of the correct answers
    let revalidatedResult = false;
    let matchedAnswer = null;
    let correctAnswerObj = null;

    for (const correctAnswer of correctAnswers) {
      const individualResult = await validateAnswerEnhanced(
        answer,
        correctAnswer,
        currQuestion?.questionText || '',
        currQuestion?.type || 'Math Input',
      );

      if (individualResult) {
        revalidatedResult = true;
        matchedAnswer = correctAnswer;
        // Find the original answer object for this matched answer
        correctAnswerObj = currAnswers.find(ans => 
          (ans.answer_text || ans.answerText) === correctAnswer
        );
        break; // Found a match, no need to check further
      }
    }

    // If no match found, use the first correct answer as fallback for storage
    if (!correctAnswerObj) {
      correctAnswerObj = currAnswers.find((ans) => ans.isCorrect === true);
    }

    console.log('💾 Storing question with validation:', {
      studentAnswer: answer,
      correctAnswers: correctAnswers,
      oldIsCorrect: isAnswerCorrect,
      newIsCorrect: revalidatedResult,
      matchedAnswer: matchedAnswer,
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
      setNumLives((prev) => {
        const newLives = Math.max(0, prev - 1);
        if (typeof window !== 'undefined') {
          localStorage.setItem('lives', newLives.toString());
        }
        return newLives;
      });
      
      if (numLives <= 1) {
        return true; // Game over
      }
    }
    return false;
  };

  const submitAnswer = async () => {
    // Get ALL correct answers, not just the first one
    const correctAnswers = currAnswers
      .filter((answer) => answer.isCorrect)
      .map((answer) => answer.answer_text || answer.answerText)
      .filter(Boolean);

    // Check if student answer matches ANY of the correct answers
    let freshValidationResult = false;
    let matchedAnswer = null;

    for (const correctAnswer of correctAnswers) {
      const individualResult = await validateAnswerEnhanced(
        answer,
        correctAnswer,
        currQuestion?.questionText || '',
        currQuestion?.type || 'Math Input',
      );

      if (individualResult) {
        freshValidationResult = true;
        matchedAnswer = correctAnswer;
        break; // Found a match, no need to check further
      }
    }

    console.log('🔄 Fresh validation for life calculation:', {
      studentAnswer: answer,
      correctAnswers: correctAnswers,
      isCorrect: freshValidationResult,
      matchedAnswer: matchedAnswer,
    });

    await setLocalStorage();
    const gameOver = handleLives(freshValidationResult); // Pass fresh result

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

    // ✅ Safe access to next question
    const nextQuestion = allQuestions[currentStep] || null;
    setCurrQuestion(nextQuestion);
    setCurrAnswers(nextQuestion?.answers || []);
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
