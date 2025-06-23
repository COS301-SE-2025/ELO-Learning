describe('Navigation Flows', () => {
  beforeEach(() => {
    // Start at the root of the application before each test
    cy.visit('/');
  });

  /**
   * Test: Navigates from the landing page to the login page.
   * Components: /app/page.jsx, /app/login-landing/login/page.jsx
   * User Behavior: Clicks the 'I ALREADY HAVE AN ACCOUNT' button.
   */
  it('should navigate from landing to login page', () => {
    // Find the button with the specific text and click it
    cy.contains('button', 'I ALREADY HAVE AN ACCOUNT').click();

    // Verify the URL changes to the login page
    cy.url().should('include', '/login-landing/login');

    // Verify the login page content is visible
    cy.contains('p', 'Enter your information').should('be.visible');
    cy.get('input[placeholder="Username or email"]').should('be.visible');
    cy.get('input[placeholder="Password"]').should('be.visible');
  });

  /**
   * Test: Navigates from the landing page to the signup page.
   * Components: /app/page.jsx, /app/login-landing/signup/page.jsx
   * User Behavior: Clicks the 'GET STARTED' button.
   */
  it('should navigate from landing to signup page', () => {
    // Find the 'GET STARTED' button and click it
    cy.contains('button', 'GET STARTED').first().click();

    // Verify the URL changes to the signup page
    cy.url().should('include', '/login-landing/signup');

    // Verify the signup page content is visible
    cy.contains('p', 'What is your name?').should('be.visible');
    cy.get('input[placeholder="Name"]').should('be.visible');
    cy.get('input[placeholder="Surname"]').should('be.visible');
  });

  /**
   * Test: Navigates back from login page to the login landing page.
   * Components: /app/login-landing/login/page.jsx, /app/login-landing/page.jsx
   * User Behavior: Clicks the 'X' button on the login page.
   */
  it('should navigate back from login to login-landing', () => {
    // Go to the login page first
    cy.visit('/login-landing/login');

    // The back button is an 'X' icon within a Link
    cy.get('a[href="/login-landing"]').click();

    // Verify the URL changes back to the login-landing page
    cy.url().should('include', '/login-landing');

    // Check for some content on the login-landing page
    cy.contains('h1', 'ELO Learning').should('be.visible');
  });

  /**
   * Test: Navigates back from the signup page to the login landing page.
   * Components: /app/login-landing/signup/page.jsx, /app/login-landing/page.jsx
   * User Behavior: Clicks the 'X' button on the signup page.
   */
  it('should navigate back from signup to login-landing', () => {
    // Go to the signup page first
    cy.visit('/login-landing/signup');

    // The back button is an 'X' icon within a Link
    cy.get('a[href="/login-landing"]').click();

    // Verify the URL changes back to the login-landing page
    cy.url().should('include', '/login-landing');

    // Check for some content on the login-landing page
    cy.contains('h1', 'ELO Learning').should('be.visible');
  });
});
