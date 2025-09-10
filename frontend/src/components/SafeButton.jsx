import React from 'react';
import { useButtonState, useFormSubmission } from '../hooks/useButtonState';

/**
 * Enhanced button component with built-in double-click prevention and loading states
 * @param {Object} props
 * @param {Function} props.onClick - Click handler function (can be async)
 * @param {boolean} props.disabled - External disabled state
 * @param {boolean} props.loading - External loading state
 * @param {string} props.loadingText - Text to show when loading
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.className - CSS classes
 * @param {Object} props.buttonStateOptions - Options for useButtonState hook
 * @param {boolean} props.preventDoubleClick - Whether to prevent double-clicks (default: true)
 * @param {string} props.type - Button type
 * @param {Object} props.rest - Other button props
 */
export const SafeButton = ({
  onClick,
  disabled: externalDisabled = false,
  loading: externalLoading = false,
  loadingText,
  children,
  className = '',
  buttonStateOptions = {},
  preventDoubleClick = true,
  type = 'button',
  ...rest
}) => {
  const buttonState = useButtonState({
    preventDoubleClick,
    ...buttonStateOptions
  });

  // Combine external and internal states - simplified
  const isDisabled = externalDisabled || buttonState.isDisabled;
  const isLoading = externalLoading || buttonState.isDisabled;

  const handleClick = async (e) => {
    if (!onClick || isDisabled) {
      return;
    }

    if (preventDoubleClick) {
      await buttonState.executeAction(async () => {
        return await onClick(e);
      });
    } else {
      await onClick(e);
    }
  };

  // Determine button styling based on state
  const getButtonClasses = () => {
    const baseClasses = className;
    
    if (isDisabled || isLoading) {
      // Check if it's using custom disabled class or apply default
      if (baseClasses.includes('disabled_button')) {
        return baseClasses.replace('main-button', 'disabled_button');
      } else if (baseClasses.includes('main-button')) {
        return baseClasses.replace('main-button', 'disabled_button');
      } else {
        return `${baseClasses} disabled:opacity-50 disabled:cursor-not-allowed`;
      }
    }
    
    return baseClasses;
  };

  // Fixed: Determine what to show inside the button
  const renderButtonContent = () => {
    if (isLoading) {
      if (loadingText) {
        // Show custom loading text
        return loadingText;
      } else {
        // Show spinner with original text
        return (
          <span className="inline-flex items-center">
            <svg 
              className="animate-spin -ml-1 mr-2 h-4 w-4" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {children}
          </span>
        );
      }
    } else {
      // Not loading, show normal content
      return children;
    }
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={isDisabled}
      className={getButtonClasses()}
      {...rest}
    >
      {renderButtonContent()}
    </button>
  );
};

/**
 * Enhanced form component with built-in submission handling
 */
export const SafeForm = ({
  onSubmit,
  validate,
  children,
  className = '',
  ...rest
}) => {
  const { handleSubmit, ...formState } = useFormSubmission(onSubmit, validate);

  const onFormSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    handleSubmit(data, e);
  };

  return (
    <form
      onSubmit={onFormSubmit}
      className={className}
      {...rest}
    >
      {typeof children === 'function' ? children(formState) : children}
    </form>
  );
};

export default SafeButton;