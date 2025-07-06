// application/elo-learning/services/__tests__/mathValidator.test.ts
import { backendMathValidator } from '../mathValidator';

describe('BackendMathValidator', () => {
  describe('validateAnswer', () => {
    it('should validate exact matches', () => {
      expect(backendMathValidator.validateAnswer('2+2', '2+2')).toBe(true);
      expect(backendMathValidator.validateAnswer('x^2', 'x^2')).toBe(true);
    });

    it('should validate numerical equality', () => {
      expect(backendMathValidator.validateAnswer('4', '2+2')).toBe(true);
      expect(backendMathValidator.validateAnswer('8', '2^3')).toBe(true);
      expect(backendMathValidator.validateAnswer('1', 'sin(pi/2)')).toBe(true);
    });

    it('should validate algebraic equivalence', () => {
      expect(backendMathValidator.validateAnswer('x+x', '2*x')).toBe(true);
      expect(
        backendMathValidator.validateAnswer('x^2 + 2*x + 1', '(x+1)^2'),
      ).toBe(true);
      expect(backendMathValidator.validateAnswer('2*x + 3*x', '5*x')).toBe(
        true,
      );
    });

    it('should validate trigonometric identities', () => {
      expect(
        backendMathValidator.validateAnswer('sin^2(x) + cos^2(x)', '1'),
      ).toBe(true);
      expect(
        backendMathValidator.validateAnswer('tan(x)', 'sin(x)/cos(x)'),
      ).toBe(true);
    });

    it('should handle logarithmic expressions', () => {
      expect(backendMathValidator.validateAnswer('log(10)', '1')).toBe(true);
      expect(backendMathValidator.validateAnswer('ln(e)', '1')).toBe(true);
      expect(backendMathValidator.validateAnswer('log(100)', '2')).toBe(true);
    });

    it('should reject incorrect answers', () => {
      expect(backendMathValidator.validateAnswer('2+2', '5')).toBe(false);
      expect(backendMathValidator.validateAnswer('x^2', 'x^3')).toBe(false);
      expect(backendMathValidator.validateAnswer('sin(x)', 'cos(x)')).toBe(
        false,
      );
    });

    it('should handle edge cases', () => {
      expect(backendMathValidator.validateAnswer('', '2+2')).toBe(false);
      expect(backendMathValidator.validateAnswer('2+2', '')).toBe(false);
      expect(backendMathValidator.validateAnswer(null as any, '2+2')).toBe(
        false,
      );
      expect(backendMathValidator.validateAnswer('2+2', null as any)).toBe(
        false,
      );
    });

    it('should handle invalid mathematical expressions', () => {
      expect(backendMathValidator.validateAnswer('invalid', '2+2')).toBe(false);
      expect(backendMathValidator.validateAnswer('2+2', 'invalid')).toBe(false);
      expect(backendMathValidator.validateAnswer('1/0', '2+2')).toBe(false);
    });

    it('should handle complex expressions', () => {
      expect(backendMathValidator.validateAnswer('sqrt(16)', '4')).toBe(true);
      expect(backendMathValidator.validateAnswer('factorial(5)', '120')).toBe(
        true,
      );
      expect(backendMathValidator.validateAnswer('abs(-5)', '5')).toBe(true);
    });

    it('should validate fractions', () => {
      expect(backendMathValidator.validateAnswer('1/2', '0.5')).toBe(true);
      expect(backendMathValidator.validateAnswer('3/4', '0.75')).toBe(true);
      expect(backendMathValidator.validateAnswer('2/3', '0.6667')).toBe(true); // Should handle precision
    });

    it('should validate expressions with multiple variables', () => {
      expect(backendMathValidator.validateAnswer('x + y', 'y + x')).toBe(true);
      expect(backendMathValidator.validateAnswer('x*y + y*x', '2*x*y')).toBe(
        true,
      );
    });
  });

  describe('quickValidate', () => {
    it('should quickly validate simple expressions', () => {
      expect(backendMathValidator.quickValidate('2+2', '4')).toBe(true);
      expect(backendMathValidator.quickValidate('x+x', '2*x')).toBe(true);
    });

    it('should return false for empty input', () => {
      expect(backendMathValidator.quickValidate('', '4')).toBe(false);
      expect(backendMathValidator.quickValidate('   ', '4')).toBe(false);
    });

    it('should handle invalid expressions gracefully', () => {
      expect(backendMathValidator.quickValidate('invalid', '4')).toBe(false);
      expect(backendMathValidator.quickValidate('2+2', 'invalid')).toBe(false);
    });

    it('should be faster than full validation for simple cases', () => {
      const startTime = Date.now();
      for (let i = 0; i < 100; i++) {
        backendMathValidator.quickValidate('2+2', '4');
      }
      const quickTime = Date.now() - startTime;

      const startTime2 = Date.now();
      for (let i = 0; i < 100; i++) {
        backendMathValidator.validateAnswer('2+2', '4');
      }
      const fullTime = Date.now() - startTime2;

      // Quick validation should generally be faster or similar
      expect(quickTime).toBeLessThanOrEqual(fullTime * 1.5);
    });
  });

  describe('normalizeExpression', () => {
    it('should normalize spacing and formatting', () => {
      // Note: normalizeExpression might be private, testing indirectly
      expect(backendMathValidator.validateAnswer('2 + 2', '2+2')).toBe(true);
      expect(backendMathValidator.validateAnswer('x * y', 'x*y')).toBe(true);
      expect(backendMathValidator.validateAnswer('sin( x )', 'sin(x)')).toBe(
        true,
      );
    });

    it('should handle different notations', () => {
      expect(backendMathValidator.validateAnswer('x*x', 'x^2')).toBe(true);
      expect(backendMathValidator.validateAnswer('sqrt(x)', 'x^0.5')).toBe(
        true,
      );
    });
  });

  describe('Performance Tests', () => {
    it('should handle complex expressions within reasonable time', () => {
      const startTime = Date.now();
      const result = backendMathValidator.validateAnswer(
        'sin(x)^2 + cos(x)^2 + log(e) + sqrt(16)',
        '1 + 1 + 4',
      );
      const endTime = Date.now();

      expect(result).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle multiple validations efficiently', () => {
      const expressions = [
        ['2+2', '4'],
        ['x^2', 'x*x'],
        ['sin(pi/2)', '1'],
        ['log(10)', '1'],
        ['sqrt(16)', '4'],
      ];

      const startTime = Date.now();
      const results = expressions.map(([student, correct]) =>
        backendMathValidator.validateAnswer(student, correct),
      );
      const endTime = Date.now();

      expect(results.every((r) => r === true)).toBe(true);
      expect(endTime - startTime).toBeLessThan(500); // Should complete within 0.5 seconds
    });
  });

  describe('Error Handling', () => {
    it('should not throw errors for malformed input', () => {
      expect(() =>
        backendMathValidator.validateAnswer('((((', '4'),
      ).not.toThrow();
      expect(() =>
        backendMathValidator.validateAnswer('2+2', '))))'),
      ).not.toThrow();
      expect(() =>
        backendMathValidator.validateAnswer('undefined', 'null'),
      ).not.toThrow();
    });

    it('should handle special characters gracefully', () => {
      expect(backendMathValidator.validateAnswer('2+2@#$', '4')).toBe(false);
      expect(backendMathValidator.validateAnswer('2+2', '4@#$')).toBe(false);
    });

    it('should handle very long expressions', () => {
      const longExpression = 'x+'.repeat(1000) + '1';
      expect(() =>
        backendMathValidator.validateAnswer(longExpression, 'x'),
      ).not.toThrow();
    });
  });
});
