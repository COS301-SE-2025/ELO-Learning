'use client';

import { useKeyboardManager } from '@/hooks/useKeyboardManager';

import {
  attachNonPassiveTouchHandler,
  handleAndroidFocus,
} from '@/utils/androidKeyboardPrevention';
import { validateAnswerSync } from '@/utils/answerValidator';
import {
  clearContent,
  deleteAtCursor,
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
  const [inputValue, setInputValue] = useState(studentAnswer);
  const [validationMessage, setValidationMessage] = useState('');
  const [localIsValidExpression, setLocalIsValidExpression] = useState(true);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [showHistory, setShowHistory] = useState(false);
  const [inputHistory, setInputHistory] = useState([]);
  const [cursorPosition, setCursorPosition] = useState(studentAnswer.length);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showHelper, setShowHelper] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const inputRef = useRef(null);

  // Add ref to track previous studentAnswer value to prevent infinite loops
  const prevStudentAnswerRef = useRef(studentAnswer);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Initialize cursor position at end when component mounts
  useEffect(() => {
    const input = inputRef.current;
    if (input && inputValue) {
      // Set initial content
      input.textContent = inputValue;

      setTimeout(() => {
        // Set cursor to end of existing text
        const textLength = inputValue.length;
        setCursorPosition(textLength);

        // Also set the actual cursor position in the DOM
        const range = document.createRange();
        const selection = window.getSelection();

        if (input.firstChild) {
          range.setStart(
            input.firstChild,
            Math.min(textLength, input.firstChild.textContent.length),
          );
        } else if (textLength > 0) {
          // Create text node if it doesn't exist
          input.textContent = inputValue;
          if (input.firstChild) {
            range.setStart(input.firstChild, textLength);
          }
        } else {
          range.setStart(input, 0);
        }
        range.collapse(true);

        selection.removeAllRanges();
        selection.addRange(range);
      }, 100); // Small delay to ensure DOM is ready
    }
  }, [isHydrated]); // Run when hydrated

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

  // Sync with parent studentAnswer prop - FIXED to prevent infinite loops
  useEffect(() => {
    // Only sync if studentAnswer changed from parent AND it's different from current input
    if (
      prevStudentAnswerRef.current !== studentAnswer &&
      studentAnswer !== inputValue
    ) {
      prevStudentAnswerRef.current = studentAnswer;
      setInputValue(studentAnswer);

      // Update contentEditable if needed
      const input = inputRef.current;
      if (input && input.contentEditable !== undefined) {
        if (getTextContent(input) !== studentAnswer) {
          setTextContent(input, studentAnswer, true, true);
        }
      }

      // Set cursor to end of new text
      setCursorPosition(studentAnswer.length);

      // Also set the actual cursor position in the DOM
      setTimeout(() => {
        if (input) {
          const textLength = studentAnswer.length;
          const range = document.createRange();
          const selection = window.getSelection();

          if (input.firstChild) {
            range.setStart(
              input.firstChild,
              Math.min(textLength, input.firstChild.textContent.length),
            );
          } else {
            range.setStart(input, 0);
          }
          range.collapse(true);

          selection.removeAllRanges();
          selection.addRange(range);
        }
      }, 10);
    }
  }, [studentAnswer]);

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
      // Only update if content is actually different to avoid cursor jumps
      input.textContent = inputValue;

      // Ensure cursor stays at end for better UX
      setTimeout(() => {
        const textLength = inputValue.length;
        if (cursorPosition > textLength) {
          setCursorPosition(textLength);

          // Set DOM cursor position
          const range = document.createRange();
          const selection = window.getSelection();

          if (input.firstChild) {
            range.setStart(
              input.firstChild,
              Math.min(textLength, input.firstChild.textContent.length),
            );
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
          }
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

    // Ensure the input is focused first
    input.focus();

    // Get current text and cursor position
    const currentText = getTextContent(input);
    let currentPos = cursorPosition;

    // If cursor position seems wrong, try to get it from DOM
    try {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const preRange = document.createRange();
        preRange.selectNodeContents(input);
        preRange.setEnd(range.startContainer, range.startOffset);
        const detectedPos = preRange.toString().replace(/\|/g, '').length;
        // Use detected position if it seems reasonable
        if (detectedPos >= 0 && detectedPos <= currentText.length) {
          currentPos = detectedPos;
        }
      }
    } catch (error) {
      console.warn('Could not detect cursor position, using state value');
    }

    // Ensure cursor position is within bounds
    currentPos = Math.max(0, Math.min(currentPos, currentText.length));

    // Insert text at cursor position
    const newText =
      currentText.substring(0, currentPos) +
      symbol +
      currentText.substring(currentPos);
    const newCursorPos = currentPos + symbol.length;

    // Update content
    input.textContent = newText;

    // Set cursor position after inserted text
    try {
      const range = document.createRange();
      const selection = window.getSelection();

      if (input.firstChild && input.firstChild.nodeType === Node.TEXT_NODE) {
        const maxOffset = Math.min(
          newCursorPos,
          input.firstChild.textContent.length,
        );
        range.setStart(input.firstChild, maxOffset);
      } else {
        // Create text node if needed
        if (!input.firstChild) {
          input.appendChild(document.createTextNode(newText));
        }
        if (input.firstChild) {
          const maxOffset = Math.min(
            newCursorPos,
            input.firstChild.textContent.length,
          );
          range.setStart(input.firstChild, maxOffset);
        }
      }

      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    } catch (error) {
      console.warn('Could not set cursor position after insert:', error);
    }

    // Update local state without triggering additional events
    setInputValue(newText);
    setStudentAnswer(newText);
    setCursorPosition(newCursorPos);

    // Add to history
    if (!inputHistory.includes(symbol)) {
      setInputHistory((prev) => [symbol, ...prev.slice(0, 9)]); // Keep last 10
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

    // Ensure input is focused
    input.focus();

    // Use the helper function for consistent behavior
    deleteAtCursor(input, 1, true);

    // Update local state
    const newValue = getTextContent(input);
    setInputValue(newValue);
    setStudentAnswer(newValue);

    // Update cursor position state
    setTimeout(() => {
      const newPos = getCursorPosition(input);
      setCursorPosition(newPos);
    }, 10);
  };

  // Cursor navigation functions using helper utilities
  const moveCursorLeft = () => {
    const input = inputRef.current;
    if (!input) return;

    // Ensure input is focused
    input.focus();

    // Use the helper function with visual indicator
    moveCursor(input, 'left', true);

    // Update cursor position state
    setTimeout(() => {
      const newPos = getCursorPosition(input);
      setCursorPosition(newPos);
    }, 10);
  };

  const moveCursorRight = () => {
    const input = inputRef.current;
    if (!input) return;

    // Ensure input is focused
    input.focus();

    // Use the helper function with visual indicator
    moveCursor(input, 'right', true);

    // Update cursor position state
    setTimeout(() => {
      const newPos = getCursorPosition(input);
      setCursorPosition(newPos);
    }, 10);
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

      {/* Tabbed Symbol Categories - Always show on desktop or when not using custom keyboard */}
      {!keyboard.shouldUseCustomKeyboard && (
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
        <div className="p-4 border border-[#696969] rounded-lg">
          <div className="text-sm mb-2 font-medium">Preview:</div>
          <div className="text-xl">
            <InlineMath math={inputValue} />
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
