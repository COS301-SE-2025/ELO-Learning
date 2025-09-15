'use client';
import { fetchQuestionsByLevelAndTopic } from '@/services/api';
import { useSession } from 'next-auth/react';
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
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [navigating, setNavigating] = useState(false);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && !loading && !navigating) {
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
  }, [isOpen, onClose, loading, navigating]);

  // Handle cleanup when component unmounts during navigation
  useEffect(() => {
    return () => {
      // Reset loading state when component unmounts
      if (loading) {
        setLoading(false);
      }
    };
  }, [loading]);

  // Handle starting the practice session
  const handleStartSession = async () => {
    if (loading) return;

    if (!topicId) {
      console.error('No topicId provided to PracticeConfirmationPopup');
      setError('Invalid topic selected. Please try again.');
      return;
    }

    if (!session?.user) {
      setError('Please sign in to start a practice session.');
      return;
    }

    console.log('🚀 Starting practice session...');
    setLoading(true);
    setError(''); // Clear any previous errors

    try {
      // Get user's current level
      const level = session.user.currentLevel || 1;

      // Preload questions to ensure they're available before navigating
      console.log(
        `📚 Preloading questions for level ${level}, topic ${topicId}...`,
      );
      const questions = await fetchQuestionsByLevelAndTopic(level, topicId);

      console.log('📦 Questions response received:', questions);

      // Validate that we have questions
      let validQuestions = [];
      if (Array.isArray(questions)) {
        validQuestions = questions;
      } else if (questions && typeof questions === 'object') {
        validQuestions = questions.questions || questions.data || [];
      }

      if (!validQuestions || validQuestions.length === 0) {
        console.log('❌ No valid questions found');
        setError(
          'No questions available for this topic at your current level. Please try another topic.',
        );
        setLoading(false);
        return;
      }

      console.log(
        `✅ Successfully loaded ${validQuestions.length} questions. Navigating to practice session...`,
      );

      // Set navigating state to true
      setNavigating(true);

      // Use requestAnimationFrame to ensure the UI updates before navigation
      requestAnimationFrame(() => {
        router.push(`/topic/${topicId}`);
      });

      // Don't close the modal here - it will close when the page changes
    } catch (error) {
      console.error('💥 Error loading practice questions:', error);
      setError(
        'Failed to load questions. Please check your connection and try again.',
      );
      setLoading(false);
    }
  };

  // Handle canceling the practice session
  const handleCancel = () => {
    if (!loading && !navigating) {
      setError(''); // Clear any errors when canceling
      onClose();
    }
  };

  // Handle backdrop click to close modal
  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget && !loading && !navigating) {
      setError(''); // Clear any errors when closing via backdrop
      onClose();
    }
  };

  // Don't render anything if not open
  if (!isOpen) return null;

  return (
    <>
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
              className="main-button flex-1 py-2 font-bold rounded-lg bg-[var(--vector-violet)] text-white hover:bg-[var(--blueprint-blue)] disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--blueprint-blue)] focus:ring-offset-2"
              onClick={handleStartSession}
              disabled={loading || navigating}
              autoFocus
              aria-describedby="start-session-help"
            >
              Start Session
            </button>
            <button
              className="secondary-button flex-1 py-2 font-bold rounded-lg bg-[var(--grey)] hover:bg-[var(--vector-violet-light)] disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--vector-violet-light)] focus:ring-offset-2"
              onClick={handleCancel}
              disabled={loading || navigating}
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

      {/* Full-screen loading overlay */}
      {(loading || navigating) && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-[#201f1f]">
          <div className="flex flex-row items-center justify-center gap-2 mb-4">
            <div
              className="animate-bounce rounded-full h-5 w-5 bg-[#FF6E99]"
              style={{ animationDelay: '0ms' }}
            ></div>
            <div
              className="animate-bounce rounded-full h-5 w-5 bg-[#FF6E99]"
              style={{ animationDelay: '150ms' }}
            ></div>
            <div
              className="animate-bounce rounded-full h-5 w-5 bg-[#FF6E99]"
              style={{ animationDelay: '300ms' }}
            ></div>
          </div>
          <div className="font-bold text-center text-white">
            {navigating
              ? `Starting a practice session for ${topicName}...`
              : 'Loading Questions...'}
          </div>
        </div>
      )}
    </>
  );
}
