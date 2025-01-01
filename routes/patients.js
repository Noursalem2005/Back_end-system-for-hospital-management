const express = require('express');
const router = express.Router();
const db = require('../config/db.js');

// Get all patients
router.get('/', async (req, res) => {
    try {
        const pool = await db.poolPromise; // Get the connection pool
        const result = await pool.request().query('SELECT * FROM hospital.patients');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching patients', error });
    }
});

// Get a single patient by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await db.poolPromise; // Get the connection pool
        const result = await pool.request().input('id', db.sql.Int, id).query('SELECT * FROM hospital.patients WHERE id = @id');
        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching patient', error });
    }
});

// Create a new patient
router.post('/', async (req, res) => {
    const { first_name, last_name, gender, dob, address, contact_number, email, insurance_id } = req.body;
    try {
        const pool = await db.poolPromise; // Get the connection pool
        await pool.request()
            .input('first_name', db.sql.NVarChar, first_name)
            .input('last_name', db.sql.NVarChar, last_name)
            .input('gender', db.sql.Char, gender)
            .input('dob', db.sql.Date, dob)
            .input('address', db.sql.Text, address)
            .input('contact_number', db.sql.NVarChar, contact_number)
            .input('email', db.sql.NVarChar, email)
            .input('insurance_id', db.sql.NVarChar, insurance_id)
            .query(
                `INSERT INTO hospital.patients (first_name, last_name, gender, dob, address, contact_number, email, insurance_id)
                VALUES (@first_name, @last_name, @gender, @dob, @address, @contact_number, @email, @insurance_id)`
            );
        res.status(201).json({ message: 'Patient added successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating patient', error });
    }
});

// Update a patient by ID
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, gender, dob, address, contact_number, email, insurance_id } = req.body;
    try {
        const pool = await db.poolPromise; // Get the connection pool
        await pool.request()
            .input('id', db.sql.Int, id)
            .input('first_name', db.sql.NVarChar, first_name)
            .input('last_name', db.sql.NVarChar, last_name)
            .input('gender', db.sql.NVarChar, gender)
            .input('dob', db.sql.Date, dob)
            .input('address', db.sql.Text, address)
            .input('contact_number', db.sql.NVarChar, contact_number)
            .input('email', db.sql.NVarChar, email)
            .input('insurance_id', db.sql.NVarChar, insurance_id)
            .query(
                `UPDATE hospital.patients
                 SET first_name = @first_name, last_name = @last_name, gender = @gender, dob = @dob, address = @address,
                     contact_number = @contact_number, email = @email, insurance_id = @insurance_id
                 WHERE id = @id`
            );
        res.json({ message: 'Patient updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating patient', error });
    }
});

// Delete a patient by ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await db.poolPromise; // Get the connection pool
        await pool.request().input('id', db.sql.Int, id).query('DELETE FROM hospital.patients WHERE id = @id');
        res.json({ message: 'Patient deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting patient', error });
    }
});

module.exports = router;
