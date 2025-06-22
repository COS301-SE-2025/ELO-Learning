import LeaderboardTable from '@/app/ui/leaderboard-table';

describe('LeaderboardTable Component', () => {
  it('should render with correct structure', () => {
    cy.mount(<LeaderboardTable />);
    
    cy.get('table').should('exist');
    cy.get('thead').should('exist');
    cy.get('tbody').should('exist');
    cy.get('tr').should('have.length', 11); // 1 header + 10 data rows
  });

  it('should render table headers correctly', () => {
    cy.mount(<LeaderboardTable />);
    
    cy.get('thead tr th').should('have.length', 4);
    cy.get('thead tr th').eq(0).should('contain', '#');
    cy.get('thead tr th').eq(1).should('contain', '');
    cy.get('thead tr th').eq(2).should('contain', 'Username');
    cy.get('thead tr th').eq(3).should('contain', 'Total XP');
  });

  it('should apply correct CSS classes to table', () => {
    cy.mount(<LeaderboardTable />);
    
    cy.get('table').should('have.class', 'table-auto');
    cy.get('table').should('have.class', 'w-full');
    cy.get('table').should('have.class', 'text-center');
  });

  it('should render all leaderboard entries', () => {
    cy.mount(<LeaderboardTable />);
    
    cy.get('tbody tr').should('have.length', 10);
    
    // Check first entry
    cy.get('tbody tr').eq(0).find('td').eq(0).should('contain', '1');
    cy.get('tbody tr').eq(0).find('td').eq(2).should('contain', 'Alice');
    cy.get('tbody tr').eq(0).find('td').eq(3).should('contain', '11500 XP');
    
    // Check last entry
    cy.get('tbody tr').eq(9).find('td').eq(0).should('contain', '10');
    cy.get('tbody tr').eq(9).find('td').eq(2).should('contain', 'Judy');
    cy.get('tbody tr').eq(9).find('td').eq(3).should('contain', '10 XP');
  });

  it('should render user avatars with correct styling', () => {
    cy.mount(<LeaderboardTable />);
    
    cy.get('tbody tr').each(($row, index) => {
      cy.wrap($row).find('td').eq(1).find('span').should('have.class', 'inline-flex');
      cy.wrap($row).find('td').eq(1).find('span').should('have.class', 'items-center');
      cy.wrap($row).find('td').eq(1).find('span').should('have.class', 'justify-center');
      cy.wrap($row).find('td').eq(1).find('span').should('have.class', 'rounded-full');
      cy.wrap($row).find('td').eq(1).find('span').should('have.class', 'w-8');
      cy.wrap($row).find('td').eq(1).find('span').should('have.class', 'h-8');
      cy.wrap($row).find('td').eq(1).find('span').should('have.class', 'font-bold');
      cy.wrap($row).find('td').eq(1).find('span').should('have.class', 'text-lg');
    });
  });

  it('should display correct user initials in avatars', () => {
    cy.mount(<LeaderboardTable />);
    
    const expectedInitials = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    
    cy.get('tbody tr').each(($row, index) => {
      cy.wrap($row).find('td').eq(1).find('span').should('contain', expectedInitials[index]);
    });
  });

  it('should apply different background colors to avatars', () => {
    cy.mount(<LeaderboardTable />);
    
    // Check that avatars have background color classes
    cy.get('tbody tr').each(($row) => {
      cy.wrap($row).find('td').eq(1).find('span').should('match', /bg-\w+-500/);
    });
  });

  it('should have correct text alignment', () => {
    cy.mount(<LeaderboardTable />);
    
    // Username column should be left-aligned
    cy.get('thead tr th').eq(2).should('have.class', 'text-left');
    cy.get('tbody tr').each(($row) => {
      cy.wrap($row).find('td').eq(2).should('have.class', 'text-left');
    });
    
    // Total XP column should be right-aligned
    cy.get('thead tr th').eq(3).should('have.class', 'text-right');
    cy.get('tbody tr').each(($row) => {
      cy.wrap($row).find('td').eq(3).should('have.class', 'text-right');
    });
  });

  it('should have correct padding on cells', () => {
    cy.mount(<LeaderboardTable />);
    
    cy.get('tbody tr').each(($row) => {
      cy.wrap($row).find('td').each(($cell) => {
        cy.wrap($cell).should('have.class', 'p-2');
      });
    });
  });

  it('should have correct header padding', () => {
    cy.mount(<LeaderboardTable />);
    
    cy.get('thead tr th').eq(2).should('have.class', 'px-3');
    cy.get('thead tr th').eq(3).should('have.class', 'px-3');
  });

  it('should have correct column widths', () => {
    cy.mount(<LeaderboardTable />);
    
    cy.get('thead tr th').eq(0).should('have.class', 'w-0.5/5');
    cy.get('thead tr th').eq(1).should('have.class', 'w-1.5/5');
    cy.get('thead tr th').eq(2).should('have.class', 'w-1/5');
    cy.get('thead tr th').eq(3).should('have.class', 'w-2/5');
  });

  it('should display XP values correctly', () => {
    cy.mount(<LeaderboardTable />);
    
    const expectedXP = [11500, 1400, 1350, 1300, 1250, 1200, 1150, 1100, 1050, 10];
    
    cy.get('tbody tr').each(($row, index) => {
      cy.wrap($row).find('td').eq(3).should('contain', `${expectedXP[index]} XP`);
    });
  });

  it('should have container styling', () => {
    cy.mount(<LeaderboardTable />);
    
    cy.get('div').first().should('have.class', 'border');
    cy.get('div').first().should('have.class', 'rounded-lg');
    cy.get('div').first().should('have.class', 'p-4');
    cy.get('div').first().should('have.class', 'mx-4');
    cy.get('div').first().should('have.class', 'md:mx-0');
  });

  it('should be responsive', () => {
    cy.mount(<LeaderboardTable />);
    
    // Test on mobile viewport
    cy.viewport(375, 667);
    cy.get('div').first().should('have.class', 'mx-4');
    
    // Test on desktop viewport
    cy.viewport(1024, 768);
    cy.get('div').first().should('have.class', 'md:mx-0');
  });

  it('should handle different data scenarios', () => {
    cy.mount(<LeaderboardTable />);
    
    // Check that all entries have valid data
    cy.get('tbody tr').each(($row) => {
      // Position should be a number
      cy.wrap($row).find('td').eq(0).invoke('text').should('match', /^\d+$/);
      
      // Username should not be empty
      cy.wrap($row).find('td').eq(2).invoke('text').should('not.be.empty');
      
      // XP should be a number followed by " XP"
      cy.wrap($row).find('td').eq(3).invoke('text').should('match', /^\d+ XP$/);
    });
  });

  it('should maintain table structure integrity', () => {
    cy.mount(<LeaderboardTable />);
    
    // Each row should have exactly 4 cells
    cy.get('tbody tr').each(($row) => {
      cy.wrap($row).find('td').should('have.length', 4);
    });
    
    // Header should have exactly 4 cells
    cy.get('thead tr').find('th').should('have.length', 4);
  });

  it('should be accessible', () => {
    cy.mount(<LeaderboardTable />);
    
    // Check semantic table structure
    cy.get('table').should('be.visible');
    cy.get('thead').should('be.visible');
    cy.get('tbody').should('be.visible');
    
    // Check that all content is readable
    cy.get('tbody tr').each(($row) => {
      cy.wrap($row).should('be.visible');
    });
  });

  it('should handle different screen sizes gracefully', () => {
    cy.mount(<LeaderboardTable />);
    
    // Test various viewport sizes
    const viewports = [
      { width: 320, height: 568 }, // iPhone SE
      { width: 768, height: 1024 }, // iPad
      { width: 1920, height: 1080 } // Desktop
    ];
    
    viewports.forEach(viewport => {
      cy.viewport(viewport.width, viewport.height);
      cy.get('table').should('be.visible');
      cy.get('tbody tr').should('have.length', 10);
    });
  });
}); 