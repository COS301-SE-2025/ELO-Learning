// ui/answers/open-response.jsx - Themed version
'use client';

import { useEffect, useState } from 'react';

export default function OpenResponseTemplate({
  setAnswer,
  answer = '',
  setIsAnswerCorrect,
}) {
  const [inputValue, setInputValue] = useState('');

  // Reset input when answer prop changes (new question) or when it's empty
  useEffect(() => {
    setInputValue(answer || '');
  }, [answer]);

  useEffect(() => {
    // Update parent components
    setAnswer(inputValue);
    // For open response, don't auto-validate here - let the parent handle it
    // We'll just indicate if there's content for basic UI feedback
    // The actual validation happens in the answer-wrapper
  }, [inputValue]); // Remove setAnswer and setIsAnswerCorrect from dependencies

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    // Immediately call setAnswer to trigger validation in the parent
    setAnswer(value);
  };

  return (
    <div className="w-full space-y-4">
      <div className="space-y-2">
        {/* Text Area with enhanced styling */}
        <textarea
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Write your answer"
          className="w-full p-4 resize-none text-sm min-h-[200px]
                     focus:outline-none
                     transition-all duration-200 text-[var(--color-foreground)]"
          style={{
            border: '1px solid var(--grey)',
            borderRadius: '5px',
            boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.8)',
          }}
          onFocus={(e) => {
            e.target.style.border = '1px solid var(--radical-rose)';
            e.target.style.boxShadow = '0 0 0 1px rgba(125, 50, 206, 0.2)';
          }}
          onBlur={(e) => {
            e.target.style.border = '1px solid var(--color-foreground)';
            e.target.style.boxShadow = '0 0 0 1px rgba(255, 255, 255, 0.8)';
          }}
          rows={8}
        />

        {/* Character count or word count (optional) */}
        <div className="text-xs text-right">{inputValue.length} characters</div>
      </div>
    </div>
  );
}
