import {
  entityTableSelector,
  entityDetailsButtonSelector,
  entityDetailsBackButtonSelector,
  entityCreateButtonSelector,
  entityCreateSaveButtonSelector,
  entityCreateCancelButtonSelector,
  entityEditButtonSelector,
  entityDeleteButtonSelector,
  entityConfirmDeleteButtonSelector,
} from '../../support/entity';

describe('Vehicle e2e test', () => {
  const vehiclePageUrl = '/vehicle';
  const vehiclePageUrlPattern = new RegExp('/vehicle(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const vehicleSample = { vehicleId: 'Functionality Handcrafted Principal', vehicleRegNo: 'SMTP Qatari back' };

  let vehicle;
  let customer;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/services/customermanagement/api/customers',
      body: { name: 'Awesome', address: 'GB salmon' },
    }).then(({ body }) => {
      customer = body;
    });
  });

  beforeEach(() => {
    cy.intercept('GET', '/services/customermanagement/api/vehicles+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/services/customermanagement/api/vehicles').as('postEntityRequest');
    cy.intercept('DELETE', '/services/customermanagement/api/vehicles/*').as('deleteEntityRequest');
  });

  beforeEach(() => {
    // Simulate relationships api for better performance and reproducibility.
    cy.intercept('GET', '/services/customermanagement/api/customers', {
      statusCode: 200,
      body: [customer],
    });
  });

  afterEach(() => {
    if (vehicle) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/services/customermanagement/api/vehicles/${vehicle.id}`,
      }).then(() => {
        vehicle = undefined;
      });
    }
  });

  afterEach(() => {
    if (customer) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/services/customermanagement/api/customers/${customer.id}`,
      }).then(() => {
        customer = undefined;
      });
    }
  });

  it('Vehicles menu should load Vehicles page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('vehicle');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('Vehicle').should('exist');
    cy.url().should('match', vehiclePageUrlPattern);
  });

  describe('Vehicle page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(vehiclePageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create Vehicle page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/vehicle/new$'));
        cy.getEntityCreateUpdateHeading('Vehicle');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response.statusCode).to.equal(200);
        });
        cy.url().should('match', vehiclePageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/services/customermanagement/api/vehicles',
          body: {
            ...vehicleSample,
            owner: customer,
          },
        }).then(({ body }) => {
          vehicle = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/services/customermanagement/api/vehicles+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [vehicle],
            }
          ).as('entitiesRequestInternal');
        });

        cy.visit(vehiclePageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details Vehicle page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('vehicle');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response.statusCode).to.equal(200);
        });
        cy.url().should('match', vehiclePageUrlPattern);
      });

      it('edit button click should load edit Vehicle page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Vehicle');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response.statusCode).to.equal(200);
        });
        cy.url().should('match', vehiclePageUrlPattern);
      });

      it('edit button click should load edit Vehicle page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Vehicle');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response.statusCode).to.equal(200);
        });
        cy.url().should('match', vehiclePageUrlPattern);
      });

      it('last delete button click should delete instance of Vehicle', () => {
        cy.intercept('GET', '/services/customermanagement/api/vehicles/*').as('dialogDeleteRequest');
        cy.get(entityDeleteButtonSelector).last().click();
        cy.wait('@dialogDeleteRequest');
        cy.getEntityDeleteDialogHeading('vehicle').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response.statusCode).to.equal(200);
        });
        cy.url().should('match', vehiclePageUrlPattern);

        vehicle = undefined;
      });
    });
  });

  describe('new Vehicle page', () => {
    beforeEach(() => {
      cy.visit(`${vehiclePageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('Vehicle');
    });

    it('should create an instance of Vehicle', () => {
      cy.get(`[data-cy="vehicleId"]`).type('Computer AI back-end').should('have.value', 'Computer AI back-end');

      cy.get(`[data-cy="vehicleRegNo"]`).type('sensor').should('have.value', 'sensor');

      cy.get(`[data-cy="owner"]`).select(1);

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response.statusCode).to.equal(201);
        vehicle = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response.statusCode).to.equal(200);
      });
      cy.url().should('match', vehiclePageUrlPattern);
    });
  });
});
