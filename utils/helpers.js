const crypto = require('crypto');

const helpers = {
  /**
   * Generate a random string of specified length
   */
  generateRandomString(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  },

  /**
   * Format date to YYYY-MM-DD
   */
  formatDate(date) {
    return date.toISOString().split('T')[0];
  },

  /**
   * Validate email format
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Calculate age from date of birth
   */
  calculateAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  },

  /**
   * Sanitize object by removing sensitive fields
   */
  sanitizeObject(obj, fieldsToRemove = ['password', 'token']) {
    const sanitized = { ...obj };
    fieldsToRemove.forEach(field => delete sanitized[field]);
    return sanitized;
  },

  /**
   * Format currency
   */
  formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }
};

module.exports = helpers; 