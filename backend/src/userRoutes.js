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
      'id,name,surname,username,email,currentLevel,joinDate,xp,avatar,elo_rating,rank,base_line_test,daily_streak',
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

  // Fetch user from Supabase with progress tracking fields
  const { data, error } = await supabase
    .from('Users')
    .select(
      'id,name,surname,username,email,currentLevel,joinDate,xp,avatar,elo_rating,rank,base_line_test,best_elo_rating,last_session_elo,consecutive_improvements,last_elo_drop,daily_streak',
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

// Debug endpoint for progress tracking (no auth required)
router.get('/users/:id/debug', async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch user progress data for debugging
    const { data, error } = await supabase
      .from('Users')
      .select(
        'id,elo_rating,best_elo_rating,last_session_elo,consecutive_improvements,last_elo_drop,daily_streak',
      )
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: "User doesn't exist" });
      }
      console.error('Error fetching user debug data:', error.message);
      return res.status(500).json({ error: 'Failed to fetch user debug data' });
    }

    res.status(200).json({
      ...data,
      debug_info: {
        progress_fields_status: {
          best_elo_rating: data.best_elo_rating !== null ? 'SET' : 'NULL',
          last_session_elo: data.last_session_elo !== null ? 'SET' : 'NULL',
          consecutive_improvements:
            data.consecutive_improvements !== null ? 'SET' : 'NULL',
          last_elo_drop: data.last_elo_drop !== null ? 'SET' : 'NULL',
        },
      },
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ error: 'Debug endpoint failed' });
  }
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
  const {
    name,
    surname,
    username,
    email,
    password,
    joinDate,
    location,
    institution,
  } = req.body;

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
    bodyShape: 'Square',
    background: 'solid-3', // Blue background to match frontend default
  };
  const eloRating = 100;
  const defaultRank = 'Iron';
  const default_daily_streak = 0;

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
        daily_streak: default_daily_streak,
        location: location || null,
        institution: institution || null,
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
      daily_streak: data.daily_streak,
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
      'id,name,surname,username,email,password,currentLevel,joinDate,xp,avatar,elo_rating,rank,base_line_test,daily_streak',
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
      daily_streak: user.daily_streak,
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

// --- FRIEND REQUEST ENDPOINTS ---
// GET /user/:id/pending-friend-requests
// Returns all pending friend requests for the consulting user (where friend_id = id and status = 'pending')
router.get(
  '/user/:id/pending-friend-requests',
  verifyToken,
  async (req, res) => {
    const { id } = req.params;
    try {
      // Find all pending requests where this user is the recipient
      const { data: requests, error } = await supabase
        .from('friends')
        .select('id, user_id, friend_id, status, created_at')
        .eq('friend_id', id)
        .eq('status', 'pending');
      if (error) {
        console.error(
          `[PENDING FRIEND REQUESTS] Error for user id=${id}:`,
          error,
        );
        return res.status(500).json({
          error: 'Failed to fetch pending friend requests',
          details: error,
        });
      }
      // Fetch sender info for each request
      let senders = [];
      if (requests.length > 0) {
        const senderIds = requests.map((r) => r.user_id);
        const { data: senderUsers, error: senderError } = await supabase
          .from('Users')
          .select('id, name, surname, email, avatar')
          .in('id', senderIds);
        if (senderError) {
          console.error(
            `[PENDING FRIEND REQUESTS] Failed to fetch sender info:`,
            senderError,
          );
        }
        senders = senderUsers || [];
      }
      // Attach sender info to each request
      const pendingRequests = requests.map((r) => {
        const sender = senders.find((u) => u.id === r.user_id);
        return {
          request_id: r.id,
          sender_id: r.user_id,
          sender_name: sender?.name || '',
          sender_surname: sender?.surname || '',
          sender_email: sender?.email || '',
          sender_avatar: sender?.avatar || null,
          status: r.status,
          created_at: r.created_at,
        };
      });
      res.status(200).json({ pendingRequests });
    } catch (err) {
      console.error(
        `[PENDING FRIEND REQUESTS] Unexpected error for user id=${id}:`,
        err,
      );
      res.status(500).json({
        error: 'Failed to fetch pending friend requests',
        details: err.message,
      });
    }
  },
);
// --- COMMUNITY ENDPOINTS ---

