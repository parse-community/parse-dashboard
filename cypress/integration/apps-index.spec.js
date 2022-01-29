/// <reference types="cypress" />

describe('Apps index', () => {
  it('Redirects to app lists from root path', () => {
    cy.visit('http://localhost:4050')

    cy.url().should('match', /\/apps$/)
  })

  it('Can filter apps with search input', () => {
    cy.visit('http://localhost:4050/apps')

    cy.get('[data-test-id="apps-index-app"]').should('have.length', 2)

    cy.get('[data-testid="apps-index-search-input"]').type('test1')

    cy.get('[data-test-id="apps-index-app"]').should('have.length', 1)

    cy.get('[data-testid="apps-index-search-input"]').type('qwerty')

    cy.get('[data-test-id="apps-index-app"]').should('have.length', 0)
  })
})
