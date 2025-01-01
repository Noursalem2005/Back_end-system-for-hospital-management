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

async function checkUser() {
  try {
    console.log('Connecting to database...');
    const pool = await sql.connect(config);
    
    console.log('Checking for admin user...');
    const result = await pool.request()
      .query('SELECT id, email, role, password FROM users');
    
    console.log('\nUsers found:', result.recordset.length);
    console.log('\nUser details:');
    result.recordset.forEach(user => {
      console.log({
        id: user.id,
        email: user.email,
        role: user.role,
        passwordLength: user.password.length
      });
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sql.close();
  }
}

checkUser(); 