describe('Real Password Reset Cycle', () => {
    const randomId = Math.floor(Math.random() * 100000);
    const testUser = {
        username: `user_${randomId}`,
        email: `test_reset_${randomId}@antigravity.ai`,
        password: 'initialPassword123',
        newPassword: 'newSecurePassword456'
    };

    before(() => {
        // 1. Create a user to reset
        cy.visit('/');
        cy.contains('Create Account').click();
        cy.get('input[placeholder="Neo"]').type(testUser.username);
        cy.get('input[placeholder="name@company.com"]').type(testUser.email);
        cy.get('input[placeholder="••••••••"]').type(testUser.password);
        cy.get('button[type="submit"]').click();
        cy.url().should('include', '/dashboard');

        // Logout for the reset flow
        cy.get('header').find('button').last().click();
        cy.url().should('not.include', '/dashboard');
    });

    it('should complete a full password reset flow', () => {
        cy.visit('/');

        // 2. Click Forgot Password to open modal
        cy.contains('Forgot Password?').click();
        cy.contains('Reset Password').should('be.visible');

        // 3. Trigger the reset request via Modal
        cy.get('input[placeholder="name@company.com"]').last().type(testUser.email);
        cy.contains('button', 'Send Recovery Link').click();
        cy.contains('Reset link sent!', { timeout: 10000 }).should('be.visible');

        // 4. Retrieve the token from our test helper
        cy.request(`/api/users/test-reset-token/${testUser.email}`).then((response) => {
            expect(response.status).to.eq(200);
            const token = response.body.resetToken;

            // 5. Navigate to the reset page (EJS view)
            // Note: Since it's a separate view served by backend on :5000, 
            // but the app is on :3000, we need to visit the backend URL or handle cross-origin.
            // Actually, the app's forgot password flow should ideally keep the user on :3000.
            // Currently, the backend serves the view at :5000/api/users/resetview/:token

            cy.visit(`http://localhost:5000/api/users/resetview/${token}`);

            // 6. Fill in new password in the EJS view
            cy.get('input[name="password"]').type(testUser.newPassword);
            cy.get('button[type="submit"]').click();
            cy.contains('Password updated successfully').should('be.visible');

            // 7. Go back to main app and login with new password
            cy.visit('http://localhost:3000/');
            cy.get('input[placeholder="name@company.com"]').type(testUser.email);
            cy.get('input[placeholder="••••••••"]').type(testUser.newPassword);
            cy.get('button[type="submit"]').click();

            // 8. Final verification
            cy.url().should('include', '/dashboard');
            cy.contains(testUser.username).should('be.visible');
        });
    });
});
