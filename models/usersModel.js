const db = require('../config/db')

exports.fetchUserByMobileNumber = async (mobileNumber) => {
    const result = await db.query('SELECT * FROM tbl_users WHERE mobileNumber = ?', [mobileNumber]);
    return result;
};

exports.fetchUserByIds = async (id) => {
    const result = await db.query(`SELECT *,DATE_FORMAT(dob, '%d-%m-%Y') AS dob FROM tbl_users WHERE id = ?`, [id]);
    return result;
};

exports.findExistsUserFcmToken = async (fcmToken, mobileNumber) => {
    const result = await db.query(
        'UPDATE tbl_users SET fcmToken = ? WHERE mobileNumber = ?',
        [fcmToken, mobileNumber]
    );
    return result;
};

exports.addUsersByMobileNumber = async (data) => {
    const result = await db.query(
        'INSERT INTO tbl_users (mobileNumber) VALUES (?)',
        [data.mobileNumber]
    );
    return result;
};

exports.editUsersProfile = async (obj, userId) => {
    let fields = [];
    let values = [];
    for (let key in obj) {
        if (obj[key] !== undefined) {
            fields.push(`${key} = ?`);
            values.push(obj[key]);
        }
    }
    if (fields.length === 0) {
        throw new Error("No valid fields to update");
    }
    values.push(userId);
    const query = `UPDATE tbl_users SET ${fields.join(", ")} WHERE id = ?`;
    const result = await db.query(query, values);
    return result;
};

exports.fetchAllCategoryList = async () => {
    const result = await db.query('SELECT * FROM tbl_category ORDER BY createdAt DESC');
    return result;
};

exports.listOfSubCategoryByCategoryId = async (id) => {
    const result = await db.query('SELECT * FROM tbl_subcategory WHERE categoryId = ?', [id]);
    return result;
};

exports.fetchAllSubCategoryList = async () => {
    const result = await db.query('SELECT * FROM tbl_subcategory');
    return result;
};

// exports.fetchOnlyOtherUsersProducts = async (userId, search) => {
//     const result = await db.query(
//         `SELECT 
//             tbl_products.id,
//             title,
//             userId,
//             descriptions,
//             keyNote,
//             location,
//             productsImages,
//             categoryName,
//             subcategoryName,
//             tbl_products.locality as address,
//             tbl_products.depositeAmount,
//             tbl_products.rentDayPrice,
//             tbl_category.id as category,
//             tbl_subcategory.id as subCategory
//         FROM 
//             tbl_products
//         LEFT JOIN 
//             tbl_category 
//         ON 
//             tbl_category.id = tbl_products.category
//         LEFT JOIN 
//             tbl_subcategory 
//         ON 
//             tbl_subcategory.id = tbl_products.subCategory
//         WHERE 
//             isRent = 0 
//             AND isDeleted = 0
//             AND productStatus = 1 
//             ${search ? `AND (
//                 title LIKE ? OR  
//                 keyNote LIKE ? OR 
//                 categoryName LIKE ? OR 
//                 subcategoryName LIKE ?
//             )` : ''}`,
//         search ? [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`] : [userId]
//     );
//     return result;
// };

