// baselineRoutes.js
import express from 'express';
import BaselineEngine from './baselineEngine.js';
import { supabase } from '../database/supabaseClient.js';
import { backendMathValidator } from './mathValidator.js';

const router = express.Router();
const baselineSessions = new Map(); // key: userId, value: BaselineEngine

// Start baseline test
router.post('/start', async (req, res) => {
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  const { data: user, error } = await supabase
    .from('Users')
    .select('elo_rating')
    .eq('id', userId)
    .single();

  if (error || !user) return res.status(404).json({ error: 'User not found' });

  if (user.elo_rating > 0) {
    return res.status(403).json({ error: 'User has already taken the baseline test' });
  }

  const engine = new BaselineEngine(userId);
  baselineSessions.set(userId, engine);

  const result = await engine.nextQuestion();
  return res.status(200).json(result);
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
    // Finalize ELO
    const finalElo = next.rating * 100;
    await supabase.from('Users').update({ elo_rating: finalElo }).eq('id', userId);

    baselineSessions.delete(userId);

    return res.status(200).json({
      done: true,
      rating: finalElo,
      correctCount: engine.correctCount,
      totalQuestions: engine.questionCount,
      message: `Baseline complete. ELO rating: ${finalElo}`,
    });
  }

  return res.status(200).json({
    done: false,
    question: next.question,
    currentLevel: next.currentLevel,
    progress: next.progress,
  });
});

export default router;
