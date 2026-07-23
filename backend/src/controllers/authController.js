const authService = require('../services/authService');

/**
 * Controller to handle user login.
 * Expects { organization, username, password } in request body.
 */
async function login(req, res) {
    try {
        const { organization, username, password } = req.body;
        
        const fabricConfig = authService.validateCredentials(organization, username, password);
        
        const userPayload = {
            organization: organization.toLowerCase(),
            username,
            mspId: fabricConfig.mspId,
            userIdentity: fabricConfig.userIdentity
        };
        
        const token = authService.generateToken(userPayload);
        
        res.status(200).json({
            success: true,
            data: {
                token,
                user: userPayload
            }
        });
    } catch (error) {
        // Return 401 Unauthorized for authentication failures
        res.status(401).json({
            success: false,
            message: error.message
        });
    }
}

/**
 * Controller to get current authenticated user.
 */
async function me(req, res) {
    // req.user is set by authMiddleware
    res.status(200).json({
        success: true,
        data: {
            user: req.user
        }
    });
}

module.exports = {
    login,
    me
};
