const stripe = require('stripe');
const { poolPromise, sql } = require('../config/db');

const testPaymentIntegration = async () => {
  try {
    // Get payment settings from database
    const pool = await poolPromise;
    const result = await pool.request()
      .query('SELECT payment_settings FROM integration_settings WHERE id = 1');
    
    const paymentSettings = result.recordset[0]?.payment_settings;
    if (!paymentSettings) {
      throw new Error('Payment settings not configured');
    }

    // Initialize Stripe with test key
    const stripeClient = stripe(paymentSettings.testMode ? paymentSettings.testSecretKey : paymentSettings.secretKey);

    // Test API connection by listing payment methods (a simple API call)
    await stripeClient.paymentMethods.list({
      limit: 1,
      type: 'card'
    });
  } catch (error) {
    console.error('Error testing payment integration:', error);
    throw error;
  }
};

module.exports = {
  testPaymentIntegration
}; 