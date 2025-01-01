const bcrypt = require('bcryptjs');
const tokenGenerator = require('../utils/tokenGenerator');
const { USER_ROLES } = require('../utils/constants');
const securityConfig = require('../config/security');
const cacheService = require('./cacheService');
const sql = require('mssql');
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT),
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

class AuthService {
  constructor() {
    this.saltRounds = 10;
    this.loginAttempts = new Map();
  }

  async validatePassword(password) {
    if (!securityConfig.passwordPattern.test(password)) {
      throw new Error('Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character');
    }
    return true;
  }

  async checkLoginAttempts(email) {
    const attempts = cacheService.get(`loginAttempts:${email}`) || 0;
    if (attempts >= securityConfig.maxLoginAttempts) {
      throw new Error('Account temporarily locked. Please try again later.');
    }
    return attempts;
  }

  async incrementLoginAttempts(email) {
    try {
      const pool = await sql.connect(config);
      await pool.request()
        .input('email', sql.NVarChar, email)
        .input('maxAttempts', sql.Int, securityConfig.maxLoginAttempts)
        .query(`
          UPDATE users 
          SET 
            login_attempts = login_attempts + 1,
            locked_until = CASE 
              WHEN login_attempts + 1 >= @maxAttempts THEN DATEADD(minute, 15, GETDATE())
              ELSE locked_until 
            END
          WHERE email = @email
        `);
    } catch (error) {
      throw error;
    } finally {
      sql.close();
    }
  }

  async resetLoginAttempts(email) {
    try {
      const pool = await sql.connect(config);
      await pool.request()
        .input('email', sql.NVarChar, email)
        .query(`
          UPDATE users 
          SET 
            login_attempts = 0,
            locked_until = NULL
          WHERE email = @email
        `);
    } catch (error) {
      throw error;
    } finally {
      sql.close();
    }
  }

  async updateLastLogin(email) {
    try {
      const pool = await sql.connect(config);
      await pool.request()
        .input('email', sql.NVarChar, email)
        .query(`
          UPDATE users 
          SET last_login = GETDATE()
          WHERE email = @email
        `);
    } catch (error) {
      throw error;
    } finally {
      sql.close();
    }
  }

  async hashPassword(password) {
    return await bcrypt.hash(password, this.saltRounds);
  }

  async comparePasswords(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  generateAuthTokens(user) {
    // Remove sensitive data
    const userForToken = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    return {
      accessToken: tokenGenerator.generateJWTToken(userForToken),
      refreshToken: tokenGenerator.generateRefreshToken()
    };
  }

  verifyRole(requiredRoles) {
    return (req, res, next) => {
      if (!requiredRoles.includes(req.user.role)) {
        return res.status(403).json({
          message: 'You do not have permission to perform this action'
        });
      }
      next();
    };
  }

  async login(email, password) {
    try {
      // Check if account is locked
      const user = await this.getUserByEmail(email);
      if (user && user.locked_until && user.locked_until > new Date()) {
        throw new Error(`Account is locked. Try again after ${user.locked_until}`);
      }

      // Verify credentials
      if (!user || !(await this.comparePasswords(password, user.password))) {
        // Increment login attempts
        await this.incrementLoginAttempts(email);
        throw new Error('Invalid credentials');
      }

      // Reset login attempts and update last login
      await this.resetLoginAttempts(email);
      await this.updateLastLogin(email);

      return user;
    } catch (error) {
      throw error;
    }
  }

  async getUserByEmail(email) {
    try {
      const pool = await sql.connect(config);
      const result = await pool.request()
        .input('email', sql.NVarChar, email)
        .query('SELECT * FROM users WHERE email = @email');
      return result.recordset[0];
    } catch (error) {
      throw error;
    } finally {
      sql.close();
    }
  }

  async createUser(userData) {
    try {
      // Hash password before storing
      const hashedPassword = await this.hashPassword(userData.password);
      
      const pool = await sql.connect(config);
      const result = await pool.request()
        .input('email', sql.NVarChar, userData.email)
        .input('password', sql.NVarChar, hashedPassword)
        .input('role', sql.NVarChar, userData.role)
        .query(`
          INSERT INTO users (email, password, role)
          OUTPUT inserted.*
          VALUES (@email, @password, @role)
        `);

      const user = result.recordset[0];
      return {
        id: user.id,
        email: user.email,
        role: user.role
      };
    } catch (error) {
      throw error;
    } finally {
      sql.close();
    }
  }

  async register(userData) {
    // Validate password strength
    await this.validatePassword(userData.password);
    
    // Check if user exists
    const existingUser = await this.getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Create user with hashed password
    const user = await this.createUser(userData);
    
    // Generate tokens
    const tokens = this.generateAuthTokens(user);
    
    return {
      user,
      ...tokens
    };
  }
}

module.exports = new AuthService(); 