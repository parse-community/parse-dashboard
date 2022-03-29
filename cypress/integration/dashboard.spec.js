/// <reference types="cypress" />

import { getDashboardConfig } from '../utils/getDashboardConfig';

describe('Dashboard', () => {
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

    cy
      .url()
      .should('match', /\/apps\/test1\/browser\/_Role$/);
  });

  it('Shows loader during loading', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/parse-dashboard-config.json',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          delay: 250,
          body: getDashboardConfig([
            {
              appName: 'test',
            }
          ]),
        })
      }
    )
  
    cy.visit('/')

    cy.get('[data-cy="dashboard-loader"]', {
      timeout: 250
    });
  })

  it('c', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/parse-dashboard-config.json',
      },
      getDashboardConfig([
        {
          appName: 'test1',
          serverURL: 'http://localhost'
        },
      ]),
    );

    cy.visit('/');
  })
})
