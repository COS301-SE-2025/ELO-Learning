'use client';

import { useState, useEffect } from 'react';

export default function OpenResponseTemplate({ setAnswer, answer }) {
  const [inputValue, setInputValue] = useState(answer || '');
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    const words = inputValue
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    setWordCount(words.length);
  }, [inputValue]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setAnswer(value);
  };

  return (
    <div className="space-y-4">
      <div className="text-sm mb-2">
        Write your explanation or step-by-step solution below. Be detailed and
        show your work.
      </div>

      <textarea
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Enter your detailed response here..."
        className="w-full h-48 p-4 border-2 border-gray-300 rounded-lg resize-none focus:border-[#7D32CE] focus:outline-none text-black"
        maxLength={2000}
      />

      <div className="flex justify-between text-sm text-gray-500">
        <span>Words: {wordCount}</span>
        <span>{inputValue.length}/2000 characters</span>
      </div>

      {inputValue.length >= 10 && (
        <div className="text-green-600 text-sm flex items-center gap-2">
          <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
            ✓
          </span>
          Ready to submit
        </div>
      )}
    </div>
  );
}
