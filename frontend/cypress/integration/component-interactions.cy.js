describe('Component Interactions', () => {
  context('Math Keyboard and Input', () => {
    beforeEach(() => {
      // Mock the API call to ensure the component renders with data
      const mockQuestion = {
        Q_id: '123',
        questionText: 'Test question for component interaction',
        answers: [{ answer_text: 'test', isCorrect: true }],
        question_type: 'Math Input',
      };

      cy.intercept('GET', '**/practice/type/Math%20Input', {
        statusCode: 200,
        body: {
          success: true,
          questions: [mockQuestion],
        },
      }).as('getQuestions');

      // Visit the page containing the math keyboard
      cy.visit('/question-templates/input-questions');

      // Ensure the math keyboard components are rendered
      cy.get('textarea.math-input').should('be.visible');
      // Check for a button on the default "Basic" tab
      cy.contains('button', '+').should('be.visible');
    });

    /**
     * Test: Math keyboard button correctly updates the input field.
     * Components: /app/ui/math-keyboard/client-wrapper.jsx, /app/ui/math-keyboard/math-input-template.jsx
     * User Behavior: Clicks a symbol on the virtual keyboard and sees it appear in the input area.
     */
    it('should insert a symbol into the input when a keyboard button is clicked', () => {
      const mathInput = 'textarea.math-input';

      // Ensure the input is empty initially
      cy.get(mathInput).should('have.value', '');

      // Find the '+' button on the basic keyboard and click it
      cy.contains('button', '+').click();
      cy.get(mathInput).should('have.value', '+');

      // Click another button, e.g., '2' - assuming it exists.
      // Based on my analysis, only symbols are present. Let's use another symbol.
      cy.contains('button', '√').click();
      cy.get(mathInput).should('have.value', '+sqrt(');
    });

    /**
     * Test: The 'Clear' button removes all content from the input field.
     * Components: /app/ui/math-keyboard/math-input-template.jsx
     * User Behavior: Types something into the input, then clicks the 'Clear' button.
     */
    it("should clear the input when the 'Clear' button is clicked", () => {
      const mathInput = 'textarea.math-input';

      // Type something into the input manually
      cy.get(mathInput).type('123+456');

      // Click the 'Clear' button
      cy.contains('button', 'Clear').click();

      // Verify the input is now empty
      cy.get(mathInput).should('have.value', '');
    });

    /**
     * Test: The backspace button removes the last character.
     * Components: /app/ui/math-keyboard/math-input-template.jsx
     * User Behavior: Types something and then uses the virtual backspace.
     */
    it("should remove the last character when backspace is clicked", () => {
        const mathInput = 'textarea.math-input';

        // Switch to the functions tab to find the 'sin' button
        cy.contains('button', 'Functions').click();
        
        // Use keyboard to input 'sin('
        cy.contains('button', 'sin').click();
        cy.get(mathInput).should('have.value', 'sin(');

        // Use the virtual backspace
        cy.contains('button', '⌫').click();

        // Verify the input
        cy.get(mathInput).should('have.value', 'sin');
    });
  });
}); 