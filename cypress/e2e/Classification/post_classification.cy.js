/// <reference types="cypress" />

/**
 * Classification Question API Test Suite
 * Endpoint: POST /api/content/v1/questions/classification
 * Base URL: http://192.168.0.156:3000
 * 
 * Uses:
 * - Fixtures: cypress/fixtures/classification/ for test data
 * - Custom Commands: cy.createClassification(), cy.createClassificationFromFixture()
 */
describe('Classification Question API Tests', () => {
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
        cy.fixture('classification/validPayload').then((data) => { validPayload = data; });
        cy.fixture('classification/fullPayload').then((data) => { fullPayload = data; });
        cy.fixture('classification/positivePayloads').then((data) => { positivePayloads = data; });
        cy.fixture('classification/edgeCases').then((data) => { edgeCases = data; });
    });

    // =============================================
    // POSITIVE TEST CASES
    // =============================================
    describe('Positive Test Cases', () => {
        it('TC001 - Should create Classification question with required fields only', () => {
            cy.createClassificationFromFixture('classification/validPayload').then((response) => {
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
                    expect(dbRow.question_type).to.eq('Classification');
                    cy.log(`✓ Classification Content ${createdContentId} verified in database`);
                });
            });
        });

        it('TC002 - Should create Classification question with all fields', () => {
            cy.createClassificationFromFixture('classification/fullPayload').then((response) => {
                expect(response.status).to.eq(201);
                expect(response.body).to.have.property('content_id');
                expect(response.body).to.have.property('content_row_id');

                const contentId = response.body.content_id;

                // Verify content was stored in database with expected fields
                cy.verifyContentFieldsInDB(contentId, {
                    question_type: 'Classification'
                }).then((dbRow) => {
                    cy.log(`✓ Classification Content ${contentId} with all fields verified in database`);
                });
            });
        });

        it('TC003 - Should create Classification with 2 categories (minimum)', () => {
            cy.fixture('classification/positivePayloads').then((payloads) => {
                cy.createClassification(payloads.twoCategories).then((response) => {
                    expect(response.status).to.eq(201);
                    expect(response.body).to.have.property('content_id');
                });
            });
        });

        it('TC004 - Should create Classification with 5 categories', () => {
            cy.fixture('classification/positivePayloads').then((payloads) => {
                cy.createClassification(payloads.fiveCategories).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC005 - Should create Classification with Hindi language', () => {
            cy.fixture('classification/positivePayloads').then((payloads) => {
                cy.createClassification(payloads.hindiLanguage).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC006 - Should create Classification with images', () => {
            cy.fixture('classification/positivePayloads').then((payloads) => {
                cy.createClassification(payloads.withImages).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC007 - Should create Classification with empty category allowed', () => {
            cy.fixture('classification/positivePayloads').then((payloads) => {
                cy.createClassification(payloads.emptyCategoryAllowed).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC008 - Should create Classification with shuffle enabled', () => {
            cy.createClassificationFromFixture('classification/validPayload', { shuffle: true }).then((response) => {
                expect(response.status).to.eq(201);
            });
        });

        it('TC009 - Should create Classification with voiceover fields', () => {
            cy.createClassificationFromFixture('classification/fullPayload').then((response) => {
                expect(response.status).to.eq(201);
            });
        });

        it('TC010 - Should create Classification with keyword_ids using override', () => {
            cy.createClassificationFromFixture('classification/validPayload', { keyword_ids: [1, 2, 3] }).then((response) => {
                expect(response.status).to.eq(201);
            });
        });
    });

    // =============================================
    // NEGATIVE TEST CASES
    // =============================================
    describe('Negative Test Cases', () => {
        it('TC011 - Should return 400 when project_id is missing', () => {
            cy.fixture('classification/validPayload').then((payload) => {
                const { project_id, ...payloadWithoutField } = payload;
                cy.createClassification(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC012 - Should return 400 when language_code is missing', () => {
            cy.fixture('classification/validPayload').then((payload) => {
                const { language_code, ...payloadWithoutField } = payload;
                cy.createClassification(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC013 - Should return 400 when question_type is missing', () => {
            cy.fixture('classification/validPayload').then((payload) => {
                const { question_type, ...payloadWithoutField } = payload;
                cy.createClassification(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC014 - Should return 400 when subject_no is missing', () => {
            cy.fixture('classification/validPayload').then((payload) => {
                const { subject_no, ...payloadWithoutField } = payload;
                cy.createClassification(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC015 - Should return 400 when class is missing', () => {
            cy.fixture('classification/validPayload').then((payload) => {
                const { class: classNum, ...payloadWithoutField } = payload;
                cy.createClassification(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC016 - Should return 400 when stem is missing', () => {
            cy.fixture('classification/validPayload').then((payload) => {
                const { stem, ...payloadWithoutField } = payload;
                cy.createClassification(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC017 - Should return 400 when categories array is missing', () => {
            cy.fixture('classification/validPayload').then((payload) => {
                const { categories, ...payloadWithoutField } = payload;
                cy.createClassification(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC018 - Should return 400 when items array is missing', () => {
            cy.fixture('classification/validPayload').then((payload) => {
                const { items, ...payloadWithoutField } = payload;
                cy.createClassification(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC019 - Should return 400 when correct_classification is missing', () => {
            cy.fixture('classification/validPayload').then((payload) => {
                const { correct_classification, ...payloadWithoutField } = payload;
                cy.createClassification(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC020 - Should return 400 with empty request body', () => {
            cy.createClassification({}).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC021 - Should return 400 when categories array is empty', () => {
            cy.createClassificationFromFixture('classification/validPayload', { categories: [] }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC022 - Should return 400 when items array is empty', () => {
            cy.createClassificationFromFixture('classification/validPayload', { items: [] }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC023 - Should return 400 when category missing category_index', () => {
            const invalidCategories = [
                { category_name: 'A', category_id: 'cat_1' },
                { category_index: 2, category_name: 'B', category_id: 'cat_2' },
            ];
            cy.createClassificationFromFixture('classification/validPayload', { categories: invalidCategories }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC024 - Should return 400 when category missing category_name', () => {
            const invalidCategories = [
                { category_index: 1, category_id: 'cat_1' },
                { category_index: 2, category_name: 'B', category_id: 'cat_2' },
            ];
            cy.createClassificationFromFixture('classification/validPayload', { categories: invalidCategories }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC025 - Should return 400 when category missing category_id', () => {
            const invalidCategories = [
                { category_index: 1, category_name: 'A' },
                { category_index: 2, category_name: 'B', category_id: 'cat_2' },
            ];
            cy.createClassificationFromFixture('classification/validPayload', { categories: invalidCategories }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC026 - Should return 400 when item missing item_index', () => {
            const invalidItems = [
                { item_value: 'A', item_id: 'item_1' },
                { item_index: 2, item_value: 'B', item_id: 'item_2' },
            ];
            cy.createClassificationFromFixture('classification/validPayload', { items: invalidItems }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC027 - Should return 400 when item missing item_value', () => {
            const invalidItems = [
                { item_index: 1, item_id: 'item_1' },
                { item_index: 2, item_value: 'B', item_id: 'item_2' },
            ];
            cy.createClassificationFromFixture('classification/validPayload', { items: invalidItems }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC028 - Should return 400 when item missing item_id', () => {
            const invalidItems = [
                { item_index: 1, item_value: 'A' },
                { item_index: 2, item_value: 'B', item_id: 'item_2' },
            ];
            cy.createClassificationFromFixture('classification/validPayload', { items: invalidItems }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC029 - Should return error for invalid project_id', () => {
            cy.createClassificationFromFixture('classification/validPayload', { project_id: 99999 }).then((response) => {
                expect(response.status).to.be.oneOf([400, 404]);
            });
        });

        it('TC030 - Should return 400 for invalid language_code', () => {
            cy.createClassificationFromFixture('classification/validPayload', { language_code: 'invalid_lang' }).then((response) => {
                expect(response.status).to.be.oneOf([400, 404]);
            });
        });
    });

    // =============================================
    // EDGE CASES
    // =============================================
    describe('Edge Cases', () => {
        it('TC031 - Should handle very long stem (5000 characters)', () => {
            const longStem = '<p>' + 'A'.repeat(5000) + '</p>';
            cy.createClassificationFromFixture('classification/validPayload', { stem: longStem }).then((response) => {
                expect(response.status).to.be.oneOf([201, 400, 413]);
            });
        });

        it('TC032 - Should handle special characters in stem', () => {
            cy.fixture('classification/edgeCases').then((edge) => {
                cy.createClassificationFromFixture('classification/validPayload', { stem: edge.specialChars.stem }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC033 - Should handle unicode characters in stem', () => {
            cy.fixture('classification/edgeCases').then((edge) => {
                cy.createClassificationFromFixture('classification/validPayload', { stem: edge.unicodeStem.stem }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC034 - Should handle SQL injection in stem', () => {
            cy.fixture('classification/edgeCases').then((edge) => {
                cy.createClassificationFromFixture('classification/validPayload', { stem: edge.sqlInjection.stem }).then((response) => {
                    expect(response.status).to.not.eq(500);
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC035 - Should handle XSS attempt in item_value', () => {
            cy.fixture('classification/edgeCases').then((edge) => {
                const xssItems = [
                    { item_index: 1, item_value: edge.xssAttempt.item_value, item_id: 'item_1' },
                    { item_index: 2, item_value: 'Safe value', item_id: 'item_2' },
                ];
                cy.createClassificationFromFixture('classification/validPayload', { items: xssItems }).then((response) => {
                    expect(response.status).to.not.eq(500);
                });
            });
        });

        it('TC036 - Should handle class as string instead of integer', () => {
            cy.fixture('classification/edgeCases').then((edge) => {
                cy.createClassificationFromFixture('classification/validPayload', { class: edge.classAsString.class }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC037 - Should handle project_id as string instead of integer', () => {
            cy.fixture('classification/edgeCases').then((edge) => {
                cy.createClassificationFromFixture('classification/validPayload', { project_id: edge.projectIdAsString.project_id }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC038 - Should handle negative project_id', () => {
            cy.fixture('classification/edgeCases').then((edge) => {
                cy.createClassificationFromFixture('classification/validPayload', { project_id: edge.negativeProjectId.project_id }).then((response) => {
                    expect(response.status).to.be.oneOf([400, 404]);
                });
            });
        });

        it('TC039 - Should handle negative class value', () => {
            cy.fixture('classification/edgeCases').then((edge) => {
                cy.createClassificationFromFixture('classification/validPayload', { class: edge.negativeClass.class }).then((response) => {
                    expect(response.status).to.be.oneOf([400, 404]);
                });
            });
        });

        it('TC040 - Should handle empty stem', () => {
            cy.fixture('classification/edgeCases').then((edge) => {
                cy.createClassificationFromFixture('classification/validPayload', { stem: edge.emptyStem.stem }).then((response) => {
                    expect(response.status).to.be.oneOf([400, 201]);
                });
            });
        });

        it('TC041 - Should handle duplicate category IDs', () => {
            cy.fixture('classification/edgeCases').then((edge) => {
                cy.createClassificationFromFixture('classification/validPayload', { categories: edge.duplicateCategoryIds.categories }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC042 - Should handle duplicate item IDs', () => {
            cy.fixture('classification/edgeCases').then((edge) => {
                cy.createClassificationFromFixture('classification/validPayload', { items: edge.duplicateItemIds.items }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC043 - Should handle item in multiple categories', () => {
            cy.fixture('classification/edgeCases').then((edge) => {
                cy.createClassificationFromFixture('classification/validPayload', {
                    correct_classification: edge.itemInMultipleCategories.correct_classification
                }).then((response) => {
                    expect(response.status).to.be.oneOf([400, 201]);
                });
            });
        });

        it('TC044 - Should handle item not in any category', () => {
            cy.fixture('classification/edgeCases').then((edge) => {
                cy.createClassificationFromFixture('classification/validPayload', {
                    items: edge.itemNotInAnyCategory.items,
                    correct_classification: edge.itemNotInAnyCategory.correct_classification
                }).then((response) => {
                    expect(response.status).to.be.oneOf([400, 201]);
                });
            });
        });

        it('TC045 - Should handle invalid item_id in classification', () => {
            cy.fixture('classification/edgeCases').then((edge) => {
                cy.createClassificationFromFixture('classification/validPayload', {
                    correct_classification: edge.invalidItemIdInClassification.correct_classification
                }).then((response) => {
                    expect(response.status).to.be.oneOf([400, 201]);
                });
            });
        });

        it('TC046 - Should handle invalid category_id in classification', () => {
            cy.fixture('classification/edgeCases').then((edge) => {
                cy.createClassificationFromFixture('classification/validPayload', {
                    correct_classification: edge.invalidCategoryIdInClassification.correct_classification
                }).then((response) => {
                    expect(response.status).to.be.oneOf([400, 201]);
                });
            });
        });

        it('TC047 - Should handle extra fields in request body', () => {
            cy.createClassificationFromFixture('classification/validPayload', {
                extraField: 'should be ignored',
                anotherField: 12345
            }).then((response) => {
                expect(response.status).to.eq(201);
            });
        });
    });

    // =============================================
    // RESPONSE STRUCTURE VALIDATION
    // =============================================
    describe('Response Structure Validation', () => {
        it('TC048 - Should validate successful response structure', () => {
            cy.createClassificationFromFixture('classification/validPayload').then((response) => {
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
                    cy.log(`✓ Classification response structure and database entry verified for ${contentId}`);
                });
            });
        });

        it('TC049 - Should validate error response structure', () => {
            cy.createClassification({}).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message');
                expect(response.body.message).to.be.a('string');
            });
        });

        it('TC050 - Should validate Content-Type header in response', () => {
            cy.createClassificationFromFixture('classification/validPayload').then((response) => {
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
            // Create a Classification question to use for GET tests
            cy.createClassificationFromFixture('classification/validPayload').then((response) => {
                expect(response.status).to.eq(201);
                testContentId = response.body.content_id;
                testContentRowId = response.body.content_row_id;
            });
        });

        // -----------------------------------------
        // POSITIVE TESTS
        // -----------------------------------------
        describe('Positive Tests', () => {
            it('TC051 - Should get content by valid content_id from POST response', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.be.an('array');
                    expect(response.body.length).to.be.greaterThan(0);
                    expect(response.body[0].content_id).to.eq(testContentId);
                });
            });

            it('TC052 - Should validate complete Classification response structure', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];

                    // Required fields
                    expect(content).to.have.property('content_id');
                    expect(content).to.have.property('content_row_id');
                    expect(content).to.have.property('question_type');
                    expect(content).to.have.property('stem');
                    expect(content).to.have.property('categories');
                    expect(content).to.have.property('items');
                    expect(content).to.have.property('correct_classification');
                    expect(content).to.have.property('language_code');
                    expect(content).to.have.property('version');

                    // Validate arrays
                    expect(content.categories).to.be.an('array');
                    expect(content.items).to.be.an('array');
                    expect(content.categories.length).to.be.greaterThan(0);
                    expect(content.items.length).to.be.greaterThan(0);
                });
            });

            it('TC053 - Should get content with x-encryption: false', () => {
                cy.getContentEncrypted(testContentId, false).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];
                    // correct_classification should be readable (not encrypted)
                    expect(content).to.have.property('correct_classification');
                });
            });

            it('TC054 - Should validate Content-Type header in response', () => {
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
            it('TC055 - Should return 404 for non-existent content_id', () => {
                cy.getContent('Q999999999').then((response) => {
                    expect(response.status).to.be.oneOf([404, 400]);
                    expect(response.body).to.have.property('message');
                });
            });

            it('TC056 - Should return error for invalid content_id format', () => {
                cy.getContent('invalid_format_123').then((response) => {
                    expect(response.status).to.be.oneOf([400, 404]);
                    expect(response.body).to.have.property('message');
                });
            });

            it('TC057 - Should validate error response structure', () => {
                cy.getContent('INVALID_123').then((response) => {
                    expect(response.status).to.be.oneOf([400, 404]);
                    expect(response.body).to.have.property('message');
                    expect(response.body.message).to.be.a('string');
                });
            });
        });
    });
});
