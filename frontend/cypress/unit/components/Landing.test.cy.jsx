import LandingFooter from '@/app/ui/landing-footer';
import LandingHeader from '@/app/ui/landing-header';

describe('Landing Page Components', () => {
  describe('LandingHeader Component', () => {
    it('should render with correct structure', () => {
      cy.mount(<LandingHeader />);
      
      cy.get('.header-landing').should('exist');
      cy.get('.header-landing').should('have.class', 'fixed');
      cy.get('.header-landing').should('have.class', 'top-0');
      cy.get('.header-landing').should('have.class', 'left-0');
      cy.get('.header-landing').should('have.class', 'w-full');
      cy.get('.header-landing').should('have.class', 'h-20');
      cy.get('.header-landing').should('have.class', 'z-50');
    });

    it('should apply correct CSS classes', () => {
      cy.mount(<LandingHeader />);
      
      cy.get('.header-landing').should('have.class', 'flex');
      cy.get('.header-landing').should('have.class', 'flex-row');
      cy.get('.header-landing').should('have.class', 'justify-between');
      cy.get('.header-landing').should('have.class', 'align-middle');
      cy.get('.header-landing').should('have.class', 'px-3');
      cy.get('.header-landing').should('have.class', 'py-4');
      cy.get('.header-landing').should('have.class', 'bg-[#202123]');
      cy.get('.header-landing').should('have.class', 'md:px-10');
    });

    it('should display logo container', () => {
      cy.mount(<LandingHeader />);
      
      cy.get('.header-landing > div').first().should('have.class', 'flex');
      cy.get('.header-landing > div').first().should('have.class', 'items-center');
      cy.get('.header-landing > div').first().should('have.class', 'justify-center');
    });

    it('should render desktop logo on desktop viewport', () => {
      cy.mount(<LandingHeader />);
      
      cy.viewport(1024, 768);
      cy.get('img[alt="ELO Learning Mascot"]').should('have.class', 'hidden');
      cy.get('img[alt="ELO Learning Mascot"]').should('have.class', 'md:block');
    });

    it('should render mobile logo on mobile viewport', () => {
      cy.mount(<LandingHeader />);
      
      cy.viewport(375, 667);
      cy.get('img[alt="ELO Learning Mascot"]').should('have.class', 'block');
      cy.get('img[alt="ELO Learning Mascot"]').should('have.class', 'md:hidden');
    });

    it('should display download button', () => {
      cy.mount(<LandingHeader />);
      
      cy.get('.header-button').should('exist');
      cy.get('.header-button').should('contain', 'Download');
    });

    it('should have correct image attributes', () => {
      cy.mount(<LandingHeader />);
      
      // Check desktop logo
      cy.get('img[src="/ELO-Logo-Horizontal.png"]').should('exist');
      cy.get('img[src="/ELO-Logo-Horizontal.png"]').should('have.attr', 'width', '150');
      cy.get('img[src="/ELO-Logo-Horizontal.png"]').should('have.attr', 'height', '40');
      cy.get('img[src="/ELO-Logo-Horizontal.png"]').should('have.attr', 'alt', 'ELO Learning Mascot');
      cy.get('img[src="/ELO-Logo-Horizontal.png"]').should('have.attr', 'priority');
      
      // Check mobile logo
      cy.get('img[src="/ELO-Learning-Mascot.png"]').should('exist');
      cy.get('img[src="/ELO-Learning-Mascot.png"]').should('have.attr', 'width', '50');
      cy.get('img[src="/ELO-Learning-Mascot.png"]').should('have.attr', 'height', '50');
      cy.get('img[src="/ELO-Learning-Mascot.png"]').should('have.attr', 'alt', 'ELO Learning Mascot');
      cy.get('img[src="/ELO-Learning-Mascot.png"]').should('have.attr', 'priority');
    });

    it('should be responsive', () => {
      cy.mount(<LandingHeader />);
      
      // Test mobile viewport
      cy.viewport(375, 667);
      cy.get('.header-landing').should('have.class', 'px-3');
      
      // Test desktop viewport
      cy.viewport(1024, 768);
      cy.get('.header-landing').should('have.class', 'md:px-10');
    });

    it('should maintain proper layout structure', () => {
      cy.mount(<LandingHeader />);
      
      // Should have two main sections: logo and button
      cy.get('.header-landing > div').should('have.length', 2);
      
      // First div should be logo container
      cy.get('.header-landing > div').first().should('have.class', 'flex');
      cy.get('.header-landing > div').first().should('have.class', 'items-center');
      cy.get('.header-landing > div').first().should('have.class', 'justify-center');
      
      // Second div should contain button
      cy.get('.header-landing > div').last().should('contain', 'Download');
    });

    it('should handle button interactions', () => {
      cy.mount(<LandingHeader />);
      
      cy.get('.header-button').should('be.visible');
      cy.get('.header-button').should('not.be.disabled');
      
      // Test click interaction
      cy.get('.header-button').click();
      cy.get('.header-button').should('be.visible');
    });

    it('should be accessible', () => {
      cy.mount(<LandingHeader />);
      
      // Check that images have alt text
      cy.get('img').each(($img) => {
        cy.wrap($img).should('have.attr', 'alt');
      });
      
      // Check that button is focusable
      cy.get('.header-button').focus();
      cy.get('.header-button').should('be.focused');
    });
  });

  describe('LandingFooter Component', () => {
    it('should render with correct structure', () => {
      cy.mount(<LandingFooter />);
      
      cy.get('.bg-\\[\\#1D1A34\\]').should('exist');
      cy.get('.bg-\\[\\#1D1A34\\]').should('have.class', 'px-3');
      cy.get('.bg-\\[\\#1D1A34\\]').should('have.class', 'py-8');
      cy.get('.bg-\\[\\#1D1A34\\]').should('have.class', 'w-full');
      cy.get('.bg-\\[\\#1D1A34\\]').should('have.class', 'md:p-10');
    });

    it('should display footer links', () => {
      cy.mount(<LandingFooter />);
      
      cy.contains('Privacy Policy').should('be.visible');
      cy.contains('Terms of Service').should('be.visible');
      cy.contains('Help').should('be.visible');
    });

    it('should display footer logo', () => {
      cy.mount(<LandingFooter />);
      
      cy.get('img[src="/Light-horizontal.png"]').should('exist');
    });

    it('should render mobile logo on mobile viewport', () => {
      cy.mount(<LandingFooter />);
      
      cy.viewport(375, 667);
      cy.get('img[src="/Light-horizontal.png"]').should('have.class', 'block');
      cy.get('img[src="/Light-horizontal.png"]').should('have.class', 'md:hidden');
      cy.get('img[src="/Light-horizontal.png"]').should('have.attr', 'width', '150');
      cy.get('img[src="/Light-horizontal.png"]').should('have.attr', 'height', '50');
    });

    it('should render desktop logo on desktop viewport', () => {
      cy.mount(<LandingFooter />);
      
      cy.viewport(1024, 768);
      cy.get('img[src="/Light-horizontal.png"]').should('have.class', 'hidden');
      cy.get('img[src="/Light-horizontal.png"]').should('have.class', 'md:block');
      cy.get('img[src="/Light-horizontal.png"]').should('have.attr', 'width', '250');
      cy.get('img[src="/Light-horizontal.png"]').should('have.attr', 'height', '100');
    });

    it('should display copyright information', () => {
      cy.mount(<LandingFooter />);
      
      cy.contains('Created by Zero Day').should('be.visible');
      cy.contains('in collaboration with').should('be.visible');
      cy.contains('Proking Solutions').should('be.visible');
    });

    it('should have working external link', () => {
      cy.mount(<LandingFooter />);
      
      cy.get('a[href="https://proking.solutions/"]').should('exist');
      cy.get('a[href="https://proking.solutions/"]').should('have.attr', 'target', '_blank');
      cy.get('a[href="https://proking.solutions/"]').should('contain', 'Proking Solutions');
    });

    it('should apply correct CSS classes to main container', () => {
      cy.mount(<LandingFooter />);
      
      cy.get('.bg-\\[\\#1D1A34\\]').should('have.class', 'px-3');
      cy.get('.bg-\\[\\#1D1A34\\]').should('have.class', 'py-8');
      cy.get('.bg-\\[\\#1D1A34\\]').should('have.class', 'w-full');
      cy.get('.bg-\\[\\#1D1A34\\]').should('have.class', 'md:p-10');
    });

    it('should apply correct CSS classes to content container', () => {
      cy.mount(<LandingFooter />);
      
      cy.get('.flex.flex-row.gap-2.justify-between').should('exist');
    });

    it('should apply correct CSS classes to copyright section', () => {
      cy.mount(<LandingFooter />);
      
      cy.get('.text-sm.text-center.mt-5').should('exist');
    });

    it('should be responsive', () => {
      cy.mount(<LandingFooter />);
      
      // Test mobile viewport
      cy.viewport(375, 667);
      cy.get('.bg-\\[\\#1D1A34\\]').should('have.class', 'px-3');
      cy.get('.bg-\\[\\#1D1A34\\]').should('have.class', 'py-8');
      
      // Test desktop viewport
      cy.viewport(1024, 768);
      cy.get('.bg-\\[\\#1D1A34\\]').should('have.class', 'md:p-10');
    });

    it('should maintain proper layout structure', () => {
      cy.mount(<LandingFooter />);
      
      // Should have main content container
      cy.get('.flex.flex-row.gap-2.justify-between').should('exist');
      
      // Should have copyright section
      cy.get('.text-sm.text-center.mt-5').should('exist');
    });

    it('should display links in correct order', () => {
      cy.mount(<LandingFooter />);
      
      const linksContainer = cy.get('.flex.flex-row.gap-2.justify-between > div').first();
      linksContainer.should('contain', 'Privacy Policy');
      linksContainer.should('contain', 'Terms of Service');
      linksContainer.should('contain', 'Help');
    });

    it('should have correct image attributes', () => {
      cy.mount(<LandingFooter />);
      
      cy.get('img[src="/Light-horizontal.png"]').should('have.attr', 'alt', 'ELO Learning Horizontal Logo');
      cy.get('img[src="/Light-horizontal.png"]').should('have.attr', 'priority');
    });

    it('should handle link interactions', () => {
      cy.mount(<LandingFooter />);
      
      // Test external link
      cy.get('a[href="https://proking.solutions/"]').should('be.visible');
      cy.get('a[href="https://proking.solutions/"]').should('have.class', 'underline');
    });

    it('should be accessible', () => {
      cy.mount(<LandingFooter />);
      
      // Check that images have alt text
      cy.get('img').each(($img) => {
        cy.wrap($img).should('have.attr', 'alt');
      });
      
      // Check that links are focusable
      cy.get('a').each(($link) => {
        cy.wrap($link).focus();
        cy.wrap($link).should('be.focused');
      });
    });

    it('should maintain consistent styling', () => {
      cy.mount(<LandingFooter />);
      
      // Check text sizing
      cy.get('.text-sm.text-center.mt-5 p').should('have.class', 'text-sm');
      
      // Check link styling
      cy.get('a[href="https://proking.solutions/"] span').should('have.class', 'underline');
    });

    it('should work with different viewport sizes', () => {
      cy.mount(<LandingFooter />);
      
      // Test mobile viewport
      cy.viewport(375, 667);
      cy.get('.bg-\\[\\#1D1A34\\]').should('be.visible');
      
      // Test desktop viewport
      cy.viewport(1024, 768);
      cy.get('.bg-\\[\\#1D1A34\\]').should('be.visible');
    });
  });
}); 