/**
 * ES6 Compatible Math Validator Test Suite
 * For use with backend ES6 modules
 */

// Test class that works with both validators
export class MathValidatorTestSuite {
  constructor(validator, validatorName = 'Math Validator') {
    this.validator = validator;
    this.validatorName = validatorName;
    this.passedTests = 0;
    this.totalTests = 0;
    this.failedTests = [];
  }

  // Helper method to run a single test
  runTest(testName, studentAnswer, correctAnswer, expectedResult = true) {
    this.totalTests++;
    
    try {
      let result;
      
      // Handle different validator interfaces
      if (typeof this.validator.validateAnswer === 'function') {
        result = this.validator.validateAnswer(studentAnswer, correctAnswer);
      } else if (typeof this.validator === 'function') {
        result = this.validator(studentAnswer, correctAnswer);
      } else {
        throw new Error('Invalid validator interface');
      }
      
      if (result === expectedResult) {
        this.passedTests++;
        console.log(`✅ ${testName}: PASSED`);
        console.log(`   Student: "${studentAnswer}" | Correct: "${correctAnswer}" | Result: ${result}`);
      } else {
        this.failedTests.push({
          name: testName,
          student: studentAnswer,
          correct: correctAnswer,
          expected: expectedResult,
          actual: result
        });
        console.log(`❌ ${testName}: FAILED`);
        console.log(`   Student: "${studentAnswer}" | Correct: "${correctAnswer}"`);
        console.log(`   Expected: ${expectedResult} | Got: ${result}`);
      }
    } catch (error) {
      this.failedTests.push({
        name: testName,
        student: studentAnswer,
        correct: correctAnswer,
        expected: expectedResult,
        actual: `ERROR: ${error.message}`
      });
      console.log(`💥 ${testName}: ERROR - ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }

  // Test commutative factoring (the main fix)
  testCommutativeFactoring() {
    console.log(`\n🧪 Testing Commutative Factoring for ${this.validatorName}\n`);
    
    // Basic two-factor cases
    this.runTest(
      'Basic Commutative Factors',
      '(x-3)(x+3)',
      '(x+3)(x-3)',
      true
    );
    
    this.runTest(
      'Different Variables',
      '(a+b)(c+d)',
      '(c+d)(a+b)',
      true
    );
    
    this.runTest(
      'With Coefficients',
      '2(x+1)(x-1)',
      '(x-1)(x+1)*2',
      true
    );
    
    // Three-factor cases
    this.runTest(
      'Three Factors',
      '(a+1)(b+2)(c+3)',
      '(c+3)(a+1)(b+2)',
      true
    );
    
    // Mixed with variables
    this.runTest(
      'Variable and Factors',
      'x(x+1)(x-1)',
      '(x-1)x(x+1)',
      true
    );
    
    // Should fail cases (different expressions)
    this.runTest(
      'Different Expressions Should Fail',
      '(x+3)(x-3)',
      '(x+2)(x-2)',
      false
    );
  }

  // Test traditional algebraic equivalence
  testAlgebraicEquivalence() {
    console.log(`\n🧪 Testing Algebraic Equivalence for ${this.validatorName}\n`);
    
    // Basic algebraic equivalence
    this.runTest(
      'Basic Algebraic',
      'x^2 - 9',
      '(x+3)(x-3)',
      true
    );
    
    this.runTest(
      'Expanded vs Factored',
      '(x+3)(x-3)',
      'x^2 - 9',
      true
    );
  }

  // Test numerical equivalence
  testNumericalEquivalence() {
    console.log(`\n🧪 Testing Numerical Equivalence for ${this.validatorName}\n`);
    
    this.runTest(
      'Basic Numbers',
      '42',
      '42',
      true
    );
    
    this.runTest(
      'Mathematical Expressions',
      '2 + 2',
      '4',
      true
    );
  }

  // Run all tests
  runAllTests() {
    console.log(`\n🚀 Starting Test Suite for ${this.validatorName}\n`);
    console.log('='.repeat(60));
    
    this.testCommutativeFactoring();
    this.testAlgebraicEquivalence();
    this.testNumericalEquivalence();
    
    this.printSummary();
  }

  // Print test summary
  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log(`📊 Test Summary for ${this.validatorName}`);
    console.log('='.repeat(60));
    console.log(`Total Tests: ${this.totalTests}`);
    console.log(`Passed: ${this.passedTests}`);
    console.log(`Failed: ${this.failedTests.length}`);
    console.log(`Success Rate: ${((this.passedTests / this.totalTests) * 100).toFixed(1)}%`);
    
    if (this.failedTests.length > 0) {
      console.log('\n❌ Failed Tests:');
      this.failedTests.forEach(test => {
        console.log(`  - ${test.name}`);
        console.log(`    Student: "${test.student}" | Correct: "${test.correct}"`);
        console.log(`    Expected: ${test.expected} | Got: ${test.actual}`);
      });
    } else {
      console.log('\n🎉 All tests passed!');
    }
    
    console.log('\n' + '='.repeat(60));
  }
}

// Export for ES6 modules
export default MathValidatorTestSuite;