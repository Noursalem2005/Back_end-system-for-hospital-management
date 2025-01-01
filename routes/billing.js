const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all billing records
router.get('/', async (req, res) => {
    try {
        const pool = await db.poolPromise;
        const result = await pool.request().query('SELECT * FROM inventory.billing');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Get a billing record by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await db.poolPromise;
        const result = await pool.request().input('id', db.sql.Int, id).query('SELECT * FROM inventory.billing WHERE id = @id');
        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Add a billing record
router.post('/', async (req, res) => {
    const { patient_id, amount, date, status } = req.body;
    try {
        const pool = await db.poolPromise;
        const result = await pool.request()
            .input('patient_id', db.sql.BigInt, patient_id)
            .input('amount', db.sql.Numeric, amount)
            .input('date', db.sql.Date, date)
            .input('status', db.sql.NVarChar, status)
            .query('INSERT INTO inventory.billing (patient_id, amount, date, status) OUTPUT inserted.* VALUES (@patient_id, @amount, @date , @status)');
        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Update a billing record
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { amount, date ,status} = req.body;
    try {
        const pool = await db.poolPromise;
        const result = await pool.request()
            .input('id', db.sql.Int, id)
            .input('amount', db.sql.Numeric, amount)
            .input('date', db.sql.Date, date)
            .input('status', db.sql.NVarChar, status)
            .query('UPDATE inventory.billing SET amount = @amount, status = @status, date = @date OUTPUT inserted.* WHERE id = @id');
        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Delete a billing record
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await db.poolPromise;
        await pool.request().input('id', db.sql.Int, id).query('DELETE FROM inventory.billing WHERE id = @id');
        res.status(204).send();
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;
