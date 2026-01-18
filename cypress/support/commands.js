// ***********************************************
// Custom Commands for API Automation
// ***********************************************

/**
 * Login API Command
 * @param {string} username - Username for login
 * @param {string} password - Password for login
 * @param {string} deviceId - Optional device ID
 * @returns {Cypress.Chainable} - API response
 */
Cypress.Commands.add('login', (username, password, productId = null, deviceId = null) => {
    const body = {
        username: username,
        password: password,
    };

    // Add product_id only if provided
    if (productId !== null) {
        body.product_id = productId;
    }

    // Add device_id only if provided
    if (deviceId !== null) {
        body.device_id = deviceId;
    }

    return cy.request({
        method: 'POST',
        url: '/api/authX/login',
        body: body,
        headers: {
            'Content-Type': 'application/json',
        },
        failOnStatusCode: false, // Allow non-2xx responses for negative tests
    });
});

/**
 * Login with environment variables
 * Uses credentials from cypress.env.json
 * @returns {Cypress.Chainable} - API response
 */
Cypress.Commands.add('loginWithEnv', () => {
    return cy.login(
        Cypress.env('USERNAME'),
        Cypress.env('PASSWORD'),
        Cypress.env('PRODUCT_ID'),
        Cypress.env('DEVICE_ID')
    );
});

/**
 * Login and store tokens
 * Performs login and stores JWT tokens for subsequent requests in memory
 * @param {string} username - Username for login
 * @param {string} password - Password for login
 * @param {string} productId - Optional product ID
 * @param {string} deviceId - Optional device ID
 * @returns {Cypress.Chainable} - API response
 */
Cypress.Commands.add('loginAndStoreTokens', (username, password, productId = null, deviceId = null) => {
    return cy.login(username, password, productId, deviceId).then((response) => {
        if (response.status === 200) {
            const accessToken = response.body.jwt.accessToken;
            // Store in memory for current test run
            Cypress.env('ACCESS_TOKEN', accessToken);
        }
        return response;
    });
});

// ***********************************************
// Helper function to get Authorization header
// ***********************************************

/**
 * Get authorization header with stored access token
 * @returns {Object} - Headers object with Authorization
 */
function getAuthHeaders() {
    const headers = {
        'Content-Type': 'application/json',
    };
    const accessToken = Cypress.env('ACCESS_TOKEN');
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return headers;
}

// ***********************************************
// MCQ Question API Commands
// ***********************************************

/**
 * Create MCQ Question API Command
 * @param {Object} payload - MCQ question payload
 * @param {Object} overrides - Optional field overrides to merge with payload
 * @returns {Cypress.Chainable} - API response
 */
Cypress.Commands.add('createMCQ', (payload, overrides = {}) => {
    const body = { ...payload, ...overrides };
    return cy.request({
        method: 'POST',
        url: '/api/content/v1/questions/multiple-choice',
        body: body,
        headers: getAuthHeaders(),
        failOnStatusCode: false,
    });
});

/**
 * Create MCQ with fixture
 * Loads payload from fixture and allows overrides
 * @param {string} fixturePath - Path to fixture file (e.g., 'mcq/validPayload')
 * @param {Object} overrides - Optional field overrides
 * @returns {Cypress.Chainable} - API response
 */
Cypress.Commands.add('createMCQFromFixture', (fixturePath, overrides = {}) => {
    return cy.fixture(fixturePath).then((payload) => {
        return cy.createMCQ(payload, overrides);
    });
});

/**
 * Create MCQ and store content_id
 * Creates MCQ question and stores content_id in Cypress.env for later use
 * @param {Object} payload - MCQ question payload
 * @returns {Cypress.Chainable} - API response
 */
Cypress.Commands.add('createMCQAndStore', (payload, overrides = {}) => {
    return cy.createMCQ(payload, overrides).then((response) => {
        if (response.status === 201) {
            Cypress.env('CREATED_CONTENT_ID', response.body.content_id);
            Cypress.env('CREATED_CONTENT_ROW_ID', response.body.content_row_id);
        }
        return response;
    });
});

