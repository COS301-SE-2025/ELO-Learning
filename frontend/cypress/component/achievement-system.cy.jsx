/**
 * Cypress Component Tests for Achievement System
 * Tests achievement components in isolation using Cypress component testing
 */

import AchievementNotification from '../../src/app/ui/achievements/achievement-notification';
import AchievementNotificationManager from '../../src/app/ui/achievements/achievement-notification-manager';

describe('Achievement Notification Manager Component', () => {
  beforeEach(() => {
    // Set up global window mocks
    cy.window().then((win) => {
      win.showAchievement = undefined;
      win.showMultipleAchievements = undefined;
    });
  });

  it('mounts and sets up global functions', () => {
    cy.mount(<AchievementNotificationManager />);

    cy.window()
      .should('have.property', 'showAchievement')
      .and('be.a', 'function');
    cy.window()
      .should('have.property', 'showMultipleAchievements')
      .and('be.a', 'function');
  });

  it('displays single achievement notification', () => {
    cy.mount(<AchievementNotificationManager />);

    const testAchievement = {
      id: 1,
      name: 'Component Test Achievement',
      description: 'Testing achievement display in component test',
      AchievementCategories: { name: 'Testing' },
    };

    cy.window().then((win) => {
      win.showAchievement(testAchievement);
    });

    cy.contains('🎉 Achievement Unlocked!').should('be.visible');
    cy.contains('Component Test Achievement').should('be.visible');
    cy.contains('Testing achievement display in component test').should(
      'be.visible',
    );
    cy.contains('Testing').should('be.visible');
  });

  it('displays multiple achievements with staggered timing', () => {
    cy.mount(<AchievementNotificationManager />);

    const achievements = [
      {
        id: 1,
        name: 'First Achievement',
        description: 'First in sequence',
        AchievementCategories: { name: 'Sequence' },
      },
      {
        id: 2,
        name: 'Second Achievement',
        description: 'Second in sequence',
        AchievementCategories: { name: 'Sequence' },
      },
    ];

    cy.window().then((win) => {
      win.showMultipleAchievements(achievements);
    });

    // First achievement should appear immediately
    cy.contains('First Achievement').should('be.visible');

    // Second achievement should appear after delay
    cy.contains('Second Achievement', { timeout: 2000 }).should('be.visible');

    // Both should be visible
    cy.contains('First Achievement').should('be.visible');
    cy.contains('Second Achievement').should('be.visible');
  });

  it('handles rapid achievement calls', () => {
    cy.mount(<AchievementNotificationManager />);

    const rapidAchievements = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      name: `Rapid Achievement ${i + 1}`,
      description: `Rapid test ${i + 1}`,
      AchievementCategories: { name: 'Rapid' },
    }));

    cy.window().then((win) => {
      rapidAchievements.forEach((achievement) => {
        win.showAchievement(achievement);
      });
    });

    // All achievements should be displayed
    rapidAchievements.forEach((achievement) => {
      cy.contains(achievement.name).should('be.visible');
    });
  });

  it('positions multiple notifications correctly', () => {
    cy.mount(<AchievementNotificationManager />);

    const achievements = [
      { id: 1, name: 'Top Achievement', description: 'Should be at top' },
      { id: 2, name: 'Middle Achievement', description: 'Should be in middle' },
      { id: 3, name: 'Bottom Achievement', description: 'Should be at bottom' },
    ];

    cy.window().then((win) => {
      achievements.forEach((achievement) => {
        win.showAchievement(achievement);
      });
    });

    // Check positioning - first notification should be at top (20px)
    cy.contains('Top Achievement').parent().should('have.css', 'top', '20px');

    // Second notification should be lower (140px = 20 + 120)
    cy.contains('Middle Achievement')
      .parent()
      .should('have.css', 'top', '140px');

    // Third notification should be even lower (260px = 20 + 2*120)
    cy.contains('Bottom Achievement')
      .parent()
      .should('have.css', 'top', '260px');
  });

  it('cleans up global functions on unmount', () => {
    cy.mount(<AchievementNotificationManager />).then(
      ({ component, rerender }) => {
        cy.window().should('have.property', 'showAchievement');

        // Unmount component
        rerender(null);

        cy.window().should('not.have.property', 'showAchievement');
        cy.window().should('not.have.property', 'showMultipleAchievements');
      },
    );
  });
});

