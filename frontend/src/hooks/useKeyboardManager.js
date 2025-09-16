/**
 * Updated Keyboard Management Hook - ContentEditable Approach
 * This version is optimized for contentEditable divs instead of textarea elements
 */

import {
  getActualViewportHeight,
  getKeyboardBehavior,
  shouldUseCustomKeyboard,
  shouldUseNativeKeyboard,
} from '@/utils/platformDetection';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export const useKeyboardManager = (
  questionType,
  forceNativeKeyboard = false,
) => {
  const [isCustomKeyboardActive, setIsCustomKeyboardActive] = useState(false);
  const [isNativeKeyboardVisible, setIsNativeKeyboardVisible] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);

  const initialViewportHeight = useRef(0);
  const inputRef = useRef(null);

  // Handle hydration - avoid SSR/client mismatch
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const behavior = useMemo(() => {
    return isHydrated
      ? getKeyboardBehavior()
      : { isMobile: false, isAndroid: false, isIOS: false };
  }, [isHydrated]);

  // Determine keyboard behavior based on question type
  const shouldUseCustom =
    isHydrated && shouldUseCustomKeyboard(questionType) && !forceNativeKeyboard;
  const shouldUseNative =
    isHydrated &&
    (shouldUseNativeKeyboard(questionType) || forceNativeKeyboard);

  // Initialize viewport height
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const height = getActualViewportHeight();
      setViewportHeight(height);
      initialViewportHeight.current = height;
    }
  }, []);

  // Monitor viewport changes to detect keyboard visibility
  useEffect(() => {
    if (!behavior.isMobile) return;

    const handleViewportChange = () => {
      const currentHeight = getActualViewportHeight();
      setViewportHeight(currentHeight);

      // Detect keyboard based on viewport height change
      const heightDifference = initialViewportHeight.current - currentHeight;
      const keyboardVisible = heightDifference > 150;

      setIsNativeKeyboardVisible(keyboardVisible);
      setKeyboardHeight(keyboardVisible ? heightDifference : 0);
    };

    // Listen for viewport changes
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      return () =>
        window.visualViewport.removeEventListener(
          'resize',
          handleViewportChange,
        );
    } else {
      window.addEventListener('resize', handleViewportChange);
      return () => window.removeEventListener('resize', handleViewportChange);
    }
  }, [behavior.isMobile]);

  /**
   * Activate custom keyboard mode with platform-specific handling
   * For contentEditable, this means setting contentEditable="false" and additional prevention
   */
  const activateCustomKeyboard = useCallback(() => {
    setIsCustomKeyboardActive(true);

    if (inputRef.current) {
      const input = inputRef.current;

      // Platform-specific keyboard prevention
      if (behavior.isAndroid) {
        // Android-specific: Force blur and refocus to ensure keyboard is dismissed
        input.blur();

        // Wait for keyboard to close, then refocus without triggering keyboard
        setTimeout(() => {
          input.contentEditable = 'false';
          input.focus();

          // Additional Android prevention: Set input mode
          input.setAttribute('inputmode', 'none');

          console.log(
            'Android custom keyboard activated with prevention measures',
          );
        }, 150);
        } else if (behavior.isIOS) {
          // iOS-specific: Much more aggressive approach
          input.blur();
          
          setTimeout(() => {
            // Multiple layers of iOS prevention
            input.contentEditable = 'false';
            input.setAttribute('readonly', 'true');
            input.setAttribute('inputmode', 'none');
            input.setAttribute('autocomplete', 'off');
            input.setAttribute('autocorrect', 'off');
            input.setAttribute('autocapitalize', 'off');
            input.setAttribute('spellcheck', 'false');
            
            // iOS-specific styles that are harder to override
            input.style.setProperty('-webkit-user-select', 'none', 'important');
            input.style.setProperty('user-select', 'none', 'important');
            input.style.setProperty('-webkit-touch-callout', 'none', 'important');
            input.style.setProperty('-webkit-tap-highlight-color', 'transparent', 'important');
            input.style.setProperty('pointer-events', 'none', 'important');
            
            // Critical: Re-enable pointer events only for the parent container
            const parent = input.parentElement;
            if (parent) {
              parent.style.setProperty('pointer-events', 'auto', 'important');
            }
            
            console.log('iOS aggressive keyboard prevention applied');
          }, 200); // Longer delay for iOS
      } else {
        // Generic mobile or desktop
        input.contentEditable = 'false';
        input.setAttribute('inputmode', 'none');
        console.log('Custom keyboard activated for contentEditable approach');
      }
    }
  }, [behavior.isAndroid, behavior.isIOS]);

  /**
   * Deactivate custom keyboard mode with platform-specific cleanup
   */