// ***********************************************
// GET Content API Commands
// ***********************************************

/**
 * Get Content by content_id
 * @param {string} contentId - The content ID to retrieve
 * @param {Object} options - Optional query parameters and headers
 * @param {string} options.languages - Comma-separated language codes (e.g., 'en,hi')
 * @param {boolean} options.encrypt - x-encryption header value
 * @returns {Cypress.Chainable} - API response
 */
Cypress.Commands.add('getContent', (contentId, options = {}) => {
    const queryParams = {};
    const headers = getAuthHeaders();

    // Add languages query param if provided
    if (options.languages !== undefined) {
        queryParams.languages = options.languages;
    }

    // Add x-encryption header if provided
    if (options.encrypt !== undefined) {
        headers['x-encryption'] = options.encrypt.toString();
    }

    return cy.request({
        method: 'GET',
        url: `/api/content/v1/items/${contentId}`,
        qs: queryParams,
        headers: headers,
        failOnStatusCode: false,
    });
});

/**
 * Get Content with specific languages
 * @param {string} contentId - The content ID to retrieve
 * @param {string} languages - Comma-separated language codes (e.g., 'en,hi')
 * @returns {Cypress.Chainable} - API response
 */
Cypress.Commands.add('getContentWithLanguages', (contentId, languages) => {
    return cy.getContent(contentId, { languages: languages });
});

/**
 * Get Content with encryption header
 * @param {string} contentId - The content ID to retrieve
 * @param {boolean} encrypt - Whether to encrypt the response (correct_answer and explanation)
 * @returns {Cypress.Chainable} - API response
 */
Cypress.Commands.add('getContentEncrypted', (contentId, encrypt) => {
    return cy.getContent(contentId, { encrypt: encrypt });
});

// ***********************************************
// Matching Question API Commands
// ***********************************************

/**
 * Create Matching Question API Command
 * @param {Object} payload - Matching question payload
 * @param {Object} overrides - Optional field overrides to merge with payload
 * @returns {Cypress.Chainable} - API response
 */
Cypress.Commands.add('createMatching', (payload, overrides = {}) => {
    const body = { ...payload, ...overrides };
    return cy.request({
        method: 'POST',
        url: '/api/content/v1/questions/matching',
        body: body,
        headers: getAuthHeaders(),
        failOnStatusCode: false,
    });
});

/**
 * Create Matching with fixture
 * Loads payload from fixture and allows overrides
 * @param {string} fixturePath - Path to fixture file (e.g., 'matching/validPayload')
 * @param {Object} overrides - Optional field overrides
 * @returns {Cypress.Chainable} - API response
 */
Cypress.Commands.add('createMatchingFromFixture', (fixturePath, overrides = {}) => {
    return cy.fixture(fixturePath).then((payload) => {
        return cy.createMatching(payload, overrides);
    });
});

/**
 * Create Matching and store content_id
 * Creates Matching question and stores content_id in Cypress.env for later use
 * @param {Object} payload - Matching question payload
 * @param {Object} overrides - Optional field overrides
 * @returns {Cypress.Chainable} - API response
 */
Cypress.Commands.add('createMatchingAndStore', (payload, overrides = {}) => {
    return cy.createMatching(payload, overrides).then((response) => {
        if (response.status === 201) {
            Cypress.env('CREATED_MATCHING_CONTENT_ID', response.body.content_id);
            Cypress.env('CREATED_MATCHING_CONTENT_ROW_ID', response.body.content_row_id);
        }
        return response;
    });
});

// =============================================
// FILL IN THE BLANK (BLANK) API COMMANDS
// =============================================

/**
 * Create Fill in the Blank Question
 * @param {Object} payload - Blank question payload
 * @param {Object} overrides - Optional field overrides
 * @returns {Cypress.Chainable} - API response
 */
