/**
 * Mock Push Notification Service for testing purposes
 * This simulates Firebase Cloud Messaging without requiring actual Firebase setup
 */

class MockPushNotificationService {
  constructor() {
    this.initialized = true;
    console.log('🧪 Mock Push Notification Service initialized');
  }

  /**
   * Mock send notification to a single device
   */
  async sendToDevice(fcmToken, notification, data = {}) {
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      const mockMessageId = `mock_${Date.now()}_${Math.random()
        .toString(36)
        .substring(7)}`;

      console.log('🧪 Mock notification sent:', {
        fcmToken: fcmToken?.substring(0, 20) + '...',
        notification,
        data,
        messageId: mockMessageId,
      });

      return {
        success: true,
        messageId: mockMessageId,
        mock: true,
      };
    } catch (error) {
      console.error('❌ Mock notification error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mock send notification to multiple devices
   */
  async sendToMultipleDevices(fcmTokens, notification, data = {}) {
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 150));

      const mockResponses = fcmTokens.map((token, index) => ({
        messageId: `mock_multi_${Date.now()}_${index}`,
        success: Math.random() > 0.1, // 90% success rate
      }));

      const successCount = mockResponses.filter((r) => r.success).length;
      const failureCount = fcmTokens.length - successCount;

      console.log(
        `🧪 Mock notifications sent: ${successCount}/${fcmTokens.length}`,
        {
          notification,
          data,
          responses: mockResponses,
        },
      );

      return {
        success: true,
        successCount,
        failureCount,
        responses: mockResponses,
        mock: true,
      };
    } catch (error) {
      console.error('❌ Mock multi-notification error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mock send notification to user (by user ID)
   */
  async sendToUser(userId, notification, data = {}) {
    try {
      console.log(`🧪 Mock notification to user ${userId}:`, {
        notification,
        data,
      });

      // Simulate FCM token lookup and send
      const mockToken = `mock_token_${userId}_${Date.now()}`;
      return await this.sendToDevice(mockToken, notification, data);
    } catch (error) {
      console.error('❌ Mock user notification error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get predefined notification types (same as real service)
   */
  getNotificationTypes() {
    return {
      ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
      LEVEL_COMPLETED: 'level_completed',
      CHALLENGE_INVITE: 'challenge_invite',
      DAILY_REMINDER: 'daily_reminder',
      STREAK_MILESTONE: 'streak_milestone',
    };
  }
}

export default MockPushNotificationService;
