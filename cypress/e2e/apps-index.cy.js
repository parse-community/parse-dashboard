import { getDashboardConfig } from '../utils/getDashboardConfig';

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

    cy.visit('/')
    cy.wait(3000)

    cy
      .url()
      .should('match', /\/apps$/);
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
    cy.wait(3000)

    cy
      .get('[data-cy="apps-index-app"]')
      .should('have.length', 2)

    cy
      .get('[data-cy="apps-index-search-input"]')
      .type('test1')

    cy
      .get('[data-cy="apps-index-app"]')
      .should('have.length', 1)

    cy
      .get('[data-cy="apps-index-search-input"]')
      .type('qwerty')

    cy
      .get('[data-cy="apps-index-app"]')
      .should('have.length', 0)
  })

  it('Can show error states in the list', () => {
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
          masterKey: 'cos',
        },
        {
          appName: 'test3',
          appId: 'cos',
        },
        {
          appName: 'test4',
          masterKey: 'cos',
          appId: 'cos',
        },
        {
          appName: 'test5',
          serverURL: 'http://unavailablehost:1234'
        },
        {
          appName: 'test6',
          serverURL: 'http://localhost:1337/parse2'
        },
      ]),
    );

    cy.visit('/apps')
    cy.wait(3000)

    cy
      .get('[data-cy="apps-index-app"]')
      .should('have.length', 6)

    cy
      .get('[data-cy="apps-index-app"]')
      .eq(0)
      .find('[data-cy="apps-index-app-details"]')
      .contains('Server URL: http://localhost:1337/parse')

    cy
      .get('[data-cy="apps-index-app"]')
      .eq(1)
      .find('[data-cy="apps-index-app-details"]')
      .contains('Server not reachable: unauthorized')

    cy
      .get('[data-cy="apps-index-app"]')
      .eq(2)
      .find('[data-cy="apps-index-app-details"]')
      .contains('Server not reachable: unauthorized')

    cy
      .get('[data-cy="apps-index-app"]')
      .eq(3)
      .find('[data-cy="apps-index-app-details"]')
      .contains('Server not reachable: unauthorized')

    cy
      .get('[data-cy="apps-index-app"]')
      .eq(4)
      .find('[data-cy="apps-index-app-details"]')
      .contains('Server not reachable: unable to connect to server')

    cy
      .get('[data-cy="apps-index-app"]')
      .eq(5)
      .find('[data-cy="apps-index-app-details"]')
      .contains('Server not reachable: unable to connect to server')
  });
})
