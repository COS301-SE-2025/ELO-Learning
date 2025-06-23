// Import questions data at the top
import questions from '../../../src/utils/questions.js';

describe('Questions Utils', () => {
  describe('questions data structure', () => {
    it('should export questions array with correct structure', () => {
      expect(questions).to.be.an('array');
      expect(questions).to.have.length(3);
    });

    it('should have questions with required properties', () => {
      questions.forEach((question, index) => {
        expect(question).to.have.property('id');
        expect(question).to.have.property('question');
        expect(question).to.have.property('calculation');
        expect(question).to.have.property('answers');
        
        expect(question.id).to.be.a('number');
        expect(question.question).to.be.a('string');
        expect(question.calculation).to.be.a('string');
        expect(question.answers).to.be.an('array');
      });
    });

    it('should have unique IDs for each question', () => {
      const ids = questions.map(q => q.id);
      
      expect(ids).to.deep.equal([1, 2, 3]);
      expect(new Set(ids)).to.have.length(3); // All IDs are unique
    });

    it('should have answers array with correct length', () => {
      questions.forEach((question) => {
        expect(question.answers).to.have.length(4);
        question.answers.forEach(answer => {
          expect(answer).to.be.a('string');
        });
      });
    });
  });

  describe('specific question content', () => {
    it('should have correct first question data', () => {
      const firstQuestion = questions[0];
      
      expect(firstQuestion.id).to.equal(1);
      expect(firstQuestion.question).to.equal('What is the mean of the following data set?');
      expect(firstQuestion.calculation).to.equal('Data: 5, 7, 8, 4, 6');
      expect(firstQuestion.answers).to.deep.equal(['6', '5.5', '6.2', '7.5']);
    });

    it('should have correct second question data', () => {
      const secondQuestion = questions[1];
      
      expect(secondQuestion.id).to.equal(2);
      expect(secondQuestion.question).to.equal('What is the median of the following numbers?');
      expect(secondQuestion.calculation).to.equal('Data: 12, 7, 9, 10, 6');
      expect(secondQuestion.answers).to.deep.equal(['7', '10', '14', '22']);
    });

    it('should have correct third question data', () => {
      const thirdQuestion = questions[2];
      
      expect(thirdQuestion.id).to.equal(3);
      expect(thirdQuestion.question).to.equal('What is the range of the data set: ');
      expect(thirdQuestion.calculation).to.equal('15, 22, 8, 19, 10?');
      expect(thirdQuestion.answers).to.deep.equal(['7', '9.5', '9', '10']);
    });
  });

  describe('data validation', () => {
    it('should have non-empty question text', () => {
      questions.forEach((question) => {
        expect(question.question).to.not.be.empty;
        expect(question.question.trim()).to.not.equal('');
      });
    });

    it('should have non-empty calculation text', () => {
      questions.forEach((question) => {
        expect(question.calculation).to.not.be.empty;
        expect(question.calculation.trim()).to.not.equal('');
      });
    });

    it('should have non-empty answers', () => {
      questions.forEach((question) => {
        question.answers.forEach(answer => {
          expect(answer).to.not.be.empty;
          expect(answer.trim()).to.not.equal('');
        });
      });
    });

    it('should have positive integer IDs', () => {
      questions.forEach((question) => {
        expect(question.id).to.be.a('number');
        expect(question.id).to.be.greaterThan(0);
        expect(Number.isInteger(question.id)).to.be.true;
      });
    });
  });

  describe('export functionality', () => {
    it('should export as default export', () => {
      expect(questions).to.be.an('array');
    });

    it('should have correct data types', () => {
      expect(questions).to.be.an('array');
      expect(questions.length).to.be.greaterThan(0);
      
      questions.forEach(question => {
        expect(question).to.be.an('object');
        expect(question.id).to.be.a('number');
        expect(question.question).to.be.a('string');
        expect(question.calculation).to.be.a('string');
        expect(question.answers).to.be.an('array');
      });
    });
  });
}); 