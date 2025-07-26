// Import your enhanced backend validator
import { backendMathValidator } from '../src/mathValidator.js';
import { MathValidatorTestSuite } from './math-validator-test-suite.js';

// Test the specific problem you mentioned
function testCommutativeFactoring() {
  console.log('🧪 Testing Backend Validator Commutative Factoring\n');
  
  // Your original problem case
  const result1 = backendMathValidator.validateAnswer('(x-3)(x+3)', '(x+3)(x-3)');
  console.log(`Test 1 - (x-3)(x+3) vs (x+3)(x-3): ${result1 ? '✅ PASS' : '❌ FAIL'}`);
  
  // Additional test cases
  const result2 = backendMathValidator.validateAnswer('(a+b)(c+d)', '(c+d)(a+b)');
  console.log(`Test 2 - (a+b)(c+d) vs (c+d)(a+b): ${result2 ? '✅ PASS' : '❌ FAIL'}`);
  
  const result3 = backendMathValidator.validateAnswer('2(x+1)(x-1)', '(x-1)(x+1)*2');
  console.log(`Test 3 - 2(x+1)(x-1) vs (x-1)(x+1)*2: ${result3 ? '✅ PASS' : '❌ FAIL'}`);
  
  // Should fail test
  const result4 = backendMathValidator.validateAnswer('(x+3)(x-3)', '(x+2)(x-2)');
  console.log(`Test 4 - (x+3)(x-3) vs (x+2)(x-2): ${result4 ? '❌ FAIL (should be false)' : '✅ PASS (correctly false)'}`);
  
  return result1 && result2 && result3 && !result4;
}

// Run the test
if (testCommutativeFactoring()) {
  console.log('\n🎉 All backend tests passed!');
} else {
  console.log('\n❌ Some backend tests failed');
}

// Run comprehensive test suite
const backendTestSuite = new MathValidatorTestSuite(backendMathValidator, 'Backend Validator');
backendTestSuite.runAllTests();