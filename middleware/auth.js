const jwt = require('jsonwebtoken');
const { fetchUserByIds } = require('../models/usersModel');
const { handleError } = require('../utils/responseHandler'); 
const SECRET_KEY = process.env.AUTH_SECRETKEY;
const { Msg } = require('../utils/commonMessage');
const { AUTHORIZATION, ERROR_TYPES } = require('../utils/constant'); 



const userAuth = async (req, res, next) => {
    try {
        const bearerHeader = req.headers[AUTHORIZATION];
        if (!bearerHeader) {
            return handleError(res, 401, Msg.tokenRequired);
        }

        const bearer = bearerHeader.split(' ');
        req.token = bearer[1];

        const verifyUser = jwt.verify(req.token, SECRET_KEY);
        const user = await fetchUserByIds(verifyUser.userId);

        if (!user || user.length === 0) {
            return handleError(res, 403, Msg.unauthorizedAccess);
        }

        req.user = user[0];
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

module.exports = { userAuth };
