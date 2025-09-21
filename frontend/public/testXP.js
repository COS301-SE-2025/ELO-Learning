// Quick test function to manually calculate practice XP
// You can call this in browser console: testPracticeXP()

window.testPracticeXP = function () {
  console.log('🧪 Testing Practice XP Calculation...');

  // Get questions from localStorage
  const questionsData = localStorage.getItem('questionsObj');
  if (!questionsData) {
    console.log('❌ No questionsObj found in localStorage');
    return;
  }

  const questions = JSON.parse(questionsData);
  console.log('📝 Found questions:', questions.length);

  let totalXP = 0;
  const results = [];

  // Process each question
  for (const questionData of questions) {
    const { question, isCorrect, timeElapsed } = questionData;

    if (!question) {
      console.log('⚠️ Skipping question with no data');
      continue;
    }

    const questionXP = question.xpGain || 0;
    let earnedXP = 0;

    if (isCorrect) {
      earnedXP = questionXP;

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

      earnedXP = Math.round(earnedXP);
    }

    totalXP += earnedXP;

    results.push({
      questionId: question.Q_id || question.id,
      isCorrect,
      baseXP: questionXP,
      earnedXP,
      timeElapsed,
      difficulty: question.difficulty,
      level: question.level,
    });

    console.log(
      `Question ${question.Q_id}: ${
        isCorrect ? 'Correct' : 'Incorrect'
      } → ${earnedXP} XP`,
    );
  }

  // Apply practice session scaling (60% of calculated XP)
  const scaledXP = Math.round(totalXP * 0.6);

  console.log('📊 Results:');
  console.log(`Raw XP: ${totalXP}`);
  console.log(`Scaled XP (60%): ${scaledXP}`);
  console.log(
    `Correct answers: ${results.filter((r) => r.isCorrect).length}/${
      results.length
    }`,
  );

  return {
    rawXP: totalXP,
    scaledXP: scaledXP,
    results: results,
  };
};

console.log(
  '🧪 Test function loaded! Run testPracticeXP() in console to test XP calculation.',
);
