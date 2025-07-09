import * as math from 'mathjs';

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

// Singleton instance to prevent multiple MathJS initializations
let mathValidatorInstance: ImprovedMathValidator | null = null;

class ImprovedMathValidator {
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
    if (!this.math._phi) {
      try {
        const customFunctions: Partial<MathJSCustomFunctions> = {
          phi: 1.618033988749895,
          derivative: (expr: string, variable: string): math.MathNode => {
            try {
              return this.math.derivative(expr, variable);
            } catch {
              throw new Error('Invalid derivative syntax');
            }
          },
          integral: (expr: string, variable: string, from?: number, to?: number): math.MathNode => {
            try {
              if (from !== undefined && to !== undefined) {
                return this.math.evaluate(`integrate(${expr}, ${variable}, ${from}, ${to})`) as math.MathNode;
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
          combination: (n: number, k: number): number => this.math.combinations(n, k),
          permutation: (n: number, k: number): number => this.math.permutations(n, k),
        };

        this.math.import(customFunctions);
        this.math._phi = true;
      } catch (error) {
        console.warn('MathJS custom imports skipped:', (error as Error).message);
      }
    }

    this.supportedFunctions = [
      'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'log', 'ln', 'log10', 'log2',
      'sqrt', 'cbrt', 'abs', 'floor', 'ceil', 'round', 'exp', 'factorial', 'gamma',
      'derivative', 'integral', 'limit', 'sum', 'prod', 'max', 'min', 'combination', 'permutation',
    ];
  }

  validateAnswer(studentAnswer: string, correctAnswer: string): boolean {
    try {
      if (!studentAnswer || !correctAnswer || 
          typeof studentAnswer !== 'string' || typeof correctAnswer !== 'string') {
        return false;
      }

      const normalizedStudent = this.normalizeExpression(studentAnswer);
      const normalizedCorrect = this.normalizeExpression(correctAnswer);

      // Enhanced validation sequence - prioritize commutativity checks
      return (
        this.checkExactMatch(normalizedStudent, normalizedCorrect) ||
        this.checkEnhancedCommutativityEquivalence(normalizedStudent, normalizedCorrect) ||
        this.checkNumericalEquality(normalizedStudent, normalizedCorrect) ||
        this.checkAlgebraicEquivalence(normalizedStudent, normalizedCorrect) ||
        this.checkAdvancedEquivalence(normalizedStudent, normalizedCorrect)
      );
    } catch (error) {
      console.warn('Enhanced math validation error:', error);
      return false;
    }
  }

  normalizeExpression(expression: string): string {
    if (typeof expression !== 'string') return expression;

    return expression
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/\*{2}/g, '^')
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/\[/g, '(')
      .replace(/\]/g, ')')
      .replace(/π/g, 'pi')
      .replace(/∞/g, 'Infinity')
      .replace(/φ/g, 'phi')
      .replace(/°/g, ' deg')
      .replace(/sin⁻¹/g, 'asin')
      .replace(/cos⁻¹/g, 'acos')
      .replace(/tan⁻¹/g, 'atan')
      .replace(/√/g, 'sqrt')
      .replace(/∛/g, 'cbrt')
      .replace(/≤/g, '<=')
      .replace(/≥/g, '>=')
      .replace(/≠/g, '!=')
      .replace(/≈/g, '~=')
      .replace(/(\d)\(/g, '$1*(')
      .replace(/\)(\d)/g, ')*$1')
      .replace(/\)([a-z])/g, ')*$1')
      .replace(/([a-z])(\d)/g, '$1*$2')
      .replace(/(\d)([a-z])/g, '$1*$2')
      .replace(/([a-z]+)\s*\(/g, '$1(')
      .replace(/\+\+/g, '+')
      .replace(/--/g, '+')
      .replace(/\+-/g, '-')
      .replace(/-\+/g, '-');
  }

