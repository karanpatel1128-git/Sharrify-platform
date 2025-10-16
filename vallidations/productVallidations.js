const { body, validationResult } = require('express-validator');
const { handleSuccess, handleError, vallidationErrorHandle } = require("../utils/responseHandler");

const productValidation = [
    // Title
    body('title')
        .notEmpty()
        .withMessage('Title is required'),

    // Descriptions
    body('descriptions')
        .notEmpty()
        .withMessage('Descriptions are required'),

    // Key Note
    body('keyNote')
        .optional(),

    // Location
    body('location')
        .notEmpty()
        .withMessage('Location is required'),

    // Category
    body('category')
        .notEmpty()
        .withMessage('Category is required'),

    // Subcategory
    body('subCategory')
        .notEmpty()
        .withMessage('Subcategory is required'),

    // Size
    body('size')
        .optional(),

    // Deposite Amount
    body('depositeAmount')
        .optional(),
    // Rent Day Price
    body('rentDayPrice')
        .optional(),

    // 3-Day Discount
    body('3DayDiscount')
        .optional()
        .isNumeric()
        .withMessage('3-day discount must be a numeric value'),

    // 7-Day Discount
    body('7DayDiscount')
        .optional()
        .isNumeric()
        .withMessage('7-day discount must be a numeric value'),

];

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return vallidationErrorHandle(res, errors);
    }
    next();
};

// Exporting validation rules and error handling middleware
module.exports = {
    productValidation,
    handleValidationErrors
};
