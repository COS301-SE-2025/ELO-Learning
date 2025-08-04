'use client';

import { useState, useEffect } from 'react';

export default function FillInBlankTemplate({ question, setAnswer }) {
  // Parse question text to find blanks marked with underscores or special syntax
  const [questionParts, setQuestionParts] = useState([]);
  const [blankAnswers, setBlankAnswers] = useState({});

  useEffect(() => {
    // Parse question text for blanks (assuming format like "The derivative of x^2 is ____")
    const text = question.questionText || question.fillInText || '';
    const parts = text.split(/____|\[blank\d*\]/g);
    const blanks = text.match(/____|\[blank\d*\]/g) || [];
    
    // Create question parts with blanks
    const parsedParts = [];
    for (let i = 0; i < parts.length; i++) {
      parsedParts.push({ type: 'text', content: parts[i] });
      if (i < blanks.length) {
        parsedParts.push({ type: 'blank', id: i });
      }
    }
    
    setQuestionParts(parsedParts);
  }, [question]);

  const handleBlankChange = (blankId, value) => {
    const newAnswers = { ...blankAnswers, [blankId]: value };
    setBlankAnswers(newAnswers);
    setAnswer(newAnswers);
  };

  const getBlankCount = () => {
    return questionParts.filter(part => part.type === 'blank').length;
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-600 mb-4">
        Fill in the blanks below to complete the statement or equation.
      </div>

      {/* Question with Blanks */}
      <div className="text-xl leading-relaxed p-6 bg-gray-50 rounded-lg">
        {questionParts.map((part, index) => (
          <span key={index}>
            {part.type === 'text' ? (
              part.content
            ) : (
              <input
                type="text"
                value={blankAnswers[part.id] || ''}
                onChange={(e) => handleBlankChange(part.id, e.target.value)}
                className="inline-block w-32 mx-1 px-2 py-1 border-b-2 border-[#7D32CE] bg-transparent text-center font-bold focus:outline-none focus:bg-white focus:rounded"
                placeholder="?"
              />
            )}
          </span>
        ))}
      </div>

      {/* Math Helper (if needed) */}
      {question.showMathHelper && (
        <div className="bg-white rounded-lg p-4 border">
          <div className="text-sm font-medium mb-3">Common Symbols:</div>
          <div className="grid grid-cols-4 gap-2">
            {['π', '∞', '±', '√', '²', '³', '∫', '∂'].map((symbol, index) => (
              <button
                key={index}
                onClick={() => {
                  // Insert into the first empty blank
                  const firstEmptyBlank = Object.keys(blankAnswers).find(key => !blankAnswers[key]) || '0';
                  const currentValue = blankAnswers[firstEmptyBlank] || '';
                  handleBlankChange(firstEmptyBlank, currentValue + symbol);
                }}
                className="h-10 bg-gray-100 hover:bg-[#7D32CE] hover:text-white rounded transition-colors font-bold"
              >
                {symbol}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="text-sm">
        {Object.keys(blankAnswers).length === getBlankCount() && 
         Object.values(blankAnswers).every(val => val && val.trim()) ? (
          <div className="text-green-600 flex items-center gap-2">
            <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</span>
            All blanks filled ({Object.keys(blankAnswers).length}/{getBlankCount()})
          </div>
        ) : (
          <div className="text-gray-500">
            Progress: {Object.values(blankAnswers).filter(val => val && val.trim()).length}/{getBlankCount()} blanks filled
          </div>
        )}
      </div>
    </div>
  );
}