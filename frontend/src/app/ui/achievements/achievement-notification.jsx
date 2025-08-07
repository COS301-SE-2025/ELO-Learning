// app/ui/achievements/achievement-notification.jsx
'use client';
import { useEffect, useState } from 'react';
import AchievementBadge from './achievement-badge';

export default function AchievementNotification({
  achievement,
  show,
  onClose,
  duration = 4000,
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show && achievement) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, achievement, duration, onClose]);

  if (!achievement || !show) return null;

  // Get category color for the notification background
  const ACHIEVEMENT_COLORS = {
    Gameplay: '#B794F6',
    'ELO Rating': '#63B3ED',
    Streak: '#68D391',
    Wins: '#F6AD55',
    Losses: '#F56565',
    Profile: '#ED64A6',
    Match: '#4FD1C7',
    'Badge Collection': '#9F7AEA',
    Leaderboard: '#FBD38D',
    'Problem Solving': '#A0AEC0',
  };

  const categoryColor =
    ACHIEVEMENT_COLORS[achievement.AchievementCategories?.name] || '#63B3ED';

  return (
    <div
      className={`
        fixed top-4 left-1/2 transform -translate-x-1/2 z-50
        transition-all duration-500 ease-out
        ${
          isVisible
            ? 'translate-y-0 opacity-100 scale-100'
            : '-translate-y-full opacity-0 scale-95'
        }
      `}
    >
      <div
        className="bg-gray-900 text-white rounded-xl p-6 shadow-2xl border-2 min-w-[320px] backdrop-blur-sm"
        style={{
          borderColor: categoryColor,
          boxShadow: `0 20px 40px rgba(0,0,0,0.4), 0 0 20px ${categoryColor}40`,
        }}
      >
        <div className="flex items-center gap-4">
          {/* Achievement badge using your existing component */}
          <div className="flex-shrink-0">
            <AchievementBadge
              achievement={achievement}
              unlocked={true}
              size="small"
              progress={achievement.condition_value} // Fully completed
              showProgress={false}
            />
          </div>

          {/* Achievement info */}
          <div className="flex-1">
            <div
              className="font-bold text-sm uppercase tracking-wider mb-1"
              style={{ color: categoryColor }}
            >
              🎉 Achievement Unlocked!
            </div>
            <div className="font-bold text-white text-lg mb-1">
              {achievement.name}
            </div>
            <div className="text-gray-300 text-sm leading-relaxed">
              {achievement.description}
            </div>

            {/* Show category if available */}
            {achievement.AchievementCategories?.name && (
              <div className="mt-2">
                <span
                  className="text-xs px-2 py-1 rounded-full font-medium"
                  style={{
                    backgroundColor: `${categoryColor}20`,
                    color: categoryColor,
                    border: `1px solid ${categoryColor}40`,
                  }}
                >
                  {achievement.AchievementCategories.name}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Animated progress bar */}
        <div className="mt-4 w-full bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1500 ease-out"
            style={{
              backgroundColor: categoryColor,
              width: isVisible ? '100%' : '0%',
              transitionDelay: '0.3s',
              boxShadow: `0 0 10px ${categoryColor}60`,
            }}
          />
        </div>

        {/* Sparkle animation overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-1 h-1 rounded-full transition-all duration-1000 ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundColor: categoryColor,
                left: `${20 + i * 15}%`,
                top: `${10 + (i % 2) * 20}%`,
                animationDelay: `${i * 0.2}s`,
                animation: isVisible ? 'twinkle 2s infinite' : 'none',
              }}
            />
          ))}
        </div>
      </div>

      {/* CSS for sparkle animation */}
      <style jsx>{`
        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.5);
          }
        }
      `}</style>
    </div>
  );
}
