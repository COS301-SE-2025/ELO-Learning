/**
 * Enhanced Frontend Math Validation Utils for ELO Learning
 * Validates student math answers for manually typed responses
 * Supports advanced mathematical functions and symbols
 * Uses math.js for expression evaluation and comparison
 */

const math = require('mathjs');

class FrontendMathValidator {
  constructor() {
    // Configure math.js for frontend validation with advanced features
    this.math = math.create(math.all, {
      epsilon: 1e-10,
      matrix: 'Matrix',
      number: 'number',
      precision: 64,
    });

    // Add custom functions and constants
    this.math.import({
      // Mathematical constants
      phi: 1.618033988749895, // Golden ratio
      
      // Custom functions for educational math
      derivative: (expr, variable) => {
        try {
          return this.math.derivative(expr, variable);
        } catch {
          throw new Error('Invalid derivative syntax');
        }
      },
      
      integral: (expr, variable, from, to) => {
        try {
          if (from !== undefined && to !== undefined) {
            return this.math.evaluate(`integrate(${expr}, ${variable}, ${from}, ${to})`);
          }
          return this.math.parse(`integral(${expr}, ${variable})`);
        } catch {
          throw new Error('Invalid integral syntax');
        }
      },
      
      limit: (expr, variable, value) => {
        try {
          return this.math.parse(`limit(${expr}, ${variable}, ${value})`);
        } catch {
          throw new Error('Invalid limit syntax');
        }
      },
      
      factorial: (n) => this.math.factorial(n),
      combination: (n, k) => this.math.combinations(n, k),
      permutation: (n, k) => this.math.permutations(n, k)
    });

    // Define supported functions for validation
    this.supportedFunctions = [
      'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
      'log', 'ln', 'log10', 'log2',
      'sqrt', 'cbrt', 'abs', 'floor', 'ceil', 'round',
      'exp', 'factorial', 'gamma',
      'derivative', 'integral', 'limit',
      'sum', 'prod', 'max', 'min',
      'combination', 'permutation'
    ];
  }

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