Cypress.Commands.add('createBlank', (payload, overrides = {}) => {
    const body = { ...payload, ...overrides };
    return cy.request({
        method: 'POST',
        url: '/api/content/v1/questions/fill-in-the-blanks',
        body: body,
        headers: getAuthHeaders(),
        failOnStatusCode: false,
    });
});

/**
 * Create Blank from fixture
 * @param {string} fixturePath - Path to fixture file
 * @param {Object} overrides - Optional field overrides
 * @returns {Cypress.Chainable} - API response
 */
Cypress.Commands.add('createBlankFromFixture', (fixturePath, overrides = {}) => {
    return cy.fixture(fixturePath).then((payload) => {
        return cy.createBlank(payload, overrides);
    });
});

/**
 * Create Blank and store content_id
 * Creates Blank question and stores content_id in Cypress.env for later use
 * @param {Object} payload - Blank question payload
 * @param {Object} overrides - Optional field overrides
 * @returns {Cypress.Chainable} - API response
 */
Cypress.Commands.add('createBlankAndStore', (payload, overrides = {}) => {
    return cy.createBlank(payload, overrides).then((response) => {
        if (response.status === 201) {
            Cypress.env('CREATED_BLANK_CONTENT_ID', response.body.content_id);
            Cypress.env('CREATED_BLANK_CONTENT_ROW_ID', response.body.content_row_id);
        }
        return response;
    });
});

/**
 * Update Blank Question API Command (PUT)
 * @param {string} contentId - Content ID to update
 * @param {Object} payload - Update payload with create_new_version and content_details
 * @param {Object} overrides - Optional field overrides to merge with payload
 * @returns {Cypress.Chainable} - API response
 */
Cypress.Commands.add('updateBlank', (contentId, payload, overrides = {}) => {
    const body = { ...payload, ...overrides };
    return cy.request({
        method: 'PUT',
        url: `/api/content/v1/questions/fill-in-the-blanks/${contentId}`,
        body: body,
        headers: getAuthHeaders(),
        failOnStatusCode: false,
    });
});

/**
 * Update Blank with fixture
 * Loads payload from fixture and allows overrides
 * @param {string} contentId - Content ID to update
 * @param {string} fixturePath - Path to fixture file (e.g., 'blank/put/updateWithoutNewVersion')
 * @param {Object} overrides - Optional field overrides
 * @returns {Cypress.Chainable} - API response
 */
Cypress.Commands.add('updateBlankFromFixture', (contentId, fixturePath, overrides = {}) => {
    return cy.fixture(fixturePath).then((payload) => {
        return cy.updateBlank(contentId, payload, overrides);
    });
});

// ***********************************************
// DATABASE VERIFICATION COMMANDS
// ***********************************************

/**
 * Execute a database query
 * Uses the queryDatabase task defined in cypress.config.js
 * @param {string} query - SQL query to execute
 * @param {Array} values - Optional parameterized values for the query
 * @returns {Cypress.Chainable} - Query result rows
 * 
 * @example
 * cy.queryDB('SELECT * FROM content WHERE content_id = $1', ['Q12345'])
 *   .then((rows) => {
 *     expect(rows).to.have.length(1);
 *     expect(rows[0].content_id).to.eq('Q12345');
 *   });
 */
Cypress.Commands.add('queryDB', (query, values = []) => {
    return cy.task('queryDatabase', { query, values });
});

/**
 * Verify that content exists in the database by content_id
 * Queries the questions table and returns the matching row
 * @param {string} contentId - The content_id to verify (e.g., 'Q12345')
 * @returns {Cypress.Chainable} - Database row or null if not found
 * 
 * @example
 * cy.verifyContentInDB('Q12345').then((dbRow) => {
 *     expect(dbRow).to.not.be.null;
 *     expect(dbRow.content_id).to.eq('Q12345');
 *     expect(dbRow.question_type).to.eq('Blank');
 * });
 */
