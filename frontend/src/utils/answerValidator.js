// utils/answerValidator.js
import { quickValidateMath } from '@/utils/api';
import {
  quickValidateMath as frontendQuickValidate,
  isValidMathExpression,
  validateMathAnswer,
} from '@/utils/frontendMathValidator';

/**
 * Main validation function - this is what your components should call
 * Combines frontend math validation with specialized answer validation
 */
export const validateAnswer = async (
  studentAnswer,
  correctAnswer,
  questionText = '',
  questionType = '',
) => {
  if (!studentAnswer || !correctAnswer) return false;

  console.log('validateAnswer called with:', {
    student: studentAnswer,
    correct: correctAnswer,
    questionText: questionText.substring(0, 50) + '...',
    type: questionType,
  });

  // Special handling for Open Response questions
  if (questionType === 'Open Response') {
    console.log('🔍 Processing Open Response question');
    
    // For Open Response, we need stricter validation logic
    // Try exact match first (case insensitive)
    if (studentAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()) {
      console.log('✅ Open Response: Exact match found');
      return true;
    }

    // Try numerical match for financial questions with strict comparison
    const studentNum = parseFloat(studentAnswer.replace(/[^\d.-]/g, ''));
    const correctNum = parseFloat(correctAnswer.replace(/[^\d.-]/g, ''));
    
    if (!isNaN(studentNum) && !isNaN(correctNum)) {
      const isCorrect = Math.abs(studentNum - correctNum) < 0.001;
      console.log('Open Response numerical comparison:', {
        studentNum,
        correctNum,
        isCorrect,
        difference: Math.abs(studentNum - correctNum)
      });
      return isCorrect;
    }

    // For non-numerical Open Response, try partial matching
    if (isNaN(parseFloat(studentAnswer)) && isNaN(parseFloat(correctAnswer))) {
      const isCorrect = (
        studentAnswer.toLowerCase().includes(correctAnswer.toLowerCase()) ||
        correctAnswer.toLowerCase().includes(studentAnswer.toLowerCase())
      );
      console.log('Open Response partial match:', {
        student: studentAnswer,
        correct: correctAnswer,
        isCorrect
      });
      return isCorrect;
    }

    console.log('❌ Open Response: No match found');
    return false;
  }

  // First, try frontend math validation for Math Input types
  if (
    questionType === 'Math Input' ||
    isMathExpression(studentAnswer) ||
    isMathExpression(correctAnswer)
  ) {
    console.log('🔍 Trying frontend math validation first');
    try {
      // Only use frontend validation if both answers are valid expressions
      if (
        isValidExpression(studentAnswer) &&
        isValidExpression(correctAnswer)
      ) {
        const frontendResult = validateMathAnswer(studentAnswer, correctAnswer);
        if (frontendResult) {
          console.log('✅ Frontend math validation successful');
          return true;
        }
      } else {
        console.log(
          '⚠️ Invalid expression detected, skipping frontend validation',
        );
      }
    } catch (error) {
      console.debug(
        'Frontend math validation failed, falling back to other methods:',
        error,
      );
    }
  }

  // Normalize both answers for comparison
  const normalizeAnswer = (answer) => {
    return answer
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '') // Remove all spaces
      .replace(/[()]/g, '') // Remove parentheses for some comparisons
      .replace(/\*/g, '') // Remove multiplication symbols
      .replace(/\s*=\s*/g, '=') // Normalize equals signs
      .replace(/\s*,\s*/g, ',') // Normalize commas
      .replace(/\s*;\s*/g, ',') // Convert semicolons to commas
      .replace(/\bor\b/g, ',') // Convert "or" to commas
      .replace(/\band\b/g, ','); // Convert "and" to commas
  };

  const normalizedStudent = normalizeAnswer(studentAnswer);
  const normalizedCorrect = normalizeAnswer(correctAnswer);

  console.log('Normalized comparison:', {
    student: normalizedStudent,
    correct: normalizedCorrect,
    match: normalizedStudent === normalizedCorrect,
  });

  // Direct match after normalization
  if (normalizedStudent === normalizedCorrect) {
    console.log('✅ Direct match found');
    return true;
  }

  // For True/False questions, direct comparison should be final
  if (questionType === 'True/False' || questionType === 'True-False') {
    console.log('❌ True/False question - no match found');
    return false;
  }

  // Check for systems of equations (contains x= and y=)
  if (
    questionText.toLowerCase().includes('solve for x and y') ||
    (normalizedStudent.includes('x=') && normalizedStudent.includes('y='))
  ) {
    console.log('🔍 Checking as system of equations');
    return validateSystemSolution(studentAnswer, correctAnswer);
  }

  // Check for multiple solutions (contains "or" or multiple values)
  if (correctAnswer.includes('or') || correctAnswer.includes(',')) {
    console.log('🔍 Checking as multiple solutions');
    return validateMultipleSolutions(studentAnswer, correctAnswer);
  }

  // For math expressions, try numerical comparison with frontend validator first
  if (questionType === 'Math Input') {
    console.log('🔍 Using frontend numerical validation');
    return frontendValidateNumericalAnswer(studentAnswer, correctAnswer);
  }

  // Try backend validation as fallback for complex cases
  try {
    console.log('🔍 Trying backend validation');
    const backendResult = await quickValidateMath(studentAnswer, correctAnswer);
    if (backendResult) {
      console.log('✅ Backend validation successful');
      return true;
    }
  } catch (error) {
    console.debug('Backend validation failed:', error);
  }

  // Try without parentheses for factorization
  if (questionText.toLowerCase().includes('factor')) {
    console.log('🔍 Checking factorization');
    return validateFactorization(studentAnswer, correctAnswer);
  }

  console.log('❌ No match found');
  return false;
};

