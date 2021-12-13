describe('Main Page', () => {
  it('should open new folder dialog and close', () => {
    cy.intercept('GET', 'http://IP:PORT/images', {
      fixture: 'imageFiles.json',
    }).as('images');
    cy.visit('http://localhost:4200');
    cy.get('swiper').should('exist');
    cy.get('.swiper-container').should('exist');
    cy.get('.swiper-slide').should('exist');
    cy.get('.bottom-buttons').find('ion-button').should('have.text', 'New folder');
    cy.get('.bottom-buttons').find('ion-button').contains('New folder').click();
    cy.get('.new-folder-modal').should('exist');
    cy.get('ion-label').should('have.text', 'Specify name for new folder');
    cy.wait(3000);
    cy.get('ion-button').contains('Cancel').click();
  });

  it('should navigate through folders', () => {
    cy.intercept('GET', 'http://IP:PORT/images', {
      fixture: 'imageFiles.json',
    }).as('images');
    cy.visit('http://localhost:4200');
    cy.get('swiper').should('exist');
    cy.get('.swiper-container').should('exist');
    cy.get('.swiper-slide').should('exist');
    cy.get('.folder').should('exist');
    cy.wait(2000);
    cy.get('div').find('p').contains('2021').click();
    cy.get('.bottom-buttons')
      .find('ion-button')
      .contains('Upload')
      .should('have.text', 'Upload image(s)');
    cy.wait(1000);
    cy.get('div').find('p').contains('Sommer').click();
    cy.get('ion-grid')
      .trigger('pointerdown', { which: 1 })
      .trigger('pointermove', 'right')
      .trigger('pointerup', { force: true });
    cy.wait(2000);
    cy.get('div').find('p').contains('Sommer').should('exist');
    cy.get('ion-grid')
      .trigger('pointerdown', { which: 1 })
      .trigger('pointermove', 'right')
      .trigger('pointerup', { force: true });
    cy.wait(1000);
    cy.get('div').find('p').contains('2021').should('exist');
    cy.get('ion-grid')
      .trigger('pointerdown', { which: 1 })
      .trigger('pointermove', 'left')
      .trigger('pointerup', { force: true });
    cy.wait(1000);
    cy.get('div').find('p').contains('Sommer').should('exist');
    cy.get('ion-grid')
      .trigger('pointerdown', { which: 1 })
      .trigger('pointermove', 'left')
      .trigger('pointerup', { force: true });
    cy.wait(3000);
    cy.get('img').first().click();
    cy.wait(2000);
    cy.get('#mainSwiperContainer')
      .trigger('pointerdown', { which: 1 })
      .trigger('pointermove', 'left')
      .trigger('pointerup', { force: true });
    cy.wait(5000);
    cy.get('#mainSwiperContainer')
      .trigger('pointerdown', { which: 1 })
      .trigger('pointermove', 'left')
      .trigger('pointerup', { force: true });
    cy.wait(2000);
    cy.get('#mainSwiperContainer')
      .trigger('pointerdown', { which: 1 })
      .trigger('pointermove', 'right')
      .trigger('pointerup', { force: true });
    cy.wait(5000);
  });
});
