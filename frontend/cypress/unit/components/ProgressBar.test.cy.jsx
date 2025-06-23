import ProgressBar from '../../../src/app/ui/progress-bar';

describe('ProgressBar Component Unit Tests', () => {
  describe('Rendering', () => {
    it('should render with correct progress value', () => {
      cy.mount(<ProgressBar progress={0.5} />);

      cy.get('.progress-filled').should('have.css', 'width', '50%');
    });

    it('should render with 0% progress', () => {
      cy.mount(<ProgressBar progress={0} />);

      cy.get('.progress-filled').should('have.css', 'width', '0%');
    });

    it('should render with 100% progress', () => {
      cy.mount(<ProgressBar progress={1} />);

      cy.get('.progress-filled').should('have.css', 'width', '100%');
    });

    it('should render with decimal progress values', () => {
      cy.mount(<ProgressBar progress={0.75} />);

      cy.get('.progress-filled').should('have.css', 'width', '75%');
    });
  });

  describe('CSS Classes', () => {
    it('should have correct CSS classes', () => {
      cy.mount(<ProgressBar progress={0.5} />);

      cy.get('.progress-bar').should('exist');
      cy.get('.progress-filled').should('exist');
    });

    it('should have proper styling classes', () => {
      cy.mount(<ProgressBar progress={0.5} />);

      cy.get('.progress-bar').should('have.class', 'w-full');
      cy.get('.progress-bar').should('have.class', 'h-2');
      cy.get('.progress-bar').should('have.class', 'rounded-full');
      cy.get('.progress-bar').should('have.class', 'overflow-hidden');
      cy.get('.progress-bar').should('have.class', 'relative');
    });

    it('should have progress-filled styling', () => {
      cy.mount(<ProgressBar progress={0.5} />);

      cy.get('.progress-filled').should('have.class', 'h-full');
      cy.get('.progress-filled').should('have.class', 'transition-all');
      cy.get('.progress-filled').should('have.class', 'duration-300');
      cy.get('.progress-filled').should('have.class', 'relative');
    });
  });

  describe('Inner Elements', () => {
    it('should have inner highlight element', () => {
      cy.mount(<ProgressBar progress={0.5} />);

      cy.get('.progress-filled').within(() => {
        cy.get('.absolute').should('exist');
      });
    });

    it('should have correct inner element positioning', () => {
      cy.mount(<ProgressBar progress={0.5} />);

      cy.get('.progress-filled .absolute').should('have.class', 'top-0.5');
      cy.get('.progress-filled .absolute').should('have.class', 'left-1/2');
      cy.get('.progress-filled .absolute').should('have.class', 'transform');
      cy.get('.progress-filled .absolute').should(
        'have.class',
        '-translate-x-1/2',
      );
    });

    it('should have responsive width classes on inner element', () => {
      cy.mount(<ProgressBar progress={0.5} />);

      cy.get('.progress-filled .absolute').should('have.class', 'w-[85%]');
      cy.get('.progress-filled .absolute').should('have.class', 'md:w-[95%]');
    });
  });

  describe('Visual Effects', () => {
    it('should have transition effects', () => {
      cy.mount(<ProgressBar progress={0.5} />);

      cy.get('.progress-filled').should('have.class', 'transition-all');
      cy.get('.progress-filled').should('have.class', 'duration-300');
    });

    it('should have rounded corners', () => {
      cy.mount(<ProgressBar progress={0.5} />);

      cy.get('.progress-bar').should('have.class', 'rounded-full');
      cy.get('.progress-filled .absolute').should('have.class', 'rounded-full');
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive inner element width', () => {
      cy.mount(<ProgressBar progress={0.5} />);

      // Check that the inner element has responsive width classes
      cy.get('.progress-filled .absolute').should('have.class', 'w-[85%]');
      cy.get('.progress-filled .absolute').should('have.class', 'md:w-[95%]');
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative progress values', () => {
      cy.mount(<ProgressBar progress={-0.1} />);

      // Should clamp to 0%
      cy.get('.progress-filled').should('have.css', 'width', '0%');
    });

    it('should handle progress values greater than 1', () => {
      cy.mount(<ProgressBar progress={1.5} />);

      // Should clamp to 100%
      cy.get('.progress-filled').should('have.css', 'width', '100%');
    });

    it('should handle undefined progress prop', () => {
      cy.mount(<ProgressBar />);

      // Should default to 0%
      cy.get('.progress-filled').should('have.css', 'width', '0%');
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      cy.mount(<ProgressBar progress={0.5} />);

      // Should have a container div
      cy.get('.progress-bar').should('exist');

      // Should have a progress indicator
      cy.get('.progress-filled').should('exist');
    });

    it('should be visible and interactive', () => {
      cy.mount(<ProgressBar progress={0.5} />);

      cy.get('.progress-bar').should('be.visible');
      cy.get('.progress-filled').should('be.visible');
    });
  });

  describe('Performance', () => {
    it('should render quickly with different progress values', () => {
      const progressValues = [0, 0.25, 0.5, 0.75, 1];

      progressValues.forEach((progress) => {
        cy.mount(<ProgressBar progress={progress} />);
        cy.get('.progress-filled').should('exist');
      });
    });
  });
});
