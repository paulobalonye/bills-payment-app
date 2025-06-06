const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object (typically from database)
 * @returns {String} JWT token
 */
const generateToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    phone: user.phone
  };

  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // Token expires in 7 days
  );

  return token;
};

/**
 * Verify a JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded token payload or null if invalid
 */
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken
};
