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
 * Performs login and stores JWT tokens for subsequent requests
 * @param {string} username - Username for login
 * @param {string} password - Password for login
 * @param {string} deviceId - Optional device ID
 * @returns {Cypress.Chainable} - API response
 */
Cypress.Commands.add('loginAndStoreTokens', (username, password, productId = null, deviceId = null) => {
    return cy.login(username, password, productId, deviceId).then((response) => {
        if (response.status === 200) {
            Cypress.env('ACCESS_TOKEN', response.body.jwt.accessToken);
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