describe('Real Authentication Cycle', () => {
    const randomId = Math.floor(Math.random() * 100000);
    const testUser = {
        username: `user_${randomId}`,
        email: `test_${randomId}@antigravity.ai`,
        password: 'password123'
    };

    before(() => {
        cy.clearLocalStorage();
        cy.visit('/');
    });

    it('should complete a full registration and login cycle', () => {
        // 1. Navigate to Register
        cy.contains('Create Account').click();
        cy.url().should('include', '/register');

        // 2. Register new user
        // Using placeholders from Register.tsx
        cy.get('input[placeholder="Neo"]').type(testUser.username);
        cy.get('input[placeholder="name@company.com"]').type(testUser.email);
        cy.get('input[placeholder="••••••••"]').type(testUser.password);
        cy.get('button[type="submit"]').click();

        // 3. Verify automatic redirect to Dashboard
        cy.url().should('include', '/dashboard');
        cy.contains('Net Portfolio Value').should('be.visible');
        cy.contains(testUser.username).should('be.visible');

        // 4. Logout
        cy.get('header').find('button').last().click();
        cy.url().should('not.include', '/dashboard');
        cy.contains('Nexus AI').should('be.visible');

        // 5. Login back with new credentials
        cy.get('input[placeholder="name@company.com"]').type(testUser.email);
        cy.get('input[placeholder="••••••••"]').type(testUser.password);
        cy.get('button[type="submit"]').click();

        // 6. Final verification
        cy.url().should('include', '/dashboard');
        cy.contains('Net Portfolio Value', { timeout: 10000 }).should('be.visible');
    });

    it('should show error for incorrect password on existing user', () => {
        cy.clearLocalStorage();
        cy.visit('/');

        cy.get('input[placeholder="name@company.com"]').type(testUser.email);
        cy.get('input[placeholder="••••••••"]').type('wrongpassword');
        cy.get('button[type="submit"]').click();
        cy.contains('Invalid email or password').should('be.visible');
    });
});
