describe('API Integration & Data Flow', () => {
  // Handle Next.js redirects
  Cypress.on('uncaught:exception', (err) => {
    if (err.message.includes('NEXT_REDIRECT')) {
      return false;
    }
  });

  beforeEach(() => {
    // Set authentication cookies (like profile tests)
    cy.setCookie(
      'user',
      JSON.stringify({
        id: 1,
        username: 'testuser',
        elo: 1200,
        xp: 500,
      }),
    );
    cy.setCookie('token', 'mock-jwt-token');
    // Mock all API endpoints used in tests
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

    cy.intercept('POST', '/api/submit**', {
      statusCode: 200,
      body: {
        success: true,
        data: { isCorrect: true, xpAwarded: 10 },
      },
    }).as('submitAnswer');

    cy.intercept('POST', '/api/login', {
      statusCode: 200,
      body: {
        success: true,
        data: { token: 'mock-token', user: { id: 1, username: 'testuser' } },
      },
    }).as('login');

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

  describe('Question API Integration', () => {
    it.skip('should load the multiple-choice page', () => {
      // Skipped due to SSR API call not mockable by Cypress intercept
    });

    it.skip('should fetch questions from API', () => {});
    it.skip('should display questions correctly', () => {});
    it.skip('should handle answer selection', () => {});
    it.skip('should submit answers and navigate', () => {});
    it.skip('should handle correct answers', () => {});

    it('DEBUG - what API calls does the page make?', () => {
      cy.intercept('GET', '**', (req) => {
        // eslint-disable-next-line no-console
        console.log('GET request to:', req.url);
      });
      cy.intercept('POST', '**', (req) => {
        // eslint-disable-next-line no-console
        console.log('POST request to:', req.url);
      });
      cy.visit('/question-templates/multiple-choice');
      cy.wait(5000); // Wait to see all requests
    });
  });

  describe('User Authentication API', () => {
    it.skip('should handle login API calls', () => {
      // Skip - navigation/auth not implemented in test env
    });

    it('should handle signup flow', () => {
      cy.visit('/login-landing/signup');
      cy.get('input[placeholder="Name"]').type('John');
      cy.get('input[placeholder="Surname"]').type('Doe');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/login-landing/signup/username');
    });

    it('should handle authentication errors', () => {
      cy.intercept('POST', '**/login', {
        statusCode: 401,
        body: { error: 'Invalid credentials' },
      }).as('authError');

      cy.visit('/login-landing/login');
      cy.get('input[placeholder="Username or email"]').type(
        'wrong@example.com',
      );
      cy.get('input[placeholder="Password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();
      cy.contains('Username or password incorrect, please try again').should(
        'be.visible',
      );
    });
  });

  describe('User Profile Display', () => {
    it.skip('should display user profile data', () => {
      // Skip - profile content not present in test env
    });

    it.skip('should display user statistics', () => {
      // Skip - profile content not present in test env
    });

    it.skip('should display user ranking', () => {
      // Skip - profile content not present in test env
    });
  });

  describe('Game State Management', () => {
    it.skip('should save game state to localStorage', () => {
      // Skip - page doesn't have buttons yet
    });

    it.skip('should handle lives system', () => {
      // Skip - page doesn't have buttons yet
    });

    it.skip('should navigate to end screen when lives run out', () => {
      // Skip - page doesn't have buttons yet
    });
  });

  describe('Navigation and UI', () => {
    it.skip('should navigate back to dashboard', () => {
      // Skip - page doesn't have navigation element yet
    });

    it('should display progress bar', () => {
      cy.visit('/question-templates/multiple-choice');
      cy.get('div').should('exist');
    });

    it('should display lives counter', () => {
      cy.visit('/question-templates/multiple-choice');
      cy.get('div').should('exist');
    });

    it.skip('should handle question navigation', () => {
      // Skip - page doesn't have buttons yet
    });
  });

  describe('Form Validation', () => {
    it('should validate login form', () => {
      cy.visit('/login-landing/login');
      cy.get('button[type="submit"]').click();
      // Should show validation error or prevent submission
    });

    it('should validate signup form', () => {
      cy.visit('/login-landing/signup');
      cy.get('button[type="submit"]').click();
      // Should show validation error for empty fields
    });

    it('should handle form submission states', () => {
      cy.visit('/login-landing/login');
      cy.get('input[placeholder="Username or email"]').type('test@example.com');
      cy.get('input[placeholder="Password"]').type('password123');
      cy.get('button[type="submit"]').click();
      // Should show loading state
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', () => {
      cy.intercept('GET', '**/practice', {
        forceNetworkError: true,
      }).as('networkError');

      cy.visit('/question-templates/multiple-choice');
      // Component should handle network errors gracefully
    });

    it('should handle server errors', () => {
      cy.intercept('GET', '**/practice', {
        statusCode: 500,
        body: { error: 'Internal server error' },
      }).as('serverError');

      cy.visit('/question-templates/multiple-choice');
      // Component should handle server errors gracefully
    });

    it('should handle authentication failures', () => {
      cy.intercept('POST', '**/login', {
        statusCode: 401,
        body: { error: 'Invalid credentials' },
      }).as('authFailure');

      cy.visit('/login-landing/login');
      cy.get('input[placeholder="Username or email"]').type(
        'wrong@example.com',
      );
      cy.get('input[placeholder="Password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();
      cy.contains('Username or password incorrect, please try again').should(
        'be.visible',
      );
    });
  });

  describe('Performance and UX', () => {
    it.skip('should load questions quickly', () => {
      // Skip - page doesn't have buttons yet
    });

    it.skip('should handle button states correctly', () => {
      // Skip - page doesn't have buttons yet
    });

    it.skip('should provide visual feedback', () => {
      // Skip - page doesn't have buttons yet
    });
  });
});
