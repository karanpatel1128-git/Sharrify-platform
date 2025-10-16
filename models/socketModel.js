const db = require('../config/db')

exports.getUserChats = async (userId) => {
    return await db.query(`
        SELECT
            c.id AS chat_id,
            c.user1_id,
            c.user2_id,
            c.createdAt AS chat_createdAt,
            m.id AS message_id,
            m.message,
            m.sender_id,
            m.message_type,
            m.createdAt AS message_createdAt
        FROM tbl_chat c
        LEFT JOIN (
            SELECT m1.*
            FROM tbl_message m1
            INNER JOIN (
                SELECT chat_id, MAX(createdAt) AS max_createdAt
                FROM tbl_message
                GROUP BY chat_id
            ) m2 ON m1.chat_id = m2.chat_id AND m1.createdAt = m2.max_createdAt
        ) m ON c.id = m.chat_id
        WHERE c.user1_id = ? OR c.user2_id = ?
        ORDER BY m.createdAt DESC
    `, [userId, userId]);
};

exports.fetchMessagesByChatId = async (senderId, chatId) => {
    return await db.query(
        `SELECT *, 
         CASE WHEN sender_id = ? THEN TRUE ELSE FALSE END AS isOwnMessage 
         FROM tbl_message
         WHERE chat_id = ? 
         ORDER BY createdAt ASC`,
        [senderId, chatId]
    );
};

exports.fetchChatById = async (chatId) => {
    return await db.query(`SELECT * FROM tbl_chat WHERE id = ?`, [chatId]);
};

exports.saveMessage = async (chatId, senderId, message, messageType) => {
    return await db.query(
        `INSERT INTO tbl_message (chat_id, sender_id, message, message_type) VALUES (?, ?, ?, ?)`,
        [chatId, senderId, message, messageType]
    );
};

exports.fetchMessagesById = async (messageId, senderId) => {
    return await db.query(`
      SELECT *,
        CASE WHEN sender_id = ? THEN TRUE ELSE FALSE END AS isOwnMessage
      FROM tbl_message
      WHERE id = ?`,
        [senderId, messageId]
    );
};

exports.getOrCreateOneAndOneChat = async (senderId, receiverId) => {
    let id;
    const existing = await db.query(`
        SELECT * FROM tbl_chat 
        WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
        LIMIT 1
    `, [senderId, receiverId, receiverId, senderId]);
    if (existing.length > 0) {
        id = existing[0].id; // Return existing chat
    } else {
        const insertResult = await db.query(`
            INSERT INTO tbl_chat (user1_id, user2_id, createdAt, updatedAt) 
            VALUES (?, ?, NOW(), NOW())
        `, [senderId, receiverId]);
        id = insertResult.insertId
    }
    return { id };
};

exports.markMessageAsRead = async (chatId, userId) => {
    return await db.query(`
        UPDATE tbl_message
        SET is_read = 1
        WHERE chat_id = ? AND sender_id != ?
    `, [chatId, userId]);
};