/**
 * Helper function to detect if a string is likely a math expression
 */
const isMathExpression = (str) => {
  if (!str || typeof str !== 'string') return false;

  // Check for mathematical operators, functions, or patterns
  const mathPatterns = [
    /[+\-*/^()]/, // Basic operators and parentheses
    /\b(sin|cos|tan|log|ln|sqrt|exp|abs)\b/i, // Math functions
    /\d+\.\d+/, // Decimal numbers
    /[a-z]\s*[=]/i, // Variable assignments like x=
    /\b(pi|e|infinity)\b/i, // Math constants
  ];

  return mathPatterns.some((pattern) => pattern.test(str));
};

/**
 * Frontend numerical validation using the math validator
 */
const frontendValidateNumericalAnswer = (studentAnswer, correctAnswer) => {
  try {
    // Validate that both inputs are proper expressions first
    if (
      !isValidExpression(studentAnswer) ||
      !isValidExpression(correctAnswer)
    ) {
      console.log('Invalid expression in numerical validation:', {
        studentAnswer,
        correctAnswer,
      });
      return false;
    }

    // First try the frontend quick validate
    const quickResult = frontendQuickValidate(studentAnswer, correctAnswer);
    if (quickResult) return true;

    // Try exact string match first (normalized)
    const normalizedStudent = studentAnswer.replace(/\s+/g, '');
    const normalizedCorrect = correctAnswer.replace(/\s+/g, '');

    if (normalizedStudent === normalizedCorrect) {
      return true;
    }

    // Try numerical comparison only for simple numbers
    const studentNum = parseFloat(normalizedStudent);
    const correctNum = parseFloat(normalizedCorrect);

    if (!isNaN(studentNum) && !isNaN(correctNum)) {
      const match = Math.abs(studentNum - correctNum) < 0.0001;
      console.log('Numerical comparison:', { studentNum, correctNum, match });
      return match;
    }
  } catch (error) {
    console.debug('Frontend numerical validation failed:', error);
  }
  return false;
};

/**
 * Validate systems of equations solutions
 */
const validateSystemSolution = (studentAnswer, correctAnswer) => {
  try {
    const studentValues = extractSolutionValues(studentAnswer);
    const correctValues = extractSolutionValues(correctAnswer);

    if (studentValues && correctValues) {
      const match =
        Math.abs(studentValues.x - correctValues.x) < 0.0001 &&
        Math.abs(studentValues.y - correctValues.y) < 0.0001;
      console.log('System solution comparison:', {
        studentValues,
        correctValues,
        match,
      });
      return match;
    }
  } catch (error) {
    console.debug('System solution validation failed:', error);
  }
  return false;
};

/**
 * Extract x,y values from various formats
 */
