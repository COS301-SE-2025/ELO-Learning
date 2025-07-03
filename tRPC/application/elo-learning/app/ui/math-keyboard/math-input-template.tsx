'use client';

import React, { useEffect, useRef, useState } from 'react';
import { quickValidateMath, validateMathExpression } from '@/utils/api';
import 'katex/dist/katex.min.css';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { InlineMath } from 'react-katex';

// Type definitions
interface MathSymbol {
  symbol: string;
  label: string;
  description: string;
}

interface MathCategory {
  label: string;
  icon: string;
  symbols: MathSymbol[];
}

interface MathCategories {
  [key: string]: MathCategory;
}

interface AutoCompletion {
  trigger: string;
  completion: string;
  description: string;
}

interface ValidationResult {
  success: boolean;
  data?: {
    isValid: boolean;
    message: string;
  };
  error?: string;
}

interface QuickValidationResult {
  success: boolean;
  data?: {
    isCorrect: boolean;
  };
  error?: string;
}

interface MathInputTemplateProps {
  correctAnswer: string;
  setStudentAnswer: (answer: string) => void;
  setIsAnswerCorrect: (isCorrect: boolean) => void;
  setIsValidExpression: (isValid: boolean) => void;
  studentAnswer?: string;
}

export default function MathInputTemplate({
  correctAnswer,
  setStudentAnswer,
  setIsAnswerCorrect,
  setIsValidExpression,
  studentAnswer = '',
}: MathInputTemplateProps) {
  const [inputValue, setInputValue] = useState<string>(studentAnswer);
  const [validationMessage, setValidationMessage] = useState<string>('');
  const [localIsValidExpression, setLocalIsValidExpression] =
    useState<boolean>(true);
  const [showErrorMessage, setShowErrorMessage] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('basic');
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [inputHistory, setInputHistory] = useState<string[]>([]);
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [suggestions, setSuggestions] = useState<AutoCompletion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [showHelper, setShowHelper] = useState<boolean>(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Advanced math symbol categories
  const mathCategories: MathCategories = {
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
  const autoCompletions: AutoCompletion[] = [
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
    const validateExpression = async (): Promise<void> => {
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
        const result: ValidationResult =
          await validateMathExpression(inputValue);
        if (result.success && result.data) {
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
        } else {
          // Handle error case
          setLocalIsValidExpression(false);
          setIsValidExpression?.(false);
          setValidationMessage(result.error || 'Validation failed');
        }
      } catch (error) {
        console.error('Validation error:', error);
        setLocalIsValidExpression(false);
        setIsValidExpression?.(false);
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
    const quickCheck = async (): Promise<void> => {
      if (!inputValue.trim() || !correctAnswer || !localIsValidExpression) {
        setIsAnswerCorrect(false);
        return;
      }

      setIsChecking(true);
      try {
        const result: QuickValidationResult = await quickValidateMath(
          inputValue,
          correctAnswer,
        );
        if (result.success && result.data) {
          setIsAnswerCorrect(result.data.isCorrect);
        } else {
          setIsAnswerCorrect(false);
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

  const getCurrentWord = (text: string, position: number): string => {
    const beforeCursor = text.substring(0, position);
    const match = beforeCursor.match(/[a-zA-Z]+$/);
    return match ? match[0] : '';
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ): void => {
    const value = e.target.value;
    setInputValue(value);
    setStudentAnswer(value);
    setCursorPosition(e.target.selectionStart || 0);
  };

  const handleCursorPosition = (
    e: React.SyntheticEvent<HTMLTextAreaElement>,
  ): void => {
    const target = e.target as HTMLTextAreaElement;
    setCursorPosition(target.selectionStart || 0);
  };

  const insertSymbol = (
    symbol: string,
    shouldMoveCursor: boolean = true,
  ): void => {
    const input = inputRef.current;
    if (!input) return;

    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
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

  const handleSuggestionClick = (suggestion: AutoCompletion): void => {
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

  const clearInput = (): void => {
    setInputValue('');
    setStudentAnswer('');
    inputRef.current?.focus();
  };

  const backspace = (): void => {
    const input = inputRef.current;
    if (!input) return;

    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    // Handle special keys
    if (e.key === 'Tab' && showSuggestions && suggestions.length > 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[0]);
    }
  };

  return (
    <div className="w-full space-y-6">
      <p className="">
        Use the keyboard below or type your mathematical expression directly
      </p>
      {/* Enhanced Input Field */}
      <div className="relative">
        <textarea
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onSelect={handleCursorPosition}
          onKeyDown={handleKeyDown}
          placeholder="Enter your mathematical expression..."
          style={{ border: '1px solid' }} // Force black text
          className={`math-input w-full p-4 text-lg border rounded-lg resize-none min-h-[80px] font-mono ${
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
          <div className="absolute top-full left-0 right-0 mt-1 border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-2 text-left hover:bg-[#4D5DED] hover:text-white flex justify-between items-center border-b last:border-b-0"
              >
                <div>
                  <span className="font-mono">{suggestion.completion}</span>
                  <span className="ml-2 text-sm">{suggestion.description}</span>
                </div>
                <span className="text-xs">Tab</span>
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
      <div className="flex flex-row justify-between gap-2">
        <button
          onClick={clearInput}
          className="px-4 py-2 bg-white text-black rounded-lg hover:bg-[#4D5DED] hover:text-white transition-colors"
        >
          Clear
        </button>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="px-4 py-2 bg-white text-black rounded-lg hover:bg-[#4D5DED] hover:text-white transition-colors"
        >
          History
        </button>
        <button
          onClick={backspace}
          className="px-4 py-2 bg-[#7D32CE] text-white rounded-lg hover:bg-[#4D5DED] hover:text-white transition-colors"
        >
          ⌫
        </button>
      </div>

      {/* History panel */}
      {showHistory && inputHistory.length > 0 && (
        <div className="rounded-lg p-3 border">
          <div className="text-sm mb-2 font-medium">Recently Used:</div>
          <div className="flex flex-wrap gap-2">
            {inputHistory.map((symbol, index) => (
              <button
                key={index}
                onClick={() => insertSymbol(symbol)}
                className="px-3 py-1 bg-white text-black rounded hover:bg-[#4D5DED] hover:text-white text-sm"
              >
                {symbol}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tabbed Symbol Categories */}
      <div className="w-full bg-[#421E68] rounded-lg overflow-hidden">
        {/* Tab headers */}
        <div className="flex bg-[#7D32CE]">
          {Object.entries(mathCategories).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 px-3 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === key
                  ? 'bg-[#FF6E99] text-white'
                  : ' hover:bg-[#4D5DED] hover:text-white'
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
                className="h-12 w-full bg-white text-black rounded-md hover:bg-[#4D5DED] hover:text-white active:bg-[#FF6E99] transition-colors text-lg font-bold flex items-center justify-center"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live LaTeX Preview */}
      {inputValue.trim() && localIsValidExpression && (
        <div className="p-4 border rounded-lg">
          <div className="text-sm mb-2 font-medium">Preview:</div>
          <div className="text-xl">
            <InlineMath math={inputValue} />
          </div>
        </div>
      )}

      {/* Helper Text */}
      <div
        className="text-xs border p-3 rounded-lg cursor-pointer select-none"
        onClick={() => setShowHelper((prev) => !prev)}
      >
        <div className="flex items-center justify-between">
          <strong>Struggling? View some tips here</strong>
          <span className="ml-2">
            {showHelper ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </div>
        {showHelper && (
          <div className="space-y-1 mt-2">
            <p>• Use Tab to accept suggestions</p>
            <p>• Click symbols or type directly</p>
            <p>• Use ^ for exponents (e.g., x^2)</p>
            <p>• Use * for multiplication (e.g., 2*x)</p>
            <p>• Functions auto-close parentheses</p>
          </div>
        )}
      </div>
    </div>
  );
}
