const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all departments
router.get('/', async (req, res) => {
    try {
        const pool = await db.poolPromise;
        const result = await pool.request().query('SELECT * FROM hospital.departments');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Get a department by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await db.poolPromise;
        const result = await pool.request().input('id', db.sql.Int, id).query('SELECT * FROM hospital.departments WHERE id = @id');
        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Create a new department
router.post('/', async (req, res) => {
    const { name, location } = req.body;
    try {
        const pool = await db.poolPromise;
        const result = await pool.request()
            .input('name', db.sql.NVarChar, name)
            .input('location', db.sql.NVarChar, location)
            .query('INSERT INTO hospital.departments (name, location) OUTPUT inserted.* VALUES (@name, @location)');
        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Update a department
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, location } = req.body;
    try {
        const pool = await db.poolPromise;
        const result = await pool.request()
            .input('id', db.sql.Int, id)
            .input('name', db.sql.NVarChar, name)
            .input('location', db.sql.NVarChar, location)
            .query('UPDATE hospital.departments SET name = @name, location = @location OUTPUT inserted.* WHERE id = @id');
        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Delete a department
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await db.poolPromise;
        await pool.request().input('id', db.sql.Int, id).query('DELETE FROM hospital.departments WHERE id = @id');
        res.status(204).send();
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;
