const jwt = require('jsonwebtoken');
const { fetchAdminById } = require('../models/adminModel');
const { handleError } = require('../utils/responseHandler'); // Assuming this is the correct path
const SECRET_KEY = process.env.AUTH_SECRETKEY;
const { Msg } = require('../utils/commonMessage');
const { AUTHORIZATION, ERROR_TYPES } = require('../utils/constant'); // Adjust the path accordingly


const adminAuth = async (req, res, next) => {
    try {
        const bearerHeader = req.headers[AUTHORIZATION];
        if (!bearerHeader) {
            return handleError(res, 401, Msg.tokenRequired);
        }

        const bearer = bearerHeader.split(' ');
        req.token = bearer[1];

        const verifyUser = jwt.verify(req.token, SECRET_KEY);
        const admin = await fetchAdminById(verifyUser.data.id);

        if (!admin || admin.length === 0) {
            return handleError(res, 403, Msg.unauthorizedAccess);
        }

        req.admin = admin[0];
        next();
    } catch (err) {
        if (err.name === ERROR_TYPES.TOKEN_EXPIRED_ERROR) {
            return handleError(res, 401, Msg.tokenExpired);
        } else if (err.name === ERROR_TYPES.JWT_ERROR) {
            return handleError(res, 403, Msg.invalidToken);
        } else {
            return handleError(res, 500, Msg.serverError);
        }
    }
};

module.exports = { adminAuth };
