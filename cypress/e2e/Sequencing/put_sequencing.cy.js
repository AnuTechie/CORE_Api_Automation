/// <reference types="cypress" />

/**
 * Sequencing Question UPDATE API Test Suite
 * Endpoint: PUT /api/content/v1/questions/sequencing/{content_id}
 * Base URL: http://192.168.0.156:3000
 * 
 * Test Categories:
 * - Positive Tests: Update operations, versioning  
 * - Negative Tests: Invalid inputs, missing fields
 * - Edge Cases: Boundary conditions, special characters
 */

describe('Sequencing Update API Tests', () => {
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

        // Create a Sequencing question to use for UPDATE tests
        cy.createSequencingFromFixture('sequencing/validPayload').then((response) => {
            expect(response.status).to.eq(201);
            createdContentId = response.body.content_id;
            createdContentRowId = response.body.content_row_id;
            cy.log(`✓ Created Sequencing: ${createdContentId} (${createdContentRowId})`);
        });
    });

    // =============================================
    // POSITIVE TEST CASES - UPDATE (create_new_version: false)
    // =============================================
    describe('Positive Tests - Update Existing Version', () => {
        it('TC001 - Should update Sequencing question successfully', () => {
            cy.updateSequencingFromFixture(createdContentId, 'sequencing/updatePayload', false).then((response) => {
                expect(response.status).to.eq(200);

                // Verify updated content in database
                cy.verifyContentInDB(createdContentId).then((dbRow) => {
                    expect(dbRow).to.not.be.null;
                    cy.log(`✓ Content ${createdContentId} updated in database`);
                });
            });
        });

        it('TC002 - Should update only the stem field', () => {
            const updatedStem = "<p>UPDATED: Arrange the steps in correct order</p>";
            cy.fixture('sequencing/updatePayload').then((payload) => {
                cy.updateSequencing(createdContentId, { ...payload, stem: updatedStem }, false).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });

        it('TC003 - Should update explanation field', () => {
            cy.fixture('sequencing/updatePayload').then((payload) => {
                cy.updateSequencing(createdContentId, {
                    ...payload,
                    explanation: "UPDATED: New detailed explanation for sequencing"
                }, false).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });

        it('TC004 - Should update max_score', () => {
            cy.fixture('sequencing/updatePayload').then((payload) => {
                cy.updateSequencing(createdContentId, {
                    ...payload,
                    max_score: 3
                }, false).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });

        it('TC005 - Should update keyword_ids', () => {
            cy.fixture('sequencing/updatePayload').then((payload) => {
                cy.updateSequencing(createdContentId, {
                    ...payload,
                    keyword_ids: [5, 6, 7]
                }, false).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });

        it('TC006 - Should update options array', () => {
            cy.fixture('sequencing/updatePayload').then((payload) => {
                const updatedOptions = [
                    { index: 1, value: "First Step" },
                    { index: 2, value: "Second Step" },
                    { index: 3, value: "Third Step" },
                    { index: 4, value: "Fourth Step" }
                ];
                cy.updateSequencing(createdContentId, {
                    ...payload,
                    options: updatedOptions,
                    correct_answer: [[1, 2, 3, 4]]
                }, false).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });

        it('TC007 - Should update correct_answer', () => {
            cy.fixture('sequencing/updatePayload').then((payload) => {
                cy.updateSequencing(createdContentId, {
                    ...payload,
                    correct_answer: [[3, 2, 1]]
                }, false).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });

        it('TC008 - Should update testing_objective', () => {
            cy.fixture('sequencing/updatePayload').then((payload) => {
                cy.updateSequencing(createdContentId, {
                    ...payload,
                    testing_objective: "UPDATED: Testing student's ability to sequence events"
                }, false).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });

        it('TC009 - Should update misconception_explanation', () => {
            cy.fixture('sequencing/updatePayload').then((payload) => {
                cy.updateSequencing(createdContentId, {
                    ...payload,
                    misconception_explanation: "UPDATED: Common misconceptions explained"
                }, false).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });

        it('TC010 - Should update stem_voiceover', () => {
            cy.fixture('sequencing/updatePayload').then((payload) => {
                cy.updateSequencing(createdContentId, {
                    ...payload,
                    stem_voiceover: {
                        "en-GB": "updated_voiceover_gb.wav",
                        "en-IN": "updated_voiceover_in.wav",
                        "hi-IN": "updated_voiceover_hi.wav"
                    }
                }, false).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });

        it('TC011 - Should update shuffle_options', () => {
            cy.fixture('sequencing/updatePayload').then((payload) => {
                cy.updateSequencing(createdContentId, {
                    ...payload,
                    shuffle_options: true
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
        it('TC013 - Should create new version successfully', () => {
            cy.updateSequencingFromFixture(createdContentId, 'sequencing/updatePayload', true).then((response) => {
                expect(response.status).to.eq(200);
                cy.log(`✓ New version created for ${createdContentId}`);
            });
        });

        it('TC014 - Should create new version with modified stem', () => {
            cy.fixture('sequencing/updatePayload').then((payload) => {
                cy.updateSequencing(createdContentId, {
                    ...payload,
                    stem: "<p>VERSION 2: Sequence these events</p>"
                }, true).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });

        //not working // 
        it('TC015 - Should create new version with different language', () => {
            cy.fixture('sequencing/updatePayload').then((payload) => {
                cy.updateSequencing(createdContentId, {
                    ...payload,
                    language_code: "hi",
                    stem: "<p>सही क्रम में व्यवस्थित करें</p>",
                    options: [
                        { index: 1, value: "पहला" },
                        { index: 2, value: "दूसरा" },
                        { index: 3, value: "तीसरा" }
                    ]
                }, true).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });

        it('TC016 - Should create new version with increased max_score', () => {
            cy.fixture('sequencing/updatePayload').then((payload) => {
                cy.updateSequencing(createdContentId, {
                    ...payload,
                    max_score: 5
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
        it('TC017 - Should return error for invalid content_id', () => {
            cy.fixture('sequencing/updatePayload').then((payload) => {
                cy.updateSequencing('INVALID_ID', payload, false).then((response) => {
                    expect(response.status).to.be.oneOf([400, 404]);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC018 - Should return error for non-existent content_id', () => {
            cy.fixture('sequencing/updatePayload').then((payload) => {
                cy.updateSequencing('Q999999999', payload, false).then((response) => {
                    expect(response.status).to.be.oneOf([400, 404]);
                });
            });
        });

        it('TC019 - Should return error when missing required field - stem', () => {
            cy.fixture('sequencing/validPayload').then((payload) => {
                const { stem, ...payloadWithoutStem } = payload;
                cy.updateSequencing(createdContentId, payloadWithoutStem, false).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC020 - Should return error when missing project_id', () => {
            cy.fixture('sequencing/validPayload').then((payload) => {
                const { project_id, ...payloadWithoutField } = payload;
                cy.updateSequencing(createdContentId, payloadWithoutField, false).then((response) => {
                    expect(response.status).to.eq(400);
                });
            });
        });

        it('TC021 - Should return error when missing language_code', () => {
            cy.fixture('sequencing/validPayload').then((payload) => {
                const { language_code, ...payloadWithoutField } = payload;
                cy.updateSequencing(createdContentId, payloadWithoutField, false).then((response) => {
                    expect(response.status).to.eq(400);
                });
            });
        });

        it('TC022 - Should return error when missing class', () => {
            cy.fixture('sequencing/validPayload').then((payload) => {
                const { class: classNum, ...payloadWithoutField } = payload;
                cy.updateSequencing(createdContentId, payloadWithoutField, false).then((response) => {
                    expect(response.status).to.eq(400);
                });
            });
        });

        it('TC023 - Should return error when missing options', () => {
            cy.fixture('sequencing/validPayload').then((payload) => {
                const { options, ...payloadWithoutField } = payload;
                cy.updateSequencing(createdContentId, payloadWithoutField, false).then((response) => {
                    expect(response.status).to.eq(400);
                });
            });
        });

        it('TC024 - Should return error when missing correct_answer', () => {
            cy.fixture('sequencing/validPayload').then((payload) => {
                const { correct_answer, ...payloadWithoutField } = payload;
                cy.updateSequencing(createdContentId, payloadWithoutField, false).then((response) => {
                    expect(response.status).to.eq(400);
                });
            });
        });

        it('TC025 - Should return error for empty content_details', () => {
            cy.updateSequencing(createdContentId, {}, false).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC026 - Should return error for invalid content_row_id', () => {
            cy.fixture('sequencing/updatePayload').then((payload) => {
                cy.updateSequencing(createdContentId, payload, false, 'INVALID_ROW_ID').then((response) => {
                    expect(response.status).to.be.oneOf([400, 500]);
                });
            });
        });

        it('TC027 - Should return error for negative max_score', () => {
            cy.fixture('sequencing/validPayload').then((payload) => {
                cy.updateSequencing(createdContentId, {
                    ...payload,
                    max_score: -1
                }, false).then((response) => {
                    expect(response.status).to.eq(400);
                });
            });
        });

        it('TC028 - Should return error for empty options array', () => {
            cy.fixture('sequencing/validPayload').then((payload) => {
                cy.updateSequencing(createdContentId, {
                    ...payload,
                    options: []
                }, false).then((response) => {
                    expect(response.status).to.eq(400);
                });
            });
        });

        it('TC029 - Should return error for empty correct_answer array', () => {
            cy.fixture('sequencing/validPayload').then((payload) => {
                cy.updateSequencing(createdContentId, {
                    ...payload,
                    correct_answer: []
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
        it('TC030 - Should handle very long stem (5000 characters)', () => {
            const longStem = '<p>' + 'A'.repeat(5000) + '</p>';
            cy.fixture('sequencing/validPayload').then((payload) => {
                cy.updateSequencing(createdContentId, {
                    ...payload,
                    stem: longStem
                }, false).then((response) => {
                    expect(response.status).to.be.oneOf([200, 400, 413]);
                });
            });
        });

        it('TC031 - Should handle special characters in stem', () => {
            const specialStem = "<p>Special chars: !@#$%^&*()_+-=[]{}|;:',.<>?/~`</p>";
            cy.fixture('sequencing/validPayload').then((payload) => {
                cy.updateSequencing(createdContentId, {
                    ...payload,
                    stem: specialStem
                }, false).then((response) => {
                    expect(response.status).to.be.oneOf([200, 400]);
                });
            });
        });

        it('TC032 - Should handle unicode characters in stem', () => {
            const unicodeStem = "<p>Unicode: 😀🎉🌟✨💯🔥⭐️🎯</p>";
            cy.fixture('sequencing/validPayload').then((payload) => {
                cy.updateSequencing(createdContentId, {
                    ...payload,
                    stem: unicodeStem
                }, false).then((response) => {
                    expect(response.status).to.be.oneOf([200, 400]);
                });
            });
        });

        it('TC033 - Should handle SQL injection attempt in stem', () => {
            const sqlStem = "<p>'; DROP TABLE questions; --</p>";
            cy.fixture('sequencing/validPayload').then((payload) => {
                cy.updateSequencing(createdContentId, {
                    ...payload,
                    stem: sqlStem
                }, false).then((response) => {
                    expect(response.status).to.not.eq(500);
                    expect(response.status).to.be.oneOf([200, 400]);
                });
            });
        });

        it('TC034 - Should handle XSS attempt in stem', () => {
            const xssStem = "<script>alert('XSS')</script><p>Stem</p>";
            cy.fixture('sequencing/validPayload').then((payload) => {
                cy.updateSequencing(createdContentId, {
                    ...payload,
                    stem: xssStem
                }, false).then((response) => {
                    expect(response.status).to.not.eq(500);
                });
            });
        });

        it('TC035 - Should handle multiple correct_answer sequences', () => {
            cy.fixture('sequencing/validPayload').then((payload) => {
                cy.updateSequencing(createdContentId, {
                    ...payload,
                    correct_answer: [
                        [1, 2, 3],
                        [2, 1, 3],
                        [3, 2, 1]
                    ]
                }, false).then((response) => {
                    expect(response.status).to.be.oneOf([200, 400]);
                });
            });
        });

        it('TC036 - Should handle maximum number of options (10)', () => {
            cy.fixture('sequencing/validPayload').then((payload) => {
                const maxOptions = [];
                for (let i = 1; i <= 10; i++) {
                    maxOptions.push({ index: i, value: `Option ${i}` });
                }
                cy.updateSequencing(createdContentId, {
                    ...payload,
                    options: maxOptions,
                    correct_answer: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]]
                }, false).then((response) => {
                    expect(response.status).to.be.oneOf([200, 400]);
                });
            });
        });

        it('TC037 - Should handle max_score as zero', () => {
            cy.fixture('sequencing/validPayload').then((payload) => {
                cy.updateSequencing(createdContentId, {
                    ...payload,
                    max_score: 0
                }, false).then((response) => {
                    expect(response.status).to.be.oneOf([200, 400]);
                });
            });
        });

        it('TC038 - Should handle extra fields in content_details', () => {
            cy.fixture('sequencing/validPayload').then((payload) => {
                cy.updateSequencing(createdContentId, {
                    ...payload,
                    extra_field: "should be ignored"
                }, false).then((response) => {
                    expect(response.status).to.be.oneOf([200, 400]);
                });
            });
        });

        it('TC039 - Should handle empty stem_voiceover object', () => {
            cy.fixture('sequencing/validPayload').then((payload) => {
                cy.updateSequencing(createdContentId, {
                    ...payload,
                    stem_voiceover: {}
                }, false).then((response) => {
                    expect(response.status).to.be.oneOf([200, 400]);
                });
            });
        });

        it('TC040 - Should handle duplicate option indices', () => {
            cy.fixture('sequencing/validPayload').then((payload) => {
                cy.updateSequencing(createdContentId, {
                    ...payload,
                    options: [
                        { index: 1, value: "A" },
                        { index: 1, value: "B" },
                        { index: 2, value: "C" }
                    ]
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
        it('TC041 - Should validate successful update response structure', () => {
            cy.updateSequencingFromFixture(createdContentId, 'sequencing/updatePayload', false).then((response) => {
                expect(response.status).to.eq(200);
            });
        });

        it('TC042 - Should validate error response structure', () => {
            cy.updateSequencing('INVALID', {}, false).then((response) => {
                expect(response.status).to.be.oneOf([400, 404]);
                expect(response.body).to.have.property('message');
                expect(response.body.message).to.be.a('string');
            });
        });

        it('TC043 - Should validate Content-Type header', () => {
            cy.updateSequencingFromFixture(createdContentId, 'sequencing/updatePayload', false).then((response) => {
                expect(response.headers).to.have.property('content-type');
                expect(response.headers['content-type']).to.include('application/json');
            });
        });
    });
});
