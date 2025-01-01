const bcrypt = require('bcryptjs');
const sql = require('mssql');
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

async function createAdminUser() {
  try {
    // Connect to database
    const pool = await sql.connect(config);
    
    const password = 'Admin@123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if admin exists
    const checkResult = await pool.request()
      .input('email', sql.NVarChar, 'admin@hospital.com')
      .query('SELECT * FROM users WHERE email = @email');
    
    if (checkResult.recordset.length > 0) {
      console.log('Admin user already exists');
      return;
    }
    
    // Create admin user
    await pool.request()
      .input('email', sql.NVarChar, 'admin@hospital.com')
      .input('password', sql.NVarChar, hashedPassword)
      .input('role', sql.NVarChar, 'admin')
      .query(`
        INSERT INTO users (email, password, role)
        VALUES (@email, @password, @role)
      `);
    
    console.log('Admin user created successfully');
    console.log('Email: admin@hospital.com');
    console.log('Password: Admin@123');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    sql.close();
  }
}

createAdminUser(); 