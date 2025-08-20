// userRoutes.js
import bcrypt from 'bcrypt';
import express from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../database/supabaseClient.js';
import { verifyToken } from './middleware/auth.js';

const router = express.Router();
const TOKEN_EXPIRY = 3600; // 1 hour in seconds

// GET /users Endpoint: works.
router.get('/users', async (req, res) => {
  const { data, error } = await supabase
    .from('Users')
    .select(
      'id,name,surname,username,email,currentLevel,joinDate,xp,avatar,elo_rating,rank,base_line_test',
    );
  if (error) {
    console.error('Error fetching users:', error.message);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
  res.status(200).json(data);
});

// Return specific user: (works)
router.get('/user/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  // Fetch user from Supabase
  const { data, error } = await supabase
    .from('Users')
    .select(
      'id,name,surname,username,email,currentLevel,joinDate,xp,avatar,elo_rating,rank,base_line_test',
    )
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
});

router.get('/users/rank/:rank', async (req, res) => {
  const { rank } = req.params;
  // Fetch users by rank from Supabase
  const { data, error } = await supabase
    .from('Users')
    .select('id,username,xp,avatar,elo_rating,rank')
    .eq('rank', rank);
  if (error) {
    console.error('Error fetching users by rank:', error.message);
    return res.status(500).json({ error: 'Failed to fetch users by rank' });
  }
  if (data.length === 0) {
    return res.status(404).json({ error: 'No users found with that rank' });
  }
  res.status(200).json(data);
});

router.get('/users/rank/:rank', async (req, res) => {
  const { rank } = req.params;
  // Fetch users by rank from Supabase
  const { data, error } = await supabase
    .from('Users')
    .select('id,username,xp,avatar,elo_rating,rank')
    .eq('rank', rank);
  if (error) {
    console.error('Error fetching users by rank:', error.message);
    return res.status(500).json({ error: 'Failed to fetch users by rank' });
  }
  if (data.length === 0) {
    return res.status(404).json({ error: 'No users found with that rank' });
  }
  res.status(200).json(data);
});

// Return user's achievements: (using proper junction table)
router.get('/users/:id/achievements', verifyToken, async (req, res) => {
  const { id } = req.params;

  // Use the proper junction table approach
  const { data, error } = await supabase
    .from('UserAchievements')
    .select(
      `
      unlocked_at,
      Achievements (
        id,
        name,
        description,
        condition_type,
        condition_value,
        icon_path,
        AchievementCategories (
          name
        )
      )
    `,
    )
    .eq('user_id', id)
    .order('unlocked_at', { ascending: false });

  if (error) {
    console.error('Error fetching users by rank:', error.message);
    return res.status(500).json({ error: 'Failed to fetch users by rank' });
  }

  // Format the response to match expected structure
  const formattedAchievements = (data || []).map((ua) => ({
    id: ua.Achievements.id,
    name: ua.Achievements.name,
    description: ua.Achievements.description,
    condition_type: ua.Achievements.condition_type,
    condition_value: ua.Achievements.condition_value,
    icon_path: ua.Achievements.icon_path,
    category: ua.Achievements.AchievementCategories?.name || 'General',
    unlocked_at: ua.unlocked_at,
  }));

  if (formattedAchievements.length === 0) {
    return res.status(200).json({
      achievements: [],
      message: 'User has no achievements yet',
    });
  }

  res.status(200).json({ achievements: formattedAchievements });
});

// Update a user's XP: (works)
router.post('/user/:id/xp', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { xp } = req.body;

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
});

// Update a user's avatar
router.post('/user/:id/avatar', async (req, res) => {
  const { id } = req.params;
  const { avatar } = req.body;

  const { data, error } = await supabase
    .from('Users')
    .update({ avatar })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({ error: "User doesn't exist" });
    }
    console.error('Error updating AVATAR:', error.message);
    return res.status(500).json({ error: 'Failed to update AVATAR' });
  }

  res.status(200).json(data);
});

// Update a user's avatar
router.post('/user/:id/avatar', async (req, res) => {
  const { id } = req.params;
  const { avatar } = req.body;

  const { data, error } = await supabase
    .from('Users')
    .update({ avatar })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({ error: "User doesn't exist" });
    }
    console.error('Error updating AVATAR:', error.message);
    return res.status(500).json({ error: 'Failed to update AVATAR' });
  }

  res.status(200).json(data);
});

// Register new user
router.post('/register', async (req, res) => {
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
  const DEFAULT_AVATAR = {
    eyes: 'Eye 1',
    mouth: 'Mouth 1',
    bodyShape: 'Circle',
    background: 'solid-pink',
  };
  const eloRating = 100;
  const defaultRank = 'Iron';

  const startBase = false;

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
        base_line_test: startBase,
        avatar: DEFAULT_AVATAR,
        elo_rating: eloRating,
        rank: defaultRank,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error registering user:', error.message);
    return res.status(500).json({ error: 'Failed to register user' });
  }

  const token = jwt.sign(
    { id: data.id, email: data.email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' },
  );

  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: {
      id: data.id,
      name: data.name,
      surname: data.surname,
      username: data.username,
      email: data.email,
      currentLevel: data.currentLevel,
      joinDate: data.joinDate,
      xp: data.xp,
      baseLineTest: data.base_line_test,
      avatar: data.avatar,
      elo_rating: data.elo_rating,
      rank: data.rank,
    },
  });
});

