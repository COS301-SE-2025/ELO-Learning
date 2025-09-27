/**
 * Alternative Math Input Implementation using contenteditable div
 * Use this if textarea + inputMode="none" still doesn't work on Android
 */

'use client';

import { useKeyboardManager } from '@/hooks/useKeyboardManager';
import { QUESTION_TYPES } from '@/utils/questionTypeDetection';
import { useRef, useState } from 'react';

export default function MathInputAlternative({
  correctAnswer,
  setStudentAnswer,
  setIsAnswerCorrect,
  setIsValidExpression,
  studentAnswer = '',
}) {
  const [inputValue, setInputValue] = useState(studentAnswer);
  const inputRef = useRef(null);

  // Initialize keyboard manager for Math Input questions
  const keyboard = useKeyboardManager(QUESTION_TYPES.MATH_INPUT);

  const handleInputChange = (value) => {
    setInputValue(value);
    setStudentAnswer(value);
  };

const insertSymbol = (symbol) => {
  const input = inputRef.current;
  if (!input) return;

  const selection = window.getSelection();
  if (selection.rangeCount === 0) {
    // No selection, append to end
    input.textContent += symbol;
  } else {
    // Insert at current cursor position
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(symbol));
    range.collapse(false); // Move cursor after inserted text
  }
  
  // Single state update
  setInputValue(input.textContent);
  setStudentAnswer(input.textContent);
};

  return (
    <div className="w-full space-y-6">
      {/* Alternative: contenteditable div instead of textarea */}
      <div
        ref={inputRef}
        contentEditable={
          !keyboard.isMobile || !keyboard.shouldUseCustomKeyboard
        }
        suppressContentEditableWarning={true}
        className={`math-input w-full p-4 text-lg border rounded-lg min-h-[80px] font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${'border-gray-300'}`}
        style={{
          fontSize: '16px', // Prevent zoom on Android
          userSelect: 'text',
          WebkitUserSelect: 'text',
          wordWrap: 'break-word',
          whiteSpace: 'pre-wrap',
        }}
        onInput={(e) => {
          const value = e.target.textContent;
          handleInputChange(value);
        }}
        onFocus={() => {
          if (keyboard.shouldUseCustomKeyboard) {
            keyboard.activateCustomKeyboard();
          }
        }}
        dangerouslySetInnerHTML={{ __html: inputValue }}
      />

      {/* Custom Keyboard - Only show on mobile when needed */}
      {keyboard.shouldUseCustomKeyboard && (
        <div className="w-full bg-[#421E68] rounded-lg overflow-hidden">
          <div className="p-4">
            <div className="grid grid-cols-4 gap-3">
              {['1', '2', '3', '+'].map((symbol) => (
                <button
                  key={symbol}
                  onClick={() => insertSymbol(symbol)}
                  className="h-12 w-full bg-white text-black rounded-md hover:bg-[#4D5DED] hover:text-white active:bg-[#FF6E99] transition-colors text-lg font-bold flex items-center justify-center"
                >
                  {symbol}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
