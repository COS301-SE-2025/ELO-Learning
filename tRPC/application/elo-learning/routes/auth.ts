// routes/auth.ts
import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../database/supabaseClient';

const router = Router();

interface RegisterRequest {
  name: string;
  surname: string;
  username: string;
  email: string;
  password: string;
  joinDate?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface UserData {
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

// POST /register - Register new user
router.post(
  '/register',
  async (req: Request<{}, {}, RegisterRequest>, res: Response) => {
    try {
      const { name, surname, username, email, password, joinDate } = req.body;

      if (!name || !surname || !username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      // Check if user already exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('Users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (fetchError) {
        console.error('Error checking existing user:', fetchError.message);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (existingUser) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const safeCurrentLevel = 5;
      const safeJoinDate = joinDate || new Date().toISOString();
      const safeXP = 1000;

      const { data, error } = await supabase
        .from('Users')
        .insert([
          {
            name,
            surname,
            username,
            email,
            password: hashedPassword,
            currentLevel: safeCurrentLevel,
            joinDate: safeJoinDate,
            xp: safeXP,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error registering user:', error.message);
        return res.status(500).json({ error: 'Failed to register user' });
      }

      if (!process.env.JWT_SECRET) {
        return res.status(500).json({ error: 'JWT secret not configured' });
      }

      const token = jwt.sign(
        { id: data.id, email: data.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' },
      );

      const userResponse: UserData = {
        id: data.id,
        name: data.name,
        surname: data.surname,
        username: data.username,
        email: data.email,
        currentLevel: data.currentLevel,
        joinDate: data.joinDate,
        xp: data.xp,
      };

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: userResponse,
      });
    } catch (err) {
      console.error('Unexpected error:', err);
      res.status(500).json({ error: 'Unexpected server error' });
    }
  },
);

// POST /login - Login user
router.post(
  '/login',
  async (req: Request<{}, {}, LoginRequest>, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ error: 'Email and password are required' });
      }

      // Fetch user by email
      const { data: user, error: fetchError } = await supabase
        .from('Users')
        .select(
          'id,name,surname,username,email,password,currentLevel,joinDate,xp,pfpURL',
        )
        .eq('email', email)
        .single();

      if (fetchError || !user) {
        console.error('Error fetching user:', fetchError?.message);
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      if (!process.env.JWT_SECRET) {
        return res.status(500).json({ error: 'JWT secret not configured' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' },
      );

      const userResponse: UserData = {
        id: user.id,
        name: user.name,
        surname: user.surname,
        username: user.username,
        email: user.email,
        currentLevel: user.currentLevel || 5,
        joinDate: user.joinDate || new Date().toISOString(),
        xp: user.xp || 0,
        pfpURL: user.pfpURL,
      };

      res.status(200).json({
        message: 'Login successful',
        token,
        user: userResponse,
      });
    } catch (err) {
      console.error('Unexpected error:', err);
      res.status(500).json({ error: 'Unexpected server error' });
    }
  },
);

export default router;
