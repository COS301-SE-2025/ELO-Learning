// services/pushNotificationService.js
import admin, { initializeFirebase } from './firebaseConfig.js';
import { supabase } from '../../database/supabaseClient.js';

// Initialize Firebase
initializeFirebase();

class PushNotificationService {
  constructor() {
    try {
      this.messaging = admin.messaging();
    } catch (error) {
      this.messaging = {
        send: async () => {
          /* no-op or helpful error */
        },
        sendToDevice: async () => {
          /* no-op or helpful error */
        },
      };
    }
  }

  /**
   * Send push notification to a single device
   * @param {string} fcmToken - FCM token of the target device
   * @param {Object} notification - Notification payload
   * @param {Object} data - Additional data payload
   */
  async sendToDevice(fcmToken, notification, data = {}) {
    try {
      if (!this.messaging) {
        throw new Error('Firebase messaging not initialized');
      }

      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: {
          ...data,
          timestamp: new Date().toISOString(),
        },
        token: fcmToken,
        webpush: {
          notification: {
            icon: notification.icon || '/ELO-Logo-Horizontal.png',
          },
          fcmOptions: {
            link: notification.clickAction || '/',
          },
        },
      };

      const response = await this.messaging.send(message);
      console.log('✅ Push notification sent successfully:', response);
      return { success: true, messageId: response };
    } catch (error) {
      console.error('❌ Error sending push notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send push notification to multiple devices
   * @param {string[]} fcmTokens - Array of FCM tokens
   * @param {Object} notification - Notification payload
   * @param {Object} data - Additional data payload
   */
  async sendToMultipleDevices(fcmTokens, notification, data = {}) {
    try {
      if (!this.messaging || !fcmTokens.length) {
        throw new Error('Invalid messaging instance or empty token array');
      }

      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: {
          ...data,
          timestamp: new Date().toISOString(),
        },
        tokens: fcmTokens,
        webpush: {
          notification: {
            icon: notification.icon || '/ELO-Logo-Horizontal.png',
          },
          fcmOptions: {
            link: notification.clickAction || '/',
          },
        },
      };

      const response = await this.messaging.sendEachForMulticast(message);
      console.log(
        `✅ Push notifications sent: ${response.successCount}/${fcmTokens.length}`,
      );

      if (response.failureCount > 0) {
        console.warn(
          '❌ Some notifications failed:',
          response.responses.filter((r) => !r.success),
        );
      }

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses,
      };
    } catch (error) {
      console.error('❌ Error sending bulk push notifications:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification to a specific user by user ID
   * @param {string} userId - User ID to send notification to
   * @param {Object} notification - Notification payload
   * @param {Object} data - Additional data payload
   */
  async sendToUser(userId, notification, data = {}) {
    try {
      // Get user's FCM token from database
      const { data: userData, error } = await supabase
        .from('Users')
        .select('fcm_token')
        .eq('id', userId)
        .single();

      if (error || !userData || !userData.fcm_token) {
        console.warn(`⚠️ No FCM token found for user ${userId}`);
        return { success: false, error: 'No FCM token found for user' };
      }

      return await this.sendToDevice(userData.fcm_token, notification, data);
    } catch (error) {
      console.error('❌ Error sending notification to user:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification to all users with a specific condition
   * @param {Object} whereClause - Supabase where clause
   * @param {Object} notification - Notification payload
   * @param {Object} data - Additional data payload
   */
  async sendToUsersWhere(whereClause, notification, data = {}) {
    try {
      let query = supabase.from('Users').select('fcm_token');

      // Apply where clause
      Object.entries(whereClause).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { data: users, error } = await query;

      if (error || !users || users.length === 0) {
        console.warn('⚠️ No users found matching criteria');
        return { success: false, error: 'No users found' };
      }

      const fcmTokens = users
        .map((user) => user.fcm_token)
        .filter((token) => token); // Remove null/undefined tokens

      if (fcmTokens.length === 0) {
        console.warn('⚠️ No valid FCM tokens found');
        return { success: false, error: 'No valid FCM tokens found' };
      }

      return await this.sendToMultipleDevices(fcmTokens, notification, data);
    } catch (error) {
      console.error('❌ Error sending bulk notifications:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Predefined notification types for common scenarios
   */
  async sendGameInvitation(fromUserId, toUserId, gameType = 'multiplayer') {
    try {
      // Get sender's name
      const { data: sender, error } = await supabase
        .from('Users')
        .select('name, username')
        .eq('id', fromUserId)
        .single();

      if (error || !sender) {
        throw new Error('Sender not found');
      }

      const notification = {
        title: '🎮 Game Invitation!',
        body: `${
          sender.name || sender.username
        } invited you to play ${gameType}!`,
        clickAction: '/multiplayer',
      };

      const data = {
        type: 'game_invitation',
        fromUserId,
        gameType,
        senderName: sender.name || sender.username,
      };

      return await this.sendToUser(toUserId, notification, data);
    } catch (error) {
      console.error('❌ Error sending game invitation:', error);
      return { success: false, error: error.message };
    }
  }

  async sendLevelUpNotification(userId, newLevel) {
    const notification = {
      title: '🎉 Level Up!',
      body: `Congratulations! You've reached level ${newLevel}!`,
      clickAction: '/profile',
    };

    const data = {
      type: 'level_up',
      newLevel: newLevel.toString(),
    };

    return await this.sendToUser(userId, notification, data);
  }

  async sendAchievementNotification(userId, achievementName) {
    const notification = {
      title: '🏆 Achievement Unlocked!',
      body: `You've earned the "${achievementName}" achievement!`,
      clickAction: '/achievements',
    };

    const data = {
      type: 'achievement',
      achievementName,
    };

    return await this.sendToUser(userId, notification, data);
  }

  async sendDailyReminder(userId) {
    const notification = {
      title: '📚 Daily Practice Reminder',
      body: "Don't forget to practice today! Keep your learning streak alive!",
      clickAction: '/practice',
    };

    const data = {
      type: 'daily_reminder',
    };

    return await this.sendToUser(userId, notification, data);
  }

  /**
   * Clean up invalid FCM tokens from database
   */
  async cleanupInvalidTokens(invalidTokens) {
    try {
      if (!invalidTokens || invalidTokens.length === 0) return;

      const { error } = await supabase
        .from('Users')
        .update({ fcm_token: null })
        .in('fcm_token', invalidTokens);

      if (error) {
        console.error('❌ Error cleaning up invalid tokens:', error);
      } else {
        console.log(`✅ Cleaned up ${invalidTokens.length} invalid FCM tokens`);
      }
    } catch (error) {
      console.error('❌ Error in token cleanup:', error);
    }
  }
}

export default new PushNotificationService();
