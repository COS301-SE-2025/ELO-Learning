// answerRoutes.js
import express from 'express';
import { supabase } from '../database/supabaseClient.js';

const router = express.Router();

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

export default router;