// GET /user/:id/community
// Returns { friends, institution, locations }
router.get('/user/:id/community', verifyToken, async (req, res) => {
  const { id } = req.params;
  console.log(`[COMMUNITY] Route entered for user id=${id}`);
  try {
    // Get academic_institution and location(s) from Users table
    const { data: user, error: userError } = await supabase
      .from('Users')
      .select('academic_institution, location')
      .eq('id', id)
      .single();
    if (userError || !user) {
      console.error(
        `[COMMUNITY] User lookup failed for id=${id}. Error:`,
        userError,
        'User:',
        user,
      );
      return res
        .status(404)
        .json({ error: 'User not found', details: { userError, user } });
    }

    // Get all friend requests (pending + accepted) for this user
    const { data: friendRows, error: friendError } = await supabase
      .from('friends')
      .select('id, user_id, friend_id, status')
      .or(`user_id.eq.${id},friend_id.eq.${id}`)
      .in('status', ['pending', 'accepted']);
    if (friendError) {
      console.error(
        `[COMMUNITY] Failed to fetch friends for user id=${id}. Error:`,
        friendError,
      );
      return res
        .status(500)
        .json({ error: 'Failed to fetch friends', details: friendError });
    }

    // Get the friend IDs (other user in each relationship)
    const friendIds = [
      ...new Set(
        friendRows.map((f) =>
          f.user_id === Number(id) ? f.friend_id : f.user_id,
        ),
      ),
    ];
    let friends = [];
    if (friendIds.length > 0) {
      // Fetch names, surnames, emails for each friend
      const { data: friendUsers, error: friendUserError } = await supabase
        .from('Users')
        .select('id, name, surname, email')
        .in('id', friendIds);
      if (friendUserError) {
        console.error(
          `[COMMUNITY] Failed to fetch friend details for ids=${friendIds}. Error:`,
          friendUserError,
        );
      }
      if (!friendUserError && friendUsers) {
        friends = friendRows.map((f) => {
          const friendId = f.user_id === Number(id) ? f.friend_id : f.user_id;
          const friendUser = friendUsers.find((u) => u.id === friendId);
          return {
            id: friendUser?.id || friendId,
            name: friendUser?.name || '',
            surname: friendUser?.surname || '',
            email: friendUser?.email || 'unknown',
            status: f.status,
            request_id: f.id ?? f.request_id, // Always include request_id
          };
        });
      }
    }

    console.log('[COMMUNITY GET] user.location value:', user.location);
    // Robust normalization for location field
    let normalizedLocation = [];
    if (Array.isArray(user.location)) {
      normalizedLocation = user.location;
    } else if (
      typeof user.location === 'string' &&
      user.location.trim().startsWith('[') &&
      user.location.trim().endsWith(']')
    ) {
      // Stringified array, e.g., '["Pretoria"]'
      try {
        const parsed = JSON.parse(user.location);
        if (Array.isArray(parsed)) {
          normalizedLocation = parsed;
        }
      } catch (e) {
        normalizedLocation = [];
      }
    } else if (typeof user.location === 'string' && user.location.length > 0) {
      normalizedLocation = user.location.split(',').map((city) => city.trim());
    }
    res.status(200).json({
      friends,
      academic_institution: user.academic_institution || '',
      location: normalizedLocation,
    });
  } catch (err) {
    console.error(`[COMMUNITY] Unexpected error for user id=${id}:`, err);
    res
      .status(500)
      .json({ error: 'Failed to fetch community data', details: err.message });
  }
});

