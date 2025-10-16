const express = require('express');
const userRoutes = require('./userRoutes');
const productRoutes = require('./productRoutes');
const adminRoutes = require('./adminRoutes');


const router = express.Router();

// Use the userRoutes with '/userRoutes' prefix
router.use('/userRoutes', userRoutes);
router.use('/productRoutes', productRoutes);
router.use('/adminRoutes', adminRoutes);

module.exports = router;
