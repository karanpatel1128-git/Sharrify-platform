const sendResponse = (res, success, statusCode, message, data = null) => {
    return res.status(statusCode).json({
        success: success,
        status: statusCode,
        message: message,
        data: data || undefined,
    });
};

const handleError = (res, statusCode, message) => {
    return sendResponse(res, false, statusCode, message);
};

const handleSuccess = (res, statusCode, message, ...data) => {
    return sendResponse(res, true, statusCode, message, data.length > 0 ? data[0] : null);
};

const vallidationErrorHandle = (res, error) => {
    const errorMessage = error.errors[0].msg;
    return sendResponse(res, false, 400, errorMessage);
};

// Use CommonJS export syntax
module.exports = {
    handleError,
    handleSuccess,
    vallidationErrorHandle
};