describe('Achievement Notification Component', () => {
  const mockAchievement = {
    id: 1,
    name: 'Test Achievement',
    description: 'This is a test achievement for component testing',
    condition_value: 10,
    AchievementCategories: { name: 'Testing' },
  };

  it('renders when show is true', () => {
    const onClose = cy.stub();

    cy.mount(
      <AchievementNotification
        achievement={mockAchievement}
        show={true}
        onClose={onClose}
      />,
    );

    cy.contains('🎉 Achievement Unlocked!').should('be.visible');
    cy.contains('Test Achievement').should('be.visible');
    cy.contains('This is a test achievement for component testing').should(
      'be.visible',
    );
    cy.contains('Testing').should('be.visible');
  });

  it('does not render when show is false', () => {
    const onClose = cy.stub();

    cy.mount(
      <AchievementNotification
        achievement={mockAchievement}
        show={false}
        onClose={onClose}
      />,
    );

    cy.contains('🎉 Achievement Unlocked!').should('not.exist');
  });

  it('does not render when achievement is null', () => {
    const onClose = cy.stub();

    cy.mount(
      <AchievementNotification
        achievement={null}
        show={true}
        onClose={onClose}
      />,
    );

    cy.contains('🎉 Achievement Unlocked!').should('not.exist');
  });

  it('auto-dismisses after duration', () => {
    const onClose = cy.stub().as('onClose');

    cy.mount(
      <AchievementNotification
        achievement={mockAchievement}
        show={true}
        onClose={onClose}
        duration={1000} // 1 second for faster testing
      />,
    );

    cy.contains('Test Achievement').should('be.visible');

    // Should auto-dismiss after duration + animation delay
    cy.get('@onClose').should('have.been.calledOnce');
  });

  it('displays different achievement categories with correct colors', () => {
    const categories = [
      { name: 'Gameplay', color: 'rgb(183, 148, 246)' }, // #B794F6
      { name: 'ELO Rating', color: 'rgb(99, 179, 237)' }, // #63B3ED
      { name: 'Streak', color: 'rgb(104, 211, 145)' }, // #68D391
      { name: 'Problem Solving', color: 'rgb(160, 174, 192)' }, // #A0AEC0
    ];

    categories.forEach(({ name, color }) => {
      const categoryAchievement = {
        ...mockAchievement,
        AchievementCategories: { name },
      };

      cy.mount(
        <AchievementNotification
          achievement={categoryAchievement}
          show={true}
          onClose={cy.stub()}
        />,
      );

      cy.contains(name).should('be.visible').and('have.css', 'color', color);

      // Clean up for next iteration
      cy.mount(<div />);
    });
  });

  it('handles missing category gracefully', () => {
    const achievementWithoutCategory = {
      ...mockAchievement,
      AchievementCategories: null,
    };

    cy.mount(
      <AchievementNotification
        achievement={achievementWithoutCategory}
        show={true}
        onClose={cy.stub()}
      />,
    );

    cy.contains('🎉 Achievement Unlocked!').should('be.visible');
    cy.contains('Test Achievement').should('be.visible');
  });

  it('renders sparkle animation effects', () => {
    cy.mount(
      <AchievementNotification
        achievement={mockAchievement}
        show={true}
        onClose={cy.stub()}
      />,
    );

    // Check for sparkle elements (should be 6 of them)
    cy.get('.absolute.w-1.h-1.rounded-full').should('have.length', 6);
  });

  it('displays progress bar', () => {
    cy.mount(
      <AchievementNotification
        achievement={mockAchievement}
        show={true}
        onClose={cy.stub()}
      />,
    );

    // Check for progress bar container
    cy.get('.bg-gray-700.rounded-full.h-2').should('exist');

    // Check for progress fill
    cy.get('.h-full.rounded-full').should('exist');
  });

  it('integrates with AchievementBadge component', () => {
    cy.mount(
      <AchievementNotification
        achievement={mockAchievement}
        show={true}
        onClose={cy.stub()}
      />,
    );

    // The AchievementBadge component should be rendered
    // (We can't test the exact badge without mocking, but we can verify the structure)
    cy.get('[data-testid="achievement-badge"]').should('exist');
  });

  it('handles achievements with different types', () => {
    const achievementTypes = [
      {
        ...mockAchievement,
        name: 'Speed Demon',
        description: 'Answer quickly',
        AchievementCategories: { name: 'Speed' },
      },
      {
        ...mockAchievement,
        name: 'Streak Master',
        description: 'Maintain a winning streak',
        AchievementCategories: { name: 'Streak' },
      },
      {
        ...mockAchievement,
        name: 'ELO Champion',
        description: 'Reach high ELO rating',
        AchievementCategories: { name: 'ELO Rating' },
      },
    ];

    achievementTypes.forEach((achievement) => {
      cy.mount(
        <AchievementNotification
          achievement={achievement}
          show={true}
          onClose={cy.stub()}
        />,
      );

      cy.contains(achievement.name).should('be.visible');
      cy.contains(achievement.description).should('be.visible');
      cy.contains(achievement.AchievementCategories.name).should('be.visible');

      // Clean up for next iteration
      cy.mount(<div />);
    });
  });
});

