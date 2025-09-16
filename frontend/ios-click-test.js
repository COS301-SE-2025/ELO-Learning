/**
 * iOS Click Test Script
 * 
 * Quick test to check if iOS keyboard prevention is working.
 * Paste this into browser console on iPhone to test.
 */

// Test function to check iOS detection
function testIOSDetection() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) || 
                (/Macintosh/.test(userAgent) && navigator.maxTouchPoints > 1);
  
  console.log('User Agent:', userAgent);
  console.log('Max Touch Points:', navigator.maxTouchPoints);
  console.log('Is iOS detected:', isIOS);
  
  return isIOS;
}

// Test function to check if elements have proper attributes
function testKeyboardPrevention() {
  const mathInputs = document.querySelectorAll('.math-input, [contenteditable]');
  
  console.log('Found math inputs:', mathInputs.length);
  
  mathInputs.forEach((input, index) => {
    console.log(`Input ${index + 1}:`);
    console.log('- contentEditable:', input.contentEditable);
    console.log('- inputMode:', input.getAttribute('inputmode'));
    console.log('- readonly:', input.getAttribute('readonly'));
    console.log('- WebkitUserSelect:', getComputedStyle(input).webkitUserSelect);
    console.log('- userSelect:', getComputedStyle(input).userSelect);
    console.log('---');
  });
}

// Test click behavior
function testClickBehavior() {
  const mathInputs = document.querySelectorAll('.math-input, [contenteditable]');
  
  if (mathInputs.length > 0) {
    const input = mathInputs[0];
    console.log('Testing click on first math input...');
    
    // Simulate click
    input.click();
    
    setTimeout(() => {
      console.log('After click:');
      console.log('- Document active element:', document.activeElement);
      console.log('- Is focused:', document.activeElement === input);
      console.log('- contentEditable after click:', input.contentEditable);
    }, 500);
  }
}

// Run all tests
function runIOSTests() {
  console.log('=== iOS Keyboard Prevention Tests ===');
  
  if (!testIOSDetection()) {
    console.warn('This device is not detected as iOS. Tests may not be relevant.');
  }
  
  console.log('\n1. Checking keyboard prevention attributes:');
  testKeyboardPrevention();
  
  console.log('\n2. Testing click behavior:');
  testClickBehavior();
  
  console.log('\n3. Instructions:');
  console.log('- Try clicking in the text input area');
  console.log('- Check if iPhone keyboard appears');
  console.log('- Look for visual cursor indicator');
  console.log('- Try using custom keyboard buttons');
}

// Auto-run when pasted
if (typeof window !== 'undefined') {
  runIOSTests();
}
