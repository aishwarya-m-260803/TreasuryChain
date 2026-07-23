const jwt = require('jsonwebtoken');
const authConfig = require('../config/authConfig');

/**
 * Validates the given organization, username, and password against the static credential map.
 * Returns the fabric configuration for the organization if valid, or throws an error.
 */
function validateCredentials(organization, username, password) {
    if (!organization || !username || !password) {
        throw new Error('Organization, username, and password are required.');
    }

    const orgKey = organization.toLowerCase().trim();
    const creds = authConfig.credentials[orgKey];

    if (!creds) {
        throw new Error('Invalid organization.');
    }

    // In a real application, passwords would be hashed. For this demo, we compare plain text.
    if (creds.username !== username || creds.password !== password) {
        throw new Error('Invalid username or password.');
    }

    return creds.fabric;
}

/**
 * Generates a JWT token for the authenticated user.
 */
function generateToken(userPayload) {
    return jwt.sign(
        userPayload,
        authConfig.jwtSecret,
        { expiresIn: authConfig.jwtExpiry }
    );
}

/**
 * Verifies a JWT token and returns the decoded payload.
 */
function verifyToken(token) {
    try {
        return jwt.verify(token, authConfig.jwtSecret);
    } catch (error) {
        throw new Error('Invalid or expired token.');
    }
}

module.exports = {
    validateCredentials,
    generateToken,
    verifyToken
};
