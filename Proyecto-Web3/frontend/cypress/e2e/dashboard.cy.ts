describe('Real Dashboard Interactions', () => {
    beforeEach(() => {
        // Clear storage to ensure we start at login
        cy.clearLocalStorage();
        // Login with seeded user for UI testing
        cy.visit('/');
        cy.get('input[type="email"]').type('kevin@example.com');
        cy.get('input[type="password"]').type('123456');
        cy.get('button[type="submit"]').click();
        cy.url().should('include', '/dashboard');
    });

    it('should verify dashboard layout and critical metrics', () => {
        cy.contains('Net Portfolio Value', { timeout: 10000 }).should('be.visible');
        cy.contains('kevin').should('be.visible');
        cy.contains('Ethereum Balance').should('be.visible');
        cy.contains('Connect Wallet').should('be.visible');
    });

    it('should interact with the AI Terminal', () => {
        const query = 'Analyze current market trends';
        cy.get('input[placeholder="Analyze portfolio strategy..."]')
            .wait(500)
            .type(query)
            .should('have.value', query);

        cy.get('button').find('.lucide-arrow-up-right').parent().should('not.be.disabled');
    });

    it('should display the transaction feed section', () => {
        cy.contains('Recent Transactions').should('be.visible');
        cy.contains('Live Feed').should('be.visible');
    });
});
