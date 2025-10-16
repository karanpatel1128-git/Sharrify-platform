require('dotenv').config();
const { json } = require('body-parser');
const {
    addProduct,
    fetchAllProducts,
    fetchProductByProductId,
    editProducts,
    deleteProductById,
} = require('../models/productsModel')
const {
    isAdminExistsOrNot,
    fetchAllProductsOfUsers,
    fetchUsersByProductsId,
    approvedProductById,
    rejectProductById,
    fetchProductByProductIdOnAdminPanel,
    listOfSubCategoryByCategoryId,
    fetchAllSubCategoryList,
    fetchAllCategoryList,
    isCategoryExistsByCategoryName,
    createNewCategories,
    isSubCategoryExistsByName,
    createNewSubCategory,
    fetchAllUsers,
    editCategoriesByIds,
    editSubCategoriesByIds,
    duplicateSubCategory,
    addFeaturesByAdmin,
    fetchAllFeaturesByAdmin,
    editFeatureById,
    deleteFeatureById,
    addSearchSuggestionsByAdmin,
    fetchAllSearchSuggestionsByAdmin,
    editSearchSuggestionsById,
    deleteSearchSuggestionsById,

} = require('../models/adminModel')
const { Msg } = require('../utils/commonMessage')
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;
const { baseUrl } = require('../config/path');
const { log } = require('util');
const { fetchAllReportUsers } = require('./userController');
const { authenticateUser, capitalizeWords, sendNotification, createNotificationMessage } = require('../utils/helper')



exports.adminSignIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        const adminData = await isAdminExistsOrNot(email);
        return authenticateUser(res, email, password, adminData);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            success: false,
            message: 'Internal Server Error',
            error: error.message
        });
    }
};

