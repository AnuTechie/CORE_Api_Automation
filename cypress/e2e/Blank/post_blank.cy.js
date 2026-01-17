/// <reference types="cypress" />

/**
 * Fill in the Blank (Blank) Question API Test Suite
 * Endpoint: POST /api/content/v1/questions/fill-in-the-blanks
 * Base URL: https://core.poc-ei.study
 * 
 * Uses:
 * - Fixtures: cypress/fixtures/blank/ for test data
 * - Custom Commands: cy.createBlank(), cy.createBlankFromFixture()
 */
describe('Fill in the Blank (Blank) Question API Tests', () => {
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
        cy.fixture('blank/validPayload').then((data) => { validPayload = data; });
        cy.fixture('blank/fullPayload').then((data) => { fullPayload = data; });
        cy.fixture('blank/positivePayloads').then((data) => { positivePayloads = data; });
        cy.fixture('blank/edgeCases').then((data) => { edgeCases = data; });
    });

    // =============================================
    // POSITIVE TEST CASES
    // =============================================
    describe('Positive Test Cases', () => {
        it('TC001 - Should create Blank question with required fields only', () => {
            cy.createBlankFromFixture('blank/validPayload').then((response) => {
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
                    expect(dbRow.question_type).to.eq('Blank');
                    cy.log(`✓ Content ${createdContentId} verified in database`);
                });
            });
        });

        it('TC002 - Should create Blank question with all fields', () => {
            cy.createBlankFromFixture('blank/fullPayload').then((response) => {
                expect(response.status).to.eq(201);
                expect(response.body).to.have.property('content_id');
                expect(response.body).to.have.property('content_row_id');

                const contentId = response.body.content_id;

                // Verify content was stored in database with expected fields
                cy.verifyContentFieldsInDB(contentId, {
                    question_type: 'Blank'
                }).then((dbRow) => {
                    cy.log(`✓ Content ${contentId} with all fields verified in database`);
                });
            });
        });

        it('TC003 - Should create Blank with single blank', () => {
            cy.fixture('blank/positivePayloads').then((payloads) => {
                cy.createBlank(payloads.singleBlank).then((response) => {
                    expect(response.status).to.eq(201);
                    expect(response.body).to.have.property('content_id');
                });
            });
        });

        it('TC004 - Should create Blank with multiple blanks', () => {
            cy.fixture('blank/positivePayloads').then((payloads) => {
                cy.createBlank(payloads.multipleBlanks).then((response) => {
                    expect(response.status).to.eq(201);
                    expect(response.body).to.have.property('content_id');
                });
            });
        });

        it('TC005 - Should create Blank with drag template', () => {
            cy.fixture('blank/positivePayloads').then((payloads) => {
                cy.createBlank(payloads.dragTemplate).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC006 - Should create Blank with alphabets allowed_char_set', () => {
            cy.fixture('blank/positivePayloads').then((payloads) => {
                cy.createBlank(payloads.alphabetsCharSet).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC007 - Should create Blank with alphanumeric allowed_char_set', () => {
            cy.fixture('blank/positivePayloads').then((payloads) => {
                cy.createBlank(payloads.alphanumericCharSet).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC008 - Should create Blank with numbers_with_math_symbols allowed_char_set', () => {
            cy.fixture('blank/positivePayloads').then((payloads) => {
                cy.createBlank(payloads.numbersWithMathSymbols).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC009 - Should create Blank with custom allowed_char_set', () => {
            cy.fixture('blank/positivePayloads').then((payloads) => {
                cy.createBlank(payloads.customCharSet).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC010 - Should create Blank with fractions allowed_char_set', () => {
            cy.fixture('blank/positivePayloads').then((payloads) => {
                cy.createBlank(payloads.fractionsCharSet).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC011 - Should create Blank with Hindi language', () => {
            cy.fixture('blank/positivePayloads').then((payloads) => {
                cy.createBlank(payloads.hindiLanguage).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC012 - Should create Blank with container_ids', () => {
            cy.fixture('blank/positivePayloads').then((payloads) => {
                cy.createBlank(payloads.withContainerIds).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC013 - Should create Blank with case_sensitive rule', () => {
            cy.fixture('blank/positivePayloads').then((payloads) => {
                cy.createBlank(payloads.caseSensitive).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC014 - Should create Blank with multiple correct answers', () => {
            cy.fixture('blank/positivePayloads').then((payloads) => {
                cy.createBlank(payloads.multipleCorrectAnswers).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC015 - Should create Blank with keyword_ids using override', () => {
            cy.createBlankFromFixture('blank/validPayload', { keyword_ids: [1, 2, 3] }).then((response) => {
                expect(response.status).to.eq(201);
            });
        });
    });

    // =============================================
    // NEGATIVE TEST CASES
    // =============================================
    describe('Negative Test Cases', () => {
        it('TC016 - Should return 400 when project_id is missing', () => {
            cy.fixture('blank/validPayload').then((payload) => {
                const { project_id, ...payloadWithoutField } = payload;
                cy.createBlank(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC017 - Should return 400 when language_code is missing', () => {
            cy.fixture('blank/validPayload').then((payload) => {
                const { language_code, ...payloadWithoutField } = payload;
                cy.createBlank(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC018 - Should return 400 when question_type is missing', () => {
            cy.fixture('blank/validPayload').then((payload) => {
                const { question_type, ...payloadWithoutField } = payload;
                cy.createBlank(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC019 - Should return 400 when subject_no is missing', () => {
            cy.fixture('blank/validPayload').then((payload) => {
                const { subject_no, ...payloadWithoutField } = payload;
                cy.createBlank(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC020 - Should return 400 when class is missing', () => {
            cy.fixture('blank/validPayload').then((payload) => {
                const { class: classVal, ...payloadWithoutField } = payload;
                cy.createBlank(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC021 - Should return 400 when stem is missing', () => {
            cy.fixture('blank/validPayload').then((payload) => {
                const { stem, ...payloadWithoutField } = payload;
                cy.createBlank(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC022 - Should return 400 when blank_count is missing', () => {
            cy.fixture('blank/validPayload').then((payload) => {
                const { blank_count, ...payloadWithoutField } = payload;
                cy.createBlank(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC023 - Should return 400 when blank_details is missing', () => {
            cy.fixture('blank/validPayload').then((payload) => {
                const { blank_details, ...payloadWithoutField } = payload;
                cy.createBlank(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC024 - Should return 400 when correct_answer is missing', () => {
            cy.fixture('blank/validPayload').then((payload) => {
                const { correct_answer, ...payloadWithoutField } = payload;
                cy.createBlank(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC025 - Should return 400 when rules is missing', () => {
            cy.fixture('blank/validPayload').then((payload) => {
                const { rules, ...payloadWithoutField } = payload;
                cy.createBlank(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC026 - Should return 400 when template is missing', () => {
            cy.fixture('blank/validPayload').then((payload) => {
                const { template, ...payloadWithoutField } = payload;
                cy.createBlank(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC027 - Should return 400 with empty request body', () => {
            cy.createBlank({}).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC028 - Should return 400 when blank_count does not match blank_details length', () => {
            cy.createBlankFromFixture('blank/validPayload', {
                blank_count: 5  // mismatch with blank_details which has 1 item
            }).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message');
            });
        });

        it('TC029 - Should return 400 when blank_details is empty array', () => {
            cy.createBlankFromFixture('blank/validPayload', {
                blank_count: 0,
                blank_details: []
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC030 - Should return 400 when correct_answer is empty object', () => {
            cy.createBlankFromFixture('blank/validPayload', {
                correct_answer: {}
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC031 - Should return 400 when blank_details missing blank_index', () => {
            const invalidBlankDetails = [{
                allowed_char_set: 'numbers',
                score: 1,
                size: 5,
                min_chars_allowed: 1,
                max_chars_allowed: 5,
                fracbox: false
            }];
            cy.createBlankFromFixture('blank/validPayload', {
                blank_details: invalidBlankDetails
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC032 - Should return 400 when blank_details missing allowed_char_set', () => {
            const invalidBlankDetails = [{
                blank_index: 'b1',
                score: 1,
                size: 5,
                min_chars_allowed: 1,
                max_chars_allowed: 5,
                fracbox: false
            }];
            cy.createBlankFromFixture('blank/validPayload', {
                blank_details: invalidBlankDetails
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC033 - Should return 400 when blank_details missing score', () => {
            const invalidBlankDetails = [{
                blank_index: 'b1',
                allowed_char_set: 'numbers',
                size: 5,
                min_chars_allowed: 1,
                max_chars_allowed: 5,
                fracbox: false
            }];
            cy.createBlankFromFixture('blank/validPayload', {
                blank_details: invalidBlankDetails
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC034 - Should return 400 when blank_details missing fracbox', () => {
            const invalidBlankDetails = [{
                blank_index: 'b1',
                allowed_char_set: 'numbers',
                score: 1,
                size: 5,
                min_chars_allowed: 1,
                max_chars_allowed: 5
            }];
            cy.createBlankFromFixture('blank/validPayload', {
                blank_details: invalidBlankDetails
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC035 - Should return 400 for invalid allowed_char_set value', () => {
            const invalidBlankDetails = [{
                blank_index: 'b1',
                allowed_char_set: 'invalid_char_set',
                score: 1,
                size: 5,
                min_chars_allowed: 1,
                max_chars_allowed: 5,
                fracbox: false
            }];
            cy.createBlankFromFixture('blank/validPayload', {
                blank_details: invalidBlankDetails
            }).then((response) => {
                expect(response.status).to.be.oneOf([400, 404]);
            });
        });

        it('TC036 - Should return 400 for invalid template value', () => {
            cy.createBlankFromFixture('blank/validPayload', {
                template: 'invalid_template'
            }).then((response) => {
                expect(response.status).to.be.oneOf([400, 404]);
            });
        });

        it('TC037 - Should return error for invalid project_id', () => {
            cy.createBlankFromFixture('blank/validPayload', { project_id: 99999 }).then((response) => {
                expect(response.status).to.be.oneOf([400, 404]);
            });
        });

        it('TC038 - Should return 400 for invalid language_code', () => {
            cy.createBlankFromFixture('blank/validPayload', { language_code: 'invalid_lang' }).then((response) => {
                expect(response.status).to.be.oneOf([400, 404]);
            });
        });

        it('TC039 - Should return 400 for invalid question_type', () => {
            cy.createBlankFromFixture('blank/validPayload', { question_type: 'InvalidType' }).then((response) => {
                expect(response.status).to.be.oneOf([400, 404]);
            });
        });

        it('TC040 - Should return 400 when rules missing required fields', () => {
            cy.createBlankFromFixture('blank/validPayload', {
                rules: { no_duplicates: true }  // missing other required fields
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });
    });

    // =============================================
    // EDGE CASES
    // =============================================
    describe('Edge Cases', () => {
        it('TC041 - Should handle very long stem (3000 characters)', () => {
            const longStem = '<p>' + 'A'.repeat(3000) + ' <fill-in-the-blank id="b1"></fill-in-the-blank></p>';
            cy.createBlankFromFixture('blank/validPayload', { stem: longStem }).then((response) => {
                expect(response.status).to.be.oneOf([201, 400, 413]);
            });
        });

        it('TC042 - Should handle special characters in stem', () => {
            cy.fixture('blank/edgeCases').then((edge) => {
                cy.createBlankFromFixture('blank/validPayload', { stem: edge.specialChars.stem }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC043 - Should handle unicode characters in stem', () => {
            cy.fixture('blank/edgeCases').then((edge) => {
                cy.createBlankFromFixture('blank/validPayload', { stem: edge.unicodeStem.stem }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC044 - Should handle SQL injection in stem', () => {
            cy.fixture('blank/edgeCases').then((edge) => {
                cy.createBlankFromFixture('blank/validPayload', { stem: edge.sqlInjection.stem }).then((response) => {
                    expect(response.status).to.not.eq(500);
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC045 - Should handle XSS attempt in stem', () => {
            cy.fixture('blank/edgeCases').then((edge) => {
                cy.createBlankFromFixture('blank/validPayload', { stem: edge.xssAttempt.stem }).then((response) => {
                    expect(response.status).to.not.eq(500);
                });
            });
        });

        it('TC046 - Should handle project_id as string instead of integer', () => {
            cy.fixture('blank/edgeCases').then((edge) => {
                cy.createBlankFromFixture('blank/validPayload', { project_id: edge.projectIdAsString.project_id }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC047 - Should handle negative project_id', () => {
            cy.fixture('blank/edgeCases').then((edge) => {
                cy.createBlankFromFixture('blank/validPayload', { project_id: edge.negativeProjectId.project_id }).then((response) => {
                    expect(response.status).to.be.oneOf([400, 404]);
                });
            });
        });

        it('TC048 - Should handle class as integer instead of string', () => {
            cy.fixture('blank/edgeCases').then((edge) => {
                cy.createBlankFromFixture('blank/validPayload', { class: edge.classAsInteger.class }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC049 - Should handle negative blank_count', () => {
            cy.createBlankFromFixture('blank/validPayload', { blank_count: -1 }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC050 - Should handle rules as string instead of object', () => {
            cy.createBlankFromFixture('blank/validPayload', { rules: 'invalid' }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC051 - Should handle all rules set to true', () => {
            cy.fixture('blank/edgeCases').then((edge) => {
                cy.createBlankFromFixture('blank/validPayload', { rules: edge.allRulesTrue.rules }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC052 - Should handle extra fields in request body (should be ignored)', () => {
            cy.fixture('blank/edgeCases').then((edge) => {
                cy.createBlankFromFixture('blank/validPayload', edge.extraFields).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC053 - Should validate response time is within acceptable limit', () => {
            const startTime = Date.now();
            cy.createBlankFromFixture('blank/validPayload').then((response) => {
                const endTime = Date.now();
                const responseTime = endTime - startTime;
                // Response should be within 5 seconds
                expect(responseTime).to.be.lessThan(5000);
                expect(response.status).to.eq(201);
            });
        });

        it('TC054 - Should handle content_origin_type as copy', () => {
            cy.fixture('blank/edgeCases').then((edge) => {
                cy.createBlankFromFixture('blank/validPayload', edge.contentOriginCopy).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400, 404]);
                });
            });
        });

        it('TC055 - Should handle content_origin_type as variant', () => {
            cy.fixture('blank/edgeCases').then((edge) => {
                cy.createBlankFromFixture('blank/validPayload', edge.contentOriginVariant).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400, 404]);
                });
            });
        });
    });

    // =============================================
    // RESPONSE STRUCTURE VALIDATION
    // =============================================
    describe('Response Structure Validation', () => {
        it('TC056 - Should validate successful response structure', () => {
            cy.createBlankFromFixture('blank/validPayload').then((response) => {
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

        it('TC057 - Should validate error response structure', () => {
            cy.createBlank({}).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message');
                expect(response.body.message).to.be.a('string');
            });
        });

        it('TC058 - Should validate Content-Type header in response', () => {
            cy.createBlankFromFixture('blank/validPayload').then((response) => {
                expect(response.headers).to.have.property('content-type');
                expect(response.headers['content-type']).to.include('application/json');
            });
        });

        it('TC059 - Should validate content_row_id format includes language code', () => {
            cy.createBlankFromFixture('blank/validPayload').then((response) => {
                expect(response.status).to.eq(201);
                expect(response.body.content_row_id).to.include('_en_');
            });
        });

        it('TC060 - Should validate blank_count validation error message', () => {
            cy.createBlankFromFixture('blank/validPayload', {
                blank_count: 5
            }).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body.message).to.include('blank');
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
            // Create a Blank question to use for GET tests
            cy.createBlankFromFixture('blank/validPayload').then((response) => {
                expect(response.status).to.eq(201);
                testContentId = response.body.content_id;
                testContentRowId = response.body.content_row_id;
            });
        });

        // -----------------------------------------
        // POSITIVE TESTS
        // -----------------------------------------
        describe('Positive Tests', () => {
            it('TC061 - Should get Blank content by valid content_id', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.be.an('array');
                    expect(response.body.length).to.be.greaterThan(0);
                    expect(response.body[0].content_id).to.eq(testContentId);
                });
            });

            it('TC062 - Should validate Blank response structure', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];

                    // Required fields for Blank
                    expect(content).to.have.property('content_id');
                    expect(content).to.have.property('content_row_id');
                    expect(content).to.have.property('content_type');
                    expect(content).to.have.property('question_type');
                    expect(content).to.have.property('stem');
                    expect(content).to.have.property('blank_count');
                    expect(content).to.have.property('blank_details');
                    expect(content).to.have.property('correct_answer');
                    expect(content).to.have.property('rules');
                    expect(content).to.have.property('template');
                    expect(content).to.have.property('language_code');
                    expect(content).to.have.property('project_id');
                    expect(content).to.have.property('class');
                    expect(content).to.have.property('subject_no');
                });
            });

            it('TC063 - Should validate blank_details structure in GET response', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];

                    expect(content.blank_details).to.be.an('array');
                    expect(content.blank_details.length).to.eq(content.blank_count);

                    // Validate each blank_detail structure
                    content.blank_details.forEach((detail) => {
                        expect(detail).to.have.property('blank_index');
                        expect(detail).to.have.property('allowed_char_set');
                        expect(detail).to.have.property('score');
                        expect(detail).to.have.property('size');
                        expect(detail).to.have.property('fracbox');
                    });
                });
            });

            it('TC064 - Should validate rules structure in GET response', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];

                    expect(content.rules).to.be.an('object');
                    expect(content.rules).to.have.property('no_duplicates');
                    expect(content.rules).to.have.property('case_sensitive');
                    expect(content.rules).to.have.property('allow_extra_spaces');
                });
            });

            it('TC065 - Should get Blank content with specific language (en)', () => {
                cy.getContentWithLanguages(testContentId, 'en').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.be.an('array');
                    if (response.body.length > 0) {
                        expect(response.body[0].language_code).to.eq('en');
                    }
                });
            });

            it('TC066 - Should get Blank content with x-encryption: false', () => {
                cy.getContentEncrypted(testContentId, false).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];
                    // correct_answer should be readable (not encrypted)
                    expect(content).to.have.property('correct_answer');
                    expect(content.correct_answer).to.be.an('object');
                });
            });
        });

        // -----------------------------------------
        // NEGATIVE TESTS
        // -----------------------------------------
        describe('Negative Tests', () => {
            it('TC067 - Should return 404 for non-existent Blank content_id', () => {
                cy.getContent('Q999999999').then((response) => {
                    expect(response.status).to.be.oneOf([404, 400]);
                    expect(response.body).to.have.property('message');
                });
            });

            it('TC068 - Should return error for invalid content_id format', () => {
                cy.getContent('invalid_blank_id').then((response) => {
                    expect(response.status).to.be.oneOf([400, 404]);
                });
            });

            it('TC069 - Should handle SQL injection in content_id', () => {
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
            it('TC070 - Should verify question_type is Blank in response', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body[0].question_type).to.eq('Blank');
                });
            });

            it('TC071 - Should validate template property in response', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body[0]).to.have.property('template');
                    expect(response.body[0].template).to.be.oneOf(['type', 'drag']);
                });
            });

            it('TC072 - Should validate correct_answer structure in response', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];

                    expect(content.correct_answer).to.be.an('object');
                    // Verify each blank has corresponding answer
                    content.blank_details.forEach((detail) => {
                        expect(content.correct_answer).to.have.property(detail.blank_index);
                    });
                });
            });
        });
    });
});
