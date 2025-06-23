import NavBar from '@/app/ui/nav-bar';
import NavLinks from '@/app/ui/nav-links';

describe('Navigation Components', () => {
  describe('NavBar Component', () => {
    it('should render with correct structure', () => {
      cy.mount(<NavBar />);
      
      cy.get('.footer_styling').should('exist');
      cy.get('.footer_styling').should('have.class', 'fixed');
      cy.get('.footer_styling').should('have.class', 'bottom-0');
      cy.get('.footer_styling').should('have.class', 'left-0');
      cy.get('.footer_styling').should('have.class', 'w-full');
      cy.get('.footer_styling').should('have.class', 'z-50');
    });

    it('should apply correct CSS classes', () => {
      cy.mount(<NavBar />);
      
      cy.get('.footer_styling').should('have.class', 'flex');
      cy.get('.footer_styling').should('have.class', 'flex-col');
      cy.get('.footer_styling').should('have.class', 'px-3');
      cy.get('.footer_styling').should('have.class', 'py-4');
      cy.get('.footer_styling').should('have.class', 'md:static');
      cy.get('.footer_styling').should('have.class', 'md:w-auto');
      cy.get('.footer_styling').should('have.class', 'md:px-2');
    });

    it('should contain NavLinks component', () => {
      cy.mount(<NavBar />);
      
      // Check that navigation links are present
      cy.get('a[href="/dashboard"]').should('exist');
      cy.get('a[href="/practice"]').should('exist');
      cy.get('a[href="/match"]').should('exist');
      cy.get('a[href="/single-player"]').should('exist');
      cy.get('a[href="/profile"]').should('exist');
    });

    it('should be responsive', () => {
      cy.mount(<NavBar />);
      
      // Test mobile viewport
      cy.viewport(375, 667);
      cy.get('.footer_styling').should('have.class', 'fixed');
      cy.get('.footer_styling').should('have.class', 'bottom-0');
      
      // Test desktop viewport
      cy.viewport(1024, 768);
      cy.get('.footer_styling').should('have.class', 'md:static');
    });

    it('should maintain proper layout structure', () => {
      cy.mount(<NavBar />);
      
      cy.get('.footer_styling > div').should('have.class', 'flex');
      cy.get('.footer_styling > div').should('have.class', 'grow');
      cy.get('.footer_styling > div').should('have.class', 'flex-row');
      cy.get('.footer_styling > div').should('have.class', 'justify-between');
      cy.get('.footer_styling > div').should('have.class', 'space-x-2');
      cy.get('.footer_styling > div').should('have.class', 'md:flex-col');
      cy.get('.footer_styling > div').should('have.class', 'md:space-x-0');
      cy.get('.footer_styling > div').should('have.class', 'md:space-y-2');
    });
  });

  describe('NavLinks Component', () => {
    it('should render all navigation links', () => {
      cy.mount(<NavLinks />);
      
      const expectedLinks = [
        { name: 'Home', href: '/dashboard' },
        { name: 'Practice', href: '/practice' },
        { name: 'Match', href: '/match' },
        { name: 'Timed', href: '/single-player' },
        { name: 'Profile', href: '/profile' }
      ];
      
      expectedLinks.forEach(link => {
        cy.get(`a[href="${link.href}"]`).should('exist');
      });
    });

    it('should display correct link names', () => {
      cy.mount(<NavLinks />);
      
      cy.get('a[href="/dashboard"]').should('contain', 'Home');
      cy.get('a[href="/practice"]').should('contain', 'Practice');
      cy.get('a[href="/match"]').should('contain', 'Match');
      cy.get('a[href="/single-player"]').should('contain', 'Timed');
      cy.get('a[href="/profile"]').should('contain', 'Profile');
    });

    it('should render icons for each link', () => {
      cy.mount(<NavLinks />);
      
      // Check that icons are present (they should have the w-6 class)
      cy.get('a').each(($link) => {
        cy.wrap($link).find('svg').should('exist');
        cy.wrap($link).find('svg').should('have.class', 'w-6');
      });
    });

    it('should apply correct CSS classes to links', () => {
      cy.mount(<NavLinks />);
      
      cy.get('a').each(($link) => {
        cy.wrap($link).should('have.class', 'nav-link-item');
        cy.wrap($link).should('have.class', 'flex');
        cy.wrap($link).should('have.class', 'h-[48px]');
        cy.wrap($link).should('have.class', 'grow');
        cy.wrap($link).should('have.class', 'items-center');
        cy.wrap($link).should('have.class', 'justify-center');
        cy.wrap($link).should('have.class', 'gap-2');
        cy.wrap($link).should('have.class', 'rounded-md');
        cy.wrap($link).should('have.class', 'p-3');
        cy.wrap($link).should('have.class', 'text-sm');
        cy.wrap($link).should('have.class', 'font-medium');
      });
    });

    it('should apply responsive classes correctly', () => {
      cy.mount(<NavLinks />);
      
      cy.get('a').each(($link) => {
        cy.wrap($link).should('have.class', 'md:flex-none');
        cy.wrap($link).should('have.class', 'md:justify-start');
        cy.wrap($link).should('have.class', 'md:p-2');
        cy.wrap($link).should('have.class', 'md:px-3');
      });
    });

    it('should hide text on mobile and show on desktop', () => {
      cy.mount(<NavLinks />);
      
      // Text should be hidden on mobile
      cy.get('p').should('have.class', 'hidden');
      cy.get('p').should('have.class', 'md:block');
    });

    it('should handle active state styling', () => {
      // Mock the current pathname to be /dashboard
      cy.stub(global, 'usePathname').returns('/dashboard');
      
      cy.mount(<NavLinks />);
      
      // The active link should have special styling
      cy.get('a[href="/dashboard"]').should('have.class', 'bg-[#e8e8e8]');
      cy.get('a[href="/dashboard"]').should('have.class', 'dark:bg-[#7d32ce]');
      cy.get('a[href="/dashboard"]').should('have.class', 'text-white');
    });

    it('should not apply active state to inactive links', () => {
      // Mock the current pathname to be /dashboard
      cy.stub(global, 'usePathname').returns('/dashboard');
      
      cy.mount(<NavLinks />);
      
      // Other links should not have active styling
      cy.get('a[href="/practice"]').should('not.have.class', 'bg-[#e8e8e8]');
      cy.get('a[href="/match"]').should('not.have.class', 'bg-[#e8e8e8]');
      cy.get('a[href="/single-player"]').should('not.have.class', 'bg-[#e8e8e8]');
      cy.get('a[href="/profile"]').should('not.have.class', 'bg-[#e8e8e8]');
    });

    it('should handle different active states', () => {
      // Test with different active paths
      const testCases = [
        { path: '/practice', expectedActive: '/practice' },
        { path: '/match', expectedActive: '/match' },
        { path: '/single-player', expectedActive: '/single-player' },
        { path: '/profile', expectedActive: '/profile' }
      ];
      
      testCases.forEach(({ path, expectedActive }) => {
        cy.stub(global, 'usePathname').returns(path);
        cy.mount(<NavLinks />);
        
        cy.get(`a[href="${expectedActive}"]`).should('have.class', 'bg-[#e8e8e8]');
      });
    });

    it('should maintain proper link structure', () => {
      cy.mount(<NavLinks />);
      
      cy.get('a').each(($link) => {
        // Each link should have an icon and text
        cy.wrap($link).find('svg').should('exist');
        cy.wrap($link).find('p').should('exist');
        
        // Check icon size
        cy.wrap($link).find('svg').should('have.attr', 'size', '32');
      });
    });

    it('should be accessible', () => {
      cy.mount(<NavLinks />);
      
      cy.get('a').each(($link) => {
        // Each link should have proper href
        cy.wrap($link).should('have.attr', 'href');
        
        // Links should be focusable
        cy.wrap($link).focus();
        cy.wrap($link).should('be.focused');
      });
    });

    it('should handle keyboard navigation', () => {
      cy.mount(<NavLinks />);
      
      // Test tab navigation through links
      cy.get('a').first().focus();
      cy.get('a').first().should('be.focused');
      
      cy.get('a').first().tab();
      cy.get('a').eq(1).should('be.focused');
    });

    it('should maintain consistent spacing', () => {
      cy.mount(<NavLinks />);
      
      // Check that all links have consistent height
      cy.get('a').each(($link) => {
        cy.wrap($link).should('have.class', 'h-[48px]');
      });
    });

    it('should handle hover states', () => {
      cy.mount(<NavLinks />);
      
      // Test hover interaction
      cy.get('a').first().trigger('mouseover');
      cy.get('a').first().should('be.visible');
    });

    it('should work with different viewport sizes', () => {
      cy.mount(<NavLinks />);
      
      // Test mobile viewport
      cy.viewport(375, 667);
      cy.get('a').should('have.length', 5);
      
      // Test desktop viewport
      cy.viewport(1024, 768);
      cy.get('a').should('have.length', 5);
    });
  });
}); 