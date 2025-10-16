const { body, validationResult } = require('express-validator');
const { handleSuccess, handleError,vallidationErrorHandle } = require("../utils/responseHandler");



const signInVallidations = [
    body('email')
        .isEmail().withMessage('Email Must Be Required'),

    body('password')
        .notEmpty().withMessage('Password must be required')
        .isLength({ min: 8 }).withMessage('Password should be at least 8 characters long')
];

const emailVallidation = [
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Must be a valid email address'),
];

const passwordVallidate = [
    body('password')
        .notEmpty().withMessage('Password Must Be Required')
        .isLength({ min: 8 }).withMessage('Password Should Be At Least 8 Characters Long'),
    body('confirm_password')
        .notEmpty().withMessage('Confirm Password Must Be Required')
        .isLength({ min: 8 }).withMessage('Password Should Be At Least 8 Characters Long')
];

const passwordChange = [
    body('old_password')
        .notEmpty().withMessage('Old Password Must Be Required')
        .isLength({ min: 8 }).withMessage('Password Should Be At Least 8 Characters Long'),

    body('new_password')
        .notEmpty().withMessage('New Password Is Required')
        .isLength({ min: 8 }).withMessage('Password Should Be At Least 8 Characters Long')
        .matches(/[a-z]/).withMessage('Password Must Contain At Least One Lowercase Letter')
        .matches(/[A-Z]/).withMessage('Password Must Contain At Least One Uppercase Letter')
        .matches(/\d/).withMessage('Password Must Contain At Least One Number')
        .matches(/[\W_]/).withMessage('Password Must Contain At Least One Special Character'),

    body('confirm_password')
        .notEmpty().withMessage('Confirm Password Is Required')
        .isLength({ min: 8 }).withMessage('Password Should Be At Least 8 Characters Long')
        .matches(/[a-z]/).withMessage('Password Must Contain At Least One Lowercase Letter')
        .matches(/[A-Z]/).withMessage('Password Must Contain At Least One Uppercase Letter')
        .matches(/\d/).withMessage('Password Must Contain At Least One Number')
        .matches(/[\W_]/).withMessage('Password Must Contain At Least One Special Character'),
];


// Validation for Category Creation
const categoryValidation = [
    body('categoryName')
        .notEmpty().withMessage('Category name is required')
        .isLength({ min: 3 }).withMessage('Category name should be at least 3 characters long'),
];

// Validation for Subcategory Creation
const subCategoryValidation = [
    body('subcategoryName')
        .notEmpty().withMessage('Subcategory name is required')
        .isLength({ min: 3 }).withMessage('Subcategory name should be at least 3 characters long'),
    
    body('categoryId')
        .notEmpty().withMessage('Category ID is required')
        .isInt().withMessage('Category ID must be a valid number')
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
    signInVallidations, passwordChange, emailVallidation, passwordVallidate,categoryValidation,subCategoryValidation,
    handleValidationErrors
}















