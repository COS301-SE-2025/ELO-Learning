// questionRoutes.js
import express from 'express';
import { supabase } from '../database/supabaseClient.js';
import { backendMathValidator } from './mathValidator.js';

const router = express.Router();

// Return all questions: (works)
router.get('/questions', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Questions')
      .select('Q_id, topic, difficulty, level, questionText, xpGain');

    if (error) {
      console.error('Error fetching questions:', error.message);
      return res.status(500).json({ error: 'Failed to fetch questions' });
    }

    res.status(200).json({ questions: data });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

// Return specific question by ID (ADD THIS NEW ROUTE)
router.get('/questionsById/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('Questions')
      .select('*')
      .eq('Q_id', id)
      .single();

    if (error) {
      console.error('Error fetching question:', error.message);
      return res.status(500).json({ error: 'Failed to fetch question' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.status(200).json({ question: data });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

// Return all questions for given level: (works)
router.get('/question/:level', async (req, res) => {
  const { level } = req.params;

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ error: 'You are unauthorized to make this request.' });
  }

  const { data, error } = await supabase
    .from('Questions')
    .select('Q_id, topic, difficulty, level, questionText, xpGain')
    .eq('level', level);

  if (error) {
    console.error('Error fetching questions:', error.message);
    return res.status(500).json({ error: 'Failed to fetch questions' });
  }

  if (!data || data.length === 0) {
    return res.status(404).json({ error: "Level doesn't exist" });
  }

  res.status(200).json({ questions: data });
});

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

// Return all questions for a specific topic: (works)
router.get('/questions/topic', async (req, res) => {
  const { topic } = req.query;

  if (!topic) {
    return res.status(400).json({ error: 'Missing topic parameter' });
  }

  const { data, error } = await supabase
    .from('Questions')
    .select('Q_id, topic, difficulty, level, questionText, xpGain, type')
    .eq('topic', topic);

  if (error) {
    console.error('Error fetching questions by topic:', error.message);
    return res.status(500).json({ error: 'Failed to fetch questions' });
  }

  res.status(200).json({ questions: data });
});

// Return questions filtered by level and topic: (works)
router.get('/questions/level/topic', async (req, res) => {
  const { level, topic } = req.query;

  if (!level || !topic) {
    return res.status(400).json({ error: 'Missing level or topic parameter' });
  }

  const { data, error } = await supabase
    .from('Questions')
    .select('Q_id, topic, difficulty, level, questionText, xpGain, type')
    .eq('level', level)
    .eq('topic_id', topic);
  if (data) {
    for (const question of data) {
      const { data, error } = await supabase
        .from('Answers')
        .select('*')
        .eq('question_id', question.Q_id);
      if (error) {
        console.error(
          'Error fetching practice questions:',
          error.message,
          question,
        );
        return res
          .status(500)
          .json({ error: 'Failed to fetch practice questions' });
      }
      question.answers = data;
    }
  }

  if (error) {
    console.error(
      'Error fetching questions by level and topic:',
      error.message,
    );
    return res.status(500).json({ error: 'Failed to fetch questions' });
  }

  res.status(200).json({ questions: data });
});

// Get all topics
router.get('/topics', async (req, res) => {
  try {
    const { data, error } = await supabase.from('Topics').select('*');

    if (error) {
      console.error('Error fetching topics:', error.message);
      return res.status(500).json({ error: 'Failed to fetch topics' });
    }

    res.status(200).json({ topics: data });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

// Get random questions for a specific level
router.get('/questions/random', async (req, res) => {
  try {
    const level = req.query.level;
    if (!level) {
      return res.status(400).json({ error: 'level is required' });
    }

    // Fetch 15 random questions for this level
    const { data: questions, error: qError } = await supabase
      .from('Questions')
      .select('*')
      .eq('level', level);

    if (qError) {
      //console.log(qError);
      return res
        .status(500)
        .json({ error: 'Failed to fetch questions', details: qError.message });
    }

    if (!questions || questions.length === 0) {
      return res
        .status(404)
        .json({ error: 'No questions found for this level' });
    }

    //shuffle and pick 15
    const shuffled = questions.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);

    //fetch the answers for the above questions
    const questionIds = selected.map((q) => q.Q_id);
    const { data: answers, error: aError } = await supabase
      .from('Answers')
      .select('*')
      .in('question_id', questionIds);
    if (aError) {
      console.log('Database error:', aError);
      return res.status(500).json({ error: 'Failed to fetch answers' });
    }

    // Map answers to respective questions in the selected array
    selected.forEach((q) => {
      q.answers = answers.filter((a) => a.question_id === q.Q_id);
    });

    return res.status(200).json({ questions: selected });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Submit and validate answer for a specific question
router.post('/question/:id/submit', async (req, res) => {
  const { id } = req.params;
  const { studentAnswer, userId } = req.body;

  try {
    // Fetch the correct answer from database
    const { data: correctAnswerData, error: answerError } = await supabase
      .from('Answers')
      .select('answer_text')
      .eq('question_id', id)
      .eq('isCorrect', true)
      .single();

    if (answerError || !correctAnswerData) {
      return res
        .status(404)
        .json({ error: 'Question or correct answer not found' });
    }

    const correctAnswer = correctAnswerData.answerText;
    const isCorrect = backendMathValidator.validateAnswer(
      studentAnswer,
      correctAnswer,
    );

    // If correct and userId provided, award XP
    let updatedUser = null;
    if (isCorrect && userId) {
      // Fetch question XP value
      const { data: questionData, error: questionError } = await supabase
        .from('Questions')
        .select('xpGain')
        .eq('Q_id', id)
        .single();

      if (!questionError && questionData) {
        // Update user XP
        const { data: currentUser, error: userError } = await supabase
          .from('Users')
          .select('xp')
          .eq('id', userId)
          .single();

        if (!userError && currentUser) {
          const newXp = (currentUser.xp || 0) + questionData.xpGain;

          const { data: updated, error: updateError } = await supabase
            .from('Users')
            .update({ xp: newXp })
            .eq('id', userId)
            .select('id, xp')
            .single();

          if (!updateError) {
            updatedUser = updated;
          }
        }
      }
    }

    res.status(200).json({
      isCorrect,
      studentAnswer,
      correctAnswer,
      message: isCorrect ? 'Correct! Well done!' : 'Incorrect. Try again!',
      xpAwarded:
        isCorrect && updatedUser
          ? updatedUser.xp - (updatedUser.xp - (questionData?.xpGain || 0))
          : 0,
      updatedUser,
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

export default router;
