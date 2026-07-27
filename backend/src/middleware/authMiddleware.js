const authService = require('../services/authService');
const authConfig = require('../config/authConfig');

/**
 * Middleware to protect routes by verifying JWT.
 * Attaches the decoded user to req.user and the corresponding fabric config to req.fabricConfig.
 */
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Authentication token is missing or invalid.'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decodedUser = authService.verifyToken(token);
        req.user = decodedUser;
        
        // Find matching account credentials by organization and username
        const accountEntry = Object.values(authConfig.credentials).find(
            acc => acc.organization === decodedUser.organization && acc.username === decodedUser.username
        );

        if (!accountEntry) {
            throw new Error('Invalid user identity in token.');
        }
        
        req.fabricConfig = accountEntry.fabric;
        
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token.'
        });
    }
}

module.exports = authMiddleware;
