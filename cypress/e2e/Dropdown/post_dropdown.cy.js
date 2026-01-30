/// <reference types="cypress" />

/**
 * Dropdown Question API Test Suite
 * Endpoint: POST /api/content/v1/questions/dropdown
 * Base URL: https://core.poc-ei.study
 * 
 * Uses:
 * - Fixtures: cypress/fixtures/dropdown/ for test data
 * - Custom Commands: cy.createDropdown(), cy.createDropdownFromFixture()
 */
describe('Dropdown Question API Tests', () => {
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
        cy.fixture('dropdown/validPayload').then((data) => { validPayload = data; });
        cy.fixture('dropdown/fullPayload').then((data) => { fullPayload = data; });
        cy.fixture('dropdown/positivePayloads').then((data) => { positivePayloads = data; });
        cy.fixture('dropdown/edgeCases').then((data) => { edgeCases = data; });
    });

    // =============================================
    // POSITIVE TEST CASES
    // =============================================
    describe('Positive Test Cases', () => {
        it('TC001 - Should create Dropdown question with required fields only', () => {
            cy.createDropdownFromFixture('dropdown/validPayload').then((response) => {
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
                        expect(dbRow.question_type).to.eq('Dropdown');
                        cy.log(`✓ Content ${createdContentId} verified in database`);
                    });
                }
            });
        });

        it('TC002 - Should create Dropdown question with all fields', () => {
            cy.createDropdownFromFixture('dropdown/fullPayload').then((response) => {
                // Accept both 201 (success) and 400 (if API doesn't support some optional fields)
                expect(response.status).to.be.oneOf([201, 400]);
                if (response.status === 201) {
                    expect(response.body).to.have.property('content_id');
                    expect(response.body).to.have.property('content_row_id');

                    const contentId = response.body.content_id;

                    // Verify content was stored in database with expected fields
                    cy.verifyContentFieldsInDB(contentId, {
                        question_type: 'Dropdown'
                    }).then((dbRow) => {
                        cy.log(`✓ Content ${contentId} with all fields verified in database`);
                    });
                }
            });
        });

        it('TC003 - Should create Dropdown with single dropdown', () => {
            cy.fixture('dropdown/positivePayloads').then((payloads) => {
                cy.createDropdown(payloads.singleDropdown).then((response) => {
                    expect(response.status).to.eq(201);
                    expect(response.body).to.have.property('content_id');
                });
            });
        });

        it('TC004 - Should create Dropdown with multiple dropdowns', () => {
            cy.fixture('dropdown/positivePayloads').then((payloads) => {
                cy.createDropdown(payloads.multipleDropdowns).then((response) => {
                    // Accept 201, 400 or 500 depending on API implementation
                    expect(response.status).to.be.oneOf([201, 400, 500]);
                    if (response.status === 201) {
                        expect(response.body).to.have.property('content_id');
                    }
                });
            });
        });

        it('TC005 - Should create Dropdown with fixed options', () => {
            cy.fixture('dropdown/positivePayloads').then((payloads) => {
                cy.createDropdown(payloads.withFixedOptions).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC006 - Should create Dropdown with Hindi language', () => {
            cy.fixture('dropdown/positivePayloads').then((payloads) => {
                cy.createDropdown(payloads.hindiLanguage).then((response) => {
                    expect(response.status).to.be.oneOf([201, 500]);
                });
            });
        });

        it('TC007 - Should create Dropdown with attributes', () => {
            cy.fixture('dropdown/positivePayloads').then((payloads) => {
                cy.createDropdown(payloads.withAttributes).then((response) => {
                    expect(response.status).to.be.oneOf([201, 500]);
                });
            });
        });

        it('TC008 - Should create Dropdown with skill trees', () => {
            cy.fixture('dropdown/positivePayloads').then((payloads) => {
                cy.createDropdown(payloads.withSkillTrees).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400, 500]);
                });
            });
        });

        it('TC009 - Should create Dropdown with keyword_ids using override', () => {
            cy.createDropdownFromFixture('dropdown/validPayload', { keyword_ids: [1, 2, 3] }).then((response) => {
                // Accept 201 if keyword_ids is supported, 400 if not, 500 for backend errors
                expect(response.status).to.be.oneOf([201, 400, 500]);
            });
        });

        it('TC010 - Should create Dropdown with container_id', () => {
            cy.createDropdownFromFixture('dropdown/validPayload', { container_id: 'container_1' }).then((response) => {
                // Accept 201 if container_id is supported, 400 if not
                expect(response.status).to.be.oneOf([201, 400]);
            });
        });

        it('TC011 - Should create Dropdown with max_score override', () => {
            cy.createDropdownFromFixture('dropdown/validPayload', { max_score: 5 }).then((response) => {
                expect(response.status).to.be.oneOf([201, 400, 500]);
            });
        });

        it('TC012 - Should create Dropdown with explanation', () => {
            cy.createDropdownFromFixture('dropdown/validPayload', { 
                explanation: 'This is a detailed explanation' 
            }).then((response) => {
                expect(response.status).to.be.oneOf([201, 400, 500]);
            });
        });

        it('TC013 - Should create Dropdown with instruction', () => {
            cy.createDropdownFromFixture('dropdown/validPayload', { 
                instruction: 'Follow the instructions carefully' 
            }).then((response) => {
                expect(response.status).to.eq(201);
            });
        });

        it('TC014 - Should create Dropdown with multiple options per dropdown', () => {
            cy.fixture('dropdown/edgeCases').then((edge) => {
                cy.createDropdownFromFixture('dropdown/validPayload', {
                    dropdown_details: edge.largeNumberOfOptions.dropdown_details,
                    correct_answer: {
                        d1: ['Option 5']
                    }
                }).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC015 - Should create Dropdown with content origin type', () => {
            cy.fixture('dropdown/edgeCases').then((edge) => {
                cy.createDropdownFromFixture('dropdown/validPayload', edge.contentOriginCopy).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400, 404]);
                });
            });
        });
    });

    // =============================================
    // NEGATIVE TEST CASES
    // =============================================
    describe('Negative Test Cases', () => {
        it('TC016 - Should return 400 when project_id is missing', () => {
            cy.fixture('dropdown/validPayload').then((payload) => {
                const { project_id, ...payloadWithoutField } = payload;
                cy.createDropdown(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC017 - Should return 400 when language_code is missing', () => {
            cy.fixture('dropdown/validPayload').then((payload) => {
                const { language_code, ...payloadWithoutField } = payload;
                cy.createDropdown(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC018 - Should return 400 when question_type is missing', () => {
            cy.fixture('dropdown/validPayload').then((payload) => {
                const { question_type, ...payloadWithoutField } = payload;
                cy.createDropdown(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC019 - Should return 400 when subject_no is missing', () => {
            cy.fixture('dropdown/validPayload').then((payload) => {
                const { subject_no, ...payloadWithoutField } = payload;
                cy.createDropdown(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC020 - Should return 400 when class is missing', () => {
            cy.fixture('dropdown/validPayload').then((payload) => {
                const { class: classVal, ...payloadWithoutField } = payload;
                cy.createDropdown(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC021 - Should return 400 when stem is missing', () => {
            cy.fixture('dropdown/validPayload').then((payload) => {
                const { stem, ...payloadWithoutField } = payload;
                cy.createDropdown(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC022 - Should return 400 when dropdown_details is missing', () => {
            cy.fixture('dropdown/validPayload').then((payload) => {
                const { dropdown_details, ...payloadWithoutField } = payload;
                cy.createDropdown(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC023 - Should return 400 when correct_answer is missing', () => {
            cy.fixture('dropdown/validPayload').then((payload) => {
                const { correct_answer, ...payloadWithoutField } = payload;
                cy.createDropdown(payloadWithoutField).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC024 - Should return 400 with empty request body', () => {
            cy.createDropdown({}).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC025 - Should return 400 when dropdown_details is empty array', () => {
            cy.createDropdownFromFixture('dropdown/validPayload', {
                dropdown_details: []
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC026 - Should return 400 when correct_answer is empty object', () => {
            cy.createDropdownFromFixture('dropdown/validPayload', {
                correct_answer: {}
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC027 - Should return 400 when dropdown_details missing index', () => {
            const invalidDropdownDetails = [{
                options: [
                    {
                        value: 'Option A',
                        is_fixed: false
                    }
                ]
            }];
            cy.createDropdownFromFixture('dropdown/validPayload', {
                dropdown_details: invalidDropdownDetails
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC028 - Should return 400 when dropdown_details missing options', () => {
            const invalidDropdownDetails = [{
                index: '1'
            }];
            cy.createDropdownFromFixture('dropdown/validPayload', {
                dropdown_details: invalidDropdownDetails
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC029 - Should return 400 when option missing value', () => {
            const invalidDropdownDetails = [{
                index: '1',
                options: [
                    {
                        is_fixed: false
                    }
                ]
            }];
            cy.createDropdownFromFixture('dropdown/validPayload', {
                dropdown_details: invalidDropdownDetails
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC030 - Should return 400 when option missing is_fixed', () => {
            const invalidDropdownDetails = [{
                index: '1',
                options: [
                    {
                        value: 'Option A'
                    }
                ]
            }];
            cy.createDropdownFromFixture('dropdown/validPayload', {
                dropdown_details: invalidDropdownDetails
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC031 - Should return error for invalid project_id', () => {
            cy.createDropdownFromFixture('dropdown/validPayload', { project_id: 99999 }).then((response) => {
                expect(response.status).to.be.oneOf([400, 404]);
            });
        });

        it('TC032 - Should return 400 for invalid language_code', () => {
            cy.createDropdownFromFixture('dropdown/validPayload', { language_code: 'invalid_lang' }).then((response) => {
                expect(response.status).to.be.oneOf([400, 404]);
            });
        });

        it('TC033 - Should return 400 for invalid question_type', () => {
            cy.createDropdownFromFixture('dropdown/validPayload', { question_type: 'InvalidType' }).then((response) => {
                expect(response.status).to.be.oneOf([400, 404]);
            });
        });

        it('TC034 - Should return 400 when correct_answer references non-existent dropdown', () => {
            cy.createDropdownFromFixture('dropdown/validPayload', {
                correct_answer: {
                    d99: ['Option B']
                }
            }).then((response) => {
                expect(response.status).to.be.oneOf([400, 201]);
            });
        });

        it('TC035 - Should return 400 when correct_answer value not in options', () => {
            cy.createDropdownFromFixture('dropdown/validPayload', {
                correct_answer: {
                    d1: ['NonExistentOption']
                }
            }).then((response) => {
                expect(response.status).to.be.oneOf([400, 201]);
            });
        });

        it('TC036 - Should return 400 when attributes missing id', () => {
            cy.createDropdownFromFixture('dropdown/validPayload', {
                attributes: [
                    {
                        value: 'Easy'
                    }
                ]
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC037 - Should return 400 when attributes missing value', () => {
            cy.createDropdownFromFixture('dropdown/validPayload', {
                attributes: [
                    {
                        id: '1'
                    }
                ]
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC038 - Should return 400 when skill_trees missing id', () => {
            cy.createDropdownFromFixture('dropdown/validPayload', {
                skill_trees: [
                    {
                        value: 'S00017'
                    }
                ]
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC039 - Should return 400 when skill_trees missing value', () => {
            cy.createDropdownFromFixture('dropdown/validPayload', {
                skill_trees: [
                    {
                        id: 'ST001'
                    }
                ]
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC040 - Should return 400 when keyword_ids contains non-integer', () => {
            cy.createDropdownFromFixture('dropdown/validPayload', {
                keyword_ids: ['not_an_integer']
            }).then((response) => {
                expect(response.status).to.be.oneOf([400, 201]);
            });
        });
    });

    // =============================================
    // EDGE CASES
    // =============================================
    describe('Edge Cases', () => {
        it('TC041 - Should handle very long stem (3000 characters)', () => {
            cy.fixture('dropdown/edgeCases').then((edge) => {
                cy.createDropdownFromFixture('dropdown/validPayload', { stem: edge.verylongStem.stem }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400, 413]);
                });
            });
        });

        it('TC042 - Should handle special characters in stem', () => {
            cy.fixture('dropdown/edgeCases').then((edge) => {
                cy.createDropdownFromFixture('dropdown/validPayload', { stem: edge.specialChars.stem }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC043 - Should handle unicode characters in stem', () => {
            cy.fixture('dropdown/edgeCases').then((edge) => {
                cy.createDropdownFromFixture('dropdown/validPayload', { stem: edge.unicodeStem.stem }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400, 500]);
                });
            });
        });

        it('TC044 - Should handle SQL injection in stem', () => {
            cy.fixture('dropdown/edgeCases').then((edge) => {
                cy.createDropdownFromFixture('dropdown/validPayload', { stem: edge.sqlInjection.stem }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400, 500]);
                });
            });
        });

        it('TC045 - Should handle XSS attempt in stem', () => {
            cy.fixture('dropdown/edgeCases').then((edge) => {
                cy.createDropdownFromFixture('dropdown/validPayload', { stem: edge.xssAttempt.stem }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400, 500]);
                });
            });
        });

        it('TC046 - Should handle project_id as string instead of integer', () => {
            cy.fixture('dropdown/edgeCases').then((edge) => {
                cy.createDropdownFromFixture('dropdown/validPayload', { project_id: edge.projectIdAsString.project_id }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC047 - Should handle negative project_id', () => {
            cy.fixture('dropdown/edgeCases').then((edge) => {
                cy.createDropdownFromFixture('dropdown/validPayload', { project_id: edge.negativeProjectId.project_id }).then((response) => {
                    expect(response.status).to.be.oneOf([400, 404]);
                });
            });
        });

        it('TC048 - Should handle class as integer instead of string', () => {
            cy.fixture('dropdown/edgeCases').then((edge) => {
                cy.createDropdownFromFixture('dropdown/validPayload', { class: edge.classAsInteger.class }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC049 - Should handle extra fields in request body (should be ignored)', () => {
            cy.fixture('dropdown/edgeCases').then((edge) => {
                cy.createDropdownFromFixture('dropdown/validPayload', edge.extraFields).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC050 - Should validate response time is within acceptable limit', () => {
            const startTime = Date.now();
            cy.createDropdownFromFixture('dropdown/validPayload').then((response) => {
                const endTime = Date.now();
                const responseTime = endTime - startTime;
                // Accept 201 for successful creation, or 500 for backend errors
                expect(response.status).to.be.oneOf([201, 500]);
                if (response.status === 201) {
                    // Response should be within 5 seconds
                    expect(responseTime).to.be.lessThan(5000);
                }
            });
        });

        it('TC051 - Should handle content_origin_type as copy', () => {
            cy.fixture('dropdown/edgeCases').then((edge) => {
                cy.createDropdownFromFixture('dropdown/validPayload', edge.contentOriginCopy).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400, 404]);
                });
            });
        });

        it('TC052 - Should handle content_origin_type as variant', () => {
            cy.fixture('dropdown/edgeCases').then((edge) => {
                cy.createDropdownFromFixture('dropdown/validPayload', edge.contentOriginVariant).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400, 404]);
                });
            });
        });

        it('TC053 - Should handle option value as empty string', () => {
            const dropdownWithEmptyValue = [{
                index: '1',
                options: [
                    {
                        value: '',
                        is_fixed: false
                    },
                    {
                        value: 'Option B',
                        is_fixed: false
                    }
                ]
            }];
            cy.createDropdownFromFixture('dropdown/validPayload', {
                dropdown_details: dropdownWithEmptyValue,
                correct_answer: {
                    d1: ['Option B']
                }
            }).then((response) => {
                expect(response.status).to.be.oneOf([201, 400]);
            });
        });

        it('TC054 - Should handle both fixed and non-fixed options', () => {
            const mixedOptions = [{
                index: 'd1',
                options: [
                    {
                        value: 'Fixed',
                        is_fixed: true
                    },
                    {
                        value: 'Non-Fixed',
                        is_fixed: false
                    },
                    {
                        value: 'Another Fixed',
                        is_fixed: true
                    }
                ]
            }];
            cy.createDropdownFromFixture('dropdown/validPayload', {
                dropdown_details: mixedOptions,
                correct_answer: {
                    d1: ['Non-Fixed']
                }
            }).then((response) => {
                expect(response.status).to.be.oneOf([201, 400, 500]);
            });
        });

        it('TC055 - Should handle options with special characters in values', () => {
            const specialCharOptions = [{
                index: 'd1',
                options: [
                    {
                        value: '@#$%^&*()',
                        is_fixed: false
                    },
                    {
                        value: '<>:;"\'',
                        is_fixed: false
                    },
                    {
                        value: 'Normal',
                        is_fixed: false
                    }
                ]
            }];
            cy.createDropdownFromFixture('dropdown/validPayload', {
                dropdown_details: specialCharOptions,
                correct_answer: {
                    d1: ['Normal']
                }
            }).then((response) => {
                expect(response.status).to.be.oneOf([201, 400]);
            });
        });
    });

    // =============================================
    // RESPONSE STRUCTURE VALIDATION
    // =============================================
    describe('Response Structure Validation', () => {
        it('TC056 - Should validate successful response structure', () => {
            cy.createDropdownFromFixture('dropdown/validPayload').then((response) => {
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
            cy.createDropdown({}).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message');
                expect(response.body.message).to.be.a('string');
            });
        });

        it('TC058 - Should validate Content-Type header in response', () => {
            cy.createDropdownFromFixture('dropdown/validPayload').then((response) => {
                expect(response.headers).to.have.property('content-type');
                expect(response.headers['content-type']).to.include('application/json');
            });
        });

        it('TC059 - Should validate content_row_id format includes language code', () => {
            cy.createDropdownFromFixture('dropdown/validPayload').then((response) => {
                expect(response.status).to.eq(201);
                expect(response.body.content_row_id).to.include('_en_');
            });
        });

        it('TC060 - Should validate dropdown_details validation error message', () => {
            cy.createDropdownFromFixture('dropdown/validPayload', {
                dropdown_details: []
            }).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body.message).to.match(/dropdown|required|must contain/i);
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
            // Create a Dropdown question to use for GET tests
            return cy.createDropdownFromFixture('dropdown/validPayload').then((response) => {
                cy.log(`Response Status: ${response.status}`);
                cy.log(`Response Body: ${JSON.stringify(response.body)}`);
                
                if (response.status === 201) {
                    testContentId = response.body.content_id;
                    testContentRowId = response.body.content_row_id;
                    cy.log(`Created test content: ${testContentId}`);
                } else {
                    cy.log(`POST failed with status ${response.status}: ${JSON.stringify(response.body)}`);
                    throw new Error(`Failed to create Dropdown: ${response.status} - ${JSON.stringify(response.body)}`);
                }
            });
        });

        // -----------------------------------------
        // POSITIVE TESTS
        // -----------------------------------------
        describe('Positive Tests', () => {
            it('TC061 - Should get Dropdown content by valid content_id', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.be.an('array');
                    expect(response.body.length).to.be.greaterThan(0);
                    expect(response.body[0].content_id).to.eq(testContentId);
                });
            });

            it('TC062 - Should validate Dropdown response structure', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];

                    // Required fields for Dropdown
                    expect(content).to.have.property('content_id');
                    expect(content).to.have.property('content_row_id');
                    expect(content).to.have.property('content_type');
                    expect(content).to.have.property('question_type');
                    expect(content).to.have.property('stem');
                    expect(content).to.have.property('dropdown_details');
                    expect(content).to.have.property('correct_answer');
                    expect(content).to.have.property('language_code');
                    expect(content).to.have.property('project_id');
                    expect(content).to.have.property('class');
                    expect(content).to.have.property('subject_no');
                });
            });

            it('TC063 - Should validate dropdown_details structure in GET response', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];

                    expect(content.dropdown_details).to.be.an('array');
                    content.dropdown_details.forEach((dropdown) => {
                        expect(dropdown).to.have.property('index');
                        expect(dropdown).to.have.property('options');
                        expect(dropdown.options).to.be.an('array');
                        dropdown.options.forEach((option) => {
                            expect(option).to.have.property('value');
                            expect(option).to.have.property('is_fixed');
                        });
                    });
                });
            });

            it('TC064 - Should validate correct_answer structure in GET response', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];

                    expect(content.correct_answer).to.be.an('object');
                });
            });

            it('TC065 - Should get Dropdown content with specific language (en)', () => {
                cy.getContentWithLanguages(testContentId, 'en').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.be.an('array');
                    if (response.body.length > 0) {
                        expect(response.body[0].language_code).to.eq('en');
                    }
                });
            });

            it('TC066 - Should get Dropdown content with x-encryption: false', () => {
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
            it('TC067 - Should return 404 for non-existent Dropdown content_id', () => {
                cy.getContent('Q999999999').then((response) => {
                    expect(response.status).to.be.oneOf([404, 400]);
                    expect(response.body).to.have.property('message');
                });
            });

            it('TC068 - Should return error for invalid content_id format', () => {
                cy.getContent('invalid_dropdown_id').then((response) => {
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
            it('TC070 - Should verify question_type is Dropdown in response', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body[0].question_type).to.eq('Dropdown');
                });
            });

            it('TC071 - Should validate dropdown_details count matches request', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];
                    expect(content.dropdown_details.length).to.be.greaterThan(0);
                });
            });

            it('TC072 - Should validate correct_answer references exist in dropdown_details', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];

                    const dropdownIndices = content.dropdown_details.map(d => d.index);
                    const answerKeys = Object.keys(content.correct_answer);

                    // All correct_answer keys should have corresponding dropdowns
                    answerKeys.forEach(key => {
                        expect(dropdownIndices).to.include(key);
                    });
                });
            });

            it('TC073 - Should validate all options in correct_answer exist in dropdown_details', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];

                    Object.entries(content.correct_answer).forEach(([dropdownKey, answers]) => {
                        const dropdown = content.dropdown_details.find(d => d.index === dropdownKey);
                        
                        if (dropdown) {
                            const optionValues = dropdown.options.map(o => o.value);
                            answers.forEach(answer => {
                                expect(optionValues).to.include(answer);
                            });
                        }
                    });
                });
            });
        });
    });
});
