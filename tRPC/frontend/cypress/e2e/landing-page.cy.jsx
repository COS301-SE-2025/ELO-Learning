describe('Landing Page', () => {
  beforeEach(() => {
    cy.visit('/');
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

  it('should navigate to signup page when clicking GET STARTED', () => {
    cy.get('a[href="/login-landing/signup"]').first().click();
    cy.url().should('include', '/login-landing/signup');
  });

  it('should navigate to login page when clicking I ALREADY HAVE AN ACCOUNT', () => {
    cy.get('a[href="/login-landing/login"]').first().click();
    cy.url().should('include', '/login-landing/login');
  });

  it('should be responsive on mobile devices', () => {
    cy.viewport('iphone-x');
    cy.get('img[alt="ELO Learning Mascot"]').should('be.visible');
    cy.get('h1').should('contain', 'ELO Learning');
    cy.get('.block.md\\:hidden').should('exist');
  });

  it('should be responsive on desktop devices', () => {
    cy.viewport(1920, 1080);
    cy.get('img[alt="ELO Learning Mascot"]').should('be.visible');
    cy.get('.hidden.md\\:block').should('exist');
  });

  it('should have proper accessibility attributes', () => {
    cy.get('img').each(($img) => {
      cy.wrap($img).should('have.attr', 'alt');
    });
    cy.get('a').each(($link) => {
      cy.wrap($link).should('have.attr', 'href');
    });
  });
});
