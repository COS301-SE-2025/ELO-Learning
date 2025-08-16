// answerRoutes.js
import express from 'express';
import { supabase } from '../database/supabaseClient.js';
import { checkQuestionAchievements } from './achievementRoutes.js';

const router = express.Router();

// Return the answer to a specific question (works)
router.get('/question/:id/answer', async (req, res) => {
  const { id } = req.params;

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ error: 'You are unauthorized to make this request.' });
  }

  const { data, error } = await supabase
    .from('Answers')
    .select('*') // Ask group what we want to display, just answer or all details?
    .eq('question_id', id)
    .eq('isCorrect', true);

  if (error) {
    console.error('Error fetching answer:', error.message);
    return res.status(500).json({ error: 'Failed to fetch answer' });
  }

  if (!data || data.length === 0) {
    return res.status(404).json({ error: "Question doesn't exist" });
  }

  res.status(200).json({ answer: data });
});

// Submit answer endpoint matching frontend expectations
router.post('/question/:id/submit', async (req, res) => {
  try {
    const { id: questionId } = req.params;
    const {
      studentAnswer,
      userId,
      questionType,
      timeSpent,
      gameMode = 'practice',
      isCorrect: frontendIsCorrect,
    } = req.body;

    console.log('🎯 Submit endpoint called:', {
      questionId,
      userId,
      gameMode,
      questionType,
      timeSpent,
      frontendIsCorrect,
    });

    // Authentication check
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'You are unauthorized to make this request.',
      });
    }

    if (!userId || !questionId || !studentAnswer) {
      return res.status(400).json({
        error: 'Missing required fields: userId, questionId, studentAnswer',
      });
    }

    // Get question details and XP value
    const { data: question, error: questionError } = await supabase
      .from('Questions')
      .select('xpGain, type, questionText')
      .eq('Q_id', questionId)
      .single();

    if (questionError) {
      console.error('Error fetching question:', questionError.message);
      return res
        .status(500)
        .json({ error: 'Failed to fetch question details' });
    }

    const xpToAdd = question?.xpGain || 5; // Default 5 XP if not specified

    // Get current user XP
    const { data: user, error: userError } = await supabase
      .from('Users')
      .select('xp, currentLevel')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError.message);
      return res.status(500).json({ error: 'Failed to fetch user' });
    }

    // Calculate new XP (award XP for correct answers)
    let newXP = user?.xp || 0;
    let xpAwarded = 0;

    if (frontendIsCorrect) {
      newXP += xpToAdd;
      xpAwarded = xpToAdd;
    }

    // Update user XP
    const { data: updatedUser, error: updateError } = await supabase
      .from('Users')
      .update({ xp: newXP })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating XP:', updateError.message);
      return res.status(500).json({ error: 'Failed to update XP' });
    }

    // CHECK FOR ACHIEVEMENT UNLOCKS
    let unlockedAchievements = [];

    try {
      console.log(
        '🎯 ACHIEVEMENT DEBUG - Checking achievements for submission:',
        {
          userId,
          isCorrect: frontendIsCorrect,
          gameMode,
          questionType,
        },
      );

      // Check question-based achievements
      const questionAchievements = await checkQuestionAchievements(
        userId,
        frontendIsCorrect,
      );

      console.log('🎯 ACHIEVEMENT DEBUG - Question achievements result:', {
        count: questionAchievements?.length || 0,
        achievements: questionAchievements?.map((a) => a.name) || [],
      });

      unlockedAchievements.push(...questionAchievements);

      // Check time-based achievements if time is provided
      if (frontendIsCorrect && timeSpent && timeSpent <= 10) {
        try {
          const { checkFastSolveAchievements } = await import(
            './achievementRoutes.js'
          );
          const fastSolveAchievements = await checkFastSolveAchievements(
            userId,
            timeSpent,
            frontendIsCorrect,
          );
          unlockedAchievements.push(...fastSolveAchievements);
        } catch (importError) {
          console.log(
            'Fast solve achievements not available:',
            importError.message,
          );
        }
      }
    } catch (achievementError) {
      console.error(
        '🎯 ACHIEVEMENT DEBUG - Error checking achievements:',
        achievementError,
      );
      // Don't fail the whole request if achievements fail
    }

    console.log('🎯 FINAL ACHIEVEMENT RESULT:', {
      unlockedCount: unlockedAchievements.length,
      achievements: unlockedAchievements.map((a) => ({
        id: a.id,
        name: a.name,
      })),
    });

    // Return success response with achievement data
    return res.status(200).json({
      success: true,
      isCorrect: frontendIsCorrect,
      message: frontendIsCorrect
        ? `Great response! Your explanation demonstrates good understanding!`
        : 'Keep practicing! Every attempt helps you learn.',
      questionType: questionType || question.type,
      studentAnswer,
      xpAwarded,
      updatedUser: {
        id: updatedUser.id,
        xp: updatedUser.xp,
        currentLevel: updatedUser.currentLevel,
      },
      unlockedAchievements,
    });
  } catch (error) {
    console.error('🎯 Submit endpoint error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
});

