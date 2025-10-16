const admin = require("firebase-admin");
const dotenv = require("dotenv");

dotenv.config();

const serviceAccount = require("../utils/serviceAccountKey.json"); // Ensure the correct path

// Initialize Firebase Admin SDK only once
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
} 

const AUTH_PROVIDER = {
    GOOGLE_AUTH: 'google',
    APPLE_AUTH: 'apple',
};

// Authorization Constants
const AUTHORIZATION = 'authorization';

// Error constants
const ERROR_TYPES = {
    TOKEN_EXPIRED_ERROR: 'TokenExpiredError',
    JWT_ERROR: 'JsonWebTokenError',
};

const NOTIFICATION_TYPE = {
    NEW_MESSAGE: 1,
    NEW_COMMENT: 2,
    NEW_LIKE: 3,
};

module.exports = { admin, AUTH_PROVIDER, AUTHORIZATION, ERROR_TYPES, NOTIFICATION_TYPE };
