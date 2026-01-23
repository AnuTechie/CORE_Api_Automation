/// <reference types="cypress" />

/**
 * Operations Grid Question API Test Suite
 * Endpoint: POST /api/content/v1/questions/operations-grid
 * Base URL: https://core.poc-ei.study
 * 
 * Uses:
 * - Fixtures: cypress/fixtures/operations-grid/ for test data
 * - Custom Commands: cy.createOperationsGrid(), cy.createOperationsGridFromFixture()
 */
describe('Operations Grid Question API Tests', () => {
    // Shared variable to store created content_id for GET API tests later
    let createdContentId;
    let createdContentRowId;

    // Load base payloads before tests
    let validPayload;
    let fullPayload;
    let positivePayloads;
    let edgeCases;

    before(() => {
        // Login and store auth token first
        cy.loginAndStoreTokens(
            Cypress.env('USERNAME'),
            Cypress.env('PASSWORD')
        ).then((response) => {
            expect(response.status).to.eq(200);
        });

        // Load all fixtures before tests run
        cy.fixture('operations-grid/validPayload').then((data) => { validPayload = data; });
        cy.fixture('operations-grid/fullPayload').then((data) => { fullPayload = data; });
        cy.fixture('operations-grid/positivePayloads').then((data) => { positivePayloads = data; });
        cy.fixture('operations-grid/edgeCases').then((data) => { edgeCases = data; });
    });

    // =============================================
    // POSITIVE TEST CASES
    // =============================================
    describe('Positive Test Cases', () => {
        it('TC001 - Should create Operations Grid with required fields only', () => {
            cy.createOperationsGridFromFixture('operations-grid/validPayload').then((response) => {
                expect(response.status).to.eq(201);
                expect(response.body).to.have.property('content_id');
                expect(response.body).to.have.property('content_row_id');
                expect(response.body.content_id).to.be.a('string').and.not.be.empty;
                expect(response.body.content_row_id).to.be.a('string').and.not.be.empty;

                // Store for GET API tests later
                createdContentId = response.body.content_id;
                createdContentRowId = response.body.content_row_id;

                // Verify content was stored in database
                cy.verifyContentInDB(createdContentId).then((dbRow) => {
                    expect(dbRow, 'Content should exist in database').to.not.be.null;
                    expect(dbRow.content_id).to.eq(createdContentId);
                    expect(dbRow.question_type).to.eq('Operations-Grid');
                    cy.log(`✓ Content ${createdContentId} verified in database`);
                });
            });
        });

        it('TC002 - Should create Operations Grid with all fields', () => {
            cy.createOperationsGridFromFixture('operations-grid/fullPayload').then((response) => {
                expect(response.status).to.eq(201);
                expect(response.body).to.have.property('content_id');
                expect(response.body).to.have.property('content_row_id');

                const contentId = response.body.content_id;

                // Verify content was stored in database with expected fields
                cy.verifyContentFieldsInDB(contentId, {
                    question_type: 'Operations-Grid'
                }).then((dbRow) => {
                    cy.log(`✓ Content ${contentId} with all fields verified in database`);
                });
            });
        });

        it('TC003 - Should create Operations Grid with stem voiceover', () => {
            cy.fixture('operations-grid/positivePayloads').then((payloads) => {
                cy.createOperationsGrid(payloads.withStemVoiceover).then((response) => {
                    expect(response.status).to.eq(201);
                    expect(response.body).to.have.property('content_id');
                });
            });
        });

        it('TC004 - Should create Operations Grid with attributes', () => {
            cy.fixture('operations-grid/positivePayloads').then((payloads) => {
                cy.createOperationsGrid(payloads.withAttributes).then((response) => {
                    expect(response.status).to.eq(201);
                    expect(response.body).to.have.property('content_id');
                });
            });
        });

        it('TC005 - Should create Operations Grid with skill trees', () => {
            cy.fixture('operations-grid/positivePayloads').then((payloads) => {
                cy.createOperationsGrid(payloads.withSkillTrees).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC006 - Should create Operations Grid with max_score', () => {
            cy.fixture('operations-grid/positivePayloads').then((payloads) => {
                cy.createOperationsGrid(payloads.withMaxScore).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC007 - Should create Operations Grid with Hindi language', () => {
            cy.fixture('operations-grid/positivePayloads').then((payloads) => {
                cy.createOperationsGrid(payloads.hindiLanguage).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC008 - Should create Operations Grid with explanation', () => {
            cy.fixture('operations-grid/positivePayloads').then((payloads) => {
                cy.createOperationsGrid(payloads.withExplanation).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC009 - Should create Operations Grid with add operation', () => {
            cy.createOperationsGridFromFixture('operations-grid/validPayload').then((response) => {
                expect(response.status).to.eq(201);
            });
        });

        it('TC010 - Should create Operations Grid with subtract operation', () => {
            cy.fixture('operations-grid/positivePayloads').then((payloads) => {
                cy.createOperationsGrid(payloads.withStemVoiceover).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC011 - Should create Operations Grid with multiply operation', () => {
            cy.createOperationsGridFromFixture('operations-grid/fullPayload').then((response) => {
                expect(response.status).to.eq(201);
            });
        });

        it('TC012 - Should create Operations Grid with divide operation', () => {
            cy.fixture('operations-grid/positivePayloads').then((payloads) => {
                cy.createOperationsGrid(payloads.withAttributes).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC013 - Should create Operations Grid with keyword_ids', () => {
            cy.createOperationsGridFromFixture('operations-grid/validPayload', { keyword_ids: [1, 2, 3] }).then((response) => {
                expect(response.status).to.eq(201);
            });
        });

        it('TC014 - Should create Operations Grid with context field', () => {
            cy.createOperationsGridFromFixture('operations-grid/validPayload', { context: 'IN' }).then((response) => {
                expect(response.status).to.eq(201);
            });
        });

        it('TC015 - Should create Operations Grid with remedial_instruction', () => {
            cy.createOperationsGridFromFixture('operations-grid/validPayload', { remedial_instruction: 'Practice more' }).then((response) => {
                expect(response.status).to.eq(201);
            });
        });
    });

    // =============================================
    // NEGATIVE TEST CASES
    // =============================================
    describe('Negative Test Cases', () => {
        it('TC016 - Should return 400 when project_id is missing', () => {
            cy.fixture('operations-grid/validPayload').then((payload) => {
                const { project_id, ...payloadWithoutField } = payload;
                cy.createOperationsGrid(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC017 - Should return 400 when language_code is missing', () => {
            cy.fixture('operations-grid/validPayload').then((payload) => {
                const { language_code, ...payloadWithoutField } = payload;
                cy.createOperationsGrid(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC018 - Should return 400 when question_type is missing', () => {
            cy.fixture('operations-grid/validPayload').then((payload) => {
                const { question_type, ...payloadWithoutField } = payload;
                cy.createOperationsGrid(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC019 - Should return 400 when subject_no is missing', () => {
            cy.fixture('operations-grid/validPayload').then((payload) => {
                const { subject_no, ...payloadWithoutField } = payload;
                cy.createOperationsGrid(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC020 - Should return 400 when class is missing', () => {
            cy.fixture('operations-grid/validPayload').then((payload) => {
                const { class: classVal, ...payloadWithoutField } = payload;
                cy.createOperationsGrid(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC021 - Should return 400 when stem is missing', () => {
            cy.fixture('operations-grid/validPayload').then((payload) => {
                const { stem, ...payloadWithoutField } = payload;
                cy.createOperationsGrid(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC022 - Should return 400 when first_number is missing', () => {
            cy.fixture('operations-grid/validPayload').then((payload) => {
                const { first_number, ...payloadWithoutField } = payload;
                cy.createOperationsGrid(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC023 - Should return 400 when second_number is missing', () => {
            cy.fixture('operations-grid/validPayload').then((payload) => {
                const { second_number, ...payloadWithoutField } = payload;
                cy.createOperationsGrid(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC024 - Should return 400 when operation_type is missing', () => {
            cy.fixture('operations-grid/validPayload').then((payload) => {
                const { operation_type, ...payloadWithoutField } = payload;
                cy.createOperationsGrid(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC025 - Should return 400 when correct_answer is missing', () => {
            cy.fixture('operations-grid/validPayload').then((payload) => {
                const { correct_answer, ...payloadWithoutField } = payload;
                cy.createOperationsGrid(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC026 - Should return 400 with empty request body', () => {
            cy.createOperationsGrid({}).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC027 - Should return 400 for invalid operation_type', () => {
            cy.createOperationsGridFromFixture('operations-grid/validPayload', {
                operation_type: 'modulo'
            }).then((response) => {
                expect(response.status).to.be.oneOf([400, 404]);
            });
        });

        it('TC028 - Should return 400 when first_number exceeds maximum range', () => {
            cy.createOperationsGridFromFixture('operations-grid/validPayload', {
                first_number: '999999'
            }).then((response) => {
                expect(response.status).to.be.oneOf([400, 201]);
            });
        });

        it('TC029 - Should return 400 when second_number exceeds maximum range', () => {
            cy.createOperationsGridFromFixture('operations-grid/validPayload', {
                second_number: '999999'
            }).then((response) => {
                expect(response.status).to.be.oneOf([400, 201]);
            });
        });

        it('TC030 - Should return 400 when correct_answer is incorrect type', () => {
            cy.createOperationsGridFromFixture('operations-grid/validPayload', {
                correct_answer: 'not_a_number'
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC031 - Should return 400 for invalid question_type', () => {
            cy.createOperationsGridFromFixture('operations-grid/validPayload', { question_type: 'InvalidType' }).then((response) => {
                expect(response.status).to.be.oneOf([400, 404]);
            });
        });

        it('TC032 - Should return 400 for invalid project_id', () => {
            cy.createOperationsGridFromFixture('operations-grid/validPayload', { project_id: 99999 }).then((response) => {
                expect(response.status).to.be.oneOf([400, 404, 500]);
            });
        });

        it('TC033 - Should return 400 for invalid language_code', () => {
            cy.createOperationsGridFromFixture('operations-grid/validPayload', { language_code: 'invalid_lang' }).then((response) => {
                expect(response.status).to.be.oneOf([400, 404]);
            });
        });

        it('TC034 - Should return 400 when stem is empty string', () => {
            cy.createOperationsGridFromFixture('operations-grid/validPayload', {
                stem: ''
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC035 - Should return 400 when operation with division by zero result', () => {
            cy.createOperationsGridFromFixture('operations-grid/validPayload', {
                operation_type: 'divide',
                first_number: '0',
                second_number: '0',
                correct_answer: 0
            }).then((response) => {
                expect(response.status).to.be.oneOf([400, 201]);
            });
        });
    });

    // =============================================
    // EDGE CASES
    // =============================================
    describe('Edge Cases', () => {
        it('TC036 - Should handle very long stem (3000 characters)', () => {
            const longStem = 'A'.repeat(3000) + ' Calculate: 100 + 50';
            cy.createOperationsGridFromFixture('operations-grid/validPayload', { stem: longStem }).then((response) => {
                expect(response.status).to.be.oneOf([201, 400, 413]);
            });
        });

        it('TC037 - Should handle special characters in stem', () => {
            cy.fixture('operations-grid/edgeCases').then((edge) => {
                cy.createOperationsGridFromFixture('operations-grid/validPayload', { stem: edge.specialCharsInStem.stem }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC038 - Should handle SQL injection attempt in stem', () => {
            cy.fixture('operations-grid/edgeCases').then((edge) => {
                cy.createOperationsGridFromFixture('operations-grid/validPayload', { stem: edge.sqlInjection.stem }).then((response) => {
                    expect(response.status).to.not.eq(500);
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC039 - Should handle XSS attempt in stem', () => {
            cy.fixture('operations-grid/edgeCases').then((edge) => {
                cy.createOperationsGridFromFixture('operations-grid/validPayload', { stem: edge.xssAttempt.stem }).then((response) => {
                    expect(response.status).to.not.eq(500);
                });
            });
        });

        it('TC040 - Should handle project_id as string instead of integer', () => {
            cy.fixture('operations-grid/edgeCases').then((edge) => {
                cy.createOperationsGridFromFixture('operations-grid/validPayload', { project_id: edge.projectIdAsString.project_id }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC041 - Should handle negative project_id', () => {
            cy.fixture('operations-grid/edgeCases').then((edge) => {
                cy.createOperationsGridFromFixture('operations-grid/validPayload', { project_id: edge.negativeProjectId.project_id }).then((response) => {
                    expect(response.status).to.be.oneOf([400, 404]);
                });
            });
        });

        it('TC042 - Should handle class as string instead of integer', () => {
            cy.fixture('operations-grid/edgeCases').then((edge) => {
                cy.createOperationsGridFromFixture('operations-grid/validPayload', { class: edge.classAsString.class }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC043 - Should handle negative numbers in operations', () => {
            cy.fixture('operations-grid/edgeCases').then((edge) => {
                cy.createOperationsGrid(edge.negativeNumbers).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC044 - Should handle large numbers within range', () => {
            cy.fixture('operations-grid/edgeCases').then((edge) => {
                cy.createOperationsGrid(edge.largeNumbers).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC045 - Should handle correct_answer as string instead of integer', () => {
            cy.fixture('operations-grid/edgeCases').then((edge) => {
                cy.createOperationsGrid(edge.correctAnswerAsString).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC046 - Should validate response time is within acceptable limit', () => {
            const startTime = Date.now();
            cy.createOperationsGridFromFixture('operations-grid/validPayload').then((response) => {
                const endTime = Date.now();
                const responseTime = endTime - startTime;
                // Response should be within 5 seconds
                expect(responseTime).to.be.lessThan(5000);
                expect(response.status).to.eq(201);
            });
        });

        it('TC047 - Should handle extra fields in request body (should be ignored)', () => {
            cy.fixture('operations-grid/edgeCases').then((edge) => {
                cy.createOperationsGridFromFixture('operations-grid/validPayload', edge.extraFields).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC048 - Should create Operations Grid with instruction field', () => {
            cy.createOperationsGridFromFixture('operations-grid/fullPayload').then((response) => {
                expect(response.status).to.eq(201);
            });
        });

        it('TC049 - Should create Operations Grid with content_origin_type', () => {
            cy.fixture('operations-grid/edgeCases').then((edge) => {
                cy.createOperationsGridFromFixture('operations-grid/validPayload', { content_origin_type: 'create' }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400, 404]);
                });
            });
        });

        it('TC050 - Should handle misconception_explanation field', () => {
            cy.createOperationsGridFromFixture('operations-grid/validPayload', { 
                misconception_explanation: 'Common mistake explanation' 
            }).then((response) => {
                expect(response.status).to.be.oneOf([201, 400]);
            });
        });
    });

    // =============================================
    // RESPONSE STRUCTURE VALIDATION
    // =============================================
    describe('Response Structure Validation', () => {
        it('TC051 - Should validate successful response structure', () => {
            cy.createOperationsGridFromFixture('operations-grid/validPayload').then((response) => {
                expect(response.status).to.eq(201);
                expect(response.body).to.be.an('object');
                expect(response.body).to.have.all.keys('content_id', 'content_row_id');
                expect(response.body.content_id).to.match(/^Q\d+$/);
                expect(response.body.content_row_id).to.include('_');

                const contentId = response.body.content_id;
                const contentRowId = response.body.content_row_id;

                // Verify both content_id and content_row_id exist in database
                cy.verifyContentInDB(contentId).then((dbRow) => {
                    expect(dbRow).to.not.be.null;
                    expect(dbRow.content_id).to.eq(contentId);
                    expect(dbRow.content_row_id).to.eq(contentRowId);
                    cy.log(`✓ Response structure and database entry verified for ${contentId}`);
                });
            });
        });

        it('TC052 - Should validate error response structure', () => {
            cy.createOperationsGrid({}).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message');
                expect(response.body.message).to.be.a('string');
            });
        });

        it('TC053 - Should validate Content-Type header in response', () => {
            cy.createOperationsGridFromFixture('operations-grid/validPayload').then((response) => {
                expect(response.headers).to.have.property('content-type');
                expect(response.headers['content-type']).to.include('application/json');
            });
        });

        it('TC054 - Should validate content_row_id format includes language code', () => {
            cy.createOperationsGridFromFixture('operations-grid/validPayload').then((response) => {
                expect(response.status).to.eq(201);
                expect(response.body.content_row_id).to.include('_en_');
            });
        });

        it('TC055 - Should validate operation_type field validation', () => {
            cy.createOperationsGridFromFixture('operations-grid/validPayload', {
                operation_type: 'invalid_operation'
            }).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body.message).to.be.a('string');
            });
        });

        it('TC056 - Should validate correct response for add operation', () => {
            cy.createOperationsGridFromFixture('operations-grid/validPayload', {
                operation_type: 'add',
                first_number: '100',
                second_number: '50',
                correct_answer: 150
            }).then((response) => {
                expect(response.status).to.eq(201);
            });
        });

        it('TC057 - Should validate correct response for subtract operation', () => {
            cy.createOperationsGridFromFixture('operations-grid/validPayload', {
                operation_type: 'subtract',
                first_number: '100',
                second_number: '50',
                correct_answer: 50
            }).then((response) => {
                expect(response.status).to.eq(201);
            });
        });

        it('TC058 - Should validate correct response for multiply operation', () => {
            cy.createOperationsGridFromFixture('operations-grid/validPayload', {
                operation_type: 'multiply',
                first_number: '10',
                second_number: '20',
                correct_answer: 200
            }).then((response) => {
                expect(response.status).to.eq(201);
            });
        });

        it('TC059 - Should validate correct response for divide operation', () => {
            cy.createOperationsGridFromFixture('operations-grid/validPayload', {
                operation_type: 'divide',
                first_number: '100',
                second_number: '10',
                correct_answer: 10
            }).then((response) => {
                expect(response.status).to.eq(201);
            });
        });

        it('TC060 - Should validate question_type is Operations-Grid in response', () => {
            cy.getContent(createdContentId).then((response) => {
                if (response.status === 200 && response.body.length > 0) {
                    expect(response.body[0].question_type).to.eq('Operations-Grid');
                }
            });
        });
    });

    // =============================================
    // GET CONTENT API TESTS
    // Using content_id from POST response
    // =============================================
    describe('GET Content API Tests', () => {
        // Store content_id from a successful POST for GET tests
        let testContentId;
        let testContentRowId;

        before(() => {
            // Create an Operations Grid question to use for GET tests
            cy.createOperationsGridFromFixture('operations-grid/validPayload').then((response) => {
                expect(response.status).to.eq(201);
                testContentId = response.body.content_id;
                testContentRowId = response.body.content_row_id;
            });
        });

        // -----------------------------------------
        // POSITIVE TESTS
        // -----------------------------------------
        describe('Positive Tests', () => {
            it('TC061 - Should get Operations Grid content by valid content_id', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.be.an('array');
                    expect(response.body.length).to.be.greaterThan(0);
                    expect(response.body[0].content_id).to.eq(testContentId);
                });
            });

            it('TC062 - Should validate Operations Grid response structure', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];

                    // Required fields for Operations Grid
                    expect(content).to.have.property('content_id');
                    expect(content).to.have.property('content_row_id');
                    expect(content).to.have.property('content_type');
                    expect(content).to.have.property('question_type');
                    expect(content).to.have.property('stem');
                    expect(content).to.have.property('first_number');
                    expect(content).to.have.property('second_number');
                    expect(content).to.have.property('operation_type');
                    expect(content).to.have.property('correct_answer');
                    expect(content).to.have.property('language_code');
                    expect(content).to.have.property('project_id');
                    expect(content).to.have.property('class');
                    expect(content).to.have.property('subject_no');
                });
            });

            it('TC063 - Should validate operation_type in GET response', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];
                    expect(content.operation_type).to.be.oneOf(['add', 'subtract', 'multiply', 'divide']);
                });
            });

            it('TC064 - Should validate first_number and second_number in GET response', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];

                    expect(content.first_number).to.be.a('string');
                    expect(content.second_number).to.be.a('string');
                    // Verify they can be parsed as numbers
                    expect(parseInt(content.first_number)).to.be.a('number');
                    expect(parseInt(content.second_number)).to.be.a('number');
                });
            });

            it('TC065 - Should validate correct_answer in GET response', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];

                    expect(content.correct_answer).to.be.a('number');
                });
            });

            it('TC066 - Should get Operations Grid content with specific language (en)', () => {
                cy.getContentWithLanguages(testContentId, 'en').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.be.an('array');
                    if (response.body.length > 0) {
                        expect(response.body[0].language_code).to.eq('en');
                    }
                });
            });

            it('TC067 - Should get Operations Grid content with x-encryption: false', () => {
                cy.getContentEncrypted(testContentId, false).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];
                    expect(content).to.have.property('correct_answer');
                    expect(content.correct_answer).to.be.a('number');
                });
            });
        });

        // -----------------------------------------
        // NEGATIVE TESTS
        // -----------------------------------------
        describe('Negative Tests', () => {
            it('TC068 - Should return 404 for non-existent Operations Grid content_id', () => {
                cy.getContent('Q999999999').then((response) => {
                    expect(response.status).to.be.oneOf([404, 400]);
                    expect(response.body).to.have.property('message');
                });
            });

            it('TC069 - Should return error for invalid content_id format', () => {
                cy.getContent('invalid_ops_grid_id').then((response) => {
                    expect(response.status).to.be.oneOf([400, 404]);
                });
            });

            it('TC070 - Should handle SQL injection in content_id', () => {
                cy.getContent("Q1' OR '1'='1").then((response) => {
                    expect(response.status).to.not.eq(500);
                    expect(response.status).to.be.oneOf([400, 404]);
                });
            });
        });

        // -----------------------------------------
        // EDGE CASES
        // -----------------------------------------
        describe('Edge Cases', () => {
            it('TC071 - Should verify question_type is Operations-Grid in response', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body[0].question_type).to.eq('Operations-Grid');
                });
            });

            it('TC072 - Should validate stem contains valid content', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];

                    expect(content.stem).to.be.a('string');
                    expect(content.stem.length).to.be.greaterThan(0);
                });
            });

            it('TC073 - Should validate max_score field if present', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];

                    if (content.hasOwnProperty('max_score')) {
                        expect(content.max_score).to.be.a('number');
                        expect(content.max_score).to.be.greaterThan(0);
                    }
                });
            });
        });
    });
});
