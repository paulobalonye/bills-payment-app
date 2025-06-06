/**
 * Standard success response
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Success message
 * @param {Object|Array} data - Response data
 * @returns {Object} Response object
 */
const successResponse = (res, statusCode = 200, message = 'Success', data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Standard error response
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Error message
 * @param {Object} errors - Detailed errors
 * @returns {Object} Response object
 */
const errorResponse = (res, statusCode = 500, message = 'Error', errors = {}) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

/**
 * Validation error response
 * @param {Object} res - Express response object
 * @param {Object} errors - Validation errors
 * @returns {Object} Response object
 */
const validationErrorResponse = (res, errors) => {
  return errorResponse(res, 400, 'Validation Error', errors);
};

/**
 * Not found error response
 * @param {Object} res - Express response object
 * @param {String} message - Not found message
 * @returns {Object} Response object
 */
const notFoundResponse = (res, message = 'Resource not found') => {
  return errorResponse(res, 404, message);
};

/**
 * Unauthorized error response
 * @param {Object} res - Express response object
 * @param {String} message - Unauthorized message
 * @returns {Object} Response object
 */
const unauthorizedResponse = (res, message = 'Unauthorized access') => {
  return errorResponse(res, 401, message);
};

/**
 * Forbidden error response
 * @param {Object} res - Express response object
 * @param {String} message - Forbidden message
 * @returns {Object} Response object
 */
const forbiddenResponse = (res, message = 'Forbidden') => {
  return errorResponse(res, 403, message);
};

module.exports = {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse
};
