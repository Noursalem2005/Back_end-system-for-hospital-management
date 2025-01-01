const { body } = require('express-validator');

const passwordValidation = [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/^(?=.*[A-Z])/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/^(?=.*[0-9])/)
    .withMessage('Password must contain at least one number')
    .matches(/^(?=.*[!@#$%^&*])/)
    .withMessage('Password must contain at least one special character')
];

module.exports = passwordValidation; 