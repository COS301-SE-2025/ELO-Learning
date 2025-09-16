// cypress/support/index.js

// Add custom commands for NextAuth testing
Cypress.Commands.add('stubAuthSession', (session = null) => {
  cy.intercept('GET', '/api/auth/session', {
    statusCode: 200,
    body: session,
  }).as('sessionRequest');

  cy.intercept('GET', '**/api/auth/providers', {
    statusCode: 200,
    body: {
      google: {
        id: 'google',
        name: 'Google',
        type: 'oauth',
        signinUrl: '/api/auth/signin/google',
        callbackUrl: '/api/auth/callback/google',
      },
      credentials: {
        id: 'credentials',
        name: 'credentials',
        type: 'credentials',
        signinUrl: '/api/auth/signin/credentials',
        callbackUrl: '/api/auth/callback/credentials',
      },
    },
  }).as('providersRequest');
});

Cypress.Commands.add('stubNextAuthError', (error = 'CredentialsSignin') => {
  cy.intercept('POST', '**/api/auth/callback/credentials', {
    statusCode: 200,
    body: {
      error,
      status: 401,
      ok: false,
      url: null,
    },
  }).as('authErrorRequest');
});

// Global setup
beforeEach(() => {
  // Always stub the session endpoint to prevent errors
  cy.stubAuthSession();

  // Mock environment variables in the browser
  cy.window().then((win) => {
    win.process = win.process || {};
    win.process.env = win.process.env || {};
    win.process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8080';
    win.process.env.NEXTAUTH_URL = 'http://localhost:8080';
  });
});
