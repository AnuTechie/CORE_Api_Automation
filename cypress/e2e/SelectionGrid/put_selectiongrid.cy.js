/// <reference types="cypress" />

/**
 * Selection Grid Question UPDATE API Test Suite
 * Endpoint: PUT /api/content/v1/questions/selection-grid/{content_id}
 * Base URL: http://192.168.0.156:3000
 * 
 * Test Categories:
 * - Positive Tests: Update operations, versioning  
 * - Negative Tests: Invalid inputs, missing fields
 * - Edge Cases: Boundary conditions, special characters
 */

describe('Selection Grid Update API Tests', () => {
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

        // Create a Selection Grid question to use for UPDATE tests
        cy.createSelectionGridFromFixture('selection-grid/validPayload').then((response) => {
            expect(response.status).to.eq(201);
            createdContentId = response.body.content_id;
            createdContentRowId = response.body.content_row_id;
            cy.log(`✓ Created Selection Grid: ${createdContentId} (${createdContentRowId})`);
        });
    });

    // =============================================
    // POSITIVE TEST CASES - UPDATE (create_new_version: false)
    // =============================================
    describe('Positive Tests - Update Existing Version', () => {
        it('TC001 - Should update Selection Grid question successfully', () => {
            cy.updateSelectionGridFromFixture(createdContentId, 'selection-grid/updatePayload', false).then((response) => {
                expect(response.status).to.eq(200);

                // Verify updated content in database
                cy.verifyContentInDB(createdContentId).then((dbRow) => {
                    expect(dbRow).to.not.be.null;
                    cy.log(`✓ Content ${createdContentId} updated in database`);
                });
            });
        });

        it('TC002 - Should update only the stem field', () => {
            const updatedStem = "<p>UPDATED: Select the correct pairs from the grid</p>";
            cy.fixture('selection-grid/updatePayload').then((payload) => {
                cy.updateSelectionGrid(createdContentId, { ...payload, stem: updatedStem }, false).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });

        it('TC003 - Should update explanation field', () => {
            cy.fixture('selection-grid/updatePayload').then((payload) => {
                cy.updateSelectionGrid(createdContentId, {
                    ...payload,
                    explanation: "UPDATED: New detailed explanation for selection grid"
                }, false).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });

        it('TC004 - Should update max_score', () => {
            cy.fixture('selection-grid/updatePayload').then((payload) => {
                cy.updateSelectionGrid(createdContentId, {
                    ...payload,
                    max_score: 10
                }, false).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });

        it('TC005 - Should update keyword_ids', () => {
            cy.fixture('selection-grid/updatePayload').then((payload) => {
                cy.updateSelectionGrid(createdContentId, {
                    ...payload,
                    keyword_ids: [15, 16, 17]
                }, false).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });

        it('TC006 - Should update selection_sets columns', () => {
            cy.fixture('selection-grid/updatePayload').then((payload) => {
                const updatedSelectionSets = {
                    column_a_options: [
                        { option_value: "Dog", option_index: 1, option_voiceover: { "en-IN": "dog.wav" } },
                        { option_value: "Cat", option_index: 2, option_voiceover: { "en-IN": "cat.wav" } }
                    ],
                    column_b_options: [
                        { option_value: "Bark", option_index: 1, option_voiceover: { "en-IN": "bark.wav" } },
                        { option_value: "Meow", option_index: 2, option_voiceover: { "en-IN": "meow.wav" } }
                    ]
                };
                cy.updateSelectionGrid(createdContentId, {
                    ...payload,
                    selection_sets: updatedSelectionSets,
                    correct_answer: [
                        { column_a_index: 1, column_b_index: 1 },
                        { column_a_index: 2, column_b_index: 2 }
                    ]
                }, false).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });

        it('TC007 - Should update correct_answer', () => {
            cy.fixture('selection-grid/updatePayload').then((payload) => {
                cy.updateSelectionGrid(createdContentId, {
                    ...payload,
                    correct_answer: [
                        { column_a_index: 3, column_b_index: 3 },
                        { column_a_index: 2, column_b_index: 2 },
                        { column_a_index: 1, column_b_index: 1 }
                    ]
                }, false).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });

        it('TC008 - Should update testing_objective', () => {
            cy.fixture('selection-grid/updatePayload').then((payload) => {
                cy.updateSelectionGrid(createdContentId, {
                    ...payload,
                    testing_objective: "UPDATED: Testing student's selection grid matching skills"
                }, false).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });

        it('TC009 - Should update misconception_explanation', () => {
            cy.fixture('selection-grid/updatePayload').then((payload) => {
                cy.updateSelectionGrid(createdContentId, {
                    ...payload,
                    misconception_explanation: "UPDATED: Common grid matching errors explained"
                }, false).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });

        it('TC010 - Should update voiceover fields', () => {
            cy.fixture('selection-grid/updatePayload').then((payload) => {
                cy.updateSelectionGrid(createdContentId, {
                    ...payload,
                    stem_voiceover: {
                        "en-GB": "new_stem_gb.wav",
                        "en-IN": "new_stem_in.wav",
                        "hi-IN": "new_stem_hi.wav"
                    },
                    instruction_voiceover: {
                        "en-IN": "new_instruction.wav"
                    }
                }, false).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });

        it('TC011 - Should update shuffle and max_options', () => {
            cy.fixture('selection-grid/updatePayload').then((payload) => {
                cy.updateSelectionGrid(createdContentId, {
                    ...payload,
                    shuffle: false,
                    max_options: "5"
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
        it('TC012 - Should create new version successfully', () => {
            cy.updateSelectionGridFromFixture(createdContentId, 'selection-grid/updatePayload', true).then((response) => {
                expect(response.status).to.eq(200);
                cy.log(`✓ New version created for ${createdContentId}`);
            });
        });

        it('TC013 - Should create new version with modified stem', () => {
            cy.fixture('selection-grid/updatePayload').then((payload) => {
                cy.updateSelectionGrid(createdContentId, {
                    ...payload,
                    stem: "<p>VERSION 2: Match the pairs from the grid</p>"
                }, true).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });

        it('TC014 - Should create new version with different language', () => {
            cy.fixture('selection-grid/updatePayload').then((payload) => {
                cy.updateSelectionGrid(createdContentId, {
                    ...payload,
                    language_code: "hi",
                    stem: "<p>सही जोड़े चुनें</p>",
                    selection_sets: {
                        column_a_options: [
                            { option_value: "सेब", option_index: 1, option_voiceover: { "hi-IN": "apple_hi.wav" } },
                            { option_value: "केला", option_index: 2, option_voiceover: { "hi-IN": "banana_hi.wav" } }
                        ],
                        column_b_options: [
                            { option_value: "लाल", option_index: 1, option_voiceover: { "hi-IN": "red_hi.wav" } },
                            { option_value: "पीला", option_index: 2, option_voiceover: { "hi-IN": "yellow_hi.wav" } }
                        ]
                    },
                    correct_answer: [
                        { column_a_index: 1, column_b_index: 1 },
                        { column_a_index: 2, column_b_index: 2 }
                    ]
                }, true).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });

        it('TC015 - Should create new version with increased max_score', () => {
            cy.fixture('selection-grid/updatePayload').then((payload) => {
                cy.updateSelectionGrid(createdContentId, {
                    ...payload,
                    max_score: 15
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
        it('TC016 - Should return error for invalid content_id', () => {
            cy.fixture('selection-grid/updatePayload').then((payload) => {
                cy.updateSelectionGrid('INVALID_ID', payload, false).then((response) => {
                    expect(response.status).to.be.oneOf([400, 404]);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC017 - Should return error for non-existent content_id', () => {
            cy.fixture('selection-grid/updatePayload').then((payload) => {
                cy.updateSelectionGrid('Q999999999', payload, false).then((response) => {
                    expect(response.status).to.be.oneOf([400, 404]);
                });
            });
        });

        it('TC018 - Should return error when missing required field - stem', () => {
            cy.fixture('selection-grid/validPayload').then((payload) => {
                const { stem, ...payloadWithoutStem } = payload;
                cy.updateSelectionGrid(createdContentId, payloadWithoutStem, false).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC019 - Should return error when missing project_id', () => {
            cy.fixture('selection-grid/validPayload').then((payload) => {
                const { project_id, ...payloadWithoutField } = payload;
                cy.updateSelectionGrid(createdContentId, payloadWithoutField, false).then((response) => {
                    expect(response.status).to.eq(400);
                });
            });
        });

        it('TC020 - Should return error when missing language_code', () => {
            cy.fixture('selection-grid/validPayload').then((payload) => {
                const { language_code, ...payloadWithoutField } = payload;
                cy.updateSelectionGrid(createdContentId, payloadWithoutField, false).then((response) => {
                    expect(response.status).to.eq(400);
                });
            });
        });

        it('TC021 - Should return error when missing class', () => {
            cy.fixture('selection-grid/validPayload').then((payload) => {
                const { class: classNum, ...payloadWithoutField } = payload;
                cy.updateSelectionGrid(createdContentId, payloadWithoutField, false).then((response) => {
                    expect(response.status).to.eq(400);
                });
            });
        });

        it('TC022 - Should return error when missing selection_sets', () => {
            cy.fixture('selection-grid/validPayload').then((payload) => {
                const { selection_sets, ...payloadWithoutField } = payload;
                cy.updateSelectionGrid(createdContentId, payloadWithoutField, false).then((response) => {
                    expect(response.status).to.eq(400);
                });
            });
        });

        it('TC023 - Should return error when missing correct_answer', () => {
            cy.fixture('selection-grid/validPayload').then((payload) => {
                const { correct_answer, ...payloadWithoutField } = payload;
                cy.updateSelectionGrid(createdContentId, payloadWithoutField, false).then((response) => {
                    expect(response.status).to.eq(400);
                });
            });
        });

        it('TC024 - Should return error for empty content_details', () => {
            cy.updateSelectionGrid(createdContentId, {}, false).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC025 - Should return error for invalid content_row_id', () => {
            cy.fixture('selection-grid/updatePayload').then((payload) => {
                cy.updateSelectionGrid(createdContentId, payload, false, 'INVALID_ROW_ID').then((response) => {
                    expect(response.status).to.be.oneOf([400, 500]);
                });
            });
        });

        it('TC026 - Should return error for negative max_score', () => {
            cy.fixture('selection-grid/validPayload').then((payload) => {
                cy.updateSelectionGrid(createdContentId, {
                    ...payload,
                    max_score: -1
                }, false).then((response) => {
                    expect(response.status).to.eq(400);
                });
            });
        });

        it('TC027 - Should return error for empty column_a_options', () => {
            cy.fixture('selection-grid/validPayload').then((payload) => {
                cy.updateSelectionGrid(createdContentId, {
                    ...payload,
                    selection_sets: {
                        column_a_options: [],
                        column_b_options: [{ option_value: 'A', option_index: 1, option_voiceover: {} }]
                    }
                }, false).then((response) => {
                    expect(response.status).to.eq(400);
                });
            });
        });

        it('TC028 - Should return error for empty correct_answer array', () => {
            cy.fixture('selection-grid/validPayload').then((payload) => {
                cy.updateSelectionGrid(createdContentId, {
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
        it('TC029 - Should handle very long stem (5000 characters)', () => {
            const longStem = '<p>' + 'A'.repeat(5000) + '</p>';
            cy.fixture('selection-grid/validPayload').then((payload) => {
                cy.updateSelectionGrid(createdContentId, {
                    ...payload,
                    stem: longStem
                }, false).then((response) => {
                    expect(response.status).to.be.oneOf([200, 400, 413]);
                });
            });
        });

        it('TC030 - Should handle special characters in stem', () => {
            const specialStem = "<p>Special chars: !@#$%^&*()_+-=[]{}|;:',.><nbsp;?/~`</p>";
            cy.fixture('selection-grid/validPayload').then((payload) => {
                cy.updateSelectionGrid(createdContentId, {
                    ...payload,
                    stem: specialStem
                }, false).then((response) => {
                    expect(response.status).to.be.oneOf([200, 400]);
                });
            });
        });

        it('TC031 - Should handle unicode characters in stem', () => {
            const unicodeStem = "<p>Unicode: 😀🎉🌟✨💯🔥⭐️🎯</p>";
            cy.fixture('selection-grid/validPayload').then((payload) => {
                cy.updateSelectionGrid(createdContentId, {
                    ...payload,
                    stem: unicodeStem
                }, false).then((response) => {
                    expect(response.status).to.be.oneOf([200, 400]);
                });
            });
        });

        it('TC032 - Should handle SQL injection attempt in stem', () => {
            const sqlStem = "<p>'; DROP TABLE questions; --</p>";
            cy.fixture('selection-grid/validPayload').then((payload) => {
                cy.updateSelectionGrid(createdContentId, {
                    ...payload,
                    stem: sqlStem
                }, false).then((response) => {
                    expect(response.status).to.not.eq(500);
                    expect(response.status).to.be.oneOf([200, 400]);
                });
            });
        });

        it('TC033 - Should handle XSS attempt in stem', () => {
            const xssStem = "<script>alert('XSS')</script><p>Stem</p>";
            cy.fixture('selection-grid/validPayload').then((payload) => {
                cy.updateSelectionGrid(createdContentId, {
                    ...payload,
                    stem: xssStem
                }, false).then((response) => {
                    expect(response.status).to.not.eq(500);
                });
            });
        });

        it('TC034 - Should handle maximum number of pairs (10)', () => {
            cy.fixture('selection-grid/validPayload').then((payload) => {
                const maxOptionsA = [];
                const maxOptionsB = [];
                const maxAnswers = [];
                for (let i = 1; i <= 10; i++) {
                    maxOptionsA.push({ option_value: `A ${i}`, option_index: i, option_voiceover: { "en-IN": `a${i}.wav` } });
                    maxOptionsB.push({ option_value: `B ${i}`, option_index: i, option_voiceover: { "en-IN": `b${i}.wav` } });
                    maxAnswers.push({ column_a_index: i, column_b_index: i });
                }
                cy.updateSelectionGrid(createdContentId, {
                    ...payload,
                    selection_sets: { column_a_options: maxOptionsA, column_b_options: maxOptionsB },
                    correct_answer: maxAnswers
                }, false).then((response) => {
                    expect(response.status).to.be.oneOf([200, 400]);
                });
            });
        });

        it('TC035 - Should handle max_score as zero', () => {
            cy.fixture('selection-grid/validPayload').then((payload) => {
                cy.updateSelectionGrid(createdContentId, {
                    ...payload,
                    max_score: 0
                }, false).then((response) => {
                    expect(response.status).to.be.oneOf([200, 400]);
                });
            });
        });

        it('TC036 - Should handle extra fields in content_details', () => {
            cy.fixture('selection-grid/validPayload').then((payload) => {
                cy.updateSelectionGrid(createdContentId, {
                    ...payload,
                    extra_field: "should be ignored",
                    another_extra: 12345
                }, false).then((response) => {
                    expect(response.status).to.be.oneOf([200, 400]);
                });
            });
        });

        it('TC037 - Should handle empty voiceover objects', () => {
            cy.fixture('selection-grid/validPayload').then((payload) => {
                cy.updateSelectionGrid(createdContentId, {
                    ...payload,
                    stem_voiceover: {},
                    instruction_voiceover: {}
                }, false).then((response) => {
                    expect(response.status).to.be.oneOf([200, 400]);
                });
            });
        });

        it('TC038 - Should handle duplicate option indices', () => {
            cy.fixture('selection-grid/validPayload').then((payload) => {
                cy.updateSelectionGrid(createdContentId, {
                    ...payload,
                    selection_sets: {
                        column_a_options: [
                            { option_value: "A", option_index: 1, option_voiceover: { "en-IN": "a.wav" } },
                            { option_value: "B", option_index: 1, option_voiceover: { "en-IN": "b.wav" } }
                        ],
                        column_b_options: [
                            { option_value: "X", option_index: 1, option_voiceover: { "en-IN": "x.wav" } }
                        ]
                    },
                    correct_answer: [{ column_a_index: 1, column_b_index: 1 }]
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
        it('TC039 - Should validate successful update response structure', () => {
            cy.updateSelectionGridFromFixture(createdContentId, 'selection-grid/updatePayload', false).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('content_id');
                expect(response.body).to.have.property('content_row_id');
                expect(response.body.content_id).to.eq(createdContentId);
            });
        });

        it('TC040 - Should validate error response structure', () => {
            cy.updateSelectionGrid('INVALID', {}, false).then((response) => {
                expect(response.status).to.be.oneOf([400, 404]);
                expect(response.body).to.have.property('message');
                expect(response.body.message).to.be.a('string');
            });
        });

        it('TC041 - Should validate Content-Type header', () => {
            cy.updateSelectionGridFromFixture(createdContentId, 'selection-grid/updatePayload', false).then((response) => {
                expect(response.headers).to.have.property('content-type');
                expect(response.headers['content-type']).to.include('application/json');
            });
        });
    });
});
