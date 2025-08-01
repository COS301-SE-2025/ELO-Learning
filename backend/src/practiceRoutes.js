// practiceRoutes.js
import express from 'express';
import { supabase } from '../database/supabaseClient.js';

const router = express.Router();

//return 10 questions for practice
//also get all the answers for those questions
router.get('/practice', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Questions')
      .select('*')
      .limit(10);

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

    if (error) {
      console.error('Error fetching practice questions:', error.message);
      return res
        .status(500)
        .json({ error: 'Failed to fetch practice questions' });
    }

    res.status(200).json({ questions: data });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

// Get practice questions by type
router.get('/practice/type/:questionType', async (req, res) => {
  try {
    const { questionType } = req.params;

    const { data, error } = await supabase
      .from('Questions')
      .select('*')
      .eq('type', questionType)
      .limit(10);

    if (error) {
      console.error('Error fetching questions by type:', error.message);
      return res
        .status(500)
        .json({ error: 'Failed to fetch questions by type' });
    }

    // Get answers for each question
    for (const question of data) {
      const { data: answers, error: answerError } = await supabase
        .from('Answers')
        .select('*')
        .eq('question_id', question.Q_id);

      if (answerError) {
        console.error('Error fetching answers:', answerError.message);
        return res.status(500).json({ error: 'Failed to fetch answers' });
      }

      question.answers = answers;
    }

    res.status(200).json({ questions: data });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

export default router;
