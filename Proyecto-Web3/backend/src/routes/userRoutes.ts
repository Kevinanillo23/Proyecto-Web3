import express from 'express';
import {
    authUser,
    registerUser,
    logoutUser,
    forgotPassword,
    resetPassword,
    getUserProfile,
    updateUserProfile,
    getUserNonce,
    getTestResetToken,
    getResetPasswordView
} from '../controllers/userController';
import { protect } from '../middlewares/authMiddleware';
import { limiter } from '../middlewares/rateLimiter';

const router = express.Router();

// Apply rate limiter to auth routes
router.post('/', limiter, registerUser);
router.post('/auth', limiter, authUser);
router.post('/logout', logoutUser);

router.post('/forgotpassword', limiter, forgotPassword);
router.get('/resetview/:resetToken', getResetPasswordView);
router.put('/resetpassword/:resetToken', limiter, resetPassword);

// Profile routes
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

router.get('/nonce', protect, getUserNonce);
router.get('/test-reset-token/:email', getTestResetToken);

export default router;
