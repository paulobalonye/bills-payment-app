const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/responseUtils');

/**
 * Middleware to check if the user is an admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const isAdmin = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if no token
    if (!token) {
      return errorResponse(res, 401, 'No token, authorization denied');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId);
    
    // Check if user exists
    if (!user) {
      return errorResponse(res, 401, 'User not found');
    }
    
    // Check if user is admin
    if (user.role !== 'admin') {
      return errorResponse(res, 403, 'Access denied. Admin privileges required');
    }
    
    // Set user in request
    req.user = user;
    next();
  } catch (err) {
    console.error('Admin middleware error:', err.message);
    return errorResponse(res, 401, 'Token is not valid');
  }
};

module.exports = isAdmin;
