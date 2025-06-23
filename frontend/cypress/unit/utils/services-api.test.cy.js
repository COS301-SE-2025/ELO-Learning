// Import service functions at the top
import {
    fetchAllQuestions,
    fetchAllUsers,
    fetchQuestionAnswer,
    fetchQuestionsByLevel,
    fetchQuestionsByLevelAndTopic,
    fetchQuestionsByTopic,
    fetchUserAchievements,
    fetchUserById,
    loginUser,
    logoutUser,
    registerUser,
    submitAnswer,
    updateUserXP
} from '../../../src/services/api.js';

describe('Services API', () => {
  beforeEach(() => {
    // Mock localStorage
    cy.stub(localStorage, 'getItem').returns('test-token');
  });

  describe('fetchAllUsers', () => {
    it('should fetch all users successfully', () => {
      const mockUsers = [
        { id: 1, name: 'Alice', email: 'alice@example.com' },
        { id: 2, name: 'Bob', email: 'bob@example.com' }
      ];

      cy.intercept('GET', 'http://localhost:3000/users', {
        statusCode: 200,
        body: mockUsers
      }).as('fetchAllUsers');

      cy.window().then(() => {
        fetchAllUsers().then((result) => {
          expect(result).to.deep.equal(mockUsers);
        });
      });

      cy.wait('@fetchAllUsers');
    });
  });

  describe('fetchUserById', () => {
    it('should fetch user by ID successfully', () => {
      const mockUser = { id: 1, name: 'Alice', email: 'alice@example.com' };

      cy.intercept('GET', 'http://localhost:3000/user/1', {
        statusCode: 200,
        body: mockUser
      }).as('fetchUserById');

      cy.window().then(() => {
        fetchUserById(1).then((result) => {
          expect(result).to.deep.equal(mockUser);
        });
      });

      cy.wait('@fetchUserById');
    });
  });

  describe('fetchUserAchievements', () => {
    it('should fetch user achievements successfully', () => {
      const mockAchievements = [
        { id: 1, name: 'First Win', description: 'Win your first game' },
        { id: 2, name: 'Streak Master', description: 'Win 10 games in a row' }
      ];

      cy.intercept('GET', 'http://localhost:3000/users/1/achievements', {
        statusCode: 200,
        body: mockAchievements
      }).as('fetchUserAchievements');

      cy.window().then(() => {
        fetchUserAchievements(1).then((result) => {
          expect(result).to.deep.equal(mockAchievements);
        });
      });

      cy.wait('@fetchUserAchievements');
    });
  });

  describe('updateUserXP', () => {
    it('should update user XP successfully', () => {
      const mockResponse = { success: true, newXP: 1500 };

      cy.intercept('POST', 'http://localhost:3000/user/1/xp', {
        statusCode: 200,
        body: mockResponse
      }).as('updateUserXP');

      cy.window().then(() => {
        updateUserXP(1, 100).then((result) => {
          expect(result).to.deep.equal(mockResponse);
        });
      });

      cy.wait('@updateUserXP').its('request.body').should('deep.equal', { xp: 100 });
    });
  });

  describe('fetchAllQuestions', () => {
    it('should fetch all questions successfully', () => {
      const mockQuestions = [
        { id: 1, question: 'What is 2+2?', type: 'basic' },
        { id: 2, question: 'What is 3*3?', type: 'basic' }
      ];

      cy.intercept('GET', 'http://localhost:3000/questions', {
        statusCode: 200,
        body: mockQuestions
      }).as('fetchAllQuestions');

      cy.window().then(() => {
        fetchAllQuestions().then((result) => {
          expect(result).to.deep.equal(mockQuestions);
        });
      });

      cy.wait('@fetchAllQuestions');
    });
  });

  describe('fetchQuestionsByLevel', () => {
    it('should fetch questions by level successfully', () => {
      const mockQuestions = [
        { id: 1, question: 'Level 1 question', level: 1 },
        { id: 2, question: 'Level 1 question 2', level: 1 }
      ];

      cy.intercept('GET', 'http://localhost:3000/question/1', {
        statusCode: 200,
        body: mockQuestions
      }).as('fetchQuestionsByLevel');

      cy.window().then(() => {
        fetchQuestionsByLevel(1).then((result) => {
          expect(result).to.deep.equal(mockQuestions);
        });
      });

      cy.wait('@fetchQuestionsByLevel');
    });
  });

  describe('fetchQuestionAnswer', () => {
    it('should fetch question answer successfully', () => {
      const mockAnswer = { id: 1, answer: '4', isCorrect: true };

      cy.intercept('GET', 'http://localhost:3000/question/1/answer', {
        statusCode: 200,
        body: mockAnswer
      }).as('fetchQuestionAnswer');

      cy.window().then(() => {
        fetchQuestionAnswer(1).then((result) => {
          expect(result).to.deep.equal(mockAnswer);
        });
      });

      cy.wait('@fetchQuestionAnswer');
    });
  });

  describe('fetchQuestionsByTopic', () => {
    it('should fetch questions by topic successfully', () => {
      const mockQuestions = [
        { id: 1, question: 'Algebra question 1', topic: 'Algebra' },
        { id: 2, question: 'Algebra question 2', topic: 'Algebra' }
      ];

      cy.intercept('GET', 'http://localhost:3000/questions/topic?topic=Algebra', {
        statusCode: 200,
        body: mockQuestions
      }).as('fetchQuestionsByTopic');

      cy.window().then(() => {
        fetchQuestionsByTopic('Algebra').then((result) => {
          expect(result).to.deep.equal(mockQuestions);
        });
      });

      cy.wait('@fetchQuestionsByTopic');
    });
  });

  describe('fetchQuestionsByLevelAndTopic', () => {
    it('should fetch questions by level and topic successfully', () => {
      const mockQuestions = [
        { id: 1, question: 'Level 1 Algebra', level: 1, topic: 'Algebra' },
        { id: 2, question: 'Level 1 Algebra 2', level: 1, topic: 'Algebra' }
      ];

      cy.intercept('GET', 'http://localhost:3000/questions/level/topic?level=1&topic=Algebra', {
        statusCode: 200,
        body: mockQuestions
      }).as('fetchQuestionsByLevelAndTopic');

      cy.window().then(() => {
        fetchQuestionsByLevelAndTopic(1, 'Algebra').then((result) => {
          expect(result).to.deep.equal(mockQuestions);
        });
      });

      cy.wait('@fetchQuestionsByLevelAndTopic');
    });
  });

  describe('submitAnswer', () => {
    it('should submit answer successfully', () => {
      const mockResponse = { success: true, isCorrect: true, xpAwarded: 100 };

      cy.intercept('POST', 'http://localhost:3000/question/1/answer', {
        statusCode: 200,
        body: mockResponse
      }).as('submitAnswer');

      cy.window().then(() => {
        submitAnswer(1, '4').then((result) => {
          expect(result).to.deep.equal(mockResponse);
        });
      });

      cy.wait('@submitAnswer').its('request.body').should('deep.equal', {
        question: [{ answer: '4' }]
      });
    });
  });

  describe('loginUser', () => {
    it('should login user successfully', () => {
      const mockResponse = { success: true, token: 'test-token', user: { id: 1, name: 'Alice' } };

      cy.intercept('POST', 'http://localhost:3000/login', {
        statusCode: 200,
        body: mockResponse
      }).as('loginUser');

      cy.window().then(() => {
        loginUser('alice@example.com', 'password123').then((result) => {
          expect(result).to.deep.equal(mockResponse);
        });
      });

      cy.wait('@loginUser').its('request.body').should('deep.equal', {
        email: 'alice@example.com',
        password: 'password123'
      });
    });
  });

  describe('registerUser', () => {
    it('should register user successfully', () => {
      const mockResponse = { success: true, message: 'User registered successfully' };

      cy.intercept('POST', 'http://localhost:3000/register', {
        statusCode: 200,
        body: mockResponse
      }).as('registerUser');

      const userData = {
        name: 'Alice',
        surname: 'Smith',
        username: 'alice123',
        email: 'alice@example.com',
        password: 'password123',
        currentLevel: 1,
        joinDate: '2024-01-01'
      };

      cy.window().then(() => {
        registerUser(
          userData.name,
          userData.surname,
          userData.username,
          userData.email,
          userData.password,
          userData.currentLevel,
          userData.joinDate
        ).then((result) => {
          expect(result).to.deep.equal(mockResponse);
        });
      });

      cy.wait('@registerUser').its('request.body').should('deep.equal', userData);
    });
  });

  describe('logoutUser', () => {
    it('should logout user and clear localStorage', () => {
      // Set up initial localStorage values
      cy.window().then((win) => {
        win.localStorage.setItem('token', 'test-token');
        win.localStorage.setItem('user', 'test-user');
        
        // Call logout function
        logoutUser();
        
        // Check that localStorage items were removed
        expect(win.localStorage.getItem('token')).to.be.null;
        expect(win.localStorage.getItem('user')).to.be.null;
      });
    });
  });
}); 