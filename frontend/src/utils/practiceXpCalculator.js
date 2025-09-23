// Practice Session XP Calculator - Frontend Utility
// Calculates XP for practice sessions using questionsObj from localStorage

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

      // Level bonus (higher level questions give more XP)
      const levelBonus = (question.level || 1) * 2;

      // Difficulty bonus
      let difficultyMultiplier = 1;
      if (question.difficulty === 'Easy') difficultyMultiplier = 1;
      else if (question.difficulty === 'Medium') difficultyMultiplier = 1.2;
      else if (question.difficulty === 'Hard') difficultyMultiplier = 1.5;

      earnedXP = (earnedXP + timeBonus + levelBonus) * difficultyMultiplier;
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
      questionText: question.questionText,
    });
  }

  // Apply practice session scaling (more generous than competitive modes)
  const practiceScaling = 0.7; // More generous scaling for practice
  totalXP = Math.round(totalXP * practiceScaling);

  const summary = {
    totalQuestions: questionsObj.length,
    correctAnswers: totalCorrect,
    incorrectAnswers: questionsObj.length - totalCorrect,
    averageTime:
      questionsObj.length > 0 ? Math.round(totalTime / questionsObj.length) : 0,
    baseXP: baseXPSum,
    bonusXP: totalXP - Math.round(baseXPSum * practiceScaling),
    accuracy:
      questionsObj.length > 0
        ? Math.round((totalCorrect / questionsObj.length) * 100)
        : 0,
  };

  return {
    totalXP,
    questionResults,
    summary,
  };
}

/**
 * Update user's XP by calling the backend API
 * @param {string} userId - User ID
 * @param {number} xpToAdd - Amount of XP to add
 * @returns {Promise<Object>} - API response with updated user data
 */
export async function updateUserXP(userId, xpToAdd) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/xp`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          xpToAdd,
          source: 'practice',
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to update XP: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating user XP:', error);
    throw error;
  }
}

/**
 * Complete practice session - calculate XP and update user
 * @param {string} userId - User ID
 * @param {Array} questionsObj - Questions from localStorage (optional, will read from localStorage if not provided)
 * @returns {Promise<Object>} - Complete results including XP calculation and user update
 */
export async function completePracticeSession(userId, questionsObj = null) {
  try {
    // Get questions from localStorage if not provided
    const questions =
      questionsObj || JSON.parse(localStorage.getItem('questionsObj') || '[]');

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('No practice questions found in localStorage');
    }

    console.log(
      '🎯 Calculating practice session XP for',
      questions.length,
      'questions',
    );

    // Calculate XP
    const xpCalculation = calculatePracticeSessionXP(questions);

    if (xpCalculation.totalXP <= 0) {
      console.log('📊 No XP earned this session');
      return {
        success: true,
        xpEarned: 0,
        message: 'Practice session completed, but no XP earned',
        ...xpCalculation,
      };
    }

    console.log('📊 Practice session results:', {
      totalXP: xpCalculation.totalXP,
      correctAnswers: xpCalculation.summary.correctAnswers,
      accuracy: xpCalculation.summary.accuracy + '%',
    });

    // Update user's XP via API (you'll need to create this endpoint or use existing one)
    try {
      const updateResult = await updateUserXP(userId, xpCalculation.totalXP);

      return {
        success: true,
        xpEarned: xpCalculation.totalXP,
        userUpdate: updateResult,
        ...xpCalculation,
      };
    } catch (updateError) {
      console.warn('Failed to update user XP in database:', updateError);

      // Return calculation results even if database update fails
      return {
        success: true,
        xpEarned: xpCalculation.totalXP,
        warning: 'XP calculated but not saved to database',
        ...xpCalculation,
      };
    }
  } catch (error) {
    console.error('Error completing practice session:', error);
    throw error;
  }
}

// Example usage:
/*
// Basic XP calculation
const questionsFromStorage = JSON.parse(localStorage.getItem('questionsObj') || '[]');
const xpResults = calculatePracticeSessionXP(questionsFromStorage);
console.log('XP earned:', xpResults.totalXP);

// Complete practice session with user update
const userId = 'user-123';
completePracticeSession(userId)
  .then(results => {
    console.log('Practice session completed!', results);
  })
  .catch(error => {
    console.error('Failed to complete practice session:', error);
  });
*/
