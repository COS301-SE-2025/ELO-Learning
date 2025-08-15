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