exports.fetchOnlyOtherUsersProducts = async (userId, search) => {
    const query = `
        SELECT 
            tbl_products.id,
            title,
            userId,
            descriptions,
            keyNote,
            location,
            productsImages,
            categoryName,
            subcategoryName,
            tbl_products.isRent,
            tbl_products.isSell,
            tbl_products.locality AS address,
            tbl_products.depositeAmount,
            tbl_products.rentDayPrice,
            tbl_category.id AS category,
            tbl_subcategory.id AS subCategory,
            tbl_products.updatedAt AS updatedAt,
            tbl_products.createdAt AS createdAt,
            tbl_products.postDescriptions As postDescriptions

        FROM 
            tbl_products
        LEFT JOIN 
            tbl_category ON tbl_category.id = tbl_products.category
        LEFT JOIN 
            tbl_subcategory ON tbl_subcategory.id = tbl_products.subCategory
        WHERE 
            isDeleted = 0
            AND productStatus = 1
            ${search ? `AND (
                title LIKE ? OR  
                keyNote LIKE ? OR 
                categoryName LIKE ? OR 
                subcategoryName LIKE ?
            )` : ''}
    `;

    const params = search
        ? [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`]
        : [];

    const result = await db.query(query, params);
    return result;
};


exports.fetchUsersChatsWithId = async (userId) => {
    return await db.query(`SELECT * FROM tbl_users WHERE id = ${userId}`)
};

exports.insertUsersSocketId = async (socketId, userId) => {
    return await db.query(`
        UPDATE tbl_users 
        SET socket_id = '${socketId}' 
        WHERE id = ${userId}
    `);
};


exports.fetchMessagesById = async (messageId) => {
    return await db.query(`SELECT * FROM tbl_message WHERE id = ${messageId} ORDER BY createdAt DESC`)
};

exports.fetchChatsWithId = async (chatId) => {
    return await db.query(`SELECT * FROM tbl_chat WHERE id = ${chatId} ORDER BY createdAt DESC`)
};


exports.getOrCreateChat = async (user1Id, user2Id, productId, callback) => {
    return await db.query(`SELECT * FROM tbl_chat WHERE ((user1_id = ${user1Id} AND user2_id = ${user2Id}) OR (user1_id = ${user2Id} AND user2_id = ${user1Id})) AND productId='${productId}' AND isActive = 1`)
};

exports.CreateChat = async (user1Id, user2Id, productId) => {
    return await db.query(`INSERT INTO tbl_chat (user1_id, user2_id,productId) VALUES (${user1Id}, ${user2Id},${productId})`)
};

exports.saveMessage = async (chatId, senderId, message, callback) => {
    return await db.query(`INSERT INTO tbl_message (chat_id, sender_id, message) VALUES (${chatId}, ${senderId}, '${message}')`);
};

exports.fetchMessages = async (chatId) => {
    return await db.query(`SELECT * FROM tbl_message WHERE chat_id = ${chatId}`)
};

exports.fetchConnectedUsers = async (id) => {
    return await db.query(`
        SELECT 
            c.id AS chat_id,
            c.user1_id AS buyerId,
            c.productId,
            c.user2_id AS sellerId,
            m.message AS last_message,
            m.createdAt AS last_message_time,
            m.sender_id AS last_message_sender,
            m.status AS last_message_status,
            p.*
        FROM tbl_chat c
        LEFT JOIN tbl_products p ON p.id = c.productId
        LEFT JOIN tbl_message m ON m.id = (
            SELECT m1.id 
            FROM tbl_message m1 
            WHERE m1.chat_id = c.id 
            ORDER BY m1.createdAt DESC, m1.id DESC 
            LIMIT 1
        )
        WHERE 
            (c.user1_id = ? OR c.user2_id = ?) 
            AND c.isActive = 1
        ORDER BY m.createdAt DESC
    `, [id, id]);
}

exports.fetchChatDetailsById = async (chatId) => {
    return await db.query(`SELECT p.userId,p.title,p.productsImages,c.* FROM tbl_chat c 
JOIN tbl_products p ON p.id=c.productId WHERE c.id = ${chatId}`)
};

exports.chatDeleteById = async (id) => {
    return await db.query('UPDATE tbl_chat SET isActive = 0 WHERE id = ?', [id]);
};

exports.fetchProductAccordingToCategory = async (id) => {
    return await db.query(`SELECT * FROM tbl_products WHERE category  = ?`, [id]);
};

exports.fetchProductAccordingToSubCategory = async (id) => {
    return await db.query(`SELECT * FROM tbl_products WHERE subCategory  = ?`, [id]);
};

exports.reportToUsersProducts = async (data) => {
    return db.query("INSERT INTO tbl_reportedusers SET ?", [data]);
};

exports.fetchAllFeatures = async () => {
    return await db.query(`SELECT * FROM tbl_features `);
};

exports.markMessageAsRead = async (chatId, userId) => {
    try {
        const query = `
              UPDATE tbl_message 
              SET status = 'read' 
              WHERE chat_id = ? 
              AND sender_id != ? 
              AND status = 'unread'`;

        await db.query(query, [chatId, userId]);
    } catch (error) {
        throw error;
    }
};

exports.getUnreadMessages = async (chatId) => {
    try {
        const query = `SELECT * FROM tbl_message WHERE chat_id = ? AND status = 'unread'`;
        const [rows] = await db.query(query, [chatId]);
        return rows;
    } catch (error) {
        console.error("Error fetching unread messages:", error);
        return [];
    }
};

exports.fetchChatByUsersIdAnotherUsersId = async (user1Id, user2Id) => {
    return await db.query(`SELECT * FROM tbl_chat WHERE ((user1_id = ${user1Id} AND user2_id = ${user2Id}) OR (user1_id = ${user2Id} AND user2_id = ${user1Id}))`)
};

exports.insertNotification = async (data) => {
    return db.query("INSERT INTO tbl_notifications SET ?", [data]);
};

exports.fetchAllNotificationsModel = async (id) => {
    return await db.query(`SELECT * FROM tbl_notifications where userId=? ORDER BY createdAt DESC`, [id]);
};

exports.clearAllChatsModel = async (id) => {
    return await db.query(`DELETE FROM tbl_notifications where userId=?`, [id]);
};

exports.deleteAccountByUserId = async (id) => {
    return await db.query(`DELETE FROM tbl_users where id=?`, [id]);
};

exports.clearNotificationById = async (id) => {
    return await db.query(`DELETE FROM tbl_notifications where id=?`, [id]);
};

exports.fetchUserByEmail = async (uid, email) => {
    const result = await db.query("SELECT * FROM tbl_users WHERE uid = ? OR email = ?", [uid, email]);
    return result;
};

exports.socialAuthanticationInserted = async (data) => {
    return db.query("INSERT INTO tbl_users SET ?", [data]);
};

exports.createBlocked = async (data) => {
    return db.query("INSERT INTO tbl_blockedusers SET ?", [data]);
};

exports.unblockedToUsers = async (id, userId) => {
    return db.query(` DELETE FROM tbl_blockedusers WHERE blocked_from=? AND blocked_to=?`, [id, userId]);
};

exports.fetchBlockedListUsers = async (id) => {
    return db.query(`SELECT * FROM tbl_blockedusers WHERE blocked_from = ? ORDER BY createdAt DESC`, [id]);
};

exports.fetchBlockedUsersDetailed = async (blockedToIds) => {
    if (!blockedToIds.length) return [];
    const placeholders = blockedToIds.map(() => '?').join(',');
    return db.query(`SELECT * FROM tbl_users WHERE id IN (${placeholders})`, blockedToIds);
};

exports.fetchUserByMobileNumberAndUsersId = async (mobileNumber, id) => {
    const result = await db.query('SELECT * FROM tbl_users WHERE mobileNumber = ? And id != ?', [mobileNumber, id]);
    return result;
};

exports.fetchUserByEmailAndUserId = async (uid, email) => {
    const result = await db.query("SELECT * FROM tbl_users WHERE id != ? AND email = ?", [uid, email]);
    return result;
};

exports.fetchBlockedListByUsersIdAndBuyerId = async (id, buyerId) => {
    return db.query(`SELECT * FROM tbl_blockedusers WHERE blocked_from = ? And blocked_to=? ORDER BY createdAt DESC`, [id, buyerId]);
};

exports.fetchBlockedListBySenderIdAndReciverId = async (reciverId, senderId) => {
    return db.query(`SELECT * FROM tbl_blockedusers WHERE blocked_from = ? And blocked_to=? ORDER BY createdAt DESC`, [reciverId, senderId]);
};

exports.fetchSearchSuggestions = async () => {
    return db.query(`SELECT * FROM tbl_searchsuggestions WHERE status = 1 ORDER BY createdAt DESC`);
};

exports.addRattingAndReview = async (data) => {
    return db.query("INSERT INTO tbl_userratting SET ?", [data]);
};

exports.alreadyAddedRatting = async (rattingFrom, rattingTo, productId) => {
    return db.query(`SELECT * FROM tbl_userratting WHERE ratingFrom=? And ratingTo=? And productId=?`, [rattingFrom, rattingTo, productId]);
};

exports.fetchUserRatingById = async (ratingTo) => {
    return db.query(`
        SELECT 
            AVG(rating) AS averageRating
        FROM tbl_userratting
        WHERE ratingTo = ?
        GROUP BY ratingTo
    `, [ratingTo]);
};

exports.fetchUserRatingByUserIdAndProductId = async (ratingFrom, productId) => {
    return db.query(`SELECT * FROM tbl_userratting WHERE ratingFrom = ? And productId=?`, [ratingFrom, productId]);
};

exports.fetchReviewByUserId = async (ratingTo) => {
    return db.query(`
        SELECT tbl_userratting.review,tbl_users.fullName , tbl_users.profileImages,tbl_userratting.rating FROM tbl_userratting
        JOIN tbl_users ON tbl_userratting.ratingFrom=tbl_users.id
        WHERE ratingTo = ? AND review IS NOT NULL
         ORDER BY tbl_userratting.createdAt DESC
    `, [ratingTo]);
};

exports.fetchReviewByUserId = async (ratingTo) => {
    return db.query(`
        SELECT 
            tbl_userratting.review,
            tbl_users.fullName,
            tbl_users.profileImages,
            tbl_userratting.rating
        FROM tbl_userratting
        JOIN tbl_users ON tbl_userratting.ratingFrom = tbl_users.id
        WHERE tbl_userratting.ratingTo = ? 
          AND tbl_userratting.review IS NOT NULL
        ORDER BY tbl_userratting.createdAt DESC
    `, [ratingTo]);
};

exports.fetchAllUsersGigs = async () => {
    return await db.query(`SELECT * FROM tbl_gigs  ORDER BY createdAt DESC`);
};

exports.insertUsersCommented = async (data) => {
    return db.query("INSERT INTO users_comment SET ?", [data]);
};

exports.fetchParticularPostComments = async (id, item_type) => {
    return db.query(
        `SELECT u.id AS userId,uc.id, u.fullName , uc.comment_text, uc.created_at
 FROM users_comment uc
 JOIN tbl_users u ON uc.user_id = u.id
 WHERE uc.post_id = ? And uc.item_type = ?
 ORDER BY uc.created_at DESC`, [id, item_type])
}

exports.addedToPostFavorite = async (data) => {
    return db.query("INSERT INTO user_favorite SET ?", [data]);
};

exports.removePostFromYourFavroite = async (id) => {
    return db.query("DELETE FROM user_favorite WHERE id = ? ", [id]);
}

exports.postLike = async (data) => {
    return db.query("INSERT INTO users_like SET ?", [data]);
};

exports.postUnlike = async (id) => {
    return db.query("DELETE FROM users_like WHERE id = ? ", [id]);
}

exports.fetchAllMyFavoritePostModel = async (id) => {
    const query = `
        SELECT 
            user_favorite.*,
            NULL AS fullName,
            NULL AS profileImages
        FROM user_favorite
        WHERE user_id = ?
        ORDER BY created_at DESC
    `;
    const rows = await db.query(query, [id]);
    return rows;
};

exports.fetchFavoritePostByUsersId = async (id, post_id, item_type) => {
    return await db.query(`SELECT * FROM user_favorite Where user_id = ? And post_id = ? And item_type = ? `, [id, post_id, item_type]);
};

exports.fetchLikePostByUsersId = async (id, post_id, item_type) => {
    return await db.query(`SELECT * FROM users_like Where user_id = ? And post_id =? And item_type = ? `, [id, post_id, item_type]);
};

exports.fetchTotalLikeCount = async (post_id, item_type) => {
    return await db.query(`SELECT Count(*) AS totalLikes FROM users_like Where post_id =? And item_type = ? `, [post_id, item_type]);
};

exports.fetchTotalComments = async (post_id, item_type) => {
    return await db.query(`SELECT Count(*) AS totalComments FROM users_comment Where post_id =? And item_type = ? `, [post_id, item_type]);
};

exports.fetchParticularUserChatList = async (userId) => {
    const query = `
       SELECT c.id AS chat_id,
    CASE 
        WHEN c.user1_id = ? THEN c.user2_id 
        ELSE c.user1_id 
    END AS other_user_id,
    u.fullName,
    u.profileImages,
    m.message AS last_message,
    m.createdAt AS last_message_time,
    m.message_type,
    
    (SELECT COUNT(*) 
     FROM tbl_message 
     WHERE chat_id = c.id 
       AND is_read = 0 
       AND sender_id != ?) AS unread_count
    
FROM tbl_chat c
JOIN tbl_users u 
    ON u.id = CASE 
                 WHEN c.user1_id = ? THEN c.user2_id 
                 ELSE c.user1_id 
              END
JOIN tbl_message m 
    ON m.id = (
        SELECT id 
        FROM tbl_message 
        WHERE chat_id = c.id 
        ORDER BY createdAt DESC 
        LIMIT 1
    )
WHERE c.user1_id = ? OR c.user2_id = ?
ORDER BY m.createdAt DESC;

    `;
    const rows = await db.query(query, [userId, userId, userId, userId, userId]);
    return rows;
};