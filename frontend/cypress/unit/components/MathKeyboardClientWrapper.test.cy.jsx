import MathKeyboardClientWrapper from '../../../src/app/ui/math-keyboard/client-wrapper';

describe('MathKeyboardClientWrapper Component Unit Tests', () => {
  const defaultProps = {
    correctAnswer: '2+2=4',
    setStudentAnswer: cy.stub().as('setStudentAnswer'),
    setIsAnswerCorrect: cy.stub().as('setIsAnswerCorrect'),
    setIsValidExpression: cy.stub().as('setIsValidExpression'),
    studentAnswer: '',
  };

  beforeEach(() => {
    // Stub the API functions
    cy.stub(window, 'fetch').as('fetchStub');
  });

  describe('Rendering', () => {
    it('should render the math keyboard wrapper', () => {
      cy.mount(<MathKeyboardClientWrapper {...defaultProps} />);

      cy.get('.math-keyboard-wrapper').should('exist');
    });

    it('should render with initial student answer', () => {
      const props = { ...defaultProps, studentAnswer: '2+2' };
      cy.mount(<MathKeyboardClientWrapper {...props} />);

      cy.get('textarea').should('have.value', '2+2');
    });

    it('should render math input template', () => {
      cy.mount(<MathKeyboardClientWrapper {...defaultProps} />);

      cy.get('.math-input-template').should('exist');
    });
  });

  describe('Input Handling', () => {
    it('should handle text input changes', () => {
      cy.mount(<MathKeyboardClientWrapper {...defaultProps} />);

      cy.get('textarea').type('2+2');
      cy.get('textarea').should('have.value', '2+2');
    });

    it('should call setStudentAnswer when input changes', () => {
      cy.mount(<MathKeyboardClientWrapper {...defaultProps} />);

      cy.get('textarea').type('2+2');
      cy.get('@setStudentAnswer').should('have.been.called');
    });

    it('should handle cursor position tracking', () => {
      cy.mount(<MathKeyboardClientWrapper {...defaultProps} />);

      cy.get('textarea').type('2+2');
      cy.get('textarea').click();
      cy.get('textarea').should('be.focused');
    });
  });

  describe('Math Symbol Insertion', () => {
    it('should insert basic math symbols', () => {
      cy.mount(<MathKeyboardClientWrapper {...defaultProps} />);

      cy.get('[data-symbol="+"]').click();
      cy.get('textarea').should('contain.value', '+');
    });

    it('should insert function symbols', () => {
      cy.mount(<MathKeyboardClientWrapper {...defaultProps} />);

      cy.get('[data-symbol="sin("]').click();
      cy.get('textarea').should('contain.value', 'sin(');
    });

    it('should insert constant symbols', () => {
      cy.mount(<MathKeyboardClientWrapper {...defaultProps} />);

      cy.get('[data-symbol="pi"]').click();
      cy.get('textarea').should('contain.value', 'π');
    });
  });

  describe('Expression Validation', () => {
    it('should validate valid expressions', () => {
      cy.get('@fetchStub').resolves({
        ok: true,
        json: () =>
          Promise.resolve({ isValid: true, message: 'Valid expression' }),
      });

      cy.mount(<MathKeyboardClientWrapper {...defaultProps} />);

      cy.get('textarea').type('2+2');
      cy.get('@setIsValidExpression').should('have.been.calledWith', true);
    });

    it('should handle invalid expressions', () => {
      cy.get('@fetchStub').resolves({
        ok: true,
        json: () =>
          Promise.resolve({ isValid: false, message: 'Invalid syntax' }),
      });

      cy.mount(<MathKeyboardClientWrapper {...defaultProps} />);

      cy.get('textarea').type('2++2');
      cy.get('@setIsValidExpression').should('have.been.calledWith', false);
    });
  });

  describe('Quick Validation', () => {
    it('should perform quick validation against correct answer', () => {
      cy.get('@fetchStub').resolves({
        ok: true,
        json: () => Promise.resolve({ isCorrect: true, confidence: 0.95 }),
      });

      cy.mount(<MathKeyboardClientWrapper {...defaultProps} />);

      cy.get('textarea').type('2+2=4');
      cy.get('@setIsAnswerCorrect').should('have.been.calledWith', true);
    });

    it('should handle incorrect answers', () => {
      cy.get('@fetchStub').resolves({
        ok: true,
        json: () => Promise.resolve({ isCorrect: false, confidence: 0.1 }),
      });

      cy.mount(<MathKeyboardClientWrapper {...defaultProps} />);

      cy.get('textarea').type('2+2=5');
      cy.get('@setIsAnswerCorrect').should('have.been.calledWith', false);
    });
  });

  describe('Tab Navigation', () => {
    it('should switch between math categories', () => {
      cy.mount(<MathKeyboardClientWrapper {...defaultProps} />);

      cy.get('[data-category="functions"]').click();
      cy.get('.functions-symbols').should('be.visible');

      cy.get('[data-category="constants"]').click();
      cy.get('.constants-symbols').should('be.visible');
    });

    it('should highlight active tab', () => {
      cy.mount(<MathKeyboardClientWrapper {...defaultProps} />);

      cy.get('[data-category="basic"]').should('have.class', 'active');
      cy.get('[data-category="functions"]').click();
      cy.get('[data-category="functions"]').should('have.class', 'active');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', () => {
      cy.get('@fetchStub').rejects(new Error('Network error'));

      cy.mount(<MathKeyboardClientWrapper {...defaultProps} />);

      cy.get('textarea').type('2+2');
      cy.get('textarea').should('have.value', '2+2');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      cy.mount(<MathKeyboardClientWrapper {...defaultProps} />);

      cy.get('textarea').should('have.attr', 'aria-label');
      cy.get('[data-symbol="+"]').should('have.attr', 'aria-label');
    });

    it('should be keyboard navigable', () => {
      cy.mount(<MathKeyboardClientWrapper {...defaultProps} />);

      cy.get('textarea').focus();
      cy.get('textarea').type('{tab}');
    });
  });
});
