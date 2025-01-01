const { validationResult } = require('express-validator');
const { sanitizeInput } = require('../utils/security');

const validateRequest = (validations) => {
  return async (req, res, next) => {
    // Sanitize inputs
    req.body = Object.keys(req.body).reduce((acc, key) => {
      acc[key] = sanitizeInput(req.body[key]);
      return acc;
    }, {});

    // Run validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    next();
  };
};

module.exports = validateRequest; 