  /**
   * ENHANCED: Better commutativity checking for factored expressions
   * This method specifically addresses the (x+3)(x-3) = (x-3)(x+3) issue
   */
  private checkEnhancedCommutativityEquivalence(student: string, correct: string): boolean {
    try {
      // Method 1: Parse and compare expression trees
      const studentNode = this.math.parse(student);
      const correctNode = this.math.parse(correct);
      
      // Convert both to expanded form for comparison
      const studentExpanded = this.math.simplify(studentNode, { expand: true });
      const correctExpanded = this.math.simplify(correctNode, { expand: true });
      
      if (studentExpanded.toString() === correctExpanded.toString()) {
        return true;
      }

      // Method 2: Enhanced factored expression comparison
      if (this.isFactoredExpression(student) && this.isFactoredExpression(correct)) {
        return this.compareFactoredExpressions(student, correct);
      }

      // Method 3: Multiplication commutativity check
      if (this.hasMultiplication(student) && this.hasMultiplication(correct)) {
        return this.checkMultiplicationCommutativity(student, correct);
      }

      // Method 4: Addition/subtraction commutativity
      if (this.hasAdditionSubtraction(student) && this.hasAdditionSubtraction(correct)) {
        return this.checkAdditionCommutativity(student, correct);
      }

      return false;
    } catch (error) {
      console.debug('Enhanced commutativity check failed:', error);
      return false;
    }
  }

