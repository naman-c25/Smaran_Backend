const { extractToken, verifyToken } = require('../utils/authUtils');

/**
 * Middleware to verify JWT token
 * Adds user info to req.user
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = extractToken(authHeader);

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    return res.status(403).json({ error: err.message });
  }
}

/**
 * Middleware to check if user has specific role
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role_name)) {
      return res.status(403).json({ 
        error: `Access denied. Required role: ${allowedRoles.join(' or ')}` 
      });
    }

    next();
  };
}

/**
 * Middleware to check if user owns the resource
 * Checks if req.user.id matches req.params.user_id or req.body.user_id
 */
function requireOwnership(req, res, next) {
  const resourceUserId = req.params.user_id || req.body.user_id || req.query.user_id;

  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Allow admin to access any user's resources
  if (req.user.role_name === 'admin') {
    return next();
  }

  // Regular users can only access their own resources
  if (parseInt(resourceUserId) !== req.user.id) {
    return res.status(403).json({ error: 'Access denied. You can only access your own resources.' });
  }

  next();
}

module.exports = {
  authenticateToken,
  requireRole,
  requireOwnership
};
