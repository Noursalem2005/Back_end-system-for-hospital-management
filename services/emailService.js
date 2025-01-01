const nodemailer = require('nodemailer');
const { poolPromise, sql } = require('../config/db');

const sendTestEmail = async () => {
  try {
    // Get email settings from database
    const pool = await poolPromise;
    const result = await pool.request()
      .query('SELECT email_settings FROM integration_settings WHERE id = 1');
    
    const emailSettings = result.recordset[0]?.email_settings;
    if (!emailSettings) {
      throw new Error('Email settings not configured');
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: emailSettings.host,
      port: emailSettings.port,
      secure: emailSettings.port === 465,
      auth: {
        user: emailSettings.username,
        pass: emailSettings.password
      }
    });

    // Send test email
    await transporter.sendMail({
      from: emailSettings.fromEmail,
      to: emailSettings.fromEmail, // Send to self for testing
      subject: 'Test Email',
      text: 'This is a test email from your hospital management system.',
      html: '<p>This is a test email from your hospital management system.</p>'
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    throw error;
  }
};

module.exports = {
  sendTestEmail
}; 