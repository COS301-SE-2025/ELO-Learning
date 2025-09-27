/**
 * ContentEditable helper utilities for math input components
 * Provides cursor management, text manipulation, and Selection API helpers
 */

/**
 * Preserve cursor position during DOM modifications
 * @param {HTMLElement} element - The contentEditable element
 * @param {Function} callback - Function to execute while preserving cursor
 */
export const preserveCursorPosition = (element, callback) => {
  if (!element) return;
  
  const selection = window.getSelection();
  let savedRange = null;
  
  // Save current cursor position
  if (selection.rangeCount > 0) {
    savedRange = selection.getRangeAt(0).cloneRange();
  }
  
  // Execute the callback
  callback();
  
  // Restore cursor position after a brief delay
  setTimeout(() => {
    if (savedRange && selection) {
      try {
        selection.removeAllRanges();
        selection.addRange(savedRange);
      } catch (e) {
        // Fallback: position at end
        const range = document.createRange();
        if (element.firstChild) {
          range.setStart(element.firstChild, element.textContent.length);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }
  }, 10);
};

/**
 * Get current cursor position in contentEditable element
 * @param {HTMLElement} element - ContentEditable element
 * @returns {number} Cursor position
 */
export const getCursorPosition = (element) => {
  if (!element) return 0;

  const selection = window.getSelection();
  if (selection.rangeCount === 0) return 0;

  try {
    // Remove cursor indicators first to get clean position
    const clone = element.cloneNode(true);
    const indicators = clone.querySelectorAll('.cursor-indicator');
    indicators.forEach((indicator) => indicator.remove());

    const range = selection.getRangeAt(0);

    // Simple approach: use textContent for position calculation
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.startContainer, range.startOffset);

    // Get text without cursor indicators
    const preText = preCaretRange.toString().replace(/\|/g, '');
    const totalText = getTextContent(element);

    // Ensure position is within bounds
    return Math.min(Math.max(0, preText.length), totalText.length);
  } catch (error) {
    console.warn('Cursor position detection failed:', error);
    return getTextContent(element).length; // Fallback to end
  }
};

/**
 * Create and show visual cursor indicator at current position
 * @param {HTMLElement} element - ContentEditable element
 */
export const showCursorIndicator = (element) => {
  if (!element) return;

  // Remove any existing cursor indicators
  removeCursorIndicator(element);

  const selection = window.getSelection();
  if (selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);

  // Create cursor indicator element
  const cursorIndicator = document.createElement('span');
  cursorIndicator.className = 'cursor-indicator';
  cursorIndicator.innerHTML = '|';
  cursorIndicator.style.cssText = `
    display: inline-block;
    color: #4D5DED;
    font-weight: bold;
    animation: cursor-blink 1s infinite;
    margin: 0;
    padding: 0;
    line-height: inherit;
  `;

  // Insert the cursor indicator at current position
  range.insertNode(cursorIndicator);

  // Collapse range after the indicator
  range.setStartAfter(cursorIndicator);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
};

/**
 * Remove visual cursor indicator
 * @param {HTMLElement} element - ContentEditable element
 */
export const removeCursorIndicator = (element) => {
  if (!element) return;

  // Remove cursor indicator elements
  const indicators = element.querySelectorAll('.cursor-indicator');
  indicators.forEach((indicator) => {
    if (indicator.parentNode) {
      indicator.parentNode.removeChild(indicator);
    }
  });

  // Also remove any stray pipe characters that might be left behind
  let currentText = element.textContent || '';
  if (currentText.includes('|')) {
    element.textContent = currentText.replace(/\|/g, '');
  }
};

/**
 * Set cursor position in contentEditable element
 * @param {HTMLElement} element - ContentEditable element
 * @param {number} position - Position to set cursor
 * @param {boolean} showIndicator - Whether to show visual cursor indicator
 */
export const setCursorPosition = (element, position, showIndicator = false) => {
  if (!element) return;

  // Remove any existing cursor indicators first
  removeCursorIndicator(element);

  const selection = window.getSelection();
  const text = getTextContent(element);
  const targetPos = Math.min(Math.max(0, position), text.length);

  try {
    const range = document.createRange();

    // Handle empty element
    if (text.length === 0 || !element.firstChild) {
      if (!element.firstChild) {
        const textNode = document.createTextNode('');
        element.appendChild(textNode);
      }
      range.setStart(element.firstChild, 0);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);

      if (showIndicator) {
        setTimeout(() => showCursorIndicator(element), 10);
      }
      return;
    }

    // Find the correct text node and offset for the target position
    let currentPos = 0;
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      (node) => {
        // Skip cursor indicator nodes
        if (
          node.parentElement &&
          node.parentElement.classList.contains('cursor-indicator')
        ) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
      false,
    );

    let targetNode = null;
    let targetOffset = 0;
    let node;

    while ((node = walker.nextNode())) {
      const nodeLength = node.textContent.length;

      if (currentPos + nodeLength >= targetPos) {
        targetNode = node;
        targetOffset = targetPos - currentPos;
        break;
      }
      currentPos += nodeLength;
    }

    // If we found a target node, set the cursor there
    if (targetNode) {
      range.setStart(
        targetNode,
        Math.min(targetOffset, targetNode.textContent.length),
      );
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      // Fallback: place cursor at the end
      range.selectNodeContents(element);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  } catch (error) {
    console.warn('Cursor positioning failed:', error);
    // Fallback: place cursor at end
    try {
      const range = document.createRange();
      range.selectNodeContents(element);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    } catch (fallbackError) {
      console.warn('Fallback cursor positioning also failed:', fallbackError);
    }
  }

  // Show visual indicator if requested
  if (showIndicator) {
    setTimeout(() => showCursorIndicator(element), 10);
  }
};

/**
 * Insert text at current cursor position in contentEditable element
 * @param {HTMLElement} element - ContentEditable element
 * @param {string} text - Text to insert
 * @param {boolean} preventEcho - Whether to prevent text echoing
 */
export const insertTextAtCursor = (element, text, preventEcho = true) => {
  if (!element) return;

  removeCursorIndicator(element);

  try {
    const selection = window.getSelection();
    const currentText = getTextContent(element);

    // Get current cursor position
    let currentPos = 0;
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const preRange = document.createRange();
      preRange.selectNodeContents(element);
      preRange.setEnd(range.startContainer, range.startOffset);
      currentPos = preRange.toString().replace(/\|/g, '').length;
    } else {
      // No selection, assume cursor is at end
      currentPos = currentText.length;
    }

    // Insert text at cursor position
    const newText =
      currentText.substring(0, currentPos) +
      text +
      currentText.substring(currentPos);
    const newCursorPos = currentPos + text.length;

    // Update content
    element.textContent = newText;

    // Set cursor position after inserted text
    setCursorPosition(element, newCursorPos);
  } catch (error) {
    console.warn('Insert at cursor failed, falling back to append:', error);
    // Fallback: append to end
    const currentText = getTextContent(element);
    const newText = currentText + text;
    element.textContent = newText;

    // Position cursor at end
    setCursorPosition(element, newText.length);
  }

  if (!preventEcho) {
    const event = new Event('input', { bubbles: true });
    element.dispatchEvent(event);
  }
};