Cypress.Commands.add('verifyContentInDB', (contentId) => {
    const query = 'SELECT * FROM questions WHERE content_id = $1';
    return cy.queryDB(query, [contentId]).then((rows) => {
        if (rows && rows.length > 0) {
            return rows[0];
        }
        return null;
    });
});

/**
 * Verify specific fields of content in the database
 * Queries the questions table and validates expected field values
 * @param {string} contentId - The content_id to verify
 * @param {Object} expectedFields - Object with field names and expected values
 * @returns {Cypress.Chainable} - Database row
 * 
 * @example
 * cy.verifyContentFieldsInDB('Q12345', {
 *     question_type: 'Blank',
 *     language_code: 'en',
 *     project_id: 1
 * }).then((dbRow) => {
 *     cy.log('Content verified in database');
 * });
 */
Cypress.Commands.add('verifyContentFieldsInDB', (contentId, expectedFields = {}) => {
    return cy.verifyContentInDB(contentId).then((dbRow) => {
        expect(dbRow, `Content with ID ${contentId} should exist in database`).to.not.be.null;

        // Verify each expected field
        Object.keys(expectedFields).forEach((fieldName) => {
            const expectedValue = expectedFields[fieldName];
            const actualValue = dbRow[fieldName];
            expect(actualValue, `Field '${fieldName}' in database`).to.eq(expectedValue);
        });

        return dbRow;
    });
});

/**
 * Verify that content exists in the database by content_row_id
 * Queries the questions table and returns the matching row
 * @param {string} contentRowId - The content_row_id to verify
 * @returns {Cypress.Chainable} - Database row or null if not found
 * 
 * @example
 * cy.verifyContentRowInDB('Q12345_en_v1').then((dbRow) => {
 *     expect(dbRow).to.not.be.null;
 *     expect(dbRow.content_row_id).to.eq('Q12345_en_v1');
 * });
 */
Cypress.Commands.add('verifyContentRowInDB', (contentRowId) => {
    const query = 'SELECT * FROM questions WHERE content_row_id = $1';
    return cy.queryDB(query, [contentRowId]).then((rows) => {
        if (rows && rows.length > 0) {
            return rows[0];
        }
        return null;
    });
});

// ***********************************************
// BLOCK COUNTING QUESTION API COMMANDS
// ***********************************************

/**
 * Create Block Counting Question API Command
 * @param {Object} payload - Block Counting question payload
 * @param {Object} overrides - Optional field overrides to merge with payload
 * @returns {Cypress.Chainable} - API response
 */
Cypress.Commands.add('createBlockCounting', (payload, overrides = {}) => {
    const body = { ...payload, ...overrides };
    return cy.request({
        method: 'POST',
        url: '/api/content/v1/questions/block-counting',
        body: body,
        headers: getAuthHeaders(),
        failOnStatusCode: false,
    });
});

/**
 * Create Block Counting with fixture
 * Loads payload from fixture and allows overrides
 * @param {string} fixturePath - Path to fixture file (e.g., 'block-counting/validPayload')
 * @param {Object} overrides - Optional field overrides
 * @returns {Cypress.Chainable} - API response
 */
Cypress.Commands.add('createBlockCountingFromFixture', (fixturePath, overrides = {}) => {
    return cy.fixture(fixturePath).then((payload) => {
        return cy.createBlockCounting(payload, overrides);
    });
});

/**
 * Create Block Counting and store content_id
 * Creates Block Counting question and stores content_id in Cypress.env for later use
 * @param {Object} payload - Block Counting question payload
 * @param {Object} overrides - Optional field overrides
 * @returns {Cypress.Chainable} - API response
 */
