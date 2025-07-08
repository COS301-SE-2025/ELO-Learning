/**
 * Frontend Math Validation Utils for ELO Learning
 * Validates student math answers for manually typed responses
 * Supports advanced mathematical functions and symbols
 * Uses math.js for expression evaluation and comparison
 */

import * as math from 'mathjs';

// Type definitions - Fixed ESLint issues
interface MathJSCustomFunctions {
  phi: number;
  derivative: (expr: string, variable: string) => math.MathNode;
  integral: (expr: string, variable: string, from?: number, to?: number) => math.MathNode;
  limit: (expr: string, variable: string, value: number) => math.MathNode;
  factorial: (n: number) => number;
  combination: (n: number, k: number) => number;
  permutation: (n: number, k: number) => number;
}

interface MathJSInstance extends math.MathJsInstance {
  _phi?: boolean;
}

// Removed unused interfaces to fix ESLint warnings
// interface ValidationResult {
//   isValid: boolean;
//   message?: string;
// }

// interface ComparisonResult {
//   isCorrect: boolean;
//   confidence?: number;
// }

// Singleton instance to prevent multiple MathJS initializations
let mathValidatorInstance: FrontendMathValidator | null = null;

class FrontendMathValidator {
  private math: MathJSInstance;
  private supportedFunctions: string[];

  constructor() {
    // Configure math.js for frontend validation with advanced features
    this.math = math.create(math.all, {
      epsilon: 1e-10,
      matrix: 'Matrix',
      number: 'number',
      precision: 64,
    }) as MathJSInstance;

    // Only import custom functions and constants if they haven't been imported yet
    // This prevents the "Cannot import 'phi': already exists" error
    if (!this.math._phi) {
      try {
        const customFunctions: Partial<MathJSCustomFunctions> = {
          // Mathematical constants
          phi: 1.618033988749895, // Golden ratio

          // Custom functions for educational math
          derivative: (expr: string, variable: string): math.MathNode => {
            try {
              return this.math.derivative(expr, variable);
            } catch {
              throw new Error('Invalid derivative syntax');
            }
          },

          integral: (
            expr: string,
            variable: string,
            from?: number,
            to?: number,
          ): math.MathNode => {
            try {
              if (from !== undefined && to !== undefined) {
                return this.math.evaluate(
                  `integrate(${expr}, ${variable}, ${from}, ${to})`,
                ) as math.MathNode;
              }
              return this.math.parse(`integral(${expr}, ${variable})`);
            } catch {
              throw new Error('Invalid integral syntax');
            }
          },

          limit: (expr: string, variable: string, value: number): math.MathNode => {
            try {
              return this.math.parse(`limit(${expr}, ${variable}, ${value})`);
            } catch {
              throw new Error('Invalid limit syntax');
            }
          },

          factorial: (n: number): number => this.math.factorial(n),
          combination: (n: number, k: number): number =>
            this.math.combinations(n, k),
          permutation: (n: number, k: number): number =>
            this.math.permutations(n, k),
        };

        this.math.import(customFunctions);
        this.math._phi = true; // Mark as imported
      } catch (error) {
        // If import fails (e.g., constants already exist), continue without custom imports
        console.warn(
          'MathJS custom imports skipped (may already be initialized):',
          (error as Error).message,
        );
      }
    }

    // Define supported functions for validation
    this.supportedFunctions = [
      'sin',
      'cos',
      'tan',
      'asin',
      'acos',
      'atan',
      'log',
      'ln',
      'log10',
      'log2',
      'sqrt',
      'cbrt',
      'abs',
      'floor',
      'ceil',
      'round',
      'exp',
      'factorial',
      'gamma',
      'derivative',
      'integral',
      'limit',
      'sum',
      'prod',
      'max',
      'min',
      'combination',
      'permutation',
    ];
  }

