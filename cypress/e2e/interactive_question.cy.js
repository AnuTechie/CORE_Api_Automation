/// <reference types="cypress" />

/**
 * Interactive Question API Test Suite
 * Endpoint: POST /api/content/v1/questions/interactive
 * Base URL: https://core.poc-ei.study
 *
 * Uses:
 * - Fixtures: cypress/fixtures/interactive/ for test data
 * - Custom Commands: cy.createInteractive(), cy.createInteractiveFromFixture()
 */
describe('Interactive Question API Tests', () => {
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
        cy.fixture('interactive/validPayload').then((data) => { validPayload = data; });
        cy.fixture('interactive/fullPayload').then((data) => { fullPayload = data; });
        cy.fixture('interactive/positivePayloads').then((data) => { positivePayloads = data; });
        cy.fixture('interactive/edgeCases').then((data) => { edgeCases = data; });
    });

    // =============================================
    // POSITIVE TEST CASES
    // =============================================
    describe('Positive Test Cases', () => {
        it('TC001 - Should create Interactive question with required fields only', () => {
            cy.fixture('interactive/validPayload').then((payload) => {
                cy.log('===== TC001 REQUEST =====');
                cy.log('Payload:', JSON.stringify(payload, null, 2));
                cy.createInteractiveFromFixture('interactive/validPayload').then((response) => {
                    cy.log('===== TC001 RESPONSE =====');
                    cy.log('Status:', response.status);
                    cy.log('Headers:', JSON.stringify(response.headers, null, 2));
                    cy.log('Body:', JSON.stringify(response.body, null, 2));
                    expect(response.status).to.eq(201);
                    expect(response.body).to.have.property('content_id');
                    expect(response.body).to.have.property('content_row_id');
                    expect(response.body.content_id).to.be.a('string').and.not.be.empty;
                    expect(response.body.content_row_id).to.be.a('string').and.not.be.empty;

                    createdContentId = response.body.content_id;
                    createdContentRowId = response.body.content_row_id;

                    cy.verifyContentInDB(createdContentId).then((dbRow) => {
                        expect(dbRow, 'Content should exist in database').to.not.be.null;
                        expect(dbRow.content_id).to.eq(createdContentId);
                        expect(dbRow.question_type).to.eq('Interactive');
                        cy.log(`✓ Content ${createdContentId} verified in database`);
                    });
                });
            });
        });

        it('TC002 - Should create Interactive question with all fields', () => {
            cy.fixture('interactive/fullPayload').then((payload) => {
                cy.log('===== TC002 REQUEST =====');
                cy.log('Payload:', JSON.stringify(payload, null, 2));
                cy.createInteractiveFromFixture('interactive/fullPayload').then((response) => {
                    cy.log('===== TC002 RESPONSE =====');
                    cy.log('Status:', response.status);
                    cy.log('Body:', JSON.stringify(response.body, null, 2));
                    expect(response.status).to.eq(201);
                    expect(response.body).to.have.property('content_id');
                    expect(response.body).to.have.property('content_row_id');

                    const contentId = response.body.content_id;
                    cy.verifyContentFieldsInDB(contentId, {
                        question_type: 'Interactive'
                    }).then((dbRow) => {
                        cy.log(`✓ Content ${contentId} with all fields verified in database`);
                    });
                });
            });
        });

        it('TC003 - Should create Interactive with container_ids and attributes', () => {
            cy.fixture('interactive/positivePayloads').then((payloads) => {
                cy.log('===== TC003 REQUEST =====');
                cy.log('Payload:', JSON.stringify(payloads.withContainerIdsAndAttributes, null, 2));
                cy.createInteractive(payloads.withContainerIdsAndAttributes).then((response) => {
                    cy.log('===== TC003 RESPONSE =====');
                    cy.log('Status:', response.status);
                    cy.log('Body:', JSON.stringify(response.body, null, 2));
                    expect(response.status).to.eq(201);
                    expect(response.body).to.have.property('content_id');
                });
            });
        });

        it('TC004 - Should create Interactive with stem_voiceover', () => {
            cy.fixture('interactive/positivePayloads').then((payloads) => {
                cy.log('===== TC004 REQUEST =====');
                cy.log('Payload:', JSON.stringify(payloads.withStemVoiceover, null, 2));
                cy.createInteractive(payloads.withStemVoiceover).then((response) => {
                    cy.log('===== TC004 RESPONSE =====');
                    cy.log('Status:', response.status);
                    cy.log('Body:', JSON.stringify(response.body, null, 2));
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC005 - Should create Interactive with skill_trees', () => {
            cy.fixture('interactive/positivePayloads').then((payloads) => {
                cy.log('===== TC005 REQUEST =====');
                cy.log('Payload:', JSON.stringify(payloads.withSkillTrees, null, 2));
                cy.createInteractive(payloads.withSkillTrees).then((response) => {
                    cy.log('===== TC005 RESPONSE =====');
                    cy.log('Status:', response.status);
                    cy.log('Body:', JSON.stringify(response.body, null, 2));
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC006 - Should create Interactive with custom attributes', () => {
            cy.fixture('interactive/positivePayloads').then((payloads) => {
                cy.log('===== TC006 REQUEST =====');
                cy.log('Payload:', JSON.stringify(payloads.customAttributes, null, 2));
                cy.createInteractive(payloads.customAttributes).then((response) => {
                    cy.log('===== TC006 RESPONSE =====');
                    cy.log('Status:', response.status);
                    cy.log('Body:', JSON.stringify(response.body, null, 2));
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC007 - Should create Interactive with Hindi language', () => {
            cy.fixture('interactive/positivePayloads').then((payloads) => {
                cy.log('===== TC007 REQUEST =====');
                cy.log('Payload:', JSON.stringify(payloads.hindiLanguage, null, 2));
                cy.createInteractive(payloads.hindiLanguage).then((response) => {
                    cy.log('===== TC007 RESPONSE =====');
                    cy.log('Status:', response.status);
                    cy.log('Body:', JSON.stringify(response.body, null, 2));
                    expect(response.status).to.eq(201);
                });
            });
        });

        it('TC008 - Should create Interactive with content_origin_type as copy', () => {
            cy.fixture('interactive/positivePayloads').then((payloads) => {
                cy.createInteractive(payloads.contentOriginCopy).then((response) => {
                    expect(response.status).to.eq(201);
                });
            });
        });
    });

    // =============================================
    // NEGATIVE TEST CASES
    // =============================================
    describe('Negative Test Cases', () => {
        const requiredFields = [
            'project_id','language_code','subject_no','class','question_type',
            'container_ids','stem','stem_voiceover','template','max_score',
            'explanation','testing_objective','attributes','skill_trees'
        ];

        requiredFields.forEach((field, idx) => {
            it(`TC0${20 + idx} - Should return 400 when ${field} is missing`, () => {
                cy.fixture('interactive/validPayload').then((payload) => {
                    const { [field]: removed, ...payloadWithoutField } = payload;
                    cy.createInteractive(payloadWithoutField).then((response) => {
                        expect(response.status).to.eq(400);
                        expect(response.body).to.have.property('message');
                    });
                });
            });
        });

        it('TC030 - Should return 400 with empty request body', () => {
            cy.createInteractive({}).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC031 - Should return 400 for invalid template value', () => {
            cy.createInteractiveFromFixture('interactive/validPayload', {
                template: 'invalid_template'
            }).then((response) => {
                expect(response.status).to.be.oneOf([400, 404]);
            });
        });

        it('TC032 - Should return error for invalid project_id', () => {
            cy.createInteractiveFromFixture('interactive/validPayload', { project_id: 99999 }).then((response) => {
                expect(response.status).to.be.oneOf([400, 404]);
            });
        });

        it('TC033 - Should return 400 for invalid language_code', () => {
            cy.createInteractiveFromFixture('interactive/validPayload', { language_code: 'invalid_lang' }).then((response) => {
                expect(response.status).to.be.oneOf([400, 404]);
            });
        });
    });

    // =============================================
    // EDGE CASES
    // =============================================
    describe('Edge Cases', () => {
        it('TC040 - Should handle very long stem (3000 characters)', () => {
            const longStem = '<p>' + 'A'.repeat(3000) + ' <span class="interactive"></span></p>';
            cy.createInteractiveFromFixture('interactive/validPayload', { stem: longStem }).then((response) => {
                expect(response.status).to.be.oneOf([201, 400, 413]);
            });
        });

        it('TC041 - Should handle special characters in stem', () => {
            cy.fixture('interactive/edgeCases').then((edge) => {
                cy.createInteractiveFromFixture('interactive/validPayload', { stem: edge.specialChars.stem }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC042 - Should handle SQL injection in stem', () => {
            cy.fixture('interactive/edgeCases').then((edge) => {
                cy.createInteractiveFromFixture('interactive/validPayload', { stem: edge.sqlInjection.stem }).then((response) => {
                    expect(response.status).to.not.eq(500);
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC043 - Should handle XSS attempt in stem', () => {
            cy.fixture('interactive/edgeCases').then((edge) => {
                cy.createInteractiveFromFixture('interactive/validPayload', { stem: edge.xssAttempt.stem }).then((response) => {
                    expect(response.status).to.not.eq(500);
                });
            });
        });

        it('TC044 - Should handle project_id as string instead of integer', () => {
            cy.fixture('interactive/edgeCases').then((edge) => {
                cy.createInteractiveFromFixture('interactive/validPayload', { project_id: edge.projectIdAsString.project_id }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC045 - Should handle negative project_id', () => {
            cy.fixture('interactive/edgeCases').then((edge) => {
                cy.createInteractiveFromFixture('interactive/validPayload', { project_id: edge.negativeProjectId.project_id }).then((response) => {
                    expect(response.status).to.be.oneOf([400, 404]);
                });
            });
        });

        it('TC046 - Should handle class as integer instead of string', () => {
            cy.fixture('interactive/edgeCases').then((edge) => {
                cy.createInteractiveFromFixture('interactive/validPayload', { class: edge.classAsInteger.class }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400]);
                });
            });
        });

        it('TC047 - Should handle extra fields in request body (should be ignored)', () => {
            cy.fixture('interactive/edgeCases').then((edge) => {
                cy.fixture('interactive/validPayload').then((basePayload) => {
                    const mergedPayload = { ...basePayload, ...edge.extraFields };
                    cy.log('===== TC047 REQUEST =====');
                    cy.log('Base Payload:', JSON.stringify(basePayload, null, 2));
                    cy.log('Extra Fields:', JSON.stringify(edge.extraFields, null, 2));
                    cy.log('Merged Payload:', JSON.stringify(mergedPayload, null, 2));
                    cy.createInteractiveFromFixture('interactive/validPayload', edge.extraFields).then((response) => {
                        cy.log('===== TC047 RESPONSE =====');
                        cy.log('Status:', response.status);
                        cy.log('Body:', JSON.stringify(response.body, null, 2));
                        expect(response.status).to.eq(201);
                    });
                });
            });
        });

        it('TC048 - Should validate response time is within acceptable limit', () => {
            cy.fixture('interactive/validPayload').then((payload) => {
                const startTime = Date.now();
                cy.log('===== TC048 REQUEST =====');
                cy.log('Payload:', JSON.stringify(payload, null, 2));
                cy.createInteractiveFromFixture('interactive/validPayload').then((response) => {
                    const endTime = Date.now();
                    const responseTime = endTime - startTime;
                    cy.log('===== TC048 RESPONSE =====');
                    cy.log('Status:', response.status);
                    cy.log('Response Time:', responseTime + 'ms');
                    cy.log('Body:', JSON.stringify(response.body, null, 2));
                    expect(responseTime).to.be.lessThan(5000);
                    expect(response.status).to.eq(201);
                });
            });
        });
    });

    // =============================================
    // RESPONSE STRUCTURE VALIDATION
    // =============================================
    describe('Response Structure Validation', () => {
        it('TC049 - Should validate successful response structure', () => {
            cy.fixture('interactive/validPayload').then((payload) => {
                cy.log('===== TC049 REQUEST =====');
                cy.log('Payload:', JSON.stringify(payload, null, 2));
                cy.createInteractiveFromFixture('interactive/validPayload').then((response) => {
                    cy.log('===== TC049 RESPONSE =====');
                    cy.log('Status:', response.status);
                    cy.log('Headers:', JSON.stringify(response.headers, null, 2));
                    cy.log('Body:', JSON.stringify(response.body, null, 2));
                    expect(response.status).to.eq(201);
                    expect(response.body).to.be.an('object');
                    expect(response.body).to.have.all.keys('content_id', 'content_row_id');
                    expect(response.body.content_id).to.match(/^Q\d+$/);
                    expect(response.body.content_row_id).to.include('_');

                    const contentId = response.body.content_id;
                    const contentRowId = response.body.content_row_id;

                    cy.verifyContentInDB(contentId).then((dbRow) => {
                        expect(dbRow).to.not.be.null;
                        expect(dbRow.content_id).to.eq(contentId);
                        expect(dbRow.content_row_id).to.eq(contentRowId);
                        cy.log(`✓ Response structure and database entry verified for ${contentId}`);
                    });
                });
            });
        });

        it('TC050 - Should validate error response structure', () => {
            cy.createInteractive({}).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message');
                expect(response.body.message).to.be.a('string');
            });
        });

        it('TC051 - Should validate Content-Type header in response', () => {
            cy.createInteractiveFromFixture('interactive/validPayload').then((response) => {
                expect(response.headers).to.have.property('content-type');
                expect(response.headers['content-type']).to.include('application/json');
            });
        });

        it('TC052 - Should validate content_row_id format includes language code', () => {
            cy.fixture('interactive/validPayload').then((payload) => {
                cy.log('===== TC052 REQUEST =====');
                cy.log('Payload:', JSON.stringify(payload, null, 2));
                cy.createInteractiveFromFixture('interactive/validPayload').then((response) => {
                    cy.log('===== TC052 RESPONSE =====');
                    cy.log('Status:', response.status);
                    cy.log('Body:', JSON.stringify(response.body, null, 2));
                    expect(response.status).to.eq(201);
                    expect(response.body.content_row_id).to.include('_en_');
                });
            });
        });
    });

    // =============================================
    // GET CONTENT API TESTS
    // Using content_id from POST response
    // =============================================
    describe('GET Content API Tests', () => {
        let testContentId;
        let testContentRowId;

        before(() => {
            cy.fixture('interactive/validPayload').then((payload) => {
                cy.log('===== GET TESTS SETUP (TC061 before hook) REQUEST =====');
                cy.log('Payload:', JSON.stringify(payload, null, 2));
                cy.createInteractiveFromFixture('interactive/validPayload').then((response) => {
                    cy.log('===== GET TESTS SETUP RESPONSE =====');
                    cy.log('Status:', response.status);
                    cy.log('Body:', JSON.stringify(response.body, null, 2));
                    expect(response.status).to.eq(201);
                    testContentId = response.body.content_id;
                    testContentRowId = response.body.content_row_id;
                    cy.log('Created Content ID:', testContentId);
                    cy.log('Created Content Row ID:', testContentRowId);
                });
            });
        });

        describe('Positive Tests', () => {
            it('TC061 - Should get Interactive content by valid content_id', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.be.an('array');
                    expect(response.body.length).to.be.greaterThan(0);
                    expect(response.body[0].content_id).to.eq(testContentId);
                });
            });

            it('TC062 - Should validate Interactive response structure', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];

                    expect(content).to.have.property('content_id');
                    expect(content).to.have.property('content_row_id');
                    expect(content).to.have.property('content_type');
                    expect(content).to.have.property('question_type');
                    expect(content).to.have.property('stem');
                    expect(content).to.have.property('container_ids');
                    expect(content).to.have.property('stem_voiceover');
                    expect(content).to.have.property('template');
                    expect(content).to.have.property('max_score');
                    expect(content).to.have.property('explanation');
                    expect(content).to.have.property('testing_objective');
                    expect(content).to.have.property('attributes');
                    expect(content).to.have.property('skill_trees');
                });
            });

            it('TC063 - Should get Interactive content with specific language (en)', () => {
                cy.getContentWithLanguages(testContentId, 'en').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.be.an('array');
                    if (response.body.length > 0) {
                        expect(response.body[0].language_code).to.eq('en');
                    }
                });
            });

            it('TC064 - Should get Interactive content with x-encryption: false', () => {
                cy.getContentEncrypted(testContentId, false).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];
                    expect(content).to.have.property('attributes');
                    expect(content.attributes).to.be.an('array');
                });
            });
        });

        describe('Negative Tests', () => {
            it('TC065 - Should return 404 for non-existent Interactive content_id', () => {
                cy.getContent('Q999999999').then((response) => {
                    expect(response.status).to.be.oneOf([404, 400]);
                    expect(response.body).to.have.property('message');
                });
            });

            it('TC066 - Should return error for invalid content_id format', () => {
                cy.getContent('invalid_interactive_id').then((response) => {
                    expect(response.status).to.be.oneOf([400, 404]);
                });
            });
        });

        describe('Edge Cases', () => {
            it('TC067 - Should verify question_type is Interactive in response', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body[0].question_type).to.eq('Interactive');
                });
            });

            it('TC068 - Should validate stem_voiceover contains en-IN', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];
                    expect(content.stem_voiceover).to.have.property('en-IN');
                });
            });

            it('TC069 - Should validate attributes structure in response', () => {
                cy.getContent(testContentId).then((response) => {
                    expect(response.status).to.eq(200);
                    const content = response.body[0];
                    expect(content.attributes).to.be.an('array');
                    if (content.attributes.length > 0) {
                        expect(content.attributes[0]).to.have.property('id');
                        expect(content.attributes[0]).to.have.property('value');
                    }
                });
            });
        });
    });
});
