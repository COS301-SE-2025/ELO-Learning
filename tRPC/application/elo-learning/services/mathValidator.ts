// services/mathValidator.ts
import { create, all, MathJsStatic } from 'mathjs';

// Configure math.js for backend validation with advanced features
const math: MathJsStatic = create(all, {
  epsilon: 1e-10,
  matrix: 'Matrix',
  number: 'number',
  precision: 64,
});

// Add custom functions safely
const customImports: Record<string, any> = {};

if (!math.hasOwnProperty('phi') && !(math as any)._scope?.has('phi')) {
  customImports.phi = 1.618033988749895;
}

const functionsToAdd: Record<string, Function> = {
  combination: (n: number, k: number) => {
    try {
      return math.combinations(n, k);
    } catch {
      throw new Error('Invalid combination syntax');
    }
  },
  permutation: (n: number, k: number) => {
    try {
      return math.permutations(n, k);
    } catch {
      throw new Error('Invalid permutation syntax');
    }
  },
};

Object.keys(functionsToAdd).forEach((funcName) => {
  if (!math.hasOwnProperty(funcName) && (!(math as any)._scope || !(math as any)._scope.has(funcName))) {
    customImports[funcName] = functionsToAdd[funcName];
  }
});

if (Object.keys(customImports).length > 0) {
  try {
    math.import(customImports);
  } catch (error: any) {
    console.warn('Some math functions already exist:', error.message);
  }
}

class BackendMathValidator {
  private math: MathJsStatic;
  private supportedFunctions: string[];

  constructor() {
    this.math = math;
    this.supportedFunctions = [
      'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh',
      'log', 'ln', 'log10', 'log2', 'sqrt', 'cbrt', 'abs', 'floor', 'ceil',
      'round', 'exp', 'factorial', 'gamma', 'derivative', 'integral', 'limit',
      'sum', 'prod', 'max', 'min', 'combination', 'permutation', 'solve',
      'factor', 'expand', 'simplify',
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

      // Enhanced validation sequence with improved commutativity
      return (
        this.checkExactMatch(normalizedStudent, normalizedCorrect) ||
        this.checkCommutativityEquivalence(normalizedStudent, normalizedCorrect) ||
        this.checkNumericalEquality(normalizedStudent, normalizedCorrect) ||
        this.checkAlgebraicEquivalence(normalizedStudent, normalizedCorrect) ||
        this.checkAdvancedEquivalence(normalizedStudent, normalizedCorrect)
      );
    } catch (error: any) {
      console.warn('Enhanced backend math validation error:', error);
      return false;
    }
  }

  quickValidate(studentAnswer: string, correctAnswer: string): boolean {
    try {
      if (!studentAnswer?.trim()) return false;
      const normalized1 = this.normalizeExpression(studentAnswer);
      const normalized2 = this.normalizeExpression(correctAnswer);

      return (
        this.checkExactMatch(normalized1, normalized2) ||
        this.checkCommutativityEquivalence(normalized1, normalized2) ||
        this.checkNumericalEquality(normalized1, normalized2) ||
        this.checkSimpleAlgebraicEquivalence(normalized1, normalized2)
      );
    } catch {
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
      .replace(/∫/g, 'integral')
      .replace(/∂/g, 'derivative')
      .replace(/∑/g, 'sum')
      .replace(/∏/g, 'prod')
      .replace(/∆/g, 'delta')
      .replace(/≤/g, '<=')
      .replace(/≥/g, '>=')
      .replace(/≠/g, '!=')
      .replace(/≈/g, '~=')
      .replace(/\bC\(/g, 'combination(')
      .replace(/\bP\(/g, 'permutation(')
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
   * Addresses the (x+3)(x-3) = (x-3)(x+3) issue
   */
  private checkCommutativityEquivalence(student: string, correct: string): boolean {
    try {
      // Method 1: Parse and expand both expressions
      const studentNode = this.math.parse(student);
      const correctNode = this.math.parse(correct);
      
      const studentExpanded = this.math.simplify(studentNode, { expand: true });
      const correctExpanded = this.math.simplify(correctNode, { expand: true });
      
      if (studentExpanded.toString() === correctExpanded.toString()) {
        return true;
      }

      // Method 2: Enhanced factored expression comparison
      if (this.isFactoredExpression(student) && this.isFactoredExpression(correct)) {
        return this.compareFactoredExpressions(student, correct);
      }

      // Method 3: Multiplication commutativity
      if (this.hasMultiplication(student) && this.hasMultiplication(correct)) {
        return this.checkMultiplicationCommutativity(student, correct);
      }

      // Method 4: Addition commutativity
      if (this.hasAdditionSubtraction(student) && this.hasAdditionSubtraction(correct)) {
        return this.checkAdditionCommutativity(student, correct);
      }

      // Method 5: Polynomial equivalence
      return this.checkPolynomialEquivalence(student, correct);
    } catch (error: any) {
      console.debug('Enhanced backend commutativity check failed:', error.message);
      return false;
    }
  }

  private isFactoredExpression(expr: string): boolean {
    const factorPattern = /\([^)]+\)\s*\*?\s*\([^)]+\)/;
    const implicitFactorPattern = /\([^)]+\)\s*\([^)]+\)/;
    return factorPattern.test(expr) || implicitFactorPattern.test(expr);
  }

