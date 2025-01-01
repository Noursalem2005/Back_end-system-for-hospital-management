const { poolPromise, sql } = require('../config/db');
const { sendTestEmail } = require('../services/emailService');
const { sendTestSms } = require('../services/smsService');
const { testPaymentIntegration: testPaymentGateway } = require('../services/paymentService');

// Hospital Settings Controllers
const getHospitalSettings = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query('SELECT * FROM hospital_settings WHERE id = 1');
    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error fetching hospital settings:', error);
    res.status(500).json({ message: 'Error fetching hospital settings' });
  }
};

const updateHospitalSettings = async (req, res) => {
  const {
    name,
    address,
    phone,
    email,
    workingHours,
    emergencyContact,
    isEmergencyUnit,
    taxId,
    licenseNumber
  } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('name', sql.NVarChar, name)
      .input('address', sql.NVarChar, address)
      .input('phone', sql.NVarChar, phone)
      .input('email', sql.NVarChar, email)
      .input('workingHours', sql.NVarChar, workingHours)
      .input('emergencyContact', sql.NVarChar, emergencyContact)
      .input('isEmergencyUnit', sql.Bit, isEmergencyUnit)
      .input('taxId', sql.NVarChar, taxId)
      .input('licenseNumber', sql.NVarChar, licenseNumber)
      .query(`
        UPDATE hospital_settings 
        SET name = @name, 
            address = @address, 
            phone = @phone, 
            email = @email,
            working_hours = @workingHours, 
            emergency_contact = @emergencyContact,
            is_emergency_unit = @isEmergencyUnit, 
            tax_id = @taxId, 
            license_number = @licenseNumber
        WHERE id = 1;
        SELECT * FROM hospital_settings WHERE id = 1;
      `);
    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error updating hospital settings:', error);
    res.status(500).json({ message: 'Error updating hospital settings' });
  }
};

// Department Controllers
const getDepartments = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query('SELECT * FROM departments ORDER BY name');
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ message: 'Error fetching departments' });
  }
};

const createDepartment = async (req, res) => {
  const { name, head, capacity, description } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('name', sql.NVarChar, name)
      .input('head', sql.NVarChar, head)
      .input('capacity', sql.Int, capacity)
      .input('description', sql.NVarChar, description)
      .query(`
        INSERT INTO departments (name, head, capacity, description)
        OUTPUT inserted.*
        VALUES (@name, @head, @capacity, @description)
      `);
    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ message: 'Error creating department' });
  }
};

