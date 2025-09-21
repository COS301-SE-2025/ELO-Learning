'use client';
import { TrendingDown, TrendingUp, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function RankNotification({
  rankChange,
  show,
  onClose,
  duration = 5000,
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show && rankChange) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, rankChange, duration, onClose]);

  if (!rankChange || !show) return null;

  const { oldRank, newRank, isPromotion } = rankChange;

  // Get colors using app's light purple theme
  const getNotificationColors = () => {
    // Use the same purple theme for both promotions and demotions
    return {
      bg: 'bg-gradient-to-r from-[#bd86f8] to-[#7d32ce]', // vector-violet-light to vector-violet
      border: 'border-[#bd86f8]',
      glow: 'shadow-[#bd86f8]/50',
      icon: isPromotion ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />,
      text: isPromotion ? 'Rank Up!' : 'Rank Change',
      emoji: isPromotion ? '🎉' : '📊'
    };
  };

  const colors = getNotificationColors();

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 transition-all duration-500 ease-out transform
        ${isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
      `}
      role="alert"
      aria-live="polite"
      aria-label={`${colors.text}: ${oldRank} to ${newRank}`}
    >
      {/* Main notification container */}
      <div
        className={`
          relative overflow-hidden rounded-xl border-2 shadow-2xl backdrop-blur-sm
          max-w-sm min-w-[300px] p-4
          ${colors.bg} ${colors.border} ${colors.glow}
        `}
      >
        {/* Animated background gradient */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 transition-opacity duration-1000"
          style={{
            opacity: isVisible ? 1 : 0,
            animation: isVisible ? 'shimmer 2s ease-in-out infinite' : 'none'
          }}
        />

        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-shrink-0 text-white">
            {colors.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white leading-tight">
              {colors.emoji} {colors.text}
            </h3>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="flex-shrink-0 text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/20"
            aria-label="Close notification"
          >
            ×
          </button>
        </div>

        {/* Rank change display */}
        <div className="flex items-center justify-center space-x-3 py-2">
          {/* Old rank */}
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm mb-1">
              <Trophy className="w-6 h-6 text-white/70" />
            </div>
            <span className="text-xs text-white/70 font-medium">{oldRank}</span>
          </div>

          {/* Arrow */}
          <div className="flex flex-col items-center">
            <div className={`text-2xl text-white font-bold transition-transform duration-500 ${isVisible ? 'scale-110' : 'scale-100'}`}>
              →
            </div>
          </div>

          {/* New rank */}
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm mb-1 border-2 border-white/50">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm text-white font-bold">{newRank}</span>
          </div>
        </div>

        {/* Congratulatory message */}
        <div className="text-center mt-3">
          <p className="text-sm text-white/90 font-medium">
            {isPromotion 
              ? `Congratulations on reaching ${newRank}!` 
              : `You are now in ${newRank}`
            }
          </p>
        </div>

        {/* Sparkle animation overlay for promotions */}
        {isPromotion && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-1 h-1 bg-white rounded-full transition-all duration-1000 ${
                  isVisible ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  left: `${15 + i * 10}%`,
                  top: `${10 + (i % 3) * 30}%`,
                  animationDelay: `${i * 0.2}s`,
                  animation: isVisible ? 'twinkle 2s infinite' : 'none',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.5);
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}