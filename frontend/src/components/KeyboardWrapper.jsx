/**
 * Keyboard Wrapper Component
 * Provides consistent keyboard behavior management across all question types
 */

'use client';

import { useKeyboardManager } from '@/hooks/useKeyboardManager';
import { getQuestionType } from '@/utils/questionTypeDetection';
import { useEffect } from 'react';

/**
 * KeyboardWrapper - Wraps any component to provide keyboard management
 * @param {object} props - Component props
 * @param {object} props.question - Question object containing type information
 * @param {React.ReactNode} props.children - Child components to wrap
 * @param {boolean} props.forceNativeKeyboard - Force native keyboard regardless of question type
 * @param {function} props.onKeyboardStateChange - Callback when keyboard state changes
 * @param {string} props.className - Additional CSS classes
 * @returns {React.ReactElement} Wrapped component with keyboard management
 */
export default function KeyboardWrapper({
  question,
  children,
  forceNativeKeyboard = false,
  onKeyboardStateChange,
  className = '',
}) {
  const questionType = getQuestionType(question);
  const keyboard = useKeyboardManager(questionType, forceNativeKeyboard);

  // Notify parent of keyboard state changes
  useEffect(() => {
    if (onKeyboardStateChange) {
      onKeyboardStateChange({
        isCustomKeyboardActive: keyboard.isCustomKeyboardActive,
        isNativeKeyboardVisible: keyboard.isNativeKeyboardVisible,
        shouldUseCustomKeyboard: keyboard.shouldUseCustomKeyboard,
        shouldUseNativeKeyboard: keyboard.shouldUseNativeKeyboard,
        isMobile: keyboard.isMobile,
        keyboardHeight: keyboard.keyboardHeight,
      });
    }
  }, [
    keyboard.isCustomKeyboardActive,
    keyboard.isNativeKeyboardVisible,
    keyboard.shouldUseCustomKeyboard,
    keyboard.shouldUseNativeKeyboard,
    keyboard.isMobile,
    keyboard.keyboardHeight,
    onKeyboardStateChange,
  ]);

  // Apply platform-specific styling
  const getPlatformStyles = () => {
    const styles = {};

    if (keyboard.isMobile) {
      // Adjust for mobile keyboard
      if (keyboard.isNativeKeyboardVisible) {
        styles.paddingBottom = `${keyboard.keyboardHeight}px`;
        styles.transition = 'padding-bottom 0.3s ease-in-out';
      }

      // Prevent zoom on iOS when focusing inputs
      if (keyboard.isIOS) {
        styles.fontSize = '16px'; // Prevent zoom on iOS
      }
    }

    return styles;
  };

  // Get wrapper classes based on keyboard state
  const getWrapperClasses = () => {
    const classes = ['keyboard-wrapper'];

    if (keyboard.isMobile) {
      classes.push('mobile-keyboard');

      if (keyboard.isIOS) {
        classes.push('ios-keyboard');
      }

      if (keyboard.isAndroid) {
        classes.push('android-keyboard');
      }

      if (keyboard.isCustomKeyboardActive) {
        classes.push('custom-keyboard-active');
      }

      if (keyboard.isNativeKeyboardVisible) {
        classes.push('native-keyboard-visible');
      }
    }

    if (keyboard.shouldUseCustomKeyboard) {
      classes.push('uses-custom-keyboard');
    }

    if (keyboard.shouldUseNativeKeyboard) {
      classes.push('uses-native-keyboard');
    }

    if (className) {
      classes.push(className);
    }

    return classes.join(' ');
  };

  return (
    <div
      className={getWrapperClasses()}
      style={getPlatformStyles()}
      data-question-type={questionType}
      data-keyboard-behavior={
        keyboard.shouldUseCustomKeyboard ? 'custom' : 'native'
      }
    >
      {/* Main content */}
      {children}

      {/* Keyboard spacer for mobile */}
      {keyboard.isMobile && keyboard.isNativeKeyboardVisible && (
        <div
          className="keyboard-spacer"
          style={{ height: `${keyboard.keyboardHeight}px` }}
        />
      )}
    </div>
  );
}

/**
 * Higher-order component for keyboard management
 * @param {React.Component} WrappedComponent - Component to wrap
 * @returns {React.Component} Component with keyboard management
 */
export function withKeyboardManagement(WrappedComponent) {
  return function KeyboardManagedComponent(props) {
    return (
      <KeyboardWrapper question={props.question}>
        <WrappedComponent {...props} />
      </KeyboardWrapper>
    );
  };
}

/**
 * Hook for accessing keyboard context in child components
 * Note: This requires the component to be wrapped in KeyboardWrapper
 */
export function useKeyboardContext() {
  // This would typically use React Context, but for simplicity we'll return null
  // In a full implementation, you'd set up a KeyboardContext provider
  return null;
}
