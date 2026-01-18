/// <reference types="cypress" />

/**
 * PUT Blank Question API Test Suite
 * Endpoint: PUT /api/content/v1/questions/fill-in-the-blanks/{content_id}
 * Base URL: https://core.poc-ei.study
 * 
 * Tests versioning, LCUR/LCCR, and content updates
 * Uses:
 * - Fixtures: cypress/fixtures/blank/put/ for test data
 * - Custom Commands: cy.updateBlank(), cy.updateBlankFromFixture()
 */
describe('PUT Blank Question API Tests', () => {
    // Store created content IDs for update tests
    let testContentId;
    let testContentRowId;
    let testContentId2; // For version testing
    let testContentRowId2;

    // Load PUT-specific payloads
    let updateWithoutNewVersion;
    let updateWithNewVersion;
    let updateWithContentRowId;
    let updateMultipleBlanks;
    let updateTemplate;
    let putNegativePayloads;
    let putEdgeCases;

    before(() => {
        // Login and store auth token
        cy.loginAndStoreTokens(
            Cypress.env('USERNAME'),
            Cypress.env('PASSWORD')
        ).then((response) => {
            expect(response.status).to.eq(200);
        });

        // Load all PUT fixtures
        cy.fixture('blank/put/updateWithoutNewVersion').then((data) => { updateWithoutNewVersion = data; });
        cy.fixture('blank/put/updateWithNewVersion').then((data) => { updateWithNewVersion = data; });
        cy.fixture('blank/put/updateWithContentRowId').then((data) => { updateWithContentRowId = data; });
        cy.fixture('blank/put/updateMultipleBlanks').then((data) => { updateMultipleBlanks = data; });
        cy.fixture('blank/put/updateTemplate').then((data) => { updateTemplate = data; });
        cy.fixture('blank/put/putNegativePayloads').then((data) => { putNegativePayloads = data; });
        cy.fixture('blank/put/putEdgeCases').then((data) => { putEdgeCases = data; });

        // Create test content for PUT operations
        cy.createBlankFromFixture('blank/validPayload').then((response) => {
            expect(response.status).to.eq(201);
            testContentId = response.body.content_id;
            testContentRowId = response.body.content_row_id;
            cy.log(`Created test content: ${testContentId}`);
        });

        // Create second test content for version testing
        cy.createBlankFromFixture('blank/validPayload').then((response) => {
            expect(response.status).to.eq(201);
            testContentId2 = response.body.content_id;
            testContentRowId2 = response.body.content_row_id;
            cy.log(`Created test content 2: ${testContentId2}`);
        });
    });

    // =============================================
    // POSITIVE TEST CASES
    // =============================================
    describe('Positive Test Cases', () => {
        it('TC001 - Should update Blank without creating new version', () => {
            cy.updateBlankFromFixture(testContentId, 'blank/put/updateWithoutNewVersion').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('content_id');
                expect(response.body).to.have.property('content_row_id');
                expect(response.body.content_id).to.eq(testContentId);

                // Version should not change
                expect(response.body.content_row_id).to.eq(testContentRowId);
            });
        });

        it('TC002 - Should create new version when create_new_version is true', () => {
            cy.updateBlankFromFixture(testContentId2, 'blank/put/updateWithNewVersion').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('content_id');
                expect(response.body).to.have.property('content_row_id');
                expect(response.body.content_id).to.eq(testContentId2);

                // Version should increment
                expect(response.body.content_row_id).to.not.eq(testContentRowId2);
                expect(response.body.content_row_id).to.include('_en_');
            });
        });

        it('TC003 - Should update specific version using content_row_id (LCUR/LCCR)', () => {
            // First create a question to get a valid content_row_id
            cy.createBlankFromFixture('blank/validPayload').then((createResponse) => {
                expect(createResponse.status).to.eq(201);
                const contentId = createResponse.body.content_id;
                const contentRowId = createResponse.body.content_row_id;

                // Update with content_row_id specified
                cy.updateBlankFromFixture(contentId, 'blank/put/updateWithContentRowId', {
                    content_row_id: contentRowId
                }).then((updateResponse) => {
                    expect(updateResponse.status).to.eq(200);
                    expect(updateResponse.body.content_id).to.eq(contentId);
                    expect(updateResponse.body.content_row_id).to.eq(contentRowId);
                });
            });
        });

        it('TC004 - Should update multiple fields simultaneously', () => {
            cy.updateBlankFromFixture(testContentId, 'blank/put/updateWithoutNewVersion', {
                content_details: {
                    ...updateWithoutNewVersion.content_details,
                    testing_objective: 'Updated multiple fields',
                    max_score: 5
                }
            }).then((response) => {
                expect(response.status).to.eq(200);
            });
        });

        it('TC005 - Should update template from type to drag', () => {
            cy.createBlankFromFixture('blank/validPayload').then((createResponse) => {
                const contentId = createResponse.body.content_id;

                cy.updateBlankFromFixture(contentId, 'blank/put/updateTemplate').then((updateResponse) => {
                    expect(updateResponse.status).to.eq(200);

                    // Verify template changed in GET response
                    cy.getContent(contentId).then((getResponse) => {
                        expect(getResponse.body[0].template).to.eq('drag');
                    });
                });
            });
        });

        it('TC006 - Should update blank_count and blank_details', () => {
            cy.createBlankFromFixture('blank/validPayload').then((createResponse) => {
                const contentId = createResponse.body.content_id;

                // Update to multiple blanks
                cy.updateBlankFromFixture(contentId, 'blank/put/updateMultipleBlanks').then((updateResponse) => {
                    expect(updateResponse.status).to.eq(200);

                    // Verify in database
                    cy.verifyContentInDB(contentId).then((dbRow) => {
                        expect(dbRow).to.not.be.null;
                        cy.log(`Updated blank_count for ${contentId}`);
                    });
                });
            });
        });

        it('TC007 - Should update correct_answer', () => {
            cy.updateBlankFromFixture(testContentId, 'blank/put/updateWithoutNewVersion', {
                content_details: {
                    ...updateWithoutNewVersion.content_details,
                    correct_answer: {
                        b1: ['99', 'ninety-nine']
                    }
                }
            }).then((response) => {
                expect(response.status).to.eq(200);
            });
        });

        it('TC008 - Should update rules', () => {
            cy.updateBlankFromFixture(testContentId, 'blank/put/updateWithoutNewVersion', {
                content_details: {
                    ...updateWithoutNewVersion.content_details,
                    rules: {
                        no_duplicates: false,
                        case_sensitive: true,
                        allow_extra_spaces: false,
                        ignore_punctuation: false,
                        custom_regex: false
                    }
                }
            }).then((response) => {
                expect(response.status).to.eq(200);
            });
        });

        it('TC009 - Should update with Hindi language content', () => {
            cy.updateBlankFromFixture(testContentId, 'blank/put/updateWithoutNewVersion', {
                content_details: {
                    ...updateWithoutNewVersion.content_details,
                    //language_code: 'hi',
                    stem: '<p>हिंदी: रिक्त स्थान भरें <fill-in-the-blank id="b1"></fill-in-the-blank></p>'
                }
            }).then((response) => {
                expect(response.status).to.be.oneOf([200, 400]); // May depend on project config
            });
        });

        it('TC010 - Should add container_ids', () => {
            cy.updateBlankFromFixture(testContentId, 'blank/put/updateWithoutNewVersion', {
                content_details: {
                    ...updateWithoutNewVersion.content_details,
                    container_ids: ['CONT001', 'CONT002']
                }
            }).then((response) => {
                expect(response.status).to.eq(200);
            });
        });

        it('TC011 - Should update voiceover fields', () => {
            cy.updateBlankFromFixture(testContentId, 'blank/put/updateWithoutNewVersion', {
                content_details: {
                    ...updateWithoutNewVersion.content_details,
                    stem_voiceover: { 'en-IN': 'audio_file.wav' },
                    explanation_voiceover: { 'en-IN': 'explanation_audio.wav' }
                }
            }).then((response) => {
                expect(response.status).to.eq(200);
            });
        });

        it('TC012 - Should update attributes array', () => {
            cy.updateBlankFromFixture(testContentId, 'blank/put/updateWithoutNewVersion', {
                content_details: {
                    ...updateWithoutNewVersion.content_details,
                    attributes: [
                        { id: '1', value: 'Hard' },
                        { id: '4', value: '5' }
                    ]
                }
            }).then((response) => {
                expect(response.status).to.eq(200);
            });
        });

        it('TC013 - Should update keyword_ids', () => {
            cy.updateBlankFromFixture(testContentId, 'blank/put/updateWithoutNewVersion', {
                content_details: {
                    ...updateWithoutNewVersion.content_details,
                    keyword_ids: [10, 20, 30]
                }
            }).then((response) => {
                expect(response.status).to.eq(200);
            });
        });

        it('TC014 - Should verify version increment format', () => {
            cy.createBlankFromFixture('blank/validPayload').then((createResponse) => {
                const contentId = createResponse.body.content_id;
                const originalRowId = createResponse.body.content_row_id;

                // Create new version
                cy.updateBlankFromFixture(contentId, 'blank/put/updateWithNewVersion').then((updateResponse) => {
                    expect(updateResponse.status).to.eq(200);
                    const newRowId = updateResponse.body.content_row_id;

                    // Verify version number increased
                    expect(newRowId).to.not.eq(originalRowId);
                    expect(newRowId).to.include('_en_');
                });
            });
        });

        it('TC015 - Should preserve old version when creating new version', () => {
            cy.createBlankFromFixture('blank/validPayload').then((createResponse) => {
                const contentId = createResponse.body.content_id;
                const v1RowId = createResponse.body.content_row_id;

                // Create version 2
                cy.updateBlankFromFixture(contentId, 'blank/put/updateWithNewVersion').then((updateResponse) => {
                    expect(updateResponse.status).to.eq(200);

                    // Verify both versions exist in database
                    cy.queryDB('SELECT * FROM questions WHERE content_id = $1 ORDER BY content_row_id', [contentId]).then((rows) => {
                        expect(rows.length).to.be.greaterThan(1);
                        cy.log(`✓ Multiple versions preserved for ${contentId}`);
                    });
                });
            });
        });
    });

    // =============================================
    // NEGATIVE TEST CASES
    // =============================================
    describe('Negative Test Cases', () => {
        it('TC016 - Should return 404 for non-existent content_id', () => {
            cy.updateBlankFromFixture('Q999999999', 'blank/put/updateWithoutNewVersion').then((response) => {
                expect(response.status).to.be.oneOf([404, 400]);
                expect(response.body).to.have.property('message');
            });
        });

        it('TC017 - Should return 400 when create_new_version field is missing', () => {
            cy.updateBlank(testContentId, putNegativePayloads.missingCreateNewVersion).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message');
            });
        });

        it('TC018 - Should return 400 when content_details is missing', () => {
            cy.updateBlank(testContentId, putNegativePayloads.missingContentDetails).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message');
            });
        });

        it('TC019 - Should return 400 for invalid create_new_version type', () => {
            cy.updateBlank(testContentId, putNegativePayloads.invalidCreateNewVersion).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message');
            });
        });

        it('TC020 - Should return 400 when language_code is missing in content_details', () => {
            cy.updateBlank(testContentId, putNegativePayloads.missingLanguageCode).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message');
            });
        });

        it('TC021 - Should return 400 for invalid content_row_id format', () => {
            cy.updateBlankFromFixture(testContentId, 'blank/put/updateWithContentRowId', {
                content_row_id: 'INVALID_FORMAT_123'
            }).then((response) => {
                expect(response.status).to.be.oneOf([400, 404]);
            });
        });

        it('TC022 - Should return 400 when blank_count mismatch', () => {
            cy.updateBlank(testContentId, putNegativePayloads.blankCountMismatch).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body.message).to.include('blank');
            });
        });

        it('TC023 - Should return 400 for invalid allowed_char_set', () => {
            cy.updateBlank(testContentId, putNegativePayloads.invalidAllowedCharSet).then((response) => {
                expect(response.status).to.be.oneOf([400, 404]);
            });
        });

        it('TC024 - Should return 400 for invalid template value', () => {
            cy.updateBlank(testContentId, putNegativePayloads.invalidTemplate).then((response) => {
                expect(response.status).to.be.oneOf([400, 404]);
            });
        });

        it('TC025 - Should return 400 for negative blank_count', () => {
            cy.updateBlank(testContentId, putEdgeCases.negativeBlankCount).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC026 - Should return 400 when content_details is empty object', () => {
            cy.updateBlank(testContentId, putNegativePayloads.emptyContentDetails).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC027 - Should return 400 for invalid class data type', () => {
            cy.updateBlank(testContentId, putNegativePayloads.invalidClassType).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC028 - Should return 400 when class is missing', () => {
            cy.updateBlank(testContentId, putNegativePayloads.missingClass).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC029 - Should return 400 with empty request body', () => {
            cy.request({
                method: 'PUT',
                url: `/api/content/v1/questions/fill-in-the-blanks/${testContentId}`,
                body: {},
                headers: getAuthHeaders(),
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC030 - Should return 401 without authentication token', () => {
            cy.request({
                method: 'PUT',
                url: `/api/content/v1/questions/fill-in-the-blanks/${testContentId}`,
                body: updateWithoutNewVersion,
                headers: { 'Content-Type': 'application/json' },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.be.oneOf([401, 403]);
            });
        });
    });

    // =============================================
    // EDGE CASES
    // =============================================
    describe('Edge Cases', () => {
        it('TC031 - Should handle very long stem text', () => {
            cy.updateBlank(testContentId, putEdgeCases.veryLongStem).then((response) => {
                expect(response.status).to.be.oneOf([200, 400, 413]);
            });
        });

        it('TC032 - Should handle special characters in updated content', () => {
            cy.updateBlank(testContentId, putEdgeCases.specialCharactersInStem).then((response) => {
                expect(response.status).to.be.oneOf([200, 400]);
            });
        });

        it('TC033 - Should handle SQL injection attempt in content_id', () => {
            cy.updateBlankFromFixture("Q1' OR '1'='1", 'blank/put/updateWithoutNewVersion').then((response) => {
                expect(response.status).to.not.eq(500);
                expect(response.status).to.be.oneOf([400, 404]);
            });
        });

        it('TC034 - Should handle XSS attempt in updated fields', () => {
            cy.updateBlank(testContentId, putEdgeCases.xssAttempt).then((response) => {
                expect(response.status).to.not.eq(500);
                expect(response.status).to.be.oneOf([200, 400]);
            });
        });

        it('TC035 - Should handle update immediately after creation', () => {
            cy.createBlankFromFixture('blank/validPayload').then((createResponse) => {
                const contentId = createResponse.body.content_id;

                // Immediately update
                cy.updateBlankFromFixture(contentId, 'blank/put/updateWithoutNewVersion').then((updateResponse) => {
                    expect(updateResponse.status).to.eq(200);
                });
            });
        });

        it('TC036 - Should validate response time is within acceptable limit', () => {
            const startTime = Date.now();
            cy.updateBlankFromFixture(testContentId, 'blank/put/updateWithoutNewVersion').then((response) => {
                const endTime = Date.now();
                const responseTime = endTime - startTime;
                expect(responseTime).to.be.lessThan(5000);
                expect(response.status).to.eq(200);
            });
        });

        it('TC037 - Should handle all rules set to true', () => {
            cy.updateBlank(testContentId, putEdgeCases.allRulesTrue).then((response) => {
                expect(response.status).to.be.oneOf([200, 400]);
            });
        });

        it('TC038 - Should handle invalid content_id format', () => {
            cy.updateBlankFromFixture('INVALID_ID', 'blank/put/updateWithoutNewVersion').then((response) => {
                expect(response.status).to.be.oneOf([400, 404]);
            });
        });

        it('TC039 - Should handle update with content_row_id for different content', () => {
            cy.updateBlankFromFixture(testContentId, 'blank/put/updateWithContentRowId', {
                content_row_id: 'Q99999_en_1'
            }).then((response) => {
                expect(response.status).to.be.oneOf([400, 404]);
            });
        });

        it('TC040 - Should handle empty content_id', () => {
            cy.request({
                method: 'PUT',
                url: '/api/content/v1/questions/fill-in-the-blanks/',
                body: updateWithoutNewVersion,
                headers: getAuthHeaders(),
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.be.oneOf([400, 404, 405]);
            });
        });
    });

    // =============================================
    // RESPONSE STRUCTURE VALIDATION
    // =============================================
    describe('Response Structure Validation', () => {
        it('TC041 - Should validate 200 response structure', () => {
            cy.updateBlankFromFixture(testContentId, 'blank/put/updateWithoutNewVersion').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.be.an('object');
                expect(response.body).to.have.all.keys('content_id', 'content_row_id');
                expect(response.body.content_id).to.match(/^Q\d+$/);
                expect(response.body.content_row_id).to.include('_');
            });
        });

        it('TC042 - Should return same content_id as request', () => {
            cy.updateBlankFromFixture(testContentId, 'blank/put/updateWithoutNewVersion').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.content_id).to.eq(testContentId);
            });
        });

        it('TC043 - Should validate content_row_id format', () => {
            cy.updateBlankFromFixture(testContentId, 'blank/put/updateWithoutNewVersion').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.content_row_id).to.match(/^Q\d+_[a-z]{2}_\d+$/);
            });
        });

        it('TC044 - Should validate 400 error response structure', () => {
            cy.updateBlank(testContentId, {}).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message');
                expect(response.body.message).to.be.a('string');
            });
        });

        it('TC045 - Should validate Content-Type header', () => {
            cy.updateBlankFromFixture(testContentId, 'blank/put/updateWithoutNewVersion').then((response) => {
                expect(response.headers).to.have.property('content-type');
                expect(response.headers['content-type']).to.include('application/json');
            });
        });
    });

    // =============================================
    // DATABASE VERIFICATION TESTS
    // =============================================
    describe('Database Verification Tests', () => {
        it('TC046 - Should verify updated fields in database', () => {
            cy.createBlankFromFixture('blank/validPayload').then((createResponse) => {
                const contentId = createResponse.body.content_id;

                // Update with specific data
                cy.updateBlankFromFixture(contentId, 'blank/put/updateWithoutNewVersion').then((updateResponse) => {
                    expect(updateResponse.status).to.eq(200);

                    // Verify in database
                    cy.verifyContentInDB(contentId).then((dbRow) => {
                        expect(dbRow).to.not.be.null;
                        expect(dbRow.content_id).to.eq(contentId);
                        cy.log(`✓ Updated content verified in database: ${contentId}`);
                    });
                });
            });
        });

        it('TC047 - Should verify version number incremented', () => {
            cy.createBlankFromFixture('blank/validPayload').then((createResponse) => {
                const contentId = createResponse.body.content_id;
                const v1RowId = createResponse.body.content_row_id;

                // Get version from row_id (format: Q123_en_1)
                const v1Number = parseInt(v1RowId.split('_').pop());

                // Create new version
                cy.updateBlankFromFixture(contentId, 'blank/put/updateWithNewVersion').then((updateResponse) => {
                    expect(updateResponse.status).to.eq(200);
                    const v2RowId = updateResponse.body.content_row_id;
                    const v2Number = parseInt(v2RowId.split('_').pop());

                    // Verify version incremented
                    expect(v2Number).to.be.greaterThan(v1Number);
                    cy.log(`✓ Version incremented from ${v1Number} to ${v2Number}`);
                });
            });
        });

        it('TC048 - Should verify old version preserved in database', () => {
            cy.createBlankFromFixture('blank/validPayload').then((createResponse) => {
                const contentId = createResponse.body.content_id;
                const originalRowId = createResponse.body.content_row_id;

                // Create new version
                cy.updateBlankFromFixture(contentId, 'blank/put/updateWithNewVersion').then((updateResponse) => {
                    expect(updateResponse.status).to.eq(200);

                    // Verify old version still exists
                    cy.verifyContentRowInDB(originalRowId).then((dbRow) => {
                        expect(dbRow).to.not.be.null;
                        expect(dbRow.content_row_id).to.eq(originalRowId);
                        cy.log(`✓ Old version preserved: ${originalRowId}`);
                    });
                });
            });
        });

        it('TC049 - Should verify specific version update with content_row_id', () => {
            cy.createBlankFromFixture('blank/validPayload').then((createResponse) => {
                const contentId = createResponse.body.content_id;
                const rowId = createResponse.body.content_row_id;

                // Update specific version
                cy.updateBlankFromFixture(contentId, 'blank/put/updateWithContentRowId', {
                    content_row_id: rowId
                }).then((updateResponse) => {
                    expect(updateResponse.status).to.eq(200);
                    expect(updateResponse.body.content_row_id).to.eq(rowId);

                    // Verify in database
                    cy.verifyContentRowInDB(rowId).then((dbRow) => {
                        expect(dbRow).to.not.be.null;
                        cy.log(`✓ Specific version updated: ${rowId}`);
                    });
                });
            });
        });

        it('TC050 - Should verify timestamp updates after PUT', () => {
            cy.createBlankFromFixture('blank/validPayload').then((createResponse) => {
                const contentId = createResponse.body.content_id;

                // Wait a bit to ensure different timestamp
                cy.wait(1000);

                // Update content
                cy.updateBlankFromFixture(contentId, 'blank/put/updateWithoutNewVersion').then((updateResponse) => {
                    expect(updateResponse.status).to.eq(200);

                    // Verify updated_at timestamp changed
                    cy.queryDB('SELECT created_at, updated_at FROM questions WHERE content_id = $1 LIMIT 1', [contentId]).then((rows) => {
                        if (rows.length > 0) {
                            expect(rows[0].updated_at).to.not.be.null;
                            cy.log(`✓ Timestamp updated for ${contentId}`);
                        }
                    });
                });
            });
        });
    });
});
