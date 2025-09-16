/**
 * Platform Detection Utility
 * Provides mobile platform detection and keyboard behavior utilities
 */

/**
 * Detect if the current device is mobile
 * @returns {boolean} True if mobile device
 */
export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
  // Check for mobile patterns
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  
  // Additional checks for touch support
  const hasTouchSupport = 'ontouchstart' in window || 
                         navigator.maxTouchPoints > 0 || 
                         navigator.msMaxTouchPoints > 0;
  
  // Check viewport width (mobile-like dimensions)
  const isSmallViewport = window.innerWidth <= 768;
  
  return mobileRegex.test(userAgent) || (hasTouchSupport && isSmallViewport);
};

/**
 * Detect if the current device is iOS
 * @returns {boolean} True if iOS device
 */
export const isIOS = () => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  return /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
};

/**
 * Detect if the current device is Android
 * @returns {boolean} True if Android device
 */
export const isAndroid = () => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  return /Android/i.test(userAgent);
};

/**
 * Get platform-specific CSS classes for styling with hydration safety
 * @returns {string} CSS class names for platform-specific styling
 */
export const getPlatformClasses = () => {
  // Return empty string during SSR to prevent hydration mismatch
  if (typeof window === 'undefined') return '';
  
  if (!isMobile()) return 'platform-desktop';
  
  if (isIOS()) return 'platform-mobile platform-ios';
  if (isAndroid()) return 'platform-mobile platform-android';
  
  return 'platform-mobile platform-unknown';
};

/**
 * Check if the device supports virtual keyboards
 * @returns {boolean} True if virtual keyboard is supported
 */
export const supportsVirtualKeyboard = () => {
  if (typeof window === 'undefined') return false;
  
  return 'virtualKeyboard' in navigator;
};

/**
 * Get the current viewport height accounting for mobile browser bars
 * @returns {number} Actual viewport height
 */
export const getActualViewportHeight = () => {
  if (typeof window === 'undefined') return 0;
  
  // For mobile browsers, use visual viewport if available
  if (window.visualViewport) {
    return window.visualViewport.height;
  }
  
  // Fallback to window inner height
  return window.innerHeight;
};

/**
 * Detect if the device is in landscape mode
 * @returns {boolean} True if in landscape mode
 */
export const isLandscape = () => {
  if (typeof window === 'undefined') return false;
  
  return window.innerWidth > window.innerHeight;
};

/**
 * Platform-specific keyboard behavior settings
 */
export const getKeyboardBehavior = () => {
  const platform = {
    isMobile: isMobile(),
    isIOS: isIOS(),
    isAndroid: isAndroid(),
    supportsVirtualKeyboard: supportsVirtualKeyboard()
  };
  
  return {
    ...platform,
    // iOS-specific behavior - use readonly for keyboard prevention
    needsInputFocusPrevention: platform.isIOS,
    supportsReadOnlyPrevention: platform.isIOS,
    requiresBlurOnCustomKeyboard: false, // Changed: Don't blur for cursor positioning
    
    // Android-specific behavior - use inputMode="none" only for clean prevention
    needsInputModePrevention: platform.isAndroid,
    supportsInputModeNone: platform.isAndroid,
    
    // General mobile behavior
    shouldPreventNativeKeyboard: platform.isMobile,
    needsViewportAdjustment: platform.isMobile,
    requiresManualFocus: false // Changed: Allow normal focus for cursor positioning
  };
};

/**
 * Get recommended input attributes for preventing native keyboard
 * @param {boolean} preventNativeKeyboard - Whether to prevent native keyboard
 * @returns {object} Input attributes object
 */
export const getInputAttributes = (preventNativeKeyboard = false) => {
  if (!preventNativeKeyboard || !isMobile()) {
    return {};
  }
  
  const behavior = getKeyboardBehavior();
  const attributes = {};
  
  if (behavior.isIOS) {
    // Use readonly to prevent keyboard on iOS
    attributes.readOnly = true;
  }
  
  if (behavior.isAndroid) {
    // Use multiple methods for Android keyboard prevention
    attributes.inputMode = 'none';
    attributes.readOnly = true; // Also use readonly for Android as backup
  }
  
  // Additional prevention attributes
  attributes.autoComplete = 'off';
  attributes.autoCorrect = 'off';
  attributes.autoCapitalize = 'off';
  attributes.spellCheck = false;
  
  // Prevent text selection and context menu
  if (isMobile()) {
    attributes.onContextMenu = (e) => e.preventDefault();
    attributes.onSelect = (e) => e.preventDefault();
  }
  
  return attributes;
};

/**
 * Utility to check if a specific question type should use custom keyboard
 * @param {string} questionType - The type of question
 * @returns {boolean} True if should use custom keyboard
 */
export const shouldUseCustomKeyboard = (questionType) => {
  if (!isMobile()) return false;
  
  const customKeyboardTypes = [
    'Math Input',
    'Expression Builder',
    'Fill-in-the-Blank',
    'Fill-in-the-Blanks'
  ];
  
  return customKeyboardTypes.includes(questionType);
};

/**
 * Utility to check if a question type should use native keyboard
 * @param {string} questionType - The type of question
 * @returns {boolean} True if should use native keyboard
 */
export const shouldUseNativeKeyboard = (questionType) => {
  const nativeKeyboardTypes = [
    'Open Response',
    // Add other types that need native keyboard
  ];
  
  return nativeKeyboardTypes.includes(questionType);
};
