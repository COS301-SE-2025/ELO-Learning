// Simple Fallback Achievement Notification
'use client';

export function createSimpleAchievementNotification(achievement) {
  // Create a simple toast notification as fallback
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    z-index: 10000;
    max-width: 350px;
    font-family: 'Inter', sans-serif;
    animation: slideIn 0.5s ease-out;
  `;

  notification.innerHTML = `
    <div style="font-size: 14px; font-weight: bold; margin-bottom: 5px;">
      🏆 Achievement Unlocked!
    </div>
    <div style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">
      ${achievement.name || 'New Achievement'}
    </div>
    <div style="font-size: 14px; opacity: 0.9;">
      ${achievement.description || 'Congratulations on your achievement!'}
    </div>
  `;

  // Add animation styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;

  if (!document.querySelector('#achievement-notification-styles')) {
    style.id = 'achievement-notification-styles';
    document.head.appendChild(style);
  }

  document.body.appendChild(notification);

  // Auto remove after 5 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.5s ease-in';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 500);
  }, 5000);

  // Click to dismiss
  notification.addEventListener('click', () => {
    notification.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  });

  return notification;
}

// Enhanced achievement notification utility with fallback
export async function showAchievementWithFallback(achievements) {
  console.log('🔧 Attempting to show achievements with fallback system...');

  if (!achievements || achievements.length === 0) {
    console.log('🤷 No achievements to show');
    return;
  }

  // Try the main achievement system first
  try {
    if (
      window.showMultipleAchievements &&
      typeof window.showMultipleAchievements === 'function'
    ) {
      console.log('✅ Using main achievement notification system');
      window.showMultipleAchievements(achievements);
      return;
    }

    if (
      window.showAchievement &&
      typeof window.showAchievement === 'function'
    ) {
      console.log('✅ Using single achievement notification system');
      achievements.forEach((achievement, index) => {
        setTimeout(() => {
          window.showAchievement(achievement);
        }, index * 1000);
      });
      return;
    }
  } catch (error) {
    console.error('❌ Main achievement system failed:', error);
  }

  // Fallback to simple notifications
  console.log('🔄 Falling back to simple notification system');
  achievements.forEach((achievement, index) => {
    setTimeout(() => {
      createSimpleAchievementNotification(achievement);
    }, index * 1500);
  });
}
