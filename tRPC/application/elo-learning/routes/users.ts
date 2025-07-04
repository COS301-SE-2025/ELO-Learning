// routes/users.ts
import { Router, Request, Response } from 'express';
import { supabase } from '../database/supabaseClient';
import { authMiddleware } from '../middleware/auth';

const router = Router();

interface UserResponse {
  id: string;
  name: string;
  surname: string;
  username: string;
  email: string;
  currentLevel: number;
  joinDate: string;
  xp: number;
  pfpURL?: string;
}

interface Achievement {
  id: string;
  user_id: string;
  achievement_name: string;
  achievement_description: string;
  date_earned: string;
}

// GET /users - Get all users
router.get('/', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('Users')
      .select('id,name,surname,username,email,currentLevel,joinDate,xp');

    if (error) {
      console.error('Error fetching users:', error.message);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

// GET /user/:id - Get specific user
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('Users')
      .select('id,name,surname,username,email,currentLevel,joinDate,xp')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: "User doesn't exist" });
      }
      console.error('Error fetching user:', error.message);
      return res.status(500).json({ error: 'Failed to fetch user' });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

// GET /users/:id/achievements - Get user achievements
router.get(
  '/:id/achievements',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from('Achievements')
        .select('*')
        .eq('user_id', id);

      if (error) {
        console.error('Error fetching achievements:', error.message);
        return res.status(500).json({ error: 'Failed to fetch achievements' });
      }

      if (data.length === 0) {
        return res
          .status(404)
          .json({ error: "User doesn't exist or has no achievements" });
      }

      res.status(200).json({ achievements: data });
    } catch (err) {
      console.error('Unexpected error:', err);
      res.status(500).json({ error: 'Unexpected server error' });
    }
  },
);

// POST /user/:id/xp - Update user XP
router.post('/:id/xp', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { xp }: { xp: number } = req.body;

    if (typeof xp !== 'number') {
      return res.status(400).json({ error: 'XP must be a number.' });
    }

    const { data, error } = await supabase
      .from('Users')
      .update({ xp })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: "User doesn't exist" });
      }
      console.error('Error updating XP:', error.message);
      return res.status(500).json({ error: 'Failed to update XP' });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

export default router;
