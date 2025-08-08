// baselineRoutes.js
import express from 'express';
import BaselineEngine from './baselineEngine.js';
import { supabase } from '../database/supabaseClient.js';
import { backendMathValidator } from './mathValidator.js';

const router = express.Router();
const baselineSessions = new Map(); // key: userId, value: BaselineEngine

// Start baseline test
router.post('/baseline/start', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    const { data: user, error: userError } = await supabase
      .from('Users')
      .select('id, baseLineTest')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if baseline test already taken
    if (user.baseLineTest === true) {
      return res.status(403).json({ error: 'Baseline test already taken.' });
    }

    // Mark baseline test as started (immediately)
    const { error: updateError } = await supabase
      .from('Users')
      .update({ baseLineTest: true })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating baseline flag:', updateError);
      return res.status(500).json({ error: 'Failed to update test status' });
    }

    // Create test session and send first question
    const testSession = getOrCreateTestSession(userId);
    const result = await testSession.getNextQuestion();

    return res.json(result);
  } catch (err) {
    console.error('Error in /baseline/start:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});


// Submit answer and get next question or result
router.post('/answer', async (req, res) => {
  const { userId, questionId, answerText } = req.body;

  if (!userId || !questionId || !answerText) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const engine = baselineSessions.get(userId);
  if (!engine) return res.status(404).json({ error: 'No active baseline test found' });

  const { data: correctAnsData, error: ansError } = await supabase
    .from('Answers')
    .select('answer_text')
    .eq('question_id', questionId)
    .eq('isCorrect', true)
    .single();

  if (ansError || !correctAnsData) {
    return res.status(500).json({ error: 'Failed to fetch correct answer' });
  }

  const correctAnswer = correctAnsData.answer_text;
  const isCorrect = backendMathValidator.validateAnswer(answerText, correctAnswer);

  const next = await engine.nextQuestion(isCorrect);

  if (next.done) {
    // Finalised ELO -  this is the difficulty level for now, will change when elo_rating values change
    //adjust the elo_rating of the user and the boolean value to true.
    const finalElo = next.rating;
    await supabase.from('Users').update({ elo_rating: finalElo }).eq('id', userId);

    baselineSessions.delete(userId);

    return res.status(200).json({
      done: true,
      rating: finalElo,
      correctCount: engine.correctCount,
      totalQuestions: engine.questionCount,
      message: `Baseline complete. ELO rating is: ${finalElo}`,
    });
  }

  return res.status(200).json({
    done: false,
    question: next.question,
    currentLevel: next.currentLevel,
    progress: next.progress,
  });
});

// Confirm baseline test: update baseLineTest = true
// POST /baseline/confirm
app.post('/baseline/confirm', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    // Update the baseLineTest flag to true
    const { data, error } = await supabase
      .from('Users')
      .update({ baseLineTest: true })
      .eq('id', userId);

    if (error) {
      console.error('Error updating baseLineTest:', error);
      return res.status(500).json({ error: 'Database update failed' });
    }

    return res.status(200).json({ success: true, updatedUser: data });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
