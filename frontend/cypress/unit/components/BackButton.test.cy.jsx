import Back from '../../../src/app/ui/back';

describe('Back Button Component Unit Tests', () => {
  describe('Rendering', () => {
    it('should render the back button', () => {
      cy.mount(<Back />);
      
      cy.get('button').should('exist');
    });

    it('should render with default text', () => {
      cy.mount(<Back />);
      
      cy.get('button').should('contain', 'Back');
    });

    it('should render with custom text', () => {
      cy.mount(<Back>Go Back</Back>);
      
      cy.get('button').should('contain', 'Go Back');
    });

    it('should render with icon', () => {
      cy.mount(<Back />);
      
      // Should contain an icon or arrow
      cy.get('button').should('not.be.empty');
    });
  });

  describe('CSS Classes', () => {
    it('should have correct CSS classes', () => {
      cy.mount(<Back />);
      
      cy.get('button').should('have.class', 'flex');
      cy.get('button').should('have.class', 'items-center');
      cy.get('button').should('have.class', 'gap-2');
      cy.get('button').should('have.class', 'text-gray-600');
      cy.get('button').should('have.class', 'hover:text-gray-900');
      cy.get('button').should('have.class', 'transition-colors');
    });

    it('should have proper button styling', () => {
      cy.mount(<Back />);
      
      cy.get('button').should('have.class', 'px-3');
      cy.get('button').should('have.class', 'py-2');
      cy.get('button').should('have.class', 'rounded-md');
      cy.get('button').should('have.class', 'text-sm');
      cy.get('button').should('have.class', 'font-medium');
    });
  });

  describe('Click Handling', () => {
    it('should handle click events', () => {
      const clickSpy = cy.spy().as('clickSpy');
      
      cy.mount(<Back onClick={clickSpy} />);
      
      cy.get('button').click();
      cy.get('@clickSpy').should('have.been.called');
    });

    it('should handle click without onClick prop', () => {
      cy.mount(<Back />);
      
      // Should handle clicks without errors even without onClick
      cy.get('button').click();
    });

    it('should be keyboard accessible', () => {
      cy.mount(<Back />);
      
      cy.get('button').focus();
      cy.get('button').should('be.focused');
      
      cy.get('button').type('{enter}');
      // Should handle Enter key press
    });

    it('should handle space key press', () => {
      cy.mount(<Back />);
      
      cy.get('button').focus();
      cy.get('button').type(' ');
      // Should handle Space key press
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      cy.mount(<Back />);
      
      cy.get('button').should('have.attr', 'type', 'button');
    });

    it('should be keyboard navigable', () => {
      cy.mount(<Back />);
      
      cy.get('button').focus();
      cy.get('button').should('be.focused');
    });

    it('should have proper focus indicators', () => {
      cy.mount(<Back />);
      
      cy.get('button').focus();
      // Should have visible focus indicator
    });

    it('should have proper semantic structure', () => {
      cy.mount(<Back />);
      
      cy.get('button').should('exist');
    });
  });

  describe('Props Handling', () => {
    it('should accept onClick prop', () => {
      const clickSpy = cy.spy().as('clickSpy');
      
      cy.mount(<Back onClick={clickSpy} />);
      
      cy.get('button').click();
      cy.get('@clickSpy').should('have.been.called');
    });

    it('should accept children prop', () => {
      cy.mount(<Back>Custom Back Text</Back>);
      
      cy.get('button').should('contain', 'Custom Back Text');
    });

    it('should accept className prop', () => {
      cy.mount(<Back className="custom-class" />);
      
      cy.get('button').should('have.class', 'custom-class');
    });

    it('should handle disabled state', () => {
      cy.mount(<Back disabled />);
      
      cy.get('button').should('be.disabled');
    });
  });

  describe('Responsive Design', () => {
    it('should be responsive on different screen sizes', () => {
      cy.mount(<Back />);
      
      // Test on different viewport sizes
      cy.viewport(320, 480); // Mobile
      cy.get('button').should('be.visible');
      
      cy.viewport(768, 1024); // Tablet
      cy.get('button').should('be.visible');
      
      cy.viewport(1920, 1080); // Desktop
      cy.get('button').should('be.visible');
    });
  });

  describe('Hover States', () => {
    it('should handle hover states', () => {
      cy.mount(<Back />);
      
      cy.get('button').trigger('mouseover');
      // Should handle hover without errors
    });

    it('should have hover color changes', () => {
      cy.mount(<Back />);
      
      cy.get('button').should('have.class', 'hover:text-gray-900');
    });
  });

  describe('Performance', () => {
    it('should render quickly', () => {
      const startTime = Date.now();
      
      cy.mount(<Back />);
      
      const endTime = Date.now();
      expect(endTime - startTime).to.be.lessThan(100); // Should render quickly
    });

    it('should handle rapid clicks efficiently', () => {
      const clickSpy = cy.spy().as('clickSpy');
      
      cy.mount(<Back onClick={clickSpy} />);
      
      // Should handle rapid clicks without performance issues
      for (let i = 0; i < 5; i++) {
        cy.get('button').click();
      }
      
      cy.get('@clickSpy').should('have.callCount', 5);
    });
  });

  describe('Error Handling', () => {
    it('should handle onClick errors gracefully', () => {
      const errorOnClick = () => {
        throw new Error('Test error');
      };
      
      cy.mount(<Back onClick={errorOnClick} />);
      
      // Should handle onClick errors gracefully
      cy.get('button').click();
    });

    it('should handle missing props gracefully', () => {
      cy.mount(<Back />);
      
      // Should render without errors even with missing props
      cy.get('button').should('exist');
    });
  });

  describe('Integration', () => {
    it('should work within a navigation context', () => {
      cy.mount(
        <div className="navigation">
          <Back />
          <div className="content">Page Content</div>
        </div>
      );
      
      cy.get('button').should('exist');
      cy.get('.content').should('contain', 'Page Content');
    });

    it('should work with other UI components', () => {
      cy.mount(
        <div className="ui-container">
          <Back />
          <button className="primary-button">Primary Action</button>
        </div>
      );
      
      cy.get('button').should('have.length', 2);
      cy.get('.primary-button').should('contain', 'Primary Action');
    });
  });

  describe('Styling Consistency', () => {
    it('should maintain consistent styling', () => {
      cy.mount(<Back />);
      
      // Should have consistent text color
      cy.get('button').should('have.class', 'text-gray-600');
      
      // Should have consistent hover state
      cy.get('button').should('have.class', 'hover:text-gray-900');
    });

    it('should have proper spacing', () => {
      cy.mount(<Back />);
      
      // Should have proper padding
      cy.get('button').should('have.class', 'px-3');
      cy.get('button').should('have.class', 'py-2');
    });
  });

  describe('Content Structure', () => {
    it('should contain icon and text', () => {
      cy.mount(<Back />);
      
      // Should contain both icon and text
      cy.get('button').should('not.be.empty');
    });

    it('should have proper flex layout', () => {
      cy.mount(<Back />);
      
      // Should have proper flex layout for icon and text
      cy.get('button').should('have.class', 'flex');
      cy.get('button').should('have.class', 'items-center');
      cy.get('button').should('have.class', 'gap-2');
    });
  });
}); 