const extractSolutionValues = (answer) => {
  const cleaned = answer.toLowerCase().replace(/\s+/g, '');

  // Pattern 1: "x=7,y=3" or "x=7;y=3"
  let match = cleaned.match(/x=([+-]?\d*\.?\d+)[,;]?.*?y=([+-]?\d*\.?\d+)/);
  if (match) {
    return { x: parseFloat(match[1]), y: parseFloat(match[2]) };
  }

  // Pattern 2: "y=3,x=7" (reversed order)
  match = cleaned.match(/y=([+-]?\d*\.?\d+)[,;]?.*?x=([+-]?\d*\.?\d+)/);
  if (match) {
    return { x: parseFloat(match[2]), y: parseFloat(match[1]) };
  }

  // Pattern 3: "(7,3)" or "(7, 3)"
  match = cleaned.match(/\(([+-]?\d*\.?\d+)[,\s]*([+-]?\d*\.?\d+)\)/);
  if (match) {
    return { x: parseFloat(match[1]), y: parseFloat(match[2]) };
  }

  // Pattern 4: "7,3" (just numbers)
  match = cleaned.match(/^([+-]?\d*\.?\d+)[,\s]*([+-]?\d*\.?\d+)$/);
  if (match) {
    return { x: parseFloat(match[1]), y: parseFloat(match[2]) };
  }

  return null;
};

/**
 * Validate multiple solutions (like quadratic equations)
 */
const validateMultipleSolutions = (studentAnswer, correctAnswer) => {
  try {
    // Extract numbers from both answers
    const studentNumbers = extractNumbers(studentAnswer);
    const correctNumbers = extractNumbers(correctAnswer);

    if (
      studentNumbers.length === correctNumbers.length &&
      studentNumbers.length > 0
    ) {
      // Sort both arrays and compare
      const sortedStudent = studentNumbers.sort((a, b) => a - b);
      const sortedCorrect = correctNumbers.sort((a, b) => a - b);

      const match = sortedStudent.every(
        (num, index) => Math.abs(num - sortedCorrect[index]) < 0.0001,
      );

      console.log('Multiple solutions comparison:', {
        sortedStudent,
        sortedCorrect,
        match,
      });
      return match;
    }
  } catch (error) {
    console.debug('Multiple solutions validation failed:', error);
  }
  return false;
};

/**
 * Extract all numbers from a string
 */
const extractNumbers = (answer) => {
  const numbers = answer.match(/-?\d*\.?\d+/g) || [];
  return numbers.map((n) => parseFloat(n));
};

/**
 * Validate numerical answers
 */
const validateNumericalAnswer = (studentAnswer, correctAnswer) => {
  try {
    // Try exact string match first (normalized)
    const normalizedStudent = studentAnswer.replace(/\s+/g, '');
    const normalizedCorrect = correctAnswer.replace(/\s+/g, '');

    if (normalizedStudent === normalizedCorrect) {
      return true;
    }

    // Try numerical comparison
    const studentNum = parseFloat(normalizedStudent);
    const correctNum = parseFloat(normalizedCorrect);

    if (!isNaN(studentNum) && !isNaN(correctNum)) {
      const match = Math.abs(studentNum - correctNum) < 0.0001;
      console.log('Numerical comparison:', { studentNum, correctNum, match });
      return match;
    }
  } catch (error) {
    console.debug('Numerical validation failed:', error);
  }
  return false;
};

/**
 * Validate factorization (handles commutative property)
 */
const validateFactorization = (studentAnswer, correctAnswer) => {
  try {
    // Remove all spaces and compare
    const normalizedStudent = studentAnswer.replace(/\s+/g, '');
    const normalizedCorrect = correctAnswer.replace(/\s+/g, '');

    if (normalizedStudent.toLowerCase() === normalizedCorrect.toLowerCase()) {
      return true;
    }

    // Extract factors and compare (order doesn't matter)
    const studentFactors = extractFactors(normalizedStudent);
    const correctFactors = extractFactors(normalizedCorrect);

    if (studentFactors.length > 1 && correctFactors.length > 1) {
      const sortedStudent = studentFactors.sort();
      const sortedCorrect = correctFactors.sort();

      const match =
        sortedStudent.length === sortedCorrect.length &&
        sortedStudent.every((factor, index) => factor === sortedCorrect[index]);

      console.log('Factorization comparison:', {
        sortedStudent,
        sortedCorrect,
        match,
      });
      return match;
    }
  } catch (error) {
    console.debug('Factorization validation failed:', error);
  }
  return false;
};

