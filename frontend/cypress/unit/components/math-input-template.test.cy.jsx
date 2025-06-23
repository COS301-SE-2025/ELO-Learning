import MathInputTemplate from '@/app/ui/math-keyboard/math-input-template';

describe('MathInputTemplate Component', () => {
  const defaultProps = {
    correctAnswer: '4',
    setStudentAnswer: cy.stub().as('setStudentAnswer'),
    setIsAnswerCorrect: cy.stub().as('setIsAnswerCorrect'),
    setIsValidExpression: cy.stub().as('setIsValidExpression'),
    studentAnswer: '',
  };

  beforeEach(() => {
    // Mock the API functions
    cy.stub(global, 'fetch').as('fetchStub');
    cy.stub(console, 'log').as('consoleLogStub');
  });

  it('should render with correct structure', () => {
    cy.mount(<MathInputTemplate {...defaultProps} />);

    cy.get('input[type="text"]').should('exist');
    cy.get('.math-categories').should('exist');
    cy.get('.math-symbols').should('exist');
  });

  it('should render math symbol categories', () => {
    cy.mount(<MathInputTemplate {...defaultProps} />);

    // Check for category tabs
    cy.get('[data-category="basic"]').should('exist');
    cy.get('[data-category="functions"]').should('exist');
    cy.get('[data-category="constants"]').should('exist');
    cy.get('[data-category="advanced"]').should('exist');
    cy.get('[data-category="templates"]').should('exist');
  });

  it('should display basic math symbols', () => {
    cy.mount(<MathInputTemplate {...defaultProps} />);

    // Check for basic symbols
    cy.get('[data-category="basic"]').click();
    cy.get('.math-symbols').should('contain', '+');
    cy.get('.math-symbols').should('contain', '−');
    cy.get('.math-symbols').should('contain', '×');
    cy.get('.math-symbols').should('contain', '÷');
    cy.get('.math-symbols').should('contain', '(');
    cy.get('.math-symbols').should('contain', ')');
  });

  it('should handle input changes', () => {
    cy.mount(<MathInputTemplate {...defaultProps} />);

    cy.get('input[type="text"]').type('2+2');
    cy.get('input[type="text"]').should('have.value', '2+2');
  });

  it('should insert symbols when clicked', () => {
    cy.mount(<MathInputTemplate {...defaultProps} />);

    cy.get('[data-category="basic"]').click();
    cy.get('.math-symbols').contains('+').click();

    cy.get('input[type="text"]').should('have.value', '+');
  });

  it('should handle multiple symbol insertions', () => {
    cy.mount(<MathInputTemplate {...defaultProps} />);

    cy.get('[data-category="basic"]').click();
    cy.get('.math-symbols').contains('2').click();
    cy.get('.math-symbols').contains('+').click();
    cy.get('.math-symbols').contains('2').click();

    cy.get('input[type="text"]').should('have.value', '2+2');
  });

  it('should validate expressions in real-time', () => {
    cy.mount(<MathInputTemplate {...defaultProps} />);

    // Mock successful validation response
    cy.get('@fetchStub').resolves({
      ok: true,
      json: () =>
        Promise.resolve({ isValid: true, message: 'Valid expression' }),
    });

    cy.get('input[type="text"]').type('2+2');

    // Wait for validation to complete
    cy.wait(400); // Wait for debounced validation

    cy.get('@setIsValidExpression').should('have.been.calledWith', true);
  });

  it('should show validation errors for invalid expressions', () => {
    cy.mount(<MathInputTemplate {...defaultProps} />);

    // Mock failed validation response
    cy.get('@fetchStub').resolves({
      ok: true,
      json: () =>
        Promise.resolve({ isValid: false, message: 'Invalid syntax' }),
    });

    cy.get('input[type="text"]').type('2++2');

    cy.wait(400);

    cy.get('@setIsValidExpression').should('have.been.calledWith', false);
  });

  it('should perform quick validation against correct answer', () => {
    cy.mount(<MathInputTemplate {...defaultProps} />);

    // Mock quick validation response
    cy.get('@fetchStub').resolves({
      ok: true,
      json: () => Promise.resolve({ isCorrect: true }),
    });

    cy.get('input[type="text"]').type('2+2');

    cy.wait(400);

    cy.get('@setIsAnswerCorrect').should('have.been.calledWith', true);
  });

  it('should handle function symbols', () => {
    cy.mount(<MathInputTemplate {...defaultProps} />);

    cy.get('[data-category="functions"]').click();
    cy.get('.math-symbols').contains('sin').click();

    cy.get('input[type="text"]').should('have.value', 'sin()');
  });

  it('should handle constant symbols', () => {
    cy.mount(<MathInputTemplate {...defaultProps} />);

    cy.get('[data-category="constants"]').click();
    cy.get('.math-symbols').contains('π').click();

    cy.get('input[type="text"]').should('have.value', 'pi');
  });

  it('should handle template symbols', () => {
    cy.mount(<MathInputTemplate {...defaultProps} />);

    cy.get('[data-category="templates"]').click();
    cy.get('.math-symbols').contains('a/b').click();

    cy.get('input[type="text"]').should('have.value', 'frac{}{');
  });

  it('should handle backspace functionality', () => {
    cy.mount(<MathInputTemplate {...defaultProps} />);

    cy.get('input[type="text"]').type('2+2');
    cy.get('.backspace-btn').click();

    cy.get('input[type="text"]').should('have.value', '2+');
  });

  it('should handle clear functionality', () => {
    cy.mount(<MathInputTemplate {...defaultProps} />);

    cy.get('input[type="text"]').type('2+2');
    cy.get('.clear-btn').click();

    cy.get('input[type="text"]').should('have.value', '');
  });

  it('should show auto-completion suggestions', () => {
    cy.mount(<MathInputTemplate {...defaultProps} />);

    cy.get('input[type="text"]').type('sin');

    // Check if suggestions appear
    cy.get('.suggestions').should('exist');
    cy.get('.suggestions').should('contain', 'sin()');
  });

  it('should handle suggestion clicks', () => {
    cy.mount(<MathInputTemplate {...defaultProps} />);

    cy.get('input[type="text"]').type('sin');
    cy.get('.suggestions').contains('sin()').click();

    cy.get('input[type="text"]').should('have.value', 'sin()');
  });

  it('should handle keyboard navigation', () => {
    cy.mount(<MathInputTemplate {...defaultProps} />);

    cy.get('input[type="text"]').focus();
    cy.get('input[type="text"]').type('2+2');

    // Test arrow key navigation
    cy.get('input[type="text"]').type('{leftArrow}');
    cy.get('input[type="text"]').type('3');

    cy.get('input[type="text"]').should('have.value', '2+32');
  });

  it('should handle cursor position tracking', () => {
    cy.mount(<MathInputTemplate {...defaultProps} />);

    cy.get('input[type="text"]').type('2+2');
    cy.get('input[type="text"]').click({ position: 'center' });

    // Cursor position should be tracked for auto-completion
    cy.get('input[type="text"]').should('be.focused');
  });

  it('should handle input history', () => {
    cy.mount(<MathInputTemplate {...defaultProps} />);

    cy.get('input[type="text"]').type('2+2');
    cy.get('input[type="text"]').type('{enter}');

    cy.get('input[type="text"]').type('3*4');
    cy.get('input[type="text"]').type('{enter}');

    // History should be maintained
    cy.get('.history-btn').click();
    cy.get('.input-history').should('exist');
  });

  it('should handle responsive design', () => {
    cy.mount(<MathInputTemplate {...defaultProps} />);

    // Test on mobile viewport
    cy.viewport(375, 667);
    cy.get('.math-keyboard').should('be.visible');

    // Test on desktop viewport
    cy.viewport(1024, 768);
    cy.get('.math-keyboard').should('be.visible');
  });

  it('should handle error states gracefully', () => {
    cy.mount(<MathInputTemplate {...defaultProps} />);

    // Mock network error
    cy.get('@fetchStub').rejects(new Error('Network error'));

    cy.get('input[type="text"]').type('2+2');

    cy.wait(400);

    // Should handle error without crashing
    cy.get('input[type="text"]').should('have.value', '2+2');
  });

  it('should update parent state when input changes', () => {
    cy.mount(<MathInputTemplate {...defaultProps} />);

    cy.get('input[type="text"]').type('2+2');

    cy.get('@setStudentAnswer').should('have.been.calledWith', '2+2');
  });

  it('should handle empty input validation', () => {
    cy.mount(<MathInputTemplate {...defaultProps} />);

    cy.get('input[type="text"]').clear();

    cy.get('@setIsValidExpression').should('have.been.calledWith', true);
    cy.get('@setIsAnswerCorrect').should('have.been.calledWith', false);
  });

  it('should provide accessibility features', () => {
    cy.mount(<MathInputTemplate {...defaultProps} />);

    // Check for proper ARIA labels
    cy.get('input[type="text"]').should('have.attr', 'aria-label');

    // Check for keyboard navigation
    cy.get('input[type="text"]').focus();
    cy.get('input[type="text"]').should('be.focused');
  });
});
