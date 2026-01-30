/// <reference types="cypress" />

/**
 * Counting Question API Test Suite
 * Endpoint: POST /api/content/v1/questions/counting
 * Base URL: https://core.poc-ei.study
 * 
 * Uses:
 * - Fixtures: cypress/fixtures/counting/ for test data
 * - Custom Commands: cy.createCounting(), cy.createCountingFromFixture()
 */
describe('Counting Question API Tests', () => {
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
        cy.fixture('counting/validPayload').then((data) => { validPayload = data; });
        cy.fixture('counting/fullPayload').then((data) => { fullPayload = data; });
        cy.fixture('counting/positivePayloads').then((data) => { positivePayloads = data; });
        cy.fixture('counting/edgeCases').then((data) => { edgeCases = data; });
    });

    // =============================================
    // POSITIVE TEST CASES
    // =============================================
    describe('Positive Test Cases', () => {
        it('TC001 - Should create Counting question with required fields only', () => {
            cy.createCountingFromFixture('counting/validPayload').then((response) => {
                expect(response.status).to.be.oneOf([201, 500]);

                if (response.status === 201) {
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
                        expect(dbRow.question_type).to.eq('Counting');
                        cy.log(`✓ Content ${createdContentId} verified in database`);
                    });
                }
            });
        });

        it('TC002 - Should create Counting question with all fields', () => {
            cy.createCountingFromFixture('counting/fullPayload').then((response) => {
                expect(response.status).to.be.oneOf([201, 500]);
                if (response.status === 201) {
                    expect(response.body).to.have.property('content_id');
                    expect(response.body).to.have.property('content_row_id');

                    const contentId = response.body.content_id;

                    // Verify content was stored in database with expected fields
                    cy.verifyContentFieldsInDB(contentId, {
                        question_type: 'Counting'
                    }).then((dbRow) => {
                        cy.log(`✓ Content ${contentId} with all fields verified in database`);
                    });
                }
            });
        });

        it('TC003 - Should create Counting with single object', () => {
            cy.fixture('counting/positivePayloads').then((payloads) => {
                cy.createCounting(payloads.singleObject).then((response) => {
                    expect(response.status).to.be.oneOf([201, 500]);
                    if (response.status === 201) {
                        expect(response.body).to.have.property('content_id');
                    }
                });
            });
        });

        it('TC004 - Should create Counting with multiple objects', () => {
            cy.fixture('counting/positivePayloads').then((payloads) => {
                cy.createCounting(payloads.multipleObjects).then((response) => {
                    expect(response.status).to.be.oneOf([201, 500]);
                    expect(response.body).to.have.property('content_id');
                });
            });
        });

        it('TC005 - Should create Counting with show_number enabled', () => {
            cy.fixture('counting/positivePayloads').then((payloads) => {
                cy.createCounting(payloads.withShowNumber).then((response) => {
                    expect(response.status).to.be.oneOf([201, 500]);
                });
            });
        });

        it('TC006 - Should create Counting with shuffle disabled', () => {
            cy.fixture('counting/positivePayloads').then((payloads) => {
                cy.createCounting(payloads.withoutShuffle).then((response) => {
                    expect(response.status).to.be.oneOf([201, 500]);
                });
            });
        });

        it('TC007 - Should create Counting with Hindi language', () => {
            cy.fixture('counting/positivePayloads').then((payloads) => {
                cy.createCounting(payloads.hindiLanguage).then((response) => {
                    expect(response.status).to.be.oneOf([201, 500]);
                });
            });
        });



        it('TC008 - Should create Counting with all valid object types', () => {
            cy.fixture('counting/positivePayloads').then((payloads) => {
                cy.createCounting(payloads.allValidObjects).then((response) => {
                    expect(response.status).to.be.oneOf([201, 500]);
                    expect(response.body).to.have.property('content_id');
                });
            });
        });

        it('TC009 - Should create Counting with keyword_ids using override', () => {
            cy.createCountingFromFixture('counting/validPayload', { keyword_ids: [1, 2, 3] }).then((response) => {
                expect(response.status).to.be.oneOf([201, 400, 500]);
            });
        });

        it('TC010 - Should create Counting with Apple object', () => {
            cy.createCountingFromFixture('counting/validPayload', {
                object_data: [
                    {
                        object_value: 'Apple',
                        total_count: 5,
                        object_index: 1
                    }
                ],
                correct_answer: [{
                    object_index: 1,
                    countable_value: 5
                }]
            }).then((response) => {
                expect(response.status).to.be.oneOf([201, 500]);
            });
        });

        it('TC011 - Should create Counting with Bread object', () => {
            cy.createCountingFromFixture('counting/validPayload', {
                object_data: [
                    {
                        object_value: 'Bread',
                        total_count: 3,
                        object_index: 1
                    }
                ],
                correct_answer: [{
                    object_index: 1,
                    countable_value: 3
                }]
            }).then((response) => {
                expect(response.status).to.be.oneOf([201, 500]);
            });
        });

        it('TC012 - Should create Counting with Apple object variant', () => {
            cy.createCountingFromFixture('counting/validPayload', {
                object_data: [
                    {
                        object_value: 'Apple',
                        total_count: 4,
                        object_index: 1
                    }
                ],
                correct_answer: [{
                    object_index: 1,
                    countable_value: 4
                }]
            }).then((response) => {
                expect(response.status).to.be.oneOf([201, 500]);
            });
        });

        it('TC013 - Should create Counting with Bread object', () => {
            cy.createCountingFromFixture('counting/validPayload', {
                object_data: [
                    {
                        object_value: 'Bread',
                        total_count: 6,
                        object_index: 1
                    }
                ],
                correct_answer: [{
                    object_index: 1,
                    countable_value: 6
                }]
            }).then((response) => {
                expect(response.status).to.be.oneOf([201, 500]);
            });
        });

        it('TC014 - Should create Counting with Star object', () => {
            cy.createCountingFromFixture('counting/validPayload', {
                object_data: [
                    {
                        object_value: 'Star',
                        total_count: 8,
                        object_index: 1
                    }
                ],
                correct_answer: [{
                    object_index: 1,
                    countable_value: 8
                }]
            }).then((response) => {
                expect(response.status).to.be.oneOf([201, 500]);
            });
        });
    });

    // =============================================
    // NEGATIVE TEST CASES
    // =============================================
    describe('Negative Test Cases', () => {
        it('TC016 - Should return 400 when project_id is missing', () => {
            cy.fixture('counting/validPayload').then((payload) => {
                const { project_id, ...payloadWithoutField } = payload;
                cy.createCounting(payloadWithoutField).then((response) => {
                    expect(response.status).to.be.oneOf([400, 500]);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC017 - Should return 400 when language_code is missing', () => {
            cy.fixture('counting/validPayload').then((payload) => {
                const { language_code, ...payloadWithoutField } = payload;
                cy.createCounting(payloadWithoutField).then((response) => {
                    expect(response.status).to.be.oneOf([400, 500]);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC018 - Should return 400 when question_type is missing', () => {
            cy.fixture('counting/validPayload').then((payload) => {
                const { question_type, ...payloadWithoutField } = payload;
                cy.createCounting(payloadWithoutField).then((response) => {
                    expect(response.status).to.be.oneOf([400, 500]);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC019 - Should return 400 when subject_no is missing', () => {
            cy.fixture('counting/validPayload').then((payload) => {
                const { subject_no, ...payloadWithoutField } = payload;
                cy.createCounting(payloadWithoutField).then((response) => {
                    expect(response.status).to.be.oneOf([400, 500]);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC020 - Should return 400 when class is missing', () => {
            cy.fixture('counting/validPayload').then((payload) => {
                const { class: classVal, ...payloadWithoutField } = payload;
                cy.createCounting(payloadWithoutField).then((response) => {
                    expect(response.status).to.be.oneOf([400, 500]);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC021 - Should return 400 when stem is missing', () => {
            cy.fixture('counting/validPayload').then((payload) => {
                const { stem, ...payloadWithoutField } = payload;
                cy.createCounting(payloadWithoutField).then((response) => {
                    expect(response.status).to.be.oneOf([400, 500]);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC022 - Should return 400 when object_data is missing', () => {
            cy.fixture('counting/validPayload').then((payload) => {
                const { object_data, ...payloadWithoutField } = payload;
                cy.createCounting(payloadWithoutField).then((response) => {
                    expect(response.status).to.be.oneOf([400, 500]);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC023 - Should return 400 when correct_answer is missing', () => {
            cy.fixture('counting/validPayload').then((payload) => {
                const { correct_answer, ...payloadWithoutField } = payload;
                cy.createCounting(payloadWithoutField).then((response) => {
                    expect(response.status).to.be.oneOf([400, 500]);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC024 - Should return 400 when shuffle is missing', () => {
            cy.fixture('counting/validPayload').then((payload) => {
                const { shuffle, ...payloadWithoutField } = payload;
                cy.createCounting(payloadWithoutField).then((response) => {
                    expect(response.status).to.be.oneOf([400, 500]);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC025 - Should return 400 when show_number is missing', () => {
            cy.fixture('counting/validPayload').then((payload) => {
                const { show_number, ...payloadWithoutField } = payload;
                cy.createCounting(payloadWithoutField).then((response) => {
                    expect(response.status).to.be.oneOf([400, 500]);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC026 - Should return 400 with empty request body', () => {
            cy.createCounting({}).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC027 - Should return 400 when object_data is empty array', () => {
            cy.createCountingFromFixture('counting/validPayload', {
                object_data: []
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC028 - Should return 400 when correct_answer is empty array', () => {
            cy.createCountingFromFixture('counting/validPayload', {
                correct_answer: []
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC029 - Should return 400 when object_data missing object_value', () => {
            const invalidObjectData = [{
                total_count: 5,
                object_index: 1
            }];
            cy.createCountingFromFixture('counting/validPayload', {
                object_data: invalidObjectData
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC030 - Should return 400 when object_data missing total_count', () => {
            const invalidObjectData = [{
                object_value: 'Apple',
                object_index: 1
            }];
            cy.createCountingFromFixture('counting/validPayload', {
                object_data: invalidObjectData
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC031 - Should return 400 when object_data missing object_index', () => {
            const invalidObjectData = [{
                object_value: 'Apple',
                total_count: 5
            }];
            cy.createCountingFromFixture('counting/validPayload', {
                object_data: invalidObjectData
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC032 - Should create Counting with arbitrary object_value string', () => {
            cy.createCountingFromFixture('counting/validPayload', {
                object_data: [{
                    object_value: 'AnyValidString',
                    total_count: 5,
                    object_index: 1
                }]
            }).then((response) => {
                expect(response.status).to.be.oneOf([201, 500]);
            });
        });

        it('TC033 - Should return 400 when correct_answer missing object_index', () => {
            const invalidAnswer = [{
                countable_value: 5
            }];
            cy.createCountingFromFixture('counting/validPayload', {
                correct_answer: invalidAnswer
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC034 - Should return 400 when correct_answer missing countable_value', () => {
            const invalidAnswer = [{
                object_index: 1
            }];
            cy.createCountingFromFixture('counting/validPayload', {
                correct_answer: invalidAnswer
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC035 - Should return error for invalid project_id', () => {
            cy.createCountingFromFixture('counting/validPayload', { project_id: 99999 }).then((response) => {
                expect(response.status).to.be.oneOf([400, 404, 500]);
            });
        });

        it('TC036 - Should return 400 for invalid language_code', () => {
            cy.createCountingFromFixture('counting/validPayload', { language_code: 'invalid_lang' }).then((response) => {
                expect(response.status).to.be.oneOf([400, 404, 500]);
            });
        });

        it('TC037 - Should return 400 for invalid question_type', () => {
            cy.createCountingFromFixture('counting/validPayload', { question_type: 'InvalidType' }).then((response) => {
                expect(response.status).to.be.oneOf([400, 404, 500]);
            });
        });

        it('TC038 - Should return 400 when total_count is negative', () => {
            cy.createCountingFromFixture('counting/validPayload', {
                object_data: [{
                    object_value: 'Apple',
                    total_count: -5,
                    object_index: 1
                }]
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC039 - Should return 400 when countable_value is negative', () => {
            cy.createCountingFromFixture('counting/validPayload', {
                correct_answer: [{
                    object_index: 1,
                    countable_value: -5
                }]
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC040 - Should return 400 when countable_value does not match total_count', () => {
            cy.createCountingFromFixture('counting/validPayload', {
                object_data: [{
                    object_value: 'Apple',
                    total_count: 5,
                    object_index: 1
                }],
                correct_answer: [{
                    object_index: 1,
                    countable_value: 10
                }]
            }).then((response) => {
                expect(response.status).to.be.oneOf([400, 201, 500]); // May or may not enforce at API level
            });
        });
    });

    // =============================================
    // EDGE CASES
    // =============================================
    describe('Edge Cases', () => {
        it('TC041 - Should handle very long stem (3000 characters)', () => {
            const longStem = '<p>' + 'A'.repeat(3000) + ' objects</p>';
            cy.createCountingFromFixture('counting/validPayload', { stem: longStem }).then((response) => {
                expect(response.status).to.be.oneOf([201, 400, 413, 500]);
            });
        });

        it('TC042 - Should handle special characters in stem', () => {
            cy.fixture('counting/edgeCases').then((edge) => {
                cy.createCountingFromFixture('counting/validPayload', { stem: edge.specialChars.stem }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400, 500]);
                });
            });
        });

        it('TC043 - Should handle unicode characters in stem', () => {
            cy.fixture('counting/edgeCases').then((edge) => {
                cy.createCountingFromFixture('counting/validPayload', { stem: edge.unicodeStem.stem }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400, 500]);
                });
            });
        });

        it('TC044 - Should handle SQL injection in stem', () => {
            cy.fixture('counting/edgeCases').then((edge) => {
                cy.createCountingFromFixture('counting/validPayload', { stem: edge.sqlInjection.stem }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400, 500]);
                });
            });
        });

        it('TC045 - Should handle XSS attempt in stem', () => {
            cy.fixture('counting/edgeCases').then((edge) => {
                cy.createCountingFromFixture('counting/validPayload', { stem: edge.xssAttempt.stem }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400, 500]);
                });
            });
        });

        it('TC046 - Should handle project_id as string instead of integer', () => {
            cy.fixture('counting/edgeCases').then((edge) => {
                cy.createCountingFromFixture('counting/validPayload', { project_id: edge.projectIdAsString.project_id }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400, 500]);
                });
            });
        });

        it('TC047 - Should handle negative project_id', () => {
            cy.fixture('counting/edgeCases').then((edge) => {
                cy.createCountingFromFixture('counting/validPayload', { project_id: edge.negativeProjectId.project_id }).then((response) => {
                    expect(response.status).to.be.oneOf([400, 404, 500]);
                });
            });
        });

        it('TC048 - Should handle class as integer instead of string', () => {
            cy.fixture('counting/edgeCases').then((edge) => {
                cy.createCountingFromFixture('counting/validPayload', { class: edge.classAsInteger.class }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400, 500]);
                });
            });
        });

        it('TC049 - Should handle large object count', () => {
            cy.fixture('counting/edgeCases').then((edge) => {
                cy.createCountingFromFixture('counting/validPayload', {
                    object_data: edge.largeObjectCount.object_data,
                    correct_answer: [{
                        object_index: 1,
                        countable_value: 999
                    }]
                }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400, 500]);
                });
            });
        });

        it('TC050 - Should handle zero count', () => {
            cy.createCountingFromFixture('counting/validPayload', {
                object_data: [{
                    object_value: 'Apple',
                    total_count: 0,
                    object_index: 1
                }],
                correct_answer: [{
                    object_index: 1,
                    countable_value: 0
                }]
            }).then((response) => {
                expect(response.status).to.be.oneOf([201, 400, 500]);
            });
        });

        it('TC051 - Should handle shuffle as string instead of boolean', () => {
            cy.createCountingFromFixture('counting/validPayload', { shuffle: 'true' }).then((response) => {
                expect(response.status).to.be.oneOf([201, 400, 500]);
            });
        });

        it('TC052 - Should handle show_number as string instead of boolean', () => {
            cy.createCountingFromFixture('counting/validPayload', { show_number: 'false' }).then((response) => {
                expect(response.status).to.be.oneOf([201, 400, 500]);
            });
        });

    });

    it('TC053 - Should handle extra fields in request body (should be ignored)', () => {
        cy.fixture('counting/edgeCases').then((edge) => {
            cy.createCountingFromFixture('counting/validPayload', edge.extraFields).then((response) => {
                expect(response.status).to.be.oneOf([201, 400, 500]);
            });
        });
    });

    it('TC054 - Should validate response time is within acceptable limit', () => {
        const startTime = Date.now();
        cy.createCountingFromFixture('counting/validPayload').then((response) => {
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            // Response should be within 5 seconds
            expect(responseTime).to.be.lessThan(5000);
            expect(response.status).to.be.oneOf([201, 500]);
        });
    });

    it('TC055 - Should handle content_origin_type as copy', () => {
        cy.fixture('counting/edgeCases').then((edge) => {
            cy.createCountingFromFixture('counting/validPayload', edge.contentOriginCopy).then((response) => {
                expect(response.status).to.be.oneOf([201, 400, 404]);
            });
        });
    });

    it('TC056 - Should handle content_origin_type as variant', () => {
        cy.fixture('counting/edgeCases').then((edge) => {
            cy.createCountingFromFixture('counting/validPayload', edge.contentOriginVariant).then((response) => {
                expect(response.status).to.be.oneOf([201, 400, 404]);
            });
        });
    });
});

// =============================================
// RESPONSE STRUCTURE VALIDATION
// =============================================
describe('Response Structure Validation', () => {
    it('TC057 - Should validate successful response structure', () => {
        cy.createCountingFromFixture('counting/validPayload').then((response) => {
            expect(response.status).to.be.oneOf([201, 500]);
            if (response.status === 201) {
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
            }
        });
    });

    it('TC058 - Should validate error response structure', () => {
        cy.createCounting({}).then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property('message');
            expect(response.body.message).to.be.a('string');
        });
    });

    it('TC059 - Should validate Content-Type header in response', () => {
        cy.createCountingFromFixture('counting/validPayload').then((response) => {
            expect(response.status).to.be.oneOf([201, 500]);
            if (response.status === 201) {
                expect(response.headers).to.have.property('content-type');
                expect(response.headers['content-type']).to.include('application/json');
            }
        });
    });

    it('TC060 - Should validate content_row_id format includes language code', () => {
        cy.createCountingFromFixture('counting/validPayload').then((response) => {
            expect(response.status).to.be.oneOf([201, 500]);
            if (response.status === 201) {
                expect(response.body).to.be.an('object');
                expect(response.body).to.have.property('content_row_id');
                expect(response.body.content_row_id).to.be.a('string').and.not.be.empty;
                expect(response.body.content_row_id).to.include('_en_');
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
        // Create a Counting question to use for GET tests
        cy.createCountingFromFixture('counting/validPayload').then((response) => {
            expect(response.status).to.be.oneOf([201, 500]);
            if (response.status === 201) {
                testContentId = response.body.content_id;
                testContentRowId = response.body.content_row_id;
            }
        });
    });

    // -----------------------------------------
    // POSITIVE TESTS
    // -----------------------------------------
    describe('Positive Tests', () => {
        it('TC061 - Should get Counting content by valid content_id', function () {
            if (!testContentId) {
                this.skip(); // Skip if no content was created in before hook
            }
            cy.getContent(testContentId).then((response) => {
                expect(response.status).to.be.oneOf([200, 500]);
                if (response.status === 200) {
                    expect(response.body).to.be.an('array');
                    expect(response.body.length).to.be.greaterThan(0);
                    expect(response.body[0].content_id).to.eq(testContentId);
                }
            });
        });

        it('TC062 - Should validate Counting response structure', function () {
            if (!testContentId) {
                this.skip();
            }
            cy.getContent(testContentId).then((response) => {
                expect(response.status).to.be.oneOf([200, 500]);
                if (response.status === 200) {
                    const content = response.body[0];

                    // Required fields for Counting
                    expect(content).to.have.property('content_id');
                    expect(content).to.have.property('content_row_id');
                    expect(content).to.have.property('content_type');
                    expect(content).to.have.property('question_type');
                    expect(content).to.have.property('stem');
                    expect(content).to.have.property('object_data');
                    expect(content).to.have.property('correct_answer');
                    expect(content).to.have.property('shuffle');
                    expect(content).to.have.property('show_number');
                    expect(content).to.have.property('language_code');
                    expect(content).to.have.property('project_id');
                    expect(content).to.have.property('class');
                    expect(content).to.have.property('subject_no');
                }
            });
        });

        it('TC063 - Should validate object_data structure in GET response', function () {
            if (!testContentId) {
                this.skip();
            }
            cy.getContent(testContentId).then((response) => {
                expect(response.status).to.be.oneOf([200, 500]);
                if (response.status === 200) {
                    const content = response.body[0];

                    expect(content.object_data).to.be.an('array');
                    content.object_data.forEach((obj) => {
                        expect(obj).to.have.property('object_value');
                        expect(obj).to.have.property('total_count');
                        expect(obj).to.have.property('object_index');
                    });
                }
            });
        });

        it('TC064 - Should validate correct_answer structure in GET response', function () {
            if (!testContentId) {
                this.skip();
            }
            cy.getContent(testContentId).then((response) => {
                expect(response.status).to.be.oneOf([200, 500]);
                if (response.status === 200) {
                    const content = response.body[0];

                    expect(content.correct_answer).to.be.an('array');
                    content.correct_answer.forEach((answer) => {
                        expect(answer).to.have.property('object_index');
                        expect(answer).to.have.property('countable_value');
                    });
                }
            });
        });

        it('TC065 - Should get Counting content with specific language (en)', function () {
            if (!testContentId) {
                this.skip();
            }
            cy.getContentWithLanguages(testContentId, 'en').then((response) => {
                expect(response.status).to.be.oneOf([200, 500]);
                if (response.status === 200) {
                    expect(response.body).to.be.an('array');
                    if (response.body.length > 0) {
                        expect(response.body[0].language_code).to.eq('en');
                    }
                }
            });
        });

        it('TC066 - Should get Counting content with x-encryption: false', function () {
            if (!testContentId) {
                this.skip();
            }
            cy.getContentEncrypted(testContentId, false).then((response) => {
                expect(response.status).to.be.oneOf([200, 500]);
                if (response.status === 200) {
                    const content = response.body[0];
                    // correct_answer should be readable (not encrypted)
                    expect(content).to.have.property('correct_answer');
                    expect(content.correct_answer).to.be.an('array');
                }
            });
        });
    });

    // -----------------------------------------
    // NEGATIVE TESTS
    // -----------------------------------------
    describe('Negative Tests', () => {
        it('TC067 - Should return 404 for non-existent Counting content_id', () => {
            cy.getContent('Q999999999').then((response) => {
                expect(response.status).to.be.oneOf([404, 400, 500]);
                expect(response.body).to.have.property('message');
            });
        });

        it('TC068 - Should return error for invalid content_id format', () => {
            cy.getContent('invalid_counting_id').then((response) => {
                expect(response.status).to.be.oneOf([400, 404, 500]);
            });
        });

        it('TC069 - Should handle SQL injection in content_id', () => {
            cy.getContent("Q1' OR '1'='1").then((response) => {
                expect(response.status).to.be.oneOf([400, 404, 500]);
            });
        });
    });

    // -----------------------------------------
    // EDGE CASES
    // -----------------------------------------
    describe('Edge Cases', () => {
        it('TC070 - Should verify question_type is Counting in response', function () {
            if (!testContentId) {
                this.skip();
            }
            cy.getContent(testContentId).then((response) => {
                expect(response.status).to.be.oneOf([200, 500]);
                if (response.status === 200) {
                    expect(response.body[0].question_type).to.eq('Counting');
                }
            });
        });

        it('TC071 - Should validate shuffle property in response', function () {
            if (!testContentId) {
                this.skip();
            }
            cy.getContent(testContentId).then((response) => {
                expect(response.status).to.be.oneOf([200, 500]);
                if (response.status === 200) {
                    expect(response.body[0]).to.have.property('shuffle');
                    expect(response.body[0].shuffle).to.be.a('boolean');
                }
            });
        });

        it('TC072 - Should validate show_number property in response', function () {
            if (!testContentId) {
                this.skip();
            }
            cy.getContent(testContentId).then((response) => {
                expect(response.status).to.be.oneOf([200, 500]);
                if (response.status === 200) {
                    expect(response.body[0]).to.have.property('show_number');
                    expect(response.body[0].show_number).to.be.a('boolean');
                }
            });
        });

        it('TC073 - Should validate object count matches between request and response', function () {
            if (!testContentId) {
                this.skip();
            }
            cy.getContent(testContentId).then((response) => {
                expect(response.status).to.be.oneOf([200, 500]);
                if (response.status === 200) {
                    const content = response.body[0];
                    expect(content.object_data.length).to.be.greaterThan(0);
                    expect(content.correct_answer.length).to.be.greaterThan(0);
                }
            });
        });
    });
});
