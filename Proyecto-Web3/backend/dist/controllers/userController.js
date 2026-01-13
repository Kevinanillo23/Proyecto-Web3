"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTestResetToken = exports.getUserNonce = exports.updateUserProfile = exports.getUserProfile = exports.getResetPasswordView = exports.resetPassword = exports.forgotPassword = exports.logoutUser = exports.registerUser = exports.authUser = void 0;
const crypto_1 = __importDefault(require("crypto"));
const ethers_1 = require("ethers");
const User_1 = __importDefault(require("../models/User"));
const generateToken_1 = __importDefault(require("../utils/generateToken"));
const sendEmail_1 = __importDefault(require("../utils/sendEmail"));
/**
 * @desc    Auth user & get token
 * @route   POST /api/users/auth
 * @access  Public
 * @param   {Request} req - Express request object containing email and password
 * @param   {Response} res - Express response object
 */
const authUser = async (req, res) => {
    const { email, password } = req.body;
    // Sequelize: Find by email
    const user = await User_1.default.findOne({ where: { email } });
    if (user && (await user.matchPassword(password))) {
        const token = (0, generateToken_1.default)(res, user.id.toString());
        res.json({
            _id: user.id, // Keep _id for frontend compatibility if needed, or use id
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            token,
        });
    }
    else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};
exports.authUser = authUser;
/**
 * @desc    Register a new user
 * @route   POST /api/users
 * @access  Public
 * @param   {Request} req - Express request object containing username, email, and password
 * @param   {Response} res - Express response object
 */
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    const userExists = await User_1.default.findOne({ where: { email } });
    if (userExists) {
        res.status(400).json({ message: 'User already exists' });
        return;
    }
    try {
        const user = await User_1.default.create({
            username,
            email,
            password,
        });
        if (user) {
            const token = (0, generateToken_1.default)(res, user.id.toString());
            res.status(201).json({
                _id: user.id,
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                token,
            });
        }
    }
    catch (error) {
        res.status(400).json({ message: 'Invalid user data', error });
    }
};
exports.registerUser = registerUser;
/**
 * @desc    Logout user / clear cookie
 * @route   POST /api/users/logout
 * @access  Public
 * @param   {Request} req - Express request object
 * @param   {Response} res - Express response object
 */
