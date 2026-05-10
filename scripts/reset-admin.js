const sql = require('mssql');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

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

async function resetAdmin() {
  try {
    console.log('Connecting to database...');
    const pool = await sql.connect(config);
    
    // Delete existing admin
    console.log('Removing existing admin...');
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '[REDACTED]';
    await pool.request()
      .input('email', sql.NVarChar, ADMIN_EMAIL)
      .query('DELETE FROM users WHERE email = @email');
    
    // Create new admin
    console.log('Creating new admin user...');
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '[REDACTED]';
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    
    const result = await pool.request()
      .input('email', sql.NVarChar, ADMIN_EMAIL)
      .input('password', sql.NVarChar, hashedPassword)
      .input('role', sql.NVarChar, 'admin')
      .query(`
        INSERT INTO users (email, password, role)
        OUTPUT inserted.*
        VALUES (@email, @password, @role)
      `);
    
    console.log('\nAdmin user created successfully!');
    console.log('Email:', result.recordset[0].email);
    console.log('Password: <set via ADMIN_PASSWORD environment variable>');
    console.log('Role:', result.recordset[0].role);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sql.close();
  }
}

resetAdmin(); 