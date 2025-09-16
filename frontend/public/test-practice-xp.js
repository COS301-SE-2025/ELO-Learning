// Simple test to verify practice XP calculation
// You can run this in the browser console on the end-screen

// Your sample questionsObj data
const testQuestionsObj = [
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
    },
    q_index: 1,
    answer: '12',
    isCorrect: false, // Incorrect answer
    timeElapsed: 4,
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
    },
    q_index: 2,
    answer: 'x^2 + y^2 = r^2',
    isCorrect: true, // Correct answer
    timeElapsed: 4,
  },
];

// Function to calculate practice XP (same as in component)
function calculatePracticeXP(questionsObj) {
  if (!Array.isArray(questionsObj) || questionsObj.length === 0) {
    return 0;
  }

  let totalXP = 0;

  // Process each question
  for (const questionData of questionsObj) {
    const { question, isCorrect, timeElapsed } = questionData;

    if (!question || !isCorrect) continue;

    const questionXP = question.xpGain || 0;
    let earnedXP = questionXP;

    // Time bonus (quick answers get bonus)
    if (timeElapsed <= 10) {
      earnedXP += questionXP * 0.2; // 20% bonus for fast answers
    }

    // Difficulty bonus
    const difficulty = question.difficulty?.toLowerCase();
    if (difficulty === 'hard') {
      earnedXP += questionXP * 0.3; // 30% bonus for hard questions
    } else if (difficulty === 'medium') {
      earnedXP += questionXP * 0.2; // 20% bonus for medium questions
    } else if (difficulty === 'easy') {
      earnedXP += questionXP * 0.1; // 10% bonus for easy questions
    }

    // Level bonus (higher level questions give more XP)
    const levelBonus = (question.level || 1) * 2;
    earnedXP += levelBonus;

    totalXP += Math.round(earnedXP);
  }

  // Apply practice session scaling (60% of calculated XP)
  return Math.round(totalXP * 0.6);
}

// Test the calculation
console.log('🧪 Testing Practice XP Calculation');
console.log('=================================');

const result = calculatePracticeXP(testQuestionsObj);

console.log('Test Questions:', testQuestionsObj.length);
console.log(
  'Correct Answers:',
  testQuestionsObj.filter((q) => q.isCorrect).length,
);

console.log('\nXP Breakdown for Question 2 (correct):');
console.log('- Base XP: 20');
console.log('- Time bonus (≤10s): 20 * 0.2 = 4');
console.log('- Hard difficulty bonus: 20 * 0.3 = 6');
console.log('- Level 8 bonus: 8 * 2 = 16');
console.log('- Subtotal: 20 + 4 + 6 + 16 = 46');
console.log('- After scaling (60%): 46 * 0.6 = 27.6 → 28');

console.log('\nActual Result:', result, 'XP');
console.log('Expected: ~28 XP');

// Store in localStorage for testing
localStorage.setItem('questionsObj', JSON.stringify(testQuestionsObj));
console.log('\n✅ Test data stored in localStorage as "questionsObj"');
console.log('You can now test the component on the practice end-screen!');

// Export for use
window.testPracticeXP = {
  calculate: calculatePracticeXP,
  testData: testQuestionsObj,
  result: result,
};
