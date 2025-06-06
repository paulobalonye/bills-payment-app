const { verifyToken } = require('./jwtUtils');
const { unauthorizedResponse } = require('./responseUtils');
const { User } = require('../models');

/**
 * Middleware to protect routes that require authentication
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorizedResponse(res, 'Authentication token is missing');
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return unauthorizedResponse(res, 'Authentication token is missing');
    }
    
    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return unauthorizedResponse(res, 'Invalid or expired token');
    }
    
    // Find user by ID from token
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return unauthorizedResponse(res, 'User not found');
    }
    
    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return unauthorizedResponse(res, 'Authentication failed');
  }
};

module.exports = {
  authenticate
};
