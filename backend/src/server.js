/**
 * src/server.js
 * 
 * Purpose: This is the main entry point for the backend application.
 * It imports the configured Express app from app.js and starts the HTTP listener
 * on the port specified in the environment variables.
 */

require('dotenv').config();
const app = require('./app');
const { getContract } = require('./services/gatewayService');

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await getContract();
        
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

startServer();
