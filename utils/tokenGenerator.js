const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class TokenGenerator {
  /**
   * Generate JWT token
   */
  generateJWTToken(payload) {
    return jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
  }

  /**
   * Generate refresh token
   */
  generateRefreshToken() {
    return crypto.randomBytes(40).toString('hex');
  }

  /**
   * Generate password reset token
   */
  generatePasswordResetToken() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    return {
      resetToken,
      hashedToken,
      expiresIn: Date.now() + 30 * 60 * 1000 // 30 minutes
    };
  }

  /**
   * Verify JWT token
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return null;
    }
  }
}

module.exports = new TokenGenerator(); 