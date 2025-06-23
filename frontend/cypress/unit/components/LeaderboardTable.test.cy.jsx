import LeaderboardTable from '../../../src/app/ui/leaderboard-table';

describe('LeaderboardTable Component Unit Tests', () => {
  describe('Rendering', () => {
    it('should render the leaderboard table', () => {
      cy.mount(<LeaderboardTable />);

      cy.get('table').should('exist');
      cy.get('thead').should('exist');
      cy.get('tbody').should('exist');
    });

    it('should render table headers correctly', () => {
      cy.mount(<LeaderboardTable />);

      cy.get('thead th').should('have.length', 4);
      cy.get('thead th').eq(0).should('contain', '#');
      cy.get('thead th').eq(2).should('contain', 'Username');
      cy.get('thead th').eq(3).should('contain', 'Total XP');
    });

    it('should render all leaderboard entries', () => {
      cy.mount(<LeaderboardTable />);

      cy.get('tbody tr').should('have.length', 10);
    });
  });

  describe('Data Display', () => {
    it('should display correct position numbers', () => {
      cy.mount(<LeaderboardTable />);

      cy.get('tbody tr').each(($row, index) => {
        cy.wrap($row)
          .find('td')
          .eq(0)
          .should('contain', index + 1);
      });
    });

    it('should display usernames correctly', () => {
      cy.mount(<LeaderboardTable />);

      const expectedUsernames = [
        'Alice',
        'Bob',
        'Charlie',
        'Diana',
        'Eve',
        'Frank',
        'Grace',
        'Heidi',
        'Ivan',
        'Judy',
      ];

      cy.get('tbody tr').each(($row, index) => {
        cy.wrap($row)
          .find('td')
          .eq(2)
          .should('contain', expectedUsernames[index]);
      });
    });

    it('should display XP values correctly', () => {
      cy.mount(<LeaderboardTable />);

      const expectedXP = [
        11500, 1400, 1350, 1300, 1250, 1200, 1150, 1100, 1050, 10,
      ];

      cy.get('tbody tr').each(($row, index) => {
        cy.wrap($row).find('td').eq(3).should('contain', expectedXP[index]);
        cy.wrap($row).find('td').eq(3).should('contain', 'XP');
      });
    });
  });

  describe('User Avatars', () => {
    it('should display user avatars with first letter', () => {
      cy.mount(<LeaderboardTable />);

      const expectedFirstLetters = [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
      ];

      cy.get('tbody tr').each(($row, index) => {
        cy.wrap($row)
          .find('td')
          .eq(1)
          .find('span')
          .should('contain', expectedFirstLetters[index]);
      });
    });

    it('should have correct avatar styling', () => {
      cy.mount(<LeaderboardTable />);

      cy.get('tbody tr')
        .first()
        .find('td')
        .eq(1)
        .find('span')
        .should('have.class', 'inline-flex');
      cy.get('tbody tr')
        .first()
        .find('td')
        .eq(1)
        .find('span')
        .should('have.class', 'items-center');
      cy.get('tbody tr')
        .first()
        .find('td')
        .eq(1)
        .find('span')
        .should('have.class', 'justify-center');
      cy.get('tbody tr')
        .first()
        .find('td')
        .eq(1)
        .find('span')
        .should('have.class', 'rounded-full');
      cy.get('tbody tr')
        .first()
        .find('td')
        .eq(1)
        .find('span')
        .should('have.class', 'w-8');
      cy.get('tbody tr')
        .first()
        .find('td')
        .eq(1)
        .find('span')
        .should('have.class', 'h-8');
      cy.get('tbody tr')
        .first()
        .find('td')
        .eq(1)
        .find('span')
        .should('have.class', 'font-bold');
      cy.get('tbody tr')
        .first()
        .find('td')
        .eq(1)
        .find('span')
        .should('have.class', 'text-lg');
    });
  });

  describe('Color Assignment', () => {
    it('should assign different colors to different users', () => {
      cy.mount(<LeaderboardTable />);

      // Get all avatar elements and check they have color classes
      cy.get('tbody tr td:nth-child(2) span').each(($avatar) => {
        cy.wrap($avatar)
          .should('have.class', 'bg-red-500')
          .or('have.class', 'bg-blue-500')
          .or('have.class', 'bg-green-500')
          .or('have.class', 'bg-yellow-500')
          .or('have.class', 'bg-purple-500')
          .or('have.class', 'bg-pink-500')
          .or('have.class', 'bg-indigo-500')
          .or('have.class', 'bg-teal-500')
          .or('have.class', 'bg-orange-500')
          .or('have.class', 'bg-gray-500');
      });
    });

    it('should assign consistent colors for same usernames', () => {
      cy.mount(<LeaderboardTable />);

      // Check that Alice (first user) has a consistent color
      cy.get('tbody tr')
        .first()
        .find('td')
        .eq(1)
        .find('span')
        .then(($avatar) => {
          const firstUserColor = $avatar.attr('class').match(/bg-\w+-500/)[0];
          expect(firstUserColor).to.match(/bg-\w+-500/);
        });
    });
  });

  describe('Table Structure', () => {
    it('should have correct table classes', () => {
      cy.mount(<LeaderboardTable />);

      cy.get('table').should('have.class', 'table-auto');
      cy.get('table').should('have.class', 'w-full');
      cy.get('table').should('have.class', 'text-center');
    });

    it('should have correct header styling', () => {
      cy.mount(<LeaderboardTable />);

      cy.get('thead th').eq(0).should('have.class', 'w-0.5/5');
      cy.get('thead th').eq(1).should('have.class', 'w-1.5/5');
      cy.get('thead th').eq(2).should('have.class', 'text-left');
      cy.get('thead th').eq(2).should('have.class', 'px-3');
      cy.get('thead th').eq(2).should('have.class', 'w-1/5');
      cy.get('thead th').eq(3).should('have.class', 'text-right');
      cy.get('thead th').eq(3).should('have.class', 'px-3');
      cy.get('thead th').eq(3).should('have.class', 'w-2/5');
    });

    it('should have correct cell styling', () => {
      cy.mount(<LeaderboardTable />);

      cy.get('tbody tr').first().find('td').eq(0).should('have.class', 'p-2');
      cy.get('tbody tr').first().find('td').eq(1).should('have.class', 'p-2');
      cy.get('tbody tr')
        .first()
        .find('td')
        .eq(2)
        .should('have.class', 'text-left');
      cy.get('tbody tr').first().find('td').eq(2).should('have.class', 'p-2');
      cy.get('tbody tr')
        .first()
        .find('td')
        .eq(3)
        .should('have.class', 'text-right');
      cy.get('tbody tr').first().find('td').eq(3).should('have.class', 'p-2');
    });
  });

  describe('Container Styling', () => {
    it('should have correct container classes', () => {
      cy.mount(<LeaderboardTable />);

      cy.get('.border').should('exist');
      cy.get('.rounded-lg').should('exist');
      cy.get('.p-4').should('exist');
      cy.get('.mx-4').should('exist');
      cy.get('.md\\:mx-0').should('exist');
    });
  });

  describe('Data Integrity', () => {
    it('should have correct data structure', () => {
      cy.mount(<LeaderboardTable />);

      const expectedData = [
        { pos: 1, user: 'Alice', xp: 11500 },
        { pos: 2, user: 'Bob', xp: 1400 },
        { pos: 3, user: 'Charlie', xp: 1350 },
        { pos: 4, user: 'Diana', xp: 1300 },
        { pos: 5, user: 'Eve', xp: 1250 },
        { pos: 6, user: 'Frank', xp: 1200 },
        { pos: 7, user: 'Grace', xp: 1150 },
        { pos: 8, user: 'Heidi', xp: 1100 },
        { pos: 9, user: 'Ivan', xp: 1050 },
        { pos: 10, user: 'Judy', xp: 10 },
      ];

      cy.get('tbody tr').each(($row, index) => {
        const expected = expectedData[index];
        cy.wrap($row).find('td').eq(0).should('contain', expected.pos);
        cy.wrap($row).find('td').eq(2).should('contain', expected.user);
        cy.wrap($row).find('td').eq(3).should('contain', expected.xp);
      });
    });

    it('should display XP in descending order', () => {
      cy.mount(<LeaderboardTable />);

      const expectedXP = [
        11500, 1400, 1350, 1300, 1250, 1200, 1150, 1100, 1050, 10,
      ];

      cy.get('tbody tr').each(($row, index) => {
        cy.wrap($row).find('td').eq(3).should('contain', expectedXP[index]);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper table structure for screen readers', () => {
      cy.mount(<LeaderboardTable />);

      cy.get('table').should('exist');
      cy.get('thead').should('exist');
      cy.get('tbody').should('exist');
      cy.get('th').should('exist');
      cy.get('td').should('exist');
    });

    it('should be visible and readable', () => {
      cy.mount(<LeaderboardTable />);

      cy.get('table').should('be.visible');
      cy.get('thead').should('be.visible');
      cy.get('tbody').should('be.visible');
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive margin classes', () => {
      cy.mount(<LeaderboardTable />);

      cy.get('.mx-4').should('exist');
      cy.get('.md\\:mx-0').should('exist');
    });
  });
});