describe('Achievement System Component Integration', () => {
  it('handles complete notification flow', () => {
    cy.mount(<AchievementNotificationManager />);

    const testAchievement = {
      id: 1,
      name: 'Integration Test',
      description: 'Testing complete notification flow',
      AchievementCategories: { name: 'Integration' },
    };

    // Show achievement
    cy.window().then((win) => {
      win.showAchievement(testAchievement);
    });

    // Verify it appears
    cy.contains('Integration Test').should('be.visible');

    // Verify it can be dismissed (if there's a close button or auto-dismiss)
    cy.wait(5000); // Wait for auto-dismiss
    cy.contains('Integration Test').should('not.exist');
  });

  it('handles error scenarios gracefully', () => {
    cy.mount(<AchievementNotificationManager />);

    // Test with malformed achievement data
    const malformedAchievement = {
      // Missing required fields
      name: 'Incomplete Achievement',
    };

    cy.window().then((win) => {
      // Should not crash
      expect(() => win.showAchievement(malformedAchievement)).to.not.throw();
    });

    // Test with null/undefined
    cy.window().then((win) => {
      expect(() => win.showAchievement(null)).to.not.throw();
      expect(() => win.showAchievement(undefined)).to.not.throw();
      expect(() => win.showMultipleAchievements([])).to.not.throw();
      expect(() => win.showMultipleAchievements(null)).to.not.throw();
    });
  });

  it('maintains performance with many notifications', () => {
    cy.mount(<AchievementNotificationManager />);

    const manyAchievements = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      name: `Performance Test ${i + 1}`,
      description: `Testing performance with achievement ${i + 1}`,
      AchievementCategories: { name: 'Performance' },
    }));

    // Should handle many achievements without significant delay
    const startTime = Date.now();

    cy.window().then((win) => {
      manyAchievements.forEach((achievement) => {
        win.showAchievement(achievement);
      });
    });

    // Verify first and last achievements appear
    cy.contains('Performance Test 1').should('be.visible');
    cy.contains('Performance Test 20').should('be.visible');

    // Performance check - should complete reasonably quickly
    cy.then(() => {
      const duration = Date.now() - startTime;
      expect(duration).to.be.lessThan(3000); // 3 seconds max
    });
  });
});
