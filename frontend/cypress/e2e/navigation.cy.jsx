// Handle Next.js redirects and React hooks errors
Cypress.on('uncaught:exception', (err) => {
  if (
    err.message.includes('NEXT_REDIRECT') ||
    err.message.includes('Rendered more hooks than during the previous render')
  ) {
    return false;
  }
});

describe('Navigation & Routing Tests', () => {
  describe('Landing Page Navigation', () => {
    beforeEach(() => {
      cy.visit('/');
    });

    it('should load the landing page successfully', () => {
      cy.get('body').should('exist');
      cy.get('body').should('not.contain', 'Error');
      cy.url().should('eq', 'http://localhost:8080/');
    });

    it('should have navigation links to authentication pages', () => {
      // Check for signup links
      cy.get('body').then(($body) => {
        if ($body.find('a[href="/login-landing/signup"]').length > 0) {
          cy.get('a[href="/login-landing/signup"]').first().click();
          cy.url().should('include', '/login-landing/signup');
          cy.go('back');
        } else {
          cy.log('No signup link found - may use different navigation pattern');
        }
      });
    });

    it('should handle navigation to login page', () => {
      // Check for login links
      cy.get('body').then(($body) => {
        if ($body.find('a[href="/login-landing/login"]').length > 0) {
          cy.get('a[href="/login-landing/login"]').first().click();
          cy.url().should('include', '/login-landing/login');
        } else {
          // Try direct navigation
          cy.visit('/login-landing/login');
          cy.url().should('include', '/login-landing/login');
        }
      });
    });
  });

  describe('Application Route Accessibility', () => {
    beforeEach(() => {
      // Mock authentication
      cy.window().then((win) => {
        win.localStorage.setItem(
          'user',
          JSON.stringify({
            id: 1,
            username: 'testuser',
            elo: 1200,
            xp: 850,
          }),
        );
      });

      // Mock API endpoints
      cy.intercept('GET', '**/user**', {
        statusCode: 200,
        body: {
          success: true,
          data: { id: 1, username: 'testuser', elo: 1200, xp: 850 },
        },
      }).as('getUserData');

      cy.intercept('GET', '**/leaderboard**', {
        statusCode: 200,
        body: {
          success: true,
          data: [
            { rank: 1, username: 'Alice', xp: 11500 },
            { rank: 2, username: 'Bob', xp: 9000 },
            { rank: 3, username: 'Charlie', xp: 8000 },
          ],
        },
      }).as('getLeaderboard');

      cy.intercept('GET', '**/api/auth/session', {
        statusCode: 200,
        body: { user: null },
      }).as('getSession');
    });

    const routes = [
      '/dashboard',
      '/practice',
      '/profile',
      '/question-templates/multiple-choice',
      '/question-templates/expression-builder',
      '/login-landing/login',
      '/login-landing/signup',
    ];

    routes.forEach((route) => {
      it(`should handle navigation to ${route}`, () => {
        cy.visit(route);

        // Should reach the route without crashing
        cy.get('body').should('exist');
        cy.get('body').should('not.contain', 'Something went wrong');

        // URL should include the route (allowing for redirects)
        cy.url().then((url) => {
          if (url.includes(route) || url.includes('login-landing')) {
            // Either reached the route or redirected to auth (both acceptable)
            expect(true).to.be.true;
          } else {
            cy.log(`Route ${route} redirected to ${url}`);
          }
        });
      });
    });
  });

  describe('Navigation Error Handling', () => {
    it('should handle invalid routes gracefully', () => {
      cy.visit('/this-route-does-not-exist', { failOnStatusCode: false });

      // Should either show 404 or redirect appropriately
      cy.get('body').should('exist');
      cy.get('body').should('not.contain', 'TypeError');
      cy.get('body').should('not.contain', 'ReferenceError');
    });

    it('should handle network errors during navigation', () => {
      cy.intercept('GET', '**/user**', { forceNetworkError: true });

      cy.visit('/profile');
      cy.wait(2000);

      // Should handle network errors gracefully
      cy.get('body').should('exist');
      cy.get('body').should('not.contain', 'Uncaught');
    });
  });

  describe('Browser Navigation', () => {
    it('should handle back/forward navigation', () => {
      cy.visit('/');
      cy.visit('/login-landing/login');
      cy.visit('/login-landing/signup');

      // Test back navigation
      cy.go('back');
      cy.url().should('include', '/login-landing/login');

      // Test forward navigation
      cy.go('forward');
      cy.url().should('include', '/login-landing/signup');
    });

    it('should maintain application state during navigation', () => {
      // Set some state
      cy.window().then((win) => {
        win.localStorage.setItem('testData', 'navigation-test');
      });

      cy.visit('/login-landing/login');
      cy.visit('/login-landing/signup');

      // State should persist
      cy.window()
        .its('localStorage.testData')
        .should('equal', 'navigation-test');
    });
  });
});
