/**
 * Example Keyboard Demo Component
 * Demonstrates the keyboard management system for different question types
 */

'use client';

import KeyboardWrapper from '@/components/KeyboardWrapper';
import { useKeyboardManager } from '@/hooks/useKeyboardManager';
import { QUESTION_TYPES } from '@/utils/questionTypeDetection';
import { useState } from 'react';

export default function KeyboardDemo() {
  const [selectedQuestionType, setSelectedQuestionType] = useState(
    QUESTION_TYPES.MATH_INPUT,
  );
  const [keyboardState, setKeyboardState] = useState({});

  // Mock question object
  const mockQuestion = {
    type: selectedQuestionType,
    questionText: `Sample ${selectedQuestionType} question`,
    Q_id: 'demo-123',
  };

  const questionTypes = [
    { value: QUESTION_TYPES.MATH_INPUT, label: 'Math Input (Custom KB)' },
    { value: QUESTION_TYPES.OPEN_RESPONSE, label: 'Open Response (Native KB)' },
    { value: QUESTION_TYPES.MULTIPLE_CHOICE, label: 'Multiple Choice (No KB)' },
    {
      value: QUESTION_TYPES.EXPRESSION_BUILDER,
      label: 'Expression Builder (Custom KB)',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Keyboard Management Demo
        </h1>

        {/* Question Type Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Select Question Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questionTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedQuestionType(type.value)}
                className={`p-4 text-left rounded-lg border-2 transition-all ${
                  selectedQuestionType === type.value
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="font-medium">{type.label}</div>
                <div className="text-sm text-gray-600">
                  {type.value === QUESTION_TYPES.MATH_INPUT &&
                    '📱 Custom keyboard with math symbols'}
                  {type.value === QUESTION_TYPES.OPEN_RESPONSE &&
                    '⌨️ Native keyboard for text input'}
                  {type.value === QUESTION_TYPES.MULTIPLE_CHOICE &&
                    '👆 Touch-only interaction'}
                  {type.value === QUESTION_TYPES.EXPRESSION_BUILDER &&
                    '🔧 Custom expression keyboard'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Keyboard State Display */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Keyboard State</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Platform:</strong>{' '}
              {keyboardState.isMobile ? 'Mobile' : 'Desktop'}
              {keyboardState.isIOS && ' (iOS)'}
              {keyboardState.isAndroid && ' (Android)'}
            </div>
            <div>
              <strong>Keyboard Mode:</strong>{' '}
              {keyboardState.shouldUseCustomKeyboard
                ? 'Custom'
                : keyboardState.shouldUseNativeKeyboard
                  ? 'Native'
                  : 'None'}
            </div>
            <div>
              <strong>Custom KB Active:</strong>{' '}
              {keyboardState.isCustomKeyboardActive ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Native KB Visible:</strong>{' '}
              {keyboardState.isNativeKeyboardVisible ? 'Yes' : 'No'}
            </div>
            {keyboardState.keyboardHeight > 0 && (
              <div className="md:col-span-2">
                <strong>Keyboard Height:</strong> {keyboardState.keyboardHeight}
                px
              </div>
            )}
          </div>
        </div>

        {/* Demo Question */}
        <KeyboardWrapper
          question={mockQuestion}
          onKeyboardStateChange={setKeyboardState}
          className="bg-white rounded-lg shadow-md"
        >
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Demo Question</h2>
            <p className="mb-6 text-gray-700">{mockQuestion.questionText}</p>

            <DemoQuestionComponent questionType={selectedQuestionType} />
          </div>
        </KeyboardWrapper>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            Instructions
          </h3>
          <ul className="text-blue-700 space-y-2 text-sm">
            <li>• Try different question types to see keyboard behavior</li>
            <li>
              • On mobile: Math Input prevents native keyboard, Open Response
              allows it
            </li>
            <li>• Watch the keyboard state indicators above</li>
            <li>• Test focus management by tapping input fields</li>
            <li>• Notice how the UI adapts to keyboard presence</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Demo component for different question types
function DemoQuestionComponent({ questionType }) {
  const keyboard = useKeyboardManager(questionType);
  const [inputValue, setInputValue] = useState('');
  const [selectedOption, setSelectedOption] = useState('');

  const insertSymbol = (symbol) => {
    if (keyboard.isMobile && keyboard.isCustomKeyboardActive) {
      keyboard.insertTextAtCursor(symbol);
      const input = keyboard.inputRef.current;
      if (input) {
        setInputValue(input.value);
      }
    } else {
      // Desktop fallback
      setInputValue((prev) => prev + symbol);
    }
  };

  switch (questionType) {
    case QUESTION_TYPES.MATH_INPUT:
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter your mathematical expression:
            </label>
            <textarea
              {...keyboard.getInputProps({
                value: inputValue,
                onChange: (e) => setInputValue(e.target.value),
                placeholder: 'e.g., x^2 + 2x + 1',
                className:
                  'w-full p-3 border border-gray-300 rounded-lg resize-none',
              })}
              rows={3}
            />
          </div>

          {keyboard.shouldUseCustomKeyboard && (
            <div className="bg-purple-100 rounded-lg p-4">
              <div className="text-sm font-medium text-purple-800 mb-3">
                Custom Math Keyboard
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  'x',
                  'y',
                  '^',
                  '√',
                  '+',
                  '-',
                  '*',
                  '/',
                  '(',
                  ')',
                  '=',
                  'π',
                ].map((symbol) => (
                  <button
                    key={symbol}
                    onClick={() => insertSymbol(symbol)}
                    className="p-2 bg-white rounded border hover:bg-purple-50 text-center font-mono"
                  >
                    {symbol}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      );

    case QUESTION_TYPES.OPEN_RESPONSE:
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Write your detailed response:
          </label>
          <textarea
            {...keyboard.getInputProps({
              value: inputValue,
              onChange: (e) => setInputValue(e.target.value),
              placeholder: 'Explain your reasoning in detail...',
              className:
                'w-full p-3 border border-gray-300 rounded-lg resize-none',
            })}
            rows={6}
          />
          <div className="text-xs text-gray-500 mt-2">
            {inputValue.length} characters
          </div>
        </div>
      );

    case QUESTION_TYPES.MULTIPLE_CHOICE:
      return (
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700 mb-3">
            Select the correct answer:
          </div>
          {['Option A', 'Option B', 'Option C', 'Option D'].map(
            (option, index) => (
              <button
                key={index}
                onClick={() => setSelectedOption(option)}
                className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                  selectedOption === option
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                {option}
              </button>
            ),
          )}
        </div>
      );

    case QUESTION_TYPES.EXPRESSION_BUILDER:
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Build your expression:
            </label>
            <div className="p-3 border border-gray-300 rounded-lg bg-gray-50 min-h-[60px] font-mono">
              {inputValue || 'Click symbols below to build expression...'}
            </div>
          </div>

          <div className="bg-green-100 rounded-lg p-4">
            <div className="text-sm font-medium text-green-800 mb-3">
              Expression Builder
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[
                'x',
                'y',
                'z',
                '+',
                '-',
                '*',
                '/',
                '^',
                '(',
                ')',
                'sin',
                'cos',
                'log',
                '√',
                '∫',
              ].map((symbol) => (
                <button
                  key={symbol}
                  onClick={() => setInputValue((prev) => prev + symbol)}
                  className="p-2 bg-white rounded border hover:bg-green-50 text-center text-sm font-mono"
                >
                  {symbol}
                </button>
              ))}
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="text-gray-500 italic">
          Demo component for {questionType} not implemented.
        </div>
      );
  }
}
