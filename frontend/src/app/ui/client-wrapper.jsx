'use client';

import MathInputTemplate from '@/app/ui/math-input-template';
import MCTemplate from '@/app/ui/mc-template';
import ProgressBar from '@/app/ui/progress-bar';
import QuestionTemplate from '@/app/ui/question-template';
import { submitQuestionAnswer } from '@/utils/api';
import { Heart, X } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ClientWrapper({ questions }) {
  const allQuestions = questions;
  const totalSteps = allQuestions.length;

  const [currQuestion, setCurrQuestion] = useState(allQuestions[0]);
  const [currAnswers, setCurrAnswers] = useState(currQuestion.answers || []);
  const [currentStep, setCurrentStep] = useState(1);
  const [isDisabled, setIsDisabled] = useState(true);
  
  // For multiple choice
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isSelectedAnswerCorrect, setIsSelectedAnswerCorrect] = useState(false);
  
  // For math input
  const [studentAnswer, setStudentAnswer] = useState('');
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [isValidExpression, setIsValidExpression] = useState(true);
  
  // Feedback state
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine question type
  const isMathInputQuestion = currQuestion.type === 'math-input' || 
                             currQuestion.topic === 'Algebra' || 
                             currQuestion.topic === 'Calculus' ||
                             currQuestion.Q_id === 3 || 
                             !currAnswers || currAnswers.length === 0;

console.log('=== DEBUG INFO ===');
console.log('Current question:', currQuestion);
console.log('Question type:', currQuestion.type);
console.log('Question topic:', currQuestion.topic);
console.log('Question ID:', currQuestion.Q_id);
console.log('Current answers:', currAnswers);
console.log('Current answers length:', currAnswers?.length);
console.log('Is math input question?', isMathInputQuestion);
console.log('==================');

  // Enable/disable submit button
  useEffect(() => {
    if (isMathInputQuestion) {
      setIsDisabled(!studentAnswer.trim() || !isValidExpression);
    } else {
      setIsDisabled(!selectedAnswer);
    }
  }, [selectedAnswer, studentAnswer, isValidExpression, isMathInputQuestion]);

  const submitAnswer = async () => {
    setIsSubmitting(true);
    setShowFeedback(false);

    try {
      if (isMathInputQuestion) {
        // Submit math input answer
        const correctAnswer = currQuestion.correctAnswer || 
                             currAnswers.find(a => a.isCorrect)?.answerText || '';
        
        const result = await submitQuestionAnswer(
          currQuestion.Q_id, 
          studentAnswer, 
          'current-user-id' // Replace with actual user ID
        );

        if (result.success) {
          setFeedbackMessage(result.data.message);
          setShowFeedback(true);
          
          // Award XP if correct
          if (result.data.isCorrect && result.data.xpAwarded > 0) {
            console.log(`Awarded ${result.data.xpAwarded} XP!`);
          }
        }
      } else {
        // Handle multiple choice submission (existing logic)
        setFeedbackMessage(isSelectedAnswerCorrect ? 'Correct! Well done!' : 'Incorrect. Try again!');
        setShowFeedback(true);
      }

      // Move to next question after showing feedback
      setTimeout(() => {
        moveToNextQuestion();
      }, 2000);

    } catch (error) {
      console.error('Error submitting answer:', error);
      setFeedbackMessage('Error submitting answer. Please try again.');
      setShowFeedback(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const moveToNextQuestion = () => {
    if (currentStep >= allQuestions.length) {
      redirect('/dashboard');
      return;
    }

    // Reset state for next question
    setCurrentStep((prev) => prev + 1);
    setIsDisabled(true);
    setSelectedAnswer(null);
    setIsSelectedAnswerCorrect(false);
    setStudentAnswer('');
    setIsAnswerCorrect(false);
    setShowFeedback(false);
    setFeedbackMessage('');

    // Set next question
    const nextQuestion = allQuestions[currentStep];
    setCurrQuestion(nextQuestion);
    setCurrAnswers(nextQuestion.answers || []);
  };

  const getCorrectAnswer = () => {
    if (isMathInputQuestion) {
      // For Q_id === 1 (testing), return the known correct answer
      if (currQuestion.Q_id === 1) {
        return "6"; // The correct answer for the mean question
      }
      
      // For other questions, try multiple field names
      return currQuestion.correctAnswer || 
            currAnswers.find(a => a.isCorrect)?.answerText || 
            currAnswers.find(a => a.isCorrect)?.answer_text || // Add this line
            '';
    }
    return null;
  };

  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex flex-row items-center justify-between w-full py-2 gap-2">
          <Link href="/dashboard">
            <X size={24} />
          </Link>
          <div className="flex-1">
            <ProgressBar progress={currentStep / totalSteps} />
          </div>
          <div className="flex flex-row items-center justify-center gap-2">
            <Heart size={24} fill="#FF6E99" stroke="#FF6E99" />
            <p>5</p>
          </div>
        </div>

        {/* Question */}
        <div>
          <QuestionTemplate question={currQuestion.questionText} />
        </div>

        {/* Answer Interface */}
        <div className="m-2">
          {isMathInputQuestion ? (
            <MathInputTemplate
              correctAnswer={getCorrectAnswer()}
              setStudentAnswer={setStudentAnswer}
              setIsAnswerCorrect={setIsAnswerCorrect}
              setIsValidExpression={setIsValidExpression}
              studentAnswer={studentAnswer}
            />
          ) : (
            <MCTemplate
              answers={currAnswers}
              setSelectedAnswer={setSelectedAnswer}
              setIsSelectedAnswerCorrect={setIsSelectedAnswerCorrect}
            />
          )}
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div className={`m-4 p-4 rounded-lg text-center ${
            feedbackMessage.includes('Correct') || feedbackMessage.includes('Well done')
              ? 'bg-green-100 text-green-800 border border-green-300'
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}>
            {feedbackMessage}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div>
        <button
          type="button"
          disabled={isDisabled || isSubmitting}
          onClick={submitAnswer}
          className={`${
            isDisabled || isSubmitting ? 'disabled_button' : 'main-button'
          } px-4 py-5 w-full mt-10 flex items-center justify-center`}
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              SUBMITTING...
            </>
          ) : (
            'SUBMIT'
          )}
        </button>
      </div>
    </div>
  );
}