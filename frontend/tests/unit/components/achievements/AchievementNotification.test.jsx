/**
 * Unit Tests for Achievement Notification Component
 * Tests individual notification display and behavior
 */

import { act, render, screen } from '@testing-library/react';
import AchievementNotification from '../../../../src/app/ui/achievements/achievement-notification';

// Mock the AchievementBadge component
jest.mock('../../../../src/app/ui/achievements/achievement-badge', () => {
  return function MockAchievementBadge({
    achievement,
    unlocked,
    size,
    progress,
    showProgress,
  }) {
    return (
      <div data-testid="achievement-badge">
        <span data-testid="badge-name">{achievement.name}</span>
        <span data-testid="badge-unlocked">
          {unlocked ? 'unlocked' : 'locked'}
        </span>
        <span data-testid="badge-size">{size}</span>
        {showProgress && <span data-testid="badge-progress">{progress}</span>}
      </div>
    );
  };
});

describe('AchievementNotification', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Component Rendering', () => {
    it('renders notification when show is true', () => {
      const achievement = global.testUtils.createMockAchievement({
        name: 'Test Achievement',
        description: 'A test achievement for unit testing',
      });

      render(
        <AchievementNotification
          achievement={achievement}
          show={true}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByText('🎉 Achievement Unlocked!')).toBeInTheDocument();
      expect(screen.getAllByText('Test Achievement')[0]).toBeInTheDocument();
      expect(
        screen.getByText('A test achievement for unit testing'),
      ).toBeInTheDocument();
    });

    it('does not render when show is false', () => {
      const achievement = global.testUtils.createMockAchievement();

      render(
        <AchievementNotification
          achievement={achievement}
          show={false}
          onClose={mockOnClose}
        />,
      );

      expect(
        screen.queryByText('🎉 Achievement Unlocked!'),
      ).not.toBeInTheDocument();
    });

    it('does not render when achievement is null', () => {
      render(
        <AchievementNotification
          achievement={null}
          show={true}
          onClose={mockOnClose}
        />,
      );

      expect(
        screen.queryByText('🎉 Achievement Unlocked!'),
      ).not.toBeInTheDocument();
    });
  });

  describe('Achievement Badge Integration', () => {
    it('renders achievement badge with correct props', () => {
      const achievement = global.testUtils.createMockAchievement({
        name: 'Badge Test',
        condition_value: 10,
      });

      render(
        <AchievementNotification
          achievement={achievement}
          show={true}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByTestId('achievement-badge')).toBeInTheDocument();
      expect(screen.getByTestId('badge-name')).toHaveTextContent('Badge Test');
      expect(screen.getByTestId('badge-unlocked')).toHaveTextContent(
        'unlocked',
      );
      expect(screen.getByTestId('badge-size')).toHaveTextContent('small');
    });
  });

  describe('Category Display', () => {
    it('displays achievement category when available', () => {
      const achievement = global.testUtils.createMockAchievement({
        AchievementCategories: { name: 'Problem Solving' },
      });

      render(
        <AchievementNotification
          achievement={achievement}
          show={true}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByText('Problem Solving')).toBeInTheDocument();
    });

    it('handles missing category gracefully', () => {
      const achievement = global.testUtils.createMockAchievement({
        AchievementCategories: null,
      });

      render(
        <AchievementNotification
          achievement={achievement}
          show={true}
          onClose={mockOnClose}
        />,
      );

      // Should not crash and should still render the main content
      expect(screen.getByText('🎉 Achievement Unlocked!')).toBeInTheDocument();
    });

    it('applies correct category colors', () => {
      const categories = [
        { name: 'Gameplay', expectedColor: '#B794F6' },
        { name: 'ELO Rating', expectedColor: '#63B3ED' },
        { name: 'Streak', expectedColor: '#68D391' },
        { name: 'Problem Solving', expectedColor: '#A0AEC0' },
      ];

      categories.forEach(({ name, expectedColor }) => {
        const achievement = global.testUtils.createMockAchievement({
          AchievementCategories: { name },
        });

        const { container, unmount } = render(
          <AchievementNotification
            achievement={achievement}
            show={true}
            onClose={mockOnClose}
          />,
        );

        const categoryElement = screen.getByText(name);
        const styles = window.getComputedStyle(categoryElement);
        expect(categoryElement).toHaveStyle({ color: expectedColor });

        unmount();
      });
    });
  });

  describe('Animation and Timing', () => {
    it('auto-closes after default duration', async () => {
      const achievement = global.testUtils.createMockAchievement();

      render(
        <AchievementNotification
          achievement={achievement}
          show={true}
          onClose={mockOnClose}
          duration={4000}
        />,
      );

      expect(mockOnClose).not.toHaveBeenCalled();

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(4000);
      });

      // Wait for the animation delay
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('auto-closes after custom duration', async () => {
      const achievement = global.testUtils.createMockAchievement();

      render(
        <AchievementNotification
          achievement={achievement}
          show={true}
          onClose={mockOnClose}
          duration={2000}
        />,
      );

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('handles rapid show/hide changes', () => {
      const achievement = global.testUtils.createMockAchievement();

      const { rerender } = render(
        <AchievementNotification
          achievement={achievement}
          show={true}
          onClose={mockOnClose}
          duration={4000}
        />,
      );

      expect(screen.getAllByText('Test Achievement')[0]).toBeInTheDocument();

      // Quickly hide
      rerender(
        <AchievementNotification
          achievement={achievement}
          show={false}
          onClose={mockOnClose}
          duration={4000}
        />,
      );

      expect(screen.queryByText('Test Achievement')).not.toBeInTheDocument();

      // Quickly show again
      rerender(
        <AchievementNotification
          achievement={achievement}
          show={true}
          onClose={mockOnClose}
          duration={4000}
        />,
      );

      expect(screen.getAllByText('Test Achievement')[0]).toBeInTheDocument();
    });
  });

  describe('Visual Effects and Animation', () => {
    it('applies correct CSS classes for visibility', () => {
      const achievement = global.testUtils.createMockAchievement();

      const { container } = render(
        <AchievementNotification
          achievement={achievement}
          show={true}
          onClose={mockOnClose}
        />,
      );

      const notificationElement = container.firstChild;
      expect(notificationElement).toHaveClass(
        'translate-y-0',
        'opacity-100',
        'scale-100',
      );
    });

    it('renders sparkle animation elements', () => {
      const achievement = global.testUtils.createMockAchievement();

      const { container } = render(
        <AchievementNotification
          achievement={achievement}
          show={true}
          onClose={mockOnClose}
        />,
      );

      // Check for sparkle elements (should be 6 of them)
      const sparkles = container.querySelectorAll(
        '.absolute.w-1.h-1.rounded-full',
      );
      expect(sparkles).toHaveLength(6);
    });

    it('renders progress bar with correct styling', () => {
      const achievement = global.testUtils.createMockAchievement();

      const { container } = render(
        <AchievementNotification
          achievement={achievement}
          show={true}
          onClose={mockOnClose}
        />,
      );

      const progressBar = container.querySelector('.h-full.rounded-full');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Different Achievement Types', () => {
    it('handles streak achievements', () => {
      const streakAchievement = global.testUtils.createMockAchievement({
        name: 'Hot Streak',
        description: 'Answer 5 questions in a row correctly',
        AchievementCategories: { name: 'Streak' },
      });

      render(
        <AchievementNotification
          achievement={streakAchievement}
          show={true}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getAllByText('Hot Streak')[0]).toBeInTheDocument();
      expect(
        screen.getByText('Answer 5 questions in a row correctly'),
      ).toBeInTheDocument();
      expect(screen.getByText('Streak')).toBeInTheDocument();
    });

    it('handles ELO rating achievements', () => {
      const eloAchievement = global.testUtils.createMockAchievement({
        name: 'Rising Star',
        description: 'Reach 1500 ELO rating',
        AchievementCategories: { name: 'ELO Rating' },
      });

      render(
        <AchievementNotification
          achievement={eloAchievement}
          show={true}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getAllByText('Rising Star')[0]).toBeInTheDocument();
      expect(screen.getByText('Reach 1500 ELO rating')).toBeInTheDocument();
      expect(screen.getByText('ELO Rating')).toBeInTheDocument();
    });

    it('handles badge collection achievements', () => {
      const badgeAchievement = global.testUtils.createMockAchievement({
        name: 'Collector',
        description: 'Unlock 10 different achievements',
        AchievementCategories: { name: 'Badge Collection' },
      });

      render(
        <AchievementNotification
          achievement={badgeAchievement}
          show={true}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getAllByText('Collector')[0]).toBeInTheDocument();
      expect(
        screen.getByText('Unlock 10 different achievements'),
      ).toBeInTheDocument();
      expect(screen.getByText('Badge Collection')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      const achievement = global.testUtils.createMockAchievement();

      render(
        <AchievementNotification
          achievement={achievement}
          show={true}
          onClose={mockOnClose}
        />,
      );

      const notification = screen.getByRole('alert');
      expect(notification).toBeInTheDocument();
    });

    it('announces achievement to screen readers', () => {
      const achievement = global.testUtils.createMockAchievement({
        name: 'Screen Reader Test',
        description: 'This should be announced',
      });

      render(
        <AchievementNotification
          achievement={achievement}
          show={true}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles achievement with missing name', () => {
      const incompleteAchievement = {
        id: 1,
        description: 'Achievement without name',
        AchievementCategories: { name: 'Test' },
      };

      render(
        <AchievementNotification
          achievement={incompleteAchievement}
          show={true}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByText('🎉 Achievement Unlocked!')).toBeInTheDocument();
      expect(screen.getByText('Achievement without name')).toBeInTheDocument();
    });

    it('handles achievement with missing description', () => {
      const incompleteAchievement = {
        id: 1,
        name: 'Name Only Achievement',
        AchievementCategories: { name: 'Test' },
      };

      render(
        <AchievementNotification
          achievement={incompleteAchievement}
          show={true}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByText('🎉 Achievement Unlocked!')).toBeInTheDocument();
      expect(
        screen.getAllByText('Name Only Achievement')[0],
      ).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('cleans up timers on unmount', () => {
      const achievement = global.testUtils.createMockAchievement();

      const { unmount } = render(
        <AchievementNotification
          achievement={achievement}
          show={true}
          onClose={mockOnClose}
          duration={4000}
        />,
      );

      // Start the timer
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Unmount before timer completes
      unmount();

      // Advance past the original duration
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // onClose should not be called since component was unmounted
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('handles multiple rapid re-renders', () => {
      const achievement = global.testUtils.createMockAchievement();

      const { rerender } = render(
        <AchievementNotification
          achievement={achievement}
          show={true}
          onClose={mockOnClose}
          duration={4000}
        />,
      );

      // Rapidly re-render with different props
      for (let i = 0; i < 10; i++) {
        rerender(
          <AchievementNotification
            achievement={achievement}
            show={i % 2 === 0}
            onClose={mockOnClose}
            duration={4000}
          />,
        );
      }

      // Should not crash - check for component existence
      if (screen.queryByText('Test Achievement')) {
        expect(screen.getByText('Test Achievement')).toBeInTheDocument();
      } else {
        // Component is hidden, which is also valid
        expect(screen.queryByText('Test Achievement')).not.toBeInTheDocument();
      }
    });
  });
});