/**
 * Extract factors from expressions like "(x+2)(x+3)"
 */
const extractFactors = (expression) => {
  const factors = [];
  const factorRegex = /\([^)]+\)/g;
  const matches = expression.match(factorRegex);

  if (matches) {
    factors.push(...matches.map((f) => f.toLowerCase()));
  }

  return factors;
};

/**
 * Quick validation for real-time feedback (synchronous)
 * Uses frontend validation only for immediate response
 */
export const quickValidate = (
  studentAnswer,
  correctAnswer,
  questionText = '',
) => {
  if (!studentAnswer || !correctAnswer) return false;

  // Don't validate incomplete expressions
  if (!studentAnswer.trim() || studentAnswer.trim().length < 1) return false;

  // Use frontend math validator for quick validation only if both are valid
  try {
    // Check if both expressions are valid first
    const studentValid = isValidExpression(studentAnswer);
    const correctValid = isValidExpression(correctAnswer);

    console.log('🔍 quickValidate expression validity:', {
      student: studentAnswer,
      studentValid,
      correct: correctAnswer,
      correctValid,
    });

    // If student answer is invalid, reject immediately
    if (!studentValid) {
      console.log('❌ Student answer is invalid expression, rejecting');
      return false;
    }

    // Only proceed if both are valid expressions
    if (studentValid && correctValid) {
      const frontendResult = frontendQuickValidate(
        studentAnswer,
        correctAnswer,
      );
      if (frontendResult) return true;
    }

    // Fall back to basic answer validation patterns ONLY for valid expressions
    const normalizeAnswer = (answer) => {
      return answer
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '')
        .replace(/[()]/g, '')
        .replace(/\*/g, '')
        .replace(/\s*=\s*/g, '=')
        .replace(/\s*,\s*/g, ',')
        .replace(/\s*;\s*/g, ',')
        .replace(/\bor\b/g, ',')
        .replace(/\band\b/g, ',');
    };

    const normalizedStudent = normalizeAnswer(studentAnswer);
    const normalizedCorrect = normalizeAnswer(correctAnswer);

    // Direct match after normalization
    if (normalizedStudent === normalizedCorrect) {
      return true;
    }

    // Quick numerical comparison only for valid expressions
    if (isMathExpression(studentAnswer) || isMathExpression(correctAnswer)) {
      return frontendValidateNumericalAnswer(studentAnswer, correctAnswer);
    }

    // Check for systems of equations (contains x= and y=)
    if (
      questionText.toLowerCase().includes('solve for x and y') ||
      (normalizedStudent.includes('x=') && normalizedStudent.includes('y='))
    ) {
      return validateSystemSolution(studentAnswer, correctAnswer);
    }

    // Check for multiple solutions (contains "or" or multiple values)
    if (correctAnswer.includes('or') || correctAnswer.includes(',')) {
      return validateMultipleSolutions(studentAnswer, correctAnswer);
    }

    return false;
  } catch (error) {
    console.debug('Quick validation failed:', error);
    return false;
  }
};

/**
 * Enhanced validation function with both frontend and backend validation
 * Use this for comprehensive validation that includes backend fallback
 */
export const validateAnswerEnhanced = async (
  studentAnswer,
  correctAnswer,
  questionText = '',
  questionType = '',
) => {
  return await validateAnswer(
    studentAnswer,
    correctAnswer,
    questionText,
    questionType,
  );
};

/**
 * Synchronous validation using only frontend math validator
 * Use this for real-time validation without backend dependency
 */
