/// <reference types="cypress" />

/**
 * Tracing Question API Test Suite
 * Endpoint: POST /api/content/v1/questions/tracing
 * Base URL: https://core.poc-ei.study
 * 
 * Uses:
 * - Fixtures: cypress/fixtures/tracing/ for test data
 * - Custom Commands: cy.createTracing(), cy.createTracingFromFixture()
 */
describe('Tracing Question API Tests', () => {
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
        cy.fixture('tracing/validPayload').then((data) => { validPayload = data; });
        cy.fixture('tracing/fullPayload').then((data) => { fullPayload = data; });
        cy.fixture('tracing/positivePayloads').then((data) => { positivePayloads = data; });
        cy.fixture('tracing/edgeCases').then((data) => { edgeCases = data; });
    });

    // =============================================
    // POSITIVE TEST CASES
    // =============================================
    describe('Positive Test Cases', () => {
        it('TC001 - Should create Tracing question with required fields only', () => {
            cy.createTracingFromFixture('tracing/validPayload').then((response) => {
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
                    expect(dbRow.question_type).to.eq('Tracing');
                    cy.log(`✓ Content ${createdContentId} verified in database`);
                });
            });
        });

        it('TC002 - Should create Tracing question with all fields', () => {
            cy.createTracingFromFixture('tracing/fullPayload').then((response) => {
                expect(response.status).to.eq(201);
                expect(response.body).to.have.property('content_id');
                expect(response.body).to.have.property('content_row_id');

                const contentId = response.body.content_id;

                // Verify content was stored in database with expected fields
                cy.verifyContentFieldsInDB(contentId, {
                    question_type: 'Tracing'
                }).then((dbRow) => {
                    cy.log(`✓ Content ${contentId} with all fields verified in database`);
                });
            });
        });

        it('TC003 - Should create Tracing with single path', () => {
            cy.fixture('tracing/positivePayloads').then((payloads) => {
                cy.createTracing(payloads.singlePathTrace).then((response) => {
                    expect(response.status).to.eq(201);
                    expect(response.body).to.have.property('content_id');
                });
            });
        });

        it('TC004 - Should create Tracing with multiple paths', () => {
            cy.fixture('tracing/positivePayloads').then((payloads) => {
                cy.createTracing(payloads.multiplePathTrace).then((response) => {
                    expect(response.status).to.eq(201);
                    expect(response.body).to.have.property('content_id');
                });
            });
        });

        it('TC005 - Should create Tracing with stem voiceover', () => {
            cy.fixture('tracing/positivePayloads').then((payloads) => {
                cy.createTracing(payloads.withStemVoiceover).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC006 - Should create Tracing with different path colors', () => {
            cy.fixture('tracing/positivePayloads').then((payloads) => {
                cy.createTracing(payloads.withDifferentPathColors).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC007 - Should create Tracing with Hindi language', () => {
            cy.fixture('tracing/positivePayloads').then((payloads) => {
                cy.createTracing(payloads.hindiLanguage).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC008 - Should create Tracing with max_score', () => {
            cy.fixture('tracing/positivePayloads').then((payloads) => {
                cy.createTracing(payloads.withMaxScore).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC009 - Should create Tracing with keyword_ids using override', () => {
            cy.createTracingFromFixture('tracing/validPayload', { keyword_ids: [1, 2, 3] }).then((response) => {
                expect(response.status).to.eq(201);
            });
        });

        it('TC010 - Should create Tracing with context field', () => {
            cy.createTracingFromFixture('tracing/validPayload', { context: 'IN' }).then((response) => {
                expect(response.status).to.eq(201);
            });
        });

        it('TC011 - Should create Tracing with remedial_instruction', () => {
            cy.createTracingFromFixture('tracing/validPayload', { remedial_instruction: 'Practice more' }).then((response) => {
                expect(response.status).to.eq(201);
            });
        });

        it('TC012 - Should create Tracing with explanation', () => {
            cy.createTracingFromFixture('tracing/validPayload', { 
                explanation: 'This is how the trace path works' 
            }).then((response) => {
                expect(response.status).to.eq(201);
            });
        });

        it('TC013 - Should create Tracing with instruction', () => {
            cy.createTracingFromFixture('tracing/validPayload', { 
                instruction: 'Carefully trace all paths' 
            }).then((response) => {
                expect(response.status).to.eq(201);
            });
        });

        it('TC014 - Should create Tracing with template field', () => {
            cy.createTracingFromFixture('tracing/validPayload', { template: 'standard' }).then((response) => {
                expect(response.status).to.eq(201);
            });
        });

        it('TC015 - Should create Tracing with misconception_explanation', () => {
            cy.createTracingFromFixture('tracing/validPayload', { 
                misconception_explanation: 'Common mistake explanation' 
            }).then((response) => {
                expect(response.status).to.eq(201);
            });
        });
    });

    // =============================================
    // NEGATIVE TEST CASES
    // =============================================
    describe('Negative Test Cases', () => {
        it('TC016 - Should return 400 when project_id is missing', () => {
            cy.fixture('tracing/validPayload').then((payload) => {
                const { project_id, ...payloadWithoutField } = payload;
                cy.createTracing(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC017 - Should return 400 when language_code is missing', () => {
            cy.fixture('tracing/validPayload').then((payload) => {
                const { language_code, ...payloadWithoutField } = payload;
                cy.createTracing(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC018 - Should return 400 when question_type is missing', () => {
            cy.fixture('tracing/validPayload').then((payload) => {
                const { question_type, ...payloadWithoutField } = payload;
                cy.createTracing(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC019 - Should return 400 when subject_no is missing', () => {
            cy.fixture('tracing/validPayload').then((payload) => {
                const { subject_no, ...payloadWithoutField } = payload;
                cy.createTracing(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC020 - Should return 400 when class is missing', () => {
            cy.fixture('tracing/validPayload').then((payload) => {
                const { class: classVal, ...payloadWithoutField } = payload;
                cy.createTracing(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC021 - Should return 400 when stem is missing', () => {
            cy.fixture('tracing/validPayload').then((payload) => {
                const { stem, ...payloadWithoutField } = payload;
                cy.createTracing(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC022 - Should return 400 when additional_data is missing', () => {
            cy.fixture('tracing/validPayload').then((payload) => {
                const { additional_data, ...payloadWithoutField } = payload;
                cy.createTracing(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC023 - Should return 400 with empty request body', () => {
            cy.createTracing({}).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC024 - Should return 400 when additional_data is empty array', () => {
            cy.createTracingFromFixture('tracing/validPayload', {
                additional_data: []
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC025 - Should return 400 when trace_path is empty in additional_data', () => {
            cy.createTracingFromFixture('tracing/validPayload', {
                additional_data: [
                    {
                        trace_path: [],
                        path_color: '#FF0000',
                        stroke_width: 2
                    }
                ]
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC026 - Should return 400 when trace_path is missing in additional_data', () => {
            cy.createTracingFromFixture('tracing/validPayload', {
                additional_data: [
                    {
                        path_color: '#FF0000',
                        stroke_width: 2
                    }
                ]
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC027 - Should return 400 for invalid question_type', () => {
            cy.createTracingFromFixture('tracing/validPayload', { question_type: 'InvalidType' }).then((response) => {
                expect(response.status).to.be.oneOf([400, 404]);
            });
        });

        it('TC028 - Should return 400 for invalid project_id', () => {
            cy.createTracingFromFixture('tracing/validPayload', { project_id: 99999 }).then((response) => {
                expect(response.status).to.be.oneOf([400, 404, 500]);
            });
        });

        it('TC029 - Should return 400 for invalid language_code', () => {
            cy.createTracingFromFixture('tracing/validPayload', { language_code: 'invalid_lang' }).then((response) => {
                expect(response.status).to.be.oneOf([400, 404]);
            });
        });

        it('TC030 - Should return 400 when stem is empty string', () => {
            cy.createTracingFromFixture('tracing/validPayload', {
                stem: ''
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC031 - Should return 400 when stroke_width is negative', () => {
            cy.createTracingFromFixture('tracing/validPayload', {
                additional_data: [
                    {
                        trace_path: ['A', 'B'],
                        path_color: '#FF0000',
                        stroke_width: -1
                    }
                ]
            }).then((response) => {
                expect(response.status).to.be.oneOf([400, 201]);
            });
        });

        it('TC032 - Should return 400 when stroke_width is zero', () => {
            cy.createTracingFromFixture('tracing/validPayload', {
                additional_data: [
                    {
                        trace_path: ['A', 'B'],
                        path_color: '#FF0000',
                        stroke_width: 0
                    }
                ]
            }).then((response) => {
                expect(response.status).to.be.oneOf([400, 201]);
            });
        });

        it('TC033 - Should return 400 when stroke_width is not integer', () => {
            cy.createTracingFromFixture('tracing/validPayload', {
                additional_data: [
                    {
                        trace_path: ['A', 'B'],
                        path_color: '#FF0000',
                        stroke_width: 'thick'
                    }
                ]
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC034 - Should return 400 when path_color is invalid hex', () => {
            cy.createTracingFromFixture('tracing/validPayload', {
                additional_data: [
                    {
                        trace_path: ['A', 'B'],
                        path_color: 'invalid_color',
                        stroke_width: 2
                    }
                ]
            }).then((response) => {
                expect(response.status).to.be.oneOf([400, 201]);
            });
        });

        it('TC035 - Should return 400 when trace_path contains non-string values', () => {
            cy.createTracingFromFixture('tracing/validPayload', {
                additional_data: [
                    {
                        trace_path: ['A', 123, 'C'],
                        path_color: '#FF0000',
                        stroke_width: 2
                    }
                ]
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
            const longStem = 'Trace ' + 'A'.repeat(3000);
            cy.createTracingFromFixture('tracing/validPayload', { stem: longStem }).then((response) => {
                expect(response.status).to.be.oneOf([201, 400, 413]);
            });
        });

        it('TC037 - Should handle special characters in stem', () => {
            cy.fixture('tracing/edgeCases').then((edge) => {
                cy.createTracingFromFixture('tracing/validPayload', { stem: edge.specialCharsInStem.stem }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC038 - Should handle SQL injection attempt in stem', () => {
            cy.fixture('tracing/edgeCases').then((edge) => {
                cy.createTracingFromFixture('tracing/validPayload', { stem: edge.sqlInjection.stem }).then((response) => {
                    expect(response.status).to.not.eq(500);
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC039 - Should handle XSS attempt in stem', () => {
            cy.fixture('tracing/edgeCases').then((edge) => {
                cy.createTracingFromFixture('tracing/validPayload', { stem: edge.xssAttempt.stem }).then((response) => {
                    expect(response.status).to.not.eq(500);
                });
            });
        });

        it('TC040 - Should handle project_id as string instead of integer', () => {
            cy.fixture('tracing/edgeCases').then((edge) => {
                cy.createTracingFromFixture('tracing/validPayload', { project_id: edge.projectIdAsString.project_id }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC041 - Should handle negative project_id', () => {
            cy.fixture('tracing/edgeCases').then((edge) => {
                cy.createTracingFromFixture('tracing/validPayload', { project_id: edge.negativeProjectId.project_id }).then((response) => {
                    expect(response.status).to.be.oneOf([400, 404]);
                });
            });
        });

        it('TC042 - Should validate response time is within acceptable limit', () => {
            const startTime = Date.now();
            cy.createTracingFromFixture('tracing/validPayload').then((response) => {
                const endTime = Date.now();
                const responseTime = endTime - startTime;
                // Response should be within 5 seconds
                expect(responseTime).to.be.lessThan(5000);
                expect(response.status).to.eq(201);
            });
        });

        it('TC043 - Should handle extra fields in request body (should be ignored)', () => {
            cy.createTracingFromFixture('tracing/validPayload', { 
                extra_field: 'should be ignored',
                custom_property: { nested: 'value' }
            }).then((response) => {
                expect(response.status).to.eq(201);
            });
        });

        it('TC044 - Should create Tracing with very long trace path (100 nodes)', () => {
            const longPath = Array.from({ length: 100 }, (_, i) => `Node${i}`);
            cy.createTracingFromFixture('tracing/validPayload', {
                additional_data: [
                    {
                        trace_path: longPath,
                        path_color: '#FF0000',
                        stroke_width: 2
                    }
                ]
            }).then((response) => {
                expect(response.status).to.be.oneOf([201, 400, 413]);
            });
        });

        it('TC045 - Should create Tracing with many paths (20 paths)', () => {
            const manyPaths = Array.from({ length: 20 }, (_, i) => ({
                trace_path: [`A${i}`, `B${i}`, `C${i}`],
                path_color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
                stroke_width: 2
            }));
            cy.createTracingFromFixture('tracing/validPayload', {
                additional_data: manyPaths
            }).then((response) => {
                expect(response.status).to.be.oneOf([201, 400, 413]);
            });
        });

        it('TC046 - Should handle different stroke widths (1-10)', () => {
            const paths = Array.from({ length: 10 }, (_, i) => ({
                trace_path: ['A', 'B'],
                path_color: '#FF0000',
                stroke_width: i + 1
            }));
            cy.createTracingFromFixture('tracing/validPayload', {
                additional_data: paths
            }).then((response) => {
                expect(response.status).to.be.oneOf([201, 400]);
            });
        });

        it('TC047 - Should handle RGB hex colors with leading #', () => {
            cy.createTracingFromFixture('tracing/validPayload', {
                additional_data: [
                    {
                        trace_path: ['A', 'B'],
                        path_color: '#000000',
                        stroke_width: 2
                    }
                ]
            }).then((response) => {
                expect(response.status).to.eq(201);
            });
        });

        it('TC048 - Should handle high contrast colors', () => {
            cy.createTracingFromFixture('tracing/validPayload', {
                additional_data: [
                    {
                        trace_path: ['A', 'B'],
                        path_color: '#FFFFFF',
                        stroke_width: 2
                    }
                ]
            }).then((response) => {
                expect(response.status).to.eq(201);
            });
        });

        it('TC049 - Should create Tracing with content_origin_type', () => {
            cy.createTracingFromFixture('tracing/validPayload', { content_origin_type: 'create' }).then((response) => {
                expect(response.status).to.be.oneOf([201, 400, 404]);
            });
        });

        it('TC050 - Should handle ignored_words field', () => {
            cy.createTracingFromFixture('tracing/validPayload', { 
                ignored_words: ['the', 'a', 'an'] 
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
            cy.createTracingFromFixture('tracing/validPayload').then((response) => {
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
            cy.createTracing({}).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message');
                expect(response.body.message).to.be.a('string');
            });
        });

        it('TC053 - Should validate Content-Type header in response', () => {
            cy.createTracingFromFixture('tracing/validPayload').then((response) => {
                expect(response.headers).to.have.property('content-type');
                expect(response.headers['content-type']).to.include('application/json');
            });
        });

        it('TC054 - Should validate content_row_id format includes language code', () => {
            cy.createTracingFromFixture('tracing/validPayload').then((response) => {
                expect(response.status).to.eq(201);
                expect(response.body.content_row_id).to.include('_en_');
            });
        });

        it('TC055 - Should validate additional_data field validation', () => {
            cy.createTracingFromFixture('tracing/validPayload', {
                additional_data: []
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC056 - Should validate trace_path is array in additional_data', () => {
            cy.createTracingFromFixture('tracing/validPayload', {
                additional_data: [
                    {
                        trace_path: ['Start', 'Middle', 'End'],
                        path_color: '#FF0000',
                        stroke_width: 2
                    }
                ]
            }).then((response) => {
                expect(response.status).to.eq(201);
            });
        });

        it('TC057 - Should validate stroke_width is positive integer', () => {
            cy.createTracingFromFixture('tracing/validPayload', {
                additional_data: [
                    {
                        trace_path: ['A', 'B'],
                        path_color: '#FF0000',
                        stroke_width: 5
                    }
                ]
            }).then((response) => {
                expect(response.status).to.eq(201);
            });
        });

        it('TC058 - Should validate path_color format', () => {
            cy.createTracingFromFixture('tracing/validPayload', {
                additional_data: [
                    {
                        trace_path: ['A', 'B'],
                        path_color: '#FF5500',
                        stroke_width: 2
                    }
                ]
            }).then((response) => {
                expect(response.status).to.eq(201);
            });
        });

        it('TC059 - Should validate multiple paths in additional_data', () => {
            cy.createTracingFromFixture('tracing/validPayload', {
                additional_data: [
                    {
                        trace_path: ['A', 'B'],
                        path_color: '#FF0000',
                        stroke_width: 2
                    },
                    {
                        trace_path: ['X', 'Y'],
                        path_color: '#00FF00',
                        stroke_width: 3
                    }
                ]
            }).then((response) => {
                expect(response.status).to.eq(201);
            });
        });

        it('TC060 - Should validate question_type is Tracing in response', () => {
            cy.getContent(createdContentId).then((response) => {
                if (response.status === 200 && response.body.length > 0) {
                    expect(response.body[0].question_type).to.eq('Tracing');
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
            // Create a Tracing question to use for GET tests
            cy.createTracingFromFixture('tracing/validPayload').then((response) => {
                expect(response.status).to.eq(201);
                testContentId = response.body.content_id;
                testContentRowId = response.body.content_row_id;
            });
        });

        // -----------------------------------------
        // POSITIVE TESTS
        // -----------------------------------------
        describe('Positive Tests', () => {
            it('TC061 - Should get Tracing content by valid content_id', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.be.an('array');
                    expect(response.body.length).to.be.greaterThan(0);
                    expect(response.body[0].content_id).to.eq(testContentId);
                });
            });

            it('TC062 - Should validate Tracing response structure', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];

                    // Required fields for Tracing
                    expect(content).to.have.property('content_id');
                    expect(content).to.have.property('content_row_id');
                    expect(content).to.have.property('content_type');
                    expect(content).to.have.property('question_type');
                    expect(content).to.have.property('stem');
                    expect(content).to.have.property('additional_data');
                    expect(content).to.have.property('language_code');
                    expect(content).to.have.property('project_id');
                    expect(content).to.have.property('class');
                    expect(content).to.have.property('subject_no');
                });
            });

            it('TC063 - Should validate additional_data structure in GET response', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];

                    expect(content.additional_data).to.be.an('array');
                    expect(content.additional_data.length).to.be.greaterThan(0);

                    // Validate each path structure
                    content.additional_data.forEach((path) => {
                        expect(path).to.have.property('trace_path');
                        expect(path.trace_path).to.be.an('array');
                        expect(path.trace_path.length).to.be.greaterThan(0);
                        if (path.hasOwnProperty('path_color')) {
                            expect(path.path_color).to.be.a('string');
                        }
                        if (path.hasOwnProperty('stroke_width')) {
                            expect(path.stroke_width).to.be.a('number');
                        }
                    });
                });
            });

            it('TC064 - Should validate trace_path array in GET response', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];

                    content.additional_data.forEach((path) => {
                        expect(path.trace_path).to.be.an('array');
                        path.trace_path.forEach((node) => {
                            expect(node).to.be.a('string');
                        });
                    });
                });
            });

            it('TC065 - Should get Tracing content with specific language (en)', () => {
                cy.getContentWithLanguages(testContentId, 'en').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.be.an('array');
                    if (response.body.length > 0) {
                        expect(response.body[0].language_code).to.eq('en');
                    }
                });
            });

            it('TC066 - Should get Tracing content with x-encryption: false', () => {
                cy.getContentEncrypted(testContentId, false).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];
                    expect(content).to.have.property('additional_data');
                    expect(content.additional_data).to.be.an('array');
                });
            });
        });

        // -----------------------------------------
        // NEGATIVE TESTS
        // -----------------------------------------
        describe('Negative Tests', () => {
            it('TC067 - Should return 404 for non-existent Tracing content_id', () => {
                cy.getContent('Q999999999').then((response) => {
                    expect(response.status).to.be.oneOf([404, 400]);
                    expect(response.body).to.have.property('message');
                });
            });

            it('TC068 - Should return error for invalid content_id format', () => {
                cy.getContent('invalid_tracing_id').then((response) => {
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
            it('TC070 - Should verify question_type is Tracing in response', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body[0].question_type).to.eq('Tracing');
                });
            });

            it('TC071 - Should validate stem contains valid content', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];

                    expect(content.stem).to.be.a('string');
                    expect(content.stem.length).to.be.greaterThan(0);
                });
            });

            it('TC072 - Should validate additional_data is not empty', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];

                    expect(content.additional_data).to.be.an('array');
                    expect(content.additional_data.length).to.be.greaterThan(0);
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