exports.fetchAllReportedUsersData = async (req, res) => {
    try {
        let result = await fetchAllReportUsers(userId)
        if (result.length === 0) {
            return res.status(200).send({
                status: 400,
                success: false,
                message: Msg.dataFoundFailed,
                data: []
            })
        }
        result.map(async (item) => {
            let formattedTags = item.tags.replace(/[\[\]]/g, '').split(',').map(tag => tag.trim().replace(/^["']|["']$/g, ''));
            item.tags = formattedTags;
            if (item.productsImages) {
                let images = JSON.parse(item.productsImages);
                item.productsImages = images.map(image => `${baseUrl}/uploads/${image}`);
            } else {
                item.productsImages = [];
            }
            return item;
        })
        return res.status(200).send({
            status: 200,
            success: true,
            message: Msg.productFoundSuccess,
            data: result
        });

    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            message: error.message,
        });
    }
};

exports.fetchAllUsersProducts = async (req, res) => {
    try {
        let data = await fetchAllProductsOfUsers();
        if (!data.length) {
            return res.status(200).send({
                success: false,
                status: 200,
                message: Msg.productNotFound,
                data: []
            });
        }
        data.map((item) => {
            item.productsImages = item.productsImages
                ? JSON.parse(item.productsImages).map(i => `${baseUrl}/uploads/${i}`)
                : [];
            return item
        })
        return res.status(200).send({
            success: true,
            status: 200,
            message: Msg.productFoundSuccess,
            data: data
        });

    } catch (error) {
        console.error('>>>>>> Error:', error);
        return res.status(500).send({
            success: false,
            status: 500,
            message: Msg.serverError
        });
    }
};

exports.productApprovedAndReject = async (req, res) => {
    try {
        let { isDecision, productId } = req.body
        let status;
        let fetchUserDetailsByProductId = await fetchUsersByProductsId(productId)
        let usersfetchFcmToken = fetchUserDetailsByProductId[0].fcmToken
        let userId = fetchUserDetailsByProductId[0].id
        if (isDecision == 1) {
            status = 'Approved'
            let notificationType = 'approved'
            let notificationSend = 'Product_Approved'
            await approvedProductById(productId)
            let message = await createNotificationMessage({ notificationSend, userId, usersfetchFcmToken, notificationType });
            await sendNotification(message);
        } else {
            status = 'Reject'
            let notificationType = 'reject'
            let notificationSend = 'Product_Rejected'
            await rejectProductById(productId)
            let message = await createNotificationMessage({ notificationSend, userId, usersfetchFcmToken, notificationType });
            await sendNotification(message);
        }
        return res.status(200).send({
            success: true,
            status: 200,
            message: `Product ${status} Successfully`,
        });

    } catch (error) {
        console.error('>>>>>> Error:', error);
        return res.status(500).send({
            success: false,
            status: 500,
            message: Msg.serverError
        });
    }
};

exports.editProductsByAdmin = async (req, res) => {
    try {
        const productId = req.params.productId;
        let result = await fetchProductByProductId(productId);
        if (result.length === 0) {
            return res.status(400).send({
                success: false,
                status: 400,
                message: Msg.productNotFound,
                data: []
            });
        }

        let files = req.files;
        let productsImages = [];

        if (files && files.length > 0) {
            productsImages = files.map((file) => file.filename);
        }
        if (productsImages.length > 0) {
            req.body.productsImages = JSON.stringify(productsImages)
        }
        let editProductById = await editProducts(req.body, productId);
        if (editProductById.affectedRows === 1) {
            return res.status(200).send({
                success: true,
                status: 200,
                message: Msg.productUpdateSuccess
            });
        } else {
            return res.status(400).send({
                success: false,
                status: 400,
                message: Msg.productUpdateFailed
            });
        }
    } catch (error) {
        return res.status(500).send({
            success: false,
            status: 500,
            message: Msg.serverError
        });
    }
};

exports.fetchProductByProductId = async (req, res) => {
    try {
        let { productId } = req.query
        let result = await fetchProductByProductIdOnAdminPanel(productId);
        if (result.length === 0) {
            return res.status(200).send({
                success: false,
                status: 400,
                message: Msg.dataFoundFailed,
                data: []
            });
        }
        let productsImg = result[0].productsImages == null ? null : JSON.parse(result[0].productsImages)
        result[0].productsImages = productsImg.map(image => `${baseUrl}/uploads/${image}`);
        return res.status(200).send({
            success: true,
            status: 200,
            message: Msg.dataFoundSuccess,
            data: result[0]
        });

    } catch (error) {
        return res.status(500).send({
            success: false,
            status: 500,
            message: Msg.serverError
        });
    }
};

exports.createCategories = async (req, res) => {
    try {
        let { categoryName } = req.body
        let getCategoryName = await capitalizeWords(categoryName)
        let isExistsCategory = await isCategoryExistsByCategoryName(getCategoryName);
        if (isExistsCategory.length > 0) {
            return res.status(200).send({
                success: true,
                status: 200,
                message: "Category name is already in use. Please enter a new one.",
            });
        }
        let categoryCreated = await createNewCategories(getCategoryName)
        if (categoryCreated.insertId) {
            return res.status(200).send({
                success: true,
                status: 200,
                message: "Category created successfully:",
                data: categoryCreated[0]
            });
        } else {
            return res.status(200).send({
                success: false,
                status: 400,
                message: "Failed to create category.",
                data: []
            });
        }
    } catch (error) {
        console.log('>>>>>>error', error);
        return res.status(500).send({
            success: false,
            status: 500,
            message: Msg.serverError
        });
    }
};

exports.editCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { categoryName } = req.body;

        let isExistsCategory = await isCategoryExistsByCategoryName(categoryName);
        if (isExistsCategory.length > 0) {
            return res.status(400).send({
                success: true,
                status: 400,
                message: "Category name is already in use. Please enter a new one.",
            });
        }


        let editCategory = await editCategoriesByIds(categoryName, categoryId)
        if (editCategory.affectedRows) {
            return res.status(200).send({
                success: true,
                status: 200,
                message: 'Category updated successfully.',
            })
        } else {
            return res.status(400).send({
                success: false,
                status: 400,
                message: 'Failed to update category. Please try again later.',
            });
        }
    } catch (error) {
        console.error('Error updating category:', error);
        return res.status(500).send({
            success: false,
            message: 'Internal server error.',
        });
    }
};

