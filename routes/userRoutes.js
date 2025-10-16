const express = require('express');
const { userController } = require('../controllers/index');
const router = express.Router();
const { uploadSingle } = require('../middleware/upload');
const { userAuth } = require('../middleware/auth');
const { userValidation, handleValidationErrors, reviewValidation } = require('../vallidations/userVallidations');

//----------------api start---------------------------------------//

/**
 * @Developer KARAN PATEL
 * @MODULE Users InterFace
 * @DATE 12-24-2024
 * 
 * */

router.post('/socialAuth', userController.userSocialAuthentication);
router.post('/signup', userController.userRegister);
router.post('/otpVerify', userController.otpVerifyFn);
router.post('/updateProfile', userAuth, uploadSingle, userController.updateUsersProfile);
router.get('/fetchProfileById', userAuth, userController.fetchProfileById);
router.get('/fetchAllCategory', userAuth, userController.fetchAllCategory);
router.get('/fetchSubCategoryByCategoryId', userAuth, userController.fetchSubCategoryByCategoryId);

router.get('/searchProductsList', userAuth, userController.searchProductsList);
router.get('/fetchUsersConnectedList', userAuth, userController.fetchUsersConnectedList);
router.delete('/chatDeleteByChatId', userAuth, userController.chatDeleteByChatId);
router.get('/fetchProductAccordingSubCategoryAndCategoryId', userAuth, userController.fetchSubCategoryAndCategoryListById);
router.post('/reportToUsersProducts', userAuth, userController.reportToUsersProducts);
router.get('/fetchAllFeaturesByUsersId', userAuth, userController.fetchAllFeaturesByUsersId);
router.get('/fetchAllNotificationsByUsersId', userAuth, userController.fetchAllNotificationsByUsersId);

router.delete('/clearAllChatsByUsersId', userAuth, userController.clearAllChatsByUsersId);
router.delete('/deleteAccount', userAuth, userController.deleteAccount);
router.post('/blockedToAnotherUsers', userAuth, userController.blockedToAnotherUsers);
router.post('/unblockedToAnotherUsers', userAuth, userController.unblockedToAnotherUsers);
router.get('/fetchBlockedList', userAuth, userController.fetchBlockedList);
router.post('/checkIfNumberExistsOrEmail', userAuth, userController.checkIfNumberExistsOrEmail);
router.get('/fetchSearchSuggestions', userAuth, userController.fetchAllSearchSuggestions);

router.post('/rating', userAuth, reviewValidation, handleValidationErrors, userController.ratting);
router.get('/fetchAnotherUserProfileById', userAuth, userController.fetchAnotherUserProfileById);
router.get('/isUserGiveRattingOrReviewNot', userAuth, userController.isUserGiveRattingOrReviewNot);

// -------------------------------------------chat sections-------------------------------------------//

router.post('/create-chat', userAuth, userController.chat_create);
router.post('/comments', userAuth, userController.comments);
router.get('/fetchPostComments', userAuth, userController.fetchPostsComments);
router.post('/favorites', userAuth, userController.favorites);
router.post('/post-like', userAuth, userController.like);
router.get('/fetchAllMyFavoritePost', userAuth, userController.fetchAllMyFavoritePost);
router.get('/fetchUserChatList', userAuth, userController.fetchUserChatList);



module.exports = router;
