/**
 * src/server.js
 * 
 * Purpose: This is the main entry point for the backend application.
 * It imports the configured Express app from app.js and starts the HTTP listener
 * on the port specified in the environment variables.
 */

require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});
