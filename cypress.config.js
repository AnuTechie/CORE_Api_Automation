const { defineConfig } = require("cypress");
const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://192.168.0.156:3000",
    specPattern: [
      "cypress/e2e/login.cy.js",
      "cypress/e2e/Blank/post_blank.cy.js",
      "cypress/e2e/Blank/put_blank.cy.js",
      "cypress/e2e/MCQ/post_mcq.cy.js",
      "cypress/e2e/Matching/post_matching.cy.js",
      "cypress/e2e/BlockCounting/post_blockcounting.cy.js",
      "cypress/e2e/Sequencing/post_sequencing.cy.js",
      "cypress/e2e/Matching/put_matching.cy.js",
      "cypress/e2e/Classification/post_classification.cy.js",
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

        /**
         * Update cypress.env.json file with new environment variable
         * @param {Object} params - Update parameters
         * @param {string} params.key - Environment variable key
         * @param {*} params.value - Environment variable value
         * @returns {null} - Returns null as required by Cypress tasks
         */
        updateEnvFile({ key, value }) {
          try {
            const envFilePath = path.join(__dirname, "cypress.env.json");

            // Read and parse the current env file
            const fileContent = fs.readFileSync(envFilePath, "utf8");
            let envData;

            // Handle empty or corrupted file
            if (!fileContent || fileContent.trim() === '') {
              console.warn('cypress.env.json was empty, initializing with default values');
              envData = {
                "USERNAME": config.env.USERNAME || "",
                "PASSWORD": config.env.PASSWORD || "",
                "PRODUCT_ID": config.env.PRODUCT_ID || 2,
                "DEVICE_ID": config.env.DEVICE_ID || "",
                "ACCESS_TOKEN": "",
                "DB_USER": config.env.DB_USER || "",
                "DB_PASSWORD": config.env.DB_PASSWORD || "",
                "DB_HOST": config.env.DB_HOST || "",
                "DB_PORT": config.env.DB_PORT || 5432,
                "DB_NAME": config.env.DB_NAME || ""
              };
            } else {
              envData = JSON.parse(fileContent);
            }

            // Update the specified key
            envData[key] = value;

            // Write back to file
            fs.writeFileSync(envFilePath, JSON.stringify(envData, null, 4), "utf8");

            return null;
          } catch (error) {
            console.error(`Failed to update env file: ${error.message}`);
            return null; // Return null even on error to prevent hanging
          }
        },
      });

      return config;
    },
  },
});
