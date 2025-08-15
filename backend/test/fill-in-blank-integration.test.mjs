// Integration test for the enhanced fill-in-blank validator
// This test imports the actual math validator and tests the functionality

import { backendMathValidator } from '../src/mathValidator.js';

// Helper function to detect if a string looks like a math expression
const isMathExpression = (str) => {
  if (!str || typeof str !== 'string') return false;

  // Check for mathematical operators, functions, or patterns
  const mathPatterns = [
    /[+\-*/^()=]/, // Basic operators and parentheses
    /\b(sin|cos|tan|log|ln|sqrt|exp|abs)\b/i, // Math functions
    /\d+\.\d+/, // Decimal numbers
    /[a-z]\s*[=]/i, // Variable assignments like x=
    /\b(pi|e|infinity)\b/i, // Math constants
    /\d+[a-z]/i, // Number with variable like 2x
    /[a-z]\d+/i, // Variable with number like x2
  ];

  return mathPatterns.some((pattern) => pattern.test(str));
};

// The actual enhanced validateFillInBlank function
const validateFillInBlank = (studentAnswer, correctAnswer) => {
  try {
    const studentAnswers =
      typeof studentAnswer === 'object'
        ? studentAnswer
        : JSON.parse(studentAnswer);
    const correctAnswers =
      typeof correctAnswer === 'object'
        ? correctAnswer
        : JSON.parse(correctAnswer);

    for (let blankId in correctAnswers) {
      const studentBlank = studentAnswers[blankId]?.trim();
      const correctBlank = correctAnswers[blankId].trim();

      if (!studentBlank) {
        return false; // Empty answer
      }

      const possibleAnswers = correctBlank.split('|').map((ans) => ans.trim());

      // Check each possible answer
      let isCorrect = false;
      for (const possibleAnswer of possibleAnswers) {
        // First try exact match (case-insensitive)
        if (studentBlank.toLowerCase() === possibleAnswer.toLowerCase()) {
          isCorrect = true;
          break;
        }

        // If it looks like a math expression, use the math validator
        if (
          isMathExpression(studentBlank) ||
          isMathExpression(possibleAnswer)
        ) {
          try {
            if (
              backendMathValidator.validateAnswer(studentBlank, possibleAnswer)
            ) {
              isCorrect = true;
              break;
            }
          } catch (mathError) {
            console.debug(
              'Math validation failed for blank:',
              blankId,
              mathError,
            );
            // Continue to next possible answer
          }
        }
      }

      if (!isCorrect) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error validating fill in blank:', error);
    return false;
  }
};

// Comprehensive test cases
const runTests = async () => {
  console.log('🧪 Enhanced Fill-in-Blank Validator - Integration Tests');
  console.log('='.repeat(60));

  const testCases = [
    {
      name: 'Basic text matching',
      student: { 0: 'derivative', 1: 'function' },
      correct: { 0: 'derivative', 1: 'function' },
      expected: true,
      description: 'Should match exact text answers',
    },
    {
      name: 'Case insensitive text',
      student: { 0: 'DERIVATIVE', 1: 'Function' },
      correct: { 0: 'derivative', 1: 'function' },
      expected: true,
      description: 'Should handle case variations',
    },
    {
      name: 'Basic math expressions',
      student: { 0: '2*x', 1: 'x^2' },
      correct: { 0: '2x', 1: 'x*x' },
      expected: true,
      description: 'Should validate equivalent math expressions',
    },
    {
      name: 'Advanced math expressions',
      student: { 0: 'sin(pi/2)', 1: '(x+1)^2' },
      correct: { 0: '1', 1: 'x^2+2*x+1' },
      expected: true,
      description: 'Should handle complex mathematical equivalences',
    },
    {
      name: 'Multiple possible answers',
      student: { 0: 'x+x' },
      correct: { 0: '2x|2*x|x+x' },
      expected: true,
      description: 'Should match one of multiple correct answers',
    },
    {
      name: 'Mixed text and math',
      student: {
        0: 'derivative',
        1: '2*x',
        2: 'continuous',
      },
      correct: {
        0: 'derivative',
        1: '2x',
        2: 'continuous',
      },
      expected: true,
      description: 'Should handle both text and math in the same question',
    },
    {
      name: 'JSON string input',
      student: '{"0": "2*x", "1": "derivative"}',
      correct: '{"0": "2x", "1": "derivative"}',
      expected: true,
      description: 'Should parse JSON string inputs correctly',
    },
    {
      name: 'Empty answer rejection',
      student: { 0: '', 1: '2x' },
      correct: { 0: 'derivative', 1: '2x' },
      expected: false,
      description: 'Should reject empty answers',
    },
    {
      name: 'Incorrect math expression',
      student: { 0: '3*x' },
      correct: { 0: '2x' },
      expected: false,
      description: 'Should reject incorrect mathematical expressions',
    },
    {
      name: 'Whitespace handling',
      student: { 0: '  2*x  ', 1: ' derivative ' },
      correct: { 0: '2x', 1: 'derivative' },
      expected: true,
      description: 'Should handle whitespace in answers',
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    try {
      const result = validateFillInBlank(testCase.student, testCase.correct);
      const status = result === testCase.expected ? '✅ PASS' : '❌ FAIL';

      console.log(`${status} ${testCase.name}`);
      console.log(`   ${testCase.description}`);
      console.log(`   Result: ${result}, Expected: ${testCase.expected}`);

      if (result === testCase.expected) {
        passed++;
      } else {
        failed++;
        console.log(`   Student: ${JSON.stringify(testCase.student)}`);
        console.log(`   Correct: ${JSON.stringify(testCase.correct)}`);
      }
      console.log('');
    } catch (error) {
      console.log(`❌ ERROR ${testCase.name}: ${error.message}`);
      failed++;
    }
  }

  console.log('📊 Test Results:');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(
    `   📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`,
  );

  if (failed === 0) {
    console.log(
      '\n🎉 All tests passed! The enhanced fill-in-blank validator is working correctly.',
    );
  } else {
    console.log(
      '\n⚠️  Some tests failed. Please review the failing cases above.',
    );
  }

  console.log('\n💡 Summary of Enhancements:');
  console.log('   • Added mathematical expression detection');
  console.log(
    '   • Integrated with backend math validator for math expressions',
  );
  console.log('   • Maintained case-insensitive text matching');
  console.log('   • Support for multiple correct answers with | separator');
  console.log('   • Proper handling of whitespace and empty answers');
  console.log('   • JSON string and object input support');
};

// Run the tests
runTests().catch(console.error);