// PUT /user/:id/community
// Updates institution and locations for user
router.put('/user/:id/community', verifyToken, async (req, res) => {
  // Debug log to guarantee payload
  console.log('[COMMUNITY PUT] Received payload:', req.body);
  const { id } = req.params;
  // Use correct field names from frontend and DB
  const { academic_institution, location } = req.body;
  try {
    // Update institution and locations in Users table
    const { data: userExists, error: userError } = await supabase
      .from('Users')
      .select('id')
      .eq('id', id)
      .single();
    if (userError || !userExists) {
      console.error(
        `[COMMUNITY PUT] User not found for id=${id}. Error:`,
        userError,
        'User:',
        userExists,
      );
      return res
        .status(404)
        .json({ error: 'User not found', details: { userError, userExists } });
    }

    const { data, error: updateError } = await supabase
      .from('Users')
      .update({ academic_institution, location })
      .eq('id', id)
      .select()
      .single();
    if (updateError) {
      console.error(
        `[COMMUNITY PUT] Failed to update academic_institution/location for user id=${id}. Error:`,
        updateError,
        'Payload:',
        { academic_institution, location },
      );
      return res.status(500).json({
        error: 'Failed to update community data',
        details: updateError,
      });
    }
    res.status(200).json({ message: 'Community data updated', user: data });
  } catch (err) {
    console.error(`[COMMUNITY PUT] Unexpected error for user id=${id}:`, err);
    res
      .status(500)
      .json({ error: 'Failed to update community data', details: err.message });
  }
});

// Send a friend request
router.post('/user/:id/friend-request', verifyToken, async (req, res) => {
  try {
    // Use user ID from URL params, matching avatar endpoint logic
    const { id } = req.params;
    const { friend_email } = req.body;
    console.log(
      `[FRIEND REQUEST] Sender ID: ${id}, Friend Email: ${friend_email}`,
    );

    // Find friend by email
    const { data: friend, error: friendError } = await supabase
      .from('Users')
      .select('id, email')
      .eq('email', friend_email)
      .single();
    if (friendError || !friend) {
      console.error(
        `[FRIEND REQUEST] Friend lookup failed for email=${friend_email}. Error:`,
        friendError,
        'Friend:',
        friend,
      );
      return res
        .status(404)
        .json({ error: 'Friend not found', details: { friendError, friend } });
    }
    // Prohibit sending friend request to self
    if (Number(id) === Number(friend.id)) {
      return res.status(400).json({
        error: 'Add your other mates pal, good self love though! Self bestie!',
      });
    }
    console.log(`[FRIEND REQUEST] Found friend:`, friend);

    // Check if there's already a pending request
    const { data: existingRequest, error: existingError } = await supabase
      .from('friends')
      .select('*')
      .eq('user_id', Number(id))
      .eq('friend_id', Number(friend.id))
      .eq('status', 'pending')
      .maybeSingle(); // <-- returns null if not found

    if (existingError) {
      console.error(
        `[FRIEND REQUEST] Lookup for existing request failed for user_id=${id}, friend_id=${friend.id}. Error:`,
        existingError,
      );
      return res.status(500).json({
        error: 'Error checking existing requests',
        details: existingError,
      });
    }

    if (existingRequest) {
      console.log(
        `[FRIEND REQUEST] Duplicate request blocked:`,
        existingRequest,
      );
      return res.status(400).json({
        error: 'Friend request already sent',
        details: existingRequest,
      });
    }

    // Insert friend request
    const friendRequestPayload = {
      user_id: Number(id),
      friend_id: Number(friend.id),
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    console.log(
      `[FRIEND REQUEST] Inserting friend request:`,
      friendRequestPayload,
    );
    const { data: request, error: reqError } = await supabase
      .from('friends')
      .insert([friendRequestPayload])
      .select()
      .single();
    if (reqError) {
      console.error(
        `[FRIEND REQUEST] Insert failed for payload:`,
        friendRequestPayload,
        'Error:',
        reqError,
        'Data:',
        request,
      );
      return res.status(500).json({
        error: 'Failed to send friend request',
        details: {
          data: request,
          error: reqError,
          payload: friendRequestPayload,
        },
      });
    }
    console.log(`[FRIEND REQUEST] Success. Request:`, request);
    // TODO: Trigger push notification to friend
    res.status(201).json({ message: 'Friend request sent', request });
  } catch (err) {
    console.error(
      `[FRIEND REQUEST] Unexpected error for sender id=${id}, friend_email=${req.body?.friend_email}:`,
      err,
    );
    res
      .status(500)
      .json({ error: 'Internal server error', details: err.message });
  }
});

// Accept a friend request
// Usage: POST /user/:id/friend-accept
// :id is the acceptor's user ID (the one accepting the request)
// Body: { "request_id": <id of the friend request row> }
router.post('/user/:id/friend-accept', verifyToken, async (req, res) => {
  const { id } = req.params; // acceptor's user ID
  const { request_id } = req.body; // unique id of the friend request row
  console.log(`[FRIEND-ACCEPT] Payload:`, { id, request_id });
  // Fetch the friend request row before update
  const { data: requestRow, error: fetchError } = await supabase
    .from('friends')
    .select('*')
    .eq('id', request_id)
    .single();
  console.log(`[FRIEND-ACCEPT] DB row before update:`, requestRow);
  if (fetchError || !requestRow) {
    console.error(
      `[FRIEND-ACCEPT] Could not find friend request row for id=${request_id}`,
    );
    return res
      .status(404)
      .json({ error: 'Friend request not found', details: fetchError });
  }
  // Only accept the request if the friend_id matches the acceptor's ID
  const { data, error } = await supabase
    .from('friends')
    .update({ status: 'accepted' })
    .eq('id', request_id)
    .eq('friend_id', id)
    .select()
    .single();
  console.log(`[FRIEND-ACCEPT] DB row after update:`, data);
  if (error) {
    console.error(`[FRIEND-ACCEPT] Update error:`, error);
    return res
      .status(500)
      .json({ error: 'Failed to accept friend request', details: error });
  }
  res.status(200).json({ message: 'Friend request accepted', data });
});

// Reject a friend request
// Usage: POST /user/:id/friend-reject
// :id is the acceptor's user ID (the one rejecting the request)
// Body: { "request_id": <id of the friend request row> }
router.post('/user/:id/friend-reject', verifyToken, async (req, res) => {
  const { id } = req.params; // acceptor's user ID
  const { request_id } = req.body; // unique id of the friend request row
  // Only reject the request if the friend_id matches the acceptor's ID
  const { data, error } = await supabase
    .from('friends')
    .update({ status: 'rejected' })
    .eq('id', request_id)
    .eq('friend_id', id)
    .select()
    .single();
  if (error) {
    return res.status(500).json({ error: 'Failed to reject friend request' });
  }
  res.status(200).json({ message: 'Friend request rejected', data });
});

// List friends
router.get('/user/:id/friends', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('friends')
    .select('friend_id, user_id, status')
    .or(`user_id.eq.${id},friend_id.eq.${id}`)
    .eq('status', 'accepted');
  if (error) {
    return res.status(500).json({ error: 'Failed to fetch friends' });
  }
  res.status(200).json({ friends: data });
});

