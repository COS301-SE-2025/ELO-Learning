describe('API Data Flow', () => {
  context('Question Loading', () => {
    /**
     * Test: Fetches and displays a math input question.
     * Components: /app/question-templates/input-questions/page.jsx, /app/ui/math-keyboard/client-wrapper.jsx
     * User Behavior: Visits the input questions page and sees the math input interface.
     * API Mocks: GET /practice/type/Math Input
     */
    it('should load the page and display the math input interface', () => {
      // The data structure for a single question, based on component analysis
      const mockQuestion = {
        Q_id: '123',
        questionText: 'What is 2 + 2?',
        topic: 'Arithmetic',
        difficulty: 'Easy',
        xpGain: 10,
        answers: [{ answer_text: '4', isCorrect: true }],
        question_type: 'Math Input',
      };

      // Mock the API call for getting questions by type
      cy.intercept('GET', '**/practice/type/Math%20Input', {
        statusCode: 200,
        body: {
          success: true,
          questions: [mockQuestion],
        },
      }).as('getQuestions');

      // Visit the page that triggers the API call
      cy.visit('/question-templates/input-questions');

      // Verify that the math input interface is visible, which confirms
      // the page and its components have loaded correctly.
      cy.get('textarea.math-input').should('be.visible');
      cy.contains('button', '+').should('be.visible'); // Check for a keyboard button
    });
  });
}); 