exports.createSubCategories = async (req, res) => {
    try {
        let { subcategoryName, categoryId } = req.body;
        let formattedSubCategoryName = await capitalizeWords(subcategoryName);
        let isExistsSubCategory = await isSubCategoryExistsByName(formattedSubCategoryName, categoryId);
        if (isExistsSubCategory.length > 0) {
            return res.status(400).send({
                success: true,
                status: 400,
                message: "Subcategory name is already in use under this category. Please enter a new one."
            });
        }

        let subCategoryCreated = await createNewSubCategory(formattedSubCategoryName, categoryId);
        if (subCategoryCreated.insertId) {
            return res.status(201).send({
                success: true,
                status: 201,
                message: "Subcategory created successfully.",
                data: { id: subCategoryCreated.insertId, name: formattedSubCategoryName }
            });
        } else {
            return res.status(400).send({
                success: false,
                status: 400,
                message: "Failed to create subcategory.",
                data: []
            });
        }
    } catch (error) {
        console.error('Error creating subcategory:', error);
        return res.status(500).send({
            success: false,
            status: 500,
            message: "Internal server error."
        });
    }
};

exports.editSubCategory = async (req, res) => {
    try {
        const { subCategoryId } = req.params;
        const { subcategoryName, categoryId } = req.body;

        let isDuplicateSubCategoryExist = await duplicateSubCategory(subcategoryName, subCategoryId)
        if (isDuplicateSubCategoryExist.length > 0) {
            return res.status(400).send({
                success: true,
                status: 400,
                message: 'This subcategory name is already in use under this category. Please choose a different name.',
            });
        }
        let editSubCategory = await editSubCategoriesByIds(subcategoryName, categoryId, subCategoryId)

        if (editSubCategory.affectedRows) {
            return res.status(200).send({
                success: true,
                status: 200,
                message: 'Subcategory updated successfully.',
            })
        } else {
            return res.status(400).send({
                success: false,
                status: 400,
                message: 'Failed to update  sub category. Please try again later.',
            });
        }
    } catch (error) {
        console.error('Error updating subcategory:', error);
        return res.status(500).send({
            success: false,
            message: 'Internal server error.',
        });
    }
};

exports.fetchAllCategory = async (req, res) => {
    try {
        let result = await fetchAllCategoryList();
        if (result.length === 0) {
            return res.status(200).send({
                success: false,
                status: 200,
                message: Msg.dataFoundFailed,
                data: []
            });
        }
        return res.status(200).send({
            success: true,
            status: 200,
            message: Msg.dataFoundSuccess,
            data: result
        });

    } catch (error) {
        console.log('>>>>>>error', error);
        return res.status(500).send({
            success: false,
            status: 500,
            message: Msg.serverError
        });
    }
};

exports.fetchSubCategoryByCategoryId = async (req, res) => {
    try {
        let { id } = req.query
        let result = id ? await listOfSubCategoryByCategoryId(id) : await fetchAllSubCategoryList();
        if (result.length === 0) {
            return res.status(200).send({
                success: false,
                status: 200,
                message: Msg.noSubcategoryFound,
                data: []
            });
        }
        return res.status(200).send({
            success: true,
            status: 200,
            message: Msg.subCategoryFoundSuccess,
            data: result
        });
    } catch (error) {
        console.log('>>>>>>error', error);
        return res.status(500).send({
            success: false,
            status: 500,
            message: Msg.serverError
        });
    }
};

exports.fetchAllUsersDetails = async (req, res) => {
    try {
        let { page } = req.query;
        page = parseInt(page);
        let limit = parseInt(10)
        let result = await fetchAllUsers()
        if (!result || result.length === 0) {
            return res.status(200).send({
                success: false,
                status: 200,
                message: 'Users not fund',
                data: [],
                pagination: {}
            });
        }
        result.map(async (item) => {
            item.profileImages = item.profileImages ? `${baseUrl}/uploads/${item.profileImages}` : null
        }
        )
        let totalItems = result.length;
        let totalPages = Math.ceil(totalItems / limit);
        let paginatedResult = result.slice((page - 1) * limit, page * limit);
        return res.status(200).send({
            success: true,
            status: 200,
            message: 'User found successfully',
            data: paginatedResult,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalItems: totalItems,
                perPage: limit
            }
        });
    } catch (error) {
        console.log('>>>>>>error', error);
        return res.status(500).send({
            success: false,
            status: 500,
            message: Msg.serverError
        });
    }
};



