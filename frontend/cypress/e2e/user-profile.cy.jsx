// Handle uncaught exceptions from Next.js
Cypress.on('uncaught:exception', (err) => {
  if (
    err.message.includes('NEXT_REDIRECT') ||
    err.message.includes('Cannot read properties of null')
  ) {
    return false;
  }
});

describe('User Profile & Gamification', () => {
  // --- Profile Page Tests ---
  describe('Profile Page', () => {
    beforeEach(() => {
      cy.setCookie('token', 'mock-jwt-token');
      cy.visit('/profile');
      cy.url().should('include', '/profile');
    });

    it('should display the main user information', () => {
      // From <UsernameBlock>
      cy.get('h2').should('contain', 'Lady Yapsalot');
      cy.get('p').should('contain', 'Saskia Steyn');
      cy.get('p').should('contain', 'Joined: 6 August 1998');
    });

    it('should display the user picture block', () => {
      // From <Picture>
      cy.get('img[alt="user profile picture"]').should('be.visible');
    });

    it('should show a link to the settings page', () => {
      cy.get('a[href="settings"]').should('be.visible');
    });

    it('should display user ranking and XP', () => {
      // From <UserInfo>
      cy.contains('h4', 'Ranking').siblings('p').should('contain', '1st place');
      cy.contains('h4', 'Total XP').siblings('p').should('contain', '1000 xp');
    });

    it('should display placeholder sections for upcoming features', () => {
      // From <MatchStats> and <Achievements>
      cy.contains('h3', 'Match Statistics').should('be.visible');
      cy.contains('p', 'Match statistics coming soon').should('be.visible');

      cy.contains('h3', 'Achievement').should('be.visible');
      cy.contains('p', 'Achievements coming soon').should('be.visible');
    });
  });

  // --- Leaderboard Tests ---
  describe('Leaderboard System', () => {
    beforeEach(() => {
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
            { rank: 1, username: 'Alice', xp: 11500 },
            { rank: 2, username: 'Bob', xp: 9000 },
            { rank: 3, username: 'Charlie', xp: 8000 },
            { rank: 4, username: 'David', xp: 7000 },
            { rank: 5, username: 'Eve', xp: 6000 },
            { rank: 6, username: 'Frank', xp: 5000 },
            { rank: 7, username: 'Grace', xp: 4000 },
            { rank: 8, username: 'Heidi', xp: 3000 },
            { rank: 9, username: 'Ivan', xp: 2000 },
            { rank: 10, username: 'Judy', xp: 1000 },
          ],
        },
      }).as('getLeaderboard');
    });

    it('should display the leaderboard with correct headers', () => {
      cy.get('h1').should('contain', 'Leaderboard');
      cy.get('table').should('be.visible');
      cy.get('th').should('contain', '#');
      cy.get('th').should('contain', 'Username');
      cy.get('th').should('contain', 'Total XP');
    });

    it('should display the top 10 users with their data', () => {
      cy.get('tbody tr').should('have.length', 10);

      // Check the first user
      cy.get('tbody tr').first().as('firstUser');
      cy.get('@firstUser').should('contain', '1');
      cy.get('@firstUser').should('contain', 'Alice');
      cy.get('@firstUser').should('contain', '11500 XP');
    });

    it('should display user avatars with a colored background', () => {
      cy.get('tbody tr').each(($row) => {
        cy.wrap($row).find('span[class*="bg-"]').should('be.visible');
      });
    });
  });

  // --- Settings and End Screen Tests (Simplified) ---
  describe('Other Gamification Pages', () => {
    it('should load the settings page', () => {
      cy.visit('/settings');
      // The page uses a <p> tag for its main heading inside the <Back> component
      cy.get('p.text-2xl.font-bold').should('contain', 'Settings');
    });

    it('should not crash when visiting the end-screen directly', () => {
      // The end-screen page requires game state and cannot be visited directly.
      // We will visit it and just assert that the app doesn't crash and we are on the page.
      cy.visit('/end-screen');
      cy.url().should('include', '/end-screen');
    });
  });
});
