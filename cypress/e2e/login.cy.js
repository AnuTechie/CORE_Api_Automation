/// <reference types="cypress" />

/**
 * Login API Test Suite
 * Endpoint: POST /api/authX/login
 * Base URL: https://core.poc-ei.study
 */
describe('Login API Tests', () => {
    // Test data
    const validUsername = Cypress.env('USERNAME');
    const validPassword = Cypress.env('PASSWORD');
    const validProductId = Cypress.env('PRODUCT_ID');
    const validDeviceId = Cypress.env('DEVICE_ID');

    // =============================================
    // POSITIVE TEST CASES
    // =============================================
    describe('Positive Test Cases', () => {
        it('TC001 - Should login successfully with valid credentials and product_id', () => {
            cy.login(validUsername, validPassword, validProductId, validDeviceId).then((response) => {
                // Assert status code
                expect(response.status).to.eq(200);

                // Assert response message
                expect(response.body).to.have.property('message');

                // Assert JWT token exists
                expect(response.body).to.have.property('jwt');
                expect(response.body.jwt).to.have.property('accessToken');

                // Assert token is non-empty string
                expect(response.body.jwt.accessToken).to.be.a('string').and.not.be.empty;
            });
        });

        it('TC002 - Should login successfully without optional fields', () => {
            cy.login(validUsername, validPassword).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message');
                expect(response.body.jwt).to.have.property('accessToken');
            });
        });

        it('TC003 - Should login using custom command with environment variables', () => {
            cy.loginWithEnv().then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.message).to.eq('Login successful!');
            });
        });

        it('TC004 - Should store tokens after successful login', () => {
            cy.loginAndStoreTokens(validUsername, validPassword, validProductId, validDeviceId).then((response) => {
                expect(response.status).to.eq(200);
                // Verify token is stored in environment
                expect(Cypress.env('ACCESS_TOKEN')).to.exist;
            });
        });

        it('TC005 - Should return valid JWT token format', () => {
            cy.login(validUsername, validPassword).then((response) => {
                expect(response.status).to.eq(200);
                // JWT format: header.payload.signature (3 parts separated by dots)
                const accessToken = response.body.jwt.accessToken;
                const tokenParts = accessToken.split('.');
                expect(tokenParts).to.have.length(3);
            });
        });
    });

    // =============================================
    // NEGATIVE TEST CASES
    // =============================================
    describe('Negative Test Cases', () => {
        it('TC006 - Should return 401 for incorrect password', () => {
            cy.login(validUsername, 'wrongpassword123').then((response) => {
                expect(response.status).to.eq(401);
                expect(response.body).to.have.property('message');
                expect(response.body.message).to.include('Incorrect password');
            });
        });

        it('TC007 - Should return 404 for non-existent user', () => {
            cy.login('nonexistent.user', validPassword).then((response) => {
                expect(response.status).to.eq(404);
                expect(response.body).to.have.property('message');
                expect(response.body.message).to.include('invalid');
            });
        });

        it('TC008 - Should return 400 when username is missing', () => {
            cy.request({
                method: 'POST',
                url: '/api/authX/login',
                body: {
                    password: validPassword,
                    device_id: validDeviceId,
                },
                headers: { 'Content-Type': 'application/json' },
                failOnStatusCode: false,
            }).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body.message).to.include('missing');
            });
        });

        it('TC009 - Should return 400 when password is missing', () => {
            cy.request({
                method: 'POST',
                url: '/api/authX/login',
                body: {
                    username: validUsername,
                    device_id: validDeviceId,
                },
                headers: { 'Content-Type': 'application/json' },
                failOnStatusCode: false,
            }).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body.message).to.include('missing');
            });
        });

        it('TC010 - Should return 400 when both username and password are missing', () => {
            cy.request({
                method: 'POST',
                url: '/api/authX/login',
                body: {
                    device_id: validDeviceId,
                },
                headers: { 'Content-Type': 'application/json' },
                failOnStatusCode: false,
            }).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body.message).to.include('missing');
            });
        });

        it('TC011 - Should return 400 with empty request body', () => {
            cy.request({
                method: 'POST',
                url: '/api/authX/login',
                body: {},
                headers: { 'Content-Type': 'application/json' },
                failOnStatusCode: false,
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC012 - Should return error when username is empty string', () => {
            cy.login('', validPassword).then((response) => {
                expect(response.status).to.be.oneOf([400, 401, 404]);
            });
        });

        it('TC013 - Should return error when password is empty string', () => {
            cy.login(validUsername, '').then((response) => {
                expect(response.status).to.be.oneOf([400, 401]);
            });
        });
    });

    // =============================================
    // EDGE CASES
    // =============================================
    describe('Edge Cases', () => {
        it('TC014 - Should handle username with special characters', () => {
            cy.login('user@#$%^&*()', validPassword).then((response) => {
                expect(response.status).to.be.oneOf([400, 401, 404]);
                expect(response.body).to.have.property('message');
            });
        });

        it('TC015 - Should handle password with special characters', () => {
            cy.login(validUsername, '!@#$%^&*()_+-=[]{}|;:,.<>?').then((response) => {
                expect(response.status).to.be.oneOf([400, 401]);
                expect(response.body).to.have.property('message');
            });
        });

        it('TC016 - Should handle very long username (500 characters)', () => {
            const longUsername = 'a'.repeat(500);
            cy.login(longUsername, validPassword).then((response) => {
                expect(response.status).to.be.oneOf([400, 404, 414]);
            });
        });

        it('TC017 - Should handle very long password (500 characters)', () => {
            const longPassword = 'p'.repeat(500);
            cy.login(validUsername, longPassword).then((response) => {
                expect(response.status).to.be.oneOf([400, 401, 414]);
            });
        });

        it('TC018 - Should handle username with leading/trailing whitespace', () => {
            cy.login('  ' + validUsername + '  ', validPassword).then((response) => {
                // API should either trim whitespace and succeed or fail validation
                expect(response.status).to.be.oneOf([200, 400, 404]);
            });
        });

        it('TC019 - Should handle SQL injection attempt in username', () => {
            cy.login("'; DROP TABLE users; --", validPassword).then((response) => {
                expect(response.status).to.be.oneOf([400, 401, 404]);
                // Should not return 500 (server error)
                expect(response.status).to.not.eq(500);
            });
        });

        it('TC020 - Should handle XSS attempt in username', () => {
            cy.login('<script>alert("xss")</script>', validPassword).then((response) => {
                expect(response.status).to.be.oneOf([400, 404]);
                expect(response.status).to.not.eq(500);
            });
        });

        it('TC021 - Should handle unicode characters in username', () => {
            cy.login('用户名测试', validPassword).then((response) => {
                expect(response.status).to.be.oneOf([400, 404]);
            });
        });

        it('TC022 - Should handle unicode characters in password', () => {
            cy.login(validUsername, '密码测试🔐').then((response) => {
                expect(response.status).to.be.oneOf([400, 401]);
            });
        });

        it('TC023 - Should handle null values in request body', () => {
            cy.request({
                method: 'POST',
                url: '/api/authX/login',
                body: {
                    username: null,
                    password: null,
                    device_id: null,
                },
                headers: { 'Content-Type': 'application/json' },
                failOnStatusCode: false,
            }).then((response) => {
                expect(response.status).to.be.oneOf([400, 401, 404]);
            });
        });

        it('TC024 - Should handle numeric values instead of strings', () => {
            cy.request({
                method: 'POST',
                url: '/api/authX/login',
                body: {
                    username: 12345,
                    password: 67890,
                    device_id: 11111,
                },
                headers: { 'Content-Type': 'application/json' },
                failOnStatusCode: false,
            }).then((response) => {
                expect(response.status).to.be.oneOf([400, 404]);
            });
        });

        it('TC025 - Should handle boolean values instead of strings', () => {
            cy.request({
                method: 'POST',
                url: '/api/authX/login',
                body: {
                    username: true,
                    password: false,
                },
                headers: { 'Content-Type': 'application/json' },
                failOnStatusCode: false,
            }).then((response) => {
                expect(response.status).to.be.oneOf([400, 404]);
            });
        });

        it('TC026 - Should handle array values instead of strings', () => {
            cy.request({
                method: 'POST',
                url: '/api/authX/login',
                body: {
                    username: ['user1', 'user2'],
                    password: ['pass1', 'pass2'],
                },
                headers: { 'Content-Type': 'application/json' },
                failOnStatusCode: false,
            }).then((response) => {
                expect(response.status).to.be.oneOf([400, 500]);
            });
        });

        it('TC027 - Should handle object values instead of strings', () => {
            cy.request({
                method: 'POST',
                url: '/api/authX/login',
                body: {
                    username: { name: 'test' },
                    password: { pass: 'test' },
                },
                headers: { 'Content-Type': 'application/json' },
                failOnStatusCode: false,
            }).then((response) => {
                expect(response.status).to.be.oneOf([400, 500]);
            });
        });

        it('TC028 - Should handle case sensitivity in username', () => {
            cy.login(validUsername.toUpperCase(), validPassword).then((response) => {
                // Response depends on whether username is case-sensitive
                expect(response.status).to.be.oneOf([200, 404]);
            });
        });

        it('TC029 - Should handle extra fields in request body', () => {
            cy.request({
                method: 'POST',
                url: '/api/authX/login',
                body: {
                    username: validUsername,
                    password: validPassword,
                    device_id: validDeviceId,
                    extraField: 'should be ignored',
                    anotherField: 12345,
                },
                headers: { 'Content-Type': 'application/json' },
                failOnStatusCode: false,
            }).then((response) => {
                // API should ignore extra fields and process normally
                expect(response.status).to.eq(200);
            });
        });

        it('TC030 - Should validate response time is within acceptable limit', () => {
            const startTime = Date.now();
            cy.login(validUsername, validPassword).then((response) => {
                const endTime = Date.now();
                const responseTime = endTime - startTime;
                // Response should be within 5 seconds
                expect(responseTime).to.be.lessThan(5000);
                expect(response.status).to.eq(200);
            });
        });
    });

    // =============================================
    // RESPONSE STRUCTURE VALIDATION
    // =============================================
    describe('Response Structure Validation', () => {
        it('TC031 - Should validate successful response structure matches schema', () => {
            cy.login(validUsername, validPassword).then((response) => {
                expect(response.status).to.eq(200);

                // Validate top-level structure
                expect(response.body).to.be.an('object');
                expect(response.body).to.have.property('message');
                expect(response.body).to.have.property('jwt');

                // Validate jwt structure
                expect(response.body.jwt).to.be.an('object');
                expect(response.body.jwt).to.have.property('accessToken');

                // Validate data types
                expect(response.body.message).to.be.a('string');
                expect(response.body.jwt.accessToken).to.be.a('string');
            });
        });

        it('TC032 - Should validate error response structure', () => {
            cy.login('invalid.user', 'wrongpass').then((response) => {
                expect(response.status).to.be.oneOf([401, 404]);
                expect(response.body).to.be.an('object');
                expect(response.body).to.have.property('message');
                expect(response.body.message).to.be.a('string');
            });
        });

        it('TC033 - Should validate Content-Type header in response', () => {
            cy.login(validUsername, validPassword).then((response) => {
                expect(response.headers).to.have.property('content-type');
                expect(response.headers['content-type']).to.include('application/json');
            });
        });
    });
});
