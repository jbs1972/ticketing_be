const jwt = require('jsonwebtoken');
const config = require('config');
const loginDetailsService = require('../services/LoginDetails.service');
const { sendError } = require('../utils/responseFormatter');

module.exports = async function(req, res, next) {
    const token = req.header('x-auth-token');
    if (!token) return sendError(res, 'Access denied. No token provided.', null, 401);

    try {
        const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
        req.user = decoded;

        const sessionId = decoded.session_id;
        if (!sessionId) {
            return sendError(res, 'Session information missing. Please login again.', null, 401);
        }

        const isActive = await loginDetailsService.isSessionActive(sessionId);
        if (!isActive) {
            return sendError(res, 'Session expired. Please login again.', null, 401);
        }

        next();
    } catch (err) {
        return sendError(res, 'Invalid token.', err, 400);
    }
};