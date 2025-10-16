require('dotenv').config();
const {
    fetchUserByMobileNumber,
    fetchUserByEmailAndUserId,
    addUsersByMobileNumber,
    fetchUserByIds,
    editUsersProfile,
    fetchAllCategoryList,
    fetchAllSubCategoryList,
    listOfSubCategoryByCategoryId,
    fetchOnlyOtherUsersProducts,
    fetchConnectedUsers,
    chatDeleteById,
    fetchProductAccordingToCategory,
    fetchProductAccordingToSubCategory,
    reportToUsersProducts,
    fetchAllFeatures,
    fetchAllNotificationsModel,
    clearAllChatsModel,
    deleteAccountByUserId,
    clearNotificationById,
    fetchUserByEmail,
    socialAuthanticationInserted,
    createBlocked,
    unblockedToUsers,
    fetchBlockedListUsers,
    fetchBlockedUsersDetailed,
    fetchUserByMobileNumberAndUsersId,
    fetchBlockedListByUsersIdAndBuyerId,
    fetchSearchSuggestions,
    addRattingAndReview,
    alreadyAddedRatting,
    fetchUserRatingById,
    fetchUserRatingByUserIdAndProductId,
    fetchReviewByUserId,
    fetchAllUsersGigs,
    insertUsersCommented,
    fetchParticularPostComments,
    removePostFromYourFavroite,
    addedToPostFavorite,
    postLike,
    postUnlike,
    fetchAllMyFavoritePostModel,
    fetchFavoritePostByUsersId,
    fetchLikePostByUsersId,
    fetchTotalLikeCount,
    fetchTotalComments,
    fetchParticularUserChatList,

} = require('../models/usersModel')
const { Msg } = require('../utils/commonMessage')
const { AUTH_PROVIDER, NOTIFICATION_TYPE } = require('../utils/constant')
const jwt = require('jsonwebtoken');
const secretKey = process.env.AUTH_SECRETKEY;
const { baseUrl } = require('../config/path');
const { log } = require('util');
const { haversineDistance, createNotificationMessage, sendNotification } = require('../utils/helper');
const moment = require("moment");
const { fetchAllProducts, fetchGigsByGigsId, fetchProductById } = require('../models/productsModel');
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
const expiryTime = process.env.TOKEN_EXPIRY
const { admin } = require('../utils/constant')
const { handleSuccess, handleError } = require("../utils/responseHandler");
const { getOrCreateChat, getOrCreateOneAndOneChat } = require('../models/socketModel');
const { fetchProductByProductId } = require('./productController');
const { fetchProductByProductIdOnAdminPanel } = require('../models/adminModel');




// exports.userSocialAuthentication = async (req, res) => {
//     try {
//         let { idToken, type, fullName } = req.body;
//         type = type == 1 ? AUTH_PROVIDER.GOOGLE_AUTH : AUTH_PROVIDER.APPLE_AUTH
//         const decodedToken = await admin.auth().verifyIdToken(idToken);
//         const { uid, email, name, picture } = decodedToken;
//         const existingUser = await fetchUserByEmail(uid, email)
//         if (existingUser.length > 0) {
//             const token = jwt.sign(
//                 { userId: existingUser[0].id, email },
//                 secretKey
//             );
//             return res.status(200).json({
//                 success: true,
//                 status: 200,
//                 message: "Login successful",
//                 data: {
//                     gender: existingUser[0].gender || null,
//                     isOldUser: true,
//                     userId: existingUser[0].id,
//                     token
//                 }
//             });
//         } else {
//             const newUser = {
//                 uid,
//                 email,
//                 fullName: name ? name : fullName,
//                 profileImages: picture,
//                 socialProvider: type,
//             };

//             let userCreated = await socialAuthanticationInserted(newUser);
//             if (userCreated) {
//                 let data = await fetchUserByIds(userCreated.insertId);
//                 const token = jwt.sign( { userId: data[0].id, email }, secretKey,{ expiresIn: expiryTime } )
//                 return handleSuccess(res, 200, Msg.profileUpdatedSuccessfully, result);
//                 return res.status(200).json({
//                     success: true,
//                     status: 200,
//                     message: "User registered successfully",
//                     data: {
//                         gender: data[0].gender || null,
//                         isOldUser: false,
//                         userId: data[0].id,
//                         token
//                     }
//                 });
//             }
//         }
//     } catch (error) {
//         console.error("Authentication Error:", error);
//         return res.status(500).json({
//             success: false,
//             message: "Authentication failed",
//             details: error.message
//         });
//     }
// };