  // FIXED: Optimized method order and removed redundant calls
  validateAnswer(studentAnswer: string, correctAnswer: string): boolean {
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
      const normalizedStudent: string = this.normalizeExpression(studentAnswer);
      const normalizedCorrect: string = this.normalizeExpression(correctAnswer);

      // Try different validation approaches in order of efficiency and accuracy
      return (
        this.checkExactMatch(normalizedStudent, normalizedCorrect) ||
        this.checkNumericalEquality(normalizedStudent, normalizedCorrect) ||
        this.checkCommutativityEquivalence(normalizedStudent, normalizedCorrect) || // MOVED EARLIER!
        this.checkAlgebraicEquivalence(normalizedStudent, normalizedCorrect) ||
        this.checkAdvancedEquivalence(normalizedStudent, normalizedCorrect)
        // REMOVED: redundant calls to checkPolynomialEquivalence and compareFactoredExpressions
        // since they're already called within checkCommutativityEquivalence
      );
    } catch (error) {
      console.warn('Enhanced math validation error:', error);
      return false;
    }
  }

  quickValidate(studentAnswer: string, correctAnswer: string): boolean {
    try {
      if (!studentAnswer?.trim()) return false;

      const normalized1: string = this.normalizeExpression(studentAnswer);
      const normalized2: string = this.normalizeExpression(correctAnswer);

      return (
        this.checkExactMatch(normalized1, normalized2) ||
        this.checkNumericalEquality(normalized1, normalized2) ||
        this.checkSimpleAlgebraicEquivalence(normalized1, normalized2)
      );
    } catch {
      return false;
    }
  }

  normalizeExpression(expression: string): string {
    if (typeof expression !== 'string') return expression;

    return (
      expression
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
        .replace(/-\+/g, '-')
    );
  }

  isValidMathExpression(input: string): boolean {
    try {
      if (!input || typeof input !== 'string' || !input.trim()) {
        return false;
      }

      const normalized: string = this.normalizeExpression(input);

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
      console.debug('Expression validation failed:', (error as Error).message);
      return false;
    }
  }

  hasMatchedParentheses(expression: string): boolean {
    let openParens = 0;
    let openBrackets = 0;
    let openBraces = 0;

    for (const char of expression) {
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

  hasFunctionSyntaxErrors(expression: string): boolean {
    // Check for function calls without parentheses
    const functionPattern = new RegExp(
      `(${this.supportedFunctions.join('|')})\\s*[^(]`,
      'i',
    );

    return functionPattern.test(expression);
  }

  getValidationMessage(input: string): string {
    if (typeof input !== 'string') {
      return 'Invalid input';
    }
    if (!input.trim()) {
      return 'Please enter an answer';
    }

    const normalized: string = this.normalizeExpression(input);

    // Check for unmatched parentheses with specific messages
    let openParens = 0;
    let openBrackets = 0;
    let openBraces = 0;

    for (const char of normalized) {
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
      'i',
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

  // Test method to verify the commutativity fix works
  testCommutativityFix(): boolean {
    const testCases = [
      { student: "(x+3)(x-3)", correct: "(x-3)(x+3)", description: "Basic commutative factors" },
      { student: "(x-3)(x+3)", correct: "(x+3)(x-3)", description: "Reverse commutative factors" },
      { student: "(a+b)(c+d)", correct: "(c+d)(a+b)", description: "Multi-variable commutative" },
      { student: "2(x+1)", correct: "(x+1)*2", description: "Coefficient commutativity" },
      { student: "x*y*z", correct: "z*y*x", description: "Variable multiplication order" },
      { student: "(x+3)*(x-3)", correct: "(x-3)*(x+3)", description: "Explicit multiplication" }
    ];
    
    console.log("🧮 Testing Math Validator Commutativity Fix...");
    
    for (const testCase of testCases) {
      const result = this.validateAnswer(testCase.student, testCase.correct);
      console.log(`${result ? '✅' : '❌'} ${testCase.description}: ${testCase.student} = ${testCase.correct}`);
      
      if (!result) {
        console.error(`❌ Test failed: ${testCase.student} should equal ${testCase.correct}`);
        return false;
      }
    }
    
    console.log("🎉 All commutativity tests passed!");
    return true;
  }

  private checkExactMatch(student: string, correct: string): boolean {
    return student === correct;
  }

  private checkNumericalEquality(student: string, correct: string): boolean {
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

      // Handle complex numbers
      if (
        this.math.typeOf(studentValue) === 'Complex' ||
        this.math.typeOf(correctValue) === 'Complex'
      ) {
        try {
          const equalResult = this.math.equal(studentValue, correctValue);
          return typeof equalResult === 'boolean' ? equalResult : false;
        } catch {
          return false;
        }
      }

      // Special cases for infinity and constants
      if (studentValue === Infinity && correct === 'Infinity') return true;
      if (correctValue === Infinity && student === 'Infinity') return true;

      // Use math.js equal function for other types
      try {
        const equalResult = this.math.equal(studentValue, correctValue);
        return typeof equalResult === 'boolean' ? equalResult : false;
      } catch {
        return false;
      }
    } catch (error) {
      console.debug(
        'Numerical equality check failed:',
        (error as Error).message,
      );
      return false;
    }
  }

  // FIXED: Removed recursive call to checkCommutativityEquivalence
  private checkAlgebraicEquivalence(student: string, correct: string): boolean {
    try {
      // 1. Original simplification approach
      const simplified1 = this.math.simplify(student);
      const simplified2 = this.math.simplify(correct);

      if (simplified1.toString() === simplified2.toString()) {
        return true;
      }

      // 2. Try expanding expressions
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
      console.debug(
        'Algebraic equivalence check failed:',
        (error as Error).message,
      );
      return false;
    }
  }

  private checkSimpleAlgebraicEquivalence(
    student: string,
    correct: string,
  ): boolean {
    try {
      const simplified1 = this.math.simplify(student);
      const simplified2 = this.math.simplify(correct);
      return simplified1.toString() === simplified2.toString();
    } catch {
      return false;
    }
  }

  private checkAdvancedEquivalence(student: string, correct: string): boolean {
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
      console.debug(
        'Advanced equivalence check failed:',
        (error as Error).message,
      );
      return false;
    }
  }

  private checkTrigonometricEquivalence(
    student: string,
    correct: string,
  ): boolean {
    try {
      // Test with common angle values
      const testValues: number[] = [
        0,
        Math.PI / 6,
        Math.PI / 4,
        Math.PI / 3,
        Math.PI / 2,
        Math.PI,
      ];

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

  private checkLogarithmicEquivalence(
    student: string,
    correct: string,
  ): boolean {
    try {
      // Test with common values for logarithmic expressions
      const testValues: number[] = [1, 2, Math.E, 10, 100];

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

  private checkExponentialEquivalence(
    student: string,
    correct: string,
  ): boolean {
    try {
      // Test with common values for exponential expressions
      const testValues: number[] = [0, 1, 2, 3, -1, -2];

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

  private checkCommutativityEquivalence(student: string, correct: string): boolean {
    try {
      // Parse both expressions into AST (Abstract Syntax Trees)
      const studentNode = this.math.parse(student);
      const correctNode = this.math.parse(correct);
      
      // Convert to canonical form by expanding and then re-factoring
      const studentExpanded = this.math.simplify(studentNode, { expand: true });
      const correctExpanded = this.math.simplify(correctNode, { expand: true });
      
      // Check if expanded forms are equal
      if (studentExpanded.toString() === correctExpanded.toString()) {
        return true;
      }
      
      // For polynomial expressions, try multiple canonical forms
      return this.checkPolynomialEquivalence(student, correct);
      
    } catch (error) {
      console.debug('Commutativity check failed:', error);
      return false;
    }
  }

  private checkPolynomialEquivalence(student: string, correct: string): boolean {
    try {
      // Method 1: Expand both and compare
      const studentExpanded = this.math.simplify(student, { expand: true });
      const correctExpanded = this.math.simplify(correct, { expand: true });
      
      if (studentExpanded.toString() === correctExpanded.toString()) {
        return true;
      }
      
      // Method 2: Factor both and compare all possible orderings
      try {
        const studentFactored = this.math.simplify(student, { factor: true });
        const correctFactored = this.math.simplify(correct, { factor: true });
        
        // Check if they're equivalent when factored
        if (this.compareFactoredExpressions(studentFactored.toString(), correctFactored.toString())) {
          return true;
        }
      } catch {
        // Factoring might fail, continue with other methods
      }
      
      // Method 3: Numerical verification at multiple points
      return this.numericalVerification(student, correct);
      
    } catch (error) {
      console.debug('Polynomial equivalence check failed:', error);
      return false;
    }
  }

  private compareFactoredExpressions(student: string, correct: string): boolean {
    try {
      // Extract factors from expressions like (x+3)(x-3) and (x-3)(x+3)
      const studentFactors = this.extractFactors(student);
      const correctFactors = this.extractFactors(correct);
      
      if (studentFactors.length !== correctFactors.length) {
        return false;
      }
      
      // Sort factors to handle commutativity
      const sortedStudent = studentFactors.sort();
      const sortedCorrect = correctFactors.sort();
      
      // Compare sorted factors
      for (let i = 0; i < sortedStudent.length; i++) {
        // Check if factors are algebraically equivalent
        if (!this.areFactorsEquivalent(sortedStudent[i], sortedCorrect[i])) {
          return false;
        }
      }
      
      return true;
    } catch {
      return false;
    }
  }

  // FIXED: Enhanced factor extraction with better pattern matching
  private extractFactors(expression: string): string[] {
    try {
      // Handle more complex factor patterns
      const factors: string[] = [];
      
      // Extract parenthetical factors: (x+3), (x-3), etc.
      const factorPattern = /\([^)]+\)/g;
      const parentheticalFactors = expression.match(factorPattern) || [];
      factors.push(...parentheticalFactors);
      
      // Remove parenthetical factors and handle remaining terms
      let remaining = expression.replace(factorPattern, '');
      
      // Remove multiplication operators and whitespace
      remaining = remaining.replace(/\*/g, '').replace(/\s+/g, '');
      
      // Handle coefficient factors (numbers, variables, simple terms)
      if (remaining && remaining !== '1' && remaining !== '-1' && remaining !== '') {
        // Split by implicit multiplication patterns
        const termPattern = /[a-zA-Z_][a-zA-Z0-9_]*|\d+(?:\.\d+)?/g;
        const terms = remaining.match(termPattern) || [];
        factors.push(...terms);
      }
      
      return factors.filter(factor => factor.trim() !== '');
    } catch {
      // Fallback to simple regex extraction
      const factorPattern = /\([^)]+\)/g;
      return expression.match(factorPattern) || [];
    }
  }

  private areFactorsEquivalent(factor1: string, factor2: string): boolean {
    try {
      // Remove parentheses for comparison
      const clean1 = factor1.replace(/[()]/g, '');
      const clean2 = factor2.replace(/[()]/g, '');
      
      // Use existing algebraic equivalence check
      return this.checkSimpleAlgebraicEquivalence(clean1, clean2);
    } catch {
      return factor1 === factor2;
    }
  }

  private numericalVerification(student: string, correct: string): boolean {
    try {
      // Test with multiple variable values to verify equivalence
      const testValues = [
        { x: 1, y: 1, z: 1 },
        { x: 2, y: 2, z: 2 },
        { x: -1, y: -1, z: -1 },
        { x: 0, y: 0, z: 0 },
        { x: 0.5, y: 0.5, z: 0.5 },
        { x: 10, y: 10, z: 10 },
        { x: -5, y: 3, z: 7 },
        { x: Math.PI, y: Math.E, z: 1.618 }
      ];
      
      for (const scope of testValues) {
        try {
          const studentResult = this.math.evaluate(student, scope);
          const correctResult = this.math.evaluate(correct, scope);
          
          // Handle different result types
          if (typeof studentResult === 'number' && typeof correctResult === 'number') {
            if (Math.abs(studentResult - correctResult) > 1e-10) {
              return false;
            }
          } else {
            // Use math.js equal for other types
            const equalResult = this.math.equal(studentResult, correctResult);
            if (!equalResult) {
              return false;
            }
          }
        } catch {
          // If evaluation fails for a test value, skip it
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
if (!mathValidatorInstance) {
  mathValidatorInstance = new FrontendMathValidator();
}
const MathValidator: FrontendMathValidator = mathValidatorInstance;

// Export functions for compatibility
export const validateMathAnswer = (
  studentAnswer: string,
  correctAnswer: string,
): boolean => MathValidator.validateAnswer(studentAnswer, correctAnswer);

export const quickValidateMath = (
  studentAnswer: string,
  correctAnswer: string,
): boolean => MathValidator.quickValidate(studentAnswer, correctAnswer);

export const isValidMathExpression = (input: string): boolean =>
  MathValidator.isValidMathExpression(input);

export const getMathValidationMessage = (input: string): string =>
  MathValidator.getValidationMessage(input);

// NEW: Export test function for debugging
export const testCommutativityFix = (): boolean =>
  MathValidator.testCommutativityFix();

export { FrontendMathValidator };
export default MathValidator;

// CommonJS exports for Jest compatibility
module.exports = {
  validateMathAnswer,
  quickValidateMath,
  isValidMathExpression,
  getMathValidationMessage,
  testCommutativityFix,
  FrontendMathValidator,
  default: MathValidator,
};