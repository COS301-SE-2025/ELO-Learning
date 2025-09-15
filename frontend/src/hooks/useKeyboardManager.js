/**
 * Keyboard Management Hook
 * Manages native and custom keyboard behavior on mobile devices
 */

import {
    getActualViewportHeight,
    getKeyboardBehavior,
    shouldUseCustomKeyboard,
    shouldUseNativeKeyboard
} from '@/utils/platformDetection';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Custom hook for managing keyboard behavior
 * @param {string} questionType - Current question type
 * @param {boolean} forceNativeKeyboard - Force native keyboard regardless of question type
 * @returns {object} Keyboard management utilities
 */
export const useKeyboardManager = (questionType, forceNativeKeyboard = false) => {
  const [isCustomKeyboardActive, setIsCustomKeyboardActive] = useState(false);
  const [isNativeKeyboardVisible, setIsNativeKeyboardVisible] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
  const initialViewportHeight = useRef(0);
  const inputRef = useRef(null);
  
  const behavior = getKeyboardBehavior();
  
  // Determine keyboard behavior based on question type
  const shouldUseCustom = shouldUseCustomKeyboard(questionType) && !forceNativeKeyboard;
  const shouldUseNative = shouldUseNativeKeyboard(questionType) || forceNativeKeyboard;
  
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
      const keyboardVisible = heightDifference > 150; // Threshold for keyboard detection
      
      setIsNativeKeyboardVisible(keyboardVisible);
      setKeyboardHeight(keyboardVisible ? heightDifference : 0);
    };
    
    // Listen for viewport changes
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      return () => window.visualViewport.removeEventListener('resize', handleViewportChange);
    } else {
      window.addEventListener('resize', handleViewportChange);
      return () => window.removeEventListener('resize', handleViewportChange);
    }
  }, [behavior.isMobile]);
  
  /**
   * Prevent native keyboard from appearing
   */
  const preventNativeKeyboard = useCallback((inputElement) => {
    if (!behavior.shouldPreventNativeKeyboard || !inputElement) return;
    
    if (behavior.needsInputFocusPrevention) {
      // iOS: Use readonly attribute
      inputElement.setAttribute('readonly', 'true');
      
      // Remove readonly briefly to allow programmatic value changes
      const removeReadonly = () => {
        inputElement.removeAttribute('readonly');
        setTimeout(() => {
          if (inputElement && isCustomKeyboardActive) {
            inputElement.setAttribute('readonly', 'true');
          }
        }, 100);
      };
      
      inputElement._removeReadonly = removeReadonly;
    }
    
    if (behavior.needsInputModePrevention) {
      // Android: Use inputmode="none"
      inputElement.setAttribute('inputmode', 'none');
    }
    
    // Prevent focus events when custom keyboard is active
    const handleFocus = (e) => {
      if (isCustomKeyboardActive) {
        e.preventDefault();
        inputElement.blur();
        setTimeout(() => inputElement.focus(), 10);
      }
    };
    
    inputElement.addEventListener('focus', handleFocus);
    
    return () => {
      inputElement.removeEventListener('focus', handleFocus);
      inputElement.removeAttribute('readonly');
      inputElement.removeAttribute('inputmode');
    };
  }, [isCustomKeyboardActive, behavior]);
  
  /**
   * Allow native keyboard to appear
   */
  const allowNativeKeyboard = useCallback((inputElement) => {
    if (!inputElement) return;
    
    // Remove all keyboard prevention attributes
    inputElement.removeAttribute('readonly');
    inputElement.removeAttribute('inputmode');
    
    // Enable normal focus behavior
    inputElement.style.pointerEvents = 'auto';
  }, []);
  
  /**
   * Activate custom keyboard mode
   */
  const activateCustomKeyboard = useCallback(() => {
    setIsCustomKeyboardActive(true);
    
    // Blur any currently focused input to hide native keyboard
    if (document.activeElement && document.activeElement.tagName === 'INPUT' || 
        document.activeElement.tagName === 'TEXTAREA') {
      document.activeElement.blur();
    }
  }, []);
  
  /**
   * Deactivate custom keyboard mode
   */
  const deactivateCustomKeyboard = useCallback(() => {
    setIsCustomKeyboardActive(false);
  }, []);
  
  /**
   * Focus input with appropriate keyboard behavior
   */
  const focusInput = useCallback((inputElement, allowNative = false) => {
    if (!inputElement) return;
    
    if (allowNative || shouldUseNative) {
      allowNativeKeyboard(inputElement);
      inputElement.focus();
    } else if (shouldUseCustom) {
      preventNativeKeyboard(inputElement);
      activateCustomKeyboard();
      // Focus without triggering native keyboard
      inputElement.focus();
    } else {
      // Default behavior
      inputElement.focus();
    }
  }, [shouldUseNative, shouldUseCustom, allowNativeKeyboard, preventNativeKeyboard, activateCustomKeyboard]);
  
  /**
   * Get input attributes for keyboard prevention
   */
  const getInputProps = useCallback((customProps = {}) => {
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
      }
    };
    
    if (!behavior.isMobile) return baseProps;
    
    if (shouldUseCustom && !forceNativeKeyboard) {
      return {
        ...baseProps,
        readOnly: behavior.needsInputFocusPrevention,
        inputMode: behavior.needsInputModePrevention ? 'none' : undefined,
        autoComplete: 'off',
        autoCorrect: 'off',
        autoCapitalize: 'off',
        spellCheck: false,
        onFocus: (e) => {
          if (isCustomKeyboardActive) {
            e.preventDefault();
            e.target.blur();
            setTimeout(() => e.target.focus(), 10);
          }
          if (customProps.onFocus) customProps.onFocus(e);
        }
      };
    }
    
    return baseProps;
  }, [behavior, shouldUseCustom, forceNativeKeyboard, isCustomKeyboardActive]);
  
  /**
   * Insert text at cursor position (for custom keyboards)
   */
  const insertTextAtCursor = useCallback((text) => {
    const input = inputRef.current;
    if (!input) return;
    
    // Temporarily remove readonly to allow value changes
    const wasReadonly = input.hasAttribute('readonly');
    if (wasReadonly) {
      input.removeAttribute('readonly');
    }
    
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const currentValue = input.value;
    
    const newValue = currentValue.substring(0, start) + text + currentValue.substring(end);
    
    // Update value
    input.value = newValue;
    
    // Trigger input event for React
    const event = new Event('input', { bubbles: true });
    input.dispatchEvent(event);
    
    // Restore readonly and cursor position
    setTimeout(() => {
      if (wasReadonly && isCustomKeyboardActive) {
        input.setAttribute('readonly', 'true');
      }
      const newPosition = start + text.length;
      input.setSelectionRange(newPosition, newPosition);
    }, 0);
  }, [isCustomKeyboardActive]);
  
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
    preventNativeKeyboard,
    allowNativeKeyboard,
    focusInput,
    insertTextAtCursor,
    getInputProps,
    
    // Refs
    inputRef
  };
};
