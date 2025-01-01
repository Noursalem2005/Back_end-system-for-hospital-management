class ErrorService {
  constructor() {
    this.errors = {
      UNAUTHORIZED: { code: 401, message: 'Unauthorized access' },
      FORBIDDEN: { code: 403, message: 'Forbidden access' },
      NOT_FOUND: { code: 404, message: 'Resource not found' },
      VALIDATION: { code: 422, message: 'Validation error' },
      SERVER_ERROR: { code: 500, message: 'Internal server error' },
      RATE_LIMIT: { code: 429, message: 'Too many requests' },
      BAD_REQUEST: { code: 400, message: 'Bad request' },
      CONFLICT: { code: 409, message: 'Resource conflict' }
    };
  }

  throwError(type, customMessage = '') {
    const error = this.errors[type];
    const err = new Error(customMessage || error.message);
    err.statusCode = error.code;
    throw err;
  }
}

module.exports = new ErrorService(); 