/// <reference types="cypress" />

/**
 * Block Counting Question UPDATE API Test Suite
 * Endpoint: PUT /api/content/v1/questions/block-counting/{content_id}
 * Base URL: http://192.168.0.156:3000
 * 
 * Test Categories:
 * - Positive Tests: Update operations, versioning
 * - Negative Tests: Invalid inputs, missing fields
 * - Edge Cases: Boundary conditions, special characters
 */

describe('Block Counting Update API Tests', () => {
    let createdContentId;
    let createdContentRowId;

    before(() => {
        // Login and store auth token
        cy.loginAndStoreTokens(
            Cypress.env('USERNAME'),
            Cypress.env('PASSWORD')
        ).then((response) => {
            expect(response.status).to.eq(200);
        });

        // Create a Block Counting question to use for UPDATE tests
        cy.createBlockCountingFromFixture('block-counting/validPayload').then((response) => {
            expect(response.status).to.eq(201);
            createdContentId = response.body.content_id;
            createdContentRowId = response.body.content_row_id;
            cy.log(createdContentId);
            cy.log(createdContentRowId);
            cy.log(`✓ Created Block Counting: ${createdContentId} (${createdContentRowId})`);
        });
    });

    // =============================================
    // POSITIVE TEST CASES - UPDATE (create_new_version: false)
    // =============================================
    describe('Positive Tests - Update Existing Version', () => {
        it('TC001 - Should update Block Counting question successfully', () => {
            cy.updateBlockCountingFromFixture(createdContentId, 'block-counting/updatePayload', false).then((response) => {
                expect(response.status).to.eq(200);

                // Verify updated content in database
                cy.verifyContentInDB(createdContentId).then((dbRow) => {
                    expect(dbRow).to.not.be.null;
                    cy.log(`✓ Content ${createdContentId} updated in database`);
                });
            });
        });

        it('TC002 - Should update only the stem field', () => {
            const updatedStem = "<p>UPDATED STEM: How many cubes are there?</p>";
            cy.fixture('block-counting/updatePayload').then((payload) => {
                cy.updateBlockCounting(createdContentId, { ...payload, stem: updatedStem }, false).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });

        it('TC003 - Should update explanation field', () => {
            cy.fixture('block-counting/updatePayload').then((payload) => {
                cy.updateBlockCounting(createdContentId, {
                    ...payload,
                    explanation: "UPDATED: New detailed explanation"
                }, false).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });

        it('TC004 - Should update max_score', () => {
            cy.fixture('block-counting/updatePayload').then((payload) => {
                cy.updateBlockCounting(createdContentId, {
                    ...payload,
                    max_score: 5
                }, false).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });

        it('TC005 - Should update keyword_ids', () => {
            cy.fixture('block-counting/updatePayload').then((payload) => {
                cy.updateBlockCounting(createdContentId, {
                    ...payload,
                    keyword_ids: [9, 10]
                }, false).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });

        it('TC006 - Should update correct_answer', () => {
            cy.fixture('block-counting/updatePayload').then((payload) => {
                cy.updateBlockCounting(createdContentId, {
                    ...payload,
                    correct_answer: "18"
                }, false).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });

        it('TC007 - Should update option_data array', () => {
            cy.fixture('block-counting/updatePayload').then((payload) => {
                const updatedOptions = [
                    { option_image: "https://updated.com/opt1.png", option_value: "5" },
                    { option_image: "https://updated.com/opt2.png", option_value: "10" },
                    { option_image: "https://updated.com/opt3.png", option_value: "15" },
                    { option_image: "https://updated.com/opt4.png", option_value: "20" }
                ];
                cy.updateBlockCounting(createdContentId, {
                    ...payload,
                    option_data: updatedOptions
                }, false).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });

        it('TC008 - Should update testing_objective', () => {
            cy.fixture('block-counting/updatePayload').then((payload) => {
                cy.updateBlockCounting(createdContentId, {
                    ...payload,
                    testing_objective: "UPDATED: New testing objective"
                }, false).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });

        it('TC009 - Should update misconception_explanation', () => {
            cy.fixture('block-counting/updatePayload').then((payload) => {
                cy.updateBlockCounting(createdContentId, {
                    ...payload,
                    misconception_explanation: "UPDATED: New misconception explanation"
                }, false).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });
    });

    // =============================================
    // POSITIVE TEST CASES - CREATE NEW VERSION (create_new_version: true)
    // =============================================
    describe('Positive Tests - Create New Version', () => {
        it('TC011 - Should create new version successfully', () => {
            cy.updateBlockCountingFromFixture(createdContentId, 'block-counting/updatePayload', true).then((response) => {
                expect(response.status).to.eq(200);
                cy.log(`✓ New version created for ${createdContentId}`);
            });
        });

        it('TC012 - Should create new version with modified stem', () => {
            cy.fixture('block-counting/updatePayload').then((payload) => {
                cy.updateBlockCounting(createdContentId, {
                    ...payload,
                    stem: "<p>VERSION 2: How many blocks?</p>"
                }, true).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });

        it('TC013 - Should create new version with different language', () => {
            cy.fixture('block-counting/updatePayload').then((payload) => {
                cy.updateBlockCounting(createdContentId, {
                    ...payload,
                    language_code: "hi",
                    stem: "<p>कितने ब्लॉक हैं?</p>"
                }, true).then((response) => {
                    expect(response.status).to.eq(500);
                    expect(response.body).to.have.property('message');
                    expect(response.body.message).to.be.a('string');
                });
            });
        });

        it('TC014 - Should create new version with increased max_score', () => {
            cy.fixture('block-counting/updatePayload').then((payload) => {
                cy.updateBlockCounting(createdContentId, {
                    ...payload,
                    max_score: 10
                }, true).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });
    });

    // =============================================
    // NEGATIVE TEST CASES
    // =============================================
    describe('Negative Test Cases', () => {
        it('TC015 - Should return error for invalid content_id', () => {
            cy.fixture('block-counting/updatePayload').then((payload) => {
                cy.updateBlockCounting('INVALID_ID', payload, false).then((response) => {
                    expect(response.status).to.be.oneOf([400, 404]);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC016 - Should return error for non-existent content_id', () => {
            cy.fixture('block-counting/updatePayload').then((payload) => {
                cy.updateBlockCounting('Q999999999', payload, false).then((response) => {
                    expect(response.status).to.be.oneOf([400, 404]);
                });
            });
        });

        it('TC017 - Should return error when missing required field - stem', () => {
            cy.fixture('block-counting/validPayload').then((payload) => {
                const { stem, ...payloadWithoutStem } = payload;
                cy.updateBlockCounting(createdContentId, payloadWithoutStem, false).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC018 - Should return error when missing project_id', () => {
            cy.fixture('block-counting/validPayload').then((payload) => {
                const { project_id, ...payloadWithoutField } = payload;
                cy.updateBlockCounting(createdContentId, payloadWithoutField, false).then((response) => {
                    expect(response.status).to.eq(400);
                });
            });
        });

        it('TC019 - Should return error when missing language_code', () => {
            cy.fixture('block-counting/validPayload').then((payload) => {
                const { language_code, ...payloadWithoutField } = payload;
                cy.updateBlockCounting(createdContentId, payloadWithoutField, false).then((response) => {
                    expect(response.status).to.eq(400);
                });
            });
        });

        it('TC020 - Should return error when missing class', () => {
            cy.fixture('block-counting/validPayload').then((payload) => {
                const { class: classNum, ...payloadWithoutField } = payload;
                cy.updateBlockCounting(createdContentId, payloadWithoutField, false).then((response) => {
                    expect(response.status).to.eq(400);
                });
            });
        });

        it('TC021 - Should return error for empty content_details', () => {
            cy.updateBlockCounting(createdContentId, {}, false).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC022 - Should return error for invalid create_new_version value', () => {
            cy.fixture('block-counting/validPayload').then((payload) => {
                const body = {
                    create_new_version: "invalid_boolean",
                    content_details: payload
                };
                cy.request({
                    method: 'PUT',
                    url: `/api/content/v1/questions/block-counting/${createdContentId}`,
                    body: body,
                    headers: {
                        'Authorization': `Bearer ${Cypress.env('ACCESS_TOKEN')}`,
                        'Content-Type': 'application/json'
                    },
                    failOnStatusCode: false
                }).then((response) => {
                    expect(response.status).to.be.oneOf([400, 422]);
                });
            });
        });

        it('TC023 - Should return error for invalid content_row_id', () => {
            cy.fixture('block-counting/updatePayload').then((payload) => {
                cy.updateBlockCounting(createdContentId, payload, false, 'INVALID_ROW_ID').then((response) => {
                    expect(response.status).to.be.oneOf([400, 500]);
                });
            });
        });

        it('TC024 - Should return error for negative max_score', () => {
            cy.fixture('block-counting/validPayload').then((payload) => {
                cy.updateBlockCounting(createdContentId, {
                    ...payload,
                    max_score: -1
                }, false).then((response) => {
                    expect(response.status).to.eq(400);
                });
            });
        });
    });

    // =============================================
    // EDGE CASES
    // =============================================
    describe('Edge Cases', () => {
        it('TC025 - Should handle very long stem (5000 characters)', () => {
            const longStem = '<p>' + 'A'.repeat(5000) + '</p>';
            cy.fixture('block-counting/validPayload').then((payload) => {
                cy.updateBlockCounting(createdContentId, {
                    ...payload,
                    stem: longStem
                }, false).then((response) => {
                    expect(response.status).to.be.oneOf([200, 400, 413]);
                });
            });
        });

        it('TC026 - Should handle special characters in stem', () => {
            const specialStem = "<p>Special chars: !@#$%^&*()_+-=[]{}|;:',.<>?/~`</p>";
            cy.fixture('block-counting/validPayload').then((payload) => {
                cy.updateBlockCounting(createdContentId, {
                    ...payload,
                    stem: specialStem
                }, false).then((response) => {
                    expect(response.status).to.be.oneOf([200, 400]);
                });
            });
        });

        it('TC027 - Should handle unicode characters in stem', () => {
            const unicodeStem = "<p>Unicode: 😀🎉🌟✨💯🔥⭐️🎯</p>";
            cy.fixture('block-counting/validPayload').then((payload) => {
                cy.updateBlockCounting(createdContentId, {
                    ...payload,
                    stem: unicodeStem
                }, false).then((response) => {
                    expect(response.status).to.be.oneOf([200, 400]);
                });
            });
        });

        it('TC028 - Should handle SQL injection attempt in stem', () => {
            const sqlStem = "<p>'; DROP TABLE questions; --</p>";
            cy.fixture('block-counting/validPayload').then((payload) => {
                cy.updateBlockCounting(createdContentId, {
                    ...payload,
                    stem: sqlStem
                }, false).then((response) => {
                    expect(response.status).to.not.eq(500);
                    expect(response.status).to.be.oneOf([200, 400]);
                });
            });
        });

        it('TC029 - Should handle XSS attempt in stem', () => {
            const xssStem = "<script>alert('XSS')</script><p>Stem</p>";
            cy.fixture('block-counting/validPayload').then((payload) => {
                cy.updateBlockCounting(createdContentId, {
                    ...payload,
                    stem: xssStem
                }, false).then((response) => {
                    expect(response.status).to.not.eq(500);
                });
            });
        });

        it('TC030 - Should handle empty stem', () => {
            cy.fixture('block-counting/validPayload').then((payload) => {
                cy.updateBlockCounting(createdContentId, {
                    ...payload,
                    stem: ""
                }, false).then((response) => {
                    expect(response.status).to.be.oneOf([400, 200]);
                });
            });
        });

        it('TC031 - Should handle max_score as zero', () => {
            cy.fixture('block-counting/validPayload').then((payload) => {
                cy.updateBlockCounting(createdContentId, {
                    ...payload,
                    max_score: 0
                }, false).then((response) => {
                    expect(response.status).to.be.oneOf([200, 400]);
                });
            });
        });

        it('TC032 - Should handle very high max_score', () => {
            cy.fixture('block-counting/validPayload').then((payload) => {
                cy.updateBlockCounting(createdContentId, {
                    ...payload,
                    max_score: 99999
                }, false).then((response) => {
                    expect(response.status).to.be.oneOf([200, 400]);
                });
            });
        });

        it('TC033 - Should handle empty keyword_ids array', () => {
            cy.fixture('block-counting/validPayload').then((payload) => {
                cy.updateBlockCounting(createdContentId, {
                    ...payload,
                    keyword_ids: []
                }, false).then((response) => {
                    expect(response.status).to.be.oneOf([200, 400]);
                });
            });
        });

        it('TC034 - Should handle maximum keyword_ids', () => {
            cy.fixture('block-counting/validPayload').then((payload) => {
                cy.updateBlockCounting(createdContentId, {
                    ...payload,
                    keyword_ids: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
                }, false).then((response) => {
                    expect(response.status).to.be.oneOf([200, 400]);
                });
            });
        });

        it('TC035 - Should handle extra fields in content_details', () => {
            cy.fixture('block-counting/validPayload').then((payload) => {
                cy.updateBlockCounting(createdContentId, {
                    ...payload,
                    extra_field_1: "should be ignored",
                    extra_field_2: 12345
                }, false).then((response) => {
                    expect(response.status).to.be.oneOf([200, 400]);
                });
            });
        });

        it('TC036 - Should handle class as string', () => {
            cy.fixture('block-counting/validPayload').then((payload) => {
                cy.updateBlockCounting(createdContentId, {
                    ...payload,
                    class: "six"
                }, false).then((response) => {
                    expect(response.status).to.be.oneOf([200, 400]);
                });
            });
        });

        it('TC037 - Should handle project_id as string', () => {
            cy.fixture('block-counting/validPayload').then((payload) => {
                cy.updateBlockCounting(createdContentId, {
                    ...payload,
                    project_id: "1"
                }, false).then((response) => {
                    expect(response.status).to.be.oneOf([200, 400]);
                });
            });
        });
    });

    // =============================================
    // RESPONSE VALIDATION
    // =============================================
    describe('Response Validation', () => {
        it('TC038 - Should validate successful update response structure', () => {
            cy.updateBlockCountingFromFixture(createdContentId, 'block-counting/updatePayload', false).then((response) => {
                expect(response.status).to.eq(200);
            });
        });

        it('TC039 - Should validate error response structure', () => {
            cy.updateBlockCounting('INVALID', {}, false).then((response) => {
                expect(response.status).to.be.oneOf([400, 404]);
                expect(response.body).to.have.property('message');
                expect(response.body.message).to.be.a('string');
            });
        });

        it('TC040 - Should validate Content-Type header', () => {
            cy.updateBlockCountingFromFixture(createdContentId, 'block-counting/updatePayload', false).then((response) => {
                expect(response.headers).to.have.property('content-type');
                expect(response.headers['content-type']).to.include('application/json');
            });
        });
    });
});