const deactivateCustomKeyboard = useCallback(() => {
  setIsCustomKeyboardActive(false);

  if (inputRef.current) {
    const input = inputRef.current;

    if (behavior.isAndroid) {
      // Android-specific cleanup
      input.contentEditable = 'true';
      input.removeAttribute('inputmode');
      console.log('Android custom keyboard deactivated');
    } else if (behavior.isIOS) {
      // iOS-specific cleanup
      input.contentEditable = 'true';
      input.removeAttribute('readonly');
      input.removeAttribute('inputmode');
      
      // Restore iOS user selection
      input.style.removeProperty('-webkit-user-select');
      input.style.removeProperty('user-select');
      
      console.log('iOS custom keyboard deactivated');
    } else {
      // Generic cleanup
      input.contentEditable = 'true';
      input.removeAttribute('inputmode');
    }
  }
}, [behavior.isAndroid, behavior.isIOS]);

  /**
   * Focus input with appropriate keyboard behavior for contentEditable
   */
  const focusInput = useCallback(
    (inputElement) => {
      if (!inputElement) return;

      // For contentEditable approach, we can always focus safely
      // The contentEditable attribute controls whether typing triggers keyboard
      inputElement.focus();

      if (shouldUseCustom) {
        activateCustomKeyboard();
      }
    },
    [shouldUseCustom, activateCustomKeyboard],
  );

  /**
   * Get input props for contentEditable elements
   * This is much simpler than the textarea approach!
   */
  const getInputProps = useCallback(
    (customProps = {}) => {
      const baseProps = {
        ...customProps,
        ref: (element) => {
          inputRef.current = element;
          if (customProps.ref) {
            if (typeof customProps.ref === 'function') {
              customProps.ref(element);
            } else {
              customProps.ref.current = element;
            }
          }
        },
      };

      if (!behavior.isMobile) {
        // Desktop: Always allow contentEditable
        return {
          ...baseProps,
          contentEditable: true,
          suppressContentEditableWarning: true,
        };
      }

      if (shouldUseCustom && !forceNativeKeyboard) {
        // Mobile with custom keyboard: Dynamic contentEditable control
        return {
          ...baseProps,
          // KEY CHANGE: contentEditable="false" when custom keyboard is active
          contentEditable: !isCustomKeyboardActive,
          suppressContentEditableWarning: true,

          // Enhanced focus handling for contentEditable
          onFocus: (e) => {
            if (shouldUseCustom) {
              activateCustomKeyboard();
            }
            if (customProps.onFocus) customProps.onFocus(e);
          },

          // Style overrides for mobile contentEditable
          style: {
            ...customProps.style,
            fontSize: '16px', // Prevent zoom on focus
            userSelect: 'text',
            WebkitUserSelect: 'text',
            cursor: 'text',
          },

          // Prevent context menus that might trigger keyboards
          onContextMenu: (e) => {
            if (behavior.isMobile && shouldUseCustom) {
              e.preventDefault();
            }
            if (customProps.onContextMenu) customProps.onContextMenu(e);
          },
        };
      }

      // Default mobile behavior (native keyboard)
      return {
        ...baseProps,
        contentEditable: true,
        suppressContentEditableWarning: true,
      };
    },
    [
      behavior,
      shouldUseCustom,
      forceNativeKeyboard,
      isCustomKeyboardActive,
      activateCustomKeyboard,
    ],
  );

  /**
   * Enhanced text insertion for contentEditable elements
   * This method is optimized for contentEditable divs
   */
  const insertTextAtCursor = useCallback((text) => {
    const input = inputRef.current;
    if (!input) return;

    // Ensure the input is focused first
    input.focus();

    const selection = window.getSelection();
    let range;

    if (selection.rangeCount > 0) {
      range = selection.getRangeAt(0);
    } else {
      // Create a new range at the end of the content
      range = document.createRange();
      range.selectNodeContents(input);
      range.collapse(false); // Collapse to end
      selection.removeAllRanges();
      selection.addRange(range);
    }

    // Delete any selected content first
    range.deleteContents();

    // Insert the new text
    const textNode = document.createTextNode(text);
    range.insertNode(textNode);

    // Move cursor after inserted text
    range.setStartAfter(textNode);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);

    // Trigger input event for React
    const event = new Event('input', { bubbles: true });
    Object.defineProperty(event, 'target', { value: input });
    Object.defineProperty(event, 'currentTarget', { value: input });
    input.dispatchEvent(event);

    console.log('Text inserted at cursor:', text);
  }, []);

  /**
   * Clear all content from contentEditable div
   */
  const clearContent = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;

    input.textContent = '';
    input.focus();

    // Trigger input event
    const event = new Event('input', { bubbles: true });
    Object.defineProperty(event, 'target', { value: input });
    input.dispatchEvent(event);
  }, []);

  /**
   * Backspace functionality for contentEditable
   */
  const backspaceAtCursor = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;

    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);

      if (range.collapsed) {
        // No selection, delete one character before cursor
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(input);
        preCaretRange.setEnd(range.startContainer, range.startOffset);
        const textBeforeCursor = preCaretRange.toString();

        if (textBeforeCursor.length > 0) {
          range.setStart(
            range.startContainer,
            Math.max(0, range.startOffset - 1),
          );
          range.deleteContents();
        }
      } else {
        // Delete selected content
        range.deleteContents();
      }

      // Trigger input event
      const event = new Event('input', { bubbles: true });
      Object.defineProperty(event, 'target', { value: input });
      input.dispatchEvent(event);
    }
  }, []);

  // Auto-configure keyboard based on question type
  useEffect(() => {
    if (shouldUseCustom) {
      activateCustomKeyboard();
    } else {
      deactivateCustomKeyboard();
    }
  }, [shouldUseCustom, activateCustomKeyboard, deactivateCustomKeyboard]);

  return {
    // State
    isCustomKeyboardActive,
    isNativeKeyboardVisible,
    keyboardHeight,
    viewportHeight,

    // Behavior flags
    shouldUseCustomKeyboard: shouldUseCustom,
    shouldUseNativeKeyboard: shouldUseNative,
    isMobile: behavior.isMobile,
    isIOS: behavior.isIOS,
    isAndroid: behavior.isAndroid,

    // Methods
    activateCustomKeyboard,
    deactivateCustomKeyboard,
    focusInput,
    insertTextAtCursor,
    clearContent,
    backspaceAtCursor,
    getInputProps,

    // Refs
    inputRef,
  };
};
