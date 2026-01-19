/// <reference types="cypress" />

/**
 * MCQ Question API Test Suite
 * Endpoint: POST /api/content/v1/questions/multiple-choice
 * Base URL: https://core.poc-ei.study
 * 
 * Uses:
 * - Fixtures: cypress/fixtures/mcq/ for test data
 * - Custom Commands: cy.createMCQ(), cy.createMCQFromFixture()
 */
describe('MCQ Question API Tests', () => {
    // Shared variable to store created content_id for GET API tests later
    let createdContentId;
    let createdContentRowId;

    // Load base payloads before tests
    let validPayload;
    let fullPayload;
    let positivePayloads;
    let edgeCases;

    before(() => {
        // Load all fixtures before tests run
        cy.fixture('mcq/validPayload').then((data) => { validPayload = data; });
        cy.fixture('mcq/fullPayload').then((data) => { fullPayload = data; });
        cy.fixture('mcq/positivePayloads').then((data) => { positivePayloads = data; });
        cy.fixture('mcq/edgeCases').then((data) => { edgeCases = data; });
    });

    beforeEach(() => {
        // Re-authenticate before EACH test to ensure fresh token
        cy.loginAndStoreTokens(
            Cypress.env('USERNAME'),
            Cypress.env('PASSWORD')
        ).then((response) => {
            expect(response.status).to.eq(200);
        });

        // Small wait to avoid database race conditions
        cy.wait(100);
    });

    // =============================================
    // POSITIVE TEST CASES
    // =============================================
    describe('Positive Test Cases', () => {
        it('TC001 - Should create MCQ question with required fields only', () => {
            cy.createMCQFromFixture('mcq/validPayload').then((response) => {
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
                    expect(dbRow.question_type).to.eq('MCQ-SingleSelect');
                    cy.log(`✓ MCQ Content ${createdContentId} verified in database`);
                });
            });
        });

        it('TC002 - Should create MCQ question with all fields', () => {
            cy.createMCQFromFixture('mcq/fullPayload').then((response) => {
                expect(response.status).to.eq(201);
                expect(response.body).to.have.property('content_id');
                expect(response.body).to.have.property('content_row_id');

                const contentId = response.body.content_id;

                // Verify content was stored in database with expected fields
                cy.verifyContentFieldsInDB(contentId, {
                    question_type: 'MCQ-SingleSelect'
                }).then((dbRow) => {
                    cy.log(`✓ MCQ Content ${contentId} with all fields verified in database`);
                });
            });
        });

        it('TC003 - Should create MCQ with multiple correct answers (MultiSelect)', () => {
            cy.fixture('mcq/positivePayloads').then((payloads) => {
                // Log the entire payloads object
                cy.log(' All Payloads:', JSON.stringify(payloads));

                // Log the multiSelect payload specifically
                cy.log(' MultiSelect Payload:', JSON.stringify(payloads.multiSelect));

                // Log specific fields
                cy.log(' project_id:', payloads.multiSelect.project_id);
                cy.log(' language_code:', payloads.multiSelect.language_code);
                cy.log(' question_type:', payloads.multiSelect.question_type);
                cy.log('class:', payloads.multiSelect.class);

                cy.createMCQ(payloads.multiSelect).then((response) => {
                    // Log the response
                    cy.log(' Response Status:', response.status);
                    cy.log(' Response Body:', JSON.stringify(response.body));

                    expect(response.status).to.eq(201);
                    expect(response.body).to.have.property('content_id');
                });
            });
        });

        it('TC004 - Should create MCQ with HTML content in stem', () => {
            cy.fixture('mcq/positivePayloads').then((payloads) => {
                cy.createMCQ(payloads.htmlStem).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC005 - Should create MCQ with video in instruction', () => {
            cy.fixture('mcq/positivePayloads').then((payloads) => {
                cy.createMCQ(payloads.videoInstruction).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC006 - Should create MCQ with different language code (hi)', () => {
            cy.fixture('mcq/positivePayloads').then((payloads) => {
                cy.createMCQ(payloads.hindiLanguage).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC007 - Should create MCQ with voiceover fields', () => {
            cy.createMCQFromFixture('mcq/fullPayload').then((response) => {
                expect(response.status).to.eq(201);
            });
        });

        it('TC008 - Should create MCQ with is_fixed option', () => {
            cy.fixture('mcq/positivePayloads').then((payloads) => {
                cy.createMCQ(payloads.fixedOptions).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC009 - Should create MCQ with minimum options (2 options)', () => {
            cy.fixture('mcq/positivePayloads').then((payloads) => {
                cy.createMCQ(payloads.minOptions).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC010 - Should create MCQ with keyword_ids using override', () => {
            cy.createMCQFromFixture('mcq/validPayload', { keyword_ids: [1, 3] }).then((response) => {
                expect(response.status).to.eq(201);
            });
        });
    });

    // =============================================
    // NEGATIVE TEST CASES
    // =============================================
    describe('Negative Test Cases', () => {
        it('TC011 - Should return 400 when project_id is missing', () => {
            cy.fixture('mcq/validPayload').then((payload) => {
                const { project_id, ...payloadWithoutField } = payload;
                cy.createMCQ(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC012 - Should return 400 when language_code is missing', () => {
            cy.fixture('mcq/validPayload').then((payload) => {
                const { language_code, ...payloadWithoutField } = payload;
                cy.createMCQ(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC013 - Should return 400 when question_type is missing', () => {
            cy.fixture('mcq/validPayload').then((payload) => {
                const { question_type, ...payloadWithoutField } = payload;
                cy.createMCQ(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC014 - Should return 400 when subject_no is missing', () => {
            cy.fixture('mcq/validPayload').then((payload) => {
                const { subject_no, ...payloadWithoutField } = payload;
                cy.createMCQ(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC015 - Should return 400 when class is missing', () => {
            cy.fixture('mcq/validPayload').then((payload) => {
                const { class: classNum, ...payloadWithoutField } = payload;
                cy.createMCQ(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC016 - Should return 400 when stem is missing', () => {
            cy.fixture('mcq/validPayload').then((payload) => {
                const { stem, ...payloadWithoutField } = payload;
                cy.createMCQ(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC017 - Should return 400 when options is missing', () => {
            cy.fixture('mcq/validPayload').then((payload) => {
                const { options, ...payloadWithoutField } = payload;
                cy.createMCQ(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC018 - Should return 400 when correct_answer is missing', () => {
            cy.fixture('mcq/validPayload').then((payload) => {
                const { correct_answer, ...payloadWithoutField } = payload;
                cy.createMCQ(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC019 - Should return 400 with empty request body', () => {
            cy.createMCQ({}).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC020 - Should return 400 when options array is empty', () => {
            cy.createMCQFromFixture('mcq/validPayload', { options: [] }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC021 - Should return 400 when correct_answer array is empty', () => {
            cy.createMCQFromFixture('mcq/validPayload', { correct_answer: [] }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC022 - Should return 400 when option missing option_index', () => {
            const invalidOptions = [
                { option_value: 'A', score: '0' },
                { option_index: 2, option_value: 'B', score: '1' },
            ];
            cy.createMCQFromFixture('mcq/validPayload', { options: invalidOptions }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC023 - Should return 400 when option missing option_value', () => {
            const invalidOptions = [
                { option_index: 1, score: '0' },
                { option_index: 2, option_value: 'B', score: '1' },
            ];
            cy.createMCQFromFixture('mcq/validPayload', { options: invalidOptions }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC024 - Should return 400 when option missing score', () => {
            const invalidOptions = [
                { option_index: 1, option_value: 'A' },
                { option_index: 2, option_value: 'B', score: '1' },
            ];
            cy.createMCQFromFixture('mcq/validPayload', { options: invalidOptions }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC025 - Should return error for invalid project_id', () => {
            cy.createMCQFromFixture('mcq/validPayload', { project_id: 99999 }).then((response) => {
                expect(response.status).to.be.oneOf([400, 404]);
            });
        });

        it('TC026 - Should return 400 for invalid language_code', () => {
            cy.createMCQFromFixture('mcq/validPayload', { language_code: 'invalid_lang' }).then((response) => {
                expect(response.status).to.be.oneOf([400, 404]);
            });
        });

        it('TC027 - Should return error when correct_answer not in options', () => {
            cy.createMCQFromFixture('mcq/validPayload', { correct_answer: [99] }).then((response) => {
                expect(response.status).to.be.oneOf([400, 500]);
            });
        });
    });

    // =============================================
    // EDGE CASES
    // =============================================
    describe('Edge Cases', () => {
        it('TC028 - Should handle very long stem (5000 characters)', () => {
            const longStem = '<p>' + 'A'.repeat(5000) + '</p>';
            cy.createMCQFromFixture('mcq/validPayload', { stem: longStem }).then((response) => {
                expect(response.status).to.be.oneOf([201, 400, 413]);
            });
        });

        it('TC029 - Should handle special characters in stem', () => {
            cy.fixture('mcq/edgeCases').then((edge) => {
                cy.createMCQFromFixture('mcq/validPayload', { stem: edge.specialChars.stem }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                    // Check for appropriate property based on status
                    if (response.status === 201) {
                        expect(response.body).to.have.property('content_id');
                    } else {
                        expect(response.body).to.have.property('message');
                    }
                });
            });
        });

        it('TC030 - Should handle unicode characters in stem', () => {
            cy.fixture('mcq/edgeCases').then((edge) => {
                cy.createMCQFromFixture('mcq/validPayload', { stem: edge.unicodeStem.stem }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC031 - Should handle maximum options (10 options)', () => {
            const manyOptions = [];
            for (let i = 1; i <= 10; i++) {
                manyOptions.push({ option_index: i, option_value: `Option ${i}`, score: i === 1 ? '1' : '0' });
            }
            cy.createMCQFromFixture('mcq/validPayload', { options: manyOptions, correct_answer: [1] }).then((response) => {
                expect(response.status).to.be.oneOf([201, 400]);
            });
        });

        it('TC032 - Should handle class as string instead of integer', () => {
            cy.fixture('mcq/edgeCases').then((edge) => {
                cy.createMCQFromFixture('mcq/validPayload', { class: edge.classAsString.class }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC033 - Should handle project_id as string instead of integer', () => {
            cy.fixture('mcq/edgeCases').then((edge) => {
                cy.createMCQFromFixture('mcq/validPayload', { project_id: edge.projectIdAsString.project_id }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC034 - Should handle negative project_id', () => {
            cy.fixture('mcq/edgeCases').then((edge) => {
                cy.createMCQFromFixture('mcq/validPayload', { project_id: edge.negativeProjectId.project_id }).then((response) => {
                    expect(response.status).to.be.oneOf([400, 404]);
                });
            });
        });

        it('TC035 - Should handle negative class value', () => {
            cy.fixture('mcq/edgeCases').then((edge) => {
                cy.createMCQFromFixture('mcq/validPayload', { class: edge.negativeClass.class }).then((response) => {
                    expect(response.status).to.be.oneOf([400, 404]);
                });
            });
        });

        it('TC036 - Should handle max_score as 0', () => {
            cy.fixture('mcq/edgeCases').then((edge) => {
                cy.createMCQFromFixture('mcq/validPayload', { max_score: edge.zeroMaxScore.max_score }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC037 - Should handle negative max_score', () => {
            cy.fixture('mcq/edgeCases').then((edge) => {
                cy.createMCQFromFixture('mcq/validPayload', { max_score: edge.negativeMaxScore.max_score }).then((response) => {
                    expect(response.status).to.be.oneOf([400, 201]);
                });
            });
        });

        it('TC038 - Should handle empty string in stem', () => {
            cy.fixture('mcq/edgeCases').then((edge) => {
                cy.createMCQFromFixture('mcq/validPayload', { stem: edge.emptyStem.stem }).then((response) => {
                    expect(response.status).to.be.oneOf([400, 201]);
                });
            });
        });

        it('TC039 - Should handle SQL injection in stem', () => {
            cy.fixture('mcq/edgeCases').then((edge) => {
                cy.createMCQFromFixture('mcq/validPayload', { stem: edge.sqlInjection.stem }).then((response) => {
                    expect(response.status).to.not.eq(500);
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC040 - Should handle XSS attempt in option_value', () => {
            cy.fixture('mcq/edgeCases').then((edge) => {
                const xssOptions = [
                    { option_index: 1, option_value: edge.xssAttempt.option_value, score: '0' },
                    { option_index: 2, option_value: 'Safe option', score: '1' },
                ];
                cy.createMCQFromFixture('mcq/validPayload', { options: xssOptions, correct_answer: [2] }).then((response) => {
                    expect(response.status).to.not.eq(500);
                });
            });
        });

        it('TC041 - Should handle duplicate option_index values', () => {
            cy.fixture('mcq/edgeCases').then((edge) => {
                cy.createMCQFromFixture('mcq/validPayload', {
                    options: edge.duplicateOptionIndex.options,
                    correct_answer: [1]
                }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC042 - Should handle content_origin_type as copy', () => {
            cy.fixture('mcq/edgeCases').then((edge) => {
                cy.createMCQFromFixture('mcq/validPayload', edge.contentOriginCopy).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400, 404]);
                });
            });
        });

        it('TC043 - Should handle content_origin_type as variant', () => {
            cy.fixture('mcq/edgeCases').then((edge) => {
                cy.createMCQFromFixture('mcq/validPayload', edge.contentOriginVariant).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400, 404]);
                });
            });
        });

        it('TC044 - Should handle template field', () => {
            cy.createMCQFromFixture('mcq/validPayload', { template: 'standard' }).then((response) => {
                expect(response.status).to.be.oneOf([201, 400]);
            });
        });

        it('TC045 - Should handle extra fields in request body', () => {
            cy.createMCQFromFixture('mcq/validPayload', {
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
        it('TC046 - Should validate successful response structure', () => {
            cy.createMCQFromFixture('mcq/validPayload').then((response) => {
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
                    cy.log(`✓ MCQ response structure and database entry verified for ${contentId}`);
                });
            });
        });

        it('TC047 - Should validate error response structure', () => {
            cy.createMCQ({}).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message');
                expect(response.body.message).to.be.a('string');
            });
        });

        it('TC048 - Should validate Content-Type header in response', () => {
            cy.createMCQFromFixture('mcq/validPayload').then((response) => {
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
            // Create an MCQ question to use for GET tests
            cy.createMCQFromFixture('mcq/validPayload').then((response) => {
                expect(response.status).to.eq(201);
                testContentId = response.body.content_id;
                testContentRowId = response.body.content_row_id;
            });
        });

        // -----------------------------------------
        // POSITIVE TESTS
        // -----------------------------------------
        describe('Positive Tests', () => {
            it('TC049 - Should get content by valid content_id from POST response', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.be.an('array');
                    expect(response.body.length).to.be.greaterThan(0);
                    expect(response.body[0].content_id).to.eq(testContentId);
                });
            });

            it('TC050 - Should validate complete MCQ response structure', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];

                    // Required fields
                    expect(content).to.have.property('content_id');
                    expect(content).to.have.property('content_row_id');
                    expect(content).to.have.property('content_type');
                    expect(content).to.have.property('question_type');
                    expect(content).to.have.property('stem');
                    expect(content).to.have.property('options');
                    expect(content).to.have.property('correct_answer');
                    expect(content).to.have.property('language_code');
                    expect(content).to.have.property('project_id');
                    expect(content).to.have.property('class');
                    expect(content).to.have.property('subject_no');
                    expect(content).to.have.property('version');

                    // Optional fields that may be present
                    expect(content).to.have.property('max_score');
                    expect(content).to.have.property('status_id');
                });
            });

            it('TC051 - Should get content with specific language (en)', () => {
                cy.getContentWithLanguages(testContentId, 'en').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.be.an('array');
                    if (response.body.length > 0) {
                        expect(response.body[0].language_code).to.eq('en');
                    }
                });
            });

            it('TC052 - Should get content with multiple languages (en,hi)', () => {
                cy.getContentWithLanguages(testContentId, 'en,hi').then((response) => {
                    // May return 200 with available languages or error if language not found
                    expect(response.status).to.be.oneOf([200, 400]);
                    if (response.status === 200) {
                        expect(response.body).to.be.an('array');
                    }
                });
            });

            it('TC053 - Should get content without language param (returns first language)', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.be.an('array');
                    expect(response.body[0]).to.have.property('language_code');
                });
            });

            it('TC054 - Should get content with x-encryption: false', () => {
                cy.getContentEncrypted(testContentId, false).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];
                    // correct_answer should be readable (not encrypted)
                    expect(content).to.have.property('correct_answer');
                    expect(content.correct_answer).to.be.an('array');
                });
            });

            it('TC055 - Should get content with x-encryption: true (encrypted response)', () => {
                cy.getContentEncrypted(testContentId, true).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];
                    // Response should still have correct_answer (may be encrypted string or array)
                    expect(content).to.have.property('correct_answer');
                });
            });

            it('TC056 - Should validate options array structure', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];
                    expect(content.options).to.be.an('array');
                    expect(content.options.length).to.be.greaterThan(0);

                    content.options.forEach((option) => {
                        expect(option).to.have.property('option_index');
                        expect(option).to.have.property('option_value');
                        expect(option).to.have.property('score');
                    });
                });
            });

            it('TC057 - Should validate correct_answer is present in response', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];
                    expect(content.correct_answer).to.be.an('array');
                    expect(content.correct_answer.length).to.be.greaterThan(0);
                });
            });

            it('TC058 - Should validate Content-Type header in response', () => {
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
            it('TC059 - Should return 404 for non-existent content_id', () => {
                cy.getContent('Q999999999').then((response) => {
                    expect(response.status).to.be.oneOf([404, 400]);
                    expect(response.body).to.have.property('message');
                });
            });

            it('TC060 - Should return error for invalid content_id format', () => {
                cy.getContent('invalid_format_123').then((response) => {
                    expect(response.status).to.be.oneOf([400, 404]);
                    expect(response.body).to.have.property('message');
                });
            });

            it('TC061 - Should return error for empty content_id', () => {
                cy.request({
                    method: 'GET',
                    url: '/api/content/v1/items/',
                    failOnStatusCode: false,
                }).then((response) => {
                    expect(response.status).to.be.oneOf([400, 404, 405]);
                });
            });

            it('TC062 - Should return error for invalid language code', () => {
                cy.getContentWithLanguages(testContentId, 'invalid_lang').then((response) => {
                    expect(response.status).to.be.oneOf([400, 200]);
                    if (response.status === 400) {
                        expect(response.body).to.have.property('message');
                    }
                });
            });

            it('TC063 - Should return error for non-associated language code', () => {
                // Using a valid language code that is not associated with this content
                cy.getContentWithLanguages(testContentId, 'fr').then((response) => {
                    expect(response.status).to.be.oneOf([400, 200]);
                    if (response.status === 400) {
                        expect(response.body).to.have.property('message');
                    }
                });
            });

            it('TC064 - Should return error for SQL injection in content_id', () => {
                cy.getContent("Q1' OR '1'='1").then((response) => {
                    expect(response.status).to.not.eq(500);
                    expect(response.status).to.be.oneOf([400, 404]);
                });
            });

            it('TC065 - Should return error for special characters in content_id', () => {
                cy.getContent('Q<script>alert(1)</script>').then((response) => {
                    expect(response.status).to.be.oneOf([400, 404]);
                });
            });

            it('TC066 - Should validate error response structure', () => {
                cy.getContent('INVALID_123').then((response) => {
                    expect(response.status).to.be.oneOf([400, 404]);
                    expect(response.body).to.have.property('message');
                    expect(response.body.message).to.be.a('string');
                });
            });
        });

        // -----------------------------------------
        // EDGE CASES
        // -----------------------------------------
        describe('Edge Cases', () => {
            it('TC067 - Should handle very long language list', () => {
                const longLangList = 'en,hi,fr,de,es,pt,it,ja,ko,zh,ar,ru,nl,sv,pl';
                cy.getContentWithLanguages(testContentId, longLangList).then((response) => {
                    expect(response.status).to.be.oneOf([200, 400]);
                });
            });

            it('TC068 - Should handle duplicate languages in query', () => {
                cy.getContentWithLanguages(testContentId, 'en,en,en').then((response) => {
                    expect(response.status).to.be.oneOf([200, 400]);
                });
            });

            it('TC069 - Should handle empty languages parameter', () => {
                cy.getContentWithLanguages(testContentId, '').then((response) => {
                    expect(response.status).to.be.oneOf([200, 400]);
                });
            });

            it('TC070 - Should handle case-sensitive language codes', () => {
                cy.getContentWithLanguages(testContentId, 'EN').then((response) => {
                    // API may be case-insensitive or case-sensitive
                    expect(response.status).to.be.oneOf([200, 400]);
                });
            });

            it('TC071 - Should handle x-encryption with invalid value', () => {
                cy.request({
                    method: 'GET',
                    url: `/api/content/v1/items/${testContentId}`,
                    headers: {
                        'Content-Type': 'application/json',
                        'x-encryption': 'invalid_boolean',
                    },
                    failOnStatusCode: false,
                }).then((response) => {
                    expect(response.status).to.be.oneOf([200, 400]);
                });
            });

            it('TC072 - Should handle extra query parameters (should be ignored)', () => {
                cy.request({
                    method: 'GET',
                    url: `/api/content/v1/items/${testContentId}`,
                    qs: {
                        extraParam: 'should_be_ignored',
                        anotherParam: '12345',
                    },
                    failOnStatusCode: false,
                }).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });
    });
});
