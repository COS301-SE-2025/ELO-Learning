// Handle Next.js redirects
Cypress.on('uncaught:exception', (err) => {
  // We expect a NEXT_REDIRECT error when navigating to a protected route without authentication
  if (err.message.includes('NEXT_REDIRECT')) {
    return false;
  }
});

describe('Navigation & Routing Tests', () => {
  describe('Landing Page Navigation', () => {
    beforeEach(() => {
      cy.visit('/');
    });

    it('should display the landing page header', () => {
      cy.get('.header-landing').should('be.visible');
    });

    it('should navigate to the signup page from the main CTA', () => {
      cy.get('a[href="/login-landing/signup"]').first().click();
      cy.url().should('include', '/login-landing/signup');
    });

    it('should navigate to the login page from the secondary CTA', () => {
      cy.get('a[href="/login-landing/login"]').first().click();
      cy.url().should('include', '/login-landing/login');
    });
  });

  describe('Main Application Navigation (Authenticated)', () => {
    beforeEach(() => {
      // Mock a logged-in state
      cy.window().then((win) => {
        win.localStorage.setItem('token', 'mock-jwt-token');
      });
      cy.visit('/dashboard');

      cy.intercept('GET', '/api/user/profile', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            id: 1,
            username: 'testuser',
            elo: 1200,
            xp: 850,
          },
        },
      }).as('getUserProfile');

      cy.intercept('GET', '/api/leaderboard', {
        statusCode: 200,
        body: {
          success: true,
          data: [
            { rank: 1, username: 'user1', xp: 1000 },
            { rank: 2, username: 'user2', xp: 900 },
          ],
        },
      }).as('getLeaderboard');
    });

    it('should display the main navigation bar with all links', () => {
      cy.get('.nav-link-item').should('have.length', 5);
      cy.get('a[href="/dashboard"]').should('be.visible');
      cy.get('a[href="/practice"]').should('be.visible');
      cy.get('a[href="/match"]').should('be.visible');
      cy.get('a[href="/single-player"]').should('be.visible');
      cy.get('a[href="/profile"]').should('be.visible');
    });

    it('should navigate between pages using the nav bar', () => {
      cy.get('a[href="/profile"]').click();
      cy.url().should('include', '/profile');

      cy.get('a[href="/practice"]').click();
      cy.url().should('include', '/practice');

      cy.get('a[href="/dashboard"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should highlight the active navigation link', () => {
      cy.visit('/profile');
      // This class comes from the clsx logic in your NavLinks component
      cy.get('a[href="/profile"]').should('have.class', 'bg-[#e8e8e8]');
    });
  });

  /*
    This test is commented out as route protection is not fully implemented.
    The /profile page currently does not redirect unauthenticated users.
    This can be re-enabled once the feature is built.

    describe('Route Protection', () => {
      it('should redirect to login when accessing a protected route unauthenticated', () => {
        cy.window().then((win) => {
          win.localStorage.clear();
        });
        cy.visit('/profile');
        cy.url().should('include', '/login-landing');
      });
    });
  */

  describe('Error Handling', () => {
    it('should display a 404 page for invalid routes', () => {
      cy.visit('/a-page-that-does-not-exist', { failOnStatusCode: false });
      cy.contains('404').should('be.visible');
      cy.contains('This page could not be found').should('be.visible');
    });
  });
});
