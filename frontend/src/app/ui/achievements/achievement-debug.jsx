// Achievement debugging component to help diagnose real-time issues
'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function AchievementDebug() {
  const [debugInfo, setDebugInfo] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    // Check if achievement notification system is available
    const checkSystem = () => {
      const info = {
        timestamp: new Date().toISOString(),
        windowFunctions: {
          showAchievement: typeof window.showAchievement,
          showMultipleAchievements: typeof window.showMultipleAchievements,
        },
        sessionStatus: session?.user ? 'authenticated' : 'not authenticated',
        userId: session?.user?.id || 'no user ID',
        availableWindowKeys: Object.keys(window).filter((key) =>
          key.toLowerCase().includes('achievement'),
        ),
      };
      setDebugInfo(info);
    };

    if (typeof window !== 'undefined') {
      checkSystem();
      // Re-check every 2 seconds
      const interval = setInterval(checkSystem, 2000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const testNotification = () => {
    const testAchievement = {
      id: 999,
      name: 'Debug Test',
      description: 'This is a test achievement notification',
      AchievementCategories: { name: 'Debug' },
      condition_value: 1,
    };

    if (window.showAchievement) {
      window.showAchievement(testAchievement);
      console.log('🧪 Test notification sent');
    } else {
      console.error('❌ showAchievement not available');
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-3 py-2 rounded text-xs z-50"
        style={{ fontSize: '10px' }}
      >
        🐛 Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-sm z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-bold">Achievement Debug</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="text-xs space-y-2">
        <div>
          <strong>System Status:</strong>
          <div className="ml-2">
            <div>
              showAchievement: {debugInfo.windowFunctions?.showAchievement}
            </div>
            <div>
              showMultipleAchievements:{' '}
              {debugInfo.windowFunctions?.showMultipleAchievements}
            </div>
            <div>Session: {debugInfo.sessionStatus}</div>
            <div>User ID: {debugInfo.userId}</div>
          </div>
        </div>

        <button
          onClick={testNotification}
          className="w-full bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs"
        >
          Test Notification
        </button>

        <div className="text-gray-400">
          Last check: {debugInfo.timestamp?.slice(11, 19)}
        </div>
      </div>
    </div>
  );
}
