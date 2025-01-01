const twilio = require('twilio');
const { poolPromise, sql } = require('../config/db');

const sendTestSms = async () => {
  try {
    // Get SMS settings from database
    const pool = await poolPromise;
    const result = await pool.request()
      .query('SELECT sms_settings FROM integration_settings WHERE id = 1');
    
    const smsSettings = result.recordset[0]?.sms_settings;
    if (!smsSettings) {
      throw new Error('SMS settings not configured');
    }

    // Create Twilio client
    const client = twilio(smsSettings.accountSid, smsSettings.authToken);

    // Send test SMS
    await client.messages.create({
      body: 'This is a test SMS from your hospital management system.',
      from: smsSettings.fromNumber,
      to: smsSettings.fromNumber // Send to self for testing
    });
  } catch (error) {
    console.error('Error sending test SMS:', error);
    throw error;
  }
};

module.exports = {
  sendTestSms
}; 