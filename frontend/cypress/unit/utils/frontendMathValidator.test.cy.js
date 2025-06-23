// Import math validator functions at the top using CommonJS require
const {
  validateMathAnswer,
  quickValidateMath,
  isValidMathExpression,
  getMathValidationMessage,
} = require('../../../src/utils/frontendMathValidator.js');

describe('Frontend Math Validator', () => {
  beforeEach(() => {
    // Mock console methods
    cy.stub(console, 'log').as('consoleLogStub');
    cy.stub(console, 'error').as('consoleErrorStub');
    cy.stub(console, 'warn').as('consoleWarnStub');
  });

  describe('Function signatures', () => {
    it('should export all required functions', () => {
      expect(validateMathAnswer).to.be.a('function');
      expect(quickValidateMath).to.be.a('function');
      expect(isValidMathExpression).to.be.a('function');
      expect(getMathValidationMessage).to.be.a('function');
    });

    it('should handle function calls without errors', () => {
      // Test that functions can be called without throwing errors
      expect(() => validateMathAnswer('2+2', '4')).to.not.throw();
      expect(() => quickValidateMath('2+2', '4')).to.not.throw();
      expect(() => isValidMathExpression('2+2')).to.not.throw();
      expect(() => getMathValidationMessage('2+2')).to.not.throw();
    });
  });

  describe('Input validation', () => {
    it('should handle empty or null inputs gracefully', () => {
      expect(() => validateMathAnswer('', '4')).to.not.throw();
      expect(() => validateMathAnswer(null, '4')).to.not.throw();
      expect(() => validateMathAnswer(undefined, '4')).to.not.throw();

      expect(() => quickValidateMath('', '4')).to.not.throw();
      expect(() => quickValidateMath(null, '4')).to.not.throw();
      expect(() => quickValidateMath(undefined, '4')).to.not.throw();

      expect(() => isValidMathExpression('')).to.not.throw();
      expect(() => isValidMathExpression(null)).to.not.throw();
      expect(() => isValidMathExpression(undefined)).to.not.throw();

      expect(() => getMathValidationMessage('')).to.not.throw();
      expect(() => getMathValidationMessage(null)).to.not.throw();
      expect(() => getMathValidationMessage(undefined)).to.not.throw();
    });

    it('should handle invalid input types appropriately', () => {
      // These functions should handle invalid input types gracefully
      // by returning appropriate results rather than throwing errors

      // validateMathAnswer should return false for invalid inputs
      expect(validateMathAnswer(123, '4')).to.be.false;
      expect(validateMathAnswer({}, '4')).to.be.false;
      expect(validateMathAnswer([], '4')).to.be.false;

      // quickValidateMath should return false for invalid inputs
      expect(quickValidateMath(123, '4')).to.be.false;
      expect(quickValidateMath({}, '4')).to.be.false;
      expect(quickValidateMath([], '4')).to.be.false;

      // isValidMathExpression should return false for invalid inputs
      expect(isValidMathExpression(123)).to.be.false;
      expect(isValidMathExpression({})).to.be.false;
      expect(isValidMathExpression([])).to.be.false;

      // getMathValidationMessage should return a string for invalid inputs
      expect(getMathValidationMessage(123)).to.be.a('string');
      expect(getMathValidationMessage({})).to.be.a('string');
      expect(getMathValidationMessage([])).to.be.a('string');
    });
  });

  describe('Return value types', () => {
    it('should return appropriate types for validation functions', () => {
      const validateResult = validateMathAnswer('2+2', '4');
      expect(validateResult).to.be.a('boolean');

      const quickResult = quickValidateMath('2+2', '4');
      expect(quickResult).to.be.a('boolean');

      const isValidResult = isValidMathExpression('2+2');
      expect(isValidResult).to.be.a('boolean');

      const messageResult = getMathValidationMessage('2+2');
      expect(messageResult).to.be.a('string');
    });
  });

  describe('Error handling', () => {
    it('should handle complex expressions without crashing', () => {
      const complexExpr = 'sin(x^2 + cos(y)) * sqrt(a + b) / (c - d)';
      expect(() => isValidMathExpression(complexExpr)).to.not.throw();

      const longExpr =
        'x + y + z + a + b + c + d + e + f + g + h + i + j + k + l + m + n + o + p + q + r + s + t + u + v + w';
      expect(() => isValidMathExpression(longExpr)).to.not.throw();

      const nestedExpr =
        '((((x + y) * (a + b)) + ((c + d) * (e + f))) + ((g + h) * (i + j)))';
      expect(() => isValidMathExpression(nestedExpr)).to.not.throw();
    });

    it('should handle edge cases gracefully', () => {
      // Test with very long strings
      const veryLongString = 'x'.repeat(1000);
      expect(() => isValidMathExpression(veryLongString)).to.not.throw();
      expect(() => getMathValidationMessage(veryLongString)).to.not.throw();

      // Test with special characters
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      expect(() => isValidMathExpression(specialChars)).to.not.throw();
      expect(() => getMathValidationMessage(specialChars)).to.not.throw();
    });
  });
});
