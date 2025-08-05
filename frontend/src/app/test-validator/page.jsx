'use client';

import { isValidExpression, validateAnswerSync } from '@/utils/answerValidator';
import { runValidatorTests } from '@/utils/test-combined-validator';
import { useEffect, useState } from 'react';

export default function TestValidatorPage() {
  const [testResults, setTestResults] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [customTest, setCustomTest] = useState('');

  // Quick test for problematic cases
  const testProblematicCases = () => {
    const cases = [
      { student: 'x', correct: 'x=7, y=3', expected: false },
      { student: 'x=', correct: 'x=7, y=3', expected: false },
      { student: 'x=7', correct: 'x=7, y=3', expected: false },
      { student: 'x=7, y=3', correct: 'x=7, y=3', expected: true },
      { student: '(', correct: '(x + 3)(x - 3)', expected: false },
      { student: '(x-3)', correct: '(x + 3)(x - 3)', expected: false },
      { student: '(x-3)(x+3)', correct: '(x + 3)(x - 3)', expected: true },
    ];

    let output = '🧪 Testing Problematic Cases:\n\n';
    
    cases.forEach(test => {
      const result = validateAnswerSync(test.student, test.correct, '', 'Math Input');
      const isValid = isValidExpression(test.student);
      const status = result === test.expected ? '✅' : '❌';
      output += `${status} "${test.student}" vs "${test.correct}"\n`;
      output += `   Valid: ${isValid}, Result: ${result}, Expected: ${test.expected}\n\n`;
    });

    return output;
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestResults('Running tests...\n');
    
    // First test problematic cases
    let output = testProblematicCases();
    
    // Capture console output for full test suite
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args) => {
      output += args.join(' ') + '\n';
      originalLog(...args);
    };

    console.error = (...args) => {
      output += 'ERROR: ' + args.join(' ') + '\n';
      originalError(...args);
    };

    try {
      await runValidatorTests();
      setTestResults(output);
    } catch (error) {
      setTestResults(output + '\nERROR: ' + error.message);
    } finally {
      // Restore original console methods
      console.log = originalLog;
      console.error = originalError;
      setIsRunning(false);
    }
  };

  const runCustomTest = () => {
    if (!customTest.trim()) return;
    
    const [student, correct] = customTest.split(' vs ').map(s => s.trim());
    if (!student || !correct) {
      setTestResults('Format: "student answer vs correct answer"');
      return;
    }

    const result = validateAnswerSync(student, correct, '', 'Math Input');
    const isStudentValid = isValidExpression(student);
    const isCorrectValid = isValidExpression(correct);
    
    setTestResults(`Custom Test Result:
Student: "${student}" (Valid: ${isStudentValid})
Correct: "${correct}" (Valid: ${isCorrectValid})
Result: ${result}
`);
  };

  useEffect(() => {
    // Auto-run tests when page loads
    runTests();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Validator Test Results</h1>
      
      <div className="mb-4 space-x-2">
        <button
          onClick={runTests}
          disabled={isRunning}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {isRunning ? 'Running Tests...' : 'Run All Tests'}
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Custom Test:</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={customTest}
            onChange={(e) => setCustomTest(e.target.value)}
            placeholder="student answer vs correct answer"
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={runCustomTest}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Test
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Example: "x=7, y=3 vs x=7, y=3" or "x vs x=7, y=3"
        </p>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Test Output:</h2>
        <pre className="whitespace-pre-wrap text-sm font-mono bg-black text-green-400 p-4 rounded overflow-auto max-h-96">
          {testResults || 'No test results yet...'}
        </pre>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <p>This page tests the combined answer validator functionality.</p>
        <p>Check the console for additional debug information.</p>
      </div>
    </div>
  );
}
