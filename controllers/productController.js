require('dotenv').config();
const { json } = require('body-parser');
const {
    addProduct,
    fetchAllProducts,
    fetchProductByProductId,
    editProducts,
    deleteProductById,
    fetchAllNotDeletedProductsProducts,
    addUsersGigs,
    fetchGigsByGigsId,
    fetchGigsByUserId,
    editGigsByGigsId,
    deleteGigsyId,

} = require('../models/productsModel')

const { fetchChatByUsersIdAnotherUsersId, fetchUserByIds, fetchAllUsersGigs, fetchFavoritePostByUsersId, fetchLikePostByUsersId, fetchTotalLikeCount, fetchTotalComments } = require('../models/usersModel')
const { Msg } = require('../utils/commonMessage')
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;
const { baseUrl } = require('../config/path');
const { log } = require('util');
const { handleSuccess, handleError } = require('../utils/responseHandler');


exports.createProducts = async (req, res) => {
    try {
        let userId = req.user.id
        let { title, descriptions, keyNote, location, category, subCategory, size, depositeAmount, rentDayPrice, isDepositeNegoitable,
            isRentNegoitable, tags, address, city, state, pincode, locality, isWeekly, isMonthly, isRent, isSell, postDescriptions, sellingPrice } = req.body;
        let files = req.files;
        let productsImages = [];
        if (files && files.length > 0) {
            productsImages = files.map((file) => file.filename);
        }
        let obj = {
            userId, title, descriptions, keyNote, location: JSON.stringify(location), category, subCategory, size, depositeAmount,
            rentDayPrice, isDepositeNegoitable, isRentNegoitable, tags: JSON.stringify(tags), productsImages: JSON.stringify(productsImages),
            productStatus: 1, address, city, state, pincode, locality, isWeekly, isMonthly, isRent, isSell, postDescriptions, sellingPrice
        }
        let result = await addProduct(obj)
        if (result.insertId) {
            return handleSuccess(res, 200, Msg.productAddSuccess, { productId: result.insertedId });
        } else {
            return handleError(res, 400, Msg.productAddFailed);
        }
    } catch (error) {
        return handleError(res, 500, Msg.serverError);
    }
}

