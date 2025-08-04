// utils/answerValidator.js
import { validateMathExpression, quickValidateMath } from '@/utils/api';

/**
 * Main validation function - this is what your components should call
 */
export const validateAnswer = (studentAnswer, correctAnswer, questionText = '', questionType = '') => {
  if (!studentAnswer || !correctAnswer) return false;

  console.log('validateAnswer called with:', {
    student: studentAnswer,
    correct: correctAnswer,
    questionText: questionText.substring(0, 50) + '...',
    type: questionType
  });

  // Normalize both answers for comparison
  const normalizeAnswer = (answer) => {
    return answer
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '') // Remove all spaces
      .replace(/[()]/g, '') // Remove parentheses for some comparisons
      .replace(/\*/g, '')   // Remove multiplication symbols
      .replace(/\s*=\s*/g, '=') // Normalize equals signs
      .replace(/\s*,\s*/g, ',') // Normalize commas
      .replace(/\s*;\s*/g, ',') // Convert semicolons to commas
      .replace(/\bor\b/g, ',')  // Convert "or" to commas
      .replace(/\band\b/g, ',') // Convert "and" to commas
  };

  const normalizedStudent = normalizeAnswer(studentAnswer);
  const normalizedCorrect = normalizeAnswer(correctAnswer);

  console.log('Normalized comparison:', {
    student: normalizedStudent,
    correct: normalizedCorrect,
    match: normalizedStudent === normalizedCorrect
  });

  // Direct match after normalization
  if (normalizedStudent === normalizedCorrect) {
    console.log('✅ Direct match found');
    return true;
  }

  // Check for systems of equations (contains x= and y=)
  if (questionText.toLowerCase().includes('solve for x and y') || 
      (normalizedStudent.includes('x=') && normalizedStudent.includes('y='))) {
    console.log('🔍 Checking as system of equations');
    return validateSystemSolution(studentAnswer, correctAnswer);
  }

  // Check for multiple solutions (contains "or" or multiple values)
  if (correctAnswer.includes('or') || correctAnswer.includes(',')) {
    console.log('🔍 Checking as multiple solutions');
    return validateMultipleSolutions(studentAnswer, correctAnswer);
  }

  // For math expressions, try numerical comparison
  if (questionType === 'Math Input') {
    console.log('🔍 Checking numerical values');
    return validateNumericalAnswer(studentAnswer, correctAnswer);
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
 * Validate systems of equations solutions
 */
const validateSystemSolution = (studentAnswer, correctAnswer) => {
  try {
    const studentValues = extractSolutionValues(studentAnswer);
    const correctValues = extractSolutionValues(correctAnswer);

    if (studentValues && correctValues) {
      const match = Math.abs(studentValues.x - correctValues.x) < 0.0001 && 
                   Math.abs(studentValues.y - correctValues.y) < 0.0001;
      console.log('System solution comparison:', { studentValues, correctValues, match });
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

    if (studentNumbers.length === correctNumbers.length && studentNumbers.length > 0) {
      // Sort both arrays and compare
      const sortedStudent = studentNumbers.sort((a, b) => a - b);
      const sortedCorrect = correctNumbers.sort((a, b) => a - b);
      
      const match = sortedStudent.every((num, index) => 
        Math.abs(num - sortedCorrect[index]) < 0.0001
      );

      console.log('Multiple solutions comparison:', { 
        sortedStudent, 
        sortedCorrect, 
        match 
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
  return numbers.map(n => parseFloat(n));
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
      
      const match = sortedStudent.length === sortedCorrect.length &&
                   sortedStudent.every((factor, index) => factor === sortedCorrect[index]);
      
      console.log('Factorization comparison:', { 
        sortedStudent, 
        sortedCorrect, 
        match 
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
    factors.push(...matches.map(f => f.toLowerCase()));
  }
  
  return factors;
};

/**
 * Quick validation for real-time feedback (synchronous)
 */
export const quickValidate = (studentAnswer, correctAnswer, questionText = '') => {
  return validateAnswer(studentAnswer, correctAnswer, questionText, 'Math Input');
};