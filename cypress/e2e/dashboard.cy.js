
import { getDashboardConfig } from '../utils/getDashboardConfig';

describe('Dashboard', () => {
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
})
