// pushNotificationRoutes.js
import express from 'express';
import { supabase } from '../database/supabaseClient.js';
import pushNotificationService from './services/pushNotificationService.js';

const router = express.Router();

// Middleware to verify user authentication (you may need to adjust this)
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    // Add your JWT verification logic here
    // For now, assuming user ID is passed in the request
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Register/Update FCM token for a user
router.post('/register-token', authenticateUser, async (req, res) => {
  try {
    const { userId, fcmToken } = req.body;

    if (!userId || !fcmToken) {
      return res
        .status(400)
        .json({ error: 'userId and fcmToken are required' });
    }

    // Update user's FCM token in database
    const { error } = await supabase
      .from('Users')
      .update({ fcm_token: fcmToken, fcm_updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      console.error('Error updating FCM token:', error);
      return res.status(500).json({ error: 'Failed to register FCM token' });
    }

    res.status(200).json({ message: 'FCM token registered successfully' });
  } catch (error) {
    console.error('Error in /register-token:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send test notification
router.post('/send-test', authenticateUser, async (req, res) => {
  try {
    const { userId, title, body } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const notification = {
      title: title || '🧪 Test Notification',
      body: body || 'This is a test notification from ELO Learning!',
    };

    const result = await pushNotificationService.sendToUser(
      userId,
      notification,
      {
        type: 'test',
      },
    );

    if (result.success) {
      res.status(200).json({
        message: 'Test notification sent successfully',
        messageId: result.messageId,
      });
    } else {
      res
        .status(500)
        .json({ error: 'Failed to send notification', details: result.error });
    }
  } catch (error) {
    console.error('Error in /send-test:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send game invitation
router.post('/send-game-invitation', authenticateUser, async (req, res) => {
  try {
    const { fromUserId, toUserId, gameType } = req.body;

    if (!fromUserId || !toUserId) {
      return res
        .status(400)
        .json({ error: 'fromUserId and toUserId are required' });
    }

    const result = await pushNotificationService.sendGameInvitation(
      fromUserId,
      toUserId,
      gameType || 'multiplayer',
    );

    if (result.success) {
      res.status(200).json({ message: 'Game invitation sent successfully' });
    } else {
      res.status(500).json({
        error: 'Failed to send game invitation',
        details: result.error,
      });
    }
  } catch (error) {
    console.error('Error in /send-game-invitation:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send level up notification
router.post('/send-level-up', authenticateUser, async (req, res) => {
  try {
    const { userId, newLevel } = req.body;

    if (!userId || !newLevel) {
      return res
        .status(400)
        .json({ error: 'userId and newLevel are required' });
    }

    const result = await pushNotificationService.sendLevelUpNotification(
      userId,
      newLevel,
    );

    if (result.success) {
      res
        .status(200)
        .json({ message: 'Level up notification sent successfully' });
    } else {
      res.status(500).json({
        error: 'Failed to send level up notification',
        details: result.error,
      });
    }
  } catch (error) {
    console.error('Error in /send-level-up:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send achievement notification
router.post('/send-achievement', authenticateUser, async (req, res) => {
  try {
    const { userId, achievementName } = req.body;

    if (!userId || !achievementName) {
      return res
        .status(400)
        .json({ error: 'userId and achievementName are required' });
    }

    const result = await pushNotificationService.sendAchievementNotification(
      userId,
      achievementName,
    );

    if (result.success) {
      res
        .status(200)
        .json({ message: 'Achievement notification sent successfully' });
    } else {
      res.status(500).json({
        error: 'Failed to send achievement notification',
        details: result.error,
      });
    }
  } catch (error) {
    console.error('Error in /send-achievement:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send bulk notification to users by level
router.post('/send-to-level', authenticateUser, async (req, res) => {
  try {
    const { level, title, body, clickAction } = req.body;

    if (!level || !title || !body) {
      return res
        .status(400)
        .json({ error: 'level, title, and body are required' });
    }

    const notification = { title, body, clickAction };
    const result = await pushNotificationService.sendToUsersWhere(
      { currentLevel: level },
      notification,
      { type: 'level_broadcast' },
    );

    if (result.success) {
      res.status(200).json({
        message: `Notification sent to level ${level} users`,
        successCount: result.successCount,
        failureCount: result.failureCount,
      });
    } else {
      res.status(500).json({
        error: 'Failed to send bulk notification',
        details: result.error,
      });
    }
  } catch (error) {
    console.error('Error in /send-to-level:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove FCM token (when user logs out)
router.post('/remove-token', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const { error } = await supabase
      .from('Users')
      .update({ fcm_token: null, fcm_updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      console.error('Error removing FCM token:', error);
      return res.status(500).json({ error: 'Failed to remove FCM token' });
    }

    res.status(200).json({ message: 'FCM token removed successfully' });
  } catch (error) {
    console.error('Error in /remove-token:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