  private compareFactoredExpressions(student: string, correct: string): boolean {
    try {
      const studentFactors = this.extractAllFactors(student);
      const correctFactors = this.extractAllFactors(correct);
      
      if (studentFactors.length !== correctFactors.length) {
        return false;
      }

      const sortedStudentFactors = this.sortFactorsAlgebraically(studentFactors);
      const sortedCorrectFactors = this.sortFactorsAlgebraically(correctFactors);

      for (let i = 0; i < sortedStudentFactors.length; i++) {
        if (!this.areFactorsAlgebraicallyEqual(sortedStudentFactors[i], sortedCorrectFactors[i])) {
          return false;
        }
      }

      return true;
    } catch (error: any) {
      console.debug('Backend factored expression comparison failed:', error.message);
      return false;
    }
  }

  private extractAllFactors(expression: string): string[] {
    const factors: string[] = [];
    
    // Handle coefficients
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

    // Extract remaining variable factors
    let remaining = expression
      .replace(/^-?\d+\.?\d*\*?/, '')
      .replace(/\([^)]+\)\*?/g, '')
      .replace(/\*/g, '');

    if (remaining && remaining !== '1' && remaining !== '') {
      const variableFactors = remaining.match(/[a-zA-Z][a-zA-Z0-9]*(\^[0-9]+)?/g) || [];
      factors.push(...variableFactors);
    }

