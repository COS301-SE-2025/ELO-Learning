/**
 * ContentEditable Math Input Test - iOS & Android Keyboard Prevention
 *
 * This tests the contentEditable div approach for preventing native keyboards
 * while maintaining full functionality for math input.
 *
 * TESTING CHECKLIST:
 *
 * On iOS Device (iPhone/iPad):
 * 1. Open Math Input question
 * 2. Tap the input field
 * 3. Verify: contentEditable="false" (check in dev tools)
 * 4. Verify: NO native keyboard appears
 * 5. Verify: Custom keyboard is visible
 * 6. Verify: Can tap to position cursor
 * 7. Verify: Custom keyboard buttons insert text at cursor
 * 8. Verify: Text selection works
 * 9. Verify: Backspace and clear work
 * 10. Verify: Placeholder appears when empty
 *
 * On Android Device:
 * 1. Open Math Input question
 * 2. Tap the input field
 * 3. Verify: contentEditable="false" (check in dev tools)
 * 4. Verify: NO native keyboard appears
 * 5. Verify: Custom keyboard is visible
 * 6. Verify: Can tap to position cursor
 * 7. Verify: Custom keyboard buttons insert text at cursor
 * 8. Verify: Text selection works
 * 9. Verify: Backspace and clear work
 * 10. Verify: Placeholder appears when empty
 *
 * On Desktop:
 * 1. Verify: contentEditable="true"
 * 2. Verify: Can type normally with keyboard
 * 3. Verify: All functionality works as expected
 */

console.log('ContentEditable Math Input Test Loaded - iOS & Android Support');

// Debug helper to check contentEditable state
window.debugContentEditableState = () => {
  const mathInput = document.querySelector('.math-input');
  if (mathInput) {
    console.log('=== ContentEditable Debug Info ===');
    console.log('Element found:', !!mathInput);
    console.log('contentEditable:', mathInput.contentEditable);
    console.log('textContent:', JSON.stringify(mathInput.textContent));
    console.log('innerHTML:', mathInput.innerHTML);
    console.log(
      'hasAttribute data-placeholder:',
      mathInput.hasAttribute('data-placeholder'),
    );
    console.log(
      'placeholder value:',
      mathInput.getAttribute('data-placeholder'),
    );
    console.log('isEmpty:', mathInput.textContent.length === 0);

    // Check iOS-specific attributes
    console.log('readonly attribute:', mathInput.hasAttribute('readonly'));
    console.log('inputmode attribute:', mathInput.getAttribute('inputmode'));
    
    // Check iOS-specific styles
    const computedStyle = window.getComputedStyle(mathInput);
    console.log('webkit-user-select:', computedStyle.webkitUserSelect);
    console.log('user-select:', computedStyle.userSelect);
    console.log('webkit-user-modify:', computedStyle.webkitUserModify);

    // Check selection state
    const selection = window.getSelection();
    console.log('selection.rangeCount:', selection.rangeCount);
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      console.log('selection.isCollapsed:', range.collapsed);
      console.log('selection.startOffset:', range.startOffset);
      console.log('selection.endOffset:', range.endOffset);
    }

    // Check keyboard state
    const container = mathInput.closest('.custom-keyboard-active');
    console.log('custom keyboard active:', !!container);

    // Platform detection
    const platformClasses =
      document.body.className ||
      mathInput.closest('[class*="platform-"]')?.className;
    console.log('platform classes:', platformClasses);
    
    // iOS-specific detection
    const userAgent = navigator.userAgent;
    const isIOSUserAgent = /iPad|iPhone|iPod/.test(userAgent);
    const isPossibleIOS = /Macintosh/.test(userAgent) && navigator.maxTouchPoints > 1;
    console.log('iOS detected (userAgent):', isIOSUserAgent);
    console.log('iOS detected (Macintosh + touch):', isPossibleIOS);
    console.log('iOS detected (combined):', isIOSUserAgent || isPossibleIOS);

    return {
      element: mathInput,
      contentEditable: mathInput.contentEditable,
      textContent: mathInput.textContent,
      customKeyboardActive: !!container,
      hasSelection: selection.rangeCount > 0,
      isIOS: isIOSUserAgent || isPossibleIOS,
      readOnly: mathInput.hasAttribute('readonly'),
      inputMode: mathInput.getAttribute('inputmode'),
    };
  } else {
    console.log('Math input element not found');
    return null;
  }
};