// Login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Fetch user by email
  const { data: user, error: fetchError } = await supabase
    .from('Users')
    .select(
      'id,name,surname,username,email,password,currentLevel,joinDate,xp,avatar,elo_rating,rank,base_line_test',
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

  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' },
  );

  res.status(200).json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      name: user.name,
      surname: user.surname,
      username: user.username,
      email: user.email,
      currentLevel: user.currentLevel || 5, // Default to level 1 if not set
      joinDate: user.joinDate || new Date().toISOString(), // Default to current date if not set
      xp: user.xp || 0, // Default to 0 XP if not set
      avatar: user.avatar,
      elo_rating: user.elo_rating,
      rank: user.rank,
      baseLineTest: user.base_line_test,
    },
  });
});

// Send password reset email
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Check if user exists
    const { data: user, error: fetchError } = await supabase
      .from('Users')
      .select('id, email, name')
      .eq('email', email)
      .single();

    if (fetchError || !user) {
      // For security, don't reveal if email exists or not
      return res.status(200).json({
        message:
          'If an account with that email exists, a reset link has been sent.',
      });
    }

    // Generate reset token (valid for 1 hour)
    const now = Math.floor(Date.now() / 1000); // Current UTC timestamp in seconds
    const resetToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        type: 'password_reset',
        iat: now,
        exp: now + TOKEN_EXPIRY,
      },
      process.env.JWT_SECRET,
    );

    // Store in database with explicit UTC timestamp
    const expiresAt = new Date();
    expiresAt.setTime(now * 1000 + TOKEN_EXPIRY * 1000);

    const { error: tokenError } = await supabase.from('PasswordResets').insert([
      {
        user_id: user.id,
        token: resetToken,
        expires_at: expiresAt.toISOString(), // Stores in UTC
      },
    ]);

    if (tokenError) {
      console.error('Error storing reset token:', tokenError.message);
      // Continue anyway - token is still valid via JWT
    }

    // TODO: Send email with reset link
    // const resetLink = `${process.env.FRONTEND_URL}/login-landing/reset-password?token=${resetToken}`;
    // await sendPasswordResetEmail(user.email, user.name, resetLink);

    console.log(`Password reset requested for: ${email}`);
    console.log(`Reset token: ${resetToken}`); // Remove in production

    res.status(200).json({
      message:
        'If an account with that email exists, a reset link has been sent.',
    });
  } catch (error) {
    console.error('Error in forgot password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ error: 'Token and new password are required' });
    }

    // Validate password strength (same as registration)
    if (newPassword.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters long',
      });
    }

    // First verify JWT validity
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.type !== 'password_reset') {
        return res.status(400).json({ error: 'Invalid token type' });
      }
    } catch (jwtError) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    // Then verify token in database
    const { data: resetEntry, error: resetError } = await supabase
      .from('PasswordResets')
      .select('user_id, expires_at')
      .eq('token', token)
      .single();

    if (resetError || !resetEntry) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Compare UTC timestamps
    const now = new Date();
    const expiresAt = new Date(resetEntry.expires_at);

    if (now.getTime() > expiresAt.getTime()) {
      // Clean up expired token
      await supabase.from('PasswordResets').delete().eq('token', token);
      return res.status(400).json({ error: 'Reset token has expired' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    const { error: updateError } = await supabase
      .from('Users')
      .update({ password: hashedPassword })
      .eq('id', resetEntry.user_id);

    if (updateError) {
      console.error('Error updating password:', updateError.message);
      return res.status(500).json({ error: 'Failed to update password' });
    }

    // Delete used reset token
    await supabase.from('PasswordResets').delete().eq('token', token);

    res.status(200).json({
      message: 'Password has been successfully reset',
    });
  } catch (err) {
    console.error('Error in reset-password:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify reset token
router.get('/verify-reset-token/:token', async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    // First verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.type !== 'password_reset') {
        return res.status(400).json({ error: 'Invalid token type' });
      }
    } catch (jwtError) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    // Then verify in database
    const { data: resetRecord, error: fetchError } = await supabase
      .from('PasswordResets')
      .select('expires_at')
      .eq('token', token)
      .single();

    if (fetchError || !resetRecord) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    // Check expiration
    const now = new Date();
    const expiresAt = new Date(resetRecord.expires_at);

    if (now > expiresAt) {
      // Clean up expired token
      await supabase.from('PasswordResets').delete().eq('token', token);
      return res.status(400).json({ error: 'Token has expired' });
    }

    res.status(200).json({
      message: 'Token is valid',
      userId: decoded.userId,
    });
  } catch (error) {
    console.error('Error verifying reset token:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
