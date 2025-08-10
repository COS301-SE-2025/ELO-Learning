'use client';

import { Check, X } from 'lucide-react';
import { useState } from 'react';

export default function TrueFalseTemplate({ question, answers, setAnswer, setIsAnswerCorrect }) {
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
      const correctAnswerObj = answers.find(ans => ans.isCorrect);
      if (correctAnswerObj) {
        isCorrect = answer.toLowerCase() === correctAnswerObj.answer_text?.toLowerCase();
      }
    } else {
      // Fallback: check against question.correctAnswer if available
      const correctAnswer = question.correctAnswer || question.answers?.find(ans => ans.isCorrect)?.answer_text;
      if (correctAnswer) {
        isCorrect = answer.toLowerCase() === correctAnswer.toLowerCase();
      } else {
        // If no correct answer is available, we can't validate immediately
        // This will be handled by the backend when the answer is submitted
        console.warn('No correct answer data available for True/False question validation');
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
    const correctAnswerObj = answers.find(ans => ans.isCorrect);
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
    console.warn('True/False question has no answers data - validation will use fallback logic');
  }

  const handleAnswerSelectWithOption = (option) => {
    setSelectedAnswer(option.answer_text);
    setAnswer(option.answer_text);
    
    // For true/false questions stored in the database, check against the answer data
    let isCorrect = false;
    if (answers && answers.length > 0) {
      const correctAnswerObj = answers.find(ans => ans.isCorrect);
      if (correctAnswerObj) {
        isCorrect = option.answer_text.toLowerCase() === correctAnswerObj.answer_text?.toLowerCase();
      }
    } else {
      // Fallback: check against question.correctAnswer if available
      const correctAnswer = question.correctAnswer || question.answers?.find(ans => ans.isCorrect)?.answer_text;
      if (correctAnswer) {
        isCorrect = option.answer_text.toLowerCase() === correctAnswer.toLowerCase();
      } else {
        // If no correct answer is available, we can't validate immediately
        console.warn('No correct answer data available for True/False question validation');
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
          <strong>DEBUG - True/False Component:</strong><br/>
          Question ID: {question?.Q_id}<br/>
          Question Type: {question?.type}<br/>
          Answers Count: {answers?.length || 0}<br/>
          Answers: {JSON.stringify(answers, null, 2)}
        </div>
      </div>
      
      <div className="text-center text-gray-600 mb-6">
        Select True or False for the statement above.
      </div>

      {/* True/False Options - styled like multiple choice */}
      <div className="space-y-4">
        {[trueOption, falseOption].map((option) => (
          <button
            key={option.id}
            onClick={() => handleAnswerSelectWithOption(option)}
            className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
              selectedAnswer === option.answer_text
                ? 'bg-[#7D32CE] text-white border-[#7D32CE] shadow-lg transform scale-[1.02]'
                : 'bg-white text-black border-gray-300 hover:border-[#7D32CE] hover:shadow-md'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedAnswer === option.answer_text
                    ? 'border-white bg-white'
                    : 'border-gray-400'
                }`}
              >
                {selectedAnswer === option.answer_text && (
                  <div className="w-3 h-3 rounded-full bg-[#7D32CE]"></div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {option.answer_text === 'True' ? (
                  <Check 
                    size={20} 
                    className={selectedAnswer === option.answer_text ? 'text-white' : 'text-green-600'} 
                  />
                ) : (
                  <X 
                    size={20} 
                    className={selectedAnswer === option.answer_text ? 'text-white' : 'text-red-600'} 
                  />
                )}
                <span className="text-lg font-semibold">{option.answer_text}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Selected Answer Indicator */}
      {selectedAnswer && (
        <div className="text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
            selectedAnswer === 'True' 
              ? 'bg-green-100 text-green-800 border border-green-300' 
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}>
            {selectedAnswer === 'True' ? (
              <Check size={16} className="text-green-600" />
            ) : (
              <X size={16} className="text-red-600" />
            )}
            <span className="font-semibold">You selected: {selectedAnswer}</span>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="text-sm text-gray-700">
          <div className="font-semibold mb-2">Tips:</div>
          <ul className="space-y-1">
            <li>• Read the statement carefully</li>
            <li>• Consider if the statement is completely accurate</li>
            <li>• If any part of the statement is incorrect, the answer is False</li>
            <li>• You can change your answer by clicking the other option</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
