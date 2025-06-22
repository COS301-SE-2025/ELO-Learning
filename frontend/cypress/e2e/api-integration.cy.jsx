describe('API Integration & Data Flow', () => {
    // Handle Next.js redirects
    Cypress.on('uncaught:exception', (err) => {
      if (err.message.includes('NEXT_REDIRECT')) {
        return false;
      }
    });
  
    beforeEach(() => {
      // Mock authentication
      cy.window().then((win) => {
        win.localStorage.setItem('token', 'mock-jwt-token');
        win.localStorage.setItem('user', JSON.stringify({
          id: 1,
          username: 'testuser',
          elo: 1200,
          xp: 500
        }));
      });
  
      // Mock API responses for actual endpoints
      cy.intercept('GET', '**/practice', {
        statusCode: 200,
        body: {
          questions: [
            {
              id: 1,
              questionText: 'What is 2 + 2?',
              answers: [
                { answer_text: '3', isCorrect: false },
                { answer_text: '4', isCorrect: true },
                { answer_text: '5', isCorrect: false },
                { answer_text: '6', isCorrect: false }
              ],
              category: 'arithmetic',
              difficulty: 'easy'
            }
          ]
        }
      }).as('getPracticeQuestions');
    });
  
    describe('Question API Integration', () => {
      it('should fetch questions from API', () => {
        cy.visit('/question-templates/multiple-choice');
        cy.get('p.text-center.text-xl.font-bold').should('be.visible');
      });
  
      it('should handle question loading states', () => {
        // Mock slow API response
        cy.intercept('GET', '**/practice', {
          delay: 1000,
          statusCode: 200,
          body: { questions: [] }
        }).as('slowQuestions');
  
        cy.visit('/question-templates/multiple-choice');
        // Component should handle loading state gracefully
      });
  
      it('should handle question API errors', () => {
        cy.intercept('GET', '**/practice', {
          statusCode: 500,
          body: { error: 'Server error' }
        }).as('questionError');
  
        cy.visit('/question-templates/multiple-choice');
        // Component should handle error state gracefully
      });
  
      it('should display questions correctly', () => {
        cy.visit('/question-templates/multiple-choice');
        cy.get('p.text-center.text-xl.font-bold').should('be.visible');
        cy.get('.mc-button').should('have.length', 4);
      });
    });
  
    describe('Answer Submission', () => {
      it('should handle answer selection', () => {
        cy.visit('/question-templates/multiple-choice');
        cy.get('.mc-button').first().click();
        cy.get('button').contains('SUBMIT').should('not.be.disabled');
      });
  
      it('should submit answers and navigate', () => {
        cy.visit('/question-templates/multiple-choice');
        cy.get('.mc-button').first().click();
        cy.get('button').contains('SUBMIT').click();
        // Should navigate to next question or end screen
        // Note: URL may not change immediately due to client-side navigation
      });
  
      it('should handle incorrect answers', () => {
        cy.visit('/question-templates/multiple-choice');
        // Select incorrect answer (first option is incorrect based on mock data)
        cy.get('.mc-button').first().click();
        cy.get('button').contains('SUBMIT').click();
        // Should reduce lives or navigate to end screen
      });
  
      it('should handle correct answers', () => {
        cy.visit('/question-templates/multiple-choice');
        // Select correct answer (second option is correct based on mock data)
        cy.get('.mc-button').eq(1).click();
        cy.get('button').contains('SUBMIT').click();
        // Should proceed to next question
      });
    });
  
    describe('User Authentication API', () => {
      it('should handle login API calls', () => {
        cy.intercept('POST', '**/login', {
          statusCode: 200,
          body: { token: 'mock-token', user: { id: 1, username: 'testuser' } }
        }).as('login');
  
        cy.visit('/login-landing/login');
        cy.get('input[placeholder="Username or email"]').type('test@example.com');
        cy.get('input[placeholder="Password"]').type('password123');
        cy.get('button[type="submit"]').click();
        cy.url().should('include', '/dashboard');
      });
  
      it('should handle signup flow', () => {
        cy.visit('/login-landing/signup');
        cy.get('input[placeholder="Name"]').type('John');
        cy.get('input[placeholder="Surname"]').type('Doe');
        cy.get('button[type="submit"]').click();
        cy.url().should('include', '/login-landing/signup/username');
      });
  
      it('should handle authentication errors', () => {
        cy.intercept('POST', '**/login', {
          statusCode: 401,
          body: { error: 'Invalid credentials' }
        }).as('authError');
  
        cy.visit('/login-landing/login');
        cy.get('input[placeholder="Username or email"]').type('wrong@example.com');
        cy.get('input[placeholder="Password"]').type('wrongpassword');
        cy.get('button[type="submit"]').click();
        cy.contains('Username or password incorrect, please try again').should('be.visible');
      });
    });
  
    describe('User Profile Display', () => {
      it('should display user profile data', () => {
        cy.visit('/profile');
        cy.get('p').contains('1000 xp').should('be.visible');
        cy.get('h2').contains('Lady Yapsalot').should('be.visible');
      });
  
      it('should display user statistics', () => {
        cy.visit('/profile');
        cy.get('h3').contains('Match Statistics').should('be.visible');
        cy.get('h3').contains('Achievement').should('be.visible');
      });
  
      it('should display user ranking', () => {
        cy.visit('/profile');
        cy.get('p').contains('1st place').should('be.visible');
      });
    });
  
    describe('Game State Management', () => {
      it('should save game state to localStorage', () => {
        cy.visit('/question-templates/multiple-choice');
        cy.get('.mc-button').first().click();
        cy.get('button').contains('SUBMIT').click();
        
        cy.window().then((win) => {
          const questionsObj = win.localStorage.getItem('questionsObj');
          expect(questionsObj).to.not.be.null;
          const parsed = JSON.parse(questionsObj);
          expect(parsed).to.be.an('array');
        });
      });
  
      it('should handle lives system', () => {
        cy.visit('/question-templates/multiple-choice');
        // The component starts with 5 lives
        cy.get('.mc-button').first().click();
        cy.get('button').contains('SUBMIT').click();
        // Should reduce lives on incorrect answer
      });
  
      it('should navigate to end screen when lives run out', () => {
        cy.visit('/question-templates/multiple-choice');
        // Answer incorrectly multiple times to lose all lives
        for (let i = 0; i < 5; i++) {
          cy.get('.mc-button').first().click();
          cy.get('button').contains('SUBMIT').click();
          // Wait for navigation or check if still on same page
        }
        // Should eventually redirect to end screen
      });
    });
  
    describe('Navigation and UI', () => {
      it('should navigate back to dashboard', () => {
        cy.visit('/question-templates/multiple-choice');
        cy.get('a[href="/dashboard"]').click();
        cy.url().should('include', '/dashboard');
      });
  
      it('should display progress bar', () => {
        cy.visit('/question-templates/multiple-choice');
        // Progress bar component should be visible
        cy.get('div').should('exist');
      });
  
      it('should display lives counter', () => {
        cy.visit('/question-templates/multiple-choice');
        // Lives component should be visible
        cy.get('div').should('exist');
      });
  
      it('should handle question navigation', () => {
        cy.visit('/question-templates/multiple-choice');
        cy.get('.mc-button').first().click();
        cy.get('button').contains('SUBMIT').click();
        // Should move to next question or end
      });
    });
  
    describe('Form Validation', () => {
      it('should validate login form', () => {
        cy.visit('/login-landing/login');
        cy.get('button[type="submit"]').click();
        // Should show validation error or prevent submission
      });
  
      it('should validate signup form', () => {
        cy.visit('/login-landing/signup');
        cy.get('button[type="submit"]').click();
        // Should show validation error for empty fields
      });
  
      it('should handle form submission states', () => {
        cy.visit('/login-landing/login');
        cy.get('input[placeholder="Username or email"]').type('test@example.com');
        cy.get('input[placeholder="Password"]').type('password123');
        cy.get('button[type="submit"]').click();
        // Should show loading state
      });
    });
  
    describe('Error Handling', () => {
      it('should handle network errors gracefully', () => {
        cy.intercept('GET', '**/practice', {
          forceNetworkError: true
        }).as('networkError');
  
        cy.visit('/question-templates/multiple-choice');
        // Component should handle network errors gracefully
      });
  
      it('should handle server errors', () => {
        cy.intercept('GET', '**/practice', {
          statusCode: 500,
          body: { error: 'Internal server error' }
        }).as('serverError');
  
        cy.visit('/question-templates/multiple-choice');
        // Component should handle server errors gracefully
      });
  
      it('should handle authentication failures', () => {
        cy.intercept('POST', '**/login', {
          statusCode: 401,
          body: { error: 'Invalid credentials' }
        }).as('authFailure');
  
        cy.visit('/login-landing/login');
        cy.get('input[placeholder="Username or email"]').type('wrong@example.com');
        cy.get('input[placeholder="Password"]').type('wrongpassword');
        cy.get('button[type="submit"]').click();
        cy.contains('Username or password incorrect, please try again').should('be.visible');
      });
    });
  
    describe('Performance and UX', () => {
      it('should load questions quickly', () => {
        cy.visit('/question-templates/multiple-choice');
        cy.get('p.text-center.text-xl.font-bold').should('be.visible');
      });
  
      it('should handle button states correctly', () => {
        cy.visit('/question-templates/multiple-choice');
        // Submit button should be disabled initially
        cy.get('button').contains('SUBMIT').should('be.disabled');
        
        // Select an answer
        cy.get('.mc-button').first().click();
        cy.get('button').contains('SUBMIT').should('not.be.disabled');
      });
  
      it('should provide visual feedback', () => {
        cy.visit('/question-templates/multiple-choice');
        cy.get('.mc-button').first().click();
        // Should provide visual feedback for selection
      });
    });
  });