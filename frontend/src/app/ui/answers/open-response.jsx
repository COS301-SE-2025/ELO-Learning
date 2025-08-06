// ui/answers/open-response.jsx
'use client';

import { useState, useEffect } from 'react';

export default function OpenResponseTemplate({
  setAnswer,
  answer = '',
  setIsAnswerCorrect,
}) {
  const [inputValue, setInputValue] = useState(answer);
  const [characterCount, setCharacterCount] = useState(0);
  const [isValidLength, setIsValidLength] = useState(false);

  const MIN_LENGTH = 20;
  const MAX_LENGTH = 2000;

  useEffect(() => {
    const trimmedLength = inputValue.trim().length;
    setCharacterCount(trimmedLength);
    setIsValidLength(
      trimmedLength >= MIN_LENGTH && trimmedLength <= MAX_LENGTH,
    );

    // Update parent components
    setAnswer(inputValue);
    setIsAnswerCorrect(trimmedLength >= MIN_LENGTH);
  }, [inputValue, setAnswer, setIsAnswerCorrect]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_LENGTH) {
      setInputValue(value);
    }
  };

  const getCharacterCountColor = () => {
    if (characterCount < MIN_LENGTH) return 'text-red-500';
    if (characterCount > MAX_LENGTH * 0.9) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="w-full space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Write your detailed explanation or step-by-step solution:
        </label>

        {/* Text Area */}
        <textarea
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Explain your reasoning step by step..."
          className={`w-full p-4 border rounded-lg resize-none font-mono text-sm min-h-[200px] ${
            !isValidLength && characterCount > 0
              ? 'border-red-500 focus:border-red-600'
              : isValidLength
                ? 'border-green-500 focus:border-green-600'
                : 'border-gray-300 focus:border-purple-500'
          } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
          rows={8}
        />

        {/* Character Counter and Validation */}
        <div className="flex justify-between items-center text-sm">
          <div className={getCharacterCountColor()}>
            {characterCount < MIN_LENGTH ? (
              <span>
                {MIN_LENGTH - characterCount} more characters needed (minimum{' '}
                {MIN_LENGTH})
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </span>
                Great! Keep writing to strengthen your answer.
              </span>
            )}
          </div>

          <div className={`${getCharacterCountColor()} font-mono`}>
            {characterCount}/{MAX_LENGTH}
          </div>
        </div>
      </div>

      {/* Writing Tips */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-purple-800 mb-2">
          💡 Writing Tips:
        </h4>
        <ul className="text-xs text-purple-700 space-y-1">
          <li>• Show your work step by step</li>
          <li>• Explain your reasoning clearly</li>
          <li>• Use proper mathematical notation</li>
          <li>• Check your answer makes sense</li>
        </ul>
      </div>
    </div>
  );
}
