'use client';

import { Check, X } from 'lucide-react';
import { useState } from 'react';

export default function TrueFalseTemplate({ question, setAnswer, setIsAnswerCorrect }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
    setAnswer(answer);
    
    // For true/false questions, we need to check against the correct answer
    const correctAnswer = question.answers?.find(ans => ans.isCorrect)?.answer_text?.toLowerCase();
    const isCorrect = answer.toLowerCase() === correctAnswer;
    
    if (setIsAnswerCorrect) {
      setIsAnswerCorrect(isCorrect);
    }
  };

  const getButtonStyle = (answer) => {
    const baseStyle = "flex-1 flex items-center justify-center gap-3 p-6 rounded-xl border-2 transition-all duration-200 font-semibold text-lg";
    
    if (selectedAnswer === answer) {
      if (answer.toLowerCase() === 'true') {
        return `${baseStyle} bg-green-100 border-green-400 text-green-800 shadow-lg transform scale-[1.02]`;
      } else {
        return `${baseStyle} bg-red-100 border-red-400 text-red-800 shadow-lg transform scale-[1.02]`;
      }
    }
    
    if (answer.toLowerCase() === 'true') {
      return `${baseStyle} bg-white border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 hover:shadow-md`;
    } else {
      return `${baseStyle} bg-white border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 hover:shadow-md`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center text-gray-600 mb-6">
        Select True or False for the statement above.
      </div>

      {/* True/False Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => handleAnswerSelect('True')}
          className={getButtonStyle('True')}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            selectedAnswer === 'True' ? 'bg-green-600' : 'bg-green-200'
          }`}>
            <Check 
              size={20} 
              className={selectedAnswer === 'True' ? 'text-white' : 'text-green-600'} 
            />
          </div>
          <span>True</span>
        </button>

        <button
          onClick={() => handleAnswerSelect('False')}
          className={getButtonStyle('False')}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            selectedAnswer === 'False' ? 'bg-red-600' : 'bg-red-200'
          }`}>
            <X 
              size={20} 
              className={selectedAnswer === 'False' ? 'text-white' : 'text-red-600'} 
            />
          </div>
          <span>False</span>
        </button>
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
