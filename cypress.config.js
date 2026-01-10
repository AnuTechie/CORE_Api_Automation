const { defineConfig } = require("cypress");
const { Client } = require("pg");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://192.168.0.156:3000",
    specPattern: [
      "cypress/e2e/login.cy.js",
      "cypress/e2e/mcq_question.cy.js",
      "cypress/e2e/matching_question.cy.js",
      "cypress/e2e/blank_question.cy.js",
    ],
    setupNodeEvents(on, config) {
      // PostgreSQL Database Task
      on("task", {
        /**
         * Execute a SQL query against PostgreSQL database
         * @param {Object} params - Query parameters
         * @param {string} params.query - SQL query to execute
         * @param {Array} params.values - Optional parameterized values
         * @returns {Promise<Object>} - Query result with rows
         */
        async queryDatabase({ query, values = [] }) {
          const client = new Client({
            user: config.env.DB_USER,
            password: config.env.DB_PASSWORD,
            host: config.env.DB_HOST,
            port: config.env.DB_PORT,
            database: config.env.DB_NAME,
          });

          try {
            await client.connect();
            const result = await client.query(query, values);
            await client.end();
            return result.rows;
          } catch (error) {
            await client.end();
            throw new Error(`Database query failed: ${error.message}`);
          }
        },
      });

      return config;
    },
  },
});