/**
 * Delete character(s) at cursor position (backspace functionality)
 * @param {HTMLElement} element - ContentEditable element
 * @param {number} count - Number of characters to delete (default: 1)
 * @param {boolean} preventEcho - Whether to prevent text echoing
 */
export const deleteAtCursor = (element, count = 1, preventEcho = true) => {
  if (!element) return;

  // Remove cursor indicators to prevent interference
  removeCursorIndicator(element);

  // Get current position and text content
  const currentText = getTextContent(element);
  let currentPos = getCursorPosition(element);

  // Validate position
  if (currentPos < 0 || currentPos > currentText.length) {
    currentPos = currentText.length;
  }

  if (currentPos <= 0 || currentText.length === 0) return; // Nothing to delete

  // Calculate deletion range
  const deleteStart = Math.max(0, currentPos - count);
  const deleteEnd = currentPos;

  // Create new text with deletion
  const newText =
    currentText.slice(0, deleteStart) + currentText.slice(deleteEnd);

  // Update content directly
  element.textContent = newText;

  // Set cursor position at the deletion point
  setCursorPosition(element, deleteStart);

  // Only trigger input event if not preventing echo
  if (!preventEcho) {
    const event = new Event('input', { bubbles: true });
    element.dispatchEvent(event);
  }
};