//Return all answers to a specific question
router.get('/answers/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('Answers')
      .select('*')
      .eq('question_id', id);

    if (error) {
      console.error('Error fetching answers:', error.message);
      return res.status(500).json({ error: 'Failed to fetch answers' });
    }

    res.status(200).json({ answer: data });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

// Submit answer route with achievement integration
router.post('/submit-answer', async (req, res) => {
  const { userId, questionId, selectedAnswerId } = req.body;

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ error: 'You are unauthorized to make this request.' });
  }

  if (!userId || !questionId || !selectedAnswerId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 1. Check if the selected answer is correct
    const { data: answer, error: answerError } = await supabase
      .from('Answers')
      .select('isCorrect')
      .eq('answer_id', selectedAnswerId)
      .eq('question_id', questionId)
      .single();

    if (answerError || !answer) {
      return res
        .status(404)
        .json({ error: 'Answer not found or does not match question' });
    }

    const isCorrect = answer.isCorrect;

    if (!isCorrect) {
      return res
        .status(200)
        .json({ correct: false, message: 'Incorrect answer. No XP awarded.' });
    }

    // 2. Get XP for the question
    const { data: question, error: questionError } = await supabase
      .from('Questions')
      .select('xpGain')
      .eq('Q_id', questionId)
      .single();

    if (questionError) {
      console.error('Error fetching question XP:', questionError.message);
      return res.status(500).json({ error: 'Failed to fetch XP' });
    }

    const xpToAdd = question?.xpGain ?? 0;

    // 3. Get user XP and add to it
    const { data: user, error: userError } = await supabase
      .from('Users')
      .select('xp')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError.message);
      return res.status(500).json({ error: 'Failed to fetch user' });
    }

    const newXP = (user?.xp ?? 0) + xpToAdd;

    const { data: updatedUser, error: updateError } = await supabase
      .from('Users')
      .update({ xp: newXP })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating XP:', updateError.message);
      return res.status(500).json({ error: 'Failed to update XP' });
    }

    // 🎯 Check for achievement unlocks (NON-ELO ONLY)
    let unlockedAchievements = [];

    try {
      // Check question-based achievements only
      const questionAchievements = await checkQuestionAchievements(
        userId,
        isCorrect,
      );
      unlockedAchievements.push(...questionAchievements);
    } catch (achievementError) {
      console.error('Error checking achievements:', achievementError);
      // Don't fail the whole request if achievements fail
    }

    return res.status(200).json({
      correct: true,
      message: `Correct answer! +${xpToAdd} XP awarded.`,
      newXP: updatedUser.xp,
      unlockedAchievements: unlockedAchievements, // 🎯 Include unlocked achievements
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Unexpected server error' });
  }
});

export default router;
