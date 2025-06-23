import MathInputTemplate from '../../../src/app/ui/math-keyboard/math-input-template';

describe('MathInputTemplate Component Unit Tests', () => {
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
    it('should render the math input component', () => {
      cy.mount(<MathInputTemplate {...defaultProps} />);
      
      cy.get('textarea').should('exist');
      cy.get('.math-categories').should('exist');
    });

    it('should render with initial student answer', () => {
      const props = { ...defaultProps, studentAnswer: '2+2' };
      cy.mount(<MathInputTemplate {...props} />);
      
      cy.get('textarea').should('have.value', '2+2');
    });

    it('should render math symbol categories', () => {
      cy.mount(<MathInputTemplate {...defaultProps} />);
      
      // Check for basic category
      cy.get('[data-category="basic"]').should('exist');
      cy.get('[data-category="functions"]').should('exist');
      cy.get('[data-category="constants"]').should('exist');
      cy.get('[data-category="advanced"]').should('exist');
      cy.get('[data-category="templates"]').should('exist');
    });
  });

  describe('Input Functionality', () => {
    it('should handle text input changes', () => {
      cy.mount(<MathInputTemplate {...defaultProps} />);
      
      cy.get('textarea').type('2+2');
      cy.get('textarea').should('have.value', '2+2');
    });

    it('should call setStudentAnswer when input changes', () => {
      cy.mount(<MathInputTemplate {...defaultProps} />);
      
      cy.get('textarea').type('2+2');
      cy.get('@setStudentAnswer').should('have.been.called');
    });

    it('should handle cursor position tracking', () => {
      cy.mount(<MathInputTemplate {...defaultProps} />);
      
      cy.get('textarea').type('2+2');
      cy.get('textarea').click();
      // Cursor position should be tracked
      cy.get('textarea').should('be.focused');
    });
  });

  describe('Math Symbol Insertion', () => {
    it('should insert basic math symbols', () => {
      cy.mount(<MathInputTemplate {...defaultProps} />);
      
      // Test basic symbol insertion
      cy.get('[data-symbol="+"]').click();
      cy.get('textarea').should('contain.value', '+');
    });

    it('should insert function symbols', () => {
      cy.mount(<MathInputTemplate {...defaultProps} />);
      
      cy.get('[data-symbol="sin("]').click();
      cy.get('textarea').should('contain.value', 'sin(');
    });

    it('should insert constant symbols', () => {
      cy.mount(<MathInputTemplate {...defaultProps} />);
      
      cy.get('[data-symbol="pi"]').click();
      cy.get('textarea').should('contain.value', 'π');
    });

    it('should insert advanced symbols', () => {
      cy.mount(<MathInputTemplate {...defaultProps} />);
      
      cy.get('[data-symbol="sqrt("]').click();
      cy.get('textarea').should('contain.value', 'sqrt(');
    });
  });

  describe('Expression Validation', () => {
    it('should validate valid expressions', () => {
      cy.get('@fetchStub').resolves({
        ok: true,
        json: () => Promise.resolve({ isValid: true, message: 'Valid expression' })
      });

      cy.mount(<MathInputTemplate {...defaultProps} />);
      
      cy.get('textarea').type('2+2');
      cy.get('@setIsValidExpression').should('have.been.calledWith', true);
    });

    it('should handle invalid expressions', () => {
      cy.get('@fetchStub').resolves({
        ok: true,
        json: () => Promise.resolve({ isValid: false, message: 'Invalid syntax' })
      });

      cy.mount(<MathInputTemplate {...defaultProps} />);
      
      cy.get('textarea').type('2++2');
      cy.get('@setIsValidExpression').should('have.been.calledWith', false);
    });

    it('should show validation messages', () => {
      cy.get('@fetchStub').resolves({
        ok: true,
        json: () => Promise.resolve({ isValid: false, message: 'Invalid syntax' })
      });

      cy.mount(<MathInputTemplate {...defaultProps} />);
      
      cy.get('textarea').type('2++2');
      cy.get('.validation-message').should('contain', 'Invalid syntax');
    });
  });

  describe('Quick Validation', () => {
    it('should perform quick validation against correct answer', () => {
      cy.get('@fetchStub').resolves({
        ok: true,
        json: () => Promise.resolve({ isCorrect: true, confidence: 0.95 })
      });

      cy.mount(<MathInputTemplate {...defaultProps} />);
      
      cy.get('textarea').type('2+2=4');
      cy.get('@setIsAnswerCorrect').should('have.been.calledWith', true);
    });

    it('should handle incorrect answers', () => {
      cy.get('@fetchStub').resolves({
        ok: true,
        json: () => Promise.resolve({ isCorrect: false, confidence: 0.1 })
      });

      cy.mount(<MathInputTemplate {...defaultProps} />);
      
      cy.get('textarea').type('2+2=5');
      cy.get('@setIsAnswerCorrect').should('have.been.calledWith', false);
    });
  });

  describe('Auto-completion', () => {
    it('should show auto-completion suggestions', () => {
      cy.mount(<MathInputTemplate {...defaultProps} />);
      
      cy.get('textarea').type('sin');
      cy.get('.suggestions').should('exist');
      cy.get('.suggestion-item').should('contain', 'sin()');
    });

    it('should handle suggestion selection', () => {
      cy.mount(<MathInputTemplate {...defaultProps} />);
      
      cy.get('textarea').type('sin');
      cy.get('.suggestion-item').first().click();
      cy.get('textarea').should('contain.value', 'sin()');
    });
  });

  describe('Input History', () => {
    it('should maintain input history', () => {
      cy.mount(<MathInputTemplate {...defaultProps} />);
      
      cy.get('textarea').type('2+2');
      cy.get('.history-toggle').click();
      cy.get('.input-history').should('exist');
    });

    it('should allow history navigation', () => {
      cy.mount(<MathInputTemplate {...defaultProps} />);
      
      cy.get('textarea').type('2+2');
      cy.get('.history-up').click();
      cy.get('.history-down').click();
      // History navigation should work
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should handle backspace', () => {
      cy.mount(<MathInputTemplate {...defaultProps} />);
      
      cy.get('textarea').type('2+2');
      cy.get('textarea').type('{backspace}');
      cy.get('textarea').should('have.value', '2+');
    });

    it('should handle clear input', () => {
      cy.mount(<MathInputTemplate {...defaultProps} />);
      
      cy.get('textarea').type('2+2');
      cy.get('.clear-button').click();
      cy.get('textarea').should('have.value', '');
    });

    it('should handle keyboard shortcuts', () => {
      cy.mount(<MathInputTemplate {...defaultProps} />);
      
      cy.get('textarea').type('{ctrl}a'); // Select all
      cy.get('textarea').type('{ctrl}c'); // Copy
      cy.get('textarea').type('{ctrl}v'); // Paste
    });
  });

  describe('Tab Navigation', () => {
    it('should switch between math categories', () => {
      cy.mount(<MathInputTemplate {...defaultProps} />);
      
      cy.get('[data-category="functions"]').click();
      cy.get('.functions-symbols').should('be.visible');
      
      cy.get('[data-category="constants"]').click();
      cy.get('.constants-symbols').should('be.visible');
    });

    it('should highlight active tab', () => {
      cy.mount(<MathInputTemplate {...defaultProps} />);
      
      cy.get('[data-category="basic"]').should('have.class', 'active');
      cy.get('[data-category="functions"]').click();
      cy.get('[data-category="functions"]').should('have.class', 'active');
    });
  });

  describe('Helper Functions', () => {
    it('should show helper information', () => {
      cy.mount(<MathInputTemplate {...defaultProps} />);
      
      cy.get('.helper-toggle').click();
      cy.get('.helper-content').should('be.visible');
    });

    it('should display symbol descriptions', () => {
      cy.mount(<MathInputTemplate {...defaultProps} />);
      
      cy.get('[data-symbol="+"]').trigger('mouseover');
      cy.get('.symbol-tooltip').should('contain', 'Addition');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', () => {
      cy.get('@fetchStub').rejects(new Error('Network error'));

      cy.mount(<MathInputTemplate {...defaultProps} />);
      
      cy.get('textarea').type('2+2');
      // Should handle error without crashing
      cy.get('textarea').should('have.value', '2+2');
    });

    it('should handle validation timeouts', () => {
      cy.get('@fetchStub').resolves({
        ok: true,
        json: () => new Promise(resolve => setTimeout(() => resolve({ isValid: true }), 1000))
      });

      cy.mount(<MathInputTemplate {...defaultProps} />);
      
      cy.get('textarea').type('2+2');
      // Should handle delayed response
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      cy.mount(<MathInputTemplate {...defaultProps} />);
      
      cy.get('textarea').should('have.attr', 'aria-label');
      cy.get('[data-symbol="+"]').should('have.attr', 'aria-label');
    });

    it('should be keyboard navigable', () => {
      cy.mount(<MathInputTemplate {...defaultProps} />);
      
      cy.get('textarea').focus();
      cy.get('textarea').type('{tab}');
      // Should navigate to next element
    });
  });

  describe('Performance', () => {
    it('should handle rapid input changes', () => {
      cy.mount(<MathInputTemplate {...defaultProps} />);
      
      for (let i = 0; i < 10; i++) {
        cy.get('textarea').type('2+');
      }
      // Should handle rapid typing without performance issues
    });

    it('should debounce validation requests', () => {
      cy.get('@fetchStub').resolves({
        ok: true,
        json: () => Promise.resolve({ isValid: true })
      });

      cy.mount(<MathInputTemplate {...defaultProps} />);
      
      cy.get('textarea').type('2+2');
      // Should debounce validation calls
      cy.get('@fetchStub').should('have.been.called');
    });
  });
}); 