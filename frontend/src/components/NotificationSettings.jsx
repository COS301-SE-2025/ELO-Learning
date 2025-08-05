// components/NotificationSettings.jsx
import React, { useState } from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';

const NotificationSettings = ({ userId }) => {
  const {
    fcmToken,
    notificationPermission,
    foregroundMessage,
    requestPermission,
    clearToken,
    sendTestNotification,
    clearForegroundMessage,
    isSupported,
  } = usePushNotifications(userId);

  const [isSendingTest, setIsSendingTest] = useState(false);

  const handleRequestPermission = async () => {
    const success = await requestPermission();
    if (success) {
      alert('✅ Push notifications enabled successfully!');
    } else {
      alert(
        '❌ Failed to enable push notifications. Please check your browser settings.',
      );
    }
  };

  const handleSendTest = async () => {
    setIsSendingTest(true);
    const success = await sendTestNotification();
    setIsSendingTest(false);

    if (success) {
      alert('🧪 Test notification sent! Check your notifications.');
    } else {
      alert('❌ Failed to send test notification.');
    }
  };

  const handleClearToken = async () => {
    await clearToken();
    alert('🔕 Push notifications disabled.');
  };

  const getPermissionIcon = () => {
    switch (notificationPermission) {
      case 'granted':
        return '✅';
      case 'denied':
        return '❌';
      default:
        return '❓';
    }
  };

  const getPermissionText = () => {
    switch (notificationPermission) {
      case 'granted':
        return 'Enabled';
      case 'denied':
        return 'Denied';
      default:
        return 'Not Set';
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-yellow-600 text-xl mr-3">⚠️</div>
          <div>
            <h3 className="text-yellow-800 font-medium">
              Push Notifications Not Supported
            </h3>
            <p className="text-yellow-700 text-sm mt-1">
              Your browser does not support push notifications.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Push Notifications
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{getPermissionIcon()}</span>
          <span className="text-sm text-gray-600">{getPermissionText()}</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Permission Status */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Current Status</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <strong>Permission:</strong> {getPermissionText()}
            </p>
            <p>
              <strong>Token:</strong>{' '}
              {fcmToken ? '✅ Registered' : '❌ Not Available'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {notificationPermission !== 'granted' && (
            <button
              onClick={handleRequestPermission}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              🔔 Enable Notifications
            </button>
          )}

          {notificationPermission === 'granted' && (
            <>
              <button
                onClick={handleSendTest}
                disabled={isSendingTest}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {isSendingTest ? '⏳ Sending...' : '🧪 Send Test'}
              </button>

              <button
                onClick={handleClearToken}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                🔕 Disable Notifications
              </button>
            </>
          )}
        </div>

        {/* Help Text */}
        <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
          <p>
            <strong>💡 Tip:</strong> Push notifications will alert you about:
          </p>
          <ul className="mt-1 ml-4 list-disc space-y-1">
            <li>Level ups and achievements</li>
            <li>Game invitations from friends</li>
            <li>Daily practice reminders</li>
            <li>Important announcements</li>
          </ul>
        </div>

        {/* Browser Compatibility Info */}
        <div className="text-xs text-gray-400">
          <p>
            Notifications work best in Chrome, Firefox, Safari, and Edge. Make
            sure to allow notifications when prompted by your browser.
          </p>
        </div>
      </div>

      {/* Foreground Message Display */}
      {foregroundMessage && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-green-900">
                📨 New Notification
              </h4>
              <p className="text-green-800 font-medium mt-1">
                {foregroundMessage.notification?.title}
              </p>
              <p className="text-green-700 text-sm mt-1">
                {foregroundMessage.notification?.body}
              </p>
            </div>
            <button
              onClick={clearForegroundMessage}
              className="text-green-600 hover:text-green-800 ml-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;
