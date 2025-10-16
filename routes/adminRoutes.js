const express = require('express');
const { adminController } = require('../controllers/index');
const router = express.Router();
const { uploadSingle, uploadMultiple } = require('../middleware/upload');
const { adminAuth } = require('../middleware/adminAuth');

const { signInVallidations, categoryValidation, subCategoryValidation,
    productValidation,
    handleValidationErrors
} = require('../vallidations/adminVallidations');

//----------------api start---------------------------------------//

// router.post('/forgotPassword', emailVallidation, handleValidationErrors, adminController.forgotPassword);
// router.post('/changeForgotPassword', passwordVallidate, handleValidationErrors, adminController.changeForgotPassword);
// router.post('/resetPassword', adminAuth, passwordChange, handleValidationErrors, adminController.resetPassword);
// router.get('/getUserProfile', adminAuth, adminController.getUserProfile);
// router.post("/editProfile", adminAuth, uploadSingle, adminController.editProfile);

router.post('/signIn', signInVallidations, handleValidationErrors, adminController.adminSignIn);
router.get('/fetchAllReportedUsersData', adminController.fetchAllReportedUsersData);
router.get('/fetchAllUsersProducts', adminAuth, adminController.fetchAllUsersProducts);
router.post('/productApprovedAndReject', adminAuth, adminController.productApprovedAndReject);
router.post('/editProductByAdmin/:productId', adminAuth, uploadMultiple, adminController.editProductsByAdmin);
router.get('/fetchProductByProductId', adminAuth, adminController.fetchProductByProductId);
router.get('/fetchAllCategory', adminAuth, adminController.fetchAllCategory);
router.get('/fetchSubCategoryByCategoryId', adminAuth, adminController.fetchSubCategoryByCategoryId);

router.post('/createCategories', adminAuth, categoryValidation, handleValidationErrors, adminController.createCategories);
router.post('/editCategory/:categoryId', adminAuth, adminController.editCategory);

router.post('/createSubCategories', adminAuth, subCategoryValidation, handleValidationErrors, adminController.createSubCategories);
router.post('/editSubCategory/:subCategoryId', adminAuth, adminController.editSubCategory);

router.get('/fetchAllUsersDetails', adminAuth, adminController.fetchAllUsersDetails);
// router.post('/createProducts', adminAuth, uploadMultiple, productValidation, handleValidationErrors, adminController.createProducts);
router.get('/fetchProductByProductId', adminAuth, adminController.fetchProductByProductId);
router.post('/editProduct/:productId', adminAuth, uploadMultiple, adminController.editProducts);
router.delete('/deleteUserProducts/:productId', adminAuth, adminController.deleteUserProducts);


router.post('/createFeatures',adminAuth,  adminController.createFeatures);
router.get('/fetchAllFeaturesByAdmin', adminAuth, adminController.fetchAllFeaturesByAdmin);
router.post('/editFeaturesByFeatureId/:id', adminAuth, uploadMultiple, adminController.editFeaturesByFeatureId);
router.delete('/deleteFeatureByIds/:id', adminAuth, adminController.deleteFeatureByIds);

router.post('/createSearchSuggestions',adminAuth, adminController.createSearchSuggestions);
router.get('/fetchAllSuggestionsByAdmin', adminAuth, adminController.fetchAllSuggestionsByAdmin);
router.post('/editSearchSuggestionsById/:id', adminAuth, adminController.editSearchSuggestionsById);
router.delete('/deleteSearchSuggestionsByIds/:id', adminAuth, adminController.deleteSearchSuggestionsByIds);

module.exports = router;