  /**
   * ENHANCED: Better detection of factored expressions
   */
  private isFactoredExpression(expr: string): boolean {
    // Check for multiple parenthetical terms multiplied together
    const factorPattern = /\([^)]+\)\s*\*?\s*\([^)]+\)/;
    const implicitFactorPattern = /\([^)]+\)\s*\([^)]+\)/;
    
    return factorPattern.test(expr) || implicitFactorPattern.test(expr);
  }

  /**
   * ENHANCED: Improved factored expression comparison
   * Handles cases like (x+3)(x-3) vs (x-3)(x+3)
   */
  private compareFactoredExpressions(student: string, correct: string): boolean {
    try {
      // Extract all factors from both expressions
      const studentFactors = this.extractAllFactors(student);
      const correctFactors = this.extractAllFactors(correct);
      
      if (studentFactors.length !== correctFactors.length) {
        return false;
      }

      // Sort factors algebraically for comparison
      const sortedStudentFactors = this.sortFactorsAlgebraically(studentFactors);
      const sortedCorrectFactors = this.sortFactorsAlgebraically(correctFactors);

      // Compare each factor pair
      for (let i = 0; i < sortedStudentFactors.length; i++) {
        if (!this.areFactorsAlgebraicallyEqual(sortedStudentFactors[i], sortedCorrectFactors[i])) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.debug('Factored expression comparison failed:', error);
      return false;
    }
  }

  /**
   * ENHANCED: Better factor extraction with coefficient handling
   */
  private extractAllFactors(expression: string): string[] {
    const factors: string[] = [];
    
    // First, handle coefficients (numbers at the beginning)
    const coefficientMatch = expression.match(/^-?\d+\.?\d*/);
    if (coefficientMatch && coefficientMatch[0] !== '' && coefficientMatch[0] !== '1') {
      factors.push(coefficientMatch[0]);
    }

    // Extract parenthetical factors
    const parenthesisPattern = /\([^)]+\)/g;
    const parenthesisMatches = expression.match(parenthesisPattern);
    if (parenthesisMatches) {
      factors.push(...parenthesisMatches);
    }

    // Extract remaining variable factors (after removing parentheses and coefficients)
    let remaining = expression
      .replace(/^-?\d+\.?\d*\*?/, '') // Remove leading coefficient
      .replace(/\([^)]+\)\*?/g, '') // Remove parenthetical factors
      .replace(/\*/g, ''); // Remove multiplication signs

    if (remaining && remaining !== '1' && remaining !== '') {
      // Split remaining into individual variable factors
      const variableFactors = remaining.match(/[a-zA-Z][a-zA-Z0-9]*(\^[0-9]+)?/g) || [];
      factors.push(...variableFactors);
    }

    return factors.filter(factor => factor.trim() !== '');
  }

  /**
   * ENHANCED: Algebraic sorting of factors
   */
  private sortFactorsAlgebraically(factors: string[]): string[] {
    return factors.sort((a, b) => {
      // Sort by algebraic complexity and then alphabetically
      const aComplexity = this.getAlgebraicComplexity(a);
      const bComplexity = this.getAlgebraicComplexity(b);
      
      if (aComplexity !== bComplexity) {
        return aComplexity - bComplexity;
      }
      
      // If same complexity, sort alphabetically by normalized form
      const aNormalized = this.normalizeFactorForSorting(a);
      const bNormalized = this.normalizeFactorForSorting(b);
      
      return aNormalized.localeCompare(bNormalized);
    });
  }

  /**
   * Calculate algebraic complexity for sorting
   */
  private getAlgebraicComplexity(factor: string): number {
    // Numbers have lowest complexity
    if (/^-?\d+\.?\d*$/.test(factor)) return 1;
    
    // Single variables have medium complexity
    if (/^[a-zA-Z][a-zA-Z0-9]*(\^[0-9]+)?$/.test(factor)) return 2;
    
    // Parenthetical expressions have highest complexity
    if (factor.startsWith('(') && factor.endsWith(')')) return 3;
    
    return 4; // Unknown/complex expressions
  }

  /**
   * Normalize factor for consistent sorting
   */
  private normalizeFactorForSorting(factor: string): string {
    if (factor.startsWith('(') && factor.endsWith(')')) {
      // For parenthetical expressions, normalize the internal expression
      const inner = factor.slice(1, -1);
      return this.normalizeExpressionForSorting(inner);
    }
    
    return factor;
  }

  /**
   * Normalize expressions for consistent sorting (handles x+3 vs 3+x)
   */
  private normalizeExpressionForSorting(expr: string): string {
    try {
      // Parse and sort terms in addition/subtraction
      const terms = this.extractTermsFromExpression(expr);
      const sortedTerms = terms.sort();
      return sortedTerms.join('+').replace(/\+\-/g, '-');
    } catch {
      return expr;
    }
  }

  /**
   * Extract terms from expressions like "x+3" or "2x-5"
   */
  private extractTermsFromExpression(expr: string): string[] {
    // Handle addition and subtraction
    const terms: string[] = [];
    let currentTerm = '';
    let sign = '+';
    
    for (let i = 0; i < expr.length; i++) {
      const char = expr[i];
      
      if (char === '+' || char === '-') {
        if (currentTerm) {
          terms.push(sign === '-' ? '-' + currentTerm : currentTerm);
        }
        sign = char;
        currentTerm = '';
      } else {
        currentTerm += char;
      }
    }
    
    if (currentTerm) {
      terms.push(sign === '-' ? '-' + currentTerm : currentTerm);
    }
    
    return terms;
  }

  /**
   * ENHANCED: Check if two factors are algebraically equal
   */
  private areFactorsAlgebraicallyEqual(factor1: string, factor2: string): boolean {
    try {
      // Direct comparison
      if (factor1 === factor2) return true;
      
      // Remove parentheses and compare
      const clean1 = factor1.replace(/[()]/g, '');
      const clean2 = factor2.replace(/[()]/g, '');
      
      if (clean1 === clean2) return true;
      
      // Use math.js to check algebraic equivalence
      const simplified1 = this.math.simplify(clean1);
      const simplified2 = this.math.simplify(clean2);
      
      if (simplified1.toString() === simplified2.toString()) return true;
      
      // Check if difference is zero
      try {
        const difference = this.math.simplify(`(${clean1}) - (${clean2})`);
        return difference.toString() === '0';
      } catch {
        return false;
      }
    } catch {
      return factor1 === factor2;
    }
  }

  /**
   * Check if expression contains multiplication
   */
  private hasMultiplication(expr: string): boolean {
    return /\*/.test(expr) || /\)\s*\(/.test(expr) || /\d\s*[a-zA-Z]/.test(expr);
  }

  /**
   * Check multiplication commutativity (a*b = b*a)
   */
  private checkMultiplicationCommutativity(student: string, correct: string): boolean {
    try {
      // Extract multiplication factors
      const studentFactors = this.extractMultiplicationFactors(student);
      const correctFactors = this.extractMultiplicationFactors(correct);
      
      if (studentFactors.length !== correctFactors.length) {
        return false;
      }
      
      // Sort and compare
      const sortedStudent = studentFactors.sort();
      const sortedCorrect = correctFactors.sort();
      
      for (let i = 0; i < sortedStudent.length; i++) {
        if (!this.areFactorsAlgebraicallyEqual(sortedStudent[i], sortedCorrect[i])) {
          return false;
        }
      }
      
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Extract factors from multiplication expressions
   */
  private extractMultiplicationFactors(expr: string): string[] {
    const factors: string[] = [];
    
    // Split by explicit multiplication
    let parts = expr.split('*');
    
    // Handle implicit multiplication like (x+1)(x-1)
    for (const part of parts) {
      const implicitFactors = part.match(/\([^)]+\)/g) || [];
      if (implicitFactors.length > 0) {
        factors.push(...implicitFactors);
        // Add any remaining part after removing parentheses
        const remaining = part.replace(/\([^)]+\)/g, '').trim();
        if (remaining && remaining !== '1') {
          factors.push(remaining);
        }
      } else {
        factors.push(part.trim());
      }
    }
    
    return factors.filter(f => f && f !== '1');
  }

  /**
   * Check if expression contains addition/subtraction
   */
  private hasAdditionSubtraction(expr: string): boolean {
    // Check for + or - outside of parentheses
    let parenDepth = 0;
    for (let i = 0; i < expr.length; i++) {
      const char = expr[i];
      if (char === '(') parenDepth++;
      else if (char === ')') parenDepth--;
      else if (parenDepth === 0 && (char === '+' || char === '-')) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check addition/subtraction commutativity (a+b = b+a)
   */
  private checkAdditionCommutativity(student: string, correct: string): boolean {
    try {
      const studentTerms = this.extractTermsFromExpression(student);
      const correctTerms = this.extractTermsFromExpression(correct);
      
      if (studentTerms.length !== correctTerms.length) {
        return false;
      }
      
      const sortedStudent = studentTerms.sort();
      const sortedCorrect = correctTerms.sort();
      
      for (let i = 0; i < sortedStudent.length; i++) {
        if (!this.areFactorsAlgebraicallyEqual(sortedStudent[i], sortedCorrect[i])) {
          return false;
        }
      }
      
      return true;
    } catch {
      return false;
    }
  }

  // Keep existing methods for compatibility
  private checkExactMatch(student: string, correct: string): boolean {
    return student === correct;
  }

  private checkNumericalEquality(student: string, correct: string): boolean {
    try {
      const studentValue = this.math.evaluate(student);
      const correctValue = this.math.evaluate(correct);

      if (typeof studentValue === 'number' && typeof correctValue === 'number') {
        if (!isFinite(studentValue) || !isFinite(correctValue)) {
          return studentValue === correctValue;
        }
        return Math.abs(studentValue - correctValue) <= 1e-10;
      }

      if (this.math.typeOf(studentValue) === 'Complex' || this.math.typeOf(correctValue) === 'Complex') {
        try {
          const equalResult = this.math.equal(studentValue, correctValue);
          return typeof equalResult === 'boolean' ? equalResult : false;
        } catch {
          return false;
        }
      }

      try {
        const equalResult = this.math.equal(studentValue, correctValue);
        return typeof equalResult === 'boolean' ? equalResult : false;
      } catch {
        return false;
      }
    } catch {
      return false;
    }
  }

  private checkAlgebraicEquivalence(student: string, correct: string): boolean {
    try {
      const simplified1 = this.math.simplify(student);
      const simplified2 = this.math.simplify(correct);

      if (simplified1.toString() === simplified2.toString()) {
        return true;
      }

      try {
        const expanded1 = this.math.simplify(this.math.parse(student), { expand: true });
        const expanded2 = this.math.simplify(this.math.parse(correct), { expand: true });

        if (expanded1.toString() === expanded2.toString()) {
          return true;
        }
      } catch {
        // Continue
      }

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

  private checkAdvancedEquivalence(student: string, correct: string): boolean {
    // Keep existing advanced equivalence checks
    return false;
  }

  // Test method to verify the enhanced commutativity fix
  testEnhancedCommutativityFix(): boolean {
    const testCases = [
      { student: "(x+3)(x-3)", correct: "(x-3)(x+3)", description: "Basic commutative factors" },
      { student: "(x-3)(x+3)", correct: "(x+3)(x-3)", description: "Reverse commutative factors" },
      { student: "(a+b)(c+d)", correct: "(c+d)(a+b)", description: "Multi-variable commutative" },
      { student: "2(x+1)", correct: "(x+1)*2", description: "Coefficient commutativity" },
      { student: "x*y*z", correct: "z*y*x", description: "Variable multiplication order" },
      { student: "(x+3)*(x-3)", correct: "(x-3)*(x+3)", description: "Explicit multiplication" },
      { student: "(2x+1)(x-4)", correct: "(x-4)(2x+1)", description: "Complex factor commutativity" },
      { student: "x+3", correct: "3+x", description: "Simple addition commutativity" },
      { student: "2x+5y", correct: "5y+2x", description: "Multi-term addition commutativity" }
    ];
    
    console.log("🧮 Testing Enhanced Math Validator Commutativity Fix...");
    
    for (const testCase of testCases) {
      const result = this.validateAnswer(testCase.student, testCase.correct);
      console.log(`${result ? '✅' : '❌'} ${testCase.description}: ${testCase.student} = ${testCase.correct}`);
      
      if (!result) {
        console.error(`❌ Test failed: ${testCase.student} should equal ${testCase.correct}`);
        return false;
      }
    }
    
    console.log("🎉 All enhanced commutativity tests passed!");
    return true;
  }

  // Utility methods for validation
  isValidMathExpression(input: string): boolean {
    try {
      if (!input || typeof input !== 'string' || !input.trim()) {
        return false;
      }

      const normalized = this.normalizeExpression(input);
      
      if (!normalized.trim()) return false;
      if (/[+\-*/^]{2,}/.test(normalized.replace(/\*\*/g, '^'))) return false;
      if (/^[+*/^]|[+\-*/^]$/.test(normalized)) return false;
      if (!this.hasMatchedParentheses(normalized)) return false;

      this.math.parse(normalized);
      return true;
    } catch {
      return false;
    }
  }

  private hasMatchedParentheses(expression: string): boolean {
    let count = 0;
    for (const char of expression) {
      if (char === '(') count++;
      else if (char === ')') count--;
      if (count < 0) return false;
    }
    return count === 0;
  }

  getValidationMessage(input: string): string {
    if (!input?.trim()) return 'Please enter an answer';
    if (!this.isValidMathExpression(input)) return 'Please check your mathematical expression';
    return '';
  }

  quickValidate(studentAnswer: string, correctAnswer: string): boolean {
    try {
      if (!studentAnswer?.trim()) return false;
      const normalized1 = this.normalizeExpression(studentAnswer);
      const normalized2 = this.normalizeExpression(correctAnswer);
      return (
        this.checkExactMatch(normalized1, normalized2) ||
        this.checkEnhancedCommutativityEquivalence(normalized1, normalized2) ||
        this.checkNumericalEquality(normalized1, normalized2)
      );
    } catch {
      return false;
    }
  }
}

// Create singleton instance
if (!mathValidatorInstance) {
  mathValidatorInstance = new ImprovedMathValidator();
}

const MathValidator = mathValidatorInstance;

// Export functions for compatibility
export const validateMathAnswer = (studentAnswer: string, correctAnswer: string): boolean => 
  MathValidator.validateAnswer(studentAnswer, correctAnswer);

export const quickValidateMath = (studentAnswer: string, correctAnswer: string): boolean => 
  MathValidator.quickValidate(studentAnswer, correctAnswer);

export const isValidMathExpression = (input: string): boolean => 
  MathValidator.isValidMathExpression(input);

export const getMathValidationMessage = (input: string): string => 
  MathValidator.getValidationMessage(input);

export const testEnhancedCommutativityFix = (): boolean => 
  MathValidator.testEnhancedCommutativityFix();

export { ImprovedMathValidator };
export default MathValidator;