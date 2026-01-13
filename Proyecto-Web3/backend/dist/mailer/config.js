"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailConfig = exports.getTransporterConfig = void 0;
/**
 * Utility to get Nodemailer transporter options.
 */
const getTransporterConfig = () => ({
    host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.EMAIL_PORT || '2525'),
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
    },
});
exports.getTransporterConfig = getTransporterConfig;
/**
 * Default sender information.
 */
exports.mailConfig = {
    from: `${process.env.EMAIL_FROM_NAME || 'Antigravity Support'} <${process.env.EMAIL_FROM_ADDRESS || 'no-reply@antigravity.ai'}>`,
};