router.get(
  '/user/:id/incoming-friend-requests',
  verifyToken,
  async (req, res) => {
    const { id } = req.params;
    try {
      const { data, error } = await supabase
        .from('friends')
        .select('id, user_id, friend_id, status, created_at')
        .eq('friend_id', id)
        .eq('status', 'pending');
      if (error) {
        console.error('Error fetching incoming friend requests:', error);
        return res
          .status(500)
          .json({ error: 'Failed to fetch incoming friend requests' });
      }
      res.status(200).json({ incomingRequests: data });
    } catch (err) {
      console.error('Unexpected error fetching incoming friend requests:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

// Remove an accepted friend relationship
// Usage: DELETE /user/:id/friend
// Body: { friend_id: <id of the friend to remove> }
router.delete('/user/:id/friend', verifyToken, async (req, res) => {
  const { id } = req.params; // current user
  console.log('[REMOVE FRIEND] req.params:', req.params);
  console.log('[REMOVE FRIEND] req.body:', req.body);
  const { friend_id } = req.body;
  if (!friend_id) {
    console.error('[REMOVE FRIEND] friend_id missing in body');
    return res.status(400).json({ error: 'friend_id is required' });
  }
  try {
    // Delete the relationship in either direction where status is accepted
    const { error } = await supabase
      .from('friends')
      .delete()
      .or(
        `and(user_id.eq.${id},friend_id.eq.${friend_id},status.eq.accepted),and(friend_id.eq.${id},user_id.eq.${friend_id},status.eq.accepted)`,
      );
    if (error) {
      console.error('[REMOVE FRIEND] Error:', error);
      return res
        .status(500)
        .json({ error: 'Failed to remove friend', details: error });
    }
    res.status(200).json({ message: 'Friend removed successfully' });
  } catch (err) {
    console.error('[REMOVE FRIEND] Unexpected error:', err);
    res
      .status(500)
      .json({ error: 'Internal server error', details: err.message });
  }
});
export default router;
