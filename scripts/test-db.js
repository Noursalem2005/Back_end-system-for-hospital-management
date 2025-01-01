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

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('Config:', {
      ...config,
      password: '***hidden***'
    });
    
    await sql.connect(config);
    console.log('Database connected successfully!');
    
    const result = await sql.query`SELECT GETDATE() as currentTime`;
    console.log('Current database time:', result.recordset[0].currentTime);
  } catch (err) {
    console.error('Database connection failed:', err);
  } finally {
    await sql.close();
  }
}

testConnection(); 