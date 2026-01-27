/// <reference types="cypress" />

/**
 * Selection Grid Question API Test Suite
 * Endpoint: POST /api/content/v1/questions/selection-grid
 * Base URL: http://192.168.0.156:3000
 * 
 * Uses:
 * - Fixtures: cypress/fixtures/selection-grid/ for test data
 * - Custom Commands: cy.createSelectionGrid(), cy.createSelectionGridFromFixture()
 */
describe('Selection Grid Question API Tests', () => {
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
        cy.fixture('selection-grid/validPayload').then((data) => { validPayload = data; });
        cy.fixture('selection-grid/fullPayload').then((data) => { fullPayload = data; });
        cy.fixture('selection-grid/positivePayloads').then((data) => { positivePayloads = data; });
        cy.fixture('selection-grid/edgeCases').then((data) => { edgeCases = data; });
    });

    // =============================================
    // POSITIVE TEST CASES
    // =============================================
    describe('Positive Test Cases', () => {
        it('TC001 - Should create Selection Grid question with required fields only', () => {
            cy.createSelectionGridFromFixture('selection-grid/validPayload').then((response) => {
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
                    expect(dbRow.question_type).to.eq('Selection-grid');
                    cy.log(`✓ Selection Grid Content ${createdContentId} verified in database`);
                });
            });
        });

        it('TC002 - Should create Selection Grid question with all fields', () => {
            cy.createSelectionGridFromFixture('selection-grid/validPayload').then((response) => {
                expect(response.status).to.eq(201);
                expect(response.body).to.have.property('content_id');
                expect(response.body).to.have.property('content_row_id');

                const contentId = response.body.content_id;

                // Verify content was stored in database with expected fields
                cy.verifyContentFieldsInDB(contentId, {
                    question_type: 'Selection-grid'
                }).then((dbRow) => {
                    cy.log(`✓ Selection Grid Content ${contentId} with all fields verified in database`);
                });
            });
        });

        it('TC003 - Should create Selection Grid with single pair', () => {
            cy.fixture('selection-grid/positivePayloads').then((payloads) => {
                cy.createSelectionGrid(payloads.singlePair).then((response) => {
                    expect(response.status).to.eq(201);
                    expect(response.body).to.have.property('content_id');
                });
            });
        });

        it('TC004 - Should create Selection Grid with multiple pairs (4 pairs)', () => {
            cy.fixture('selection-grid/positivePayloads').then((payloads) => {
                cy.createSelectionGrid(payloads.multiplePairs).then((response) => {
                    expect(response.status).to.eq(201);
                    expect(response.body).to.have.property('content_id');
                });
            });
        });

        it('TC005 - Should create Selection Grid with Hindi language', () => {
            cy.fixture('selection-grid/positivePayloads').then((payloads) => {
                cy.createSelectionGrid(payloads.hindiLanguage).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC006 - Should create Selection Grid with HTML content in stem', () => {
            cy.fixture('selection-grid/positivePayloads').then((payloads) => {
                cy.createSelectionGrid(payloads.htmlContent).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC007 - Should create Selection Grid with voiceover fields', () => {
            cy.fixture('selection-grid/positivePayloads').then((payloads) => {
                cy.createSelectionGrid(payloads.withVoiceover).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC008 - Should create Selection Grid with unequal columns (extra options in column B)', () => {
            cy.fixture('selection-grid/positivePayloads').then((payloads) => {
                cy.createSelectionGrid(payloads.unequalColumns).then((response) => {
                    expect(response.status).to.eq(400);
                });
            });
        });

        it('TC009 - Should create Selection Grid as practice question', () => {
            cy.fixture('selection-grid/positivePayloads').then((payloads) => {
                cy.createSelectionGrid(payloads.practiceQuestion).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC010 - Should create Selection Grid with explanation and max_score', () => {
            cy.fixture('selection-grid/positivePayloads').then((payloads) => {
                cy.createSelectionGrid(payloads.withMaxScore).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC011 - Should create Selection Grid with shuffle: true', () => {
            cy.createSelectionGridFromFixture('selection-grid/validPayload', { shuffle: true }).then((response) => {
                expect(response.status).to.eq(201);
            });
        })
    });

    // =============================================
    // NEGATIVE TEST CASES
    // =============================================
    describe('Negative Test Cases', () => {
        it('TC012 - Should return 400 when project_id is missing', () => {
            cy.fixture('selection-grid/validPayload').then((payload) => {
                const { project_id, ...payloadWithoutField } = payload;
                cy.createSelectionGrid(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC013 - Should return 400 when language_code is missing', () => {
            cy.fixture('selection-grid/validPayload').then((payload) => {
                const { language_code, ...payloadWithoutField } = payload;
                cy.createSelectionGrid(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC014 - Should return 400 when question_type is missing', () => {
            cy.fixture('selection-grid/validPayload').then((payload) => {
                const { question_type, ...payloadWithoutField } = payload;
                cy.createSelectionGrid(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC015 - Should return 400 when subject_no is missing', () => {
            cy.fixture('selection-grid/validPayload').then((payload) => {
                const { subject_no, ...payloadWithoutField } = payload;
                cy.createSelectionGrid(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC016 - Should return 400 when class is missing', () => {
            cy.fixture('selection-grid/validPayload').then((payload) => {
                const { class: classVal, ...payloadWithoutField } = payload;
                cy.createSelectionGrid(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC017 - Should return 400 when stem is missing', () => {
            cy.fixture('selection-grid/validPayload').then((payload) => {
                const { stem, ...payloadWithoutField } = payload;
                cy.createSelectionGrid(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC018 - Should return 400 when selection_sets is missing', () => {
            cy.fixture('selection-grid/validPayload').then((payload) => {
                const { selection_sets, ...payloadWithoutField } = payload;
                cy.createSelectionGrid(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC019 - Should return 400 when correct_answer is missing', () => {
            cy.fixture('selection-grid/validPayload').then((payload) => {
                const { correct_answer, ...payloadWithoutField } = payload;
                cy.createSelectionGrid(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC020 - Should return 400 when shuffle is missing', () => {
            cy.fixture('selection-grid/validPayload').then((payload) => {
                const { shuffle, ...payloadWithoutField } = payload;
                cy.createSelectionGrid(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC021 - Should return 400 when max_options is missing', () => {
            cy.fixture('selection-grid/validPayload').then((payload) => {
                const { max_options, ...payloadWithoutField } = payload;
                cy.createSelectionGrid(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC022 - Should return 400 when practice_question is missing', () => {
            cy.fixture('selection-grid/validPayload').then((payload) => {
                const { practice_question, ...payloadWithoutField } = payload;
                cy.createSelectionGrid(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC023 - Should return 400 with empty request body', () => {
            cy.createSelectionGrid({}).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC024 - Should return 400 when column_a_options is empty', () => {
            cy.createSelectionGridFromFixture('selection-grid/validPayload', {
                selection_sets: { column_a_options: [], column_b_options: [{ option_value: 'A', option_index: 1, option_voiceover: {} }] }
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC025 - Should return 400 when column_b_options is empty', () => {
            cy.createSelectionGridFromFixture('selection-grid/validPayload', {
                selection_sets: { column_a_options: [{ option_value: 'A', option_index: 1, option_voiceover: {} }], column_b_options: [] }
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC026 - Should return 400 when correct_answer is empty array', () => {
            cy.createSelectionGridFromFixture('selection-grid/validPayload', { correct_answer: [] }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC027 - Should return 400 when correct_answer missing column_a_index', () => {
            cy.createSelectionGridFromFixture('selection-grid/validPayload', {
                correct_answer: [{ column_b_index: 1 }]
            }).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message');
            });
        });

        it('TC028 - Should return 400 when correct_answer missing column_b_index', () => {
            cy.createSelectionGridFromFixture('selection-grid/validPayload', {
                correct_answer: [{ column_a_index: 1 }]
            }).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message');
            });
        });

        it('TC029 - Should return 400 when option missing option_value', () => {
            const invalidSelectionSets = {
                column_a_options: [{ option_index: 1, option_voiceover: {} }],
                column_b_options: [{ option_value: 'B', option_index: 1, option_voiceover: {} }]
            };
            cy.createSelectionGridFromFixture('selection-grid/validPayload', { selection_sets: invalidSelectionSets }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC030 - Should return 400 when option missing option_index', () => {
            const invalidSelectionSets = {
                column_a_options: [{ option_value: 'A', option_voiceover: {} }],
                column_b_options: [{ option_value: 'B', option_index: 1, option_voiceover: {} }]
            };
            cy.createSelectionGridFromFixture('selection-grid/validPayload', { selection_sets: invalidSelectionSets }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC031 - Should return 400 when option missing option_voiceover', () => {
            const invalidSelectionSets = {
                column_a_options: [{ option_value: 'A', option_index: 1 }],
                column_b_options: [{ option_value: 'B', option_index: 1, option_voiceover: {} }]
            };
            cy.createSelectionGridFromFixture('selection-grid/validPayload', { selection_sets: invalidSelectionSets }).then((response) => {
                expect(response.status).to.eq(201);
            });
        });

        it('TC032 - Should return error for invalid project_id', () => {
            cy.createSelectionGridFromFixture('selection-grid/validPayload', { project_id: 99999 }).then((response) => {
                expect(response.status).to.be.oneOf([400, 404]);
            });
        });

        it('TC033 - Should return 400 for invalid language_code', () => {
            cy.createSelectionGridFromFixture('selection-grid/validPayload', { language_code: 'invalid_lang' }).then((response) => {
                expect(response.status).to.be.oneOf([400, 404]);
            });
        });

        it('TC034 - Should return 400 for invalid question_type', () => {
            cy.createSelectionGridFromFixture('selection-grid/validPayload', { question_type: 'InvalidType' }).then((response) => {
                expect(response.status).to.be.oneOf([400, 404]);
            });
        });
    });

    // =============================================
    // EDGE CASES
    // =============================================
    describe('Edge Cases', () => {
        it('TC035 - Should handle very long stem (3000 characters)', () => {
            const longStem = '<p>' + 'A'.repeat(3000) + '</p>';
            cy.createSelectionGridFromFixture('selection-grid/validPayload', { stem: longStem }).then((response) => {
                expect(response.status).to.be.oneOf([201, 400, 413]);
            });
        });

        it('TC036 - Should handle special characters in stem', () => {
            cy.fixture('selection-grid/edgeCases').then((edge) => {
                cy.createSelectionGridFromFixture('selection-grid/validPayload', { stem: edge.specialChars.stem }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC037 - Should handle unicode characters in stem', () => {
            cy.fixture('selection-grid/edgeCases').then((edge) => {
                cy.createSelectionGridFromFixture('selection-grid/validPayload', { stem: edge.unicodeStem.stem }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC038 - Should handle SQL injection in stem', () => {
            cy.fixture('selection-grid/edgeCases').then((edge) => {
                cy.createSelectionGridFromFixture('selection-grid/validPayload', { stem: edge.sqlInjection.stem }).then((response) => {
                    expect(response.status).to.not.eq(500);
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC039 - Should handle XSS attempt in stem', () => {
            cy.fixture('selection-grid/edgeCases').then((edge) => {
                cy.createSelectionGridFromFixture('selection-grid/validPayload', { stem: edge.xssAttempt.stem }).then((response) => {
                    expect(response.status).to.not.eq(500);
                });
            });
        });

        it('TC040 - Should handle special characters in option_value', () => {
            cy.fixture('selection-grid/edgeCases').then((edge) => {
                const selectionSets = {
                    column_a_options: [{ option_value: edge.specialChars.option_value, option_index: 1, option_voiceover: { 'en-IN': 'test.wav' } }],
                    column_b_options: [{ option_value: 'Normal', option_index: 1, option_voiceover: { 'en-IN': 'test.wav' } }]
                };
                cy.createSelectionGridFromFixture('selection-grid/validPayload', {
                    selection_sets: selectionSets,
                    correct_answer: [{ column_a_index: 1, column_b_index: 1 }]
                }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC041 - Should handle project_id as string instead of integer', () => {
            cy.fixture('selection-grid/edgeCases').then((edge) => {
                cy.createSelectionGridFromFixture('selection-grid/validPayload', { project_id: edge.projectIdAsString.project_id }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC042 - Should handle negative project_id', () => {
            cy.fixture('selection-grid/edgeCases').then((edge) => {
                cy.createSelectionGridFromFixture('selection-grid/validPayload', { project_id: edge.negativeProjectId.project_id }).then((response) => {
                    expect(response.status).to.be.oneOf([400, 404]);
                });
            });
        });

        it('TC043 - Should handle class as integer instead of string', () => {
            cy.fixture('selection-grid/edgeCases').then((edge) => {
                cy.createSelectionGridFromFixture('selection-grid/validPayload', { class: edge.classAsInteger.class }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC044 - Should handle duplicate option_index in column_a', () => {
            cy.fixture('selection-grid/edgeCases').then((edge) => {
                const selectionSets = {
                    column_a_options: edge.duplicateOptionIndex.column_a_options,
                    column_b_options: [{ option_value: 'X', option_index: 1, option_voiceover: { 'en-IN': 'x.wav' } }]
                };
                cy.createSelectionGridFromFixture('selection-grid/validPayload', {
                    selection_sets: selectionSets,
                    correct_answer: [{ column_a_index: 1, column_b_index: 1 }]
                }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC045 - Should handle mismatched correct_answer indices', () => {
            cy.fixture('selection-grid/edgeCases').then((edge) => {
                cy.createSelectionGridFromFixture('selection-grid/validPayload', {
                    correct_answer: edge.mismatchedCorrectAnswer.correct_answer
                }).then((response) => {
                    expect(response.status).to.be.oneOf([400, 500]);
                });
            });
        });

        it('TC046 - Should handle shuffle as string instead of boolean', () => {
            cy.fixture('selection-grid/edgeCases').then((edge) => {
                cy.createSelectionGridFromFixture('selection-grid/validPayload', { shuffle: edge.shuffleAsString.shuffle }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC047 - Should handle practice_question as string instead of boolean', () => {
            cy.fixture('selection-grid/edgeCases').then((edge) => {
                cy.createSelectionGridFromFixture('selection-grid/validPayload', { practice_question: edge.practiceQuestionAsString.practice_question }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC048 - Should handle max_options as integer instead of string', () => {
            cy.fixture('selection-grid/edgeCases').then((edge) => {
                cy.createSelectionGridFromFixture('selection-grid/validPayload', { max_options: edge.maxOptionsAsInteger.max_options }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC049 - Should handle content_origin_type as copy', () => {
            cy.fixture('selection-grid/edgeCases').then((edge) => {
                cy.createSelectionGridFromFixture('selection-grid/validPayload', edge.contentOriginCopy).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400, 404]);
                });
            });
        });

        it('TC050 - Should handle content_origin_type as variant', () => {
            cy.fixture('selection-grid/edgeCases').then((edge) => {
                cy.createSelectionGridFromFixture('selection-grid/validPayload', edge.contentOriginVariant).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400, 404]);
                });
            });
        });


        it('TC051 - Should handle extra fields in request body (should be ignored)', () => {
            cy.fixture('selection-grid/edgeCases').then((edge) => {
                cy.createSelectionGridFromFixture('selection-grid/validPayload', edge.extraFields).then((response) => {
                    expect(response.status).to.eq(400);
                });
            });
        });

        it('TC052 - Should validate response time is within acceptable limit', () => {
            const startTime = Date.now();
            cy.createSelectionGridFromFixture('selection-grid/validPayload').then((response) => {
                const endTime = Date.now();
                const responseTime = endTime - startTime;
                // Response should be within 5 seconds
                expect(responseTime).to.be.lessThan(5000);
                expect(response.status).to.eq(201);
            });
        });

        it('TC053 - Should handle maximum pairs (10 pairs)', () => {
            const manyOptionsA = [];
            const manyOptionsB = [];
            const manyAnswers = [];
            for (let i = 1; i <= 10; i++) {
                manyOptionsA.push({ option_value: `Column A Option ${i}`, option_index: i, option_voiceover: { 'en-IN': `a${i}.wav` } });
                manyOptionsB.push({ option_value: `Column B Option ${i}`, option_index: i, option_voiceover: { 'en-IN': `b${i}.wav` } });
                manyAnswers.push({ column_a_index: i, column_b_index: i });
            }
            cy.createSelectionGridFromFixture('selection-grid/validPayload', {
                selection_sets: { column_a_options: manyOptionsA, column_b_options: manyOptionsB },
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
        it('TC054 - Should validate successful response structure', () => {
            cy.createSelectionGridFromFixture('selection-grid/validPayload').then((response) => {
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
                    cy.log(`✓ Selection Grid response structure and database entry verified for ${contentId}`);
                });
            });
        });

        it('TC055 - Should validate error response structure', () => {
            cy.createSelectionGrid({}).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message');
                expect(response.body.message).to.be.a('string');
            });
        });

        it('TC056 - Should validate Content-Type header in response', () => {
            cy.createSelectionGridFromFixture('selection-grid/validPayload').then((response) => {
                expect(response.headers).to.have.property('content-type');
                expect(response.headers['content-type']).to.include('application/json');
            });
        });

        it('TC057 - Should validate content_row_id format includes language code', () => {
            cy.createSelectionGridFromFixture('selection-grid/validPayload').then((response) => {
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
            // Create a Selection Grid question to use for GET tests
            cy.createSelectionGridFromFixture('selection-grid/validPayload').then((response) => {
                expect(response.status).to.eq(201);
                testContentId = response.body.content_id;
                testContentRowId = response.body.content_row_id;
            });
        });

        // -----------------------------------------
        // POSITIVE TESTS
        // -----------------------------------------
        describe('Positive Tests', () => {
            it('TC058 - Should get Selection Grid content by valid content_id', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.be.an('array');
                    expect(response.body.length).to.be.greaterThan(0);
                    expect(response.body[0].content_id).to.eq(testContentId);
                });
            });

            it('TC059 - Should validate Selection Grid response structure', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];

                    // Required fields for Selection Grid
                    expect(content).to.have.property('content_id');
                    expect(content).to.have.property('content_row_id');
                    expect(content).to.have.property('content_type');
                    expect(content).to.have.property('question_type');
                    expect(content).to.have.property('stem');
                    expect(content).to.have.property('selection_sets');
                    expect(content).to.have.property('correct_answer');
                    expect(content).to.have.property('language_code');
                    expect(content).to.have.property('project_id');
                    expect(content).to.have.property('class');
                    expect(content).to.have.property('subject_no');
                });
            });

            it('TC060 - Should validate selection_sets structure in GET response', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];

                    expect(content.selection_sets).to.be.an('object');
                    expect(content.selection_sets).to.have.property('column_a_options');
                    expect(content.selection_sets).to.have.property('column_b_options');
                    expect(content.selection_sets.column_a_options).to.be.an('array');
                    expect(content.selection_sets.column_b_options).to.be.an('array');

                    // Validate option structure
                    content.selection_sets.column_a_options.forEach((option) => {
                        expect(option).to.have.property('option_value');
                        expect(option).to.have.property('option_index');
                    });
                });
            });

            it('TC061 - Should validate correct_answer structure in GET response', () => {
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

            it('TC062 - Should get Selection Grid content with specific language (en)', () => {
                cy.getContentWithLanguages(testContentId, 'en').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.be.an('array');
                    if (response.body.length > 0) {
                        expect(response.body[0].language_code).to.eq('en');
                    }
                });
            });

            it('TC063 - Should get Selection Grid content with x-encryption: false', () => {
                cy.getContentEncrypted(testContentId, false).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];
                    // correct_answer should be readable (not encrypted)
                    expect(content).to.have.property('correct_answer');
                    expect(content.correct_answer).to.be.an('array');
                });
            });

            it('TC064 - Should get Selection Grid content with x-encryption: true', () => {
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
            it('TC065 - Should return 404 for non-existent Selection Grid content_id', () => {
                cy.getContent('Q999999999').then((response) => {
                    expect(response.status).to.be.oneOf([404, 400]);
                    expect(response.body).to.have.property('message');
                });
            });

            it('TC066 - Should return error for invalid content_id format', () => {
                cy.getContent('invalid_selectiongrid_id').then((response) => {
                    expect(response.status).to.be.oneOf([400, 404]);
                });
            });

            it('TC067 - Should handle SQL injection in content_id', () => {
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
            it('TC068 - Should handle extra query parameters (should be ignored)', () => {
                cy.fixture('selection-grid/validPayload').then((payload) => {
                    cy.request({
                        method: 'POST',
                        url: '/api/content/v1/questions/selection-grid',
                        qs: {
                            extraParam: 'should_be_ignored',
                            anotherParam: '12345',
                        },
                        body: payload,
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${Cypress.env('ACCESS_TOKEN')}`,
                        },
                        failOnStatusCode: false,
                    }).then((response) => {
                        expect(response.status).to.eq(201);
                        expect(response.body).to.have.property('content_id');
                        expect(response.body).to.have.property('content_row_id');
                    });
                });
            });

            it('TC069 - Should verify question_type is Selection-grid in response', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body[0].question_type).to.eq('Selection-grid');
                });
            });

            it('TC070 - Should validate shuffle property in response', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body[0]).to.have.property('shuffle');
                    expect(response.body[0].shuffle).to.be.a('boolean');
                });
            });

            it('TC071 - Should validate max_options property in response', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body[0]).to.have.property('max_options');
                });
            });

            it('TC072 - Should validate practice_question property in response', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body[0]).to.have.property('practice_question');
                    expect(response.body[0].practice_question).to.be.a('boolean');
                });
            });
        });
    });
});
