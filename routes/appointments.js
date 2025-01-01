const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { poolPromise } = require('../config/db');

// Create a new appointment
router.post('/', async (req, res) => {
    try {
        const { patient_id, doctor_id, department_id, room_id, date, time, status, reason } = req.body;

        console.log('Request Body:', req.body);  // Log the request body

        const pool = await poolPromise;
        const result = await pool.request()
            .input('patient_id', sql.BigInt, patient_id)
            .input('doctor_id', sql.BigInt, doctor_id)
            .input('department_id', sql.BigInt, department_id)
            .input('room_id', sql.BigInt, room_id)
            .input('date', sql.Date, date)
            .input('time', sql.VarChar, time)  // Use sql.VarChar for time
            .input('status', sql.Text, status)
            .input('reason', sql.Text, reason)
            .query(
                'INSERT INTO hospital.appointments (patient_id, doctor_id, department_id, room_id, date, time, status, reason) OUTPUT inserted.* VALUES (@patient_id, @doctor_id, @department_id, @room_id, @date, @time, @status, @reason)'
            );
        res.json(result.recordset[0]);  // Return the inserted record
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Get all appointments
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query('SELECT * FROM hospital.appointments');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Get a specific appointment by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.BigInt, id)
            .query('SELECT * FROM hospital.appointments WHERE id = @id');
        if (result.recordset.length === 0) {
            return res.status(404).send('Appointment not found');
        }
        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Update an appointment
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { patient_id, doctor_id, department_id, room_id, date, time, status, reason } = req.body;

        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.BigInt, id)
            .input('patient_id', sql.BigInt, patient_id)
            .input('doctor_id', sql.BigInt, doctor_id)
            .input('department_id', sql.BigInt, department_id)
            .input('room_id', sql.BigInt, room_id)
            .input('date', sql.Date, date)
            .input('time', sql.VarChar, time)  // Use sql.VarChar for time
            .input('status', sql.Text, status)
            .input('reason', sql.Text, reason)
            .query(
                'UPDATE hospital.appointments SET patient_id = @patient_id, doctor_id = @doctor_id, department_id = @department_id, room_id = @room_id, date = @date, time = @time, status = @status, reason = @reason WHERE id = @id'
            );

        if (result.rowsAffected[0] === 0) {
            return res.status(404).send('Appointment not found');
        }

        // Fetch the updated record
        const updatedResult = await pool.request()
            .input('id', sql.BigInt, id)
            .query('SELECT * FROM hospital.appointments WHERE id = @id');
        res.json(updatedResult.recordset[0]);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Delete an appointment
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.BigInt, id)
            .query('DELETE FROM hospital.appointments WHERE id = @id');
        if (result.rowsAffected[0] === 0) {
            return res.status(404).send('Appointment not found');
        }
        res.json({ message: 'Appointment deleted successfully' });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;