const express = require('express');
const router = express.Router();
const { forgotPassword, verifyOTP, resetPassword } = require('../../controllers/Auth/ForgotPass');

// Forgot Password Route
router.post('/forgot-password', forgotPassword);

router.post('/verify-otp', verifyOTP);

router.post('/reset-password', resetPassword);

module.exports = router;