exports.createProducts = async (req, res) => {
    try {
        let userId = 0
        let {
            title,
            descriptions,
            keyNote,
            location,
            category,
            subCategory,
            size,
            depositeAmount,
            rentDayPrice,
            isDepositeNegoitable,
            isRentNegoitable,
            tags,
            address,
            city,
            state,
            pincode,
            locality
        } = req.body;
        let files = req.files;
        let productsImages = [];
        if (files && files.length > 0) {
            productsImages = files.map((file) => file.filename);
        }
        let obj = {
            userId,
            title,
            descriptions,
            keyNote,
            location: JSON.stringify(location),
            category,
            subCategory,
            size,
            depositeAmount,
            rentDayPrice,
            isDepositeNegoitable,
            isRentNegoitable,
            tags: JSON.stringify(tags),
            productsImages: JSON.stringify(productsImages),
            productStatus: 1,
            address,
            city,
            state,
            pincode,
            locality
        }
        let result = await addProduct(obj)
        if (result.insertId) {
            return res.status(200).send({
                status: 200,
                success: true,
                productId: result.insertedId,
                message: Msg.productAddSuccess
            });
        } else {
            return res.status(200).send({
                status: 400,
                success: false,
                productId: null,
                message: Msg.productAddFailed
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            message: error.message,
        });
    }
};

exports.editProducts = async (req, res) => {
    try {
        const productId = req.params.productId;
        let result = await fetchProductByProductId(productId);

        if (result.length === 0) {
            return res.status(400).send({
                success: false,
                status: 400,
                message: Msg.dataFoundFailed,
                data: []
            });
        }

        if (result[0].isRent == 1) {
            return res.status(200).send({
                success: true,
                status: 200,
                message: Msg.productAlreadyRent,
                data: []
            });
        }

        let files = req.files;
        let productsImages = [];

        if (files && files.length > 0) {
            productsImages = files.map((file) => file.filename);
        }
        if (productsImages.length > 0) {
            req.body.productsImages = JSON.stringify(productsImages)
        }
        req.body.productStatus = 1;
        let editProductById = await editProducts(req.body, productId);
        if (editProductById.affectedRows === 1) {
            return res.status(200).send({
                success: true,
                status: 200,
                message: Msg.productUpdateSuccess
            });
        } else {
            return res.status(400).send({
                success: false,
                status: 400,
                message: Msg.productUpdateFailed
            });
        }
    } catch (error) {
        console.error('>>>>>> Error:', error);
        return res.status(500).send({
            success: false,
            status: 500,
            message: Msg.serverError
        });
    }
};

exports.deleteUserProducts = async (req, res) => {
    try {
        const productId = req.params.productId;
        let result = await fetchProductByProductId(productId);
        if (result.length === 0) {
            return res.status(400).send({
                success: false,
                status: 400,
                message: Msg.dataFoundFailed,
                data: []
            });
        }
        if (result[0].isRent == 1) {
            return res.status(200).send({
                success: true,
                status: 200,
                message: Msg.productAlreadyRent,
                data: []
            });
        }
        let deleteProducts = await deleteProductById(productId);

        if (deleteProducts.affectedRows > 0) {
            return res.status(200).send({
                success: true,
                status: 200,
                message: Msg.productDeleteSuccess
            });
        } else {
            return res.status(200).send({
                success: false,
                status: 400,
                message: Msg.productNotFound
            });
        }

    } catch (error) {
        console.log('>>>>>>error', error);
        return res.status(500).send({
            success: false,
            status: 500,
            message: Msg.serverError
        });
    }
};



exports.createFeatures = async (req, res) => {
    try {
        // let images = req.file ? `${baseUrl}/uploads/${req.file.filename}` : null
        // req.body.images = images
        let result = await addFeaturesByAdmin(req.body);
        if (result.insertedId === 0) {
            return res.status(200).send({
                success: false,
                status: 200,
                message: 'Failed To Features Add',
            });
        }
        return res.status(200).send({
            success: true,
            status: 200,
            message: 'Features Added Successfully',
        });
    } catch (error) {
        console.log('>>>>>>error', error);
        return res.status(500).send({
            success: false,
            status: 500,
            message: Msg.serverError
        });
    }
};

exports.fetchAllFeaturesByAdmin = async (req, res) => {
    try {
        let result = await fetchAllFeaturesByAdmin()
        if (!result || result.length === 0) {
            return res.status(200).send({
                success: false,
                status: 200,
                message: 'Features Not Found',
                data: [],
            });
        }
        return res.status(200).send({
            success: true,
            status: 200,
            message: 'Features Found Successfully',
            data: result,
        });
    } catch (error) {
        console.log('>>>>>>error', error);
        return res.status(500).send({
            success: false,
            status: 500,
            message: Msg.serverError
        });
    }
};

exports.editFeaturesByFeatureId = async (req, res) => {
    try {
        const featureId = req.params.id;
        let editFeaturesById = await editFeatureById(req.body, featureId);
        if (editFeaturesById.affectedRows === 1) {
            return res.status(200).send({
                success: true,
                status: 200,
                message: `Features Updated Successfully`
            });
        } else {
            return res.status(400).send({
                success: false,
                status: 400,
                message: 'Features Update To Failed'
            });
        }
    } catch (error) {
        console.error('>>>>>> Error:', error);
        return res.status(500).send({
            success: false,
            status: 500,
            message: Msg.serverError
        });
    }
};

exports.deleteFeatureByIds = async (req, res) => {
    try {
        const featureId = req.params.id;
        let deleteProducts = await deleteFeatureById(featureId);
        if (deleteProducts.affectedRows > 0) {
            return res.status(200).send({
                success: true,
                status: 200,
                message: 'Feature Deleted Successfully'
            });
        } else {
            return res.status(200).send({
                success: false,
                status: 400,
                message: 'Feature Not Deleted'
            });
        }

    } catch (error) {
        console.log('>>>>>>error', error);
        return res.status(500).send({
            success: false,
            status: 500,
            message: Msg.serverError
        });
    }
};


exports.createSearchSuggestions = async (req, res) => {
    try {
        // let images = req.file ? `${baseUrl}/uploads/${req.file.filename}` : null
        // req.body.images = images
        let result = await addSearchSuggestionsByAdmin(req.body);
        if (result.insertedId === 0) {
            return res.status(200).send({
                success: false,
                status: 200,
                message: 'Failed To Add Search Suggestions',
            });
        }
        return res.status(200).send({
            success: true,
            status: 200,
            message: 'Search Suggestions Added Successfully',
        });
    } catch (error) {
        console.log('>>>>>>error', error);
        return res.status(500).send({
            success: false,
            status: 500,
            message: Msg.serverError
        });
    }
};

exports.fetchAllSuggestionsByAdmin = async (req, res) => {
    try {
        let result = await fetchAllSearchSuggestionsByAdmin();
        if (!result || result.length === 0) {
            return res.status(200).send({
                success: false,
                status: 200,
                message: 'Search Suggestions Not Found',
                data: [],
            });
        }
        return res.status(200).send({
            success: true,
            status: 200,
            message: 'Search Suggestions Found Successfully',
            data: result,
        });
    } catch (error) {
        console.log('>>>>>>error', error);
        return res.status(500).send({
            success: false,
            status: 500,
            message: Msg.serverError
        });
    }
};

exports.editSearchSuggestionsById = async (req, res) => {
    try {
        const suggestionsId = req.params.id;
        let editSuggestionsById = await editSearchSuggestionsById(req.body, suggestionsId);
        if (editSuggestionsById.affectedRows === 1) {
            return res.status(200).send({
                success: true,
                status: 200,
                message: `Search Suggestions Updated Successfully`
            });
        } else {
            return res.status(400).send({
                success: false,
                status: 400,
                message: 'Search Suggestions Update To Failed'
            });
        }
    } catch (error) {
        console.error('>>>>>> Error:', error);
        return res.status(500).send({
            success: false,
            status: 500,
            message: Msg.serverError
        });
    }
};

exports.deleteSearchSuggestionsByIds = async (req, res) => {
    try {
        const id = req.params.id;
        let deleteSearchSuggestions = await deleteSearchSuggestionsById(id);
        if (deleteSearchSuggestions.affectedRows > 0) {
            return res.status(200).send({
                success: true,
                status: 200,
                message: 'Search Suggestions Successfully'
            });
        } else {
            return res.status(200).send({
                success: false,
                status: 400,
                message: 'Search Suggestions Not Deleted'
            });
        }

    } catch (error) {
        console.log('>>>>>>error', error);
        return res.status(500).send({
            success: false,
            status: 500,
            message: Msg.serverError
        });
    }
};


// -------------------------update new code with new versions using responseHandler---------------------------------------//
