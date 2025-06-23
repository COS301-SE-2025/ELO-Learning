// cypress/integration/form-workflows.cy.js

describe('Form Workflows', () => {
  // Testing the login form workflow
  context('Login Form', () => {
    beforeEach(() => {
      // Visit the login page before each test in this context
      cy.visit('/login-landing/login');
    });

    /**
     * Test: Successful user login.
     * Components: /app/login-landing/login/page.jsx
     * User Behavior: Fills in the form with valid credentials and submits.
     * API Mocks: POST /login
     */
    it('should allow a user to log in successfully', () => {
      // Mock the API call for a successful login
      cy.intercept('POST', '**/login', {
        statusCode: 200,
        body: {
          token: 'fake-jwt-token',
          user: { id: 1, email: 'test@example.com', name: 'Test User' },
        },
      }).as('loginRequest');

      // Fill out the form
      cy.get('input[placeholder="Username or email"]').type('test@example.com');
      cy.get('input[placeholder="Password"]').type('password123');

      // Submit the form
      cy.contains('button', 'Continue').click();

      // Wait for the API call to complete
      cy.wait('@loginRequest');

      // Verify redirection to the dashboard
      cy.url().should('include', '/dashboard');
    });

    /**
     * Test: Failed user login.
     * Components: /app/login-landing/login/page.jsx
     * User Behavior: Fills in the form with invalid credentials and submits.
     * API Mocks: POST /login
     */
    it('should show an error message on failed login', () => {
      // Mock the API call for a failed login
      cy.intercept('POST', '**/login', {
        statusCode: 401,
        body: { error: 'Unauthorized' },
      }).as('loginRequest');

      // Fill out the form with incorrect credentials
      cy.get('input[placeholder="Username or email"]').type(
        'wrong@example.com',
      );
      cy.get('input[placeholder="Password"]').type('wrongpassword');

      // Submit the form
      cy.contains('button', 'Continue').click();

      // Wait for the API call
      cy.wait('@loginRequest');

      // Verify the error message is displayed
      cy.contains(
        'p',
        'Username or password incorrect, please try again',
      ).should('be.visible');

      // Verify the user remains on the login page
      cy.url().should('include', '/login-landing/login');
    });
  });

  // Testing the signup form workflow
  context('Signup Form - Step 1', () => {
    beforeEach(() => {
      // Visit the signup page before each test in this context
      cy.visit('/login-landing/signup');
    });

    /**
     * Test: Successful completion of the first signup step.
     * Components: /app/login-landing/signup/page.jsx
     * User Behavior: Fills in name and surname and clicks continue.
     */
    it('should proceed to the next step with valid inputs', () => {
      // Fill out the form
      cy.get('input[placeholder="Name"]').type('Test');
      cy.get('input[placeholder="Surname"]').type('User');

      // Submit the form
      cy.contains('button', 'Continue').click();

      // Verify redirection to the next step of the signup
      cy.url().should('include', '/login-landing/signup/username');
    });

    /**
     * Test: Prevents submission when fields are empty on signup.
     * Components: /app/login-landing/signup/page.jsx
     * User Behavior: Attempts to submit the form with empty fields and should not navigate.
     */
    it('should not navigate when signup form fields are empty', () => {
      // Click continue without filling out the form
      cy.contains('button', 'Continue').click();

      // Verify the user remains on the same page, confirming validation worked
      cy.url().should('include', '/login-landing/signup');
    });
  });
});
