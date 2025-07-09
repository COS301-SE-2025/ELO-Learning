// routes/users.ts - FIXED to match frontend expectations
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
  name: string;           // Changed from achievement_name
  description: string;    // Changed from achievement_description
  date_earned?: string;
}

// GET /users - FIXED: Return User[] directly (not wrapped)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('Users')
      .select('id,name,surname,username,email,currentLevel,joinDate,xp');

    if (error) {
      console.error('Error fetching users:', error.message);
      res.status(500).json({ error: 'Failed to fetch users' });
      return;
    }

    // FIXED: Return array directly, not wrapped in object
    res.status(200).json(data || []);
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

// GET /user/:id - FIXED: Return User object directly
router.get('/user/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('Users')
      .select('id,name,surname,username,email,currentLevel,joinDate,xp')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        res.status(404).json({ error: "User doesn't exist" });
        return;
      }
      console.error('Error fetching user:', error.message);
      res.status(500).json({ error: 'Failed to fetch user' });
      return;
    }

    // FIXED: Return user object directly, not wrapped
    res.status(200).json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

// GET /users/:id/achievements - FIXED: Return Achievement[] directly
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
        res.status(500).json({ error: 'Failed to fetch achievements' });
        return;
      }

      // Transform the data to match expected Achievement interface
      const transformedAchievements = (data || []).map(item => ({
        id: item.id,
        name: item.achievement_name || item.name,           // Handle both field names
        description: item.achievement_description || item.description,
        date_earned: item.date_earned
      }));

      // FIXED: Return array directly, not wrapped in { achievements: ... }
      res.status(200).json(transformedAchievements);
    } catch (err) {
      console.error('Unexpected error:', err);
      res.status(500).json({ error: 'Unexpected server error' });
    }
  },
);

// POST /user/:id/xp - FIXED: Return ApiResponse format with success property
router.post('/user/:id/xp', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { xp }: { xp: number } = req.body;

    if (typeof xp !== 'number') {
      res.status(400).json({ error: 'XP must be a number.' });
      return;
    }

    // First get current user data
    const { data: currentUser, error: fetchError } = await supabase
      .from('Users')
      .select('xp, name, surname, username')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        res.status(404).json({ error: "User doesn't exist" });
        return;
      }
      console.error('Error fetching user:', fetchError.message);
      res.status(500).json({ error: 'Failed to fetch user' });
      return;
    }

    // Add XP to current XP (not replace)
    const newXP = (currentUser.xp || 0) + xp;

    const { data, error } = await supabase
      .from('Users')
      .update({ xp: newXP })
      .eq('id', id)
      .select('id, name, surname, username, xp')
      .single();

    if (error) {
      console.error('Error updating XP:', error.message);
      res.status(500).json({ error: 'Failed to update XP' });
      return;
    }

    // FIXED: Return ApiResponse format with required success property
    res.status(200).json({
      success: true,
      data: data,
      message: `Successfully added ${xp} XP. Total XP: ${newXP}`
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

export default router;