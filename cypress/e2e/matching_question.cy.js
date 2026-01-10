/// <reference types="cypress" />

/**
 * Matching Question API Test Suite
 * Endpoint: POST /api/content/v1/questions/matching
 * Base URL: https://core.poc-ei.study
 * 
 * Uses:
 * - Fixtures: cypress/fixtures/matching/ for test data
 * - Custom Commands: cy.createMatching(), cy.createMatchingFromFixture()
 */
describe('Matching Question API Tests', () => {
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
        cy.fixture('matching/validPayload').then((data) => { validPayload = data; });
        cy.fixture('matching/fullPayload').then((data) => { fullPayload = data; });
        cy.fixture('matching/positivePayloads').then((data) => { positivePayloads = data; });
        cy.fixture('matching/edgeCases').then((data) => { edgeCases = data; });
    });

    // =============================================
    // POSITIVE TEST CASES
    // =============================================
    describe('Positive Test Cases', () => {
        it('TC001 - Should create Matching question with required fields only', () => {
            cy.createMatchingFromFixture('matching/validPayload').then((response) => {
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
                    expect(dbRow.question_type).to.eq('Matching');
                    cy.log(`✓ Matching Content ${createdContentId} verified in database`);
                });
            });
        });

        it('TC002 - Should create Matching question with all fields', () => {
            cy.createMatchingFromFixture('matching/fullPayload').then((response) => {
                expect(response.status).to.eq(201);
                expect(response.body).to.have.property('content_id');
                expect(response.body).to.have.property('content_row_id');

                const contentId = response.body.content_id;

                // Verify content was stored in database with expected fields
                cy.verifyContentFieldsInDB(contentId, {
                    question_type: 'Matching'
                }).then((dbRow) => {
                    cy.log(`✓ Matching Content ${contentId} with all fields verified in database`);
                });
            });
        });

        it('TC003 - Should create Matching with single pair', () => {
            cy.fixture('matching/positivePayloads').then((payloads) => {
                cy.createMatching(payloads.singlePair).then((response) => {
                    expect(response.status).to.eq(201);
                    expect(response.body).to.have.property('content_id');
                });
            });
        });

        it('TC004 - Should create Matching with multiple pairs (4 pairs)', () => {
            cy.fixture('matching/positivePayloads').then((payloads) => {
                cy.createMatching(payloads.multiPair).then((response) => {
                    expect(response.status).to.eq(201);
                    expect(response.body).to.have.property('content_id');
                });
            });
        });

        it('TC005 - Should create Matching with titles (show_titles: true)', () => {
            cy.fixture('matching/positivePayloads').then((payloads) => {
                cy.createMatching(payloads.withTitles).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC006 - Should create Matching with Hindi language', () => {
            cy.fixture('matching/positivePayloads').then((payloads) => {
                cy.createMatching(payloads.hindiLanguage).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC007 - Should create Matching with HTML content in stem', () => {
            cy.fixture('matching/positivePayloads').then((payloads) => {
                cy.createMatching(payloads.htmlContent).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC008 - Should create Matching with voiceover fields', () => {
            cy.fixture('matching/positivePayloads').then((payloads) => {
                cy.createMatching(payloads.withVoiceover).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC009 - Should create Matching with unequal columns (extra options in column B)', () => {
            cy.fixture('matching/positivePayloads').then((payloads) => {
                cy.createMatching(payloads.unequalColumns).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC010 - Should create Matching with explanation and max_score', () => {
            cy.fixture('matching/positivePayloads').then((payloads) => {
                cy.createMatching(payloads.withMaxScore).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC011 - Should create Matching with shuffle: true', () => {
            cy.createMatchingFromFixture('matching/validPayload', { shuffle: true }).then((response) => {
                expect(response.status).to.eq(201);
            });
        });

        it('TC012 - Should create Matching with keyword_ids using override', () => {
            cy.createMatchingFromFixture('matching/validPayload', { keyword_ids: [1, 2, 3] }).then((response) => {
                expect(response.status).to.eq(201);
            });
        });
    });

    // =============================================
    // NEGATIVE TEST CASES
    // =============================================
    describe('Negative Test Cases', () => {
        it('TC013 - Should return 400 when project_id is missing', () => {
            cy.fixture('matching/validPayload').then((payload) => {
                const { project_id, ...payloadWithoutField } = payload;
                cy.createMatching(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC014 - Should return 400 when language_code is missing', () => {
            cy.fixture('matching/validPayload').then((payload) => {
                const { language_code, ...payloadWithoutField } = payload;
                cy.createMatching(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC015 - Should return 400 when question_type is missing', () => {
            cy.fixture('matching/validPayload').then((payload) => {
                const { question_type, ...payloadWithoutField } = payload;
                cy.createMatching(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC016 - Should return 400 when subject_no is missing', () => {
            cy.fixture('matching/validPayload').then((payload) => {
                const { subject_no, ...payloadWithoutField } = payload;
                cy.createMatching(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC017 - Should return 400 when class is missing', () => {
            cy.fixture('matching/validPayload').then((payload) => {
                const { class: classVal, ...payloadWithoutField } = payload;
                cy.createMatching(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC018 - Should return 400 when stem is missing', () => {
            cy.fixture('matching/validPayload').then((payload) => {
                const { stem, ...payloadWithoutField } = payload;
                cy.createMatching(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC019 - Should return 400 when match_sets is missing', () => {
            cy.fixture('matching/validPayload').then((payload) => {
                const { match_sets, ...payloadWithoutField } = payload;
                cy.createMatching(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC020 - Should return 400 when correct_answer is missing', () => {
            cy.fixture('matching/validPayload').then((payload) => {
                const { correct_answer, ...payloadWithoutField } = payload;
                cy.createMatching(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC021 - Should return 400 when shuffle is missing', () => {
            cy.fixture('matching/validPayload').then((payload) => {
                const { shuffle, ...payloadWithoutField } = payload;
                cy.createMatching(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC022 - Should return 400 when show_titles is missing', () => {
            cy.fixture('matching/validPayload').then((payload) => {
                const { show_titles, ...payloadWithoutField } = payload;
                cy.createMatching(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC023 - Should return 400 with empty request body', () => {
            cy.createMatching({}).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC024 - Should return 400 when column_a_options is empty', () => {
            cy.createMatchingFromFixture('matching/validPayload', {
                match_sets: { column_a_options: [], column_b_options: [{ option_value: 'A', option_index: 1 }] }
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC025 - Should return 400 when column_b_options is empty', () => {
            cy.createMatchingFromFixture('matching/validPayload', {
                match_sets: { column_a_options: [{ option_value: 'A', option_index: 1 }], column_b_options: [] }
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC026 - Should return 400 when correct_answer is empty array', () => {
            cy.createMatchingFromFixture('matching/validPayload', { correct_answer: [] }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC027 - Should return 400 when correct_answer missing column_a_index', () => {
            cy.createMatchingFromFixture('matching/validPayload', {
                correct_answer: [{ column_b_index: 1 }]
            }).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message');
            });
        });

        it('TC028 - Should return 400 when correct_answer missing column_b_index', () => {
            cy.createMatchingFromFixture('matching/validPayload', {
                correct_answer: [{ column_a_index: 1 }]
            }).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message');
            });
        });

        it('TC029 - Should return 400 when option missing option_value', () => {
            const invalidMatchSets = {
                column_a_options: [{ option_index: 1 }],
                column_b_options: [{ option_value: 'B', option_index: 1 }]
            };
            cy.createMatchingFromFixture('matching/validPayload', { match_sets: invalidMatchSets }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC030 - Should return 400 when option missing option_index', () => {
            const invalidMatchSets = {
                column_a_options: [{ option_value: 'A' }],
                column_b_options: [{ option_value: 'B', option_index: 1 }]
            };
            cy.createMatchingFromFixture('matching/validPayload', { match_sets: invalidMatchSets }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC031 - Should return error for invalid project_id', () => {
            cy.createMatchingFromFixture('matching/validPayload', { project_id: 99999 }).then((response) => {
                expect(response.status).to.be.oneOf([400, 404]);
            });
        });

        it('TC032 - Should return 400 for invalid language_code', () => {
            cy.createMatchingFromFixture('matching/validPayload', { language_code: 'invalid_lang' }).then((response) => {
                expect(response.status).to.be.oneOf([400, 404]);
            });
        });

        it('TC033 - Should return 400 for invalid question_type', () => {
            cy.createMatchingFromFixture('matching/validPayload', { question_type: 'InvalidType' }).then((response) => {
                expect(response.status).to.be.oneOf([400, 404]);
            });
        });
    });

    // =============================================
    // EDGE CASES
    // =============================================
    describe('Edge Cases', () => {
        it('TC034 - Should handle very long stem (3000 characters)', () => {
            const longStem = '<p>' + 'A'.repeat(3000) + '</p>';
            cy.createMatchingFromFixture('matching/validPayload', { stem: longStem }).then((response) => {
                expect(response.status).to.be.oneOf([201, 400, 413]);
            });
        });

        it('TC035 - Should handle special characters in stem', () => {
            cy.fixture('matching/edgeCases').then((edge) => {
                cy.createMatchingFromFixture('matching/validPayload', { stem: edge.specialChars.stem }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC036 - Should handle unicode characters in stem', () => {
            cy.fixture('matching/edgeCases').then((edge) => {
                cy.createMatchingFromFixture('matching/validPayload', { stem: edge.unicodeStem.stem }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC037 - Should handle SQL injection in stem', () => {
            cy.fixture('matching/edgeCases').then((edge) => {
                cy.createMatchingFromFixture('matching/validPayload', { stem: edge.sqlInjection.stem }).then((response) => {
                    expect(response.status).to.not.eq(500);
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC038 - Should handle XSS attempt in stem', () => {
            cy.fixture('matching/edgeCases').then((edge) => {
                cy.createMatchingFromFixture('matching/validPayload', { stem: edge.xssAttempt.stem }).then((response) => {
                    expect(response.status).to.not.eq(500);
                });
            });
        });

        it('TC039 - Should handle special characters in option_value', () => {
            cy.fixture('matching/edgeCases').then((edge) => {
                const matchSets = {
                    column_a_options: [{ option_value: edge.specialChars.option_value, option_index: 1 }],
                    column_b_options: [{ option_value: 'Normal', option_index: 1 }]
                };
                cy.createMatchingFromFixture('matching/validPayload', {
                    match_sets: matchSets,
                    correct_answer: [{ column_a_index: 1, column_b_index: 1 }]
                }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC040 - Should handle project_id as string instead of integer', () => {
            cy.fixture('matching/edgeCases').then((edge) => {
                cy.createMatchingFromFixture('matching/validPayload', { project_id: edge.projectIdAsString.project_id }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC041 - Should handle negative project_id', () => {
            cy.fixture('matching/edgeCases').then((edge) => {
                cy.createMatchingFromFixture('matching/validPayload', { project_id: edge.negativeProjectId.project_id }).then((response) => {
                    expect(response.status).to.be.oneOf([400, 404]);
                });
            });
        });

        it('TC042 - Should handle class as integer instead of string', () => {
            cy.fixture('matching/edgeCases').then((edge) => {
                cy.createMatchingFromFixture('matching/validPayload', { class: edge.classAsInteger.class }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC043 - Should handle duplicate option_index in column_a', () => {
            cy.fixture('matching/edgeCases').then((edge) => {
                const matchSets = {
                    column_a_options: edge.duplicateOptionIndex.column_a_options,
                    column_b_options: [{ option_value: 'X', option_index: 1 }]
                };
                cy.createMatchingFromFixture('matching/validPayload', {
                    match_sets: matchSets,
                    correct_answer: [{ column_a_index: 1, column_b_index: 1 }]
                }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC044 - Should handle mismatched correct_answer indices', () => {
            cy.fixture('matching/edgeCases').then((edge) => {
                cy.createMatchingFromFixture('matching/validPayload', {
                    correct_answer: edge.mismatchedCorrectAnswer.correct_answer
                }).then((response) => {
                    expect(response.status).to.be.oneOf([400, 500]);
                });
            });
        });

        it('TC045 - Should handle shuffle as string instead of boolean', () => {
            cy.fixture('matching/edgeCases').then((edge) => {
                cy.createMatchingFromFixture('matching/validPayload', { shuffle: edge.shuffleAsString.shuffle }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC046 - Should handle show_titles as string instead of boolean', () => {
            cy.fixture('matching/edgeCases').then((edge) => {
                cy.createMatchingFromFixture('matching/validPayload', { show_titles: edge.showTitlesAsString.show_titles }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC047 - Should handle content_origin_type as copy', () => {
            cy.fixture('matching/edgeCases').then((edge) => {
                cy.createMatchingFromFixture('matching/validPayload', edge.contentOriginCopy).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400, 404]);
                });
            });
        });

        it('TC048 - Should handle content_origin_type as variant', () => {
            cy.fixture('matching/edgeCases').then((edge) => {
                cy.createMatchingFromFixture('matching/validPayload', edge.contentOriginVariant).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400, 404]);
                });
            });
        });

        it('TC049 - Should handle extra fields in request body (should be ignored)', () => {
            cy.fixture('matching/edgeCases').then((edge) => {
                cy.createMatchingFromFixture('matching/validPayload', edge.extraFields).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC050 - Should validate response time is within acceptable limit', () => {
            const startTime = Date.now();
            cy.createMatchingFromFixture('matching/validPayload').then((response) => {
                const endTime = Date.now();
                const responseTime = endTime - startTime;
                // Response should be within 5 seconds
                expect(responseTime).to.be.lessThan(5000);
                expect(response.status).to.eq(201);
            });
        });

        it('TC051 - Should handle maximum pairs (10 pairs)', () => {
            const manyOptionsA = [];
            const manyOptionsB = [];
            const manyAnswers = [];
            for (let i = 1; i <= 10; i++) {
                manyOptionsA.push({ option_value: `Column A Option ${i}`, option_index: i });
                manyOptionsB.push({ option_value: `Column B Option ${i}`, option_index: i });
                manyAnswers.push({ column_a_index: i, column_b_index: i });
            }
            cy.createMatchingFromFixture('matching/validPayload', {
                match_sets: { column_a_options: manyOptionsA, column_b_options: manyOptionsB },
                correct_answer: manyAnswers
            }).then((response) => {
                expect(response.status).to.be.oneOf([201, 400]);
            });
        });
    });

    // =============================================
    // RESPONSE STRUCTURE VALIDATION
    // =============================================
    describe('Response Structure Validation', () => {
        it('TC052 - Should validate successful response structure', () => {
            cy.createMatchingFromFixture('matching/validPayload').then((response) => {
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
                    cy.log(`✓ Matching response structure and database entry verified for ${contentId}`);
                });
            });
        });

        it('TC053 - Should validate error response structure', () => {
            cy.createMatching({}).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message');
                expect(response.body.message).to.be.a('string');
            });
        });

        it('TC054 - Should validate Content-Type header in response', () => {
            cy.createMatchingFromFixture('matching/validPayload').then((response) => {
                expect(response.headers).to.have.property('content-type');
                expect(response.headers['content-type']).to.include('application/json');
            });
        });

        it('TC055 - Should validate content_row_id format includes language code', () => {
            cy.createMatchingFromFixture('matching/validPayload').then((response) => {
                expect(response.status).to.eq(201);
                expect(response.body.content_row_id).to.include('_en_');
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
            // Create a Matching question to use for GET tests
            cy.createMatchingFromFixture('matching/validPayload').then((response) => {
                expect(response.status).to.eq(201);
                testContentId = response.body.content_id;
                testContentRowId = response.body.content_row_id;
            });
        });

        // -----------------------------------------
        // POSITIVE TESTS
        // -----------------------------------------
        describe('Positive Tests', () => {
            it('TC056 - Should get Matching content by valid content_id', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.be.an('array');
                    expect(response.body.length).to.be.greaterThan(0);
                    expect(response.body[0].content_id).to.eq(testContentId);
                });
            });

            it('TC057 - Should validate Matching response structure', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];

                    // Required fields for Matching
                    expect(content).to.have.property('content_id');
                    expect(content).to.have.property('content_row_id');
                    expect(content).to.have.property('content_type');
                    expect(content).to.have.property('question_type');
                    expect(content).to.have.property('stem');
                    expect(content).to.have.property('match_sets');
                    expect(content).to.have.property('correct_answer');
                    expect(content).to.have.property('language_code');
                    expect(content).to.have.property('project_id');
                    expect(content).to.have.property('class');
                    expect(content).to.have.property('subject_no');
                });
            });

            it('TC058 - Should validate match_sets structure in GET response', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];

                    expect(content.match_sets).to.be.an('object');
                    expect(content.match_sets).to.have.property('column_a_options');
                    expect(content.match_sets).to.have.property('column_b_options');
                    expect(content.match_sets.column_a_options).to.be.an('array');
                    expect(content.match_sets.column_b_options).to.be.an('array');

                    // Validate option structure
                    content.match_sets.column_a_options.forEach((option) => {
                        expect(option).to.have.property('option_value');
                        expect(option).to.have.property('option_index');
                    });
                });
            });

            it('TC059 - Should validate correct_answer structure in GET response', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];

                    expect(content.correct_answer).to.be.an('array');
                    content.correct_answer.forEach((answer) => {
                        expect(answer).to.have.property('column_a_index');
                        expect(answer).to.have.property('column_b_index');
                    });
                });
            });

            it('TC060 - Should get Matching content with specific language (en)', () => {
                cy.getContentWithLanguages(testContentId, 'en').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.be.an('array');
                    if (response.body.length > 0) {
                        expect(response.body[0].language_code).to.eq('en');
                    }
                });
            });

            it('TC061 - Should get Matching content with x-encryption: false', () => {
                cy.getContentEncrypted(testContentId, false).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];
                    // correct_answer should be readable (not encrypted)
                    expect(content).to.have.property('correct_answer');
                    expect(content.correct_answer).to.be.an('array');
                });
            });

            it('TC062 - Should get Matching content with x-encryption: true', () => {
                cy.getContentEncrypted(testContentId, true).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];
                    expect(content).to.have.property('correct_answer');
                });
            });
        });

        // -----------------------------------------
        // NEGATIVE TESTS
        // -----------------------------------------
        describe('Negative Tests', () => {
            it('TC063 - Should return 404 for non-existent Matching content_id', () => {
                cy.getContent('Q999999999').then((response) => {
                    expect(response.status).to.be.oneOf([404, 400]);
                    expect(response.body).to.have.property('message');
                });
            });

            it('TC064 - Should return error for invalid content_id format', () => {
                cy.getContent('invalid_matching_id').then((response) => {
                    expect(response.status).to.be.oneOf([400, 404]);
                });
            });

            it('TC065 - Should handle SQL injection in content_id', () => {
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
            it('TC066 - Should handle extra query parameters (should be ignored)', () => {
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

            it('TC067 - Should verify question_type is Matching in response', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body[0].question_type).to.eq('Matching');
                });
            });

            it('TC068 - Should validate shuffle property in response', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body[0]).to.have.property('shuffle');
                    expect(response.body[0].shuffle).to.be.a('boolean');
                });
            });

            it('TC069 - Should validate show_titles property in response', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body[0]).to.have.property('show_titles');
                    expect(response.body[0].show_titles).to.be.a('boolean');
                });
            });
        });
    });
});
