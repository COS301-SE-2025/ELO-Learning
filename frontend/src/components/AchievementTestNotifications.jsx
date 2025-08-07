// Test component to verify achievement notifications work in real-time
'use client';
import { useState } from 'react';

export default function AchievementTestNotifications() {
  const [testResult, setTestResult] = useState('');

  const testNotificationSystem = () => {
    console.log('🧪 Testing notification system...');
    
    // Check if the global functions are available
    if (typeof window === 'undefined') {
      setTestResult('❌ Window object not available');
      return;
    }

    const testAchievement = {
      id: 999,
      name: 'Real-Time Test',
      description: 'Testing achievement notifications during gameplay',
      condition_type: 'Test',
      condition_value: 1,
      AchievementCategories: { name: 'Problem Solving' }
    };

    if (window.showAchievement) {
      setTestResult('✅ Notification system ready - showing test achievement');
      window.showAchievement(testAchievement);
    } else if (window.showMultipleAchievements) {
      setTestResult('✅ Multiple notifications ready - showing test achievement');
      window.showMultipleAchievements([testAchievement]);
    } else {
      setTestResult('❌ Notification system not ready');
      console.log('Available window functions:', Object.keys(window).filter(k => k.includes('Achievement') || k.includes('show')));
    }
  };

  const testDelayedNotification = () => {
    console.log('🧪 Testing delayed notification (simulating real gameplay)...');
    
    const testAchievement = {
      id: 998,
      name: 'Delayed Test',
      description: 'Testing delayed achievement notification like in real gameplay',
      condition_type: 'Test',
      condition_value: 1,
      AchievementCategories: { name: 'Gameplay' }
    };

    // Simulate the delay that happens in real gameplay
    setTimeout(() => {
      if (typeof window !== 'undefined' && window.showMultipleAchievements) {
        setTestResult('✅ Delayed notification successful');
        window.showMultipleAchievements([testAchievement]);
      } else {
        setTestResult('❌ Delayed notification failed - system not ready');
      }
    }, 1000);
    
    setTestResult('⏳ Testing delayed notification...');
  };

  return (
    <div className="bg-blue-900 border border-blue-600 rounded-lg p-4 mb-4">
      <h3 className="text-white text-lg font-bold mb-3">🔔 Real-Time Notification Test</h3>
      
      <div className="space-y-3">
        <button
          onClick={testNotificationSystem}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
        >
          Test Immediate Notification
        </button>
        
        <button
          onClick={testDelayedNotification}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors"
        >
          Test Delayed Notification (Like Gameplay)
        </button>
        
        {testResult && (
          <div className="text-white text-sm bg-gray-800 p-3 rounded">
            {testResult}
          </div>
        )}
      </div>
      
      <div className="text-gray-400 text-xs mt-3">
        <p>Use these tests to verify the notification system works during gameplay scenarios.</p>
      </div>
    </div>
  );
}
