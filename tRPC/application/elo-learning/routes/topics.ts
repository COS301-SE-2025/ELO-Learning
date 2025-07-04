// routes/topics.ts
import { Router, Request, Response } from 'express';
import { supabase } from '../database/supabaseClient';

const router = Router();

interface Topic {
  id: string;
  name: string;
  description?: string;
}

// GET /topics - Get all topics
router.get('/', async (req: Request, res: Response) => {
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

export default router;