Cypress.Commands.add('createBlockCountingAndStore', (payload, overrides = {}) => {
    return cy.createBlockCounting(payload, overrides).then((response) => {
        if (response.status === 201) {
            Cypress.env('CREATED_BLOCKCOUNTING_CONTENT_ID', response.body.content_id);
            Cypress.env('CREATED_BLOCKCOUNTING_CONTENT_ROW_ID', response.body.content_row_id);
        }
        return response;
    });
});

// ***********************************************
// SEQUENCING QUESTION API COMMANDS
// ***********************************************

/**
 * Create Sequencing Question API Command
 * @param {Object} payload - Sequencing question payload
 * @param {Object} overrides - Optional field overrides to merge with payload
 * @returns {Cypress.Chainable} - API response
 */
Cypress.Commands.add('createSequencing', (payload, overrides = {}) => {
    const body = { ...payload, ...overrides };
    return cy.request({
        method: 'POST',
        url: '/api/content/v1/questions/sequencing',
        body: body,
        headers: getAuthHeaders(),
        failOnStatusCode: false,
    });
});

/**
 * Create Sequencing with fixture
 * Loads payload from fixture and allows overrides
 * @param {string} fixturePath - Path to fixture file (e.g., 'sequencing/validPayload')
 * @param {Object} overrides - Optional field overrides
 * @returns {Cypress.Chainable} - API response
 */
Cypress.Commands.add('createSequencingFromFixture', (fixturePath, overrides = {}) => {
    return cy.fixture(fixturePath).then((payload) => {
        return cy.createSequencing(payload, overrides);
    });
});

/**
 * Create Sequencing and store content_id
 * Creates Sequencing question and stores content_id in Cypress.env for later use
 * @param {Object} payload - Sequencing question payload
 * @param {Object} overrides - Optional field overrides
 * @returns {Cypress.Chainable} - API response
 */
Cypress.Commands.add('createSequencingAndStore', (payload, overrides = {}) => {
    return cy.createSequencing(payload, overrides).then((response) => {
        if (response.status === 201) {
            Cypress.env('CREATED_SEQUENCING_CONTENT_ID', response.body.content_id);
            Cypress.env('CREATED_SEQUENCING_CONTENT_ROW_ID', response.body.content_row_id);
        }
        return response;
    });
});

// ***********************************************
// CLASSIFICATION QUESTION API COMMANDS
// ***********************************************

/**
 * Create Classification Question API Command
 * @param {Object} payload - Classification question payload
 * @param {Object} overrides - Optional field overrides to merge with payload
 * @returns {Cypress.Chainable} - API response
 */
Cypress.Commands.add('createClassification', (payload, overrides = {}) => {
    const body = { ...payload, ...overrides };
    return cy.request({
        method: 'POST',
        url: '/api/content/v1/questions/classification',
        body: body,
        headers: getAuthHeaders(),
        failOnStatusCode: false,
    });
});

/**
 * Create Classification with fixture
 * Loads payload from fixture and allows overrides
 * @param {string} fixturePath - Path to fixture file (e.g., 'classification/validPayload')
 * @param {Object} overrides - Optional field overrides
 * @returns {Cypress.Chainable} - API response
 */
Cypress.Commands.add('createClassificationFromFixture', (fixturePath, overrides = {}) => {
    return cy.fixture(fixturePath).then((payload) => {
        return cy.createClassification(payload, overrides);
    });
});

/**
 * Create Classification and store content_id
 * Creates Classification question and stores content_id in Cypress.env for later use
 * @param {Object} payload - Classification question payload
 * @param {Object} overrides - Optional field overrides
 * @returns {Cypress.Chainable} - API response
 */
Cypress.Commands.add('createClassificationAndStore', (payload, overrides = {}) => {
    return cy.createClassification(payload, overrides).then((response) => {
        if (response.status === 201) {
            Cypress.env('CREATED_CLASSIFICATION_CONTENT_ID', response.body.content_id);
            Cypress.env('CREATED_CLASSIFICATION_CONTENT_ROW_ID', response.body.content_row_id);
        }
        return response;
    });
});