exports.fetchAllProductsByUsersId = async (req, res) => {
    try {
        let userId = req.user.id
        console.log('userId', userId);

        let result = await fetchAllNotDeletedProductsProducts(userId)
        console.log('result', result);

        if (result.length === 0) {
            return handleSuccess(res, 200, Msg.dataFoundFailed, []);
        }
        result.map(async (item) => {
            let formattedTags = item.tags.replace(/[\[\]]/g, '').split(',').map(tag => tag.trim().replace(/^["']|["']$/g, ''));
            item.tags = formattedTags;
            item.isItemtype = 'product';
            if (item.productsImages) {
                let images = JSON.parse(item.productsImages);
                item.productsImages = images.map(image => `${baseUrl}/uploads/${image}`);
            } else {
                item.productsImages = [];
            }
            console.log('item', item);

            return item;
        })
        console.log('result>>>>>>>>.', result);

        let userGigs = await fetchGigsByUserId(userId)
        if (userGigs && Array.isArray(userGigs) && userGigs.length > 0) {
            const gigsWithType = userGigs.map((item) => {
                item.links = JSON.parse(item.links)
                let images = JSON.parse(item.images)
                item.images = images.map(image => `${baseUrl}/uploads/${image}`);
                item.location = JSON.parse(item.location)
                item.isItemtype = 'gigs'
                return item
            })
            result.push(...gigsWithType);
        }
        console.log('result', result);
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return handleSuccess(res, 200, Msg.productFoundSuccess, result);
    } catch (error) {
        return handleError(res, 500, error.message);
    }
};

exports.fetchProductByProductId = async (req, res) => {
    try {
        let userId = req.user.id
        let { productId } = req.query
        let result = await fetchProductByProductId(productId);
        if (result.length === 0) {
            return handleError(res, 400, Msg.dataFoundFailed);
        }
        let isChat = await fetchChatByUsersIdAnotherUsersId(userId, result[0].userId)
        let userDetail = await fetchUserByIds(result[0].userId)
        let productsImg = result[0].productsImages == null ? null : JSON.parse(result[0].productsImages)
        result[0].productsImages = productsImg.map(image => `${baseUrl}/uploads/${image}`);
        result[0].isChat = isChat.length > 0 ? true : false;
        result[0].chatId = isChat.length > 0 ? isChat[0].id : null;
        result[0].userName = userDetail[0].fullName;
        result[0].userProfile = userDetail[0].profileImages ? `${baseUrl}/uploads/${userDetail[0].profileImages}` : null;
        result[0].createdAt = userDetail[0].createdAt;
        result[0].rating = userDetail[0].rating == null ? 0 : userDetail[0].rating;
        let isFavorite = await fetchFavoritePostByUsersId(userId, productId, 1)
        result[0].isFavorite = isFavorite.length > 0 ? true : false
        let isLike = await fetchLikePostByUsersId(userId, productId, 1)
        let totalLike = await fetchTotalLikeCount(productId, 1)
        result[0].totalLike = totalLike[0].totalLikes
        result[0].isLike = isLike.length > 0 ? true : false
        let totalComments = await fetchTotalComments(productId, 1)
        result[0].totalComments = totalComments[0].totalComments
        return handleSuccess(res, 200, Msg.dataFoundSuccess, result[0]);
    } catch (error) {
        return handleError(res, 500, error.message);
    }
};

exports.editProducts = async (req, res) => {
    try {
        const productId = req.params.productId;
        let result = await fetchProductByProductId(productId);
        if (result.length === 0) {
            return handleError(res, 400, Msg.dataFoundFailed);
        }
        let files = req.files;
        let productsImages = [];

        if (files && files.length > 0) {
            productsImages = files.map((file) => file.filename);
        }
        if (productsImages.length > 0) {
            req.body.productsImages = JSON.stringify(productsImages);
        }
        req.body.productStatus = 1;
        req.body.location = JSON.stringify(req.body.location);
        req.body.tags = JSON.stringify(req.body.tags);
        let editProductById = await editProducts(req.body, productId);
        if (editProductById.affectedRows === 1) {
            return handleSuccess(res, 200, Msg.productUpdateSuccess);
        } else {
            return handleError(res, 400, Msg.productUpdateFailed);
        }
    } catch (error) {
        console.error('>>>>>> Error:', error);
        return handleError(res, 500, Msg.serverError);
    }
};

exports.deleteUserProducts = async (req, res) => {
    try {
        const productId = req.params.productId;
        let result = await fetchProductByProductId(productId);

        if (result.length === 0) {
            return handleError(res, 200, Msg.dataFoundFailed);
        }

        if (result[0].isRent == 1) {
            return handleSuccess(res, 200, Msg.productAlreadyRent, []);
        }

        let deleteProducts = await deleteProductById(productId);
        if (deleteProducts.affectedRows > 0) {
            return handleSuccess(res, 200, Msg.productDeleteSuccess);
        } else {
            return handleError(res, 200, Msg.productNotFound);
        }
    } catch (error) {
        console.log('>>>>>>error', error);
        return handleError(res, 500, Msg.serverError);
    }
};

exports.addGigs = async (req, res) => {
    try {
        let { id, location, address } = req.user
        let userId = id
        let { links, descriptions } = req.body;
        let files = req.files;
        let images = [];
        if (files && files.length > 0) {
            images = files.map((file) => file.filename);
        }
        let obj = { userId, links: JSON.stringify(links), images: JSON.stringify(images), location, descriptions, address }
        let result = await addUsersGigs(obj)
        if (result.insertId) {
            return handleSuccess(res, 200, Msg.gigsAddSuccess, { gigId: result.insertId });
        } else {
            return handleError(res, 400, Msg.gigsAddFailed);
        }
    } catch (error) {
        return handleError(res, 500, Msg.serverError);
    }
}

exports.editUsersGigs = async (req, res) => {
    try {
        const { gigsId } = req.params;
        let result = await fetchGigsByGigsId(gigsId);
        if (result.length === 0) {
            return handleError(res, 400, Msg.dataFoundFailed);
        }
        let files = req.files;
        if (files && files.length > 0) {
            productsImages = files.map((file) => file.filename);
        }
        req.body.images = JSON.stringify(productsImages);
        if (req.body.links) {
            req.body.links = JSON.stringify(req.body.links);
        }

        let editProductById = await editGigsByGigsId(req.body, gigsId);
        if (editProductById.affectedRows === 1) {
            return handleSuccess(res, 200, 'Gigs Updated Succesfuly');
        } else {
            return handleError(res, 400, 'Failed To Update gigs');
        }
    } catch (error) {
        console.error('>>>>>> Error:', error);
        return handleError(res, 500, Msg.serverError);
    }
};

exports.deleteUserGigs = async (req, res) => {
    try {
        const gigsId = req.params.gigsId;
        let result = await fetchGigsByGigsId(gigsId);

        if (result.length === 0) {
            return handleError(res, 200, Msg.dataFoundFailed);
        }

        let gigsDeletedSuccess = await deleteGigsyId(gigsId);
        if (gigsDeletedSuccess.affectedRows > 0) {
            return handleSuccess(res, 200, Msg.gigsDeleteSuccess);
        } else {
            return handleError(res, 200, Msg.gigsNotFound);
        }
    } catch (error) {
        console.log('>>>>>>error', error);
        return handleError(res, 500, Msg.serverError);
    }
};

exports.fetchGigsById = async (req, res) => {
    try {
        let userId = req.user.id
        let { gigsId } = req.query
        let result = await fetchGigsByGigsId(gigsId);
        if (result.length === 0) {
            return handleError(res, 400, Msg.dataFoundFailed, []);
        }
        let userDetail = await fetchUserByIds(result[0].userId)
        let productsImg = result[0].images == null ? null : JSON.parse(result[0].images)
        result[0].gigImages = productsImg.map(image => `${baseUrl}/uploads/${image}`);
        result[0].userName = userDetail[0].fullName;
        result[0].userProfile = userDetail[0].profileImages ? `${baseUrl}/uploads/${userDetail[0].profileImages}` : null;
        result[0].createdAt = userDetail[0].createdAt;
        result[0].rating = userDetail[0].rating == null ? 0 : userDetail[0].rating;
        let isFavorite = await fetchFavoritePostByUsersId(userId, gigsId, 2)
        result[0].isFavorite = isFavorite.length > 0 ? true : false
        let isLike = await fetchLikePostByUsersId(userId, gigsId, 2)
        result[0].isLike = isLike.length > 0 ? true : false
        let totalLike = await fetchTotalLikeCount(gigsId, 2)
        result[0].totalLike = totalLike[0].totalLikes
        let totalComments = await fetchTotalComments(gigsId, 2)
        result[0].totalComments = totalComments[0].totalComments
        return handleSuccess(res, 200, Msg.dataFoundSuccess, result[0]);
    } catch (error) {
        return handleError(res, 500, error.message);
    }
};