const alpha = 400;

function isValidNumber(n) {
  return typeof n === 'number' && !isNaN(n);
}

export function calculateExpected(p1, p2) {
  if (!isValidNumber(p1) || !isValidNumber(p2)) {
    throw new TypeError('Both player ratings must be valid numbers');
  }

  const p1_expected = 1 / (1 + Math.pow(10, (p2 - p1) / alpha));
  const p2_expected = 1 - p1_expected;

  return [p1_expected, p2_expected];
}

// Helper function to calculate player performance score from results array
function calculatePlayerPerformance(playerResults) {
  if (!Array.isArray(playerResults) || playerResults.length === 0) {
    throw new TypeError('playerResults must be a non-empty array');
  }

  let totalScore = 0;
  let totalPossibleScore = 0;
  let correctAnswers = 0;

  playerResults.forEach((result) => {
    if (typeof result !== 'object' || result === null) {
      throw new TypeError('Each result must be an object');
    }

    const { isCorrect, question, timeElapsed } = result;

    if (typeof isCorrect !== 'boolean') {
      throw new TypeError('isCorrect must be a boolean');
    }

    if (!question || typeof question.xpGain !== 'number') {
      throw new TypeError('Each question must have a valid xpGain number');
    }

    totalPossibleScore += question.xpGain;

    if (isCorrect) {
      correctAnswers++;
      let questionScore = question.xpGain;

      // Add time bonus (optional - you can adjust or remove this)
      if (typeof timeElapsed === 'number' && timeElapsed > 0) {
        const timeBonus = Math.max(0, (30 - timeElapsed) * 0.5); // Max 15 point bonus
        questionScore += timeBonus;
      }

      totalScore += questionScore;
    }
  });

  return {
    totalScore,
    totalPossibleScore,
    correctAnswers,
    totalQuestions: playerResults.length,
    accuracy: correctAnswers / playerResults.length,
    normalizedScore: totalScore / totalPossibleScore, // 0-1 scale for comparison
  };
}

// NEW: Function to handle array-based results - returns XP for both players
export function distributeXPFromResults(
  player1Results,
  player2Results,
  player1Rating,
  player2Rating,
) {
  // Validate inputs
  if (!Array.isArray(player1Results) || !Array.isArray(player2Results)) {
    throw new TypeError('Both player results must be arrays');
  }

  if (!isValidNumber(player1Rating) || !isValidNumber(player2Rating)) {
    throw new TypeError('Both player ratings must be valid numbers');
  }

  // Calculate performance for both players
  const player1Performance = calculatePlayerPerformance(player1Results);
  const player2Performance = calculatePlayerPerformance(player2Results);

  // Calculate expected outcomes based on ratings
  const [expected1, expected2] = calculateExpected(
    player1Rating,
    player2Rating,
  );

  // Determine match result (0, 0.5, or 1)
  let matchResult1;
  if (player1Performance.normalizedScore > player2Performance.normalizedScore) {
    matchResult1 = 1; // Player 1 wins
  } else if (
    player1Performance.normalizedScore < player2Performance.normalizedScore
  ) {
    matchResult1 = 0; // Player 1 loses
  } else {
    matchResult1 = 0.5; // Draw
  }

  // Calculate total XP available from both players' questions
  const totalXP =
    player1Performance.totalPossibleScore +
    player2Performance.totalPossibleScore;

  // Use existing distributeXP function
  const [xp1, xp2] = distributeXP(totalXP, expected1, expected2, matchResult1);

  return {
    player1XP: xp1,
    player2XP: xp2,
    player1Performance: player1Performance,
    player2Performance: player2Performance,
    totalXPPool: totalXP,
    matchResult:
      matchResult1 === 1
        ? 'Player 1 Wins'
        : matchResult1 === 0
          ? 'Player 2 Wins'
          : 'Draw',
  };
}

export function distributeXP(xpTotal, expected1, expected2, score1) {
  /*
    score 1: actual match result for player 1
    1 -> P1 wins
    0 -> P2 loses
    0.5 -> draw
  */

  if (!isValidNumber(xpTotal) || xpTotal < 0) {
    throw new TypeError('xpTotal must be a non-negative number');
  }
  if (!isValidNumber(expected1) || expected1 < 0 || expected1 > 1) {
    throw new TypeError('expected1 must be a number between 0 and 1');
  }
  if (!isValidNumber(expected2) || expected2 < 0 || expected2 > 1) {
    throw new TypeError('expected2 must be a number between 0 and 1');
  }
  if (![0, 0.5, 1].includes(score1)) {
    throw new TypeError('score1 must be 0, 0.5, or 1');
  }

  const score2 = 1 - score1;

  const magnifier1 = 1 + (score1 - expected1);
  const magnifier2 = 1 + (score2 - expected2);

  const xp1 = xpTotal * magnifier1;
  const xp2 = xpTotal * magnifier2;

  /*
        Why added 1 on magnifier? (ensures no negative XP and keeps scale positive)
        If you perform better than expected, you get more than the actual XP (magnifier > 1)
        If you perform as expected, you get the exact XP (magnifier = 1)
        If you underperform, you still get XP, but less than the actual (magnifier < 1)
    */

  return [Math.round(xp1), Math.round(xp2)];
}
