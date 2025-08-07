// oauthRoutes.js
import express from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../database/supabaseClient.js';

const router = express.Router();

// Handle OAuth user creation/retrieval
router.post('/oauth/user', async (req, res) => {
  const { email, name, image, provider } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: 'Email and name are required' });
  }

  try {
    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('Users')
      .select('id,name,surname,username,email,currentLevel,joinDate,xp,pfpURL')
      .eq('email', email)
      .maybeSingle();

    if (fetchError) {
      console.error('Error checking existing user:', fetchError.message);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (existingUser) {
      // User exists, return existing user data with JWT token
      const token = jwt.sign(
        { id: existingUser.id, email: existingUser.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' },
      );
      
      return res.status(200).json({
        message: 'User found',
        token,
        user: {
          id: existingUser.id,
          name: existingUser.name,
          surname: existingUser.surname,
          username: existingUser.username,
          email: existingUser.email,
          currentLevel: existingUser.currentLevel,
          joinDate: existingUser.joinDate,
          xp: existingUser.xp,
          pfpURL: existingUser.pfpURL || image, // Use stored image or fallback to OAuth image
        },
      });
    }

    // User doesn't exist, create new OAuth user

    // Parse name into first and last name
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || name;
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    // Generate username from email (fallback if name parsing fails)
    const baseUsername =
      name.replace(/\s+/g, '').toLowerCase() || email.split('@')[0];
    let username = baseUsername;

    // Check if username is already taken and make it unique if needed
    let usernameExists = true;
    let counter = 1;

    while (usernameExists) {
      const { data: usernameCheck } = await supabase
        .from('Users')
        .select('id')
        .eq('username', username)
        .maybeSingle();

      if (!usernameCheck) {
        usernameExists = false;
      } else {
        username = `${baseUsername}${counter}`;
        counter++;
      }
    }

    // Create new user with default values
    const { data: newUser, error: createError } = await supabase
      .from('Users')
      .insert([
        {
          name: firstName,
          surname: lastName,
          username: username,
          email: email,
          password: null, // OAuth users don't have passwords
          currentLevel: 5, // Default starting level
          joinDate: new Date().toISOString(),
          xp: 1000, // Default starting XP
          pfpURL: image, // Use OAuth profile image
        },
      ])
      .select()
      .single();

    if (createError) {
      console.error('Error creating OAuth user:', createError.message);
      return res.status(500).json({ error: 'Failed to create user' });
    }

    // Generate JWT token for the new user
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    );

    res.status(201).json({
      message: 'OAuth user created successfully',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        surname: newUser.surname,
        username: newUser.username,
        email: newUser.email,
        currentLevel: newUser.currentLevel,
        joinDate: newUser.joinDate,
        xp: newUser.xp,
        pfpURL: newUser.pfpURL,
      },
    });
  } catch (error) {
    console.error('Error in OAuth user handling:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