      // Try different validation approaches in order of complexity
      return (
        this.checkExactMatch(normalizedStudent, normalizedCorrect) ||
        this.checkNumericalEquality(normalizedStudent, normalizedCorrect) ||
        this.checkAlgebraicEquivalence(normalizedStudent, normalizedCorrect) ||
        this.checkAdvancedEquivalence(normalizedStudent, normalizedCorrect)
      );
    } catch (error) {
      console.warn('Enhanced math validation error:', error);
      return false;
    }
  }

  quickValidate(studentAnswer, correctAnswer) {
    try {
      if (!studentAnswer?.trim()) return false;

      const normalized1 = this.normalizeExpression(studentAnswer);
      const normalized2 = this.normalizeExpression(correctAnswer);

      return (
        this.checkExactMatch(normalized1, normalized2) ||
        this.checkNumericalEquality(normalized1, normalized2) ||
        this.checkSimpleAlgebraicEquivalence(normalized1, normalized2)
      );
    } catch {
      return false;
    }
  }

  normalizeExpression(expression) {
    if (typeof expression !== 'string') return expression;

    return expression
      .toLowerCase()
      .replace(/\s+/g, '') // Remove all whitespace
      
      // Basic operator conversions
      .replace(/\*{2}/g, '^') // Convert ** to ^
      .replace(/×/g, '*') // Convert × to *
      .replace(/÷/g, '/') // Convert ÷ to /
      .replace(/\[/g, '(') // Convert [ to (
      .replace(/\]/g, ')') // Convert ] to )
      
      // Advanced symbol conversions
      .replace(/π/g, 'pi') // Convert π to pi
      .replace(/∞/g, 'Infinity') // Convert ∞ to Infinity
      .replace(/φ/g, 'phi') // Convert φ to phi (golden ratio)
      .replace(/°/g, ' deg') // Convert degrees symbol
      
      // Trigonometric function conversions
      .replace(/sin⁻¹/g, 'asin') // Convert sin⁻¹ to asin
      .replace(/cos⁻¹/g, 'acos') // Convert cos⁻¹ to acos
      .replace(/tan⁻¹/g, 'atan') // Convert tan⁻¹ to atan
      .replace(/sinh/g, 'sinh') // Hyperbolic sine
      .replace(/cosh/g, 'cosh') // Hyperbolic cosine
      .replace(/tanh/g, 'tanh') // Hyperbolic tangent
      
      // Root conversions
      .replace(/√/g, 'sqrt') // Convert √ to sqrt
      .replace(/∛/g, 'cbrt') // Convert ∛ to cbrt
      
      // Calculus symbols
      .replace(/∫/g, 'integral') // Convert ∫ to integral
      .replace(/∂/g, 'derivative') // Convert ∂ to derivative
      .replace(/∑/g, 'sum') // Convert ∑ to sum
      .replace(/∏/g, 'prod') // Convert ∏ to prod
      .replace(/∆/g, 'delta') // Convert ∆ to delta
      
      // Set theory symbols
      .replace(/∈/g, ' in ') // Convert ∈ to in
      .replace(/∉/g, ' not in ') // Convert ∉ to not in
      .replace(/∅/g, 'emptyset') // Convert ∅ to emptyset
      .replace(/∪/g, ' union ') // Convert ∪ to union
      .replace(/∩/g, ' intersect ') // Convert ∩ to intersect
      
      // Logic symbols
      .replace(/∀/g, 'forall') // Convert ∀ to forall
      .replace(/∃/g, 'exists') // Convert ∃ to exists
      .replace(/¬/g, 'not ') // Convert ¬ to not
      .replace(/∧/g, ' and ') // Convert ∧ to and
      .replace(/∨/g, ' or ') // Convert ∨ to or
      
      // Comparison operators
      .replace(/≤/g, '<=') // Convert ≤ to <=
      .replace(/≥/g, '>=') // Convert ≥ to >=
      .replace(/≠/g, '!=') // Convert ≠ to !=
      .replace(/≈/g, '~=') // Convert ≈ to ~=
      
      // Factorial and combinatorics
      .replace(/!/g, '!') // Keep factorial as is
      .replace(/\bC\(/g, 'combination(') // Convert nCr notation
      .replace(/\bP\(/g, 'permutation(') // Convert nPr notation
      
      // Implicit multiplication
      .replace(/(\d)\(/g, '$1*(') // Add multiplication for cases like 2(x+3)
      .replace(/\)(\d)/g, ')*$1') // Add multiplication for cases like (x+1)2
      .replace(/\)([a-z])/g, ')*$1') // Add multiplication for cases like (x+1)y
      .replace(/([a-z])(\d)/g, '$1*$2') // Add multiplication for cases like x2
      .replace(/(\d)([a-z])/g, '$1*$2') // Add multiplication for cases like 2x
      
      // Function notation cleanup
      .replace(/([a-z]+)\s*\(/g, '$1(') // Remove spaces before function parentheses
      
      // Clean up multiple operators
      .replace(/\+\+/g, '+')
      .replace(/--/g, '+')
      .replace(/\+-/g, '-')
      .replace(/-\+/g, '-');
  }

  isValidMathExpression(input) {
    try {
      if (!input || typeof input !== 'string' || !input.trim()) {
        return false;
      }

      const normalized = this.normalizeExpression(input);

      // Check for empty or whitespace-only input
      if (!normalized.trim()) return false;

      // Check for obviously invalid patterns
      if (/[+\-*/^]{2,}/.test(normalized.replace(/\*\*/g, '^'))) {
        return false;
      }

      // Check for expressions starting/ending with operators (except minus for negative numbers)
      if (/^[+*/^]|[+\-*/^]$/.test(normalized)) {
        return false;
      }

      // Check for unmatched parentheses
      if (!this.hasMatchedParentheses(normalized)) {
        return false;
      }

      // Check for function calls without parentheses
      if (this.hasFunctionSyntaxErrors(normalized)) {
        return false;
      }

      // Check for invalid consecutive operators
      if (/[+\-*/^]{2,}/.test(normalized)) {
        return false;
      }

      // Check for division by zero patterns
      if (/\/\s*0(?!\d)/.test(normalized)) {
        return false;
      }

      // Try to parse the expression
      this.math.parse(normalized);
      return true;
    } catch (error) {
      console.debug('Expression validation failed:', error.message);
      return false;
    }
  }

  hasMatchedParentheses(expression) {
    let openParens = 0;
    let openBrackets = 0;
    let openBraces = 0;

    for (let char of expression) {
      switch (char) {
        case '(':
          openParens++;
          break;
        case ')':
          openParens--;
          if (openParens < 0) return false;
          break;
        case '[':
          openBrackets++;
          break;
        case ']':
          openBrackets--;
          if (openBrackets < 0) return false;
          break;
        case '{':
          openBraces++;
          break;
        case '}':
          openBraces--;
          if (openBraces < 0) return false;
          break;
      }
    }

    return openParens === 0 && openBrackets === 0 && openBraces === 0;
  }

  hasFunctionSyntaxErrors(expression) {
    // Check for function calls without parentheses
    const functionPattern = new RegExp(
      `(${this.supportedFunctions.join('|')})\\s*[^(]`,
      'i'
    );
    
    return functionPattern.test(expression);
  }

  getValidationMessage(input) {
    if (!input?.trim()) {
      return 'Please enter an answer';
    }

    const normalized = this.normalizeExpression(input);

    // Check for unmatched parentheses with specific messages
    let openParens = 0;
    let openBrackets = 0;
    let openBraces = 0;

    for (let char of normalized) {
      switch (char) {
        case '(':
          openParens++;
          break;
        case ')':
          openParens--;
          if (openParens < 0) return 'Unmatched closing parenthesis )';
          break;
        case '[':
          openBrackets++;
          break;
        case ']':
          openBrackets--;
          if (openBrackets < 0) return 'Unmatched closing bracket ]';
          break;
        case '{':
          openBraces++;
          break;
        case '}':
          openBraces--;
          if (openBraces < 0) return 'Unmatched closing brace }';
          break;
      }
    }

    if (openParens > 0) return 'Missing closing parenthesis )';
    if (openBrackets > 0) return 'Missing closing bracket ]';
    if (openBraces > 0) return 'Missing closing brace }';

    // Check for function syntax errors
    const functionPattern = new RegExp(
      `(${this.supportedFunctions.join('|')})\\s*[^(]`,
      'i'
    );
    
    if (functionPattern.test(normalized)) {
      return 'Functions need parentheses (e.g., sin(x), log(n))';
    }

    // Check for consecutive operators
    if (/[+\-*/^]{2,}/.test(normalized)) {
      return 'Consecutive operators are not allowed';
    }

    // Check for expressions starting/ending with operators
    if (/^[+*/^]/.test(normalized)) {
      return 'Expression cannot start with an operator';
    }
    
    if (/[+\-*/^]$/.test(normalized)) {
      return 'Expression cannot end with an operator';
    }

    // Check for division by zero
    if (/\/\s*0(?!\d)/.test(normalized)) {
      return 'Division by zero is not allowed';
    }

    if (!this.isValidMathExpression(input)) {
      return 'Please check your mathematical expression';
    }

    return '';
  }

  checkExactMatch(student, correct) {
    return student === correct;
  }

  checkNumericalEquality(student, correct) {
    try {
      const studentValue = this.math.evaluate(student);
      const correctValue = this.math.evaluate(correct);

      // Handle different number types
      if (typeof studentValue === 'number' && typeof correctValue === 'number') {
        if (!isFinite(studentValue) || !isFinite(correctValue)) {
          return studentValue === correctValue; // Handle Infinity/-Infinity
        }
        return Math.abs(studentValue - correctValue) <= 1e-10;
      }

      // Handle complex numbers
      if (this.math.typeOf(studentValue) === 'Complex' || this.math.typeOf(correctValue) === 'Complex') {
        try {
          return this.math.equal(studentValue, correctValue);
        } catch {
          return false;
        }
      }

      // Special cases for infinity and constants
      if (studentValue === Infinity && correct === 'Infinity') return true;
      if (correctValue === Infinity && student === 'Infinity') return true;

      // Use math.js equal function for other types
      return this.math.equal(studentValue, correctValue);
    } catch (error) {
      console.debug('Numerical equality check failed:', error.message);
      return false;
    }
  }

  checkAlgebraicEquivalence(student, correct) {
    try {
      // Try multiple approaches for algebraic equivalence
      
      // 1. Simplify both expressions
      const simplified1 = this.math.simplify(student);
      const simplified2 = this.math.simplify(correct);

      if (simplified1.toString() === simplified2.toString()) {
        return true;
      }

      // 2. Try expanding expressions
      try {
        const expanded1 = this.math.simplify(this.math.parse(student), { expand: true });
        const expanded2 = this.math.simplify(this.math.parse(correct), { expand: true });

        if (expanded1.toString() === expanded2.toString()) {
          return true;
        }
      } catch {
        // Expansion failed, continue
      }

      // 3. Try factoring if possible
      try {
        const factored1 = this.math.simplify(student, { factor: true });
        const factored2 = this.math.simplify(correct, { factor: true });

        if (factored1.toString() === factored2.toString()) {
          return true;
        }
      } catch {
        // Factoring failed, continue
      }

      // 4. Check if difference equals zero
      try {
        const difference = this.math.simplify(`(${student}) - (${correct})`);
        return difference.toString() === '0';
      } catch {
        return false;
      }
    } catch (error) {
      console.debug('Algebraic equivalence check failed:', error.message);
      return false;
    }
  }

  checkSimpleAlgebraicEquivalence(student, correct) {
    try {
      const simplified1 = this.math.simplify(student);
      const simplified2 = this.math.simplify(correct);
      return simplified1.toString() === simplified2.toString();
    } catch {
      return false;
    }
  }

  checkAdvancedEquivalence(student, correct) {
    try {
      // Handle trigonometric identities
      if (this.checkTrigonometricEquivalence(student, correct)) {
        return true;
      }

      // Handle logarithmic properties
      if (this.checkLogarithmicEquivalence(student, correct)) {
        return true;
      }

      // Handle exponential properties
      if (this.checkExponentialEquivalence(student, correct)) {
        return true;
      }

      return false;
    } catch (error) {
      console.debug('Advanced equivalence check failed:', error.message);
      return false;
    }
  }

  checkTrigonometricEquivalence(student, correct) {
    try {
      // Test with common angle values
      const testValues = [0, Math.PI/6, Math.PI/4, Math.PI/3, Math.PI/2, Math.PI];
      
      for (const value of testValues) {
        try {
          const scope = { x: value, theta: value };
          const studentResult = this.math.evaluate(student, scope);
          const correctResult = this.math.evaluate(correct, scope);
          
          if (Math.abs(studentResult - correctResult) > 1e-10) {
            return false;
          }
        } catch {
          continue;
        }
      }
      
      return true;
    } catch {
      return false;
    }
  }

  checkLogarithmicEquivalence(student, correct) {
    try {
      // Test with common values for logarithmic expressions
      const testValues = [1, 2, Math.E, 10, 100];
      
      for (const value of testValues) {
        try {
          const scope = { x: value, y: value };
          const studentResult = this.math.evaluate(student, scope);
          const correctResult = this.math.evaluate(correct, scope);
          
          if (Math.abs(studentResult - correctResult) > 1e-10) {
            return false;
          }
        } catch {
          continue;
        }
      }
      
      return true;
    } catch {
      return false;
    }
  }

  checkExponentialEquivalence(student, correct) {
    try {
      // Test with common values for exponential expressions
      const testValues = [0, 1, 2, 3, -1, -2];
      
      for (const value of testValues) {
        try {
          const scope = { x: value, y: value };
          const studentResult = this.math.evaluate(student, scope);
          const correctResult = this.math.evaluate(correct, scope);
          
          if (Math.abs(studentResult - correctResult) > 1e-10) {
            return false;
          }
        } catch {
          continue;
        }
      }
      
      return true;
    } catch {
      return false;
    }
  }
}

// Create singleton instance
const MathValidator = new FrontendMathValidator();

// Export functions for compatibility
const validateMathAnswer = (studentAnswer, correctAnswer) =>
  MathValidator.validateAnswer(studentAnswer, correctAnswer);

const quickValidateMath = (studentAnswer, correctAnswer) =>
  MathValidator.quickValidate(studentAnswer, correctAnswer);

const isValidMathExpression = (input) =>
  MathValidator.isValidMathExpression(input);

const getMathValidationMessage = (input) =>
  MathValidator.getValidationMessage(input);

module.exports = {
  validateMathAnswer,
  quickValidateMath,
  isValidMathExpression,
  getMathValidationMessage,
  FrontendMathValidator,
  default: MathValidator,
};