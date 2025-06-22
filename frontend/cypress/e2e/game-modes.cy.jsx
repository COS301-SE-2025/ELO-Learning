describe('Game Modes Smoke Tests', () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'mock-jwt-token');
    });
  });

  it('should load all game mode pages without errors', () => {
    const gamePages = [
      '/practice',
      '/single-player', 
      '/match',
      '/base-assessment',
      '/question-templates',
      '/question-templates/multiple-choice',
      '/question-templates/input-questions'
    ];
    
    gamePages.forEach(page => {
      cy.visit(page);
      cy.get('body').should('be.visible');
    });
  });
});