    return factors.filter(factor => factor.trim() !== '');
  }

  private sortFactorsAlgebraically(factors: string[]): string[] {
    return factors.sort((a, b) => {
      const aComplexity = this.getAlgebraicComplexity(a);
      const bComplexity = this.getAlgebraicComplexity(b);
      
      if (aComplexity !== bComplexity) {
        return aComplexity - bComplexity;
      }
      
      const aNormalized = this.normalizeFactorForSorting(a);
      const bNormalized = this.normalizeFactorForSorting(b);
      
      return aNormalized.localeCompare(bNormalized);
    });
  }

  private getAlgebraicComplexity(factor: string): number {
    if (/^-?\d+\.?\d*$/.test(factor)) return 1;
    if (/^[a-zA-Z][a-zA-Z0-9]*(\^[0-9]+)?$/.test(factor)) return 2;
    if (factor.startsWith('(') && factor.endsWith(')')) return 3;
    return 4;
  }

  private normalizeFactorForSorting(factor: string): string {
    if (factor.startsWith('(') && factor.endsWith(')')) {
      const inner = factor.slice(1, -1);
      return this.normalizeExpressionForSorting(inner);
    }
    return factor;
  }

  private normalizeExpressionForSorting(expr: string): string {
    try {
      const terms = this.extractTermsFromExpression(expr);
      const sortedTerms = terms.sort();
      return sortedTerms.join('+').replace(/\+\-/g, '-');
    } catch {
      return expr;
    }
  }

  private extractTermsFromExpression(expr: string): string[] {
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

  private areFactorsAlgebraicallyEqual(factor1: string, factor2: string): boolean {
    try {
      if (factor1 === factor2) return true;
      
      const clean1 = factor1.replace(/[()]/g, '');
      const clean2 = factor2.replace(/[()]/g, '');
      
      if (clean1 === clean2) return true;
      
      const simplified1 = this.math.simplify(clean1);
      const simplified2 = this.math.simplify(clean2);
      
      if (simplified1.toString() === simplified2.toString()) return true;
      
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

  private hasMultiplication(expr: string): boolean {
    return /\*/.test(expr) || /\)\s*\(/.test(expr) || /\d\s*[a-zA-Z]/.test(expr);
  }

  private checkMultiplicationCommutativity(student: string, correct: string): boolean {
    try {
      const studentFactors = this.extractMultiplicationFactors(student);
      const correctFactors = this.extractMultiplicationFactors(correct);
      
      if (studentFactors.length !== correctFactors.length) {
        return false;
      }
      
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

  private extractMultiplicationFactors(expr: string): string[] {
    const factors: string[] = [];
    const parts = expr.split('*');
    
    for (const part of parts) {
      const implicitFactors = part.match(/\([^)]+\)/g) || [];
      if (implicitFactors.length > 0) {
        factors.push(...implicitFactors);
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

  private hasAdditionSubtraction(expr: string): boolean {
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

  private checkPolynomialEquivalence(student: string, correct: string): boolean {
    try {
      const studentExpanded = this.math.simplify(student, { expand: true });
      const correctExpanded = this.math.simplify(correct, { expand: true });
      
      if (studentExpanded.toString() === correctExpanded.toString()) {
        return true;
      }
      
      try {
        const studentFactored = this.math.simplify(student, { factor: true });
        const correctFactored = this.math.simplify(correct, { factor: true });
        
        if (this.compareFactoredExpressions(studentFactored.toString(), correctFactored.toString())) {
          return true;
        }
      } catch {
        // Continue
      }
      
      return this.numericalVerification(student, correct);
    } catch {
      return false;
    }
  }

  private numericalVerification(student: string, correct: string): boolean {
    try {
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
          
          if (typeof studentResult === 'number' && typeof correctResult === 'number') {
            if (Math.abs(studentResult - correctResult) > 1e-10) {
              return false;
            }
          } else {
            const equalResult = this.math.equal(studentResult, correctResult);
            if (!equalResult) {
              return false;
            }
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
          const result = this.math.equal(studentValue, correctValue);
          return Array.isArray(result) ? result.every(Boolean) : Boolean(result);
        } catch {
          return false;
        }
      }

      if (studentValue === Infinity && correct === 'Infinity') return true;
      if (correctValue === Infinity && student === 'Infinity') return true;

      const result = this.math.equal(studentValue, correctValue);
      return Array.isArray(result) ? result.every(Boolean) : Boolean(result);
    } catch (error: any) {
      console.debug('Backend numerical equality check failed:', error.message);
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
        const factored1 = this.math.simplify(student, { factor: true });
        const factored2 = this.math.simplify(correct, { factor: true });

        if (factored1.toString() === factored2.toString()) {
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
    } catch (error: any) {
      console.debug('Backend algebraic equivalence check failed:', error.message);
      return false;
    }
  }

  private checkSimpleAlgebraicEquivalence(student: string, correct: string): boolean {
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
      if (this.checkTrigonometricEquivalence(student, correct)) return true;
      if (this.checkLogarithmicEquivalence(student, correct)) return true;
      if (this.checkExponentialEquivalence(student, correct)) return true;
      return false;
    } catch (error: any) {
      console.debug('Backend advanced equivalence check failed:', error.message);
      return false;
    }
  }

  private checkTrigonometricEquivalence(student: string, correct: string): boolean {
    try {
      const testValues = [0, Math.PI / 6, Math.PI / 4, Math.PI / 3, Math.PI / 2, Math.PI];

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

  private checkLogarithmicEquivalence(student: string, correct: string): boolean {
    try {
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

  private checkExponentialEquivalence(student: string, correct: string): boolean {
    try {
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
      if (this.hasFunctionSyntaxErrors(normalized)) return false;
      if (/\/\s*0(?!\d)/.test(normalized)) return false;

      this.math.parse(normalized);
      return true;
    } catch (error: any) {
      console.debug('Backend expression validation failed:', error.message);
      return false;
    }
  }

  private hasMatchedParentheses(expression: string): boolean {
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

  private hasFunctionSyntaxErrors(expression: string): boolean {
    const functionPattern = new RegExp(`(${this.supportedFunctions.join('|')})\\s*[^(]`, 'i');
    return functionPattern.test(expression);
  }

  getValidationMessage(input: string): string {
    if (!input?.trim()) return 'Please enter an answer';

    const normalized = this.normalizeExpression(input);
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

    const functionPattern = new RegExp(`(${this.supportedFunctions.join('|')})\\s*[^(]`, 'i');
    if (functionPattern.test(normalized)) {
      return 'Functions need parentheses (e.g., sin(x), log(n))';
    }

    if (/[+\-*/^]{2,}/.test(normalized)) {
      return 'Consecutive operators are not allowed';
    }

    if (/^[+*/^]/.test(normalized)) {
      return 'Expression cannot start with an operator';
    }

    if (/[+\-*/^]$/.test(normalized)) {
      return 'Expression cannot end with an operator';
    }

    if (/\/\s*0(?!\d)/.test(normalized)) {
      return 'Division by zero is not allowed';
    }

    if (!this.isValidMathExpression(input)) {
      return 'Please check your mathematical expression';
    }

    return '';
  }

  // Test method to verify enhanced commutativity
  testCommutativityFix(): boolean {
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
    
    console.log("🔧 Testing Backend Math Validator Commutativity Fix...");
    
    for (const testCase of testCases) {
      const result = this.validateAnswer(testCase.student, testCase.correct);
      console.log(`${result ? '✅' : '❌'} ${testCase.description}: ${testCase.student} = ${testCase.correct}`);
      
      if (!result) {
        console.error(`❌ Backend test failed: ${testCase.student} should equal ${testCase.correct}`);
        return false;
      }
    }
    
    console.log("🎉 All backend commutativity tests passed!");
    return true;
  }
}

// Create singleton instance for backend
export const backendMathValidator = new BackendMathValidator();

// Export the class
export { BackendMathValidator };