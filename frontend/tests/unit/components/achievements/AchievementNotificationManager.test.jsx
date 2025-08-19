/**
 * Unit Tests for Achievement Notification Manager Component
 * Tests the main achievement notification orchestration logic
 */

import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AchievementNotificationManager from '../../../../src/app/ui/achievements/achievement-notification-manager';

// Mock the AchievementNotification component
jest.mock(
  '../../../../src/app/ui/achievements/achievement-notification',
  () => {
    return function MockAchievementNotification({
      achievement,
      show,
      onClose,
      duration,
    }) {
      return (
        <div data-testid={`notification-${achievement.id}`}>
          <div data-testid="achievement-name">{achievement.name}</div>
          <div data-testid="achievement-description">
            {achievement.description}
          </div>
          <div data-testid="show-status">{show ? 'visible' : 'hidden'}</div>
          <button onClick={onClose} data-testid="close-btn">
            Close
          </button>
        </div>
      );
    };
  },
);

describe('AchievementNotificationManager', () => {
  let originalWindow;

  beforeEach(() => {
    originalWindow = global.window;
    global.window = {
      ...originalWindow,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    };
  });

  afterEach(() => {
    global.window = originalWindow;
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      render(<AchievementNotificationManager />);
      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('starts with no notifications', () => {
      render(<AchievementNotificationManager />);
      expect(screen.queryByTestId(/notification-/)).not.toBeInTheDocument();
    });
  });

  describe('Global Function Setup', () => {
    it('sets up global showAchievement function', () => {
      render(<AchievementNotificationManager />);

      expect(window.showAchievement).toBeDefined();
      expect(typeof window.showAchievement).toBe('function');
    });

    it('sets up global showMultipleAchievements function', () => {
      render(<AchievementNotificationManager />);

      expect(window.showMultipleAchievements).toBeDefined();
      expect(typeof window.showMultipleAchievements).toBe('function');
    });

    it('dispatches achievementSystemReady event', () => {
      render(<AchievementNotificationManager />);

      expect(window.dispatchEvent).toHaveBeenCalled();
      const calls = window.dispatchEvent.mock.calls;
      const readyEventCall = calls.find(
        (call) => call[0].type === 'achievementSystemReady',
      );
      expect(readyEventCall).toBeTruthy();
    });
  });

  describe('Single Achievement Display', () => {
    it('displays a single achievement notification', async () => {
      render(<AchievementNotificationManager />);

      const testAchievement = global.testUtils.createMockAchievement({
        id: 1,
        name: 'First Steps',
        description: 'Complete your first question',
      });

      act(() => {
        window.showAchievement(testAchievement);
      });

      await waitFor(() => {
        expect(screen.getByTestId('notification-1')).toBeInTheDocument();
      });

      expect(screen.getByTestId('achievement-name')).toHaveTextContent(
        'First Steps',
      );
      expect(screen.getByTestId('achievement-description')).toHaveTextContent(
        'Complete your first question',
      );
      expect(screen.getByTestId('show-status')).toHaveTextContent('visible');
    });

    it('handles achievement with missing data gracefully', async () => {
      render(<AchievementNotificationManager />);

      const incompleteAchievement = {
        id: 2,
        name: 'Incomplete',
        // Missing description and other fields
      };

      act(() => {
        window.showAchievement(incompleteAchievement);
      });

      await waitFor(() => {
        expect(screen.getByTestId('notification-2')).toBeInTheDocument();
      });

      expect(screen.getByTestId('achievement-name')).toHaveTextContent(
        'Incomplete',
      );
    });
  });

  describe('Multiple Achievement Display', () => {
    it('displays multiple achievements with staggered timing', async () => {
      jest.useFakeTimers();
      render(<AchievementNotificationManager />);

      const achievements = [
        global.testUtils.createMockAchievement({
          id: 1,
          name: 'Achievement 1',
        }),
        global.testUtils.createMockAchievement({
          id: 2,
          name: 'Achievement 2',
        }),
        global.testUtils.createMockAchievement({
          id: 3,
          name: 'Achievement 3',
        }),
      ];

      act(() => {
        window.showMultipleAchievements(achievements);
      });

      // First achievement should appear immediately
      await waitFor(() => {
        expect(screen.getByTestId('notification-1')).toBeInTheDocument();
      });

      // Second achievement after 1.5s
      act(() => {
        jest.advanceTimersByTime(1500);
      });

      await waitFor(() => {
        expect(screen.getByTestId('notification-2')).toBeInTheDocument();
      });

      // Third achievement after another 1.5s
      act(() => {
        jest.advanceTimersByTime(1500);
      });

      await waitFor(() => {
        expect(screen.getByTestId('notification-3')).toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    it('handles empty achievement array', () => {
      render(<AchievementNotificationManager />);

      expect(() => {
        window.showMultipleAchievements([]);
      }).not.toThrow();

      expect(() => {
        window.showMultipleAchievements(null);
      }).not.toThrow();
    });

    it('displays multiple notifications with correct positioning', async () => {
      render(<AchievementNotificationManager />);

      const achievements = [
        global.testUtils.createMockAchievement({
          id: 1,
          name: 'Achievement 1',
        }),
        global.testUtils.createMockAchievement({
          id: 2,
          name: 'Achievement 2',
        }),
      ];

      act(() => {
        achievements.forEach((achievement) => {
          window.showAchievement(achievement);
        });
      });

      await waitFor(() => {
        expect(screen.getByTestId('notification-1')).toBeInTheDocument();
        expect(screen.getByTestId('notification-2')).toBeInTheDocument();
      });

      // Check that notifications are positioned differently
      const notification1 = screen.getByTestId('notification-1').parentElement;
      const notification2 = screen.getByTestId('notification-2').parentElement;

      expect(notification1.style.top).toBe('20px');
      expect(notification2.style.top).toBe('140px'); // 20 + index * 120
    });
  });

  describe('Notification Dismissal', () => {
    it('removes notification when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<AchievementNotificationManager />);

      const testAchievement = global.testUtils.createMockAchievement({
        id: 1,
        name: 'Test Achievement',
      });

      act(() => {
        window.showAchievement(testAchievement);
      });

      await waitFor(() => {
        expect(screen.getByTestId('notification-1')).toBeInTheDocument();
      });

      const closeButton = screen.getByTestId('close-btn');
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByTestId('notification-1')).not.toBeInTheDocument();
      });
    });

    it('removes multiple notifications independently', async () => {
      const user = userEvent.setup();
      render(<AchievementNotificationManager />);

      const achievements = [
        global.testUtils.createMockAchievement({
          id: 1,
          name: 'Achievement 1',
        }),
        global.testUtils.createMockAchievement({
          id: 2,
          name: 'Achievement 2',
        }),
      ];

      act(() => {
        achievements.forEach((achievement) => {
          window.showAchievement(achievement);
        });
      });

      await waitFor(() => {
        expect(screen.getByTestId('notification-1')).toBeInTheDocument();
        expect(screen.getByTestId('notification-2')).toBeInTheDocument();
      });

      // Close first notification
      const firstCloseButton = screen.getAllByTestId('close-btn')[0];
      await user.click(firstCloseButton);

      await waitFor(() => {
        expect(screen.queryByTestId('notification-1')).not.toBeInTheDocument();
        expect(screen.getByTestId('notification-2')).toBeInTheDocument();
      });
    });
  });

  describe('Component Lifecycle', () => {
    it('cleans up global functions on unmount', () => {
      const { unmount } = render(<AchievementNotificationManager />);

      expect(window.showAchievement).toBeDefined();
      expect(window.showMultipleAchievements).toBeDefined();

      unmount();

      expect(window.showAchievement).toBeUndefined();
      expect(window.showMultipleAchievements).toBeUndefined();
    });
  });

  describe('Achievement Categories', () => {
    it('handles different achievement categories', async () => {
      render(<AchievementNotificationManager />);

      const achievementCategories = [
        'Gameplay',
        'ELO Rating',
        'Streak',
        'Problem Solving',
        'Badge Collection',
      ];

      for (let i = 0; i < achievementCategories.length; i++) {
        const achievement = global.testUtils.createMockAchievement({
          id: i + 1,
          name: `${achievementCategories[i]} Achievement`,
          AchievementCategories: { name: achievementCategories[i] },
        });

        act(() => {
          window.showAchievement(achievement);
        });

        await waitFor(() => {
          expect(
            screen.getByTestId(`notification-${i + 1}`),
          ).toBeInTheDocument();
        });
      }
    });
  });

  describe('Error Handling', () => {
    it('handles null achievement gracefully', () => {
      render(<AchievementNotificationManager />);

      expect(() => {
        act(() => {
          window.showAchievement(null);
        });
      }).not.toThrow();
    });

    it('handles undefined achievement gracefully', () => {
      render(<AchievementNotificationManager />);

      expect(() => {
        act(() => {
          window.showAchievement(undefined);
        });
      }).not.toThrow();
    });

    it('handles achievement without id', async () => {
      render(<AchievementNotificationManager />);

      const achievementWithoutId = {
        name: 'No ID Achievement',
        description: 'This achievement has no id',
      };

      expect(() => {
        act(() => {
          window.showAchievement(achievementWithoutId);
        });
      }).not.toThrow();
    });
  });

  describe('Performance and Memory', () => {
    it('handles rapid multiple achievement calls', async () => {
      render(<AchievementNotificationManager />);

      // Simulate rapid achievement unlocks
      for (let i = 0; i < 10; i++) {
        const achievement = global.testUtils.createMockAchievement({
          id: i,
          name: `Rapid Achievement ${i}`,
        });

        act(() => {
          window.showAchievement(achievement);
        });
      }

      // Should handle all achievements without crashing
      await waitFor(() => {
        const notifications = screen.queryAllByTestId(/notification-/);
        expect(notifications.length).toBe(10);
      });
    });
  });
});
