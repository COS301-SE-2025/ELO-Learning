// baselineRoutes.js
import express from 'express';
import { supabase } from '../database/supabaseClient.js';

const router = express.Router();

// Submit answer and get next question or result
router.post('/baseline/answer', async (req, res) => {
  const { user_id, question_id, isCorrect, currentLevel, questionNumber } =
    req.body;

  if (!user_id || !question_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Log attempt
  await supabase.from('QuestionAttempts').insert([
    {
      user_id,
      question_id,
      isCorrect,
      attemptType: 'baseline',
      attemptDate: new Date(),
    },
  ]);

  let nextLevel = currentLevel;
  if (isCorrect) {
    nextLevel = Math.min(currentLevel + 1, 10);
  } else {
    nextLevel = Math.max(currentLevel - 1, 1);
  }

  // Check if test is done
  if (questionNumber >= 10) {
    //to be changed to 15 later
    //const finalElo = await setBaselineElo(user_id, nextLevel);
    //return res.json({ done: true, finalLevel: nextLevel , elo_rating: finalElo});
    return res.json({
      done: true,
      finalLevel: nextLevel,
      elo_rating: currentLevel,
    });
  }

  // Fetch next question
  const { data: nextQuestion } = await supabase
    .from('Questions')
    .select('*')
    .eq('level', nextLevel)
    // .limit(1)
    // .single();
    .order('RANDOM()'); //try

  res.json({
    question: nextQuestion,
    currentLevel: nextLevel,
    questionNumber: questionNumber + 1,
  });
});

// POST /baseline/skip
//we will only use this when the user chooses to skip also in the profile section
router.post('/baseline/skip', async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: 'Missing user_id' });
  }

  try {
    const { error } = await supabase
      .from('Users')
      .update({ base_line_test: true })
      .eq('id', user_id);

    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to update baseLineTest' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Confirm baseline test: update baseLineTest = true
router.post('/baseline/confirm', async (req, res) => {
  const { user_id } = req.body;

  console.log('🎯 /baseline/confirm called with user_id:', user_id);

  if (!user_id) {
    console.error('❌ Missing user_id in request body');
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    console.log('🔄 Updating base_line_test to true for user:', user_id);
    
    // Update the baseLineTest flag to true
    const { data, error } = await supabase
      .from('Users')
      .update({ base_line_test: true })
      .eq('id', user_id)
      .select('*')
      .single();

    if (error) {
      console.error('❌ Database error updating base_line_test:', error);
      return res.status(500).json({ error: 'Database update failed', details: error.message });
    }

    console.log('✅ Successfully updated base_line_test for user:', user_id);
    
    // Return the updated user data with proper field name conversion
    const updatedUser = {
      id: data.id,
      name: data.name,
      surname: data.surname,
      username: data.username,
      email: data.email,
      currentLevel: data.currentLevel,
      joinDate: data.joinDate,
      xp: data.xp,
      avatar: data.avatar,
      elo_rating: data.elo_rating,
      rank: data.rank,
      baseLineTest: data.base_line_test, // Convert snake_case to camelCase
    };
    
    return res.status(200).json({ success: true, user: updatedUser });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /baseline/questions
 * Fetch all questions for baseline test.
 */
router.get('/baseline/questions', async (req, res) => {
  try {
    // fetch all questions grouped by level
    const { data: questions, error } = await supabase.from('Questions').select(`
        Q_id,
        topic,
        difficulty,
        level,
        questionText,
        Answers (
          answer_id,
          answer_text,
          isCorrect
        )
      `);

    if (error) {
      console.error('Error fetching questions:', error);
      return res.status(500).json({ error: 'Failed to fetch questions' });
    }

    // group by level
    const byLevel = {};
    for (let q of questions) {
      if (!byLevel[q.level]) byLevel[q.level] = [];
      byLevel[q.level].push(q);
    }

    res.json({ questions: byLevel });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /baseline/complete
 * Update user's final Elo rating after baseline test.
 * Body: { user_id, elo_rating }
 */
router.post('/baseline/complete', async (req, res) => {
  const { user_id, finalElo } = req.body;

  if (!user_id || finalElo == null) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const { data, error } = await supabase
      .from('Users')
      .update({ currentLevel: finalElo, base_line_test: true })
      .eq('id', user_id)
      .select('*')
      .single();

    if (error)
      return res.status(500).json({ error: 'Failed to update user ELO' });
    
    // Return the updated user data with proper field name conversion
    const updatedUser = {
      id: data.id,
      name: data.name,
      surname: data.surname,
      username: data.username,
      email: data.email,
      currentLevel: data.currentLevel,
      joinDate: data.joinDate,
      xp: data.xp,
      avatar: data.avatar,
      elo_rating: data.elo_rating,
      rank: data.rank,
      baseLineTest: data.base_line_test, // Convert snake_case to camelCase
    };
    
    res.json({ success: true, elo_rating: finalElo, user: updatedUser });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
