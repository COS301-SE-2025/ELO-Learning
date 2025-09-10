import { useCallback, useRef, useState } from 'react';

/**
 * Hook for managing button state with smooth, responsive behavior
 * @param {Object} options Configuration options
 * @param {boolean} options.preventDoubleClick - Whether to prevent double-clicks (default: true)
 * @returns {Object} Button state and handler functions
 */
export const useButtonState = (options = {}) => {
  const { preventDoubleClick = true } = options;

  const [isDisabled, setIsDisabled] = useState(false);
  const isExecutingRef = useRef(false);

  /**
   * Execute an async action with immediate, smooth state management
   * @param {Function} action - Async function to execute
   * @param {Object} actionOptions - Options for this specific action
   */
  const executeAction = useCallback(async (action, actionOptions = {}) => {
    const { onSuccess, onError, onFinally } = actionOptions;

    // Simple, immediate prevention - no delays or queuing
    if (isExecutingRef.current) {
      return; // Silent return for smooth UX
    }

    // Immediately disable - smooth, responsive feel
    isExecutingRef.current = true;
    setIsDisabled(true);

    try {
      const result = await action();

      if (onSuccess) {
        await onSuccess(result);
      }

      return result;
    } catch (error) {
      console.error('Button action failed:', error);

      if (onError) {
        await onError(error);
      } else {
        throw error;
      }
    } finally {
      // Immediate cleanup - no artificial delays
      isExecutingRef.current = false;
      setIsDisabled(false);

      if (onFinally) {
        try {
          await onFinally();
        } catch (finallyError) {
          console.error('Finally callback failed:', finallyError);
        }
      }
    }
  }, []);

  const setLoading = useCallback((loading) => {
    setIsDisabled(loading);
    isExecutingRef.current = loading;
  }, []);

  const reset = useCallback(() => {
    isExecutingRef.current = false;
    setIsDisabled(false);
  }, []);

  return {
    isLoading: isDisabled,
    isDisabled,
    isActive: !isDisabled,
    executeAction,
    setLoading,
    reset,
  };
};

/**
 * Hook for form submission with validation
 */
export const useFormSubmission = (onSubmit, validate) => {
  const buttonState = useButtonState();
  const [errors, setErrors] = useState({});

  const handleSubmit = useCallback(
    async (formData, e) => {
      if (e) {
        e.preventDefault();
      }

      setErrors({});

      await buttonState.executeAction(async () => {
        try {
          if (validate) {
            const validationErrors = await validate(formData);
            if (validationErrors && Object.keys(validationErrors).length > 0) {
              setErrors(validationErrors);
              throw new Error('Validation failed');
            }
          }

          return await onSubmit(formData);
        } catch (error) {
          if (error.validationErrors) {
            setErrors(error.validationErrors);
          } else if (error.message !== 'Validation failed') {
            setErrors({ general: error.message || 'An error occurred' });
          }
          throw error;
        }
      });
    },
    [onSubmit, validate, buttonState],
  );

  return {
    ...buttonState,
    errors,
    setErrors,
    handleSubmit,
  };
};
