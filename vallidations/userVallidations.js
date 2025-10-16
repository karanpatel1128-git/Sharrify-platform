const { body, validationResult } = require('express-validator');
const { handleSuccess, handleError,vallidationErrorHandle } = require("../utils/responseHandler");

const userValidation = [
    body('fullName')
        .notEmpty()
        .withMessage('Full name is required'),

    body('location')
        .notEmpty()
        .withMessage('Location is required'),

    body('gender')
        .notEmpty()
        .withMessage('Gender is required')
        .isIn(['male', 'female', 'other'])
        .withMessage('Gender must be male, female, or other'),

    body('dob')
        .notEmpty()
        .withMessage('Date of birth is required')
        .isDate()
        .withMessage('Date of birth must be a valid date (YYYY-MM-DD)')
        .custom((value) => {
            const currentDate = new Date();
            const dob = new Date(value);
            if (dob >= currentDate) {
                throw new Error('Date of birth must be in the past');
            }
            return true;
        })
];
const reviewValidation = [
    body('review')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Review cannot be empty if provided')
        .isLength({ max: 255 })
        .withMessage('Review must not exceed 255 characters'),

    body('rating')
        .notEmpty()
        .withMessage('Rating is required')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be an integer between 1 and 5'),

    body('productId')
        .notEmpty()
        .withMessage('Product ID is required')
        .isInt()
        .withMessage('Product ID must be a number'),

    body('ratingTo')
        .optional()
        .isInt()
        .withMessage('RattingTo must be an integer'),
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
    userValidation, reviewValidation,
    handleValidationErrors
}
