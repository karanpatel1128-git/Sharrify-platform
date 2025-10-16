const userController = require('./userController');
const productController = require('./productController');
const adminController = require('./adminController');



const controller = {
    userController: userController,
    productController: productController,
    adminController: adminController
};

module.exports = controller;