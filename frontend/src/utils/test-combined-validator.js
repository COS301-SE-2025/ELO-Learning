// Test file to verify the combined validator functionality
import {
  isValidExpression,
  quickValidate,
  validateAnswerEnhanced,
  validateAnswerSync,
} from './answerValidator';

// Test cases for different validation scenarios
const testCases = [
  // Basic math expressions
  {
    student: '2+2',
    correct: '4',
    expected: true,
    description: 'Simple addition',
  },
  {
    student: '4',
    correct: '2+2',
    expected: true,
    description: 'Equivalent expressions',
  },
  {
    student: 'x^2',
    correct: 'x*x',
    expected: true,
    description: 'Exponent notation',
  },

  // Systems of equations
  {
    student: 'x=3,y=4',
    correct: 'x=3,y=4',
    expected: true,
    description: 'System solution exact match',
  },
  {
    student: 'y=4,x=3',
    correct: 'x=3,y=4',
    expected: true,
    description: 'System solution different order',
  },

  // Factorization
  {
    student: '(x+1)(x+2)',
    correct: '(x+2)(x+1)',
    expected: true,
    description: 'Commutative factors',
  },

  // Multiple solutions
  {
    student: '2,3',
    correct: '2,3',
    expected: true,
    description: 'Multiple solutions',
  },
  {
    student: '3,2',
    correct: '2,3',
    expected: true,
    description: 'Multiple solutions different order',
  },
];

// Function to run tests
export const runValidatorTests = async () => {
  console.log('🧪 Testing Combined Answer Validator\n');

  for (const test of testCases) {
    console.log(`Testing: ${test.description}`);
    console.log(`Student: "${test.student}", Correct: "${test.correct}"`);

    try {
      // Test synchronous validation
      const syncResult = validateAnswerSync(
        test.student,
        test.correct,
        '',
        'Math Input',
      );
      console.log(
        `Sync result: ${syncResult} ${
          syncResult === test.expected ? '✅' : '❌'
        }`,
      );

      // Test enhanced validation
      const enhancedResult = await validateAnswerEnhanced(
        test.student,
        test.correct,
        '',
        'Math Input',
      );
      console.log(
        `Enhanced result: ${enhancedResult} ${
          enhancedResult === test.expected ? '✅' : '❌'
        }`,
      );

      // Test quick validation
      const quickResult = quickValidate(test.student, test.correct, '');
      console.log(
        `Quick result: ${quickResult} ${
          quickResult === test.expected ? '✅' : '❌'
        }`,
      );
    } catch (error) {
      console.error(`❌ Error testing "${test.description}":`, error);
    }

    console.log('---');
  }

  // Test expression validation
  console.log('\n🔍 Testing Expression Validation:');
  const expressions = [
    { expr: '2+2', expected: true },
    { expr: 'sin(x)', expected: true },
    { expr: '2+', expected: false },
    { expr: '(2+3', expected: false },
  ];

  for (const test of expressions) {
    const result = isValidExpression(test.expr);
    console.log(
      `"${test.expr}": ${result} ${result === test.expected ? '✅' : '❌'}`,
    );
  }
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.runValidatorTests = runValidatorTests;
}
