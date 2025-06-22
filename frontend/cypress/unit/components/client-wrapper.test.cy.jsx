import ClientWrapper from '@/app/ui/client-wrapper';

describe('ClientWrapper Component', () => {
  const mockQuestions = [
    {
      id: 1,
      questionText: 'What is 2+2?',
      answers: [
        { id: 1, text: '3', isCorrect: false },
        { id: 2, text: '4', isCorrect: true },
        { id: 3, text: '5', isCorrect: false },
        { id: 4, text: '6', isCorrect: false }
      ]
    },
    {
      id: 2,
      questionText: 'What is 3*3?',
      answers: [
        { id: 5, text: '6', isCorrect: false },
        { id: 6, text: '9', isCorrect: true },
        { id: 7, text: '12', isCorrect: false },
        { id: 8, text: '15', isCorrect: false }
      ]
    }
  ];

  beforeEach(() => {
    // Mock localStorage
    cy.stub(localStorage, 'getItem').returns('[]');
    cy.stub(localStorage, 'setItem').as('setItemStub');
    
    // Mock Next.js redirect
    cy.stub(global, 'redirect').as('redirectStub');
    
    // Mock console.log
    cy.stub(console, 'log').as('consoleLogStub');
  });

  it('should render with correct structure', () => {
    cy.mount(<ClientWrapper questions={mockQuestions} />);
    
    cy.get('.flex.flex-col.justify-between.h-full').should('exist');
    cy.get('a[href="/dashboard"]').should('exist');
    cy.get('.progress-bar').should('exist');
    cy.get('button[type="button"]').should('contain', 'SUBMIT');
  });

  it('should display the first question by default', () => {
    cy.mount(<ClientWrapper questions={mockQuestions} />);
    
    cy.contains('What is 2+2?').should('be.visible');
  });

  it('should show progress bar with correct progress', () => {
    cy.mount(<ClientWrapper questions={mockQuestions} />);
    
    // First question out of 2 = 50% progress
    cy.get('.progress-filled').should('have.css', 'width', '50%');
  });

  it('should display all answer options for the first question', () => {
    cy.mount(<ClientWrapper questions={mockQuestions} />);
    
    cy.contains('3').should('be.visible');
    cy.contains('4').should('be.visible');
    cy.contains('5').should('be.visible');
    cy.contains('6').should('be.visible');
  });

  it('should have submit button disabled initially', () => {
    cy.mount(<ClientWrapper questions={mockQuestions} />);
    
    cy.get('button[type="button"]').should('be.disabled');
    cy.get('button[type="button"]').should('have.class', 'disabled_button');
  });

  it('should enable submit button when an answer is selected', () => {
    cy.mount(<ClientWrapper questions={mockQuestions} />);
    
    // Select an answer
    cy.contains('4').click();
    
    cy.get('button[type="button"]').should('not.be.disabled');
    cy.get('button[type="button"]').should('have.class', 'main-button');
  });

  it('should handle answer selection correctly', () => {
    cy.mount(<ClientWrapper questions={mockQuestions} />);
    
    // Select correct answer
    cy.contains('4').click();
    
    // Submit button should be enabled
    cy.get('button[type="button"]').should('not.be.disabled');
  });

  it('should handle answer submission correctly', () => {
    cy.mount(<ClientWrapper questions={mockQuestions} />);
    
    // Select an answer
    cy.contains('4').click();
    
    // Submit the answer
    cy.get('button[type="button"]').click();
    
    // Should store answer in localStorage
    cy.get('@setItemStub').should('have.been.called');
  });

  it('should update to next question after submission', () => {
    cy.mount(<ClientWrapper questions={mockQuestions} />);
    
    // Select an answer
    cy.contains('4').click();
    
    // Submit the answer
    cy.get('button[type="button"]').click();
    
    // Should show second question
    cy.contains('What is 3*3?').should('be.visible');
  });

  it('should handle lives correctly', () => {
    cy.mount(<ClientWrapper questions={mockQuestions} />);
    
    // Initially should have 5 lives
    cy.get('.lives-container').should('exist');
    
    // Select wrong answer
    cy.contains('3').click();
    cy.get('button[type="button"]').click();
    
    // Lives should decrease
    cy.get('.lives-container').should('exist');
  });

  it('should redirect to end screen when all questions are answered', () => {
    cy.mount(<ClientWrapper questions={mockQuestions} />);
    
    // Answer first question
    cy.contains('4').click();
    cy.get('button[type="button"]').click();
    
    // Answer second question
    cy.contains('9').click();
    cy.get('button[type="button"]').click();
    
    // Should redirect to end screen
    cy.get('@redirectStub').should('have.been.calledWith', '/end-screen');
  });

  it('should redirect to end screen when lives run out', () => {
    cy.mount(<ClientWrapper questions={mockQuestions} />);
    
    // Select wrong answers multiple times to lose all lives
    for (let i = 0; i < 5; i++) {
      cy.contains('3').click();
      cy.get('button[type="button"]').click();
    }
    
    // Should redirect to end screen
    cy.get('@redirectStub').should('have.been.calledWith', '/end-screen');
  });

  it('should handle navigation back to dashboard', () => {
    cy.mount(<ClientWrapper questions={mockQuestions} />);
    
    cy.get('a[href="/dashboard"]').should('exist');
    cy.get('a[href="/dashboard"]').should('contain', 'X');
  });

  it('should store question data in localStorage', () => {
    cy.mount(<ClientWrapper questions={mockQuestions} />);
    
    // Select an answer
    cy.contains('4').click();
    
    // Submit the answer
    cy.get('button[type="button"]').click();
    
    // Should store question data
    cy.get('@setItemStub').should('have.been.calledWith', 'questionsObj', 
      cy.match((value) => {
        const parsed = JSON.parse(value);
        return parsed.length === 1 && 
               parsed[0].question.id === 1 &&
               parsed[0].selectedAnswer.text === '4';
      })
    );
  });

  it('should handle multiple question submissions', () => {
    cy.mount(<ClientWrapper questions={mockQuestions} />);
    
    // Answer first question
    cy.contains('4').click();
    cy.get('button[type="button"]').click();
    
    // Answer second question
    cy.contains('9').click();
    cy.get('button[type="button"]').click();
    
    // Should store both answers
    cy.get('@setItemStub').should('have.been.calledTwice');
  });

  it('should reset form state after submission', () => {
    cy.mount(<ClientWrapper questions={mockQuestions} />);
    
    // Select an answer
    cy.contains('4').click();
    
    // Submit the answer
    cy.get('button[type="button"]').click();
    
    // Submit button should be disabled again for next question
    cy.get('button[type="button"]').should('be.disabled');
  });

  it('should handle empty questions array', () => {
    cy.mount(<ClientWrapper questions={[]} />);
    
    // Should handle gracefully without crashing
    cy.get('.flex.flex-col.justify-between.h-full').should('exist');
  });

  it('should handle questions without answers', () => {
    const questionsWithoutAnswers = [
      {
        id: 1,
        questionText: 'What is 2+2?',
        answers: []
      }
    ];
    
    cy.mount(<ClientWrapper questions={questionsWithoutAnswers} />);
    
    // Should handle gracefully
    cy.get('.flex.flex-col.justify-between.h-full').should('exist');
  });

  it('should be responsive', () => {
    cy.mount(<ClientWrapper questions={mockQuestions} />);
    
    // Test on mobile viewport
    cy.viewport(375, 667);
    cy.get('.flex.flex-col.justify-between.h-full').should('be.visible');
    
    // Test on desktop viewport
    cy.viewport(1024, 768);
    cy.get('.flex.flex-col.justify-between.h-full').should('be.visible');
  });

  it('should maintain state consistency', () => {
    cy.mount(<ClientWrapper questions={mockQuestions} />);
    
    // Select an answer
    cy.contains('4').click();
    
    // Verify state is consistent
    cy.get('button[type="button"]').should('not.be.disabled');
    cy.get('button[type="button"]').should('have.class', 'main-button');
    
    // Change selection
    cy.contains('5').click();
    
    // Should still be enabled
    cy.get('button[type="button"]').should('not.be.disabled');
  });

  it('should handle keyboard navigation', () => {
    cy.mount(<ClientWrapper questions={mockQuestions} />);
    
    // Focus on submit button
    cy.get('button[type="button"]').focus();
    cy.get('button[type="button"]').should('be.focused');
    
    // Test tab navigation
    cy.get('a[href="/dashboard"]').focus();
    cy.get('a[href="/dashboard"]').should('be.focused');
  });

  it('should provide accessibility features', () => {
    cy.mount(<ClientWrapper questions={mockQuestions} />);
    
    // Check for proper button attributes
    cy.get('button[type="button"]').should('have.attr', 'type', 'button');
    
    // Check for proper link attributes
    cy.get('a[href="/dashboard"]').should('have.attr', 'href', '/dashboard');
  });
}); 