/**
 * Utility to format consistent JSON responses
 */

const formatResponse = (message, data = null, statusCode = 200) => {
  return {
    message,
    data,
    status: statusCode,
  };
};

/**
 * Send a successful response
 */
const sendSuccess = (res, message, data, statusCode = 200) => {
  res.status(statusCode).json(formatResponse(message, data, statusCode));
};

/**
 * Send an error response
 */
const sendError = (res, message, error = null, statusCode = 500) => {
  res.status(statusCode).json(
    formatResponse(message, error ? { error: error.message || error } : null, statusCode)
  );
};

module.exports = {
  formatResponse,
  sendSuccess,
  sendError,
};
