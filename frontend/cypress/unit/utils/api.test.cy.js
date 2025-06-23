// Import API functions at the top
import {
  getAllAnswers,
  getAllQuestions,
  getQuestionById,
  getQuestionsByType,
  practiceQuestion,
  quickValidateMath,
  submitQuestionAnswer,
  validateMathAnswer,
  validateMathExpression,
} from '../../../src/utils/api.js';

describe('API Utilities', () => {
  beforeEach(() => {
    // Mock localStorage
    cy.stub(localStorage, 'getItem').returns('test-token');
  });

  describe('getAllQuestions', () => {
    it('should fetch all questions successfully', () => {
      const mockQuestions = [
        { id: 1, question: 'What is 2+2?', answers: ['4', '5', '6'] },
        { id: 2, question: 'What is 3*3?', answers: ['6', '9', '12'] },
      ];

      cy.intercept('GET', 'http://localhost:3000/questions', {
        statusCode: 200,
        body: { questions: mockQuestions },
      }).as('getQuestions');

      cy.window().then(() => {
        getAllQuestions().then((result) => {
          expect(result.success).to.be.true;
          expect(result.data).to.deep.equal(mockQuestions);
        });
      });

      cy.wait('@getQuestions');
    });

    it('should handle fetch error', () => {
      cy.intercept('GET', 'http://localhost:3000/questions', {
        statusCode: 500,
        body: { error: 'Server error' },
      }).as('getQuestionsError');

      cy.window().then(() => {
        getAllQuestions().then((result) => {
          expect(result.success).to.be.false;
          expect(result.error).to.equal('Server error');
        });
      });

      cy.wait('@getQuestionsError');
    });

    it('should handle network error', () => {
      cy.intercept('GET', 'http://localhost:3000/questions', {
        forceNetworkError: true,
      }).as('getQuestionsNetworkError');

      cy.window().then(() => {
        getAllQuestions().then((result) => {
          expect(result.success).to.be.false;
          expect(result.error).to.include('Network error');
        });
      });

      cy.wait('@getQuestionsNetworkError');
    });
  });

  describe('getQuestionById', () => {
    it('should fetch question by ID successfully', () => {
      const mockQuestion = {
        id: 1,
        question: 'What is 2+2?',
        answers: ['4', '5', '6'],
      };

      cy.intercept('GET', 'http://localhost:3000/questionsById/1', {
        statusCode: 200,
        body: { question: mockQuestion },
      }).as('getQuestionById');

      cy.window().then(() => {
        getQuestionById(1).then((result) => {
          expect(result.success).to.be.true;
          expect(result.data).to.deep.equal(mockQuestion);
        });
      });

      cy.wait('@getQuestionById');
    });
  });

  describe('getAllAnswers', () => {
    it('should fetch answers successfully', () => {
      const mockAnswer = { id: 1, answer: '4' };

      cy.intercept('GET', 'http://localhost:3000/answers/1', {
        statusCode: 200,
        body: { answer: mockAnswer },
      }).as('getAnswers');

      cy.window().then(() => {
        getAllAnswers(1).then((result) => {
          expect(result.success).to.be.true;
          expect(result.data).to.deep.equal(mockAnswer);
        });
      });

      cy.wait('@getAnswers');
    });
  });

  describe('practiceQuestion', () => {
    it('should fetch practice questions successfully', () => {
      const mockQuestions = [
        { id: 1, question: 'Practice question 1' },
        { id: 2, question: 'Practice question 2' },
      ];

      cy.intercept('GET', 'http://localhost:3000/practice', {
        statusCode: 200,
        body: { questions: mockQuestions },
      }).as('getPracticeQuestions');

      cy.window().then(() => {
        practiceQuestion().then((result) => {
          expect(result.success).to.be.true;
          expect(result.data).to.deep.equal(mockQuestions);
        });
      });

      cy.wait('@getPracticeQuestions');
    });
  });

  describe('validateMathAnswer', () => {
    it('should validate math answer successfully', () => {
      const mockValidation = {
        isValid: true,
        isCorrect: true,
        message: 'Correct!',
      };

      cy.intercept('POST', 'http://localhost:3000/validate-answer', {
        statusCode: 200,
        body: mockValidation,
      }).as('validateMathAnswer');

      cy.window().then(() => {
        validateMathAnswer('2+2', '4').then((result) => {
          expect(result.success).to.be.true;
          expect(result.data).to.deep.equal(mockValidation);
        });
      });

      cy.wait('@validateMathAnswer').its('request.body').should('deep.equal', {
        studentAnswer: '2+2',
        correctAnswer: '4',
      });
    });
  });

  describe('quickValidateMath', () => {
    it('should perform quick validation successfully', () => {
      const mockQuickValidation = { isValid: true, isCorrect: true };

      cy.intercept('POST', 'http://localhost:3000/quick-validate', {
        statusCode: 200,
        body: mockQuickValidation,
      }).as('quickValidateMath');

      cy.window().then(() => {
        quickValidateMath('2+2', '4').then((result) => {
          expect(result.success).to.be.true;
          expect(result.data).to.deep.equal(mockQuickValidation);
        });
      });

      cy.wait('@quickValidateMath').its('request.body').should('deep.equal', {
        studentAnswer: '2+2',
        correctAnswer: '4',
      });
    });
  });

  describe('validateMathExpression', () => {
    it('should validate math expression successfully', () => {
      const mockExpressionValidation = {
        isValid: true,
        message: 'Valid expression',
      };

      cy.intercept('POST', 'http://localhost:3000/validate-expression', {
        statusCode: 200,
        body: mockExpressionValidation,
      }).as('validateMathExpression');

      cy.window().then(() => {
        validateMathExpression('2+2').then((result) => {
          expect(result.success).to.be.true;
          expect(result.data).to.deep.equal(mockExpressionValidation);
        });
      });

      cy.wait('@validateMathExpression')
        .its('request.body')
        .should('deep.equal', {
          expression: '2+2',
        });
    });
  });

  describe('submitQuestionAnswer', () => {
    it('should submit answer successfully', () => {
      const mockSubmission = { success: true, message: 'Answer submitted' };

      cy.intercept('POST', 'http://localhost:3000/question/1/submit', {
        statusCode: 200,
        body: mockSubmission,
      }).as('submitQuestionAnswer');

      cy.window().then(() => {
        submitQuestionAnswer(1, '4', 'user123').then((result) => {
          expect(result.success).to.be.true;
          expect(result.data).to.deep.equal(mockSubmission);
        });
      });

      cy.wait('@submitQuestionAnswer')
        .its('request.body')
        .should('deep.equal', {
          studentAnswer: '4',
          userId: 'user123',
        });
    });
  });

  describe('getQuestionsByType', () => {
    it('should fetch questions by type successfully', () => {
      const mockQuestions = [
        { id: 1, type: 'algebra', question: 'Solve for x' },
        { id: 2, type: 'algebra', question: 'Factor the expression' },
      ];

      cy.intercept('GET', 'http://localhost:3000/practice/type/algebra', {
        statusCode: 200,
        body: { questions: mockQuestions },
      }).as('getQuestionsByType');

      cy.window().then(() => {
        getQuestionsByType('algebra').then((result) => {
          expect(result.success).to.be.true;
          expect(result.data).to.deep.equal(mockQuestions);
        });
      });

      cy.wait('@getQuestionsByType');
    });

    it('should handle network error for questions by type', () => {
      cy.intercept('GET', 'http://localhost:3000/practice/type/algebra', {
        forceNetworkError: true,
      }).as('getQuestionsByTypeError');

      cy.window().then(() => {
        getQuestionsByType('algebra').then((result) => {
          expect(result.success).to.be.false;
          expect(result.error).to.equal('Network error');
        });
      });

      cy.wait('@getQuestionsByTypeError');
    });
  });
});
