/**
 * Frontend Math Validation Utils for ELO Learning
 * Validates student math answers for manually typed responses
 * Uses math.js for expression evaluation and comparison
 */

const math = require('mathjs');

class FrontendMathValidator {
  constructor() {
    // Configure math.js for frontend validation
    this.math = math.create(math.all, {
      epsilon: 1e-10,
      matrix: 'Matrix',
      number: 'number',
      precision: 64,
    });
  }

  /**
   * Main validation function for frontend
   * @param {string} studentAnswer - Student's typed answer
   * @param {string} correctAnswer - Expected correct answer
   * @returns {boolean} - true if correct, false if incorrect
   */
  validateAnswer(studentAnswer, correctAnswer) {
    try {
      // Basic input validation
      if (
        !studentAnswer ||
        !correctAnswer ||
        typeof studentAnswer !== 'string' ||
        typeof correctAnswer !== 'string'
      ) {
        return false;
      }

      // Normalize both expressions
      const normalizedStudent = this.normalizeExpression(studentAnswer);
      const normalizedCorrect = this.normalizeExpression(correctAnswer);

      // Try different validation approaches
      return (
        this.checkExactMatch(normalizedStudent, normalizedCorrect) ||
        this.checkNumericalEquality(normalizedStudent, normalizedCorrect) ||
        this.checkAlgebraicEquivalence(normalizedStudent, normalizedCorrect)
      );
    } catch (error) {
      console.warn('Math validation error:', error);
      return false;
    }
  }

  /**
   * Quick validation for real-time feedback (as user types)
   * @param {string} studentAnswer - Student's current input
   * @param {string} correctAnswer - Expected answer
   * @returns {boolean} - true if appears correct
   */
  quickValidate(studentAnswer, correctAnswer) {
    try {
      if (!studentAnswer?.trim()) return false;

      const normalized1 = this.normalizeExpression(studentAnswer);
      const normalized2 = this.normalizeExpression(correctAnswer);

      return (
        this.checkExactMatch(normalized1, normalized2) ||
        this.checkNumericalEquality(normalized1, normalized2)
      );
    } catch {
      return false;
    }
  }

  /**
   * Normalize mathematical expressions for comparison
   * @param {string} expression - Math expression to normalize
   * @returns {string} - Normalized expression
   */
  normalizeExpression(expression) {
    if (typeof expression !== 'string') return expression;

    return expression
      .toLowerCase()
      .replace(/\s+/g, '') // Remove all whitespace
      .replace(/\*{2}/g, '^') // Convert ** to ^
      .replace(/π/g, 'pi') // Convert π to pi
      .replace(/∞/g, 'Infinity') // Convert ∞ to Infinity
      .replace(/×/g, '*') // Convert × to *
      .replace(/÷/g, '/') // Convert ÷ to /
      .replace(/\[/g, '(') // Convert [ to (
      .replace(/\]/g, ')') // Convert ] to )
      .replace(/(\d)\(/g, '$1*(') // Add multiplication for implicit cases like 2(x+3)
      .replace(/\)(\d)/g, ')*$1') // Add multiplication for cases like (x+1)2
      .replace(/\)([a-z])/g, ')*$1'); // Add multiplication for cases like (x+1)y
  }

  /**
   * Check for exact string match after normalization
   * @param {string} student - Normalized student answer
   * @param {string} correct - Normalized correct answer
   * @returns {boolean}
   */
  checkExactMatch(student, correct) {
    return student === correct;
  }

  /**
   * Check numerical equality by evaluating expressions
   * @param {string} student - Student's expression
   * @param {string} correct - Correct expression
   * @returns {boolean}
   */
  checkNumericalEquality(student, correct) {
    try {
      const studentValue = this.math.evaluate(student);
      const correctValue = this.math.evaluate(correct);

      // Handle different number types
      if (
        typeof studentValue === 'number' &&
        typeof correctValue === 'number'
      ) {
        if (!isFinite(studentValue) || !isFinite(correctValue)) {
          return studentValue === correctValue; // Handle Infinity/-Infinity
        }
        return Math.abs(studentValue - correctValue) <= 1e-10;
      }

      // Special case for infinity comparisons
      if (studentValue === Infinity && correct === 'Infinity') return true;
      if (correctValue === Infinity && student === 'Infinity') return true;

      // Use math.js equal function for complex/matrix/other types
      return this.math.equal(studentValue, correctValue);
    } catch {
      return false;
    }
  }

  /**
   * Check algebraic equivalence for expressions with variables
   * @param {string} student - Student's expression
   * @param {string} correct - Correct expression
   * @returns {boolean}
   */
  checkAlgebraicEquivalence(student, correct) {
    try {
      // Simplify both expressions
      const simplified1 = this.math.simplify(student);
      const simplified2 = this.math.simplify(correct);

      // Compare simplified forms
      if (simplified1.toString() === simplified2.toString()) {
        return true;
      }

      // Try expanding expressions (for cases like (x+1)^2 vs x^2+2*x+1)
      try {
        const expanded1 = this.math.simplify(this.math.parse(student), {
          expand: true,
        });
        const expanded2 = this.math.simplify(this.math.parse(correct), {
          expand: true,
        });

        if (expanded1.toString() === expanded2.toString()) {
          return true;
        }
      } catch {
        // Expansion failed, continue with other methods
      }

      // Try checking if difference equals zero
      try {
        const difference = this.math.simplify(`(${student}) - (${correct})`);
        return difference.toString() === '0';
      } catch {
        return false;
      }
    } catch {
      return false;
    }
  }

  /**
   * Validate input format without comparing to correct answer
   * Useful for real-time input validation
   * @param {string} input - User input to validate
   * @returns {boolean} - true if valid math expression
   */
  isValidMathExpression(input) {
    try {
      if (!input || typeof input !== 'string' || !input.trim()) {
        return false;
      }

      // Check for obviously invalid patterns first
      const normalized = this.normalizeExpression(input);

      // Reject multiple consecutive operators
      if (/[+\-*/^]{2,}/.test(normalized.replace(/\*\*/g, '^'))) {
        return false;
      }

      // Reject expressions starting/ending with operators (except minus)
      if (/^[+*/^]|[+\-*/^]$/.test(normalized)) {
        return false;
      }

      // Try to parse the expression
      this.math.parse(normalized);
      return true;
    } catch {
      return false;
    }
  }

  getValidationMessage(input) {
    if (!input?.trim()) {
      return 'Please enter an answer';
    }

    if (!this.isValidMathExpression(input)) {
      return 'Please check your math expression format';
    }

    return '';
  }
}

// Create singleton instance
const mathValidator = new FrontendMathValidator();

const validateMathAnswer = (studentAnswer, correctAnswer) =>
  mathValidator.validateAnswer(studentAnswer, correctAnswer);

const quickValidateMath = (studentAnswer, correctAnswer) =>
  mathValidator.quickValidate(studentAnswer, correctAnswer);

const isValidMathExpression = (input) =>
  mathValidator.isValidMathExpression(input);

const getMathValidationMessage = (input) =>
  mathValidator.getValidationMessage(input);

module.exports = {
  validateMathAnswer,
  quickValidateMath,
  isValidMathExpression,
  getMathValidationMessage,
  FrontendMathValidator,
  default: mathValidator,
};
