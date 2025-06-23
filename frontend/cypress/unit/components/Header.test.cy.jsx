import Header from '@/app/ui/header';
import HeaderContent from '@/app/ui/header-content';

describe('Header Components', () => {
  describe('Header Component', () => {
    it('should render with correct structure', () => {
      cy.mount(<Header />);

      cy.get('.header_styling').should('exist');
      cy.get('.header_styling').should('have.class', 'fixed');
      cy.get('.header_styling').should('have.class', 'top-0');
      cy.get('.header_styling').should('have.class', 'left-0');
      cy.get('.header_styling').should('have.class', 'w-full');
      cy.get('.header_styling').should('have.class', 'h-20');
      cy.get('.header_styling').should('have.class', 'z-50');
    });

    it('should apply correct CSS classes', () => {
      cy.mount(<Header />);

      cy.get('.header_styling').should('have.class', 'flex');
      cy.get('.header_styling').should('have.class', 'flex-col');
      cy.get('.header_styling').should('have.class', 'px-3');
      cy.get('.header_styling').should('have.class', 'py-4');
      cy.get('.header_styling').should('have.class', 'md:static');
      cy.get('.header_styling').should('have.class', 'md:h-full');
      cy.get('.header_styling').should('have.class', 'md:w-auto');
      cy.get('.header_styling').should('have.class', 'md:px-2');
    });

    it('should contain HeaderContent component', () => {
      cy.mount(<Header />);

      // Check that HeaderContent is rendered
      cy.get('.header_styling').should('contain', '5');
      cy.get('.header_styling').should('contain', '3');
      cy.get('.header_styling').should('contain', '300xp');
      cy.get('.header_styling').should('contain', '75%');
    });

    it('should be responsive', () => {
      cy.mount(<Header />);

      // Test mobile viewport
      cy.viewport(375, 667);
      cy.get('.header_styling').should('have.class', 'fixed');
      cy.get('.header_styling').should('have.class', 'top-0');
      cy.get('.header_styling').should('have.class', 'h-20');

      // Test desktop viewport
      cy.viewport(1024, 768);
      cy.get('.header_styling').should('have.class', 'md:static');
      cy.get('.header_styling').should('have.class', 'md:h-full');
    });

    it('should maintain proper layout structure', () => {
      cy.mount(<Header />);

      cy.get('.header_styling > div').should('have.class', 'flex');
      cy.get('.header_styling > div').should('have.class', 'grow');
      cy.get('.header_styling > div').should('have.class', 'flex-row');
      cy.get('.header_styling > div').should('have.class', 'justify-between');
      cy.get('.header_styling > div').should('have.class', 'space-x-2');
      cy.get('.header_styling > div').should('have.class', 'md:flex-col');
      cy.get('.header_styling > div').should('have.class', 'md:justify-start');
      cy.get('.header_styling > div').should('have.class', 'md:space-x-0');
      cy.get('.header_styling > div').should('have.class', 'md:space-y-2');
    });

    it('should contain hidden element on desktop', () => {
      cy.mount(<Header />);

      cy.get('.hidden.h-auto.w-full.grow.rounded-md.md\\:block').should(
        'exist',
      );
    });
  });

  describe('HeaderContent Component', () => {
    it('should render with correct structure', () => {
      cy.mount(<HeaderContent />);

      cy.get('.w-full.md\\:w-auto').should('exist');
      cy.get(
        '.flex.h-\\[48px\\].w-full.items-start.justify-center.gap-6.rounded-md.p-3.text-sm.font-medium',
      ).should('exist');
    });

    it('should display all stats correctly', () => {
      cy.mount(<HeaderContent />);

      // Check for all stat items
      cy.get('.flex.items-center.gap-2').should('have.length', 4);

      // Check for specific stats
      cy.contains('5').should('be.visible');
      cy.contains('3').should('be.visible');
      cy.contains('300xp').should('be.visible');
      cy.contains('75%').should('be.visible');
    });

    it('should render all icons correctly', () => {
      cy.mount(<HeaderContent />);

      // Check that all icons are present
      cy.get('svg').should('have.length', 4);

      // Check for specific icons by their attributes
      cy.get('svg').each(($svg) => {
        cy.wrap($svg).should('have.attr', 'size', '24');
      });
    });

    it('should apply correct CSS classes to container', () => {
      cy.mount(<HeaderContent />);

      cy.get('.w-full.md\\:w-auto').should('exist');
      cy.get(
        '.flex.h-\\[48px\\].w-full.items-start.justify-center.gap-6.rounded-md.p-3.text-sm.font-medium',
      ).should('exist');
    });

    it('should apply responsive classes correctly', () => {
      cy.mount(<HeaderContent />);

      const container = cy.get(
        '.flex.h-\\[48px\\].w-full.items-start.justify-center.gap-6.rounded-md.p-3.text-sm.font-medium',
      );
      container.should('have.class', 'md:flex-col');
      container.should('have.class', 'md:h-auto');
      container.should('have.class', 'md:gap-4');
      container.should('have.class', 'md:justify-start');
      container.should('have.class', 'md:p-2');
      container.should('have.class', 'md:px-5');
      container.should('have.class', 'md:w-auto');
    });

    it('should display hearts stat with correct styling', () => {
      cy.mount(<HeaderContent />);

      cy.get('.flex.items-center.gap-2')
        .first()
        .within(() => {
          cy.get('svg').should('exist');
          cy.get('svg').should('have.attr', 'size', '24');
          cy.get('svg').should('have.attr', 'fill', '#FF6E99');
          cy.get('svg').should('have.attr', 'stroke', '#FF6E99');
          cy.contains('5').should('be.visible');
        });
    });

    it('should display flame stat with correct styling', () => {
      cy.mount(<HeaderContent />);

      cy.get('.flex.items-center.gap-2')
        .eq(1)
        .within(() => {
          cy.get('svg').should('exist');
          cy.get('svg').should('have.attr', 'size', '24');
          cy.get('svg').should('have.attr', 'fill', '#FF8000');
          cy.get('svg').should('have.attr', 'stroke', '#FF8000');
          cy.contains('3').should('be.visible');
        });
    });

    it('should display shield stat with correct styling', () => {
      cy.mount(<HeaderContent />);

      cy.get('.flex.items-center.gap-2')
        .eq(2)
        .within(() => {
          cy.get('svg').should('exist');
          cy.get('svg').should('have.attr', 'size', '24');
          cy.get('svg').should('have.attr', 'fill', '#4D5DED');
          cy.get('svg').should('have.attr', 'stroke', '#4D5DED');
          cy.contains('300xp').should('be.visible');
        });
    });

    it('should display gauge stat with correct styling', () => {
      cy.mount(<HeaderContent />);

      cy.get('.flex.items-center.gap-2')
        .eq(3)
        .within(() => {
          cy.get('svg').should('exist');
          cy.get('svg').should('have.attr', 'size', '24');
          cy.get('svg').should('have.attr', 'stroke', '#309F04');
          cy.contains('75%').should('be.visible');
        });
    });

    it('should maintain consistent spacing between stats', () => {
      cy.mount(<HeaderContent />);

      // Check that all stat items have consistent gap
      cy.get('.flex.items-center.gap-2').each(($stat) => {
        cy.wrap($stat).should('have.class', 'gap-2');
      });
    });

    it('should be responsive', () => {
      cy.mount(<HeaderContent />);

      // Test mobile viewport
      cy.viewport(375, 667);
      cy.get('.w-full.md\\:w-auto').should('be.visible');

      // Test desktop viewport
      cy.viewport(1024, 768);
      cy.get('.w-full.md\\:w-auto').should('be.visible');
    });

    it('should handle different content lengths', () => {
      cy.mount(<HeaderContent />);

      // Check that stats with different text lengths are displayed correctly
      cy.contains('5').should('be.visible'); // Short text
      cy.contains('300xp').should('be.visible'); // Medium text
      cy.contains('75%').should('be.visible'); // Short text with symbol
    });

    it('should maintain proper icon and text alignment', () => {
      cy.mount(<HeaderContent />);

      cy.get('.flex.items-center.gap-2').each(($stat) => {
        cy.wrap($stat).should('have.class', 'items-center');
        cy.wrap($stat).find('svg').should('exist');
        cy.wrap($stat).find('p').should('exist');
      });
    });

    it('should be accessible', () => {
      cy.mount(<HeaderContent />);

      // Check that all content is visible and readable
      cy.get('.flex.items-center.gap-2').each(($stat) => {
        cy.wrap($stat).should('be.visible');
        cy.wrap($stat).find('p').should('be.visible');
      });
    });

    it('should handle hover states', () => {
      cy.mount(<HeaderContent />);

      // Test hover interaction
      cy.get('.flex.items-center.gap-2').first().trigger('mouseover');
      cy.get('.flex.items-center.gap-2').first().should('be.visible');
    });

    it('should work with different viewport sizes', () => {
      cy.mount(<HeaderContent />);

      // Test mobile viewport
      cy.viewport(375, 667);
      cy.get('.flex.items-center.gap-2').should('have.length', 4);

      // Test desktop viewport
      cy.viewport(1024, 768);
      cy.get('.flex.items-center.gap-2').should('have.length', 4);
    });

    it('should maintain proper text sizing', () => {
      cy.mount(<HeaderContent />);

      cy.get('p').each(($text) => {
        cy.wrap($text).should('have.class', 'text-sm');
        cy.wrap($text).should('have.class', 'font-medium');
      });
    });

    it('should handle icon colors correctly', () => {
      cy.mount(<HeaderContent />);

      // Check that icons have the correct colors
      cy.get('svg').eq(0).should('have.attr', 'fill', '#FF6E99'); // Heart
      cy.get('svg').eq(1).should('have.attr', 'fill', '#FF8000'); // Flame
      cy.get('svg').eq(2).should('have.attr', 'fill', '#4D5DED'); // Shield
      cy.get('svg').eq(3).should('have.attr', 'stroke', '#309F04'); // Gauge
    });
  });
});