const logoutUser = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out successfully' });
};
exports.logoutUser = logoutUser;
/**
 * @desc    Forgot Password
 * @route   POST /api/users/forgotpassword
 * @access  Public
 * @param   {Request} req - Express request object containing email
 * @param   {Response} res - Express response object
 */
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await User_1.default.findOne({ where: { email } });
    if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
    }
    // Generate token
    const resetToken = crypto_1.default.randomBytes(20).toString('hex');
    // Hash token and save to DB
    user.resetPasswordToken = crypto_1.default
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    // Set expire (10 minutes)
    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);
    // Store plain token for E2E testing (Non-production)
    if (process.env.NODE_ENV !== 'production') {
        user.plainResetToken = resetToken;
    }
    await user.save();
    // Create reset URL
    const resetUrl = `http://localhost:3000/#/resetpassword/${resetToken}`;
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click the link below to reset your password:\n\n${resetUrl}`;
    try {
        await (0, sendEmail_1.default)({
            email: user.email,
            subject: 'Account Password Reset',
            message,
        });
        res.status(200).json({ success: true, data: 'Email sent' });
    }
    catch (error) {
        console.error("Email send error:", error);
        user.resetPasswordToken = null;
        user.resetPasswordExpire = null;
        await user.save();
        res.status(500).json({ message: 'Email could not be sent' });
    }
};
exports.forgotPassword = forgotPassword;
/**
 * @desc    Reset Password
 * @route   PUT /api/users/resetpassword/:resetToken
 * @access  Public
 * @param   {Request} req - Express request object containing password and resetToken param
 * @param   {Response} res - Express response object
 */
const resetPassword = async (req, res) => {
    const resetPasswordToken = crypto_1.default
        .createHash('sha256')
        .update(req.params.resetToken)
        .digest('hex');
    const user = await User_1.default.findOne({
        where: {
            resetPasswordToken,
            // resetPasswordExpire: { [Op.gt]: Date.now() }, // Need Sequelize Op
        },
    });
    // Check expiration manually if Op imports are hassle, or just import Op
    if (!user || !user.resetPasswordExpire || user.resetPasswordExpire < new Date()) {
        res.status(400).json({ message: 'Invalid or expired token' });
        return;
    }
    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save(); // Will trigger beforeUpdate hook to hash password
    const token = (0, generateToken_1.default)(res, user.id.toString());
    res.status(200).json({ success: true, token });
};
exports.resetPassword = resetPassword;
// @desc    Get Reset Password View (EJS)
// @route   GET /resetpassword/:resetToken
// @access  Public
const getResetPasswordView = (req, res) => {
    res.render('reset-password', { token: req.params.resetToken });
};
exports.getResetPasswordView = getResetPasswordView;
/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 * @param   {Request} req - Express request object containing authenticated user id
 * @param   {Response} res - Express response object
 */
const getUserProfile = async (req, res) => {
    const user = await User_1.default.findByPk(req.user?.id);
    if (user) {
        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            walletAddress: user.walletAddress,
        });
    }
    else {
        res.status(404).json({ message: 'User not found' });
    }
};
exports.getUserProfile = getUserProfile;
/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 * @param   {Request} req - Express request object containing update fields (username, email, walletAddress, signature, password)
 * @param   {Response} res - Express response object
 */
const updateUserProfile = async (req, res) => {
    const user = await User_1.default.findByPk(req.user?.id);
    if (user) {
        user.username = req.body.username || user.username;
        user.email = req.body.email || user.email;
        // Web3 Signature Verification
        if (req.body.walletAddress && req.body.signature) {
            try {
                const msg = `Nexus AI Terminal Authentication\nNonce: ${user.nonce}`;
                const recoveredAddress = ethers_1.ethers.verifyMessage(msg, req.body.signature);
                if (recoveredAddress.toLowerCase() !== req.body.walletAddress.toLowerCase()) {
                    res.status(400).json({ message: 'Invalid signature provided' });
                    return;
                }
                user.walletAddress = req.body.walletAddress;
                // Regenerate nonce after use
                user.nonce = Math.floor(Math.random() * 1000000).toString();
            }
            catch (error) {
                res.status(400).json({ message: 'Signature verification failed' });
                return;
            }
        }
        if (req.body.password) {
            user.password = req.body.password;
        }
        const updatedUser = await user.save();
        res.json({
            id: updatedUser.id,
            username: updatedUser.username,
            email: updatedUser.email,
            role: updatedUser.role,
            walletAddress: updatedUser.walletAddress,
        });
    }
    else {
        res.status(404).json({ message: 'User not found' });
    }
};
exports.updateUserProfile = updateUserProfile;
/**
 * @desc    Get user nonce for Web3 signing
 * @route   GET /api/users/nonce
 * @access  Private
 * @param   {Request} req - Express request object containing authenticated user id
 * @param   {Response} res - Express response object
 */
const getUserNonce = async (req, res) => {
    const user = await User_1.default.findByPk(req.user?.id);
    if (user) {
        res.json({ nonce: user.nonce });
    }
    else {
        res.status(404).json({ message: 'User not found' });
    }
};
exports.getUserNonce = getUserNonce;
/**
 * @desc    Get reset token for testing (DEV ONLY)
 * @route   GET /api/users/test-reset-token/:email
 * @access  Public (Testing)
 * @param   {Request} req - Express request object containing email param
 * @param   {Response} res - Express response object
 */
const getTestResetToken = async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ message: 'Forbidden' });
    }
    const { email } = req.params;
    const user = await User_1.default.findOne({ where: { email } });
    if (user && user.plainResetToken) {
        res.json({ resetToken: user.plainResetToken });
    }
    else {
        res.status(404).json({ message: 'Token not found' });
    }
};
exports.getTestResetToken = getTestResetToken;
