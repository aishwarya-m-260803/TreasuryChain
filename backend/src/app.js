/**
 * src/app.js
 * 
 * Purpose: This file is the core configuration for the Express application.
 * It is responsible for setting up global middleware (like JSON parsing, CORS, logging)
 * and registering the root-level route prefixes. By separating app setup from the actual 
 * server startup (server.js), it makes testing the application much easier.
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');

const app = express();

// Middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse incoming JSON payloads
app.use(morgan('dev')); // Log HTTP requests to the console

// Routes
app.use('/', routes);

// Generic error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
