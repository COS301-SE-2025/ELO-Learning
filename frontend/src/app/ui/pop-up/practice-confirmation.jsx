'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Confirmation modal for starting practice sessions
 * Follows the same pattern as BaselineTestPopup for consistent UX
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @param {string} props.topicName - Name of the topic for practice
 * @param {string} props.topicId - ID of the topic to practice
 */
export default function PracticeConfirmationPopup({
  isOpen,
  onClose,
  topicName,
  topicId,
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && !loading) {
        onClose();
      }
    };

    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
      // Clear any previous errors when modal opens
      setError('');
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, loading]);

  // Handle starting the practice session
  const handleStartSession = async () => {
    if (loading) return;

    if (!topicId) {
      console.error('No topicId provided to PracticeConfirmationPopup');
      setError('Invalid topic selected. Please try again.');
      return;
    }

    setLoading(true);
    setError(''); // Clear any previous errors

    try {
      // Navigate to the practice session
      router.push(`/topic/${topicId}`);
      onClose();
    } catch (error) {
      console.error('Error starting practice session:', error);
      setError('Failed to start session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle canceling the practice session
  const handleCancel = () => {
    if (!loading) {
      setError(''); // Clear any errors when canceling
      onClose();
    }
  };

  // Handle backdrop click to close modal
  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget && !loading) {
      setError(''); // Clear any errors when closing via backdrop
      onClose();
    }
  };

  // Don't render anything if not open
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="practice-confirmation-title"
      aria-describedby="practice-confirmation-description"
    >
      <div className="bg-[var(--background)] rounded-xl shadow-lg p-6 w-[90%] max-w-md">
        <h2
          id="practice-confirmation-title"
          className="text-2xl font-bold text-center mb-4"
        >
          Start Practice Session?
        </h2>
        <div id="practice-confirmation-description">
          <p className="text-center mb-2">
            Are you sure you want to do a{' '}
            <span className="font-semibold text-[var(--vector-violet)]">
              {topicName}
            </span>{' '}
            practice session?
          </p>
          <p className="text-center text-sm text-[var(--grey)] mb-6">
            This will start a new practice session with questions from this
            topic.
          </p>
        </div>

        {/* Error message display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 text-center font-medium">
              {error}
            </p>
          </div>
        )}

        <div className="flex gap-4">
          <button
            className="flex-1 py-2 font-bold rounded-lg bg-[var(--vector-violet)] text-white hover:bg-[var(--blueprint-blue)] disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--blueprint-blue)] focus:ring-offset-2"
            onClick={handleStartSession}
            disabled={loading}
            autoFocus
            aria-describedby="start-session-help"
          >
            {loading ? 'Starting Session...' : 'Start Session'}
          </button>
          <button
            className="flex-1 py-2 font-bold rounded-lg bg-[var(--grey)] hover:bg-[var(--vector-violet-light)] disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--vector-violet-light)] focus:ring-offset-2"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>

        {/* Hidden helper text for screen readers */}
        <div id="start-session-help" className="sr-only">
          Press Enter to start the practice session or Escape to cancel
        </div>
      </div>
    </div>
  );
}
