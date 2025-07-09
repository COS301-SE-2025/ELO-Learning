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
  currentLevel: number;  // Added this to match frontend
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

// POST /register - FIXED to return RegisterResponse format
router.post('/register', async (req: Request, res: Response) => {
  try {
    const {
      name,
      surname,
      username,
      email,
      password,
      currentLevel,  // Added this
      joinDate,
    }: RegisterRequest = req.body;

    if (!name || !surname || !username || !email || !password) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('Users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (fetchError) {
      console.error('Error checking existing user:', fetchError.message);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    if (existingUser) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const safeCurrentLevel = currentLevel || 5;  // Use provided currentLevel
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
      res.status(500).json({ error: 'Failed to register user' });
      return;
    }

    if (!process.env.JWT_SECRET) {
      res.status(500).json({ error: 'JWT secret not configured' });
      return;
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

    // FIXED: Return the exact format your frontend expects
    res.status(201).json({
      success: true,           // Added success property
      user: userResponse,      // User object
      token,                   // Token
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

// POST /login - FIXED to return LoginResponse format
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginRequest = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
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
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    if (!process.env.JWT_SECRET) {
      res.status(500).json({ error: 'JWT secret not configured' });
      return;
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

    // FIXED: Return the exact format the frontend expects
    res.status(200).json({
      token,              // Token first
      user: userResponse, // User object second
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

export default router;