'use client';

import { useKeyboardManager } from '@/hooks/useKeyboardManager';

import {
  attachNonPassiveTouchHandler,
  handleAndroidFocus,
} from '@/utils/androidKeyboardPrevention';
import { validateAnswerSync } from '@/utils/answerValidator';
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
import { convertToLatex } from '@/utils/latexConverter';
import { getPlatformClasses } from '@/utils/platformDetection';
import { QUESTION_TYPES } from '@/utils/questionTypeDetection';
import 'katex/dist/katex.min.css';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { InlineMath } from 'react-katex';

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
  const [cursorPosition, setCursorPosition] = useState(
    (studentAnswer || '').length,
  );
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showHelper, setShowHelper] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isUppercase, setIsUppercase] = useState(false);

  const inputRef = useRef(null);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Initialize DOM content on component mount
  useEffect(() => {
    const input = inputRef.current;
    if (input) {
      const initialValue = studentAnswer || '';
      setTextContent(input, initialValue, true, true);
      setCursorPosition(initialValue.length);
    }
  }, [studentAnswer]); // Run only once on mount

  // Initialize keyboard manager for Math Input questions
  const keyboard = useKeyboardManager(QUESTION_TYPES.MATH_INPUT);

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

  // Advanced math symbol categories
  const mathCategories = {
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
        { symbol: ',', label: ',', description: 'Comma' },
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
        { symbol: 'theta', label: 'θ', description: 'Theta angle' },
        { symbol: 'alpha', label: 'α', description: 'Alpha' },
        { symbol: 'beta', label: 'β', description: 'Beta' },
      ],
    },
  };

  // Generate dynamic alphabet symbols based on case
  const alphabetSymbols = mathCategories.alphabet.symbols.map(symbol => ({
    ...symbol,
    symbol: isUppercase ? symbol.symbol.toUpperCase() : symbol.symbol,
    label: isUppercase ? symbol.label.toUpperCase() : symbol.label,
    description: `Variable ${isUppercase ? symbol.symbol.toUpperCase() : symbol.symbol}`
  }));



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

      // Use frontend validation for instant feedback - no API calls!
      try {
        const isValid = isValidMathExpression(inputValue);
        const message = getMathValidationMessage(inputValue);

        setLocalIsValidExpression(isValid);
        setIsValidExpression?.(isValid);
        setValidationMessage(message);

        if (!isValid && message) {
          setTimeout(() => {
            setShowErrorMessage(true);
          }, 800); // Reduced delay
        } else {
          setShowErrorMessage(false);
        }
      } catch (error) {
        console.error('Frontend validation error:', error);
        // Fallback to true for better UX
        setLocalIsValidExpression(true);
        setIsValidExpression?.(true);
      }
    };

    const timeoutId = setTimeout(validateExpression, 150); // Reduced debounce time
    return () => clearTimeout(timeoutId);
  }, [inputValue, cursorPosition, setIsValidExpression]);

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
            Math.min(textLength, input.firstChild.textContent.length),
          );
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }, 10);
    }
  }, [studentAnswer]); // Only depend on studentAnswer prop

  // Reset error message when typing
  useEffect(() => {
    if (inputValue.trim()) {
      setShowErrorMessage(false);
    }
  }, [inputValue]);

  // Sync DOM content with inputValue state (without React children interference)
  useEffect(() => {
    const input = inputRef.current;
    if (input && getTextContent(input) !== inputValue) {
      setTextContent(input, inputValue, true, true);

      // Set cursor position to end for better UX
      setTimeout(() => {
        if (inputValue === '') {
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
          const textLength = inputValue.length;
          range.setStart(
            input.firstChild,
            Math.min(textLength, input.firstChild.textContent.length),
          );
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }, 10);
    }
  }, [inputValue]); // Only run when inputValue changes

  // Quick validation against correct answer - using your new answerValidator
  useEffect(() => {
    const quickCheck = () => {
      if (!inputValue.trim() || !correctAnswer || !localIsValidExpression) {
        setIsAnswerCorrect(false);
        return;
      }

      setIsChecking(true);
      try {
        // Use synchronous validation for real-time feedback
        const isCorrect = validateAnswerSync(
          inputValue,
          correctAnswer,
          '',
          'Math Input',
        );
        setIsAnswerCorrect(isCorrect);
      } catch (error) {
        console.error('Quick validation error:', error);
        setIsAnswerCorrect(false);
      } finally {
        setIsChecking(false);
      }
    };

    // Reduced timeout for faster feedback
    const timeoutId = setTimeout(quickCheck, 200);
    return () => clearTimeout(timeoutId);
  }, [inputValue, correctAnswer, localIsValidExpression, setIsAnswerCorrect]);

  const getCurrentWord = (text, position) => {
    const beforeCursor = text.substring(0, position);
    const match = beforeCursor.match(/[a-zA-Z]+$/);
    return match ? match[0] : '';
  };

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

    // Use improved helper function
    insertTextAtCursor(input, text);

    // Update local state
    const newValue = getTextContent(input);
    setInputValue(newValue);
    setStudentAnswer(newValue);
  };

  const insertSymbol = (symbol, shouldMoveCursor = true) => {
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

      // Set cursor position manually
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

  const handleKeyDown = (e) => {
    // Handle special keys
    if (e.key === 'Tab' && showSuggestions && suggestions.length > 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[0]);
    }
  };

  return (
    <div
      className={`w-full space-y-6 mb-30 ${
        isHydrated ? getPlatformClasses() : ''
      } ${keyboard.isCustomKeyboardActive ? 'custom-keyboard-active' : ''}`}
    >
      {/* ContentEditable Input Field - Android Keyboard Prevention */}
      <div className="relative">
        <div
          ref={inputRef}
          // IMPROVED: iOS and Android keyboard prevention
          contentEditable={
            // For iOS: Always disable contentEditable when custom keyboard is active
            keyboard.isIOS &&
            keyboard.shouldUseCustomKeyboard &&
            keyboard.isCustomKeyboardActive
              ? false
              : // For Android: More selective prevention
                !keyboard.isAndroid ||
                !keyboard.shouldUseCustomKeyboard ||
                !keyboard.isCustomKeyboardActive
          }
          suppressContentEditableWarning={true}
          // iOS and Android-specific attributes for keyboard prevention
          inputMode={
            (keyboard.isIOS || keyboard.isAndroid) &&
            keyboard.shouldUseCustomKeyboard &&
            keyboard.isCustomKeyboardActive
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
              // iOS-specific: More aggressive focus handling
              if (keyboard.isIOS) {
                // Immediately blur to prevent keyboard, then handle custom keyboard
                e.target.blur();

                setTimeout(() => {
                  // Re-focus without triggering keyboard
                  e.target.focus();
                  keyboard.activateCustomKeyboard();

                  // Show visual feedback
                  showCursorIndicator(e.target);
                }, 10);
              } else if (keyboard.isAndroid) {
                // Use Android-specific focus handling
                handleAndroidFocus(e, () => {
                  keyboard.activateCustomKeyboard();
                });
              } else {
                keyboard.activateCustomKeyboard();
              }
            }

            // Position cursor at end when focused (better UX)
            setTimeout(() => {
              const input = e.target;
              const textLength = getTextContent(input).length;

              // Always position at end on focus for better UX
              const range = document.createRange();
              const selection = window.getSelection();

              if (input.firstChild && textLength > 0) {
                range.setStart(
                  input.firstChild,
                  Math.min(textLength, input.firstChild.textContent.length),
                );
              } else if (textLength === 0) {
                // Empty input - position at start
                range.setStart(input, 0);
              } else {
                // Fallback
                range.setStart(input, 0);
              }
              range.collapse(true);

              selection.removeAllRanges();
              selection.addRange(range);

              setCursorPosition(textLength);

              // Show cursor indicator on focus
              showCursorIndicator(input);
            }, 200); // Longer delay to ensure focus is complete
          }}
          onBlur={() => {
            // Remove cursor indicator on blur
            const input = inputRef.current;
            if (input) removeCursorIndicator(input);
          }}
          onPointerDown={(e) => {
            // iOS-specific: Prevent clicks from triggering keyboard
            if (keyboard.isIOS && keyboard.shouldUseCustomKeyboard) {
              e.preventDefault();
              e.stopPropagation();

              // Ensure the input stays focused but doesn't trigger keyboard
              if (!e.currentTarget.matches(':focus')) {
                e.currentTarget.focus();
              }

              // Show visual feedback that click was registered
              setTimeout(() => {
                showCursorIndicator(e.currentTarget);
                setTimeout(() => removeCursorIndicator(e.currentTarget), 2000);
              }, 50);

              return false;
            }

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
          onKeyDown={handleKeyDown}
          className={`math-input w-full p-4 text-lg border rounded-lg min-h-[80px] font-mono focus:outline-none focus:ring-2 whitespace-pre-wrap break-words text-[var(--color-foreground)] bg-background ${
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
            color: 'var(--color-foreground)',
            backgroundColor: 'var(--color-background)',
            borderColor: 'var(--border)',
            caretColor: '#4D5DED',
            ...((keyboard.isIOS || keyboard.isAndroid) &&
              keyboard.shouldUseCustomKeyboard &&
              keyboard.isCustomKeyboardActive && {
                WebkitAppearance: 'none',
                appearance: 'none',
                WebkitTouchCallout: 'none',
                WebkitTapHighlightColor: 'transparent',
                WebkitUserSelect: 'text',
                userSelect: 'text',
                caretColor: '#4D5DED',
                ...(keyboard.isIOS && {
                  // iOS-specific additional prevention
                  WebkitUserModify: 'read-only',
                }),
              }),
            cursor: 'text',
            pointerEvents: 'auto',
          }}
          data-placeholder={!inputValue ? 'Write your answer' : ''}
        />

        {/* Validation indicator */}
        <div className="absolute right-3 top-4">
          {isChecking ? (
            <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
          ) : inputValue.trim() && localIsValidExpression ? (
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-[var(--color-foreground)] text-sm">✓</span>
            </div>
          ) : inputValue.trim() && !localIsValidExpression ? (
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-[var(--color-foreground)] text-sm">✗</span>
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
                className="w-full px-4 py-2 text-left hover:bg-[var(--blueprint-blue)] hover:text-[var(--color-foreground)] flex justify-between items-center border-b last:border-b-0"
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
      {/* {validationMessage && showErrorMessage && !localIsValidExpression && (
        <div className="animate-fade-in">
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
            {validationMessage}
          </p>
        </div>
      )} */}

      {/* Action buttons */}
      <div className="flex flex-row justify-between gap-2">
        <div className="flex gap-2">
          <button
            onClick={clearInput}
            className="px-4 py-2 bg-[var(--blueprint-blue-light)] text-black rounded-lg hover:bg-[var(--blueprint-blue)] hover:text-white transition-colors"
          >
            Clear
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-4 py-2 bg-[var(--blueprint-blue-light)] text-black rounded-lg hover:bg-[var(--blueprint-blue)] hover:text-white transition-colors"
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
                className="px-3 py-1 bg-[var(--vector-violet)] text-white rounded hover:bg-[#4D5DED] hover:text-white text-sm"
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
              <div key={key} className="flex flex-1">
                <button
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
              </div>
            ))}
          </div>

{/* Symbol grid */}
<div className="p-4">
  {activeTab === 'alphabet' ? (
    <div className="space-y-3">
      {/* First 25 letters in 5x5 grid */}
      <div className="grid grid-cols-5 gap-3">
        {alphabetSymbols.slice(0, 25).map((item, index) => (
          <button
            key={`mobile-${item.symbol}-${isUppercase}`}
            onClick={() => insertSymbol(item.symbol)}
            title={item.description}
            className="h-12 w-full bg-white text-black rounded-md hover:bg-[#4D5DED] hover:text-white active:bg-[#FF6E99] transition-colors text-lg font-bold flex items-center justify-center"
          >
            {item.label}
          </button>
        ))}
      </div>
      
      {/* Last row: Z + empty spaces + toggle button */}
      <div className="grid grid-cols-5 gap-3">
        <button
          onClick={() => insertSymbol(alphabetSymbols[25].symbol)}
          title={alphabetSymbols[25].description}
          className="h-12 w-full bg-white text-black rounded-md hover:bg-[#4D5DED] hover:text-white active:bg-[#FF6E99] transition-colors text-lg font-bold flex items-center justify-center"
        >
          {alphabetSymbols[25].label}
        </button>
        <div></div>
        <div></div>
        <div></div>
        
        {/* Toggle button in bottom-right corner */}
        <button
          onClick={() => setIsUppercase(!isUppercase)}
          className="h-12 w-full bg-[#FF6E99] hover:bg-[#4D5DED] text-white transition-colors flex items-center justify-center rounded-md"
        >
          <div className="flex flex-col items-center">
            <span className="text-lg leading-none">
              {isUppercase ? '↓' : '↑'}
            </span>
            <span className="text-xs leading-none">
              {isUppercase ? 'abc' : 'ABC'}
            </span>
          </div>
        </button>
      </div>
    </div>
  ) : (
    // Regular grid for other tabs
    <div className={`grid gap-3 ${
      activeTab === 'numbers' 
        ? 'grid-cols-5' 
        : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5'
    }`}>
      {mathCategories[activeTab].symbols.map((item, index) => (
        <button
          key={`mobile-${index}`}
          onClick={() => insertSymbol(item.symbol)}
          title={item.description}
          className="h-12 w-full bg-white text-black rounded-md hover:bg-[#4D5DED] hover:text-white active:bg-[#FF6E99] transition-colors text-lg font-bold flex items-center justify-center"
        >
          {item.label}
        </button>
      ))}
    </div>
  )}
</div>
        </div>
      )}

      {/* Tabbed Symbol Categories - Always show on desktop or when not using custom keyboard */}
      {!keyboard.shouldUseCustomKeyboard && (
        <div className="w-full bg-[#421E68] rounded-lg overflow-hidden">
{/* Tab headers - Clean, no toggle button here */}
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
  {activeTab === 'alphabet' ? (
    <div className="space-y-3">
      {/* First 25 letters in 5x5 grid */}
      <div className="grid grid-cols-5 gap-3">
        {alphabetSymbols.slice(0, 25).map((item, index) => (
          <button
            key={`${item.symbol}-${isUppercase}`}
            onClick={() => insertSymbol(item.symbol)}
            title={item.description}
            className="h-12 w-full bg-white text-black rounded-md hover:bg-[#4D5DED] hover:text-white active:bg-[#FF6E99] transition-colors text-lg font-bold flex items-center justify-center"
          >
            {item.label}
          </button>
        ))}
      </div>
      
      {/* Last row: Z + empty spaces + toggle button */}
      <div className="grid grid-cols-5 gap-3">
        <button
          onClick={() => insertSymbol(alphabetSymbols[25].symbol)}
          title={alphabetSymbols[25].description}
          className="h-12 w-full bg-white text-black rounded-md hover:bg-[#4D5DED] hover:text-white active:bg-[#FF6E99] transition-colors text-lg font-bold flex items-center justify-center"
        >
          {alphabetSymbols[25].label}
        </button>
        <div></div>
        <div></div>
        <div></div>
        
        {/* Toggle button in bottom-right corner */}
        <button
          onClick={() => setIsUppercase(!isUppercase)}
          className="h-12 w-full bg-[#FF6E99] hover:bg-[#4D5DED] text-white transition-colors flex items-center justify-center rounded-md"
          title={`Switch to ${isUppercase ? 'lowercase' : 'uppercase'}`}
        >
          <div className="flex flex-col items-center">
            <span className="text-lg leading-none">
              {isUppercase ? '↓' : '↑'}
            </span>
            <span className="text-xs leading-none">
              {isUppercase ? 'abc' : 'ABC'}
            </span>
          </div>
        </button>
      </div>
      
      {/* Current mode indicator */}
      <div className="text-center text-sm text-white">
        Current mode: {isUppercase ? 'UPPERCASE' : 'lowercase'}
      </div>
    </div>
  ) : (
    // Regular grid for other tabs
    <div className={`grid gap-3 ${
      activeTab === 'numbers' 
        ? 'grid-cols-5' 
        : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5'
    }`}>
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
  )}
</div>
        </div>
      )}

      {/* Live LaTeX Preview */}
      {inputValue.trim() && localIsValidExpression && (
        <div className="p-4 border border-[#696969] rounded-lg">
          <div className="text-sm mb-2 font-medium">Preview:</div>
          <div className="text-xl">
            <InlineMath math={convertToLatex(inputValue)} />
          </div>
        </div>
      )}

      {/* Helper Text */}
      <div
        className="text-xs border border-[#696969] p-3 rounded-lg cursor-pointer select-none"
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