const updateDepartment = async (req, res) => {
  const { id } = req.params;
  const { name, head, capacity, description } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('name', sql.NVarChar, name)
      .input('head', sql.NVarChar, head)
      .input('capacity', sql.Int, capacity)
      .input('description', sql.NVarChar, description)
      .query(`
        UPDATE departments 
        SET name = @name,
            head = @head,
            capacity = @capacity,
            description = @description
        OUTPUT inserted.*
        WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({ message: 'Error updating department' });
  }
};

const deleteDepartment = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        DELETE FROM departments 
        OUTPUT deleted.*
        WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({ message: 'Error deleting department' });
  }
};

// User Preferences Controllers
const getUserPreferences = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.Int, req.user.id)
      .query('SELECT * FROM user_preferences WHERE user_id = @userId');
    res.json(result.recordset[0] || {});
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    res.status(500).json({ message: 'Error fetching user preferences' });
  }
};

const updateUserPreferences = async (req, res) => {
  const { notifications, display, accessibility } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.Int, req.user.id)
      .input('notifications', sql.NVarChar(sql.MAX), JSON.stringify(notifications))
      .input('display', sql.NVarChar(sql.MAX), JSON.stringify(display))
      .input('accessibility', sql.NVarChar(sql.MAX), JSON.stringify(accessibility))
      .query(`
        MERGE user_preferences AS target
        USING (SELECT @userId as user_id) AS source
        ON target.user_id = source.user_id
        WHEN MATCHED THEN
          UPDATE SET notifications = @notifications,
                     display = @display,
                     accessibility = @accessibility
        WHEN NOT MATCHED THEN
          INSERT (user_id, notifications, display, accessibility)
          VALUES (@userId, @notifications, @display, @accessibility);
        SELECT * FROM user_preferences WHERE user_id = @userId;
      `);
    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({ message: 'Error updating user preferences' });
  }
};

// Theme Settings Controllers
const getThemeSettings = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.Int, req.user.id)
      .query('SELECT * FROM theme_settings WHERE user_id = @userId');
    res.json(result.recordset[0] || {});
  } catch (error) {
    console.error('Error fetching theme settings:', error);
    res.status(500).json({ message: 'Error fetching theme settings' });
  }
};

const updateThemeSettings = async (req, res) => {
  const { mode, primaryColor, secondaryColor, fontSize, borderRadius, layout } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.Int, req.user.id)
      .input('mode', sql.NVarChar, mode)
      .input('primaryColor', sql.NVarChar, primaryColor)
      .input('secondaryColor', sql.NVarChar, secondaryColor)
      .input('fontSize', sql.Int, fontSize)
      .input('borderRadius', sql.Int, borderRadius)
      .input('layout', sql.NVarChar(sql.MAX), JSON.stringify(layout))
      .query(`
        MERGE theme_settings AS target
        USING (SELECT @userId as user_id) AS source
        ON target.user_id = source.user_id
        WHEN MATCHED THEN
          UPDATE SET mode = @mode,
                     primary_color = @primaryColor,
                     secondary_color = @secondaryColor,
                     font_size = @fontSize,
                     border_radius = @borderRadius,
                     layout = @layout
        WHEN NOT MATCHED THEN
          INSERT (user_id, mode, primary_color, secondary_color, font_size, border_radius, layout)
          VALUES (@userId, @mode, @primaryColor, @secondaryColor, @fontSize, @borderRadius, @layout);
        SELECT * FROM theme_settings WHERE user_id = @userId;
      `);
    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error updating theme settings:', error);
    res.status(500).json({ message: 'Error updating theme settings' });
  }
};

// Integration Settings Controllers
const getIntegrationSettings = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query('SELECT * FROM integration_settings WHERE id = 1');
    // Remove sensitive data before sending
    const settings = result.recordset[0];
    if (settings) {
      delete settings.email_password;
      delete settings.sms_auth_token;
      delete settings.payment_secret_key;
      delete settings.payment_webhook_secret;
    }
    res.json(settings || {});
  } catch (error) {
    console.error('Error fetching integration settings:', error);
    res.status(500).json({ message: 'Error fetching integration settings' });
  }
};

const updateIntegrationSettings = async (req, res) => {
  const { email, sms, payment } = req.body;

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('email', sql.NVarChar(sql.MAX), JSON.stringify(email))
      .input('sms', sql.NVarChar(sql.MAX), JSON.stringify(sms))
      .input('payment', sql.NVarChar(sql.MAX), JSON.stringify(payment))
      .query(`
        MERGE integration_settings AS target
        USING (SELECT 1 as id) AS source
        ON target.id = source.id
        WHEN MATCHED THEN
          UPDATE SET email_settings = @email,
                     sms_settings = @sms,
                     payment_settings = @payment
        WHEN NOT MATCHED THEN
          INSERT (id, email_settings, sms_settings, payment_settings)
          VALUES (1, @email, @sms, @payment);
      `);
    res.json({ message: 'Integration settings updated successfully' });
  } catch (error) {
    console.error('Error updating integration settings:', error);
    res.status(500).json({ message: 'Error updating integration settings' });
  }
};

// Test Integration Controllers
const testEmailIntegration = async (req, res) => {
  try {
    await sendTestEmail();
    res.json({ message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Error testing email integration:', error);
    res.status(500).json({ message: 'Error testing email integration' });
  }
};

const testSmsIntegration = async (req, res) => {
  try {
    await sendTestSms();
    res.json({ message: 'Test SMS sent successfully' });
  } catch (error) {
    console.error('Error testing SMS integration:', error);
    res.status(500).json({ message: 'Error testing SMS integration' });
  }
};

const testPaymentIntegration = async (req, res) => {
  try {
    await testPaymentGateway();
    res.json({ message: 'Payment integration test successful' });
  } catch (error) {
    console.error('Error testing payment integration:', error);
    res.status(500).json({ message: 'Error testing payment integration' });
  }
};

module.exports = {
  getHospitalSettings,
  updateHospitalSettings,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getUserPreferences,
  updateUserPreferences,
  getThemeSettings,
  updateThemeSettings,
  getIntegrationSettings,
  updateIntegrationSettings,
  testEmailIntegration,
  testSmsIntegration,
  testPaymentIntegration
}; 