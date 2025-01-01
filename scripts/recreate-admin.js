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

async function recreateAdmin() {
  try {
    console.log('Connecting to database...');
    const pool = await sql.connect(config);
    
    // Delete the old admin user
    console.log('Deleting old admin user...');
    await pool.request()
      .query('DELETE FROM users WHERE email = \'admin@hospital.com\'');
    
    // Create new admin with properly hashed password
    console.log('Creating new admin user...');
    const password = 'Admin@123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // First insert the user
    await pool.request()
      .input('email', sql.NVarChar, 'admin@hospital.com')
      .input('password', sql.NVarChar, hashedPassword)
      .input('role', sql.NVarChar, 'admin')
      .query(`
        INSERT INTO users (email, password, role)
        VALUES (@email, @password, @role)
      `);
    
    // Then retrieve the inserted user
    const result = await pool.request()
      .input('email', sql.NVarChar, 'admin@hospital.com')
      .query(`
        SELECT id, email, role 
        FROM users 
        WHERE email = @email
      `);
    
    console.log('\n✅ Admin user recreated successfully!');
    console.log('Email:', result.recordset[0].email);
    console.log('Password: Admin@123');
    console.log('Role:', result.recordset[0].role);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sql.close();
  }
}

recreateAdmin(); 