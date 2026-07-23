/**
 * src/routes/index.js
 * 
 * Purpose: This file aggregates the routing logic for the application.
 * Currently, it exports two simple endpoints to test that the Express server
 * is functioning correctly before we integrate the Fabric Gateway.
 */

const express = require('express');
const router = express.Router();

// Test Route: Root
router.get('/', (req, res) => {
    res.json({ status: "Backend Running" });
});

// Test Route: Health check
router.get('/health', (req, res) => {
    res.json({ status: "Healthy" });
});

// Treasury endpoints
const treasuryRoutes = require('./treasuryRoutes');
router.use('/api/treasury', treasuryRoutes);

module.exports = router;
