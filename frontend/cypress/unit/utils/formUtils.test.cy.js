// Import form utility functions at the top
import { handleButtonClick, handleFormSubmit } from '../../../src/utils/formUtils.js';

describe('Form Utils', () => {
  beforeEach(() => {
    // Mock window.dispatchEvent
    cy.stub(window, 'dispatchEvent').as('dispatchEventStub');
    
    // Mock console.log
    cy.stub(console, 'log').as('consoleLogStub');
  });

  describe('handleFormSubmit', () => {
    it('should dispatch formSubmitted event with correct data', () => {
      const formName = 'testForm';
      const formData = { field1: 'value1', field2: 'value2' };

      cy.window().then(() => {
        const result = handleFormSubmit(formName, formData);

        expect(result.success).to.be.true;
        expect(result.formName).to.equal(formName);
        expect(result.formData).to.deep.equal(formData);

        // Check that dispatchEvent was called
        cy.get('@dispatchEventStub').should('be.calledOnce');
        
        // Get the event that was dispatched
        cy.get('@dispatchEventStub').then((stub) => {
          const eventCall = stub.getCall(0);
          const event = eventCall.args[0];

          expect(event.type).to.equal('formSubmitted');
          expect(event.detail.formName).to.equal(formName);
          expect(event.detail.formData).to.deep.equal(formData);
          expect(event.detail.timestamp).to.be.a('string');
          expect(new Date(event.detail.timestamp)).to.be.instanceOf(Date);
        });
      });
    });

    it('should handle form submit with empty data', () => {
      const formName = 'emptyForm';

      cy.window().then(() => {
        const result = handleFormSubmit(formName);

        expect(result.success).to.be.true;
        expect(result.formName).to.equal(formName);
        expect(result.formData).to.deep.equal({});

        // Check that dispatchEvent was called
        cy.get('@dispatchEventStub').should('be.calledOnce');
        
        // Get the event that was dispatched
        cy.get('@dispatchEventStub').then((stub) => {
          const eventCall = stub.getCall(0);
          const event = eventCall.args[0];

          expect(event.type).to.equal('formSubmitted');
          expect(event.detail.formData).to.deep.equal({});
        });
      });
    });

    it('should log form submission', () => {
      const formName = 'testForm';
      const formData = { test: 'data' };

      cy.window().then(() => {
        handleFormSubmit(formName, formData);

        cy.get('@consoleLogStub').should('be.calledWith',
          `Form "${formName}" submitted with data:`,
          formData
        );
      });
    });
  });

  describe('handleButtonClick', () => {
    it('should dispatch buttonClicked event with correct data', () => {
      const buttonName = 'submitButton';

      cy.window().then(() => {
        const result = handleButtonClick(buttonName);

        expect(result.success).to.be.true;
        expect(result.buttonName).to.equal(buttonName);

        // Check that dispatchEvent was called
        cy.get('@dispatchEventStub').should('be.calledOnce');
        
        // Get the event that was dispatched
        cy.get('@dispatchEventStub').then((stub) => {
          const eventCall = stub.getCall(0);
          const event = eventCall.args[0];

          expect(event.type).to.equal('buttonClicked');
          expect(event.detail.buttonName).to.equal(buttonName);
          expect(event.detail.timestamp).to.be.a('string');
          expect(new Date(event.detail.timestamp)).to.be.instanceOf(Date);
        });
      });
    });

    it('should log button click', () => {
      const buttonName = 'testButton';

      cy.window().then(() => {
        handleButtonClick(buttonName);

        cy.get('@consoleLogStub').should('be.calledWith',
          `Button "${buttonName}" clicked`
        );
      });
    });
  });

  describe('Event handling', () => {
    it('should create proper CustomEvent objects', () => {
      const formName = 'testForm';
      const formData = { test: 'data' };

      cy.window().then(() => {
        handleFormSubmit(formName, formData);

        cy.get('@dispatchEventStub').then((stub) => {
          const eventCall = stub.getCall(0);
          const event = eventCall.args[0];

          // Check if it's a CustomEvent or Event
          expect(event).to.be.instanceOf(Event);
          expect(event.type).to.equal('formSubmitted');
          expect(event.detail).to.exist;
        });
      });
    });

    it('should handle multiple form submissions', () => {
      cy.window().then(() => {
        handleFormSubmit('form1', { data: '1' });
        handleFormSubmit('form2', { data: '2' });

        cy.get('@dispatchEventStub').should('be.calledTwice');
        
        cy.get('@dispatchEventStub').then((stub) => {
          const firstEvent = stub.getCall(0).args[0];
          const secondEvent = stub.getCall(1).args[0];

          expect(firstEvent.detail.formName).to.equal('form1');
          expect(secondEvent.detail.formName).to.equal('form2');
        });
      });
    });
  });
}); 