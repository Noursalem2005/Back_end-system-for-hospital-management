const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { poolPromise } = require('../config/db');
const { body } = require('express-validator');
const validateRequest = require('../middlewares/validateRequest');
const ResponseHandler = require('../utils/responseHandler');
const errorService = require('../services/errorService');
const createRateLimiter = require('../middlewares/rateLimiter');

// Validation rules
const staffValidation = [
  body('first_name').notEmpty().trim().escape(),
  body('last_name').notEmpty().trim().escape(),
  body('email').isEmail().normalizeEmail(),
  body('contact_number').matches(/^\+?[\d\s-]+$/)
];

// Rate limiting - 100 requests per 15 minutes
const limiter = createRateLimiter();

// Create a new staff member
router.post('/', 
  limiter,
  validateRequest(staffValidation),
  async (req, res) => {
    try {
        const { first_name, last_name, role, department_id, contact_number, email, hire_date } = req.body;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('first_name', sql.NVarChar, first_name)
            .input('last_name', sql.NVarChar, last_name)
            .input('role', sql.NVarChar, role)
            .input('department_id', sql.Int, department_id)
            .input('contact_number', sql.NVarChar, contact_number)
            .input('email', sql.NVarChar, email)
            .input('hire_date', sql.Date, hire_date)
            .query('INSERT INTO staff_management.staff (first_name, last_name, role, department_id, contact_number, email, hire_date) OUTPUT inserted.* VALUES (@first_name, @last_name, @role, @department_id, @contact_number, @email, @hire_date)');
        if (result.recordset.length === 0) {
            return res.status(400).send('Failed to create staff member');
        }
        return ResponseHandler.success(res, result.recordset[0], 'Staff created successfully', 201);
    } catch (error) {
        return ResponseHandler.error(res, error);
    }
});

// Get all staff members
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM staff_management.staff');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Get a staff member by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM staff_management.staff WHERE id = @id');
        if (result.recordset.length === 0) {
            return res.status(404).send('Staff member not found');
        }
        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Update a staff member
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { first_name, last_name, role, department_id, contact_number, email, hire_date } = req.body;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('first_name', sql.NVarChar, first_name)
            .input('last_name', sql.NVarChar, last_name)
            .input('role', sql.NVarChar, role)
            .input('department_id', sql.Int, department_id)
            .input('contact_number', sql.NVarChar, contact_number)
            .input('email', sql.NVarChar, email)
            .input('hire_date', sql.Date, hire_date)
            .query('UPDATE staff_management.staff SET first_name = @first_name, last_name = @last_name, role = @role, department_id = @department_id, contact_number = @contact_number, email = @email, hire_date = @hire_date WHERE id = @id');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).send('Staff member not found');
        }

        // Fetch the updated record
        const updatedResult = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM staff_management.staff WHERE id = @id');
        if (updatedResult.recordset.length === 0) {
            return res.status(404).send('Staff member not found after update');
        }
        res.json(updatedResult.recordset[0]);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Delete a staff member
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM staff_management.staff WHERE id = @id');
        if (result.rowsAffected[0] === 0) {
            return res.status(404).send('Staff member not found');
        }
        res.status(204).send();  // Send 204 status for successful deletion
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;
