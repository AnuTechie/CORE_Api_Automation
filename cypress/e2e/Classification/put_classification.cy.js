/// <reference types="cypress" />

/**
 * Classification Question UPDATE API Test Suite
 * Endpoint: PUT /api/content/v1/questions/classification/{content_id}
 * Base URL: http://192.168.0.156:3000
 * 
 * Test Categories:
 * - Positive Tests: Update operations, versioning
 * - Negative Tests: Invalid inputs, missing fields
 * - Edge Cases: Boundary conditions, special characters
 */

describe('Classification Update API Tests', () => {
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

        // Create a Classification question to use for UPDATE tests
        cy.createClassificationFromFixture('classification/validPayload').then((response) => {
            expect(response.status).to.eq(201);
            createdContentId = response.body.content_id;
            createdContentRowId = response.body.content_row_id;
            cy.log(`✓ Created Classification: ${createdContentId} (${createdContentRowId})`);
        });
    });

    // =============================================
    // POSITIVE TEST CASES - UPDATE (create_new_version: false)
    // =============================================
    describe('Positive Tests - Update Existing Version', () => {
        it('TC001 - Should update Classification question successfully', () => {
            cy.updateClassificationFromFixture(createdContentId, 'classification/updatePayload', false).then((response) => {
                cy.log(response.body);
                expect(response.status).to.eq(200);

                // Verify updated content in database
                cy.verifyContentInDB(createdContentId).then((dbRow) => {
                    expect(dbRow).to.not.be.null;
                    cy.log(`✓ Content ${createdContentId} updated in database`);
                });
            });
        });

        it('TC002 - Should update only the stem field', () => {
            const updatedStem = "UPDATED: Classify the following items into categories";
            cy.fixture('classification/updatePayload').then((payload) => {
                cy.updateClassification(createdContentId, { ...payload, stem: updatedStem }, false).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });

        it('TC003 - Should update explanation field', () => {
            cy.fixture('classification/updatePayload').then((payload) => {
                cy.updateClassification(createdContentId, {
                    ...payload,
                    explanation: "UPDATED: Detailed explanation for classification"
                }, false).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });

        it('TC004 - Should update max_score', () => {
            cy.fixture('classification/updatePayload').then((payload) => {
                cy.updateClassification(createdContentId, {
                    ...payload,
                    max_score: 4
                }, false).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });

        it('TC005 - Should update keyword_ids', () => {
            cy.fixture('classification/updatePayload').then((payload) => {
                cy.updateClassification(createdContentId, {
                    ...payload,
                    keyword_ids: [1, 9, 10]
                }, false).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });

        it('TC006 - Should update categories', () => {
            cy.fixture('classification/updatePayload').then((payload) => {
                const updatedCategories = [
                    { id: 1, name: "Updated Category 1" },
                    { id: 2, name: "Updated Category 2" },
                    { id: 3, name: "New Category 3" }
                ];
                cy.updateClassification(createdContentId, {
                    ...payload,
                    categories: updatedCategories
                }, false).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });

        it('TC007 - Should update items', () => {
            cy.fixture('classification/updatePayload').then((payload) => {
                const updatedItems = [
                    { id: 1, name: "Updated Item 1" },
                    { id: 2, name: "Updated Item 2" },
                    { id: 3, name: "Updated Item 3" },
                    { id: 4, name: "New Item 4" }
                ];
                cy.updateClassification(createdContentId, {
                    ...payload,
                    items: updatedItems
                }, false).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });

        it('TC008 - Should update correct_answer', () => {
            cy.fixture('classification/updatePayload').then((payload) => {
                cy.updateClassification(createdContentId, {
                    ...payload,
                    "correct_answer": {
                        "1": [
                            2
                        ],
                        "2": [
                            1,
                            3,
                            4
                        ]
                    },
                }, false).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });

        it('TC009 - Should update template field', () => {
            cy.fixture('classification/updatePayload').then((payload) => {
                cy.updateClassification(createdContentId, {
                    ...payload,
                    template: "one_by_one"
                }, false).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });

        it('TC011 - Should update testing_objective', () => {
            cy.fixture('classification/updatePayload').then((payload) => {
                cy.updateClassification(createdContentId, {
                    ...payload,
                    testing_objective: "UPDATED: Testing student's classification ability"
                }, false).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });

        it('TC012 - Should update items with voiceover', () => {
            cy.fixture('classification/updatePayload').then((payload) => {
                const itemsWithVoiceover = [
                    {
                        id: 1,
                        name: "Item 1",
                        item_voiceover: {
                            "en": "updated_item1.mp3",
                            "hi": "updated_item1_hi.mp3"
                        }
                    },
                    {
                        id: 2,
                        name: "Item 2"
                    }
                ];
                cy.updateClassification(createdContentId, {
                    ...payload,
                    items: itemsWithVoiceover,
                    correct_answer: { "1": [1], "2": [2] }
                }, false).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });

        it('TC013 - Should update context field', () => {
            cy.fixture('classification/updatePayload').then((payload) => {
                cy.updateClassification(createdContentId, {
                    ...payload,
                    context: "GB"
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
        it('TC015 - Should create new version successfully', () => {
            cy.updateClassificationFromFixture(createdContentId, 'classification/updatePayload', true).then((response) => {
                expect(response.status).to.eq(200);
                cy.log(`✓ New version created for ${createdContentId}`);
            });
        });

        it('TC016 - Should create new version with modified stem', () => {
            cy.fixture('classification/updatePayload').then((payload) => {
                cy.updateClassification(createdContentId, {
                    ...payload,
                    stem: "VERSION 2: Classify these items"
                }, true).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });

        it('TC017 - Should create new version with different language', () => {
            cy.fixture('classification/updatePayload').then((payload) => {
                cy.updateClassification(createdContentId, {
                    ...payload,
                    language_code: "hi",
                    stem: "इन वस्तुओं को वर्गीकृत करें",
                    categories: [
                        { id: 1, name: "श्रेणी 1" },
                        { id: 2, name: "श्रेणी 2" }
                    ]
                }, true).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });

        it('TC018 - Should create new version with increased max_score', () => {
            cy.fixture('classification/updatePayload').then((payload) => {
                cy.updateClassification(createdContentId, {
                    ...payload,
                    max_score: 10
                }, true).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });

        it('TC019 - Should create new version with more categories', () => {
            cy.fixture('classification/updatePayload').then((payload) => {
                const newCategories = [
                    { id: 1, name: "Category 1" },
                    { id: 2, name: "Category 2" },
                    { id: 3, name: "Category 3" },
                    { id: 4, name: "Category 4" }
                ];
                cy.updateClassification(createdContentId, {
                    ...payload,
                    categories: newCategories
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
        it('TC020 - Should return error for invalid content_id', () => {
            cy.fixture('classification/updatePayload').then((payload) => {
                cy.updateClassification('INVALID_ID', payload, false).then((response) => {
                    expect(response.status).to.be.oneOf([400, 404]);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC021 - Should return error for non-existent content_id', () => {
            cy.fixture('classification/updatePayload').then((payload) => {
                cy.updateClassification('Q999999999', payload, false).then((response) => {
                    expect(response.status).to.be.oneOf([400, 404]);
                });
            });
        });

        it('TC022 - Should return error when missing required field - stem', () => {
            cy.fixture('classification/validPayload').then((payload) => {
                const { stem, ...payloadWithoutStem } = payload;
                cy.updateClassification(createdContentId, payloadWithoutStem, false).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message');
                });
            });
        });

        it('TC023 - Should return error when missing project_id', () => {
            cy.fixture('classification/validPayload').then((payload) => {
                const { project_id, ...payloadWithoutField } = payload;
                cy.updateClassification(createdContentId, payloadWithoutField, false).then((response) => {
                    expect(response.status).to.eq(400);
                });
            });
        });

        it('TC024 - Should return error when missing language_code', () => {
            cy.fixture('classification/validPayload').then((payload) => {
                const { language_code, ...payloadWithoutField } = payload;
                cy.updateClassification(createdContentId, payloadWithoutField, false).then((response) => {
                    expect(response.status).to.eq(400);
                });
            });
        });

        it('TC025 - Should return error when missing class', () => {
            cy.fixture('classification/validPayload').then((payload) => {
                const { class: classNum, ...payloadWithoutField } = payload;
                cy.updateClassification(createdContentId, payloadWithoutField, false).then((response) => {
                    expect(response.status).to.eq(400);
                });
            });
        });

        it('TC026 - Should return error when missing categories', () => {
            cy.fixture('classification/validPayload').then((payload) => {
                const { categories, ...payloadWithoutField } = payload;
                cy.updateClassification(createdContentId, payloadWithoutField, false).then((response) => {
                    expect(response.status).to.eq(400);
                });
            });
        });

        it('TC027 - Should return error when missing items', () => {
            cy.fixture('classification/validPayload').then((payload) => {
                const { items, ...payloadWithoutField } = payload;
                cy.updateClassification(createdContentId, payloadWithoutField, false).then((response) => {
                    expect(response.status).to.eq(400);
                });
            });
        });

        it('TC028 - Should return error when missing correct_answer', () => {
            cy.fixture('classification/validPayload').then((payload) => {
                const { correct_answer, ...payloadWithoutField } = payload;
                cy.updateClassification(createdContentId, payloadWithoutField, false).then((response) => {
                    expect(response.status).to.eq(400);
                });
            });
        });

        it('TC029 - Should return error for empty content_details', () => {
            cy.updateClassification(createdContentId, {}, false).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC030 - Should return error for invalid content_row_id', () => {
            cy.fixture('classification/updatePayload').then((payload) => {
                cy.updateClassification(createdContentId, payload, false, 'INVALID_ROW_ID').then((response) => {
                    expect(response.status).to.be.oneOf([400, 500]);
                });
            });
        });

        it('TC031 - Should return error for negative max_score', () => {
            cy.fixture('classification/validPayload').then((payload) => {
                cy.updateClassification(createdContentId, {
                    ...payload,
                    max_score: -1
                }, false).then((response) => {
                    expect(response.status).to.eq(400);
                });
            });
        });

        it('TC032 - Should return error for empty categories array', () => {
            cy.fixture('classification/validPayload').then((payload) => {
                cy.updateClassification(createdContentId, {
                    ...payload,
                    categories: []
                }, false).then((response) => {
                    expect(response.status).to.eq(400);
                });
            });
        });

        it('TC033 - Should return error for empty items array', () => {
            cy.fixture('classification/validPayload').then((payload) => {
                cy.updateClassification(createdContentId, {
                    ...payload,
                    items: []
                }, false).then((response) => {
                    expect(response.status).to.eq(400);
                });
            });
        });

        it('TC034 - Should return error for empty correct_answer', () => {
            cy.fixture('classification/validPayload').then((payload) => {
                cy.updateClassification(createdContentId, {
                    ...payload,
                    correct_answer: {}
                }, false).then((response) => {
                    expect(response.status).to.eq(400);
                });
            });
        });

        it('TC035 - Should return error for category missing id', () => {
            cy.fixture('classification/validPayload').then((payload) => {
                cy.updateClassification(createdContentId, {
                    ...payload,
                    categories: [
                        { name: "Category without ID" }
                    ]
                }, false).then((response) => {
                    expect(response.status).to.eq(400);
                });
            });
        });

        it('TC036 - Should return error for category missing name', () => {
            cy.fixture('classification/validPayload').then((payload) => {
                cy.updateClassification(createdContentId, {
                    ...payload,
                    categories: [
                        { id: 1 },
                        { id: 2, name: "Category 2" }
                    ]
                }, false).then((response) => {
                    expect(response.status).to.eq(400);
                });
            });
        });

        it('TC037 - Should return error for item missing id', () => {
            cy.fixture('classification/validPayload').then((payload) => {
                cy.updateClassification(createdContentId, {
                    ...payload,
                    items: [
                        { name: "Item without ID" }
                    ]
                }, false).then((response) => {
                    expect(response.status).to.eq(400);
                });
            });
        });

        it('TC038 - Should return error for item missing name', () => {
            cy.fixture('classification/validPayload').then((payload) => {
                cy.updateClassification(createdContentId, {
                    ...payload,
                    items: [
                        { id: 1 }
                    ]
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
        it('TC039 - Should handle very long stem (5000 characters)', () => {
            const longStem = 'A'.repeat(5000);
            cy.fixture('classification/validPayload').then((payload) => {
                cy.updateClassification(createdContentId, {
                    ...payload,
                    stem: longStem
                }, false).then((response) => {
                    expect(response.status).to.be.oneOf([200, 400, 413]);
                });
            });
        });

        it('TC040 - Should handle special characters in stem', () => {
            const specialStem = "Special chars: !@#$%^&*()_+-=[]{}|;:',.<>?/~`";
            cy.fixture('classification/validPayload').then((payload) => {
                cy.updateClassification(createdContentId, {
                    ...payload,
                    stem: specialStem
                }, false).then((response) => {
                    expect(response.status).to.be.oneOf([200, 400]);
                });
            });
        });

        it('TC041 - Should handle unicode characters in stem', () => {
            const unicodeStem = "Unicode: 😀🎉🌟✨💯🔥⭐️🎯";
            cy.fixture('classification/validPayload').then((payload) => {
                cy.updateClassification(createdContentId, {
                    ...payload,
                    stem: unicodeStem
                }, false).then((response) => {
                    expect(response.status).to.be.oneOf([200, 400]);
                });
            });
        });

        it('TC042 - Should handle SQL injection attempt in stem', () => {
            const sqlStem = "'; DROP TABLE questions; --";
            cy.fixture('classification/validPayload').then((payload) => {
                cy.updateClassification(createdContentId, {
                    ...payload,
                    stem: sqlStem
                }, false).then((response) => {
                    expect(response.status).to.not.eq(500);
                    expect(response.status).to.be.oneOf([200, 400]);
                });
            });
        });

        it('TC043 - Should handle XSS attempt in stem', () => {
            const xssStem = "<script>alert('XSS')</script>Stem";
            cy.fixture('classification/validPayload').then((payload) => {
                cy.updateClassification(createdContentId, {
                    ...payload,
                    stem: xssStem
                }, false).then((response) => {
                    expect(response.status).to.not.eq(500);
                });
            });
        });

        it('TC044 - Should handle maximum categories (10)', () => {
            cy.fixture('classification/validPayload').then((payload) => {
                const maxCategories = [];
                for (let i = 1; i <= 10; i++) {
                    maxCategories.push({ id: i, name: `Category ${i}` });
                }
                cy.updateClassification(createdContentId, {
                    ...payload,
                    categories: maxCategories
                }, false).then((response) => {
                    expect(response.status).to.be.oneOf([200, 400]);
                });
            });
        });

        it('TC045 - Should handle maximum items (20)', () => {
            cy.fixture('classification/validPayload').then((payload) => {
                const maxItems = [];
                for (let i = 1; i <= 20; i++) {
                    maxItems.push({ id: i, name: `Item ${i}` });
                }
                cy.updateClassification(createdContentId, {
                    ...payload,
                    items: maxItems
                }, false).then((response) => {
                    expect(response.status).to.be.oneOf([200, 400]);
                });
            });
        });

        it('TC046 - Should handle duplicate category IDs', () => {
            cy.fixture('classification/validPayload').then((payload) => {
                cy.updateClassification(createdContentId, {
                    ...payload,
                    categories: [
                        { id: 1, name: "Category 1" },
                        { id: 1, name: "Duplicate Category" }
                    ]
                }, false).then((response) => {
                    expect(response.status).to.be.oneOf([200, 400]);
                });
            });
        });

        it('TC047 - Should handle duplicate item IDs', () => {
            cy.fixture('classification/validPayload').then((payload) => {
                cy.updateClassification(createdContentId, {
                    ...payload,
                    items: [
                        { id: 1, name: "Item 1" },
                        { id: 1, name: "Duplicate Item" }
                    ]
                }, false).then((response) => {
                    expect(response.status).to.be.oneOf([200, 400]);
                });
            });
        });

        it('TC048 - Should handle max_score as zero', () => {
            cy.fixture('classification/validPayload').then((payload) => {
                cy.updateClassification(createdContentId, {
                    ...payload,
                    max_score: 0
                }, false).then((response) => {
                    expect(response.status).to.be.oneOf([200, 400]);
                });
            });
        });

        it('TC049 - Should handle extra fields in content_details', () => {
            cy.fixture('classification/validPayload').then((payload) => {
                cy.updateClassification(createdContentId, {
                    ...payload,
                    extra_field: "should be ignored"
                }, false).then((response) => {
                    expect(response.status).to.be.oneOf([200, 400]);
                });
            });
        });

        it('TC050 - Should handle correct_answer with non-existent category ID', () => {
            cy.fixture('classification/validPayload').then((payload) => {
                cy.updateClassification(createdContentId, {
                    ...payload,
                    correct_answer: {
                        "999": [1, 2]
                    }
                }, false).then((response) => {
                    expect(response.status).to.be.oneOf([200, 400]);
                });
            });
        });

        it('TC051 - Should handle correct_answer with non-existent item ID', () => {
            cy.fixture('classification/validPayload').then((payload) => {
                cy.updateClassification(createdContentId, {
                    ...payload,
                    correct_answer: {
                        "1": [999, 888]
                    }
                }, false).then((response) => {
                    expect(response.status).to.be.oneOf([200, 400]);
                });
            });
        });

        it('TC052 - Should handle empty category name', () => {
            cy.fixture('classification/validPayload').then((payload) => {
                cy.updateClassification(createdContentId, {
                    ...payload,
                    categories: [
                        { id: 1, name: "" },
                        { id: 2, name: "Valid Category" }
                    ]
                }, false).then((response) => {
                    expect(response.status).to.be.oneOf([200, 400]);
                });
            });
        });

        it('TC053 - Should handle empty item name', () => {
            cy.fixture('classification/validPayload').then((payload) => {
                cy.updateClassification(createdContentId, {
                    ...payload,
                    items: [
                        { id: 1, name: "" },
                        { id: 2, name: "Valid Item" }
                    ]
                }, false).then((response) => {
                    expect(response.status).to.be.oneOf([200, 400]);
                });
            });
        });

        it('TC054 - Should handle special characters in category names', () => {
            cy.fixture('classification/validPayload').then((payload) => {
                cy.updateClassification(createdContentId, {
                    ...payload,
                    categories: [
                        { id: 1, name: "Category !@#$%^" },
                        { id: 2, name: "Category <>&\"'" }
                    ]
                }, false).then((response) => {
                    expect(response.status).to.be.oneOf([200, 400]);
                });
            });
        });

        it('TC055 - Should handle unicode in item names', () => {
            cy.fixture('classification/validPayload').then((payload) => {
                cy.updateClassification(createdContentId, {
                    ...payload,
                    items: [
                        { id: 1, name: "Item 😀" },
                        { id: 2, name: "आइटम' २" }
                    ],
                    correct_answer: { "1": [1], "2": [2] }
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
        it('TC056 - Should validate successful update response structure', () => {
            cy.updateClassificationFromFixture(createdContentId, 'classification/updatePayload', false).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('content_id');
                expect(response.body).to.have.property('content_row_id');
            });
        });

        it('TC057 - Should validate error response structure', () => {
            cy.updateClassification('INVALID', {}, false).then((response) => {
                expect(response.status).to.be.oneOf([400, 404]);
                expect(response.body).to.have.property('message');
                expect(response.body.message).to.be.a('string');
            });
        });

        it('TC058 - Should validate Content-Type header', () => {
            cy.updateClassificationFromFixture(createdContentId, 'classification/updatePayload', false).then((response) => {
                expect(response.headers).to.have.property('content-type');
                expect(response.headers['content-type']).to.include('application/json');
            });
        });
    });
});
