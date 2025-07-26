// test-api-endpoint.js
const axios = require('axios'); // or use fetch

async function testAPIEndpoint() {
  const baseURL = 'http://localhost:3000'; // Your server URL
  
  console.log('🧪 Testing API Endpoint Validation\n');
  
  const testCases = [
    {
      name: 'Commutative Factoring',
      studentAnswer: '(x-3)(x+3)',
      correctAnswer: '(x+3)(x-3)',
      expected: true
    },
    {
      name: 'Different Variables',
      studentAnswer: '(a+b)(c+d)',
      correctAnswer: '(c+d)(a+b)',
      expected: true
    },
    {
      name: 'Should Fail',
      studentAnswer: '(x+3)(x-3)',
      correctAnswer: '(x+2)(x-2)',
      expected: false
    }
  ];
  
  for (const testCase of testCases) {
    try {
      const response = await axios.post(`${baseURL}/validate-answer`, {
        studentAnswer: testCase.studentAnswer,
        correctAnswer: testCase.correctAnswer
      });
      
      const isCorrect = response.data.isCorrect;
      const passed = isCorrect === testCase.expected;
      
      console.log(`${testCase.name}: ${passed ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`  Student: "${testCase.studentAnswer}"`);
      console.log(`  Correct: "${testCase.correctAnswer}"`);
      console.log(`  Expected: ${testCase.expected}, Got: ${isCorrect}\n`);
      
    } catch (error) {
      console.log(`❌ API Error for ${testCase.name}:`, error.message);
    }
  }
}

// Run API tests
testAPIEndpoint();