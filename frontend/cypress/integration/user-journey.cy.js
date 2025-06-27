describe('User Journey', () => {
  /**
   * Test: A complete user journey from signup to the dashboard.
   * Components: Covers the multi-step signup process and dashboard landing.
   * User Behavior: Simulates a new user signing up and verifies they land on the dashboard.
   * API Mocks: POST /register
   */
  it('should allow a new user to sign up and land on the dashboard', () => {
    // --- 1. Start on the landing page and navigate to signup ---
    cy.visit('/');
    cy.contains('button', 'GET STARTED').first().click();
    cy.url().should('include', '/login-landing/signup');

    // --- 2. Complete the multi-step signup process ---
    // Step 1: Name and Surname
    cy.get('input[placeholder="Name"]').type('New');
    cy.get('input[placeholder="Surname"]').type('User');
    cy.contains('button', 'Continue').click();
    cy.url().should('include', '/signup/username');

    // Step 2: Username
    cy.get('input[placeholder="Username"]').type('newuser');
    cy.contains('button', 'Continue').click();
    cy.url().should('include', '/signup/age');

    // Step 3: Age
    cy.get('input[placeholder="Age"]').type('25');
    cy.contains('button', 'Continue').click();
    cy.url().should('include', '/signup/grade');

    // Step 4: Grade
    cy.get('input[placeholder="Grade"]').type('University Year 3');
    cy.contains('button', 'Continue').click();
    cy.url().should('include', '/signup/email');

    // Step 5: Email
    cy.get('input[placeholder="Email"]').type('newuserjourney@example.com');
    cy.contains('button', 'Continue').click();
    cy.url().should('include', '/signup/password');

    // Step 6: Password
    cy.intercept('POST', '**/register', {
      statusCode: 200,
      body: {
        token: 'fake-jwt-token-for-new-user',
        user: { id: 3, email: 'newuserjourney@example.com', name: 'New User' },
      },
    }).as('registerRequest');

    cy.get('input[placeholder="Enter a password"]').type('Password123!');
    cy.get('input[placeholder="Confirm password"]').type('Password123!');
    cy.contains('button', 'Continue').click();

    // --- 3. Land on the dashboard and verify ---
    // The application should automatically redirect to the dashboard upon successful registration.
    cy.url().should('include', '/dashboard');
    cy.contains('h1', 'Leaderboard').should('be.visible');
  });
});
