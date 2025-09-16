// Practice XP Calculator - Frontend utility
// Calculates XP from practice sessions and updates user's total XP

/**
 * Calculate XP for practice sessions based on questions answered
 * @param {Array} questionsObj - Array of question objects from localStorage
 * @returns {Object} - Calculated XP breakdown and totals
 */
export function calculatePracticeSessionXP(questionsObj) {
  if (!Array.isArray(questionsObj) || questionsObj.length === 0) {
    return {
      totalXP: 0,
      questionResults: [],
      summary: {
        totalQuestions: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        averageTime: 0,
        baseXP: 0,
        bonusXP: 0,
      },
    };
  }

  let totalXP = 0;
  const questionResults = [];
  let totalCorrect = 0;
  let totalTime = 0;
  let baseXPSum = 0;

  // Process each question
  for (const questionData of questionsObj) {
    const { question, isCorrect, timeElapsed, answer } = questionData;

    if (!question) continue;

    const questionXP = question.xpGain || 0;
    let earnedXP = 0;

    if (isCorrect) {
      // Base XP for correct answer
      earnedXP = questionXP;

      // Time bonus (quick answers get bonus)
      const timeBonus = timeElapsed <= 10 ? questionXP * 0.2 : 0;

      // Difficulty bonus
      const difficultyMultiplier = getDifficultyMultiplier(question.difficulty);
      const difficultyBonus = questionXP * difficultyMultiplier;

      // Level bonus (higher level questions give more XP)
      const levelBonus = (question.level || 1) * 2;

      earnedXP += timeBonus + difficultyBonus + levelBonus;
      totalCorrect++;
      baseXPSum += questionXP;
    }

    // Round and add to total
    earnedXP = Math.round(earnedXP);
    totalXP += earnedXP;
    totalTime += timeElapsed || 0;

    questionResults.push({
      questionId: question.Q_id || question.id,
      isCorrect,
      baseXP: questionXP,
      earnedXP,
      timeElapsed,
      difficulty: question.difficulty,
      level: question.level,
      topic: question.topic,
    });
  }

  // Apply practice session scaling (more generous than competitive modes)
  const practiceScaling = 0.6;
  const scaledTotalXP = Math.round(totalXP * practiceScaling);

  const summary = {
    totalQuestions: questionsObj.length,
    correctAnswers: totalCorrect,
    incorrectAnswers: questionsObj.length - totalCorrect,
    averageTime:
      questionsObj.length > 0 ? Math.round(totalTime / questionsObj.length) : 0,
    baseXP: baseXPSum,
    bonusXP: scaledTotalXP - Math.round(baseXPSum * practiceScaling),
    accuracy:
      questionsObj.length > 0
        ? Math.round((totalCorrect / questionsObj.length) * 100)
        : 0,
  };

  return {
    totalXP: scaledTotalXP,
    questionResults,
    summary,
  };
}

/**
 * Get difficulty multiplier for XP calculation
 * @param {string} difficulty - Question difficulty (Easy, Medium, Hard)
 * @returns {number} - Multiplier value
 */
function getDifficultyMultiplier(difficulty) {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
      return 0.1;
    case 'medium':
      return 0.2;
    case 'hard':
      return 0.3;
    default:
      return 0.1;
  }
}

/**
 * Submit practice session XP and update user's total XP
 * @param {string} userId - User ID
 * @param {Array} questionsObj - Questions from localStorage
 * @param {number} currentUserXP - Current user XP total
 * @returns {Promise<Object>} - Result with XP earned and new total
 */
export async function submitPracticeSessionXP(
  userId,
  questionsObj,
  currentUserXP,
) {
  try {
    // Calculate XP from practice session
    const xpCalculation = calculatePracticeSessionXP(questionsObj);
    const { totalXP: xpEarned, summary, questionResults } = xpCalculation;

    if (xpEarned <= 0) {
      return {
        success: true,
        xpEarned: 0,
        newTotalXP: currentUserXP,
        message: 'Practice session completed, but no XP earned',
        summary,
        questionResults,
      };
    }

    // Calculate new total XP
    const newTotalXP = currentUserXP + xpEarned;

    // Update user's XP using existing endpoint
    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    const response = await fetch(`${API_BASE_URL}/user/${userId}/xp`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        xp: newTotalXP,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update XP: ${response.status}`);
    }

    const result = await response.json();

    console.log(
      `✅ Practice XP updated: +${xpEarned} XP (Total: ${newTotalXP})`,
    );

    return {
      success: true,
      xpEarned,
      previousXP: currentUserXP,
      newTotalXP,
      summary,
      questionResults,
      message: `Great practice session! You earned ${xpEarned} XP!`,
    };
  } catch (error) {
    console.error('Error submitting practice XP:', error);
    return {
      success: false,
      error: error.message,
      xpEarned: 0,
      newTotalXP: currentUserXP,
    };
  }
}

/**
 * Get practice session data from localStorage and calculate XP
 * @returns {Object} - XP calculation result
 */
export function getPracticeSessionXP() {
  try {
    const questionsObj = JSON.parse(localStorage.getItem('questionsObj')) || [];
    return calculatePracticeSessionXP(questionsObj);
  } catch (error) {
    console.error('Error getting practice session data:', error);
    return {
      totalXP: 0,
      questionResults: [],
      summary: {
        totalQuestions: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        averageTime: 0,
        baseXP: 0,
        bonusXP: 0,
        accuracy: 0,
      },
    };
  }
}
