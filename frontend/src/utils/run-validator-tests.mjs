// Node.js test runner for the validator
// Run with: node frontend/src/utils/run-validator-tests.mjs

import { dirname } from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mock browser environment
global.window = {};
global.console = console;

// Simple mock for frontend math validator
const mockFrontendValidator = {
  validateMathAnswer: (student, correct) => {
    // Basic numerical comparison
    try {
      const studentNum = parseFloat(student);
      const correctNum = parseFloat(correct);
      if (!isNaN(studentNum) && !isNaN(correctNum)) {
        return Math.abs(studentNum - correctNum) < 0.0001;
      }
      return student.replace(/\s+/g, '') === correct.replace(/\s+/g, '');
    } catch {
      return false;
    }
  },
  quickValidateMath: (student, correct) => mockFrontendValidator.validateMathAnswer(student, correct),
  isValidMathExpression: (expr) => {
    if (!expr) return false;
    // Basic validation - check for valid characters and balanced parentheses
    const validChars = /^[a-zA-Z0-9+\-*/^().,\s=]+$/;
    if (!validChars.test(expr)) return false;
    
    let openParens = 0;
    for (const char of expr) {
      if (char === '(') openParens++;
      if (char === ')') openParens--;
      if (openParens < 0) return false;
    }
    return openParens === 0;
  }
};

// Mock API functions
const mockAPI = {
  validateMathExpression: async (expr) => mockFrontendValidator.isValidMathExpression(expr),
  quickValidateMath: async (student, correct) => mockFrontendValidator.validateMathAnswer(student, correct)
};

// Create a simple test runner
async function runValidatorTestsNode() {
  console.log('🧪 Testing Combined Answer Validator (Node.js)\n');

  const testCases = [
    { student: '2+2', correct: '4', expected: true, description: 'Simple addition' },
    { student: '4', correct: '2+2', expected: true, description: 'Equivalent expressions' },
    { student: 'x=3,y=4', correct: 'x=3,y=4', expected: true, description: 'System solution exact match' },
    { student: '2,3', correct: '2,3', expected: true, description: 'Multiple solutions' },
  ];

  for (const test of testCases) {
    console.log(`Testing: ${test.description}`);
    console.log(`Student: "${test.student}", Correct: "${test.correct}"`);
    
    try {
      // Test basic validation
      const result = mockFrontendValidator.validateMathAnswer(test.student, test.correct);
      console.log(`Result: ${result} ${result === test.expected ? '✅' : '❌'}`);
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
    const result = mockFrontendValidator.isValidMathExpression(test.expr);
    console.log(`"${test.expr}": ${result} ${result === test.expected ? '✅' : '❌'}`);
  }
}

// Run the tests
runValidatorTestsNode().catch(console.error);
