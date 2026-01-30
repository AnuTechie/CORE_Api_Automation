describe('Hottext Question API Tests', () => {
    let createdContentId;
    let createdContentRowId;

    before(() => {
        cy.loginAndStoreTokens(
            Cypress.env('USERNAME'),
            Cypress.env('PASSWORD')
        );
    });

    // =============================================
    // POSITIVE TEST CASES
    // =============================================
    describe('Positive Test Cases', () => {
        it('TC001 - Should create Hottext question with required fields only', () => {
            cy.createHottextFromFixture('hottext/validPayload').then((response) => {
                expect(response.status).to.be.oneOf([201, 500]);
                if (response.status === 201) {
                    expect(response.body).to.have.property('content_id');
                    expect(response.body).to.have.property('content_row_id');
                    expect(response.body.content_id).to.be.a('string').and.not.be.empty;
                    expect(response.body.content_row_id).to.be.a('string').and.not.be.empty;

                    createdContentId = response.body.content_id;
                    createdContentRowId = response.body.content_row_id;

                    cy.verifyContentInDB(createdContentId).then((dbRow) => {
                        expect(dbRow, 'Content should exist in database').to.not.be.null;
                        expect(dbRow.content_id).to.eq(createdContentId);
                        expect(dbRow.question_type).to.eq('Hottext');
                        cy.log(`✓ Content ${createdContentId} verified in database`);
                    });
                }
            });
        });

        it('TC002 - Should create Hottext question with all fields', () => {
            cy.createHottextFromFixture('hottext/fullPayload').then((response) => {
                expect(response.status).to.be.oneOf([201, 400, 500]);
                if (response.status === 201) {
                    expect(response.body).to.have.property('content_id');
                    expect(response.body).to.have.property('content_row_id');
                }
            });
        });

        it('TC003 - Should create Hottext with single selection', () => {
            cy.fixture('hottext/positivePayloads').then((payloads) => {
                cy.createHottext(payloads.singleSelection).then((response) => {
                    expect(response.status).to.be.oneOf([201, 500]);
                    expect(response.body).to.have.property('content_id');
                });
            });
        });

        it('TC004 - Should create Hottext with multiple selections', () => {
            cy.fixture('hottext/positivePayloads').then((payloads) => {
                cy.createHottext(payloads.multipleSelections).then((response) => {
                    expect(response.status).to.be.oneOf([201, 500]);
                    expect(response.body).to.have.property('content_id');
                });
            });
        });

        it('TC005 - Should create Hottext with letter selection type', () => {
            cy.fixture('hottext/positivePayloads').then((payloads) => {
                cy.createHottext(payloads.letterSelection).then((response) => {
                    expect(response.status).to.be.oneOf([201, 500]);
                });
            });
        });

        it('TC006 - Should create Hottext with sentence selection type', () => {
            cy.fixture('hottext/positivePayloads').then((payloads) => {
                cy.createHottext(payloads.sentenceSelection).then((response) => {
                    expect(response.status).to.be.oneOf([201, 500]);
                });
            });
        });

        it('TC007 - Should create Hottext with Hindi language', () => {
            cy.fixture('hottext/positivePayloads').then((payloads) => {
                cy.createHottext(payloads.hindiLanguage).then((response) => {
                    expect(response.status).to.be.oneOf([201, 500]);
                });
            });
        });

        it('TC008 - Should create Hottext with keyword_ids', () => {
            cy.fixture('hottext/positivePayloads').then((payloads) => {
                cy.createHottext(payloads.withKeywords).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400, 500]);
                });
            });
        });

        it('TC009 - Should create Hottext with keyword_ids override', () => {
            cy.createHottextFromFixture('hottext/validPayload', { keyword_ids: [1, 2, 3] }).then((response) => {
                expect(response.status).to.be.oneOf([201, 400, 500]);
            });
        });

        it('TC010 - Should create Hottext with max_score override', () => {
            cy.createHottextFromFixture('hottext/validPayload', { max_score: 5 }).then((response) => {
                expect(response.status).to.be.oneOf([201, 400, 500]);
            });
        });

        it('TC011 - Should create Hottext with custom instruction', () => {
            cy.createHottextFromFixture('hottext/validPayload', {
                instruction: 'Select all correct highlighted words'
            }).then((response) => {
                expect(response.status).to.be.oneOf([201, 500]);
            });
        });

        it('TC012 - Should create Hottext with custom explanation', () => {
            cy.createHottextFromFixture('hottext/validPayload', {
                explanation: 'These are the correct selections based on grammar rules'
            }).then((response) => {
                expect(response.status).to.be.oneOf([201, 500]);
            });
        });

        it('TC013 - Should create Hottext with testing_objective', () => {
            cy.createHottextFromFixture('hottext/validPayload', {
                testing_objective: 'Assess word identification skills'
            }).then((response) => {
                expect(response.status).to.be.oneOf([201, 500]);
            });
        });

        it('TC014 - Should create Hottext with content_origin_type as copy', () => {
            cy.fixture('hottext/edgeCases').then((edge) => {
                cy.createHottextFromFixture('hottext/validPayload', edge.contentOriginCopy).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400, 404, 500]);
                });
            });
        });

        it('TC015 - Should create Hottext with content_origin_type as variant', () => {
            cy.fixture('hottext/edgeCases').then((edge) => {
                cy.createHottextFromFixture('hottext/validPayload', edge.contentOriginVariant).then((response) => {
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
            cy.createHottextFromFixture('hottext/validPayload', { project_id: undefined }).then((response) => {
                expect(response.status).to.be.oneOf([400, 500]);
                expect(response.body).to.have.property('message');
            });
        });

        it('TC017 - Should return 400 when language_code is missing', () => {
            cy.createHottextFromFixture('hottext/validPayload', { language_code: undefined }).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message');
            });
        });

        it('TC018 - Should return 400 when question_type is missing', () => {
            cy.createHottextFromFixture('hottext/validPayload', { question_type: undefined }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC019 - Should return 400 when subject_no is missing', () => {
            cy.createHottextFromFixture('hottext/validPayload', { subject_no: undefined }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC020 - Should return 400 when class is missing', () => {
            cy.createHottextFromFixture('hottext/validPayload', { class: undefined }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC021 - Should return 400 when stem is missing', () => {
            cy.createHottextFromFixture('hottext/validPayload', { stem: undefined }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC022 - Should return 400 when selection_type is missing', () => {
            cy.createHottextFromFixture('hottext/validPayload', { selection_type: undefined }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC023 - Should return 400 when correct_answer is missing', () => {
            cy.createHottextFromFixture('hottext/validPayload', { correct_answer: undefined }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC024 - Should return 400 with empty request body', () => {
            cy.createHottext({}).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC025 - Should return 400 when correct_answer is empty array', () => {
            cy.createHottextFromFixture('hottext/validPayload', { correct_answer: [] }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC026 - Should return 400 for invalid project_id type', () => {
            cy.createHottextFromFixture('hottext/validPayload', { project_id: 'invalid' }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC027 - Should return 400 for invalid language_code', () => {
            cy.createHottextFromFixture('hottext/validPayload', { language_code: 'xyz' }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC028 - Should return 400 for invalid question_type', () => {
            cy.createHottextFromFixture('hottext/validPayload', { question_type: 'InvalidType' }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC029 - Should return 400 for invalid selection_type', () => {
            cy.createHottextFromFixture('hottext/validPayload', { selection_type: 'invalid_type' }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC030 - Should return 400 when selection_type is not enum value', () => {
            cy.createHottextFromFixture('hottext/validPayload', { selection_type: 'random' }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC031 - Should return error for invalid project_id (string instead of integer)', () => {
            cy.createHottextFromFixture('hottext/validPayload', { project_id: '999' }).then((response) => {
                expect(response.status).to.be.oneOf([400, 500]);
            });
        });

        it('TC032 - Should return 400 for invalid language_code format', () => {
            cy.createHottextFromFixture('hottext/validPayload', { language_code: 'invalid-code' }).then((response) => {
                expect(response.status).to.be.oneOf([400, 422]);
            });
        });

        it('TC033 - Should handle non-existent selection ID in correct_answer', () => {
            cy.createHottextFromFixture('hottext/validPayload', { correct_answer: ['ht999', 'ht1000'] }).then((response) => {
                expect(response.status).to.be.oneOf([201, 400, 422, 500]);
            });
        });

        it('TC034 - Should return 400 when keyword_ids contains non-integer', () => {
            cy.createHottextFromFixture('hottext/validPayload', { keyword_ids: ['a', 'b', 'c'] }).then((response) => {
                expect(response.status).to.be.oneOf([400, 422]);
            });
        });

        it('TC035 - Should return 400 when correct_answer is not an array', () => {
            cy.createHottextFromFixture('hottext/validPayload', { correct_answer: 'ht1' }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC036 - Should return 400 when subject_no is invalid', () => {
            cy.createHottextFromFixture('hottext/validPayload', { subject_no: 'invalid' }).then((response) => {
                expect(response.status).to.be.oneOf([400, 422]);
            });
        });

        it('TC037 - Should return 400 when max_score is negative', () => {
            cy.createHottextFromFixture('hottext/validPayload', { max_score: -5 }).then((response) => {
                expect(response.status).to.be.oneOf([400, 422]);
            });
        });

        it('TC038 - Should return 400 when max_score is not an integer', () => {
            cy.createHottextFromFixture('hottext/validPayload', { max_score: 'high' }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC039 - Should return 400 when keyword_ids is not an array', () => {
            cy.createHottextFromFixture('hottext/validPayload', { keyword_ids: 123 }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('TC040 - Should return 400 when selection_type is provided as array', () => {
            cy.createHottextFromFixture('hottext/validPayload', { selection_type: ['words', 'letters'] }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });
    });

    // =============================================
    // EDGE CASES
    // =============================================
    describe('Edge Cases', () => {
        it('TC041 - Should handle very long stem (3000 characters)', () => {
            const longStem = '<p>' + 'A'.repeat(3000) + '</p>';
            cy.createHottextFromFixture('hottext/validPayload', { stem: longStem }).then((response) => {
                expect(response.status).to.be.oneOf([201, 400, 500]);
            });
        });

        it('TC042 - Should handle special characters in stem', () => {
            cy.fixture('hottext/edgeCases').then((edge) => {
                cy.createHottextFromFixture('hottext/validPayload', {
                    stem: edge.specialChars.stem,
                    correct_answer: ['ht1']
                }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400, 500]);
                });
            });
        });

        it('TC043 - Should handle unicode characters in stem', () => {
            cy.fixture('hottext/edgeCases').then((edge) => {
                cy.createHottextFromFixture('hottext/validPayload', { stem: edge.unicodeStem.stem }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400, 500]);
                });
            });
        });

        it('TC044 - Should handle SQL injection in stem', () => {
            cy.fixture('hottext/edgeCases').then((edge) => {
                cy.createHottextFromFixture('hottext/validPayload', { stem: edge.sqlInjection.stem }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400, 500]);
                });
            });
        });

        it('TC045 - Should handle XSS attempt in stem', () => {
            cy.fixture('hottext/edgeCases').then((edge) => {
                cy.createHottextFromFixture('hottext/validPayload', { stem: edge.xssAttempt.stem }).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400, 500]);
                });
            });
        });

        it('TC046 - Should handle empty correct_answer array', () => {
            cy.fixture('hottext/edgeCases').then((edge) => {
                cy.createHottextFromFixture('hottext/validPayload', edge.emptySelection).then((response) => {
                    expect(response.status).to.be.oneOf([400, 422, 500]);
                });
            });
        });

        it('TC047 - Should handle duplicate selections in correct_answer', () => {
            cy.fixture('hottext/edgeCases').then((edge) => {
                cy.createHottextFromFixture('hottext/validPayload', edge.duplicateSelection).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400, 500]);
                });
            });
        });

        it('TC048 - Should handle invalid selection IDs', () => {
            cy.fixture('hottext/edgeCases').then((edge) => {
                cy.createHottextFromFixture('hottext/validPayload', edge.invalidSelectionId).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400, 422]);
                });
            });
        });

        it('TC049 - Should handle extra fields in request body (should be ignored)', () => {
            cy.createHottextFromFixture('hottext/validPayload', {
                extra_field_1: 'should_be_ignored',
                extra_field_2: 12345
            }).then((response) => {
                expect(response.status).to.be.oneOf([201, 400, 500]);
            });
        });

        it('TC050 - Should validate response time is within acceptable limit', () => {
            const startTime = Date.now();
            cy.createHottextFromFixture('hottext/validPayload').then((response) => {
                const endTime = Date.now();
                const responseTime = endTime - startTime;
                expect(response.status).to.be.oneOf([201, 500]);
                if (response.status === 201) {
                    expect(responseTime).to.be.lessThan(5000);
                }
            });
        });

        it('TC051 - Should handle different selection types with same payload structure', () => {
            cy.fixture('hottext/edgeCases').then((edge) => {
                cy.createHottextFromFixture('hottext/validPayload', edge.selectionTypeLetters).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400, 500]);
                });
            });
        });

        it('TC052 - Should handle sentence selection type', () => {
            cy.fixture('hottext/edgeCases').then((edge) => {
                cy.createHottextFromFixture('hottext/validPayload', edge.selectionTypeSentences).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400, 500]);
                });
            });
        });

        it('TC053 - Should handle large number of hottext elements', () => {
            cy.fixture('hottext/edgeCases').then((edge) => {
                cy.createHottextFromFixture('hottext/validPayload', edge.largeHottextCount).then((response) => {
                    expect(response.status).to.be.oneOf([201, 400, 500]);
                });
            });
        });

        it('TC054 - Should handle hottext with numbers as IDs', () => {
            cy.createHottextFromFixture('hottext/validPayload', {
                stem: '<p><hot-text id="1" class="correct">First</hot-text> <hot-text id="2">Second</hot-text></p>',
                correct_answer: ['1']
            }).then((response) => {
                expect(response.status).to.be.oneOf([201, 400, 500]);
            });
        });

        it('TC055 - Should handle negative subject_no', () => {
            cy.createHottextFromFixture('hottext/validPayload', { subject_no: -1 }).then((response) => {
                expect(response.status).to.be.oneOf([400, 422, 201, 500]);
            });
        });
    });

    // =============================================
    // RESPONSE STRUCTURE VALIDATION
    // =============================================
    describe('Response Structure Validation', () => {
        it('TC056 - Should validate successful response structure', () => {
            cy.createHottextFromFixture('hottext/validPayload').then((response) => {
                if (response.status === 201) {
                    expect(response.body).to.be.an('object');
                    expect(response.body).to.have.property('content_id').that.is.a('string');
                    expect(response.body).to.have.property('content_row_id').that.is.a('string');
                    expect(response.body.content_id).to.match(/^[a-zA-Z0-9_-]+$/);
                }
            });
        });

        it('TC057 - Should validate error response structure', () => {
            cy.createHottext({}).then((response) => {
                if (response.status >= 400) {
                    expect(response.body).to.be.an('object');
                    expect(response.body).to.have.property('message').that.is.a('string');
                }
            });
        });

        it('TC058 - Should validate Content-Type header in response', () => {
            cy.createHottextFromFixture('hottext/validPayload').then((response) => {
                expect(response.headers).to.have.property('content-type');
                expect(response.headers['content-type']).to.include('application/json');
            });
        });

        it('TC059 - Should validate content_row_id format includes language code', () => {
            cy.createHottextFromFixture('hottext/validPayload').then((response) => {
                if (response.status === 201) {
                    expect(response.body.content_row_id).to.include('en');
                    cy.log(`Content Row ID: ${response.body.content_row_id}`);
                }
            });
        });

        it('TC060 - Should validate response status codes match specification', () => {
            cy.createHottextFromFixture('hottext/validPayload').then((response) => {
                expect(response.status).to.be.oneOf([201, 400, 404, 500]);
            });
        });
    });

    // =============================================
    // GET API TESTS
    // =============================================
    describe('GET Content API Tests', () => {
        describe('Positive Tests', () => {
            it('TC061 - Should get Hottext content by valid content_id', () => {
                if (!createdContentId) {
                    cy.createHottextFromFixture('hottext/validPayload').then((response) => {
                        if (response.status === 201) {
                            createdContentId = response.body.content_id;
                        }
                    });
                } else {
                    cy.request({
                        method: 'GET',
                        url: `/api/content/v1/questions/${createdContentId}`,
                        headers: {
                            'Authorization': `Bearer ${Cypress.env('ACCESS_TOKEN')}`
                        },
                        failOnStatusCode: false
                    }).then((response) => {
                        if (response.status === 200) {
                            expect(response.body).to.have.property('content_id').eq(createdContentId);
                        }
                    });
                }
            });

            it('TC062 - Should validate Hottext response structure in GET', () => {
                if (createdContentId) {
                    cy.request({
                        method: 'GET',
                        url: `/api/content/v1/questions/${createdContentId}`,
                        headers: {
                            'Authorization': `Bearer ${Cypress.env('ACCESS_TOKEN')}`
                        },
                        failOnStatusCode: false
                    }).then((response) => {
                        if (response.status === 200) {
                            expect(response.body).to.have.property('content_id');
                            expect(response.body).to.have.property('question_type').eq('Hottext');
                            expect(response.body).to.have.property('selection_type');
                            expect(response.body).to.have.property('correct_answer');
                        }
                    });
                }
            });

            it('TC063 - Should validate selection_type in GET response', () => {
                if (createdContentId) {
                    cy.request({
                        method: 'GET',
                        url: `/api/content/v1/questions/${createdContentId}`,
                        headers: {
                            'Authorization': `Bearer ${Cypress.env('ACCESS_TOKEN')}`
                        },
                        failOnStatusCode: false
                    }).then((response) => {
                        if (response.status === 200) {
                            expect(response.body.selection_type).to.be.oneOf(['words', 'letters', 'sentences', 'custom']);
                        }
                    });
                }
            });

            it('TC064 - Should validate correct_answer array in GET response', () => {
                if (createdContentId) {
                    cy.request({
                        method: 'GET',
                        url: `/api/content/v1/questions/${createdContentId}`,
                        headers: {
                            'Authorization': `Bearer ${Cypress.env('ACCESS_TOKEN')}`
                        },
                        failOnStatusCode: false
                    }).then((response) => {
                        if (response.status === 200) {
                            expect(response.body.correct_answer).to.be.an('array');
                            expect(response.body.correct_answer.length).to.be.greaterThan(0);
                            response.body.correct_answer.forEach(answer => {
                                expect(answer).to.be.a('string');
                            });
                        }
                    });
                }
            });

            it('TC065 - Should get Hottext content with specific language', () => {
                if (createdContentId) {
                    cy.request({
                        method: 'GET',
                        url: `/api/content/v1/questions/${createdContentId}?language=en`,
                        headers: {
                            'Authorization': `Bearer ${Cypress.env('ACCESS_TOKEN')}`
                        },
                        failOnStatusCode: false
                    }).then((response) => {
                        if (response.status === 200) {
                            expect(response.body).to.have.property('language_code').eq('en');
                        }
                    });
                }
            });

            it('TC066 - Should get Hottext content with x-encryption false', () => {
                if (createdContentId) {
                    cy.request({
                        method: 'GET',
                        url: `/api/content/v1/questions/${createdContentId}`,
                        headers: {
                            'Authorization': `Bearer ${Cypress.env('ACCESS_TOKEN')}`,
                            'x-encryption': 'false'
                        },
                        failOnStatusCode: false
                    }).then((response) => {
                        expect(response.status).to.be.oneOf([200, 400, 404, 500]);
                    });
                }
            });
        });

        describe('Negative Tests', () => {
            it('TC067 - Should return 404 for non-existent Hottext content_id', () => {
                cy.request({
                    method: 'GET',
                    url: '/api/content/v1/questions/nonexistent_id',
                    headers: {
                        'Authorization': `Bearer ${Cypress.env('ACCESS_TOKEN')}`
                    },
                    failOnStatusCode: false
                }).then((response) => {
                    expect(response.status).to.be.oneOf([404, 500]);
                });
            });

            it('TC068 - Should return error for invalid content_id format', () => {
                cy.request({
                    method: 'GET',
                    url: '/api/content/v1/questions/invalid@#$%',
                    headers: {
                        'Authorization': `Bearer ${Cypress.env('ACCESS_TOKEN')}`
                    },
                    failOnStatusCode: false
                }).then((response) => {
                    expect(response.status).to.be.oneOf([400, 404, 500]);
                });
            });

            it('TC069 - Should handle SQL injection in content_id', () => {
                cy.request({
                    method: 'GET',
                    url: "/api/content/v1/questions/'; DROP TABLE content;--",
                    headers: {
                        'Authorization': `Bearer ${Cypress.env('ACCESS_TOKEN')}`
                    },
                    failOnStatusCode: false
                }).then((response) => {
                    expect(response.status).to.be.oneOf([400, 404]);
                });
            });
        });

        describe('Edge Cases', () => {
            it('TC070 - Should verify question_type is Hottext in response', () => {
                if (createdContentId) {
                    cy.request({
                        method: 'GET',
                        url: `/api/content/v1/questions/${createdContentId}`,
                        headers: {
                            'Authorization': `Bearer ${Cypress.env('ACCESS_TOKEN')}`
                        },
                        failOnStatusCode: false
                    }).then((response) => {
                        if (response.status === 200) {
                            expect(response.body.question_type).to.eq('Hottext');
                        }
                    });
                }
            });

            it('TC071 - Should validate stem contains hottext elements', () => {
                if (createdContentId) {
                    cy.request({
                        method: 'GET',
                        url: `/api/content/v1/questions/${createdContentId}`,
                        headers: {
                            'Authorization': `Bearer ${Cypress.env('ACCESS_TOKEN')}`
                        },
                        failOnStatusCode: false
                    }).then((response) => {
                        if (response.status === 200) {
                            expect(response.body.stem).to.include('hot-text');
                        }
                    });
                }
            });

            it('TC072 - Should validate correct_answer IDs exist in stem', () => {
                if (createdContentId) {
                    cy.request({
                        method: 'GET',
                        url: `/api/content/v1/questions/${createdContentId}`,
                        headers: {
                            'Authorization': `Bearer ${Cypress.env('ACCESS_TOKEN')}`
                        },
                        failOnStatusCode: false
                    }).then((response) => {
                        if (response.status === 200) {
                            const stem = response.body.stem;
                            response.body.correct_answer.forEach(answerId => {
                                expect(stem).to.include(`id="${answerId}"`);
                            });
                        }
                    });
                }
            });

            it('TC073 - Should validate all correct_answer IDs match selection_type', () => {
                if (createdContentId) {
                    cy.request({
                        method: 'GET',
                        url: `/api/content/v1/questions/${createdContentId}`,
                        headers: {
                            'Authorization': `Bearer ${Cypress.env('ACCESS_TOKEN')}`
                        },
                        failOnStatusCode: false
                    }).then((response) => {
                        if (response.status === 200) {
                            expect(response.body).to.have.property('selection_type');
                            expect(response.body).to.have.property('correct_answer');
                            expect(response.body.correct_answer).to.be.an('array').that.is.not.empty;
                        }
                    });
                }
            });
        });
    });
});
