'use client';

import { Check, X } from 'lucide-react';
import { useState } from 'react';

export default function TrueFalseTemplate({
  question,
  answers,
  setAnswer,
  setIsAnswerCorrect,
}) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  // Debug logging
  console.log('TrueFalseTemplate - Rendering with:', { question, answers });
  console.log('TrueFalseTemplate - Question type:', question?.type);
  console.log('TrueFalseTemplate - Answers array:', answers);

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
    setAnswer(answer);

    // For true/false questions stored in the database, check against the answer data
    // First try to find the correct answer from the answers array
    let isCorrect = false;
    if (answers && answers.length > 0) {
      const correctAnswerObj = answers.find((ans) => ans.isCorrect);
      if (correctAnswerObj) {
        isCorrect =
          answer.toLowerCase() === correctAnswerObj.answer_text?.toLowerCase();
      }
    } else {
      // Fallback: check against question.correctAnswer if available
      const correctAnswer =
        question.correctAnswer ||
        question.answers?.find((ans) => ans.isCorrect)?.answer_text;
      if (correctAnswer) {
        isCorrect = answer.toLowerCase() === correctAnswer.toLowerCase();
      } else {
        // If no correct answer is available, we can't validate immediately
        // This will be handled by the backend when the answer is submitted
        console.warn(
          'No correct answer data available for True/False question validation',
        );
        isCorrect = null; // Indicate that validation is pending
      }
    }

    if (setIsAnswerCorrect && isCorrect !== null) {
      setIsAnswerCorrect(isCorrect);
    }
  };

  // Create the two answer options for True/False
  const trueOption = { id: 'true', answer_text: 'True', isCorrect: false }; // isCorrect will be determined by the backend data
  const falseOption = { id: 'false', answer_text: 'False', isCorrect: false };

  // Try to determine which option is correct based on the provided answers
  if (answers && answers.length > 0) {
    const correctAnswerObj = answers.find((ans) => ans.isCorrect);
    if (correctAnswerObj) {
      const correctText = correctAnswerObj.answer_text?.toLowerCase();
      if (correctText === 'true') {
        trueOption.isCorrect = true;
      } else if (correctText === 'false') {
        falseOption.isCorrect = true;
      }
    }
  } else {
    // If no answers are provided, we'll still render the options but can't validate immediately
    // This allows the component to render properly even when database answers are missing
    console.warn(
      'True/False question has no answers data - validation will use fallback logic',
    );
  }

  const handleAnswerSelectWithOption = (option) => {
    setSelectedAnswer(option.answer_text);
    setAnswer(option.answer_text);

    // For true/false questions stored in the database, check against the answer data
    let isCorrect = false;
    if (answers && answers.length > 0) {
      const correctAnswerObj = answers.find((ans) => ans.isCorrect);
      if (correctAnswerObj) {
        isCorrect =
          option.answer_text.toLowerCase() ===
          correctAnswerObj.answer_text?.toLowerCase();
      }
    } else {
      // Fallback: check against question.correctAnswer if available
      const correctAnswer =
        question.correctAnswer ||
        question.answers?.find((ans) => ans.isCorrect)?.answer_text;
      if (correctAnswer) {
        isCorrect =
          option.answer_text.toLowerCase() === correctAnswer.toLowerCase();
      } else {
        // If no correct answer is available, we can't validate immediately
        console.warn(
          'No correct answer data available for True/False question validation',
        );
        isCorrect = null; // Indicate that validation is pending
      }
    }

    if (setIsAnswerCorrect && isCorrect !== null) {
      setIsAnswerCorrect(isCorrect);
    }
  };

  return (
    <div className="space-y-6">
      {/* Debug Info - Remove this after testing */}
      <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-4">
        <div className="text-sm text-yellow-800">
          <strong>DEBUG - True/False Component:</strong>
          <br />
          Question ID: {question?.Q_id}
          <br />
          Question Type: {question?.type}
          <br />
          Answers Count: {answers?.length || 0}
          <br />
          Answers: {JSON.stringify(answers, null, 2)}
        </div>
      </div>

      <div className="text-center text-gray-600 mb-6">
        Select True or False for the statement above.
      </div>
    </div>
  );
}
