'use client';
import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function InstallInstructionsPopup({
  isOpen,
  onClose,
  userAgent,
}) {
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when popup is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getInstructions = () => {
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
      return {
        title: 'Install on iOS',
        steps: [
          'Open this page in Safari browser',
          'Tap the Share button (square with arrow up)',
          'Scroll down and select "Add to Home Screen"',
          'Tap "Add" to install the app',
        ],
        note: 'The app will appear on your home screen like a native app!',
      };
    } else if (userAgent.includes('Android')) {
      return {
        title: 'Install on Android',
        steps: [
          'Open the browser menu (three dots)',
          'Look for "Add to Home Screen" or "Install App"',
          'Tap the option to install',
          'Confirm the installation',
        ],
        note: 'You can also look for an install banner at the top of the page.',
      };
    } else {
      return {
        title: 'Install on Desktop',
        steps: [
          "Look for an install icon in your browser's address bar",
          'Or check the browser menu for "Install" options',
          'Click the install option when available',
          'Bookmark this page for quick access',
        ],
        note: 'Installation options vary by browser (Chrome, Firefox, Edge, etc.)',
      };
    }
  };

  const instructions = getInstructions();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backdropFilter: 'blur(5px)',
        backgroundColor: 'rgba(189, 134, 248, 0.1)',
      }}
    >
      <div className="bg-[#202123] border border-[#BD86F8] rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-[#BD86F8]">
            {instructions.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close popup"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-white mb-6">
            Install ELO Learning for a better experience with offline access and
            app-like functionality!
          </p>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[#FF6E99]">
              How to install:
            </h3>
            <ol className="space-y-3">
              {instructions.steps.map((step, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-gray-300"
                >
                  <span className="flex-shrink-0 w-6 h-6 bg-[#BD86F8] text-black text-sm font-semibold rounded-full flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {instructions.note && (
            <div className="mt-6 p-4 bg-[#BD86F8] bg-opacity-10 border border-[#BD86F8] border-opacity-30 rounded-lg">
              <p className="text-sm text-[#201f1f] font-bold">
                💡 {instructions.note}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-[#BD86F8] text-black px-4 py-2 rounded-lg font-semibold hover:bg-[#a674e6] transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
