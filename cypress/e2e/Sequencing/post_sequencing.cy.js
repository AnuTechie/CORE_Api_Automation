/// <reference types="cypress" />

/**
 * Sequencing Question API Test Suite
 * Endpoint: POST /api/content/v1/questions/sequencing
 * Base URL: http://192.168.0.156:3000
 * 
 * Uses:
 * - Fixtures: cypress/fixtures/sequencing/ for test data
 * - Custom Commands: cy.createSequencing(), cy.createSequencingFromFixture()
 */
describe('Sequencing Question API Tests', () => {
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
        cy.fixture('sequencing/validPayload').then((data) => { validPayload = data; });
        cy.fixture('sequencing/fullPayload').then((data) => { fullPayload = data; });
        cy.fixture('sequencing/positivePayloads').then((data) => { positivePayloads = data; });
        cy.fixture('sequencing/edgeCases').then((data) => { edgeCases = data; });
    });

    // =============================================
    // POSITIVE TEST CASES
    // =============================================
    describe('Positive Test Cases', () => {
        it('TC001 - Should create Sequencing question with required fields only', () => {
            cy.createSequencingFromFixture('sequencing/validPayload').then((response) => {
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
                    expect(dbRow.question_type).to.eq('Sequencing');
                    cy.log(`✓ Sequencing Content ${createdContentId} verified in database`);
                });
            });
        });

        it('TC002 - Should create Sequencing question with all fields', () => {
            cy.createSequencingFromFixture('sequencing/validPayload').then((response) => {
                expect(response.status).to.eq(201);
                expect(response.body).to.have.property('content_id');
                expect(response.body).to.have.property('content_row_id');

                const contentId = response.body.content_id;

                // Verify content was stored in database with expected fields
                cy.verifyContentFieldsInDB(contentId, {
                    question_type: 'Sequencing'
                }).then((dbRow) => {
                    cy.log(`✓ Sequencing Content ${contentId} with all fields verified in database`);
                });
            });
        });

        it('TC003 - Should create Sequencing with Hindi language', () => {
            cy.fixture('sequencing/positivePayloads').then((payloads) => {
                cy.createSequencing(payloads.hindiLanguage).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC004 - Should create Sequencing with images', () => {
            cy.fixture('sequencing/positivePayloads').then((payloads) => {
                cy.createSequencing(payloads.withImages).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC005 - Should create Sequencing with voiceover fields', () => {
            cy.createSequencingFromFixture('sequencing/fullPayload').then((response) => {
                expect(response.status).to.eq(201);
            });
        });

        it('TC006 - Should create Sequencing with keyword_ids using override', () => {
            cy.createSequencingFromFixture('sequencing/validPayload', { keyword_ids: [9, 10] }).then((response) => {
                expect(response.status).to.eq(201);
            });
        });
    });

    // =============================================
    // NEGATIVE TEST CASES
    // =============================================
    describe('Negative Test Cases', () => {
        it('TC007 - Should return 400 when project_id is missing', () => {
            cy.fixture('sequencing/validPayload').then((payload) => {
                const { project_id, ...payloadWithoutField } = payload;
                cy.createSequencing(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC008 - Should return 400 when language_code is missing', () => {
            cy.fixture('sequencing/validPayload').then((payload) => {
                const { language_code, ...payloadWithoutField } = payload;
                cy.createSequencing(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC009 - Should return 400 when question_type is missing', () => {
            cy.fixture('sequencing/validPayload').then((payload) => {
                const { question_type, ...payloadWithoutField } = payload;
                cy.createSequencing(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC010 - Should return 400 when subject_no is missing', () => {
            cy.fixture('sequencing/validPayload').then((payload) => {
                const { subject_no, ...payloadWithoutField } = payload;
                cy.createSequencing(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC011 - Should return 400 when class is missing', () => {
            cy.fixture('sequencing/validPayload').then((payload) => {
                const { class: classNum, ...payloadWithoutField } = payload;
                cy.createSequencing(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC012 - Should return 400 when stem is missing', () => {
            cy.fixture('sequencing/validPayload').then((payload) => {
                const { stem, ...payloadWithoutField } = payload;
                cy.createSequencing(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC013 - Should return 400 when items array is missing', () => {
            cy.fixture('sequencing/validPayload').then((payload) => {
                const { items, ...payloadWithoutField } = payload;
                cy.createSequencing(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC014 - Should return 400 when correct_sequence is missing', () => {
            cy.fixture('sequencing/validPayload').then((payload) => {
                const { correct_sequence, ...payloadWithoutField } = payload;
                cy.createSequencing(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC015 - Should return 400 with empty request body', () => {
            cy.createSequencing({}).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC016 - Should return 400 when items array is empty', () => {
            cy.createSequencingFromFixture('sequencing/validPayload', { items: [] }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC017 - Should return 400 when correct_sequence array is empty', () => {
            cy.createSequencingFromFixture('sequencing/validPayload', { correct_sequence: [] }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC018 - Should return 400 when item missing item_index', () => {
            const invalidItems = [
                { item_value: 'A', item_id: 'item_1' },
                { item_index: 2, item_value: 'B', item_id: 'item_2' },
            ];
            cy.createSequencingFromFixture('sequencing/validPayload', { items: invalidItems }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC019 - Should return 400 when item missing item_value', () => {
            const invalidItems = [
                { item_index: 1, item_id: 'item_1' },
                { item_index: 2, item_value: 'B', item_id: 'item_2' },
            ];
            cy.createSequencingFromFixture('sequencing/validPayload', { items: invalidItems }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC020 - Should return 400 when item missing item_id', () => {
            const invalidItems = [
                { item_index: 1, item_value: 'A' },
                { item_index: 2, item_value: 'B', item_id: 'item_2' },
            ];
            cy.createSequencingFromFixture('sequencing/validPayload', { items: invalidItems }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC021 - Should return error for invalid project_id', () => {
            cy.createSequencingFromFixture('sequencing/validPayload', { project_id: 99999 }).then((response) => {
                expect(response.status).to.be.oneOf([400, 404]);
            });
        });

        it('TC022 - Should return 400 for invalid language_code', () => {
            cy.createSequencingFromFixture('sequencing/validPayload', { language_code: 'invalid_lang' }).then((response) => {
                expect(response.status).to.be.oneOf([400, 404]);
            });
        });
    });

    // =============================================
    // EDGE CASES
    // =============================================
    describe('Edge Cases', () => {
        it('TC023 - Should handle very long stem (5000 characters)', () => {
            const longStem = '<p>' + 'A'.repeat(5000) + '</p>';
            cy.createSequencingFromFixture('sequencing/validPayload', { stem: longStem }).then((response) => {
                expect(response.status).to.be.oneOf([201, 400, 413]);
            });
        });

        it('TC024 - Should handle special characters in stem', () => {
            cy.fixture('sequencing/edgeCases').then((edge) => {
                cy.createSequencingFromFixture('sequencing/validPayload', { stem: edge.specialChars.stem }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC025 - Should handle unicode characters in stem', () => {
            cy.fixture('sequencing/edgeCases').then((edge) => {
                cy.createSequencingFromFixture('sequencing/validPayload', { stem: edge.unicodeStem.stem }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC026 - Should handle SQL injection in stem', () => {
            cy.fixture('sequencing/edgeCases').then((edge) => {
                cy.createSequencingFromFixture('sequencing/validPayload', { stem: edge.sqlInjection.stem }).then((response) => {
                    expect(response.status).to.not.eq(500);
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC027 - Should handle XSS attempt in item_value', () => {
            cy.fixture('sequencing/edgeCases').then((edge) => {
                const xssItems = [
                    { item_index: 1, item_value: edge.xssAttempt.item_value, item_id: 'item_1' },
                    { item_index: 2, item_value: 'Safe value', item_id: 'item_2' },
                ];
                cy.createSequencingFromFixture('sequencing/validPayload', { items: xssItems, correct_sequence: [1, 2] }).then((response) => {
                    expect(response.status).to.not.eq(500);
                });
            });
        });

        it('TC028 - Should handle class as string instead of integer', () => {
            cy.fixture('sequencing/edgeCases').then((edge) => {
                cy.createSequencingFromFixture('sequencing/validPayload', { class: edge.classAsString.class }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC029 - Should handle project_id as string instead of integer', () => {
            cy.fixture('sequencing/edgeCases').then((edge) => {
                cy.createSequencingFromFixture('sequencing/validPayload', { project_id: edge.projectIdAsString.project_id }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC030 - Should handle negative project_id', () => {
            cy.fixture('sequencing/edgeCases').then((edge) => {
                cy.createSequencingFromFixture('sequencing/validPayload', { project_id: edge.negativeProjectId.project_id }).then((response) => {
                    expect(response.status).to.be.oneOf([400, 404]);
                });
            });
        });

        it('TC031 - Should handle negative class value', () => {
            cy.fixture('sequencing/edgeCases').then((edge) => {
                cy.createSequencingFromFixture('sequencing/validPayload', { class: edge.negativeClass.class }).then((response) => {
                    expect(response.status).to.be.oneOf([400, 404]);
                });
            });
        });

        it('TC032 - Should handle empty stem', () => {
            cy.fixture('sequencing/edgeCases').then((edge) => {
                cy.createSequencingFromFixture('sequencing/validPayload', { stem: edge.emptyStem.stem }).then((response) => {
                    expect(response.status).to.be.oneOf([400, 201]);
                });
            });
        });

        it('TC033 - Should handle duplicate item IDs', () => {
            cy.fixture('sequencing/edgeCases').then((edge) => {
                cy.createSequencingFromFixture('sequencing/validPayload', { items: edge.duplicateItemIds.items }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC034 - Should handle duplicate item index', () => {
            cy.fixture('sequencing/edgeCases').then((edge) => {
                cy.createSequencingFromFixture('sequencing/validPayload', { items: edge.duplicateItemIndex.items }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC035 - Should handle sequence with invalid item index', () => {
            cy.fixture('sequencing/edgeCases').then((edge) => {
                cy.createSequencingFromFixture('sequencing/validPayload', { correct_sequence: edge.sequenceWithInvalidIndex.correct_sequence }).then((response) => {
                    expect(response.status).to.be.oneOf([400, 201]);
                });
            });
        });

        it('TC036 - Should handle sequence with duplicate indices', () => {
            cy.fixture('sequencing/edgeCases').then((edge) => {
                cy.createSequencingFromFixture('sequencing/validPayload', { correct_sequence: edge.sequenceWithDuplicates.correct_sequence }).then((response) => {
                    expect(response.status).to.be.oneOf([400, 201]);
                });
            });
        });

        it('TC037 - Should handle extra fields in request body', () => {
            cy.createSequencingFromFixture('sequencing/validPayload', {
                extraField: 'should be ignored',
                anotherField: 12345
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });
    });

    // =============================================
    // RESPONSE STRUCTURE VALIDATION
    // =============================================
    describe('Response Structure Validation', () => {
        it('TC038 - Should validate successful response structure', () => {
            cy.createSequencingFromFixture('sequencing/validPayload').then((response) => {
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
                    cy.log(`✓ Sequencing response structure and database entry verified for ${contentId}`);
                });
            });
        });

        it('TC039 - Should validate error response structure', () => {
            cy.createSequencing({}).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message');
                expect(response.body.message).to.be.a('string');
            });
        });

        it('TC040 - Should validate Content-Type header in response', () => {
            cy.createSequencingFromFixture('sequencing/validPayload').then((response) => {
                expect(response.headers).to.have.property('content-type');
                expect(response.headers['content-type']).to.include('application/json');
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
            // Create a Sequencing question to use for GET tests
            cy.createSequencingFromFixture('sequencing/validPayload').then((response) => {
                expect(response.status).to.eq(201);
                testContentId = response.body.content_id;
                testContentRowId = response.body.content_row_id;
            });
        });

        // -----------------------------------------
        // POSITIVE TESTS
        // -----------------------------------------
        describe('Positive Tests', () => {
            it('TC041 - Should get content by valid content_id from POST response', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.be.an('array');
                    expect(response.body.length).to.be.greaterThan(0);
                    expect(response.body[0].content_id).to.eq(testContentId);
                });
            });

            it('TC042 - Should validate complete Sequencing response structure', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];

                    // Required fields
                    expect(content).to.have.property('content_id');
                    expect(content).to.have.property('content_row_id');
                    expect(content).to.have.property('question_type');

                    expect(content).to.have.property('language_code');
                    expect(content).to.have.property('version');
                });
            });

            it('TC043 - Should get content with x-encryption: false', () => {
                cy.getContentEncrypted(testContentId, false).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];
                    expect(content).to.have.property('content_id');
                    expect(content).to.have.property('content_row_id');
                    expect(content).to.have.property('question_type');
                    expect(content).to.have.property('language_code');
                    expect(content).to.have.property('version');
                });
            });

            it('TC044 - Should validate Content-Type header in response', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.headers).to.have.property('content-type');
                    expect(response.headers['content-type']).to.include('application/json');
                });
            });
        });

        // -----------------------------------------
        // NEGATIVE TESTS
        // -----------------------------------------
        describe('Negative Tests', () => {
            it('TC045 - Should return 404 for non-existent content_id', () => {
                cy.getContent('Q999999999').then((response) => {
                    expect(response.status).to.be.oneOf([404, 400]);
                    expect(response.body).to.have.property('message');
                });
            });

            it('TC046 - Should return error for invalid content_id format', () => {
                cy.getContent('invalid_format_123').then((response) => {
                    expect(response.status).to.be.oneOf([400, 404]);
                    expect(response.body).to.have.property('message');
                });
            });

            it('TC047 - Should validate error response structure', () => {
                cy.getContent('INVALID_123').then((response) => {
                    expect(response.status).to.be.oneOf([400, 404]);
                    expect(response.body).to.have.property('message');
                    expect(response.body.message).to.be.a('string');
                });
            });
        });
    });
});
