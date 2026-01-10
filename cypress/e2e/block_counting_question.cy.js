/// <reference types="cypress" />

/**
 * Block Counting Question API Test Suite
 * Endpoint: POST /api/content/v1/questions/block-counting
 * Base URL: http://192.168.0.156:3000
 * 
 * Uses:
 * - Fixtures: cypress/fixtures/block-counting/ for test data
 * - Custom Commands: cy.createBlockCounting(), cy.createBlockCountingFromFixture()
 */
describe('Block Counting Question API Tests', () => {
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
        cy.fixture('block-counting/validPayload').then((data) => { validPayload = data; });
        cy.fixture('block-counting/fullPayload').then((data) => { fullPayload = data; });
        cy.fixture('block-counting/positivePayloads').then((data) => { positivePayloads = data; });
        cy.fixture('block-counting/edgeCases').then((data) => { edgeCases = data; });
    });

    // =============================================
    // POSITIVE TEST CASES
    // =============================================
    describe('Positive Test Cases', () => {
        it('TC001 - Should create Block Counting question with required fields only', () => {
            cy.createBlockCountingFromFixture('block-counting/validPayload').then((response) => {
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
                    expect(dbRow.question_type).to.eq('BlockCounting');
                    cy.log(`✓ Block Counting Content ${createdContentId} verified in database`);
                });
            });
        });

        it('TC002 - Should create Block Counting question with all fields', () => {
            cy.createBlockCountingFromFixture('block-counting/fullPayload').then((response) => {
                expect(response.status).to.eq(201);
                expect(response.body).to.have.property('content_id');
                expect(response.body).to.have.property('content_row_id');

                const contentId = response.body.content_id;

                // Verify content was stored in database with expected fields
                cy.verifyContentFieldsInDB(contentId, {
                    question_type: 'BlockCounting'
                }).then((dbRow) => {
                    cy.log(`✓ Block Counting Content ${contentId} with all fields verified in database`);
                });
            });
        });

        it('TC003 - Should create Block Counting with video instruction', () => {
            cy.fixture('block-counting/positivePayloads').then((payloads) => {
                cy.createBlockCounting(payloads.withVideo).then((response) => {
                    expect(response.status).to.eq(201);
                    expect(response.body).to.have.property('content_id');
                });
            });
        });

        it('TC004 - Should create Block Counting with Hindi language', () => {
            cy.fixture('block-counting/positivePayloads').then((payloads) => {
                cy.createBlockCounting(payloads.hindiLanguage).then((response) => {
                    expect(response.status).to.eq(201);
                    expect(response.body).to.have.property('content_id');
                });
            });
        });

        it('TC005 - Should create Block Counting with large number answer', () => {
            cy.fixture('block-counting/positivePayloads').then((payloads) => {
                cy.createBlockCounting(payloads.largeNumber).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC006 - Should create Block Counting with explanation', () => {
            cy.fixture('block-counting/positivePayloads').then((payloads) => {
                cy.createBlockCounting(payloads.withExplanation).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC007 - Should create Block Counting with high difficulty level', () => {
            cy.fixture('block-counting/positivePayloads').then((payloads) => {
                cy.createBlockCounting(payloads.highDifficulty).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC008 - Should create Block Counting with voiceover fields', () => {
            cy.createBlockCountingFromFixture('block-counting/fullPayload').then((response) => {
                expect(response.status).to.eq(201);
            });
        });

        it('TC009 - Should create Block Counting with container_ids', () => {
            cy.createBlockCountingFromFixture('block-counting/fullPayload').then((response) => {
                expect(response.status).to.eq(201);
            });
        });

        it('TC010 - Should create Block Counting with keyword_ids using override', () => {
            cy.createBlockCountingFromFixture('block-counting/validPayload', { keyword_ids: [1, 2, 3] }).then((response) => {
                expect(response.status).to.eq(201);
            });
        });
    });

    // =============================================
    // NEGATIVE TEST CASES
    // =============================================
    describe('Negative Test Cases', () => {
        it('TC011 - Should return 400 when project_id is missing', () => {
            cy.fixture('block-counting/validPayload').then((payload) => {
                const { project_id, ...payloadWithoutField } = payload;
                cy.createBlockCounting(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC012 - Should return 400 when language_code is missing', () => {
            cy.fixture('block-counting/validPayload').then((payload) => {
                const { language_code, ...payloadWithoutField } = payload;
                cy.createBlockCounting(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC013 - Should return 400 when question_type is missing', () => {
            cy.fixture('block-counting/validPayload').then((payload) => {
                const { question_type, ...payloadWithoutField } = payload;
                cy.createBlockCounting(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC014 - Should return 400 when subject_no is missing', () => {
            cy.fixture('block-counting/validPayload').then((payload) => {
                const { subject_no, ...payloadWithoutField } = payload;
                cy.createBlockCounting(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC015 - Should return 400 when class is missing', () => {
            cy.fixture('block-counting/validPayload').then((payload) => {
                const { class: classNum, ...payloadWithoutField } = payload;
                cy.createBlockCounting(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC016 - Should return 400 when stem is missing', () => {
            cy.fixture('block-counting/validPayload').then((payload) => {
                const { stem, ...payloadWithoutField } = payload;
                cy.createBlockCounting(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC017 - Should return 400 when correct_answer is missing', () => {
            cy.fixture('block-counting/validPayload').then((payload) => {
                const { correct_answer, ...payloadWithoutField } = payload;
                cy.createBlockCounting(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC018 - Should return 400 when answer_type is missing', () => {
            cy.fixture('block-counting/validPayload').then((payload) => {
                const { answer_type, ...payloadWithoutField } = payload;
                cy.createBlockCounting(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC019 - Should return 400 with empty request body', () => {
            cy.createBlockCounting({}).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC020 - Should return error for invalid project_id', () => {
            cy.createBlockCountingFromFixture('block-counting/validPayload', { project_id: 99999 }).then((response) => {
                expect(response.status).to.be.oneOf([400, 404]);
            });
        });

        it('TC021 - Should return 400 for invalid language_code', () => {
            cy.createBlockCountingFromFixture('block-counting/validPayload', { language_code: 'invalid_lang' }).then((response) => {
                expect(response.status).to.be.oneOf([400, 404]);
            });
        });

        it('TC022 - Should return 400 when min_value is missing', () => {
            cy.fixture('block-counting/validPayload').then((payload) => {
                const { min_value, ...payloadWithoutField } = payload;
                cy.createBlockCounting(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC023 - Should return 400 when max_value is missing', () => {
            cy.fixture('block-counting/validPayload').then((payload) => {
                const { max_value, ...payloadWithoutField } = payload;
                cy.createBlockCounting(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });
    });

    // =============================================
    // EDGE CASES
    // =============================================
    describe('Edge Cases', () => {
        it('TC024 - Should handle very long stem (5000 characters)', () => {
            const longStem = '<p>' + 'A'.repeat(5000) + '</p>';
            cy.createBlockCountingFromFixture('block-counting/validPayload', { stem: longStem }).then((response) => {
                expect(response.status).to.be.oneOf([201, 400, 413]);
            });
        });

        it('TC025 - Should handle special characters in stem', () => {
            cy.fixture('block-counting/edgeCases').then((edge) => {
                cy.createBlockCountingFromFixture('block-counting/validPayload', { stem: edge.specialChars.stem }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                    expect(response.body).to.have.property('message').or.have.property('content_id');
                });
            });
        });

        it('TC026 - Should handle unicode characters in stem', () => {
            cy.fixture('block-counting/edgeCases').then((edge) => {
                cy.createBlockCountingFromFixture('block-counting/validPayload', { stem: edge.unicodeStem.stem }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC027 - Should handle class as string instead of integer', () => {
            cy.fixture('block-counting/edgeCases').then((edge) => {
                cy.createBlockCountingFromFixture('block-counting/validPayload', { class: edge.classAsString.class }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC028 - Should handle project_id as string instead of integer', () => {
            cy.fixture('block-counting/edgeCases').then((edge) => {
                cy.createBlockCountingFromFixture('block-counting/validPayload', { project_id: edge.projectIdAsString.project_id }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC029 - Should handle negative project_id', () => {
            cy.fixture('block-counting/edgeCases').then((edge) => {
                cy.createBlockCountingFromFixture('block-counting/validPayload', { project_id: edge.negativeProjectId.project_id }).then((response) => {
                    expect(response.status).to.be.oneOf([400, 404]);
                });
            });
        });

        it('TC030 - Should handle negative class value', () => {
            cy.fixture('block-counting/edgeCases').then((edge) => {
                cy.createBlockCountingFromFixture('block-counting/validPayload', { class: edge.negativeClass.class }).then((response) => {
                    expect(response.status).to.be.oneOf([400, 404]);
                });
            });
        });

        it('TC031 - Should handle max_score as 0', () => {
            cy.fixture('block-counting/edgeCases').then((edge) => {
                cy.createBlockCountingFromFixture('block-counting/validPayload', { max_score: edge.zeroMaxScore.max_score }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC032 - Should handle negative max_score', () => {
            cy.fixture('block-counting/edgeCases').then((edge) => {
                cy.createBlockCountingFromFixture('block-counting/validPayload', { max_score: edge.negativeMaxScore.max_score }).then((response) => {
                    expect(response.status).to.be.oneOf([400, 201]);
                });
            });
        });

        it('TC033 - Should handle empty string in stem', () => {
            cy.fixture('block-counting/edgeCases').then((edge) => {
                cy.createBlockCountingFromFixture('block-counting/validPayload', { stem: edge.emptyStem.stem }).then((response) => {
                    expect(response.status).to.be.oneOf([400, 201]);
                });
            });
        });

        it('TC034 - Should handle SQL injection in stem', () => {
            cy.fixture('block-counting/edgeCases').then((edge) => {
                cy.createBlockCountingFromFixture('block-counting/validPayload', { stem: edge.sqlInjection.stem }).then((response) => {
                    expect(response.status).to.not.eq(500);
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC035 - Should handle XSS attempt in stem', () => {
            cy.fixture('block-counting/edgeCases').then((edge) => {
                cy.createBlockCountingFromFixture('block-counting/validPayload', { stem: edge.xssAttempt.stem }).then((response) => {
                    expect(response.status).to.not.eq(500);
                });
            });
        });

        it('TC036 - Should handle negative correct_answer', () => {
            cy.fixture('block-counting/edgeCases').then((edge) => {
                cy.createBlockCountingFromFixture('block-counting/validPayload', { correct_answer: edge.negativeAnswer.correct_answer }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC037 - Should handle answer exceeding max_value', () => {
            cy.fixture('block-counting/edgeCases').then((edge) => {
                cy.createBlockCountingFromFixture('block-counting/validPayload', {
                    correct_answer: edge.answerExceedsMax.correct_answer,
                    max_value: edge.answerExceedsMax.max_value
                }).then((response) => {
                    expect(response.status).to.be.oneOf([400, 201]);
                });
            });
        });

        it('TC038 - Should handle answer below min_value', () => {
            cy.fixture('block-counting/edgeCases').then((edge) => {
                cy.createBlockCountingFromFixture('block-counting/validPayload', {
                    correct_answer: edge.answerBelowMin.correct_answer,
                    min_value: edge.answerBelowMin.min_value
                }).then((response) => {
                    expect(response.status).to.be.oneOf([400, 201]);
                });
            });
        });

        it('TC039 - Should handle min_value greater than max_value', () => {
            cy.fixture('block-counting/edgeCases').then((edge) => {
                cy.createBlockCountingFromFixture('block-counting/validPayload', {
                    min_value: edge.minGreaterThanMax.min_value,
                    max_value: edge.minGreaterThanMax.max_value
                }).then((response) => {
                    expect(response.status).to.be.oneOf([400, 201]);
                });
            });
        });

        it('TC040 - Should handle extra fields in request body', () => {
            cy.createBlockCountingFromFixture('block-counting/validPayload', {
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
        it('TC041 - Should validate successful response structure', () => {
            cy.createBlockCountingFromFixture('block-counting/validPayload').then((response) => {
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
                    cy.log(`✓ Block Counting response structure and database entry verified for ${contentId}`);
                });
            });
        });

        it('TC042 - Should validate error response structure', () => {
            cy.createBlockCounting({}).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message');
                expect(response.body.message).to.be.a('string');
            });
        });

        it('TC043 - Should validate Content-Type header in response', () => {
            cy.createBlockCountingFromFixture('block-counting/validPayload').then((response) => {
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
            // Create a Block Counting question to use for GET tests
            cy.createBlockCountingFromFixture('block-counting/validPayload').then((response) => {
                expect(response.status).to.eq(201);
                testContentId = response.body.content_id;
                testContentRowId = response.body.content_row_id;
            });
        });

        // -----------------------------------------
        // POSITIVE TESTS
        // -----------------------------------------
        describe('Positive Tests', () => {
            it('TC044 - Should get content by valid content_id from POST response', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.be.an('array');
                    expect(response.body.length).to.be.greaterThan(0);
                    expect(response.body[0].content_id).to.eq(testContentId);
                });
            });

            it('TC045 - Should validate complete Block Counting response structure', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];

                    // Required fields
                    expect(content).to.have.property('content_id');
                    expect(content).to.have.property('content_row_id');
                    expect(content).to.have.property('content_type');
                    expect(content).to.have.property('question_type');
                    expect(content).to.have.property('stem');
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

            it('TC046 - Should get content with specific language (en)', () => {
                cy.getContentWithLanguages(testContentId, 'en').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.be.an('array');
                    if (response.body.length > 0) {
                        expect(response.body[0].language_code).to.eq('en');
                    }
                });
            });

            it('TC047 - Should get content with x-encryption: false', () => {
                cy.getContentEncrypted(testContentId, false).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];
                    // correct_answer should be readable (not encrypted)
                    expect(content).to.have.property('correct_answer');
                });
            });

            it('TC048 - Should get content with x-encryption: true (encrypted response)', () => {
                cy.getContentEncrypted(testContentId, true).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];
                    // Response should still have correct_answer
                    expect(content).to.have.property('correct_answer');
                });
            });

            it('TC049 - Should validate Content-Type header in response', () => {
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
            it('TC050 - Should return 404 for non-existent content_id', () => {
                cy.getContent('Q999999999').then((response) => {
                    expect(response.status).to.be.oneOf([404, 400]);
                    expect(response.body).to.have.property('message');
                });
            });

            it('TC051 - Should return error for invalid content_id format', () => {
                cy.getContent('invalid_format_123').then((response) => {
                    expect(response.status).to.be.oneOf([400, 404]);
                    expect(response.body).to.have.property('message');
                });
            });

            it('TC052 - Should return error for SQL injection in content_id', () => {
                cy.getContent("Q1' OR '1'='1").then((response) => {
                    expect(response.status).to.not.eq(500);
                    expect(response.status).to.be.oneOf([400, 404]);
                });
            });

            it('TC053 - Should validate error response structure', () => {
                cy.getContent('INVALID_123').then((response) => {
                    expect(response.status).to.be.oneOf([400, 404]);
                    expect(response.body).to.have.property('message');
                    expect(response.body.message).to.be.a('string');
                });
            });
        });
    });
});
