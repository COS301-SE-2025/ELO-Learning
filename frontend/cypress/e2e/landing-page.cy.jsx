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

  it('should display the main landing page with all sections', () => {
    // Check main hero section
    cy.get('h1').should('contain', 'ELO Learning');
    cy.get('img[alt="ELO Learning Mascot"]').should('be.visible');

    // Check main CTA buttons
    cy.get('a[href="/login-landing/signup"]').should('be.visible');
    cy.get('a[href="/login-landing/login"]').should('be.visible');

    // Check feature sections
    cy.get('h2').should('contain', 'Smarter. Sharper. Way More Fun.');
    cy.get('h2').should('contain', 'Choose Your Mode');
    cy.get('h2').should('contain', 'ELO Knows You');
    cy.get('h2').should('contain', 'No Classrooms. No Labels. Just Progress.');
  });

  it('should navigate to signup page when clicking GET STARTED', () => {
    cy.get('a[href="/login-landing/signup"]').first().click();
    cy.url().should('include', '/login-landing/signup');
  });

  it('should navigate to login page when clicking I ALREADY HAVE AN ACCOUNT', () => {
    cy.get('a[href="/login-landing/login"]').first().click();
    cy.url().should('include', '/login-landing/login');
  });

  it('should display all game mode cards', () => {
    cy.get('h3').should('contain', 'Matches');
    cy.get('h3').should('contain', 'Single Player');
    cy.get('h3').should('contain', 'Practice Mode');
  });

  it('should display all animations and images', () => {
    cy.get('img[alt="Chess Animation"]').should('be.visible');
    cy.get('img[alt="ELO Rating Animation"]').should('be.visible');
    cy.get('img[alt="Growing with ELO Learning"]').should('be.visible');
    cy.get('img[alt="Leveling Up Animation"]').should('be.visible');
  });

  it('should be responsive on mobile devices', () => {
    cy.viewport('iphone-x');
    cy.get('img[alt="ELO Learning Mascot"]').should('be.visible');
    cy.get('h1').should('contain', 'ELO Learning');

    // Check mobile-specific elements
    cy.get('.block.md\\:hidden').should('exist');
  });

  it('should be responsive on desktop devices', () => {
    cy.viewport(1920, 1080);
    cy.get('img[alt="ELO Learning Mascot"]').should('be.visible');

    // Check desktop-specific elements
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

  it('should have working navigation links in header and footer', () => {
    // Test header navigation if it has links
    cy.get('.header-landing').then(($header) => {
      const links = $header.find('a');
      if (links.length > 0) {
        cy.wrap(links).each(($link) => {
          cy.wrap($link).should('have.attr', 'href');
        });
      } else {
        cy.log('Header exists but has no navigation links');
      }
    });

    // Test footer navigation
    cy.get('div.bg-\\[\\#1D1A34\\]').within(() => {
      cy.get('a').each(($link) => {
        cy.wrap($link).should('have.attr', 'href');
      });
    });
  });
});
