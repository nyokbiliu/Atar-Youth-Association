const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const { body } = require('express-validator');

// Validation middleware
const validateRegistration = [
  body('email').isEmail().withMessage('Valid email required'),
  body('phone').isMobilePhone().withMessage('Valid phone number required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('full_name').notEmpty().withMessage('Full name is required'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Valid gender required'),
  body('date_of_birth').isISO8601().withMessage('Valid date of birth required'),
  body('county').notEmpty().withMessage('County is required'),
  body('payam').notEmpty().withMessage('Payam is required')
];

const validateLogin = [
  body('email').notEmpty().withMessage('Email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

router.post('/register', validateRegistration, registerUser);
router.post('/login', validateLogin, loginUser);

module.exports = router;