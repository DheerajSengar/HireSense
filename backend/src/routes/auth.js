const express = require('express');
const {
  register,
  login,
  googleLogin,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  registerRules,
  loginRules,
  googleLoginRules,
  forgotPasswordRules,
  resetPasswordRules
} = require('../middleware/validators');

const router = express.Router();

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.post('/google', googleLoginRules, validate, googleLogin);
router.post('/forgot-password', forgotPasswordRules, validate, forgotPassword);
router.put('/reset-password/:token', resetPasswordRules, validate, resetPassword);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
