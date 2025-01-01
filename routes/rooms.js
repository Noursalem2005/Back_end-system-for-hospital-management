const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../config/db');  // Import poolPromise and sql

// Get all rooms
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;  // Get the connection pool
        const result = await pool.request().query('SELECT * FROM inventory.rooms');
        res.json(result.recordset);  // Return the results
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Get a room by ID
router.get('/:id', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)  // Use .input to bind the parameter
            .query('SELECT * FROM inventory.rooms WHERE id = @id');
        res.json(result.recordset[0]);  // Return the first result
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Create a new room
router.post('/', async (req, res) => {
    try {
        const { room_number, type, department_id, capacity} = req.body;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('room_number', sql.NVarChar, room_number)
            .input('type', sql.NVarChar, type)
            .input('department_id', sql.BigInt, department_id)
            .input('capacity', sql.Int, capacity)
            .query(
                'INSERT INTO inventory.rooms (room_number, type, department_id, capacity) OUTPUT inserted.* VALUES (@room_number, @type, @department_id, @capacity)'
            );
        res.json(result.recordset[0]);  // Return the inserted record
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Update a room
router.put('/:id', async (req, res) => {
    try {
        const { room_number , type , department_id , capacity} = req.body;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('room_number', sql.NVarChar, room_number)
            .input('type', sql.NVarChar, type)
            .input('department_id', sql.BigInt, department_id)
            .input('capacity', sql.Int, capacity)
            .query(
                'UPDATE inventory.rooms SET room_number = @room_number, type = @type, department_id = @department_id, capacity=@capacity OUTPUT inserted.* WHERE id = @id'
            );
        res.json(result.recordset[0]);  // Return the updated record
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Delete a room
router.delete('/:id', async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM inventory.rooms WHERE id = @id');
        res.status(204).send();  // Send 204 status for successful deletion
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;
