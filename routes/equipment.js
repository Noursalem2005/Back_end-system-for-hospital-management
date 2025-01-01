const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { poolPromise } = require('../config/db');

// Create a new equipment
router.post('/', async (req, res) => {
    try {
        const { name, department_id, status, purchase_date } = req.body;

        const pool = await poolPromise;
        const result = await pool.request()
            .input('name', sql.NVarChar, name)
            .input('department_id', sql.BigInt, department_id)
            .input('status', sql.NVarChar, status)
            .input('purchase_date', sql.DateTime, purchase_date)
            .query('INSERT INTO inventory.equipment (name, department_id, status, purchase_date) OUTPUT inserted.* VALUES (@name, @department_id, @status, @purchase_date)');
        res.json(result.recordset[0]);  // Return the inserted record
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Get all equipment
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM inventory.equipment');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Get a specific equipment by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.BigInt, id)
            .query('SELECT * FROM inventory.equipment WHERE id = @id');
        if (result.recordset.length === 0) {
            return res.status(404).send('Equipment not found');
        }
        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Update an equipment
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, department_id, status, purchase_date } = req.body;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.BigInt, id)
            .input('name', sql.NVarChar, name)
            .input('department_id', sql.BigInt, department_id)
            .input('status', sql.NVarChar, status)
            .input('purchase_date', sql.DateTime, purchase_date)
            .query('UPDATE inventory.equipment SET name = @name, department_id = @department_id, status = @status, purchase_date = @purchase_date WHERE id = @id');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).send('Equipment not found');
        }

        // Fetch the updated record
        const updatedResult = await pool.request()
            .input('id', sql.BigInt, id)
            .query('SELECT * FROM inventory.equipment WHERE id = @id');
        res.json(updatedResult.recordset[0]);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Delete an equipment
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.BigInt, id)
            .query('DELETE FROM inventory.equipment WHERE id = @id');
        if (result.rowsAffected[0] === 0) {
            return res.status(404).send('Equipment not found');
        }
        res.json({ message: 'Equipment deleted successfully' });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;