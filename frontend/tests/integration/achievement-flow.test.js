/**
 * Integration Tests for Achievement System
 * Tests the complete flow from achievement trigger to notification display
 */

import { act, render, screen, waitFor } from '@testing-library/react';
// import { http, HttpResponse } from 'msw';
// import { setupServer } from 'msw/node';
import AchievementNotificationManager from '../../src/app/ui/achievements/achievement-notification-manager';
import { showAchievementNotificationsWhenReady } from '../../src/utils/achievementNotifications';

// Mock fetch for API integration testing
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        success: true,
        message: 'Achievement progress updated',
        unlockedAchievements: [
          {
            id: 1,
            name: 'First Steps',
            description: 'Answer your first question correctly',
            condition_type: 'Questions Answered',
            condition_value: 1,
            AchievementCategories: { name: 'Gameplay' },
          },
        ],
      }),
  }),
);

// Skip the MSW server setup for now
const server = {
  listen: () => {},
  close: () => {},
  resetHandlers: () => {},
};

// TODO: Re-enable MSW once Jest ES module support is properly configured

describe('Achievement System Integration', () => {
  beforeAll(() => {
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
    jest.clearAllMocks();
  });

  afterAll(() => {
    server.close();
  });

  describe('Complete Achievement Flow', () => {
    it('displays notification when achievement is unlocked through API', async () => {
      // Render the notification manager
      render(<AchievementNotificationManager />);

      // Wait for system to be ready
      await waitFor(() => {
        expect(window.showAchievement).toBeDefined();
      });

      // Simulate API response triggering achievement
      const mockAchievement = {
        id: 1,
        name: 'API Achievement',
        description: 'Unlocked through API call',
        AchievementCategories: { name: 'API Integration' },
      };

      // Use the notification system
      act(() => {
        window.showAchievement(mockAchievement);
      });

      // Verify notification appears
      await waitFor(() => {
        expect(
          screen.getByText('🎉 Achievement Unlocked!'),
        ).toBeInTheDocument();
        expect(screen.getByText('API Achievement')).toBeInTheDocument();
        expect(
          screen.getByText('Unlocked through API call'),
        ).toBeInTheDocument();
      });
    });

    it('handles multiple achievements from single API call', async () => {
      render(<AchievementNotificationManager />);

      await waitFor(() => {
        expect(window.showMultipleAchievements).toBeDefined();
      });

      const multipleAchievements = [
        {
          id: 1,
          name: 'Combo Master',
          description: 'Answer 3 questions in a row',
          AchievementCategories: { name: 'Streak' },
        },
        {
          id: 2,
          name: 'Speed Demon',
          description: 'Answer quickly',
          AchievementCategories: { name: 'Performance' },
        },
      ];

      act(() => {
        window.showMultipleAchievements(multipleAchievements);
      });

      // First achievement should appear immediately
      await waitFor(() => {
        expect(screen.getByText('Combo Master')).toBeInTheDocument();
      });

      // Second achievement should appear after delay
      await waitFor(
        () => {
          expect(screen.getByText('Speed Demon')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });
  });

  describe('Practice Mode Integration', () => {
    it('triggers achievement during practice session', async () => {
      render(<AchievementNotificationManager />);

      await waitFor(() => {
        expect(window.showAchievement).toBeDefined();
      });

      // Simulate practice mode achievement
      const practiceAchievement = {
        id: 3,
        name: 'Practice Makes Perfect',
        description: 'Complete 10 practice questions',
        AchievementCategories: { name: 'Practice' },
      };

      // Simulate the utility function being called from practice mode
      await showAchievementNotificationsWhenReady([practiceAchievement]);

      await waitFor(() => {
        expect(screen.getByText('Practice Makes Perfect')).toBeInTheDocument();
        expect(
          screen.getByText('Complete 10 practice questions'),
        ).toBeInTheDocument();
        expect(screen.getByText('Practice')).toBeInTheDocument();
      });
    });

    it('handles achievement system not ready during practice', async () => {
      // Don't render notification manager initially
      const practiceAchievement = {
        id: 4,
        name: 'Early Achievement',
        description: 'Achievement before system ready',
      };

      // Try to show achievement before system is ready
      const showPromise = showAchievementNotificationsWhenReady(
        [practiceAchievement],
        2000,
      );

      // Now render the manager (system becomes ready)
      render(<AchievementNotificationManager />);

      // Wait for the promise to resolve
      await expect(showPromise).resolves.toBeUndefined();

      // Verify achievement appears
      await waitFor(() => {
        expect(screen.getByText('Early Achievement')).toBeInTheDocument();
      });
    });
  });

  describe('Topic Mastery Integration', () => {
    it('displays topic-specific achievements', async () => {
      render(<AchievementNotificationManager />);

      await waitFor(() => {
        expect(window.showAchievement).toBeDefined();
      });

      const topicAchievements = [
        {
          id: 5,
          name: 'Algebra Master',
          description: 'Master all algebra topics',
          AchievementCategories: { name: 'Topic Mastery' },
        },
        {
          id: 6,
          name: 'Geometry Guru',
          description: 'Excel in geometry problems',
          AchievementCategories: { name: 'Topic Mastery' },
        },
      ];

      // Show topic mastery achievements
      for (const achievement of topicAchievements) {
        act(() => {
          window.showAchievement(achievement);
        });

        await waitFor(() => {
          expect(screen.getByText(achievement.name)).toBeInTheDocument();
        });
      }
    });
  });

  describe('Real-time Notification Integration', () => {
    it('shows achievements immediately after earning', async () => {
      jest.useFakeTimers();

      render(<AchievementNotificationManager />);

      await waitFor(() => {
        expect(window.showAchievement).toBeDefined();
      });

      const realtimeAchievement = {
        id: 7,
        name: 'Lightning Fast',
        description: 'Answer within 5 seconds',
        AchievementCategories: { name: 'Speed' },
      };

      // Simulate real-time achievement earning
      act(() => {
        window.showAchievement(realtimeAchievement);
      });

      // Should appear immediately without delay
      expect(screen.getByText('Lightning Fast')).toBeInTheDocument();
      expect(screen.getByText('Answer within 5 seconds')).toBeInTheDocument();

      jest.useRealTimers();
    });

    it('handles rapid successive achievements', async () => {
      jest.useFakeTimers();

      render(<AchievementNotificationManager />);

      await waitFor(() => {
        expect(window.showAchievement).toBeDefined();
      });

      // Simulate rapid achievement unlocks
      const rapidAchievements = Array.from({ length: 5 }, (_, i) => ({
        id: 10 + i,
        name: `Rapid Achievement ${i + 1}`,
        description: `Achievement ${i + 1} in rapid succession`,
        AchievementCategories: { name: 'Rapid' },
      }));

      // Fire all achievements rapidly
      rapidAchievements.forEach((achievement) => {
        act(() => {
          window.showAchievement(achievement);
        });
      });

      // All should be queued and displayed
      for (const achievement of rapidAchievements) {
        expect(screen.getByText(achievement.name)).toBeInTheDocument();
      }

      jest.useRealTimers();
    });
  });

  describe('Error Handling Integration', () => {
    it('handles API errors gracefully', async () => {
      // Override server to return error
      server.use(
        http.post('/api/achievements/progress', () => {
          return HttpResponse.json(
            { success: false, error: 'Server error' },
            { status: 500 },
          );
        }),
      );

      render(<AchievementNotificationManager />);

      await waitFor(() => {
        expect(window.showAchievement).toBeDefined();
      });

      // System should still work for manually triggered achievements
      const manualAchievement = {
        id: 8,
        name: 'Manual Achievement',
        description: 'Triggered manually despite API error',
      };

      act(() => {
        window.showAchievement(manualAchievement);
      });

      await waitFor(() => {
        expect(screen.getByText('Manual Achievement')).toBeInTheDocument();
      });
    });

    it('recovers from notification system failures', async () => {
      render(<AchievementNotificationManager />);

      await waitFor(() => {
        expect(window.showAchievement).toBeDefined();
      });

      // Simulate system failure by removing functions
      delete window.showAchievement;
      delete window.showMultipleAchievements;

      const failureAchievement = {
        id: 9,
        name: 'Recovery Test',
        description: 'Should handle failure gracefully',
      };

      // This should fail gracefully
      await expect(
        showAchievementNotificationsWhenReady([failureAchievement], 1000),
      ).rejects.toThrow();

      // System should be able to recover if functions are restored
      window.showAchievement = jest.fn();

      const recoveryAchievement = {
        id: 10,
        name: 'Recovery Success',
        description: 'System recovered successfully',
      };

      await expect(
        showAchievementNotificationsWhenReady([recoveryAchievement]),
      ).resolves.toBeUndefined();
    });
  });

  describe('Performance Integration', () => {
    it('handles high-frequency achievement checks', async () => {
      render(<AchievementNotificationManager />);

      await waitFor(() => {
        expect(window.showAchievement).toBeDefined();
      });

      // Simulate game with frequent achievement checks
      const performanceTest = async () => {
        for (let i = 0; i < 20; i++) {
          const achievement = {
            id: 100 + i,
            name: `Performance Test ${i}`,
            description: `Testing performance with achievement ${i}`,
          };

          await showAchievementNotificationsWhenReady([achievement]);
        }
      };

      // Should complete without significant delay or memory issues
      const startTime = Date.now();
      await performanceTest();
      const duration = Date.now() - startTime;

      // Should complete reasonably quickly (adjust threshold as needed)
      expect(duration).toBeLessThan(5000);
    });

    it('cleans up properly during unmount', async () => {
      const { unmount } = render(<AchievementNotificationManager />);

      await waitFor(() => {
        expect(window.showAchievement).toBeDefined();
      });

      // Verify functions exist
      expect(window.showAchievement).toBeDefined();
      expect(window.showMultipleAchievements).toBeDefined();

      // Unmount component
      unmount();

      // Functions should be cleaned up
      expect(window.showAchievement).toBeUndefined();
      expect(window.showMultipleAchievements).toBeUndefined();
    });
  });

  describe('Cross-Component Integration', () => {
    it('integrates with question components', async () => {
      render(<AchievementNotificationManager />);

      await waitFor(() => {
        expect(window.showAchievement).toBeDefined();
      });

      // Simulate achievement from question completion
      const questionAchievement = {
        id: 11,
        name: 'Question Master',
        description: 'Answer 100 questions correctly',
        AchievementCategories: { name: 'Questions' },
      };

      // This would typically be called from question submission logic
      act(() => {
        window.showAchievement(questionAchievement);
      });

      await waitFor(() => {
        expect(screen.getByText('Question Master')).toBeInTheDocument();
        expect(
          screen.getByText('Answer 100 questions correctly'),
        ).toBeInTheDocument();
        expect(screen.getByText('Questions')).toBeInTheDocument();
      });
    });

    it('integrates with user profile updates', async () => {
      render(<AchievementNotificationManager />);

      await waitFor(() => {
        expect(window.showAchievement).toBeDefined();
      });

      // Simulate achievement from profile milestone
      const profileAchievement = {
        id: 12,
        name: 'Profile Complete',
        description: 'Complete your user profile',
        AchievementCategories: { name: 'Profile' },
      };

      act(() => {
        window.showAchievement(profileAchievement);
      });

      await waitFor(() => {
        expect(screen.getByText('Profile Complete')).toBeInTheDocument();
        expect(
          screen.getByText('Complete your user profile'),
        ).toBeInTheDocument();
        expect(screen.getByText('Profile')).toBeInTheDocument();
      });
    });
  });
});
