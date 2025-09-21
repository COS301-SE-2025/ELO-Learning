// Updated math-input-template.jsx with contentEditable approach

'use client';

import { useKeyboardManager } from '@/hooks/useKeyboardManager';
import '@/styles/mobile-keyboard-prevention.css';
import {
  attachNonPassiveTouchHandler,
  handleAndroidFocus,
} from '@/utils/androidKeyboardPrevention';
import {
  clearContent,
  getCursorPosition,
  getTextContent,
  insertTextAtCursor,
  moveCursor,
  removeCursorIndicator,
  setTextContent,
  showCursorIndicator,
} from '@/utils/contentEditableHelpers';
import {
  getMathValidationMessage,
  isValidMathExpression,
} from '@/utils/frontendMathValidator';
import { getPlatformClasses } from '@/utils/platformDetection';
import { QUESTION_TYPES } from '@/utils/questionTypeDetection';
import 'katex/dist/katex.min.css';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { InlineMath } from 'react-katex';

export default function MathInputTemplate({
  correctAnswer,
  setStudentAnswer,
  setIsAnswerCorrect,
  setIsValidExpression,
  studentAnswer = '',
}) {
  const [inputValue, setInputValue] = useState(studentAnswer || '');
  const [validationMessage, setValidationMessage] = useState('');
  const [localIsValidExpression, setLocalIsValidExpression] = useState(true);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [showHistory, setShowHistory] = useState(false);
  const [inputHistory, setInputHistory] = useState([]);
  const [cursorPosition, setCursorPosition] = useState((studentAnswer || '').length);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showHelper, setShowHelper] = useState(false);

  const inputRef = useRef(null);

  // Initialize keyboard manager for Math Input questions
  const keyboard = useKeyboardManager(QUESTION_TYPES.MATH_INPUT);

  // Initialize DOM content on component mount
  useEffect(() => {
    const input = inputRef.current;
    if (input) {
      const initialValue = studentAnswer || '';
      setTextContent(input, initialValue, true, true);
      setCursorPosition(initialValue.length);
    }
  }, []); // Run only once on mount

  // Math symbol categories (same as before)
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
    numbers: {
      label: 'Numbers',
      icon: 'ℕ',
      symbols: [
        { symbol: '0', label: '0', description: 'Zero' },
        { symbol: '1', label: '1', description: 'One' },
        { symbol: '2', label: '2', description: 'Two' },
        { symbol: '3', label: '3', description: 'Three' },
        { symbol: '4', label: '4', description: 'Four' },
        { symbol: '5', label: '5', description: 'Five' },
        { symbol: '6', label: '6', description: 'Six' },
        { symbol: '7', label: '7', description: 'Seven' },
        { symbol: '8', label: '8', description: 'Eight' },
        { symbol: '9', label: '9', description: 'Nine' },
        { symbol: '.', label: '.', description: 'Decimal point' },
      ],
    },
    alphabet: {
      label: 'Letters',
      icon: 'Abc',
      symbols: [
        { symbol: 'a', label: 'a', description: 'Variable a' },
        { symbol: 'b', label: 'b', description: 'Variable b' },
        { symbol: 'c', label: 'c', description: 'Variable c' },
        { symbol: 'd', label: 'd', description: 'Variable d' },
        { symbol: 'e', label: 'e', description: 'Variable e' },
        { symbol: 'f', label: 'f', description: 'Variable f' },
        { symbol: 'g', label: 'g', description: 'Variable g' },
        { symbol: 'h', label: 'h', description: 'Variable h' },
        { symbol: 'i', label: 'i', description: 'Variable i' },
        { symbol: 'j', label: 'j', description: 'Variable j' },
        { symbol: 'k', label: 'k', description: 'Variable k' },
        { symbol: 'l', label: 'l', description: 'Variable l' },
        { symbol: 'm', label: 'm', description: 'Variable m' },
        { symbol: 'n', label: 'n', description: 'Variable n' },
        { symbol: 'o', label: 'o', description: 'Variable o' },
        { symbol: 'p', label: 'p', description: 'Variable p' },
        { symbol: 'q', label: 'q', description: 'Variable q' },
        { symbol: 'r', label: 'r', description: 'Variable r' },
        { symbol: 's', label: 's', description: 'Variable s' },
        { symbol: 't', label: 't', description: 'Variable t' },
        { symbol: 'u', label: 'u', description: 'Variable u' },
        { symbol: 'v', label: 'v', description: 'Variable v' },
        { symbol: 'w', label: 'w', description: 'Variable w' },
        { symbol: 'x', label: 'x', description: 'Variable x' },
        { symbol: 'y', label: 'y', description: 'Variable y' },
        { symbol: 'z', label: 'z', description: 'Variable z' },
      ],
    },
    functions: {
      label: 'Functions',
      icon: 'ƒ',
      symbols: [
        { symbol: 'sin(', label: 'sin', description: 'Sine function' },
        { symbol: 'cos(', label: 'cos', description: 'Cosine function' },
        { symbol: 'tan(', label: 'tan', description: 'Tangent function' },
        { symbol: 'log(', label: 'log', description: 'Logarithm base 10' },
        { symbol: 'ln(', label: 'ln', description: 'Natural logarithm' },
        { symbol: 'abs(', label: '|x|', description: 'Absolute value' },
      ],
    },
  };

  // Sync with parent studentAnswer prop - SIMPLIFIED to prevent race conditions
  useEffect(() => {
    // Normalize studentAnswer (handle null/undefined as empty string)
    const normalizedStudentAnswer = studentAnswer || '';
    
    // Always sync when studentAnswer prop changes
    setInputValue(normalizedStudentAnswer);

    // Clear all related state when resetting to empty
    if (normalizedStudentAnswer === '') {
      setInputHistory([]);
      setShowHistory(false);
      setShowSuggestions(false);
      setSuggestions([]);
      setValidationMessage('');
      setShowErrorMessage(false);
      setLocalIsValidExpression(true);
    }

    // Update DOM content
    const input = inputRef.current;
    if (input) {
      setTextContent(input, normalizedStudentAnswer, true, true);
      
      // Set cursor position to end of content
      setCursorPosition(normalizedStudentAnswer.length);
      
      // Update DOM cursor position
      setTimeout(() => {
        if (normalizedStudentAnswer === '') {
          // For empty content, position cursor at start
          const range = document.createRange();
          const selection = window.getSelection();
          range.setStart(input, 0);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        } else if (input.firstChild) {
          // For non-empty content, position cursor at end
          const range = document.createRange();
          const selection = window.getSelection();
          const textLength = normalizedStudentAnswer.length;
          range.setStart(
            input.firstChild,
            Math.min(textLength, input.firstChild.textContent.length)
          );
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }, 10);
    }
  }, [studentAnswer]); // Only depend on studentAnswer prop

  // Handle non-passive touch events for Android keyboard prevention
  useEffect(() => {
    const input = inputRef.current;
    if (!input || !keyboard.isAndroid || !keyboard.shouldUseCustomKeyboard)
      return;

    // Attach non-passive touch handler when custom keyboard is active
    const cleanup = attachNonPassiveTouchHandler(
      input,
      keyboard.isCustomKeyboardActive,
    );

    return cleanup;
  }, [
    keyboard.isAndroid,
    keyboard.shouldUseCustomKeyboard,
    keyboard.isCustomKeyboardActive,
  ]);

  // Real-time validation
  useEffect(() => {
    const validateExpression = async () => {
      if (!inputValue || !inputValue.trim()) {
        setValidationMessage('');
        setLocalIsValidExpression(true);
        setShowErrorMessage(false);
        setIsValidExpression?.(true);
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const isValid = isValidMathExpression(inputValue);
        const message = getMathValidationMessage(inputValue);

        setLocalIsValidExpression(isValid);
        setIsValidExpression?.(isValid);
        setValidationMessage(message);

        if (!isValid && message) {
          setTimeout(() => setShowErrorMessage(true), 800);
        } else {
          setShowErrorMessage(false);
        }
      } catch (error) {
        console.error('Frontend validation error:', error);
        setLocalIsValidExpression(true);
        setIsValidExpression?.(true);
      }
    };

    const timeoutId = setTimeout(validateExpression, 150);
    return () => clearTimeout(timeoutId);
  }, [inputValue, setIsValidExpression]);

  const handleInputChange = (e) => {
    // Prevent rapid echoing by debouncing
    const value = getTextContent(e.target);

    // Only update if value actually changed
    if (value !== inputValue) {
      setInputValue(value);
      setStudentAnswer(value);

      // Update cursor position
      setCursorPosition(getCursorPosition(e.target));
    }
  };

  const handleCursorPosition = (e) => {
    // Update cursor position using helper and show visual indicator
    const newPos = getCursorPosition(e.target);
    setCursorPosition(newPos);

    // Show cursor indicator temporarily
    setTimeout(() => {
      showCursorIndicator(e.target);
      setTimeout(() => removeCursorIndicator(e.target), 2000);
    }, 100);
  };

  const insertTextAtCursorContentEditable = (text) => {
    const input = inputRef.current;
    if (!input) return;

    // Use improved helper function with echo prevention
    insertTextAtCursor(input, text, true);

    // Update local state without triggering additional events
    const newValue = getTextContent(input);
    setInputValue(newValue);
    setStudentAnswer(newValue);

    // Show cursor indicator at new position
    setTimeout(() => showCursorIndicator(input), 50);
  };

  const insertSymbol = (symbol) => {
    const input = inputRef.current;
    if (!input) return;

    // Prevent rapid clicking issues by debouncing
    if (input.dataset.inserting === 'true') return;
    input.dataset.inserting = 'true';

    // Use contentEditable text insertion with improved helper and echo prevention
    insertTextAtCursor(input, symbol, true);

    // Update local state without triggering additional events
    const newValue = getTextContent(input);
    setInputValue(newValue);
    setStudentAnswer(newValue);

    // Add to history
    if (!inputHistory.includes(symbol)) {
      setInputHistory((prev) => [symbol, ...prev.slice(0, 9)]);
    }

    // Show cursor indicator at new position
    setTimeout(() => {
      showCursorIndicator(input);
      input.dataset.inserting = 'false';
    }, 50);
  };

  const clearInput = () => {
    const input = inputRef.current;
    if (!input) return;

    // Use improved helper function with echo prevention
    clearContent(input, true);

    setInputValue('');
    setStudentAnswer('');
    input.focus();
  };

  const backspace = () => {
    const input = inputRef.current;
    if (!input) return;

    // Get current text and selection
    const text = input.textContent || '';
    const selection = window.getSelection();

    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const cursorPos = getCursorPosition(input);

    if (cursorPos > 0) {
      // Remove one character before cursor
      const newText = text.slice(0, cursorPos - 1) + text.slice(cursorPos);

      // Update content
      input.textContent = newText;
      setInputValue(newText);
      setStudentAnswer(newText);

      // Set cursor position manually - simpler approach
      setTimeout(() => {
        const newRange = document.createRange();
        const textNode = input.firstChild;

        if (textNode && textNode.nodeType === Node.TEXT_NODE) {
          const newPos = Math.max(0, cursorPos - 1);
          newRange.setStart(
            textNode,
            Math.min(newPos, textNode.textContent.length),
          );
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        } else if (newText.length === 0) {
          // Empty content, create text node and set cursor
          const emptyTextNode = document.createTextNode('');
          input.appendChild(emptyTextNode);
          newRange.setStart(emptyTextNode, 0);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }

        // Show cursor indicator
        showCursorIndicator(input);
      }, 10);
    }
  };

  // Cursor navigation functions with visual feedback
  const moveCursorLeft = () => {
    const input = inputRef.current;
    if (!input) return;
    moveCursor(input, 'left', true);

    // Show cursor indicator for visual feedback
    setTimeout(() => {
      showCursorIndicator(input);
      setTimeout(() => removeCursorIndicator(input), 1500);
    }, 50);
  };

  const moveCursorRight = () => {
    const input = inputRef.current;
    if (!input) return;
    moveCursor(input, 'right', true);

    // Show cursor indicator for visual feedback
    setTimeout(() => {
      showCursorIndicator(input);
      setTimeout(() => removeCursorIndicator(input), 1500);
    }, 50);
  };

  return (
    <div
      className={`w-full space-y-6 ${getPlatformClasses()} ${
        keyboard.isCustomKeyboardActive ? 'custom-keyboard-active' : ''
      }`}
    >
      {/* ContentEditable Input Field - Android Keyboard Prevention */}
      <div className="relative">
        <div
          ref={inputRef}
          // CRITICAL: Multi-layered Android keyboard prevention
          contentEditable={
            !keyboard.isAndroid ||
            !keyboard.shouldUseCustomKeyboard ||
            !keyboard.isCustomKeyboardActive
          }
          suppressContentEditableWarning={true}
          // Android-specific attributes for keyboard prevention
          inputMode={
            keyboard.isAndroid && keyboard.shouldUseCustomKeyboard
              ? 'none'
              : undefined
          }
          data-gramm={false} // Disable Grammarly
          data-gramm_editor={false}
          data-enable-grammarly={false}
          onInput={handleInputChange}
          onSelect={handleCursorPosition}
          onFocus={(e) => {
            if (keyboard.shouldUseCustomKeyboard) {
              // Use Android-specific focus handling
              if (keyboard.isAndroid) {
                handleAndroidFocus(e, () => {
                  keyboard.activateCustomKeyboard();
                });
              } else {
                keyboard.activateCustomKeyboard();
              }
            }
            // Show cursor indicator on focus
            setTimeout(() => showCursorIndicator(e.target), 100);
          }}
          onPointerDown={(e) => {
            // Less aggressive prevention for Android Chrome
            if (
              keyboard.isAndroid &&
              keyboard.shouldUseCustomKeyboard &&
              keyboard.isCustomKeyboardActive
            ) {
              // Only prevent if contentEditable is false and not clicking buttons
              if (
                e.currentTarget.getAttribute('contenteditable') === 'false' &&
                !e.target.closest('.h-12, button, [role="button"]')
              ) {
                e.preventDefault();
              }
              // Ensure focus is maintained
              if (!e.currentTarget.matches(':focus')) {
                e.currentTarget.focus();
              }
            }
          }}
          className={`math-input w-full p-4 text-lg border rounded-lg min-h-[80px] font-mono focus:outline-none focus:ring-2 whitespace-pre-wrap break-words text-white bg-background ${
            !localIsValidExpression
              ? 'border-red-500 focus:border-red-600 focus:ring-red-200'
              : isChecking
                ? 'border-yellow-500 focus:border-yellow-600 focus:ring-yellow-200'
                : 'border-border focus:border-primary focus:ring-primary/20'
          }`}
          style={{
            fontSize: '16px', // Prevents zoom on mobile
            lineHeight: '1.5',
            minHeight: '80px',
            maxHeight: '200px',
            overflowY: 'auto',
            // Force white text with higher specificity - React-proof
            color: 'white !important',
            backgroundColor: 'var(--background)',
            borderColor: 'var(--border)',
            // Additional overrides to prevent React from changing text color
            WebkitTextFillColor: 'white',
            textFillColor: 'white',
            // Ensure caret is visible
            caretColor: '#4D5DED',
            // Android-specific styles for keyboard prevention
            ...(keyboard.isAndroid &&
              keyboard.shouldUseCustomKeyboard && {
                WebkitAppearance: 'none',
                appearance: 'none',
                WebkitTouchCallout: 'none',
                WebkitTapHighlightColor: 'transparent',
                WebkitUserSelect: 'text',
                userSelect: 'text',
                caretColor: '#4D5DED',
              }),
          }}
          data-placeholder={!inputValue ? 'Write your answer' : ''}
          onBlur={() => {
            // Remove cursor indicator on blur
            const input = inputRef.current;
            if (input) removeCursorIndicator(input);
          }}
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
        <div className="flex gap-2">
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
        </div>

        {/* Cursor Navigation and Edit Controls */}
        <div className="flex gap-2">
          <button
            onClick={moveCursorLeft}
            className="px-3 py-2 bg-[#7D32CE] text-white rounded-lg hover:bg-[#4D5DED] hover:text-white transition-colors"
            title="Move cursor left"
          >
            ←
          </button>
          <button
            onClick={moveCursorRight}
            className="px-3 py-2 bg-[#7D32CE] text-white rounded-lg hover:bg-[#4D5DED] hover:text-white transition-colors"
            title="Move cursor right"
          >
            →
          </button>
          <button
            onClick={backspace}
            className="px-4 py-2 bg-[#7D32CE] text-white rounded-lg hover:bg-[#4D5DED] hover:text-white transition-colors"
            title="Backspace"
          >
            ⌫
          </button>
        </div>
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

      {/* Custom Keyboard - Only show on mobile when needed */}
      {keyboard.shouldUseCustomKeyboard && (
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
            <div
              className={`grid gap-3 ${
                activeTab === 'numbers' || activeTab === 'alphabet'
                  ? 'grid-cols-5'
                  : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5'
              }`}
            >
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
      )}

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
            <p>• Click symbols or type directly on desktop</p>
            <p>• Use custom keyboard buttons on mobile</p>
            <p>• Use ^ for exponents (e.g., x^2)</p>
            <p>• Use * for multiplication (e.g., 2*x)</p>
            <p>• Functions auto-close parentheses</p>
          </div>
        )}
      </div>
    </div>
  );
}
