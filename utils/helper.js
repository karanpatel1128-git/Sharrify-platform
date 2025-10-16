const { baseUrl } = require('../config/path');

// const admin = require('firebase-admin');
// const serviceAccount = require('../utils/serviceAccountKey.json');
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });
const { msg } = require('../utils/commonMessage')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const {
    fetchChatDetailsById,
    insertNotification,
    fetchUserByIds,

} = require('../models/usersModel')

const {
    updateAdminProfile
} = require('../models/adminModel')

const admin = require('../utils/constant').admin


exports.haversineDistance = async (coords1, coords2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371;
    const lat1 = coords1[0], lon1 = coords1[1];
    const lat2 = coords2[0], lon2 = coords2[1];

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
};

exports.sendPushNotification = async (userId, token, message) => {
    try {
        let chatsId = message.chat_id
        let [chatDetails] = await fetchChatDetailsById(message.chat_id)
        let buyerId = chatDetails.user1_id ? chatDetails.user1_id.toString() : "1";
        let userDetails = await fetchUserByIds(message.sender_id)
        let name = userDetails[0].fullName
        let productImages = JSON.parse(chatDetails.productsImages)
        let type = 'chat'
        const payload = {
            notification: {
                title: `New Message From ${name}`,
                body: typeof message === "string" ? message : message.message,
            },
            data: {
                productId: chatDetails.productId ? chatDetails.productId.toString() : "1",
                productOwnerId: chatDetails.userId ? chatDetails.userId.toString() : "1",
                productBuyerId: chatDetails.user1_id ? chatDetails.user1_id.toString() : "1",
                productName: chatDetails.title ? chatDetails.title.toString() : "null",
                productImages: productImages.length > 0 ? `${baseUrl}/uploads/${productImages[0]}` : [],
                type: type,
                chatId: message.chat_id ? message.chat_id.toString() : "",
                buyerFullName: userDetails[0]?.fullName ? userDetails[0].fullName.toString() : ""
            },
            token: token,
        };
        const response = await admin.messaging().send(payload);
        const notificationData = {
            title: `Message From ${name}`,
            body: typeof message === "string" ? message : message.message,
            image: null,
            isMarkRead: false,
            notificationType: type,
            userId,
            chatsId,
            meta: JSON.stringify(payload.data)
        };
        let isInsert = await insertNotification(notificationData)
        if (isInsert.insertId) {
            return {
                success: true,
                message: 'Notification sent successfully',
                data: response,
            };
        }
        return {
            success: true,
            message: 'Notification failed',
            data: response,
        };
    } catch (error) {
        return {
            success: false,
            message: 'Notification failed',
            error: error.message,
        };
    }
};

exports.generateToken = (user) => {
    return jwt.sign(
        {
            data: {
                id: user.id,
            },
        },
        process.env.AUTH_SECRETKEY,
        { expiresIn: "1d" }
    );
};

exports.authenticateUser = async (res, email, password, adminData) => {
    try {
        if (!adminData || adminData.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found',
            });
        }

        const user = adminData[0];

        if (email !== user.email) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Email',
            });
        }

        const match = bcrypt.compareSync(password, user.password);
        if (!match) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Password',
            });
        }
        // Call generateToken correctly
        const jwt_token = exports.generateToken(user);

        return res.status(200).json({
            success: true,
            message: 'Login successfully',
            token: jwt_token,
        });

    } catch (error) {
        console.error('Authentication Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
};

exports.createNotificationMessage = async ({
    notificationSend,
    userId,
    usersfetchFcmToken,
    notificationType,
    userName
}) => {
    let notification = {};
    switch (notificationSend) {
        case 'Product_Approved':
            notification = {
                title: "Product Approved",
                body: "Congratulations! Your product has been successfully approved by the sharrify team, it is now avaiable for rent..."
            };
            break;


        case 'Product_Rejected':
            notification = {
                title: "Product Rejection",
                body: "We're sorry! Your product has been rejected by the sharrify team, Please review the guidelines and try submitting again..."
            };
            break;

        case 'new message':
            notification = {
                title: userName,
                body: `${userName} sent you a message 💬`
            };
            break;

        case 'new like':
            notification = {
                title: `${userName} liked your post ❤️`,
                body: `${userName} liked your post ❤️`
            };
            break;

        case 'new comment':
            notification = {
                title: `${userName} commented on your post 💬`,
                body: `${userName} commented on your post 💬`
            };
            break;

        default:
            notification = {
                title: `Notification from Sharrify`,
                body: `You have a new activity! Open the app to check.`
            };
            break;
    }
    return {
        notification,
        data: {
            userId: userId ? userId.toString() : "1",
            type: notificationType != null ? notificationType.toString() : "0",
        },
        token: usersfetchFcmToken || "",
    };

};

exports.sendNotification = async (message) => {
    try {
        const metaData = message.data.meta || {};
        const notificationData = {
            title: message.notification.title,
            body: message.notification.body,
            image: message.data.profileImages,
            isMarkRead: false,
            notificationType: message.data.type,
            userId: message.data.userId,
            // meta: JSON.stringify(metaData),
            meta: metaData,

        };
        let isInsert = await insertNotification(notificationData)
        try {
            const response = await admin.messaging().send(message);
        } catch (e) {
            console.error('FCM ERROR:', e);
        }
        if (isInsert.insertId) {
            return {
                success: true,
                message: 'Notification sent successfully',
                data: response,
            };
        }
        return {
            success: true,
            message: 'Notification failed',
            data: response,
        };
    } catch (error) {
        return {
            success: false,
            message: 'Notification failed',
            error: error.message,
        };
    }
};

exports.capitalizeWords = async (categoryName) => {
    return categoryName.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
}
