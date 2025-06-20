'use client';

import { quickValidateMath, validateMathExpression } from '@/utils/api';
import 'katex/dist/katex.min.css';
import { useEffect, useRef, useState } from 'react';
import { InlineMath } from 'react-katex';

export default function MathInputTemplate({
  correctAnswer,
  setStudentAnswer,
  setIsAnswerCorrect,
  setIsValidExpression,
  studentAnswer = '',
}) {
  const [inputValue, setInputValue] = useState(studentAnswer);
  const [validationMessage, setValidationMessage] = useState('');
  const [localIsValidExpression, setLocalIsValidExpression] = useState(true);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [showHistory, setShowHistory] = useState(false);
  const [inputHistory, setInputHistory] = useState([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const inputRef = useRef(null);

  // Advanced math symbol categories
  const mathCategories = {
    basic: {
      label: 'Basic',
      icon: '±',
      symbols: [
        { symbol: '+', label: '+', description: 'Addition' },
        { symbol: '-', label: '−', description: 'Subtraction' },
        { symbol: '*', label: '×', description: 'Multiplication' },
        { symbol: '/', label: '÷', description: 'Division' },
        { symbol: '(', label: '(', description: 'Open parenthesis' },
        { symbol: ')', label: ')', description: 'Close parenthesis' },
        { symbol: '^', label: 'xⁿ', description: 'Exponent' },
        { symbol: 'sqrt(', label: '√', description: 'Square root' },
        { symbol: '=', label: '=', description: 'Equals' },
      ],
    },
    functions: {
      label: 'Functions',
      icon: 'ƒ',
      symbols: [
        { symbol: 'sin(', label: 'sin', description: 'Sine function' },
        { symbol: 'cos(', label: 'cos', description: 'Cosine function' },
        { symbol: 'tan(', label: 'tan', description: 'Tangent function' },
        { symbol: 'asin(', label: 'sin⁻¹', description: 'Arcsine' },
        { symbol: 'acos(', label: 'cos⁻¹', description: 'Arccosine' },
        { symbol: 'atan(', label: 'tan⁻¹', description: 'Arctangent' },
        { symbol: 'log(', label: 'log', description: 'Logarithm base 10' },
        { symbol: 'ln(', label: 'ln', description: 'Natural logarithm' },
        { symbol: 'abs(', label: '|x|', description: 'Absolute value' },
      ],
    },
    constants: {
      label: 'Constants',
      icon: 'π',
      symbols: [
        { symbol: 'pi', label: 'π', description: 'Pi (3.14159...)' },
        { symbol: 'e', label: 'e', description: "Euler's number (2.718...)" },
        { symbol: 'infinity', label: '∞', description: 'Infinity' },
        { symbol: 'i', label: 'i', description: 'Imaginary unit' },
        { symbol: 'phi', label: 'φ', description: 'Golden ratio' },
        { symbol: '±', label: '±', description: 'Plus or minus' },
      ],
    },
    advanced: {
      label: 'Advanced',
      icon: '∫',
      symbols: [
        { symbol: 'derivative(', label: '∂/∂x', description: 'Derivative' },
        { symbol: 'integral(', label: '∫', description: 'Integral' },
        { symbol: 'sum(', label: 'Σ', description: 'Summation' },
        { symbol: 'prod(', label: '∏', description: 'Product' },
        { symbol: 'limit(', label: 'lim', description: 'Limit' },
        { symbol: 'matrix(', label: '[]', description: 'Matrix' },
        { symbol: '∈', label: '∈', description: 'Element of' },
        { symbol: '∅', label: '∅', description: 'Empty set' },
        { symbol: '∀', label: '∀', description: 'For all' },
      ],
    },
    templates: {
      label: 'Templates',
      icon: '📐',
      symbols: [
        { symbol: 'frac{}{', label: 'a/b', description: 'Fraction template' },
        { symbol: '^{}', label: 'xⁿ', description: 'Exponent template' },
        { symbol: '_{', label: 'x₍ₙ₎', description: 'Subscript template' },
        { symbol: 'sqrt{}', label: '√x', description: 'Square root template' },
        { symbol: 'cbrt{}', label: '∛x', description: 'Cube root template' },
        {
          symbol: 'binom{}{',
          label: '(n k)',
          description: 'Binomial coefficient',
        },
      ],
    },
  };

  // Auto-completion suggestions
  const autoCompletions = [
    { trigger: 'sin', completion: 'sin()', description: 'Sine function' },
    { trigger: 'cos', completion: 'cos()', description: 'Cosine function' },
    { trigger: 'tan', completion: 'tan()', description: 'Tangent function' },
    { trigger: 'log', completion: 'log()', description: 'Logarithm' },
    { trigger: 'ln', completion: 'ln()', description: 'Natural log' },
    { trigger: 'sqrt', completion: 'sqrt()', description: 'Square root' },
    { trigger: 'abs', completion: 'abs()', description: 'Absolute value' },
    { trigger: 'pi', completion: 'π', description: 'Pi constant' },
    { trigger: 'inf', completion: '∞', description: 'Infinity' },
  ];

  // Real-time expression validation
  useEffect(() => {
    const validateExpression = async () => {
      if (!inputValue.trim()) {
        setValidationMessage('');
        setLocalIsValidExpression(true);
        setShowErrorMessage(false);
        setIsValidExpression?.(true);
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      // Check for auto-completions
      const currentWord = getCurrentWord(inputValue, cursorPosition);
      if (currentWord.length > 1) {
        const matchingSuggestions = autoCompletions.filter((ac) =>
          ac.trigger.startsWith(currentWord.toLowerCase()),
        );
        setSuggestions(matchingSuggestions);
        setShowSuggestions(matchingSuggestions.length > 0);
      } else {
        setShowSuggestions(false);
      }

      try {
        const result = await validateMathExpression(inputValue);
        if (result.success) {
          setLocalIsValidExpression(result.data.isValid);
          setIsValidExpression?.(result.data.isValid);
          setValidationMessage(result.data.message);

          if (!result.data.isValid) {
            setTimeout(() => {
              setShowErrorMessage(true);
            }, 1500);
          } else {
            setShowErrorMessage(false);
          }
        }
      } catch (error) {
        console.error('Validation error:', error);
      }
    };

    const timeoutId = setTimeout(validateExpression, 300);
    return () => clearTimeout(timeoutId);
  }, [inputValue, cursorPosition, setIsValidExpression]);

  // Sync with parent studentAnswer prop
  useEffect(() => {
    setInputValue(studentAnswer);
  }, [studentAnswer]);

  // Reset error message when typing
  useEffect(() => {
    if (inputValue.trim()) {
      setShowErrorMessage(false);
    }
  }, [inputValue]);

  // Quick validation against correct answer
  useEffect(() => {
    const quickCheck = async () => {
      if (!inputValue.trim() || !correctAnswer || !localIsValidExpression) {
        setIsAnswerCorrect(false);
        return;
      }

      setIsChecking(true);
      try {
        const result = await quickValidateMath(inputValue, correctAnswer);
        if (result.success) {
          setIsAnswerCorrect(result.data.isCorrect);
        }
      } catch (error) {
        console.error('Quick validation error:', error);
        setIsAnswerCorrect(false);
      } finally {
        setIsChecking(false);
      }
    };

    const timeoutId = setTimeout(quickCheck, 500);
    return () => clearTimeout(timeoutId);
  }, [inputValue, correctAnswer, localIsValidExpression, setIsAnswerCorrect]);

  const getCurrentWord = (text, position) => {
    const beforeCursor = text.substring(0, position);
    const match = beforeCursor.match(/[a-zA-Z]+$/);
    return match ? match[0] : '';
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setStudentAnswer(value);
    setCursorPosition(e.target.selectionStart);
  };

  const handleCursorPosition = (e) => {
    setCursorPosition(e.target.selectionStart);
  };

  const insertSymbol = (symbol, shouldMoveCursor = true) => {
    const input = inputRef.current;
    if (!input) return;

    const start = input.selectionStart;
    const end = input.selectionEnd;
    const newValue =
      inputValue.substring(0, start) + symbol + inputValue.substring(end);

    setInputValue(newValue);
    setStudentAnswer(newValue);

    // Add to history
    if (!inputHistory.includes(symbol)) {
      setInputHistory((prev) => [symbol, ...prev.slice(0, 9)]); // Keep last 10
    }

    if (shouldMoveCursor) {
      setTimeout(() => {
        input.focus();
        const newPosition = start + symbol.length;
        input.setSelectionRange(newPosition, newPosition);
        setCursorPosition(newPosition);
      }, 0);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const currentWord = getCurrentWord(inputValue, cursorPosition);
    const start = cursorPosition - currentWord.length;
    const newValue =
      inputValue.substring(0, start) +
      suggestion.completion +
      inputValue.substring(cursorPosition);

    setInputValue(newValue);
    setStudentAnswer(newValue);
    setShowSuggestions(false);

    setTimeout(() => {
      inputRef.current?.focus();
      const newPosition = start + suggestion.completion.length;
      inputRef.current?.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const clearInput = () => {
    setInputValue('');
    setStudentAnswer('');
    inputRef.current?.focus();
  };

  const backspace = () => {
    const input = inputRef.current;
    if (!input) return;

    const start = input.selectionStart;
    const end = input.selectionEnd;

    if (start === end && start > 0) {
      const newValue =
        inputValue.substring(0, start - 1) + inputValue.substring(start);
      setInputValue(newValue);
      setStudentAnswer(newValue);
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start - 1, start - 1);
      }, 0);
    }
  };

  const handleKeyDown = (e) => {
    // Handle special keys
    if (e.key === 'Tab' && showSuggestions && suggestions.length > 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[0]);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Enhanced Input Field */}
      <div className="relative">
        <textarea
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onSelect={handleCursorPosition}
          onKeyDown={handleKeyDown}
          placeholder="Enter your mathematical expression..."
          style={{ color: '#000000' }} // Force black text
          className={`w-full p-4 text-lg border-2 rounded-lg focus:outline-none transition-colors resize-none min-h-[80px] font-mono ${
            !localIsValidExpression
              ? 'border-red-500 focus:border-red-600'
              : isChecking
                ? 'border-yellow-500 focus:border-yellow-600'
                : 'border-gray-300 focus:border-blue-500'
          }`}
          rows={2}
        />

        {/* Validation indicator */}
        <div className="absolute right-3 top-4">
          {isChecking ? (
            <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
          ) : inputValue.trim() && localIsValidExpression ? (
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">✓</span>
            </div>
          ) : inputValue.trim() && !localIsValidExpression ? (
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">✗</span>
            </div>
          ) : null}
        </div>

        {/* Auto-suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-2 text-left hover:bg-blue-50 flex justify-between items-center border-b border-gray-100 last:border-b-0"
              >
                <div>
                  <span className="font-mono text-blue-600">
                    {suggestion.completion}
                  </span>
                  <span className="text-gray-600 ml-2 text-sm">
                    {suggestion.description}
                  </span>
                </div>
                <span className="text-xs text-gray-400">Tab</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Validation Message */}
      {validationMessage && showErrorMessage && !localIsValidExpression && (
        <div className="animate-fade-in">
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
            {validationMessage}
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={clearInput}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Clear
        </button>
        <button
          onClick={backspace}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          ⌫
        </button>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          History
        </button>
      </div>

      {/* History panel */}
      {showHistory && inputHistory.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="text-sm text-gray-700 mb-2 font-medium">
            Recently Used:
          </div>
          <div className="flex flex-wrap gap-2">
            {inputHistory.map((symbol, index) => (
              <button
                key={index}
                onClick={() => insertSymbol(symbol)}
                className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-blue-50 hover:border-blue-400 text-sm"
              >
                {symbol}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tabbed Symbol Categories */}
      <div className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Tab headers */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          {Object.entries(mathCategories).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 px-3 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === key
                  ? 'bg-blue-500 text-white border-b-2 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-lg">{category.icon}</span>
              <span className="hidden sm:inline">{category.label}</span>
            </button>
          ))}
        </div>

        {/* Symbol grid */}
        <div className="p-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {mathCategories[activeTab].symbols.map((item, index) => (
              <button
                key={index}
                onClick={() => insertSymbol(item.symbol)}
                title={item.description}
                className="h-12 w-full bg-white border border-gray-300 rounded-md hover:bg-blue-50 hover:border-blue-400 active:bg-blue-100 transition-colors text-lg font-bold text-gray-800 shadow-sm flex items-center justify-center"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live LaTeX Preview */}
      {inputValue.trim() && localIsValidExpression && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="text-sm text-blue-700 mb-2 font-medium">Preview:</div>
          <div className="text-xl">
            <InlineMath math={inputValue} />
          </div>
        </div>
      )}

      {/* Helper Text */}
      <div className="text-xs text-gray-500 space-y-1 bg-gray-50 p-3 rounded-lg">
        <p>
          <strong>Tips:</strong>
        </p>
        <p>• Use Tab to accept suggestions</p>
        <p>• Click symbols or type directly</p>
        <p>• Use ^ for exponents (e.g., x^2)</p>
        <p>• Use * for multiplication (e.g., 2*x)</p>
        <p>• Functions auto-close parentheses</p>
      </div>
    </div>
  );
}
