const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all doctors
router.get('/', async (req, res) => {
    try {
        const pool = await db.poolPromise; // Get the connection pool
        const result = await pool.request().query('SELECT * FROM hospital.doctors');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Get a doctor by ID
router.get('/:id', async (req, res) => {
    try {
        const pool = await db.poolPromise; // Get the connection pool
        const result = await pool.request()
            .input('id', db.sql.Int, req.params.id)
            .query('SELECT * FROM hospital.doctors WHERE id = @id');
        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Create a new doctor
router.post('/', async (req, res) => {
    try {
        const { first_name, last_name, specialty, department_id, contact_number, email } = req.body;
        const pool = await db.poolPromise; // Get the connection pool
        const result = await pool.request()
            .input('first_name', db.sql.NVarChar, first_name)
            .input('last_name', db.sql.NVarChar, last_name)
            .input('specialty', db.sql.Text, specialty)
            .input('department_id', db.sql.BigInt, department_id)
            .input('contact_number', db.sql.NVarChar, contact_number)
            .input('email', db.sql.NVarChar, email)
            .query(
                `INSERT INTO hospital.doctors (first_name, last_name, specialty, department_id, contact_number, email)
                 OUTPUT inserted.*
                 VALUES (@first_name, @last_name, @specialty, @department_id, @contact_number, @email)`
            );
        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Update a doctor
router.put('/:id', async (req, res) => {
    try {
        const { first_name, last_name, specialty, department_id, contact_number, email } = req.body;
        const pool = await db.poolPromise; // Get the connection pool
        const result = await pool.request()
            .input('id', db.sql.Int, req.params.id)
            .input('first_name', db.sql.NVarChar, first_name)
            .input('last_name', db.sql.NVarChar, last_name)
            .input('specialty', db.sql.Text, specialty)
            .input('department_id', db.sql.BigInt, department_id)
            .input('contact_number', db.sql.NVarChar, contact_number)
            .input('email', db.sql.NVarChar, email)
            .query(
                `UPDATE hospital.doctors
                 SET first_name = @first_name, last_name = @last_name, specialty = @specialty, department_id = @department_id, 
                     contact_number = @contact_number, email = @email
                 OUTPUT inserted.*
                 WHERE id = @id`
            );
        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Delete a doctor
router.delete('/:id', async (req, res) => {
    try {
        const pool = await db.poolPromise; // Get the connection pool
        await pool.request().input('id', db.sql.Int, req.params.id).query('DELETE FROM hospital.doctors WHERE id = @id');
        res.status(204).send();
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;