// Test text insertion programmatically (simulates custom keyboard)
window.testTextInsertion = (text = 'x^2') => {
  const mathInput = document.querySelector('.math-input');
  if (!mathInput) {
    console.log('Math input not found');
    return false;
  }

  console.log('Testing text insertion:', text);

  // Ensure focus
  mathInput.focus();

  const selection = window.getSelection();
  let range;

  if (selection.rangeCount > 0) {
    range = selection.getRangeAt(0);
  } else {
    range = document.createRange();
    range.selectNodeContents(mathInput);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  // Insert text
  range.deleteContents();
  const textNode = document.createTextNode(text);
  range.insertNode(textNode);

  // Move cursor after inserted text
  range.setStartAfter(textNode);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);

  // Trigger input event
  const event = new Event('input', { bubbles: true });
  mathInput.dispatchEvent(event);

  console.log('Text inserted successfully');
  console.log('New content:', mathInput.textContent);
  return true;
};

// Test cursor positioning
window.testCursorPositioning = (position = 0) => {
  const mathInput = document.querySelector('.math-input');
  if (!mathInput) {
    console.log('Math input not found');
    return false;
  }

  mathInput.focus();

  const selection = window.getSelection();
  const range = document.createRange();

  try {
    // Simple positioning at character index
    const textNode = mathInput.firstChild || mathInput;
    const maxPosition = textNode.textContent ? textNode.textContent.length : 0;
    const safePosition = Math.min(position, maxPosition);

    if (textNode.nodeType === Node.TEXT_NODE) {
      range.setStart(textNode, safePosition);
      range.setEnd(textNode, safePosition);
    } else {
      range.selectNodeContents(textNode);
      range.collapse(position === 0);
    }

    selection.removeAllRanges();
    selection.addRange(range);

    console.log('Cursor positioned at:', safePosition);
    return true;
  } catch (error) {
    console.log('Cursor positioning failed:', error);
    return false;
  }
};

// Test clear functionality
window.testClear = () => {
  const mathInput = document.querySelector('.math-input');
  if (!mathInput) {
    console.log('Math input not found');
    return false;
  }

  mathInput.textContent = '';
  const event = new Event('input', { bubbles: true });
  mathInput.dispatchEvent(event);

  console.log('Content cleared');
  return true;
};

// Test selection functionality
window.testSelection = (start = 0, end = -1) => {
  const mathInput = document.querySelector('.math-input');
  if (!mathInput) {
    console.log('Math input not found');
    return false;
  }

  const textContent = mathInput.textContent || '';
  const endPos = end === -1 ? textContent.length : end;

  mathInput.focus();

  const selection = window.getSelection();
  const range = document.createRange();

  try {
    const textNode = mathInput.firstChild || mathInput;

    if (textNode.nodeType === Node.TEXT_NODE) {
      range.setStart(textNode, Math.min(start, textContent.length));
      range.setEnd(textNode, Math.min(endPos, textContent.length));
    } else {
      range.selectNodeContents(textNode);
    }

    selection.removeAllRanges();
    selection.addRange(range);

    console.log('Selected text:', selection.toString());
    return true;
  } catch (error) {
    console.log('Selection failed:', error);
    return false;
  }
};

// Run comprehensive test suite
window.runContentEditableTests = () => {
  console.log('=== Running ContentEditable Test Suite ===');

  const state = debugContentEditableState();
  if (!state) return false;

  console.log('1. Testing text insertion...');
  testTextInsertion('2x + 3');

  console.log('2. Testing cursor positioning...');
  testCursorPositioning(3);

  console.log('3. Testing text selection...');
  testSelection(0, 2);

  console.log('4. Testing additional text insertion...');
  testTextInsertion(' = 0');

  console.log('5. Testing clear...');
  setTimeout(() => {
    testClear();
    console.log('=== Test Suite Complete ===');
  }, 2000);

  return true;
};

// Auto-run tests when page loads (for easy testing)
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    console.log('ContentEditable test utils loaded');
    console.log('Available commands:');
    console.log('- debugContentEditableState()');
    console.log('- testTextInsertion("text")');
    console.log('- testCursorPositioning(position)');
    console.log('- testSelection(start, end)');
    console.log('- testClear()');
    console.log('- runContentEditableTests() - runs full test suite');
  });
}