exports.userSocialAuthentication = async (req, res) => {
    try {
        let { idToken, type, fullName } = req.body;
        type = type == 1 ? AUTH_PROVIDER.GOOGLE : AUTH_PROVIDER.APPLE;

        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { uid, email, name, picture } = decodedToken;

        const existingUser = await fetchUserByEmail(uid, email);

        if (existingUser.length > 0) {
            const token = jwt.sign({ userId: existingUser[0].id, email }, secretKey, { expiresIn: expiryTime });
            return handleSuccess(res, 200, Msg.loginSuccess, { gender: existingUser[0].gender || null, isOldUser: true, userId: existingUser[0].id, token, });
        } else {
            const newUser = {
                uid,
                email,
                fullName: name ? name : fullName,
                profileImages: picture,
                socialProvider: type,
            };

            const userCreated = await socialAuthanticationInserted(newUser);
            if (userCreated) {
                const data = await fetchUserByIds(userCreated.insertId);
                const token = jwt.sign({ userId: data[0].id, email }, secretKey, { expiresIn: expiryTime });

                return handleSuccess(res, 200, Msg.userRegisterSuccess, { gender: data[0].gender || null, isOldUser: false, userId: data[0].id, token, });
            } else {
                return handleError(res, 400, Msg.userCreationFailed);
            }
        }
    } catch (error) {
        console.error("Authentication Error:", error);
        return handleError(res, 500, error.message);
    }
};

exports.userRegister = async (req, res) => {
    try {
        let { mobileNumber } = req.body;
        const TO_NUMBER = mobileNumber;
        // try {
        //     const verification = await client.verify.v2.services('VA205b952213dfe5c95eb53251d59c4bba')
        //         .verifications
        //         .create({ to: TO_NUMBER, channel: 'sms' });
        res.status(200).json(
            {
                success: true,
                status: 200,
                // sid: verification.sid,
                sid: 'xyz787igkhholhkh65',
                message: Msg.verificationSuccess
            }
        );
        // } catch (twilioError) {
        //     if (twilioError.code === 60200) {
        //         return res.status(400).json({ success: false, status: 400, message: 'Invalid phone number' });
        //     } else if (twilioError.code === 20404) {
        //         return res.status(404).json({ success: false, status: 404, message: 'Phone number does not exist' });
        //     }
        //     return res.status(500).json({ success: false, status: 500, message: 'Twilio verification error', error: twilioError.message });
        // }
    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            message: 'Failed to send verification',
            error: error.message
        });
    }
};

exports.otpVerifyFn = async (req, res) => {
    try {
        let { mobileNumber, otp } = req.body;
        // const verificationCheck = await client.verify.v2
        //     .services('VA205b952213dfe5c95eb53251d59c4bba')
        //     .verificationChecks.create({
        //         code: otp,
        //         to: mobileNumber,
        //     });
        // if (verificationCheck.valid == true) {
        let checkUser = await fetchUserByMobileNumber(mobileNumber);
        if (checkUser.length > 0) {
            const token = jwt.sign(
                { userId: checkUser[0].id, mobileNumber },
                secretKey,
                { expiresIn: '24h' }
            );
            let obj = {
                gender: checkUser[0].gender || null,
                isOldUser: true,
                userId: checkUser[0].id,
                token: token
            };
            return res.status(200).send({
                success: true,
                status: 200,
                message: Msg.otpVerified,
                data: obj
            });
        } else {
            let obj = {
                mobileNumber: mobileNumber,
            };
            let userCreated = await addUsersByMobileNumber(obj);
            if (userCreated) {
                let data = await fetchUserByIds(userCreated.insertId);
                const token = jwt.sign(
                    { userId: data[0].id, mobileNumber },
                    secretKey,
                    { expiresIn: '365d' }
                );
                let obj = {
                    gender: data[0].gender || null,
                    isOldUser: false,
                    userId: data[0].id,
                    token: token
                };
                return res.status(200).send({
                    success: true,
                    status: 200,
                    message: Msg.otpVerified,
                    data: obj
                });
            }
        }
        // } else {
        //     return res.status(400).send({
        //         status: false,
        //         message: Msg.wrongOtp
        //     });
        // }
    } catch (error) {
        console.log('>>>>>>error', error);
        return res.status(500).send({
            success: false,
            status: 500,
            message: Msg.serverError
        });
    }
};

exports.updateUsersProfile = async (req, res) => {
    try {
        let userId = req.user.id
        let { fullName, location, gender, email, dob, fcm_token, address, mobileNumber, city, state, pincode, country, locality } = req.body;

        let fileName;
        if (req.file) {
            fileName = req.file.filename
        }
        if (dob) {
            dob = moment(dob, "DD-MM-YYYY").format("YYYY-MM-DD");
        }
        if (userId == 55) {
            location = [22.639094623279565, 75.60958415123014]
        }
        let obj = {
            fcmToken: fcm_token, fullName, mobileNumber, profileImages: fileName, location: JSON.stringify(location), email,
            dob, gender, pageCompleted: 1, address, city, state, pincode, country, locality
        }
        let result = await editUsersProfile(obj, userId);
        if (result.affectedRows === 1) {
            return handleSuccess(res, 200, Msg.profileUpdatedSuccessfully);
        } else {
            return handleSuccess(res, 200, Msg.profileUpdatedFailed);
        }
    } catch (error) {
        console.error(">>>>>>error", error);
        return handleError(res, 500, Msg.serverError);
    }
};