/**
 * Move cursor left or right in contentEditable element
 * @param {HTMLElement} element - ContentEditable element
 * @param {string} direction - 'left' or 'right'
 * @param {boolean} showIndicator - Whether to show visual cursor indicator
 */
export const moveCursor = (element, direction, showIndicator = false) => {
  if (!element) return;

  // Remove cursor indicators to prevent interference
  removeCursorIndicator(element);

  const currentPos = getCursorPosition(element);
  const textLength = getTextContent(element).length;

  let newPos;
  if (direction === 'left') {
    newPos = Math.max(0, currentPos - 1);
  } else if (direction === 'right') {
    newPos = Math.min(textLength, currentPos + 1);
  } else {
    return;
  }

  // Always attempt to set the new position - remove the position change check
  // The issue was that getCursorPosition and setCursorPosition weren't always consistent
  setCursorPosition(element, newPos, showIndicator);
};

/**
 * Get the current text content without HTML
 * @param {HTMLElement} element - ContentEditable element
 * @returns {string} Plain text content
 */
export const getTextContent = (element) => {
  if (!element) return '';

  // Clone the element to avoid modifying the original
  const clone = element.cloneNode(true);

  // Remove cursor indicator elements
  const indicators = clone.querySelectorAll('.cursor-indicator');
  indicators.forEach((indicator) => indicator.remove());

  // Get text content and remove any stray pipe characters
  let text = clone.textContent || '';
  return text.replace(/\|/g, '');
};

/**
 * Set text content safely in contentEditable element
 * @param {HTMLElement} element - ContentEditable element
 * @param {string} text - Text to set
 * @param {boolean} maintainCursor - Whether to maintain cursor position
 * @param {boolean} preventEcho - Whether to prevent text echoing
 */
export const setTextContent = (
  element,
  text,
  maintainCursor = false,
  preventEcho = true,
) => {
  if (!element) return;

  const currentPos = maintainCursor ? getCursorPosition(element) : 0;

  // Remove cursor indicators first
  removeCursorIndicator(element);

  // Clear existing content
  element.textContent = text;

  // Restore cursor position if requested
  if (maintainCursor && text.length > 0) {
    const newPos = Math.min(currentPos, text.length);
    setCursorPosition(element, newPos);
  }

  // Only trigger input event if not preventing echo
  if (!preventEcho) {
    const event = new Event('input', { bubbles: true });
    element.dispatchEvent(event);
  }
};

/**
 * Check if contentEditable element is empty
 * @param {HTMLElement} element - ContentEditable element
 * @returns {boolean} True if empty
 */
export const isEmpty = (element) => {
  if (!element) return true;
  return element.textContent.trim().length === 0;
};

/**
 * Clear all content from contentEditable element
 * @param {HTMLElement} element - ContentEditable element
 * @param {boolean} preventEcho - Whether to prevent text echoing
 */
export const clearContent = (element, preventEcho = true) => {
  if (!element) return;

  // Remove cursor indicators first
  removeCursorIndicator(element);

  element.textContent = '';

  // Set cursor at beginning
  setCursorPosition(element, 0);

  // Only trigger input event if not preventing echo
  if (!preventEcho) {
    const event = new Event('input', { bubbles: true });
    element.dispatchEvent(event);
  }
};

/**
 * Focus contentEditable element and place cursor at end
 * @param {HTMLElement} element - ContentEditable element
 * @param {boolean} showIndicator - Whether to show visual cursor indicator
 */
export const focusAtEnd = (element, showIndicator = false) => {
  if (!element) return;

  element.focus();

  // Place cursor at end
  const textLength = getTextContent(element).length;
  setCursorPosition(element, textLength, showIndicator);
};

