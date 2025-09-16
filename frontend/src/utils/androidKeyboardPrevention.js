/**
 * Android-specific keyboard prevention utilities
 * Optimized for Chrome and Samsung Internet browsers
 */

/**
 * Detect specific Android browsers
 */
export const getAndroidBrowserInfo = () => {
  if (typeof window === 'undefined') return { isAndroid: false };

  const userAgent = navigator.userAgent || '';

  const isAndroid = /Android/i.test(userAgent);
  const isChrome = /Chrome/i.test(userAgent) && !/Edg/i.test(userAgent);
  const isSamsungInternet = /SamsungBrowser/i.test(userAgent);
  const isFirefox = /Firefox/i.test(userAgent);

  return {
    isAndroid,
    isChrome,
    isSamsungInternet,
    isFirefox,
    userAgent,
  };
};

/**
 * Apply comprehensive Android keyboard prevention
 * @param {HTMLElement} element - The contentEditable element
 * @param {boolean} preventKeyboard - Whether to prevent keyboard
 */
export const applyAndroidKeyboardPrevention = (
  element,
  preventKeyboard = true,
) => {
  if (!element || typeof window === 'undefined') return;

  const browserInfo = getAndroidBrowserInfo();
  if (!browserInfo.isAndroid) return;

  if (preventKeyboard) {
    // Core prevention attributes
    element.setAttribute('inputmode', 'none');
    element.setAttribute('contenteditable', 'false');

    // Browser-specific prevention
    if (browserInfo.isChrome) {
      // Chrome-specific prevention
      element.style.webkitUserModify = 'read-only';
      element.style.webkitAppearance = 'none';
      element.style.appearance = 'none';
    }

    if (browserInfo.isSamsungInternet) {
      // Samsung Internet specific
      element.style.webkitUserModify = 'read-only';
      element.style.webkitWritingMode = 'unset';
      element.style.writingMode = 'unset';
    }

    // Universal Android prevention
    element.style.webkitTouchCallout = 'none';
    element.style.webkitTapHighlightColor = 'transparent';
    element.style.imeMode = 'disabled';
    element.style.webkitImeMode = 'disabled';

    // Maintain usability
    element.style.cursor = 'text';
    element.style.caretColor = '#4D5DED';
    element.style.webkitUserSelect = 'text';
    element.style.userSelect = 'text';
  } else {
    // Remove prevention
    element.removeAttribute('inputmode');
    element.setAttribute('contenteditable', 'true');

    // Reset styles
    element.style.webkitUserModify = '';
    element.style.webkitAppearance = '';
    element.style.appearance = '';
    element.style.webkitWritingMode = '';
    element.style.writingMode = '';
    element.style.imeMode = '';
    element.style.webkitImeMode = '';
  }
};

/**
 * Handle Android focus events to prevent keyboard - Simplified Version
 * @param {Event} event - Focus event
 * @param {Function} callback - Callback after handling
 */
export const handleAndroidFocus = (event, callback) => {
  const browserInfo = getAndroidBrowserInfo();
  if (!browserInfo.isAndroid) {
    callback?.(event);
    return;
  }

  const element = event.target;

  // Apply prevention after focus is established (no preventDefault needed)
  setTimeout(() => {
    applyAndroidKeyboardPrevention(element, true);
    callback?.(event);
  }, 50);
};

/**
 * Create non-passive touch event handler for Android keyboard prevention
 * @param {HTMLElement} element - Element to attach handler to
 * @param {boolean} preventKeyboard - Whether to prevent keyboard
 * @returns {Function} Cleanup function
 */
export const attachNonPassiveTouchHandler = (
  element,
  preventKeyboard = true,
) => {
  const browserInfo = getAndroidBrowserInfo();
  if (!browserInfo.isAndroid || !preventKeyboard || !element) {
    return () => {}; // Return empty cleanup function
  }

  const handleTouchStart = (event) => {
    // Only prevent if touching the input directly (not buttons)
    if (
      event.target === element &&
      element.getAttribute('contenteditable') === 'false'
    ) {
      // Check if it's not a button or interactive element
      if (!event.target.closest('button, [role="button"], .h-12')) {
        event.preventDefault();
      }
    }
  };

  // Add non-passive listener
  element.addEventListener('touchstart', handleTouchStart, { passive: false });

  // Return cleanup function
  return () => {
    element.removeEventListener('touchstart', handleTouchStart);
  };
};

/**
 * Monitor for virtual keyboard visibility on Android
 * @param {Function} onKeyboardToggle - Callback when keyboard visibility changes
 * @returns {Function} Cleanup function
 */
export const monitorAndroidKeyboard = (onKeyboardToggle) => {
  const browserInfo = getAndroidBrowserInfo();
  if (!browserInfo.isAndroid || typeof window === 'undefined') {
    return () => {};
  }

  let initialHeight = window.innerHeight;
  let isKeyboardVisible = false;

  const handleResize = () => {
    const currentHeight = window.innerHeight;
    const heightDifference = initialHeight - currentHeight;
    const keyboardThreshold = 150; // pixels

    const keyboardNowVisible = heightDifference > keyboardThreshold;

    if (keyboardNowVisible !== isKeyboardVisible) {
      isKeyboardVisible = keyboardNowVisible;
      onKeyboardToggle?.(isKeyboardVisible, heightDifference);

      // If keyboard became visible when it shouldn't, try to close it
      if (isKeyboardVisible) {
        console.warn(
          'Android keyboard appeared unexpectedly, attempting to close...',
        );

        // Try to blur active element
        if (document.activeElement && document.activeElement.blur) {
          document.activeElement.blur();
        }
      }
    }
  };

  // Use visualViewport API if available
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleResize);
    return () =>
      window.visualViewport.removeEventListener('resize', handleResize);
  } else {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }
};

/**
 * Force close Android virtual keyboard
 */
export const forceCloseAndroidKeyboard = () => {
  const browserInfo = getAndroidBrowserInfo();
  if (!browserInfo.isAndroid) return;

  // Multiple methods to ensure keyboard closes
  if (document.activeElement && document.activeElement.blur) {
    document.activeElement.blur();
  }

  // Create a temporary hidden input and focus/blur it
  const tempInput = document.createElement('input');
  tempInput.style.position = 'absolute';
  tempInput.style.left = '-9999px';
  tempInput.style.opacity = '0';
  tempInput.setAttribute('inputmode', 'none');
  tempInput.setAttribute('readonly', true);

  document.body.appendChild(tempInput);
  tempInput.focus();
  tempInput.blur();
  document.body.removeChild(tempInput);

  console.log('Attempted to force close Android keyboard');
};
