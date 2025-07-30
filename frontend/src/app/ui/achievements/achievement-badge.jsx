// app/ui/achievements/achievement-badge.jsx
import { Star } from 'lucide-react';

const ACHIEVEMENT_COLORS = {
  'Gameplay': '#B794F6',      // Purple
  'ELO Rating': '#63B3ED',    // Blue  
  'Streak': '#68D391',        // Green
  'Wins': '#F6AD55',          // Orange
  'Losses': '#F56565',        // Red
  'Profile': '#ED64A6',       // Pink
  'Match': '#4FD1C7',         // Teal
  'Badge Collection': '#9F7AEA', // Deep Purple
  'Leaderboard': '#FBD38D',   // Yellow
  'Problem Solving': '#A0AEC0' // Gray
};

export default function AchievementBadge({ 
  achievement, 
  unlocked = false, 
  progress = 0,
  showProgress = false,
  size = 'normal',
  onClick = null 
}) {
  const categoryColor = ACHIEVEMENT_COLORS[achievement.AchievementCategories?.name] || '#A0AEC0';
  const progressPercentage = achievement.condition_value > 0 
    ? Math.min(100, (progress / achievement.condition_value) * 100) 
    : 0;

  const sizeClasses = {
    small: 'w-16 h-20',
    normal: 'w-20 h-24',
    large: 'w-24 h-28'
  };

  const starSize = {
    small: 16,
    normal: 20,
    large: 24
  };

  return (
    <div 
      className={`flex flex-col items-center ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {/* Badge Shield */}
      <div className={`${sizeClasses[size]} relative`}>
        <svg viewBox="0 0 100 120" className="w-full h-full">
          {/* Shield background */}
          <path
            d="M50 5 L20 20 L20 70 Q20 85 50 110 Q80 85 80 70 L80 20 Z"
            fill={unlocked ? categoryColor : '#4A5568'}
            stroke={unlocked ? 'none' : '#2D3748'}
            strokeWidth="1"
          />
          
          {/* Progress bar background (if showing progress) */}
          {showProgress && !unlocked && (
            <>
              <rect
                x="25" y="95" width="50" height="8" 
                fill="#2D3748" 
                rx="4"
              />
              <rect
                x="25" y="95" 
                width={50 * (progressPercentage / 100)} 
                height="8" 
                fill={categoryColor} 
                rx="4"
              />
            </>
          )}
          
          {/* Star icon */}
          <g transform="translate(50, 55)">
            <Star 
              size={starSize[size]} 
              fill={unlocked ? '#1A202C' : '#4A5568'} 
              stroke={unlocked ? '#1A202C' : '#4A5568'}
              x="-10" y="-10"
            />
          </g>
        </svg>
      </div>

      {/* Achievement name */}
      <div className="mt-1 text-center">
        <p className={`text-xs font-medium ${unlocked ? 'text-white' : 'text-gray-500'}`}>
          {achievement.name}
        </p>
        {showProgress && !unlocked && (
          <p className="text-xs text-gray-400">
            {progress}/{achievement.condition_value}
          </p>
        )}
      </div>
    </div>
  );
}