// Test the practice XP calculation with your sample data
// Run this in browser console or create a test page

import { calculatePracticeSessionXP } from '../utils/practiceXP.js';

// Your sample questionsObj
const sampleQuestionsObj = [
  {
    question: {
      Q_id: 86,
      topic: 'Geometry',
      difficulty: 'Hard',
      level: 8,
      questionText:
        'A cone has a base radius of 4 cm and a height of 9 cm. Find its volume. Use π = 3.14.',
      xpGain: 20,
      type: 'Math Input',
      answers: [
        {
          answer_id: 204,
          question_id: 86,
          answer_text: '150.72',
          isCorrect: true,
        },
      ],
    },
    q_index: 1,
    answer: '12',
    isCorrect: false,
    actualAnswer: {
      answer_id: 204,
      question_id: 86,
      answer_text: '150.72',
      isCorrect: true,
    },
    timeElapsed: 4,
    totalSessionTime: 4,
  },
  {
    question: {
      Q_id: 142,
      topic: 'Geometry',
      difficulty: 'Hard',
      level: 8,
      questionText:
        'Write the equation of a circle with centre (0,0) and radius r.',
      xpGain: 20,
      type: 'Expression Builder',
      answers: [
        {
          answer_id: 264,
          question_id: 142,
          answer_text: 'x^2 + y^2 = r^2',
          isCorrect: true,
        },
      ],
    },
    q_index: 2,
    answer: 'x^2 + y^2 = r^2',
    isCorrect: true,
    actualAnswer: {
      answer_id: 264,
      question_id: 142,
      answer_text: 'x^2 + y^2 = r^2',
      isCorrect: true,
    },
    timeElapsed: 4,
    totalSessionTime: 8,
  },
];

console.log('🧪 Testing Practice XP Calculation');
console.log('==========================================');

// Test the calculation
const result = calculatePracticeSessionXP(sampleQuestionsObj);

console.log('\n📊 Results:');
console.log('Total XP Earned:', result.totalXP);

console.log('\n📈 Summary:');
console.log(JSON.stringify(result.summary, null, 2));

console.log('\n📝 Question Results:');
result.questionResults.forEach((q, index) => {
  console.log(`Question ${index + 1}:`, {
    questionId: q.questionId,
    isCorrect: q.isCorrect,
    baseXP: q.baseXP,
    earnedXP: q.earnedXP,
    timeElapsed: q.timeElapsed,
    difficulty: q.difficulty,
    level: q.level,
  });
});

console.log('\n🎯 Expected behavior:');
console.log('- Question 1 (incorrect): 0 XP');
console.log(
  '- Question 2 (correct): Base 20 XP + time bonus + difficulty bonus + level bonus, then scaled by 0.6',
);
console.log('- Only correct answers should earn XP');
console.log('- Fast answers (≤10s) get 20% time bonus');
console.log('- Hard difficulty gets 30% bonus');
console.log('- Level 8 gets 16 point bonus');

// Test with localStorage simulation
console.log('\n💾 Testing localStorage integration:');
// Simulate storing in localStorage
localStorage.setItem('questionsObj', JSON.stringify(sampleQuestionsObj));

// Import and test the localStorage function
import { getPracticeSessionXP } from '../utils/practiceXP.js';
const localStorageResult = getPracticeSessionXP();
console.log('localStorage result:', localStorageResult);

export { localStorageResult, result };
