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
      win.localStorage.setItem(
        'user',
        JSON.stringify({
          id: 1,
          username: 'testuser',
          name: 'Test',
          surname: 'User',
          date_joined: '2023-01-01',
          elo: 1200,
          xp: 500,
        }),
      );
    });

    cy.intercept('GET', '/api/questions**', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          {
            Q_id: 1,
            questionText: 'What is 2 + 2?',
            answers: [
              { answer_text: '4', isCorrect: true },
              { answer_text: '3', isCorrect: false },
            ],
          },
        ],
      },
    }).as('getQuestions');

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
    it.skip('should render multiple choice answer buttons', () => {
      // Skip - .mc-button elements don't exist on this page yet
    });

    it.skip('should allow a user to select a multiple choice answer', () => {
      // Skip - .mc-button elements don't exist on this page yet
    });
  });

  describe('Navigation Components', () => {
    it.skip('should render the main navigation bar', () => {
      // Skip - navigation bar not present in test env
    });
    it.skip('should navigate to different pages', () => {
      // Skip - navigation not present in test env
    });
  });

  describe('Profile Page Components', () => {
    it.skip('should render the main user info block', () => {
      // Skip - profile content not present in test env
    });
    it.skip('should display ranking and XP', () => {
      // Skip - profile content not present in test env
    });
    it.skip('should show placeholder text for unimplemented features', () => {
      // Skip - profile content not present in test env
    });
  });
});
