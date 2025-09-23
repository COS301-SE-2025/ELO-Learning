'use client';

import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Toast({
  message,
  type = 'info',
  show,
  onClose,
  duration = 3000,
  position = 'top-center',
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 text-white border-green-500';
      case 'error':
        return 'bg-red-600 text-white border-red-500';
      case 'warning':
        return 'bg-yellow-600 text-white border-yellow-500';
      default:
        return 'bg-blue-600 text-white border-blue-500';
    }
  };

  const getPosition = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 left-1/2 transform -translate-x-1/2';
    }
  };

  return (
    <div
      className={`
        fixed z-50 transition-all duration-300 ease-out
        ${getPosition()}
        ${
          isVisible
            ? 'translate-y-0 opacity-100 scale-100'
            : '-translate-y-2 opacity-0 scale-95'
        }
      `}
    >
      <div
        className={`
          flex items-center gap-3 px-4 py-3 rounded-lg border-2 shadow-lg backdrop-blur-sm
          max-w-sm min-w-[200px]
          ${getColors()}
        `}
      >
        {getIcon()}
        <span className="flex-1 text-sm font-medium">{message}</span>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="ml-2 p-0.5 rounded-full hover:bg-white/20 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Hook for managing toast state
export function useToast() {
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'info',
  });

  const showToast = (message, type = 'info', duration = 3000) => {
    setToast({ show: true, message, type, duration });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  return {
    toast,
    showToast,
    hideToast,
  };
}