export const validateAnswerSync = (
  studentAnswer,
  correctAnswer,
  questionText = '',
  questionType = '',
) => {
  if (!studentAnswer || !correctAnswer) return false;

  try {
    // Special handling for Open Response questions
    if (questionType === 'Open Response') {
      console.log('🔍 Sync validation for Open Response question');
      
      // Try exact match first (case insensitive)
      if (studentAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()) {
        console.log('✅ Open Response sync: Exact match found');
        return true;
      }

      // Try numerical match for financial questions with strict comparison
      const studentNum = parseFloat(studentAnswer.replace(/[^\d.-]/g, ''));
      const correctNum = parseFloat(correctAnswer.replace(/[^\d.-]/g, ''));
      
      if (!isNaN(studentNum) && !isNaN(correctNum)) {
        const isCorrect = Math.abs(studentNum - correctNum) < 0.001;
        console.log('Open Response sync numerical comparison:', {
          studentNum,
          correctNum,
          isCorrect,
          difference: Math.abs(studentNum - correctNum)
        });
        return isCorrect;
      }

      // For non-numerical Open Response, try partial matching
      if (isNaN(parseFloat(studentAnswer)) && isNaN(parseFloat(correctAnswer))) {
        const isCorrect = (
          studentAnswer.toLowerCase().includes(correctAnswer.toLowerCase()) ||
          correctAnswer.toLowerCase().includes(studentAnswer.toLowerCase())
        );
        console.log('Open Response sync partial match:', {
          student: studentAnswer,
          correct: correctAnswer,
          isCorrect
        });
        return isCorrect;
      }

      console.log('❌ Open Response sync: No match found');
      return false;
    }

    // Use frontend math validation for Math Input types - but only if both are valid
    if (
      questionType === 'Math Input' ||
      isMathExpression(studentAnswer) ||
      isMathExpression(correctAnswer)
    ) {
      // Only validate if both expressions are actually valid
      if (
        isValidExpression(studentAnswer) &&
        isValidExpression(correctAnswer)
      ) {
        return validateMathAnswer(studentAnswer, correctAnswer);
      }
      return false; // Invalid expressions should not be considered correct
    }

    // Fall back to pattern-based validation
    return quickValidate(studentAnswer, correctAnswer, questionText);
  } catch (error) {
    console.debug('Sync validation failed:', error);
    return false;
  }
};

/**
 * Check if expression is valid AND complete enough for comparison
 * This prevents single variables from being accepted as complete answers
 */
export const isValidExpression = (expression) => {
  try {
    if (!expression || typeof expression !== 'string' || !expression.trim()) {
      return false;
    }

    const cleaned = expression.trim();

    // Reject single characters that are clearly incomplete or invalid
    if (cleaned.length === 1) {
      // Only allow single digits or complete variable assignments
      if (!/^[a-zA-Z0-9]$/.test(cleaned)) {
        console.debug('Rejecting invalid single character:', cleaned);
        return false;
      }
    }

    // Reject expressions that are just operators or punctuation
    if (/^[+\-*/^()=,\s\[\]{}]+$/.test(cleaned)) {
      console.debug('Rejecting expression with only operators/punctuation:', cleaned);
      return false;
    }

    // Reject incomplete parentheses expressions
    if (cleaned === '(' || cleaned === ')' || cleaned === '()') {
      console.debug('Rejecting incomplete parentheses:', cleaned);
      return false;
    }

    // First check if it's a valid math expression using the frontend validator
    if (!isValidMathExpression(cleaned)) {
      console.debug('Failed math expression validation:', cleaned);
      return false;
    }

    // Additional checks for completeness
    // Reject single variables unless they are assignments or specific contexts
    if (/^[a-zA-Z]$/.test(cleaned)) {
      console.debug('Rejecting single variable:', cleaned);
      return false;
    }

    // Reject expressions that are just a variable with operators but no operands
    if (/^[a-zA-Z][+\-*/^=,\s]*$/.test(cleaned)) {
      console.debug('Rejecting incomplete expression:', cleaned);
      return false;
    }

    // Reject expressions ending with operators (except for special cases)
    if (/[+\-*/^=,]\s*$/.test(cleaned) && !/[=]\s*$/.test(cleaned)) {
      console.debug('Rejecting expression ending with operator:', cleaned);
      return false;
    }

    // For system of equations, require both variables to have values
    if (cleaned.includes('=') && cleaned.includes(',')) {
      // This is likely a system solution like "x=7, y=3"
      const parts = cleaned.split(',');
      for (const part of parts) {
        const trimmedPart = part.trim();
        if (/^[a-zA-Z]\s*=\s*$/.test(trimmedPart)) {
          console.debug('Rejecting incomplete equation:', trimmedPart);
          return false;
        }
      }
    }

    return true;
  } catch (error) {
    console.debug('Expression validation failed:', error);
    return false;
  }
};
  
// Fast validation for single-player mode (prioritizes frontend validation) 
