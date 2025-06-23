import ProgressBar from '@/app/ui/progress-bar';

describe('ProgressBar Component', () => {
  it('should render with correct structure', () => {
    cy.mount(<ProgressBar progress={0.5} />);
    
    cy.get('.progress-bar').should('exist');
    cy.get('.progress-filled').should('exist');
    cy.get('.progress-bar .absolute').should('exist');
  });

  it('should apply correct CSS classes', () => {
    cy.mount(<ProgressBar progress={0.5} />);
    
    cy.get('.progress-bar').should('have.class', 'w-full');
    cy.get('.progress-bar').should('have.class', 'h-2');
    cy.get('.progress-bar').should('have.class', 'rounded-full');
    cy.get('.progress-bar').should('have.class', 'overflow-hidden');
    cy.get('.progress-bar').should('have.class', 'relative');
    
    cy.get('.progress-filled').should('have.class', 'h-full');
    cy.get('.progress-filled').should('have.class', 'transition-all');
    cy.get('.progress-filled').should('have.class', 'duration-300');
    cy.get('.progress-filled').should('have.class', 'relative');
  });

  it('should set correct width based on progress prop', () => {
    cy.mount(<ProgressBar progress={0.25} />);
    
    cy.get('.progress-filled').should('have.css', 'width', '25%');
  });

  it('should handle 0% progress', () => {
    cy.mount(<ProgressBar progress={0} />);
    
    cy.get('.progress-filled').should('have.css', 'width', '0%');
  });

  it('should handle 100% progress', () => {
    cy.mount(<ProgressBar progress={1} />);
    
    cy.get('.progress-filled').should('have.css', 'width', '100%');
  });

  it('should handle decimal progress values', () => {
    cy.mount(<ProgressBar progress={0.75} />);
    
    cy.get('.progress-filled').should('have.css', 'width', '75%');
  });

  it('should have inner highlight element with correct classes', () => {
    cy.mount(<ProgressBar progress={0.5} />);
    
    cy.get('.progress-filled .absolute').should('have.class', 'top-0.5');
    cy.get('.progress-filled .absolute').should('have.class', 'left-1/2');
    cy.get('.progress-filled .absolute').should('have.class', 'transform');
    cy.get('.progress-filled .absolute').should('have.class', '-translate-x-1/2');
    cy.get('.progress-filled .absolute').should('have.class', 'w-[85%]');
    cy.get('.progress-filled .absolute').should('have.class', 'md:w-[95%]');
    cy.get('.progress-filled .absolute').should('have.class', 'h-1/3');
    cy.get('.progress-filled .absolute').should('have.class', 'bg-white/30');
    cy.get('.progress-filled .absolute').should('have.class', 'rounded-full');
  });

  it('should handle undefined progress prop', () => {
    cy.mount(<ProgressBar />);
    
    cy.get('.progress-filled').should('have.css', 'width', '0%');
  });

  it('should handle null progress prop', () => {
    cy.mount(<ProgressBar progress={null} />);
    
    cy.get('.progress-filled').should('have.css', 'width', '0%');
  });

  it('should handle negative progress values', () => {
    cy.mount(<ProgressBar progress={-0.5} />);
    
    cy.get('.progress-filled').should('have.css', 'width', '-50%');
  });

  it('should handle progress values greater than 1', () => {
    cy.mount(<ProgressBar progress={1.5} />);
    
    cy.get('.progress-filled').should('have.css', 'width', '150%');
  });

  it('should maintain aspect ratio and sizing', () => {
    cy.mount(<ProgressBar progress={0.5} />);
    
    cy.get('.progress-bar').should('have.css', 'height', '8px'); // h-2 = 8px
    cy.get('.progress-filled').should('have.css', 'height', '100%');
  });

  it('should have smooth transitions', () => {
    cy.mount(<ProgressBar progress={0.5} />);
    
    cy.get('.progress-filled').should('have.css', 'transition', 'all 300ms ease 0s');
  });

  it('should be accessible', () => {
    cy.mount(<ProgressBar progress={0.5} />);
    
    // Check if the component has proper semantic structure
    cy.get('.progress-bar').should('be.visible');
    cy.get('.progress-filled').should('be.visible');
  });

  it('should handle rapid progress updates', () => {
    cy.mount(<ProgressBar progress={0.1} />);
    
    // Simulate rapid progress updates
    cy.get('.progress-filled').should('have.css', 'width', '10%');
    
    cy.mount(<ProgressBar progress={0.9} />);
    cy.get('.progress-filled').should('have.css', 'width', '90%');
  });

  it('should maintain visual hierarchy', () => {
    cy.mount(<ProgressBar progress={0.5} />);
    
    // Check that the highlight element is positioned correctly
    cy.get('.progress-filled .absolute').should('have.css', 'top', '2px'); // top-0.5
    cy.get('.progress-filled .absolute').should('have.css', 'left', '50%');
  });

  it('should work with different container sizes', () => {
    cy.mount(
      <div style={{ width: '200px' }}>
        <ProgressBar progress={0.5} />
      </div>
    );
    
    cy.get('.progress-bar').should('have.css', 'width', '200px');
    cy.get('.progress-filled').should('have.css', 'width', '100px'); // 50% of 200px
  });
}); 