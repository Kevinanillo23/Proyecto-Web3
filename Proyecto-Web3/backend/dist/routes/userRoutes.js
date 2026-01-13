"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const rateLimiter_1 = require("../middlewares/rateLimiter");
const router = express_1.default.Router();
// Apply rate limiter to auth routes
router.post('/', rateLimiter_1.limiter, userController_1.registerUser);
router.post('/auth', rateLimiter_1.limiter, userController_1.authUser);
router.post('/logout', userController_1.logoutUser);
router.post('/forgotpassword', rateLimiter_1.limiter, userController_1.forgotPassword);
router.get('/resetview/:resetToken', userController_1.getResetPasswordView);
router.put('/resetpassword/:resetToken', rateLimiter_1.limiter, userController_1.resetPassword);
// Profile routes
router.route('/profile')
    .get(authMiddleware_1.protect, userController_1.getUserProfile)
    .put(authMiddleware_1.protect, userController_1.updateUserProfile);
router.get('/nonce', authMiddleware_1.protect, userController_1.getUserNonce);
router.get('/test-reset-token/:email', userController_1.getTestResetToken);
exports.default = router;
