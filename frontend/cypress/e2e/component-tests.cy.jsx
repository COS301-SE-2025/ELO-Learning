// Handle Next.js redirects
Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('NEXT_REDIRECT')) {
    return false;
  }
});

describe('Component Tests with Real Selectors', () => {
  beforeEach(() => {
    // Mock authentication for protected routes
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'mock-jwt-token');
      win.localStorage.setItem('user', JSON.stringify({
        id: 1,
        username: 'testuser',
        name: 'Test',
        surname: 'User',
        date_joined: '2023-01-01',
        elo: 1200,
        xp: 500
      }));
    });
  });

  describe('Authentication Components', () => {
    it('should render the main login/signup landing page', () => {
      cy.visit('/login-landing');
      cy.get('a[href="/login-landing/login"]').should('be.visible');
      cy.get('a[href="/login-landing/signup"]').should('be.visible');
    });

    it('should render the login form correctly', () => {
      cy.visit('/login-landing/login');
      cy.get('input[placeholder="Username or email"]').should('be.visible');
      cy.get('input[placeholder="Password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('should render the signup form correctly', () => {
      cy.visit('/login-landing/signup');
      cy.get('input[placeholder="Name"]').should('be.visible');
      cy.get('input[placeholder="Surname"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });
  });

  describe('Question Components', () => {
    it('should render multiple choice answer buttons', () => {
      cy.visit('/question-templates/multiple-choice');
      cy.get('.mc-button').should('have.length.greaterThan', 0);
      cy.get('.mc-button').first().should('be.visible');
    });

    it('should allow a user to select a multiple choice answer', () => {
      cy.visit('/question-templates/multiple-choice');
      cy.get('.mc-button').first().click();
      // In a real app, we'd check for a 'selected' class or state change.
      // For now, we just ensure it's clickable.
    });
  });

  describe('Navigation Components', () => {
    it('should render the main navigation bar', () => {
      cy.visit('/dashboard');
      cy.get('.nav-link-item').should('have.length', 5);
    });

    it('should navigate to different pages', () => {
      cy.visit('/dashboard');
      cy.get('a[href="/profile"]').click();
      cy.url().should('include', '/profile');
      cy.get('a[href="/practice"]').click();
      cy.url().should('include', '/practice');
    });
  });

  describe('Profile Page Components', () => {
    it('should render the main user info block', () => {
      cy.visit('/profile');
      cy.get('h2').contains('Lady Yapsalot').should('be.visible');
      cy.contains('Saskia Steyn').should('be.visible');
    });

    it('should display ranking and XP', () => {
      cy.visit('/profile');
      cy.contains('Ranking').should('be.visible');
      cy.contains('1st place').should('be.visible');
      cy.contains('Total XP').should('be.visible');
      cy.contains('1000 xp').should('be.visible');
    });

    it('should show placeholder text for unimplemented features', () => {
      cy.visit('/profile');
      cy.contains('Match statistics coming soon').should('be.visible');
      cy.contains('Achievements coming soon').should('be.visible');
    });
  });
}); 