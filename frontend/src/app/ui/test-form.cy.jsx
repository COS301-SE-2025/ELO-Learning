import React from 'react';
import TestForm from './test-form';

describe('<TestForm />', () => {
  beforeEach(() => {
    cy.mount(<TestForm />);
  });

  it('renders the form correctly', () => {
    cy.get('[data-testid="test-form"]').should('be.visible');
    cy.get('[data-testid="username-input"]').should('be.visible');
    cy.get('[data-testid="email-input"]').should('be.visible');
    cy.get('[data-testid="message-input"]').should('be.visible');
    cy.get('[data-testid="submit-button"]').should('contain.text', 'Submit');
    cy.get('[data-testid="reset-button"]').should('contain.text', 'Reset');
  });

  it('fills out and submits the form successfully', () => {
    // Set up console log spy
    cy.window().then((win) => {
      cy.stub(win.console, 'log').as('consoleLog');
    });

    // Fill out the form
    cy.get('[data-testid="username-input"]').type('testuser');
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="message-input"]').type('This is a test message');

    // Submit the form
    cy.get('[data-testid="submit-button"]').click();

    // Verify the console log was called (this proves our utility function worked)
    cy.get('@consoleLog').should(
      'have.been.calledWith',
      'Form "testForm" submitted with data:',
      {
        username: 'testuser',
        email: 'test@example.com',
        message: 'This is a test message'
      }
    );

    // Verify success message appears
    cy.get('[data-testid="status-message"]')
      .should('be.visible')
      .and('contain.text', 'Form submitted successfully!');
  });

  it('tests the reset button functionality', () => {
    // Set up console log spy
    cy.window().then((win) => {
      cy.stub(win.console, 'log').as('consoleLog');
    });

    // Fill out some fields
    cy.get('[data-testid="username-input"]').type('testuser');
    cy.get('[data-testid="email-input"]').type('test@example.com');

    // Click reset button
    cy.get('[data-testid="reset-button"]').click();

    // Verify console log was called for button click
    cy.get('@consoleLog').should('have.been.calledWith', 'Button "resetButton" clicked');

    // Verify fields are cleared
    cy.get('[data-testid="username-input"]').should('have.value', '');
    cy.get('[data-testid="email-input"]').should('have.value', '');

    // Verify reset message appears
    cy.get('[data-testid="status-message"]')
      .should('be.visible')
      .and('contain.text', 'Form reset');
  });

  it('listens for custom form submission events', () => {
    // This test demonstrates how to listen for the custom events
    // that our utility functions emit
    cy.window().then((win) => {
      let eventReceived = false;
      let receivedData = null;
      
      // Listen for the custom event
      win.addEventListener('formSubmitted', (event) => {
        eventReceived = true;
        receivedData = event.detail;
      });

      // Fill and submit form
      cy.get('[data-testid="username-input"]').type('event-test-user');
      cy.get('[data-testid="email-input"]').type('event@example.com');
      cy.get('[data-testid="submit-button"]').click();

      // Verify event was received with correct data
      cy.then(() => {
        expect(eventReceived).to.be.true;
        expect(receivedData.formName).to.equal('testForm');
        expect(receivedData.formData.username).to.equal('event-test-user');
        expect(receivedData.formData.email).to.equal('event@example.com');
      });
    });
  });

  it('validates required fields', () => {
    // Try to submit empty form
    cy.get('[data-testid="submit-button"]').click();

    // HTML5 validation should prevent submission
    cy.get('[data-testid="username-input"]:invalid').should('exist');
  });

  it('tests form interaction flow', () => {
    // Complete user interaction flow
    cy.get('[data-testid="username-input"]').type('john_doe');
    cy.get('[data-testid="email-input"]').type('john@example.com');
    cy.get('[data-testid="message-input"]').type('Hello, this is a test!');
    
    // Submit and verify
    cy.get('[data-testid="submit-button"]').click();
    cy.get('[data-testid="status-message"]').should('contain.text', 'successfully');
    
    // Wait for form to reset automatically
    cy.get('[data-testid="username-input"]', { timeout: 3000 }).should('have.value', '');
  });
});