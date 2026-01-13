/**
 * Utility to get Nodemailer transporter options.
 */
export const getTransporterConfig = () => ({
    host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.EMAIL_PORT || '2525'),
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
    },
});

/**
 * Default sender information.
 */
export const mailConfig = {
    from: `${process.env.EMAIL_FROM_NAME || 'Antigravity Support'} <${process.env.EMAIL_FROM_ADDRESS || 'no-reply@antigravity.ai'}>`,
};
