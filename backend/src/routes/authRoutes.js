const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { body } = require('express-validator');

// Validation rules for registration
const validateRegistration = [
  body('email').isEmail().withMessage('Valid email required'),
  body('phone').matches(/^\+211\d{9}$/).withMessage('Valid South Sudan phone required (+211XXXXXXXXX)'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('full_name').trim().notEmpty().withMessage('Full name required'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Valid gender required'),
  body('date_of_birth').isISO8601().toDate().withMessage('Valid date required'),
  body('county').trim().notEmpty().withMessage('County required'),
  body('payam').trim().notEmpty().withMessage('Payam required')
];

// Validation rules for login
const validateLogin = [
  body('email').notEmpty().withMessage('Email required'),
  body('password').notEmpty().withMessage('Password required')
];

// Validation rules for profile update
const validateProfileUpdate = [
  body('full_name').trim().notEmpty().withMessage('Full name required'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Valid gender required'),
  body('date_of_birth').isISO8601().toDate().withMessage('Valid date required'),
  body('county').trim().notEmpty().withMessage('County required'),
  body('payam').trim().notEmpty().withMessage('Payam required')
];

// Validation rules for password update
const validatePasswordUpdate = [
  body('currentPassword').notEmpty().withMessage('Current password required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
];

// ========== PUBLIC ROUTES ==========

// User registration (creates account with 'active' status)
router.post('/register', validateRegistration, authController.registerUser);

// User login
router.post('/login', validateLogin, authController.loginUser);

// ========== PROTECTED ROUTES (require authentication) ==========

// Get current user profile (with full details)
router.get('/me', authenticateToken, authController.getProfile);

// Update user profile (including optional photo upload)
router.put(
  '/profile',
  authenticateToken,
  authController.upload,           // Handle file upload
  authController.handleUploadError, // Handle upload errors
  validateProfileUpdate,           // Validate form data
  authController.updateProfile     // Update profile in database
);

// Update user password
router.put(
  '/password',
  authenticateToken,
  validatePasswordUpdate,
  authController.updatePassword
);

module.exports = router;