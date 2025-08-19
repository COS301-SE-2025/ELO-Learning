describe('Game Modes Smoke Tests', () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'mock-jwt-token');
    });

    cy.intercept('GET', '/api/questions**', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          {
            Q_id: 1,
            questionText: 'What is 2 + 2?',
            answers: [
              { answer_text: '4', isCorrect: true },
              { answer_text: '3', isCorrect: false },
            ],
          },
        ],
      },
    }).as('getQuestions');

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
  });

  it('should load all game mode pages without errors', () => {
    const gamePages = [
      '/practice',
      '/single-player',
      '/match',
      '/question-templates',
      '/question-templates/multiple-choice',
      '/question-templates/input-questions',
    ];

    gamePages.forEach((page) => {
      cy.visit(page);
      cy.get('body').should('be.visible');
    });
  });
});
