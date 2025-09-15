// components/NotificationSettings.jsx
import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { usePushNotifications } from '../hooks/usePushNotifications.jsx';

const NotificationSettings = ({ userId, accessToken }) => {
  const {
    fcmToken,
    notificationPermission,
    foregroundMessage,
    requestPermission,
    clearToken,
    sendTestNotification,
    clearForegroundMessage,
    isSupported,
  } = usePushNotifications(userId, accessToken);

  // Show toast when foregroundMessage changes
  useEffect(() => {
    if (foregroundMessage && foregroundMessage.notification) {
      toast.custom(
        (t) => (
          <div
            className={`max-w-xs w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-4 ${
              t.visible ? 'animate-enter' : 'animate-leave'
            }`}
          >
            <div className="flex-1 w-0">
              <div className="flex items-center">
                <span className="text-xl mr-2">📢</span>
                <span className="font-semibold">
                  {foregroundMessage.notification.title}
                </span>
              </div>
              <div className="mt-1 text-gray-700 text-sm">
                {foregroundMessage.notification.body}
              </div>
            </div>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                clearForegroundMessage();
              }}
              className="ml-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        ),
        { duration: 6000 },
      );
    }
  }, [foregroundMessage, clearForegroundMessage]);

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

  // Card and button styles from friend request section
  // Use the same card and button classes as friend requests
  const cardClass =
    'bg-elo-bg border border-gray-200 rounded-xl shadow-lg p-4 md:p-6 w-full';
  const btnClass =
    'main-button-landing px-2 py-1 rounded-lg text-white bg-elo-primary hover:bg-elo-primary-dark transition w-full md:w-auto text-xs font-semibold';
  const disableBtnClass =
    'secondary-button px-2 py-1 rounded-lg text-white bg-elo-secondary hover:bg-elo-secondary-dark transition w-full md:w-auto text-xs font-semibold';

  // Handlers for enable/disable
  const handleEnable = handleRequestPermission;
  const handleDisable = handleClearToken;

  return (
    <div className={cardClass + ' flex flex-col gap-2 mx-auto mt-6'}>
      <div className="flex items-center gap-4">
        <div className="flex flex-col flex-1 min-w-0">
          <span className="font-semibold text-elo-primary truncate text-lg">
            Push Notifications
          </span>
        </div>
        <div className="flex gap-2 w-32">
          <button className={btnClass} onClick={handleEnable}>
            Enable
          </button>
          <button className={disableBtnClass} onClick={handleDisable}>
            Disable
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
