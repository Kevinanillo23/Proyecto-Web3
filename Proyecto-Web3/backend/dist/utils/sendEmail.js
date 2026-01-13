"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = require("../mailer/config");
/**
 * Utility to send emails using Nodemailer with SMTP configuration.
 * @param {EmailOptions} options - The email configuration (recipient, subject, message).
 * @returns {Promise<void>}
 */
const sendEmail = async (options) => {
    const isProd = process.env.NODE_ENV === 'production';
    const config = (0, config_1.getTransporterConfig)();
    // Explicitly check for credentials. Empty strings or undefined are considered "no creds".
    const user = (config.auth.user || '').trim();
    const pass = (config.auth.pass || '').trim();
    const hasCreds = user !== '' && pass !== '';
    // Simulation logic for non-production environments without credentials
    if (!isProd && !hasCreds) {
        console.log('\n--- EMAIL SIMULATION (DEV MODE) ---');
        console.log(`To: ${options.email}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Message: ${options.message}`);
        console.log('------------------------------------\n');
        return;
    }
    // 1) Create a transporter ONLY if we have credentials OR are in production
    const transporter = nodemailer_1.default.createTransport(config);
    // 2) Define the email options
    const mailOptions = {
        from: config_1.mailConfig.from,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h2>Account Message</h2>
                <p>${options.message.replace(/\n/g, '<br>')}</p>
                <hr>
                <p style="font-size: 0.8em; color: #777;">This is an automated message from Nexus AI Terminal.</p>
            </div>
        `,
    };
    // 3) Actually send the email using the transporter
    await transporter.sendMail(mailOptions);
};
exports.default = sendEmail;