exports.fetchProfileById = async (req, res) => {
    try {
        let userId = req.user.id
        let result = await fetchUserByIds(userId);
        if (result.length === 0) {
            return handleSuccess(res, 200, Msg.dataFoundFailed, []);
        }
        result = result.map((item) => {
            item.profileImages = item.profileImages ? item.profileImages.startsWith("https") ? item.profileImages : `${baseUrl}/uploads/${item.profileImages}` : null;
            return item;
        });
        return handleSuccess(res, 200, Msg.dataFoundSuccess, result[0]);
    } catch (error) {
        return handleError(res, 500, Msg.serverError);
    }
};

exports.fetchAllCategory = async (req, res) => {
    try {
        let userId = req.user.id
        let result = await fetchAllCategoryList();
        if (result.length === 0) {
            return handleSuccess(res, 200, Msg.dataFoundFailed, []);
        }
        return handleSuccess(res, 200, Msg.dataFoundSuccess, result);
    } catch (error) {
        return handleError(res, 500, Msg.serverError);
    }
};

exports.fetchSubCategoryByCategoryId = async (req, res) => {
    try {
        let { id } = req.query
        let result = id ? await listOfSubCategoryByCategoryId(id) : await fetchAllSubCategoryList();
        if (result.length === 0) {
            return handleSuccess(res, 200, Msg.noSubcategoryFound, []);
        }
        return handleSuccess(res, 200, Msg.subCategoryFoundSuccess, result);
    } catch (error) {
        console.error(">>>>>>error", error);
        return handleError(res, 500, Msg.serverError);
    }
};

