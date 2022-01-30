/// <reference types="cypress" />

function getDashboardConfig(apps) {
  return {
    newFeaturesInLatestVersion: [],
    apps: apps.map(app => ({
      serverURL: "http://localhost:1337/parse",
      appId: "hello",
      masterKey: app.masterKey || "world",
      appName: app.appName,
      iconName: app.iconName || "",
      primaryBackgroundColor: app.primaryBackgroundColor || "",
      secondaryBackgroundColor: app.secondaryBackgroundColor || "",
    })),
  };
}

describe('Apps index', () => {
  it('Redirects to app lists from root path if there are 2 or more apps', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/parse-dashboard-config.json',
      },
      getDashboardConfig([
        {
          appName: 'test1',
        },
        {
          appName: 'test2',
        },
      ]),
    );

    cy.visit('/');

    cy.url().should('match', /\/apps$/);
  });

  it('Redirects to first app if there is only one', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/parse-dashboard-config.json',
      },
      getDashboardConfig([
        {
          appName: 'test1',
        },
      ]),
    );

    cy.visit('/');

    cy.url().should('match', /\/apps\/test1\/browser\/_Role$/);
  });

  it('Can filter apps with search input', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/parse-dashboard-config.json',
      },
      getDashboardConfig([
        {
          appName: 'test1',
        },
        {
          appName: 'test2',
        },
      ]),
    );

    cy.visit('/apps')

    cy.get('[data-test-id="apps-index-app"]').should('have.length', 2)

    cy.get('[data-testid="apps-index-search-input"]').type('test1')

    cy.get('[data-test-id="apps-index-app"]').should('have.length', 1)

    cy.get('[data-testid="apps-index-search-input"]').type('qwerty')

    cy.get('[data-test-id="apps-index-app"]').should('have.length', 0)
  })
})
