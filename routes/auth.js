const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const sql = require('mssql');
const { USER_ROLES } = require('../utils/constants');

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

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM users WHERE email = @email');
    
    const user = result.recordset[0];
    
    if (!user || !(await authService.comparePasswords(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const tokens = authService.generateAuthTokens(user);
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      ...tokens
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    sql.close();
  }
});

// Register route
router.post('/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    const result = await authService.register({
      email,
      password,
      role: role || USER_ROLES.PATIENT
    });
    
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 