exports.searchProductsList = async (req, res) => {
    try {
        let { search, rangeFilter, excludeMine } = req.query;
        let userId = req.user.id;
        let result = await fetchUserByIds(userId);
        if (!result.length || !result[0].location) {
            return handleSuccess(res, 200, Msg.userLocationNotFound, []);
        }
        let fetchUserlatLong = JSON.parse(result[0].location.replace(/"/g, ''));
        let data = await fetchOnlyOtherUsersProducts(userId, search);
        if (!data.length) {
            return handleSuccess(res, 200, Msg.dataFoundFailed, []);
        }

        let filterRange;
        if (userId == 55) {
            filterRange = 30;
        } else {
            filterRange = rangeFilter ? Number(rangeFilter) : 50;
        }

        let filteredData = [];

        for (let item of data) {
            if (!item.location) continue;
            let productLocation;
            try {
                productLocation = typeof item.location === 'string' ? JSON.parse(item.location) : item.location;
            } catch (err) {
                continue;
            }
            let distance = await haversineDistance(fetchUserlatLong, productLocation);
            if (distance > filterRange) continue;
            const userData = await fetchUserByIds(item.userId);
            if (!userData || userData.length === 0) {
                continue;
            }
            try {
                item.productsImages = item.productsImages ? JSON.parse(item.productsImages).map(i => `${baseUrl}/uploads/${i}`) : [];
            } catch (err) {
                item.productsImages = [];
            }

            item.fullName = userData[0].fullName;
            item.profileImages = userData[0].profileImages ? `${baseUrl}/uploads/${userData[0].profileImages}` : null;
            item.distance = parseFloat(distance.toFixed(2));
            item.isItemtype = 'products';
            let postId = item.id
            let isFavorite = await fetchFavoritePostByUsersId(userId, postId, 1)
            item.isFavorite = isFavorite.length > 0 ? true : false
            let isLike = await fetchLikePostByUsersId(userId, postId, 1)
            let totalLike = await fetchTotalLikeCount(postId, 1)
            item.totalLike = totalLike[0].totalLikes
            item.isLike = isLike.length > 0 ? true : false
            let totalComments = await fetchTotalComments(postId, 1)
            item.totalComments = totalComments[0].totalComments
            filteredData.push(item);
        }

        // ----------------------------------------------for gigs------------------------------------------//
        let fetchGigs = await fetchAllUsersGigs(userId);
        if (fetchGigs.length > 0) {
            for (let item of fetchGigs) {
                if (item.location) {
                    let productLocation = JSON.parse(item.location.replace(/"/g, ''));
                    let distance = await haversineDistance(fetchUserlatLong, productLocation);
                    let userData = await fetchUserByIds(item.userId)
                    if (distance <= filterRange) {
                        item.productsImages = item.productsImages ? JSON.parse(item.productsImages).map(i => `${baseUrl}/uploads/${i}`) : [];
                        item.links = item.links != null ? JSON.parse(item.links) : ''
                        item.images = item.productsImages != null ? JSON.parse(item.images).map(i => `${baseUrl}/uploads/${i}`) : [];
                        item.fullName = userData[0].fullName
                        item.profileImages = userData[0].profileImages != null ? `${baseUrl}/uploads/${userData[0].profileImages}` : null
                        item.distance = parseFloat(distance.toFixed(2));
                        item.isItemtype = 'gigs'
                        item.createdAt = item.createdAt
                        let postId = item.id
                        let isFavorite = await fetchFavoritePostByUsersId(userId, postId, 2)
                        item.isFavorite = isFavorite.length > 0 ? true : false
                        let isLike = await fetchLikePostByUsersId(userId, postId, 2)
                        item.isLike = isLike.length > 0 ? true : false
                        let totalLike = await fetchTotalLikeCount(postId, 2)
                        item.totalLike = totalLike[0].totalLikes
                        let totalComments = await fetchTotalComments(postId, 2)
                        item.totalComments = totalComments[0].totalComments
                        filteredData.push(item);
                    }
                }
            }
        }
        filteredData.sort((a, b) => a.distance - b.distance);
        if (excludeMine) {
            filteredData = filteredData.filter(userData => userData.userId !== userId);
        }
        let fetchUsersBlockedList = await fetchBlockedListUsers(userId);
        let responseData;
        if (fetchUsersBlockedList.length > 0) {
            let blockedToIds = fetchUsersBlockedList.map(user => user.blocked_to);
            let nonBlockedProducts = filteredData.filter(product => !blockedToIds.includes(product.userId));
            responseData = nonBlockedProducts;
        } else {
            responseData = filteredData;
        }
        responseData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return handleSuccess(res, 200, Msg.productFoundSuccess, responseData);
    } catch (error) {
        return handleError(res, 500, Msg.serverError);
    }
};

exports.fetchUsersConnectedList = async (req, res) => {
    try {
        let userId = req.user.id
        let { chatType } = req.query
        let productsId = [];
        let fetchOwnProducts = await fetchAllProducts(userId)
        if (chatType == 1) {
            if (fetchOwnProducts.length == 0) {
                return handleSuccess(res, 200, Msg.dataFoundSuccess, []);
            } else {
                productsId = fetchOwnProducts.map((item) => item.id)
            }
        }
        if (chatType == 0) {
            productsId = fetchOwnProducts.length > 0 ? fetchOwnProducts.map((item) => item.id) : []
        }
        let result = await fetchConnectedUsers(userId);
        if (result.length == 0) {
            return handleSuccess(res, 200, Msg.dataFoundFailed, []);
        }
        let filteredResults = chatType == 1 && productsId.length > 0 ? result.filter(item => productsId.includes(item.id)) : productsId.length > 0 ? result.filter(item => !productsId.includes(item.id) && item.sellerId !== userId) : result;
        filteredResults = await Promise.all(filteredResults.map(async (item) => {
            let images;
            try {
                images = JSON.parse(item.productsImages);
                if (Array.isArray(images) && images.length > 0) {
                    images = images.map((img) => `${baseUrl}/uploads/${img}`);
                } else {
                    images = null;
                }
            } catch (error) {
                images = null;
            }
            let currentUserBuyerId = chatType == 1 ? item.buyerId : item.sellerId
            let isUserBlocked = await fetchBlockedListByUsersIdAndBuyerId(userId, currentUserBuyerId)
            isBlocked = isUserBlocked.length > 0 ? true : false
            let userData = await fetchUserByIds(item.buyerId);
            return {
                ...item,
                productsImages: images,
                buyerFullName: userData[0].fullName,
                isBlocked: isBlocked,
            };
        }));
        return handleSuccess(res, 200, Msg.dataFoundSuccess, filteredResults);
    } catch (error) {
        return handleError(res, 500, Msg.serverError);
    }
};

exports.chatDeleteByChatId = async (req, res) => {
    try {
        let { chatId } = req.query;
        if (!chatId) {
            return handleSuccess(res, 200, Msg.idRequired);
        }
        let result = await chatDeleteById(chatId);
        if (result.affectedRows == 1) {
            return handleSuccess(res, 200, Msg.chatDeletedSuccessfull);
        }
        return handleSuccess(res, 200, Msg.chatNotDeleted);
    } catch (error) {
        return handleError(res, 500, Msg.serverError);
    }
};

exports.fetchSubCategoryAndCategoryListById = async (req, res) => {
    try {
        let { id, type, page } = req.query;
        page = parseInt(page);
        let limit = parseInt(10)
        let result = type == 1 ? await fetchProductAccordingToCategory(id) : await fetchProductAccordingToSubCategory(id);
        if (!result || result.length === 0) {
            return handleSuccess(res, 200, Msg.productNotFound, [], {});
        }
        result.map(async (item) => {
            let img = item.productsImages ? JSON.parse(item.productsImages) : 0
            item.productsImages = img.length > 0 ? `${baseUrl}/uploads/${img[0]}` : []
            return item
        }
        )
        let totalItems = result.length;
        let totalPages = Math.ceil(totalItems / limit);
        let paginatedResult = result.slice((page - 1) * limit, page * limit);
        return handleSuccess(res, 200, Msg.productFoundSuccess, paginatedResult, {
            currentPage: page,
            totalPages: totalPages,
            totalItems: totalItems,
            perPage: limit
        });

    } catch (error) {
        return handleError(res, 500, Msg.serverError);
    }
};

exports.reportToUsersProducts = async (req, res) => {
    try {
        let userId = req.user.id
        let { productId, message } = req.body;
        let data = {
            userId, productId, message
        }
        let reportUsersInsert = await reportToUsersProducts(data)
        if (reportUsersInsert.insertId) {
            return handleSuccess(res, 200, Msg.reportsSendSuccessfully);
        }
        return handleSuccess(res, 200, Msg.reportsNotSend);
    } catch (error) {
        return handleError(res, 500, Msg.serverError);
    }
};

exports.fetchAllFeaturesByUsersId = async (req, res) => {
    try {
        let result = await fetchAllFeatures();
        if (!result || result.length === 0) {
            return handleSuccess(res, 200, Msg.featuresNotFound, []);
        }
        return handleSuccess(res, 200, Msg.featuresFoundSuccessfull, result);
    } catch (error) {
        return handleError(res, 500, Msg.serverError);
    }
};

exports.fetchAllNotificationsByUsersId = async (req, res) => {
    try {
        let userId = req.user.id
        let result = await fetchAllNotificationsModel(userId);
        if (!result || result.length === 0) {
            return handleSuccess(res, 200, Msg.notificationNotFound, []);
        }
        result = result.map((item) => {
            item.meta = item.meta ? JSON.parse(item.meta) : null
            return item
        })
        return handleSuccess(res, 200, Msg.notificationFoundSuccessfull, result);
    } catch (error) {
        return handleError(res, 500, Msg.serverError);
    }
};

exports.clearAllChatsByUsersId = async (req, res) => {
    try {
        let userId = req.user.id
        let { notificationsId } = req.query
        let result;
        let message;
        if (notificationsId && notificationsId.length > 0) {
            notificationsId = JSON.parse(notificationsId)
            let isDeleted = await Promise.all(
                notificationsId.map(async (item) => {
                    return item.result = await clearNotificationById(item)
                })
            )
            message = Msg.chatDeletedById
            result = isDeleted;
        } else {
            result = await clearAllChatsModel(userId);
            message = Msg.chatDeletedSuccessfully
        }
        if (result.affectedRows === 0) {
            return handleSuccess(res, 200, Msg.noChatFound, []);
        }
        return handleSuccess(res, 200, Msg.dataFoundSuccess, result);
    } catch (error) {
        return handleError(res, 500, Msg.serverError);
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        let userId = req.user.id
        let result = await deleteAccountByUserId(userId);
        if (result.affectedRows === 0) {
            return handleSuccess(res, 200, Msg.accountNotDeleted, []);
        }
        return handleSuccess(res, 200, Msg.accountDeletedSuccessfully, result);
    } catch (error) {
        return handleError(res, 500, Msg.serverError);
    }
};

exports.blockedToAnotherUsers = async (req, res) => {
    try {
        let { userId } = req.body;
        let { id } = req.user;
        let obj = { blocked_from: id, blocked_to: userId };
        await createBlocked(obj);
        return handleSuccess(res, 200, Msg.userBlockedSuccessfully, []);
    } catch (error) {
        return handleError(res, 500, Msg.serverError);
    }
};

exports.unblockedToAnotherUsers = async (req, res) => {
    try {
        let { userId } = req.body;
        let { id } = req.user;
        await unblockedToUsers(id, userId);
        return handleSuccess(res, 200, Msg.userUnBlockedSuccessfully, []);
    } catch (error) {
        return handleError(res, 500, Msg.serverError);
    }
};

exports.fetchBlockedList = async (req, res) => {
    try {
        let id = req.user.id;
        let result = await fetchBlockedListUsers(id);

        if (result.length > 0) {
            let blockedToIds = result.map(user => user.blocked_to);
            let blockedUserData = await fetchBlockedUsersDetailed(blockedToIds);
            blockedUserData = blockedUserData.map(user => {
                return {
                    id: user.id,
                    fullName: user.fullName,
                    profileImage: user.profileImages = user.profileImages ? user.profileImages.startsWith('https') ? user.profileImages : `${baseUrl}/uploads/${user.profileImages}` : null,
                    date: user.createdAt ? (user.createdAt instanceof Date ? user.createdAt.toISOString().split('T')[0] : user.createdAt.split('T')[0]) : null
                };
            });
            return handleSuccess(res, 200, Msg.blockedUsersFetchedSuccesfully, blockedUserData);
        } else {
            return handleSuccess(res, 200, Msg.noBlockedUsersFound, []);
        }
    } catch (error) {
        return handleError(res, 500, Msg.serverError);
    }
};

exports.checkIfNumberExistsOrEmail = async (req, res) => {
    try {
        let { mobileNumber, email } = req.body;
        let id = req.user.id;
        let data;
        if (mobileNumber) {
            data = await fetchUserByMobileNumberAndUsersId(mobileNumber, id)
        } else if (email) {
            data = await fetchUserByEmailAndUserId(id, email)
        } else {
            data = []
        }
        return handleSuccess(res, 200, Msg.userUnBlockedSuccessfully, { isDataExists: data.length > 0 });
    } catch (error) {
        return handleError(res, 500, Msg.serverError);
    }
};

exports.fetchAllSearchSuggestions = async (req, res) => {
    try {
        let result = await fetchSearchSuggestions();
        if (!result || result.length === 0) {
            return handleSuccess(res, 200, Msg.searchSuggestionsFoundSuccessfull, []);
        }
        return handleSuccess(res, 200, Msg.searchSuggestionsNotFound, result);
    } catch (error) {
        return handleError(res, 500, Msg.serverError);
    }
};

exports.ratting = async (req, res) => {
    try {
        let ratingFrom = req.user.id;
        let { ratingTo, productId } = req.body
        req.body.ratingFrom = ratingFrom
        let isRatingAdded = await alreadyAddedRatting(ratingFrom, ratingTo, productId)
        if (isRatingAdded.length > 0) {
            return handleError(res, 400, Msg.reviewAlreadySubmitted);
        }

        let isRatting = await addRattingAndReview(req.body)
        if (isRatting.insertId) {
            let isUserHasRating = await fetchUserRatingById(ratingTo)
            let totalRating = 0
            if (isUserHasRating.length > 0) {
                totalRating += isUserHasRating[0].averageRating
                let totalAvgRating = { rating: totalRating }
                await editUsersProfile(totalAvgRating, ratingTo)
            }
            return handleSuccess(res, 200, Msg.reviewSubmittedSuccess);
        } else {
            return handleError(res, 400, Msg.reviewSubmitFailed);
        }
    } catch (error) {
        return handleError(res, 500, Msg.serverError);
    }
};

exports.fetchAnotherUserProfileById = async (req, res) => {
    try {
        let userId = req.query.id
        let result = await fetchUserByIds(userId);
        let userReviewsFetch = await fetchReviewByUserId(userId)
        if (result.length === 0) {
            return handleSuccess(res, 200, Msg.dataFoundFailed, []);
        }
        result.map((item) => {
            item.profileImages = item.profileImages ? item.profileImages.startsWith('https') ? item.profileImages : `${baseUrl}/uploads/${item.profileImages}` : null;
            return item;
        })
        userReviewsFetch = userReviewsFetch.length > 0 ? userReviewsFetch.map((item) => ({
            ...item, profileImages: item.profileImages ? `${baseUrl}/uploads/${item.profileImages}` : null
        })) : [];
        let anotherUserDetails = {
            userName: result[0].fullName,
            profileImages: result[0].profileImages,
            rating: result[0].rating == null ? 0 : result[0].rating,
            reviews: userReviewsFetch,
        }
        return handleSuccess(res, 200, Msg.dataFoundSuccess, anotherUserDetails);
    } catch (error) {
        return handleError(res, 500, Msg.serverError);
    }
};

exports.isUserGiveRattingOrReviewNot = async (req, res) => {
    try {
        let userId = req.user.id
        let { productId } = req.query
        let isUserGiveReviewAndRatting = await fetchUserRatingByUserIdAndProductId(userId, productId)
        isUserGiveReviewAndRatting = isUserGiveReviewAndRatting.length > 0 ? true : false
        return handleSuccess(res, 200, Msg.dataFoundSuccess, {
            isUserGiveReviewAndRatting: isUserGiveReviewAndRatting
        });
    } catch (error) {
        return handleError(res, 500, Msg.serverError);
    }
};

exports.chat_create = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { receiverId } = req.body;
        if (!receiverId) {
            return handleError(res, 400, "Receiver ID is required.");
        }
        const chatId = await getOrCreateOneAndOneChat(senderId, receiverId);
        return handleSuccess(res, 200, "Chat created or already exists", chatId);
    } catch (error) {
        console.error("chat_create error:", error);
        return handleError(res, 500, Msg.serverError);
    }
};

/* ------------------------------------------ COMMENTS ------------------------------------------- */
// 1=product,2=gig

exports.comments = async (req, res) => {
    try {
        let { id, fullName, profileImages } = req.user;
        let userId = id
        req.body.user_id = userId

        let postId = req.body.post_id
        let item_type = req.body.item_type
        let productUserId;
        if (item_type == 1) {
            let productDetails = await fetchProductById(postId)
            productUserId = productDetails[0].userId
        } else if (item_type == 2) {
            let gigsDetails = await fetchGigsByGigsId(postId)
            productUserId = gigsDetails[0].userId
        }
        await insertUsersCommented(req.body)
        // send push notification
        if (productUserId != userId) {
            let userDetails = await fetchUserByIds(productUserId)
            let usersfetchFcmToken = userDetails[0].fcmToken;
            let notificationType = NOTIFICATION_TYPE.NEW_COMMENT;
            let notificationSend = 'new comment'
            let userName = fullName;
            userId = productUserId;

            let message = await createNotificationMessage({ notificationSend, userId, usersfetchFcmToken, notificationType, userName });
            message.data.profileImages = !profileImages
                ? null : (profileImages.startsWith("http://") || profileImages.startsWith("https://")) ? profileImages : `${baseUrl}/uploads/${profileImages}`;

            message.data.meta = JSON.stringify({
                productId: postId,
                item_type: item_type
            });
            await sendNotification(message);
            return handleSuccess(res, 200, Msg.commentAddSuccess);
        } else {
            return handleSuccess(res, 200, Msg.commentAddSuccess);
        }
    } catch (err) {
        return handleError(res, 500, Msg.serverError);
    }
};

exports.fetchPostsComments = async (req, res) => {
    try {
        let { post_id, item_type } = req.query
        let rows = await fetchParticularPostComments(post_id, item_type)
        if (rows.length === 0) {
            return handleSuccess(res, 200, Msg.commentNotFound);
        }
        rows = await Promise.all(rows.map(async (item) => {
            let fetchUserDetails = await fetchUserByIds(item.userId)
            if (fetchUserDetails[0].profileImages !== null) {
                item.profileImages = `${baseUrl}/uploads/${fetchUserDetails[0].profileImages}`
            } else {
                item.profileImages = null
            }
            return item
        }))
        return handleSuccess(res, 200, Msg.dataFoundSuccess, rows);
    } catch (err) {
        return handleError(res, 500, Msg.serverError);
    }
};


/* =========================== FAVORITES =========================== */
exports.favorites = async (req, res) => {
    try {
        let userId = req.user.id;
        req.body.user_id = userId
        let postId = req.body.post_id
        let item_type = req.body.item_type
        let isUserFavroiteOrNot = await fetchFavoritePostByUsersId(userId, postId, item_type)
        if (isUserFavroiteOrNot.length > 0) {
            let id = isUserFavroiteOrNot[0].id
            await removePostFromYourFavroite(id)
            return handleSuccess(res, 200, Msg.favoriteRemove);
        } else {
            await addedToPostFavorite(req.body)
            return handleSuccess(res, 200, Msg.favoriteAddSuccess);
        }
    } catch (err) {
        return handleError(res, 500, Msg.serverError);
    }
};

/* =========================== LIKES =========================== */

exports.like = async (req, res) => {
    try {
        let { id, fullName, profileImages } = req.user;
        let userId = id
        req.body.user_id = userId
        // let fetchUserDetails = await fetchUserByIds(userId)
        // let fullName = fetchUserDetails[0].fullName;
        let productUserId;

        let postId = req.body.post_id
        let item_type = req.body.item_type
        if (item_type == 1) {
            let productDetails = await fetchProductById(postId)
            productUserId = productDetails[0].userId
        } else if (item_type == 2) {
            let gigsDetails = await fetchGigsByGigsId(postId)
            productUserId = gigsDetails[0].userId
        }
        let isUserLikeOrUnlike = await fetchLikePostByUsersId(userId, postId, item_type)
        if (isUserLikeOrUnlike.length > 0) {
            let id = isUserLikeOrUnlike[0].id
            await postUnlike(id)
            return handleSuccess(res, 200, Msg.unlikeSuccess);
        } else {
            await postLike(req.body)
            // send push notification
            if (productUserId != userId) {
                let userDetails = await fetchUserByIds(productUserId)
                let usersfetchFcmToken = userDetails[0].fcmToken;
                let notificationType = NOTIFICATION_TYPE.NEW_LIKE;
                let notificationSend = 'new like'
                let userName = fullName;
                let userId = productUserId;
                let message = await createNotificationMessage({ notificationSend, userId, usersfetchFcmToken, notificationType, userName });
                message.data.profileImages = !profileImages
                    ? null
                    : (profileImages.startsWith("http://") || profileImages.startsWith("https://"))
                        ? profileImages
                        : `${baseUrl}/uploads/${profileImages}`;

                message.data.meta = JSON.stringify({
                    productId: postId,
                    item_type: item_type
                });
                await sendNotification(message);
                return handleSuccess(res, 200, Msg.likeSuccess);
            } else {
                return handleSuccess(res, 200, Msg.likeSuccess);
            }
        }
    } catch (err) {
        return handleError(res, 500, Msg.serverError);
    }
};

exports.fetchAllMyFavoritePost = async (req, res) => {
    try {
        let userId = req.user.id;
        let favorites = await fetchAllMyFavoritePostModel(userId);

        if (!favorites.length) {
            return handleSuccess(res, 200, Msg.userHaveNoPosts, []);
        }

        const enrichedFavorites = await Promise.all(
            favorites.map(async (item) => {
                let details = null;
                let isItemtype = '';
                let baseData = {};

                if (item.item_type == 1) {
                    details = await fetchProductByProductIdOnAdminPanel(item.post_id);
                    isItemtype = 'products';
                } else if (item.item_type == 2) {
                    details = await fetchGigsByGigsId(item.post_id);
                    isItemtype = 'gigs';
                }

                if (details && details.length) {
                    details = details[0];
                    let userData = details.userId;
                    let result = await fetchUserByIds(userData);
                    let distance = 0;
                    if (details.location) {
                        let productLocation = null;
                        let userLocation = null;
                    }

                    baseData = {
                        ...details,
                        productsImages: details.productsImages ? JSON.parse(details.productsImages).map(i => `${baseUrl}/uploads/${i}`) : [],
                        links: details.links ? JSON.parse(details.links) : '',
                        images: details.images ? JSON.parse(details.images).map(i => `${baseUrl}/uploads/${i}`) : [],
                        fullName: result[0]?.fullName || null,
                        profileImages: result[0]?.profileImages ? `${baseUrl}/uploads/${result[0].profileImages}` : null,
                        distance: 0,
                        isItemtype,
                        createdAt: details.createdAt,

                        // ✅ Product-specific fields (always set, gigs will get null if not exist)
                        title: details.title || null,
                        keyNote: details.keyNote || null,
                        category: details.category || null,
                        subCategory: details.subCategory || null,
                        size: details.size || null,
                        depositeAmount: details.depositeAmount || 0,
                        rentDayPrice: details.rentDayPrice || 0,
                        isDepositeNegotiable: details.isDepositeNegotiable || 0,
                        isRentNegotiable: details.isRentNegotiable || 0,
                        tags: details.tags || null,
                        productStatus: details.productStatus || 0,
                        isRent: details.isRent || 0,
                        address: details.address || null,
                        city: details.city || null,
                        state: details.state || null,
                        pincode: details.pincode || null,
                        locality: details.locality || null,
                        isWeekly: details.isWeekly || 0,
                        isMonthly: details.isMonthly || 0,
                        isSell: details.isSell || 0,
                        postDescriptions: details.postDescriptions || null,
                        sellingPrice: details.sellingPrice || null,
                        categoryName: details.categoryName || null,
                        subcategoryName: details.subcategoryName || null,
                    };
                    let postId = details.id;
                    let isFavorite = await fetchFavoritePostByUsersId(userId, postId, item.item_type);
                    baseData.isFavorite = isFavorite.length > 0;

                    let isLike = await fetchLikePostByUsersId(userId, postId, item.item_type);
                    baseData.isLike = isLike.length > 0;

                    let totalLike = await fetchTotalLikeCount(postId, item.item_type);
                    baseData.totalLike = totalLike[0]?.totalLikes || 0;

                    let totalComments = await fetchTotalComments(postId, item.item_type);
                    baseData.totalComments = totalComments[0]?.totalComments || 0;
                }

                return baseData;
            })
        );

        return handleSuccess(res, 200, Msg.dataFoundSuccess, enrichedFavorites);
    } catch (err) {
        console.error(err);
        return handleError(res, 500, Msg.serverError);
    }
};

exports.fetchUserChatList = async (req, res) => {
    try {
        let userId = req.user.id;
        let fetchUserChat = await fetchParticularUserChatList(userId);

        if (!fetchUserChat.length) {
            return handleError(res, 200, Msg.userHaveNoChats);
        }
        fetchUserChat.map((item) => {
            item.profileImages = item.profileImages ? `${baseUrl}/uploads/${item.profileImages}` : null;
            return item;
        })
        return handleSuccess(res, 200, Msg.chatListFounded, fetchUserChat);
    } catch (err) {
        console.error(err);
        return handleError(res, 500, Msg.serverError);
    }
};
