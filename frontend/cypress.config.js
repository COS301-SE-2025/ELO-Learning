const { defineConfig } = require('cypress');

module.exports = defineConfig({
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.ts', // Ensure cy.mount is available
  },

  e2e: {
    baseUrl: 'http://localhost:8080',
    pageLoadTimeout: 30000, // Reduce from default 60s to 30s for faster feedback
    specPattern: [
      'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
      'cypress/integration/**/*.cy.{js,jsx,ts,tsx}',
      'cypress/unit/**/*.test.cy.{js,jsx,ts,tsx}',
    ],
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
