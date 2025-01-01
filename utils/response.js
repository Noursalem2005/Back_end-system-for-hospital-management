// utils/responseHandler.js

const jwt = require('jsonwebtoken');
const { validationResult, body } = require('express-validator');

/**
 * Sends a success response.
 * @param {Object} res - The response object from Express.
 * @param {Object} data - The data to send in the response body.
 * @param {number} [statusCode=200] - The HTTP status code. Default is 200.
 */
const sendSuccess = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message: "Request was successful",
    data,
  });
};

/**
 * Sends an error response.
 * @param {Object} res - The response object from Express.
 * @param {string} errorMessage - The error message to send in the response body.
 * @param {number} [statusCode=400] - The HTTP status code. Default is 400.
 */
const sendError = (res, errorMessage, statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message: errorMessage,
  });
};

/**
 * Error handling middleware.
 * @param {Object} err - The error object.
 * @param {Object} req - The request object from Express.
 * @param {Object} res - The response object from Express.
 * @param {Function} next - The next middleware function.
 */
const handleError = (err, req, res, next) => {
  console.error(err); // Log the error for debugging

  // Send a generic error message
  res.status(500).json({
    success: false,
    message: "An unexpected error occurred, please try again later.",
  });
};

/**
 * Validates request body data using express-validator.
 * @returns {Array} - The validation chain.
 */
const validatePatientData = () => {
  return [
    body('first_name').isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
    body('last_name').isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
    body('dob').isDate().withMessage('Date of birth must be a valid date'),
    body('contact_number').isMobilePhone().withMessage('Contact number must be a valid phone number'),
    body('email').isEmail().withMessage('Email must be valid'),
  ];
};

/**
 * Checks if the validation result is valid or not.
 * @param {Object} req - The request object from Express.
 * @param {Object} res - The response object from Express.
 * @param {Function} next - The next middleware function.
 */
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

/**
 * Verifies JWT token and extracts user information.
 * @param {Object} req - The request object from Express.
 * @param {Object} res - The response object from Express.
 * @param {Function} next - The next middleware function.
 */
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return sendError(res, 'Access denied. No token provided', 403);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user data to request object
    next();
  } catch (error) {
    return sendError(res, 'Invalid or expired token', 403);
  }
};

/**
 * Middleware for checking if the user has the required role for authorization.
 * @param {Array} allowedRoles - An array of roles that are allowed to access the route.
 */
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user.role; // Assume the role is decoded from JWT

    if (!allowedRoles.includes(userRole)) {
      return sendError(res, 'Access denied. You do not have the required role', 403);
    }
    next();
  };
};

module.exports = {
  sendSuccess,
  sendError,
  handleError,
  validatePatientData,
  checkValidation,
  verifyToken,
  checkRole,
};
