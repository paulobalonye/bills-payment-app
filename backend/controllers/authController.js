const { User, Wallet } = require('../models');
const { generateToken } = require('../utils/jwtUtils');
const { successResponse, errorResponse, validationErrorResponse, unauthorizedResponse } = require('../utils/responseUtils');

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const register = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone || !password) {
      return validationErrorResponse(res, {
        message: 'Please provide all required fields: fullName, email, phone, password'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      return errorResponse(res, 409, 'User with this email or phone already exists');
    }

    // Create new user
    const user = await User.create({
      fullName,
      email,
      phone,
      password
    });

    // Create wallet for the user
    await Wallet.create({
      user: user._id,
      balance: 0
    });

    // Generate JWT token
    const token = generateToken(user);

    // Return user data (excluding password) and token
    return successResponse(res, 201, 'User registered successfully', {
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    return errorResponse(res, 500, 'Registration failed', { error: error.message });
  }
};

/**
 * Login a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    // Validate required fields
    if ((!email && !phone) || !password) {
      return validationErrorResponse(res, {
        message: 'Please provide email/phone and password'
      });
    }

    // Find user by email or phone
    const user = await User.findOne({
      $or: [
        { email: email || '' },
        { phone: phone || '' }
      ]
    });

    if (!user) {
      return unauthorizedResponse(res, 'Invalid credentials');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return unauthorizedResponse(res, 'Invalid credentials');
    }

    // Generate JWT token
    const token = generateToken(user);

    // Return user data (excluding password) and token
    return successResponse(res, 200, 'Login successful', {
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 500, 'Login failed', { error: error.message });
  }
};

/**
 * Get current user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProfile = async (req, res) => {
  try {
    // User is already attached to req by auth middleware
    const user = req.user;

    return successResponse(res, 200, 'User profile retrieved successfully', {
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return errorResponse(res, 500, 'Failed to retrieve user profile', { error: error.message });
  }
};

module.exports = {
  register,
  login,
  getProfile
};
