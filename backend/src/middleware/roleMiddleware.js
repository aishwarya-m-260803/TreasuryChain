/**
 * Middleware factory to authorize requests based on required user role.
 * Example: requireRole('admin') or requireRole(['admin', 'user'])
 */
function requireRole(allowedRoles) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. User role information is missing.'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Requires one of the following roles: ${roles.join(', ')}.`
            });
        }

        next();
    };
}

module.exports = { requireRole };
