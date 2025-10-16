const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const db = require('../config/db')

const { sendPushNotification, createNotificationMessage, sendNotification } = require('../utils/helper');
const { getUserChats, fetchMessagesByChatId, fetchChatById, saveMessage, fetchMessagesById, markMessageAsRead } = require("../models/socketModel.js");

// const { getUserSockets, setIO } = require("./socketManager.js");
const { handleError } = require("./responseHandler.js");
const { fetchUserByIds } = require("../models/usersModel.js");
const { NOTIFICATION_TYPE } = require("./constant");
const { baseUrl } = require('../config/path');

dotenv.config();

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // setIO(io);

  io.on("connection", async (socket) => {
    const authHeader = socket.handshake.headers.authorization;

    if (!authHeader) {
      console.log("Authorization header is missing");
      socket.emit('unauthorized', {
        status: 401,
        message: 'Authorization header is missing',
        success: false,
      });
    }
    const token = authHeader.replace('Bearer ', '');
    let secretKey = process.env.AUTH_SECRETKEY
    let decoded = jwt.verify(token, secretKey);
    decoded.id = decoded.userId;

    let loggedUserId = decoded.id;
    socket.join(loggedUserId.toString());

    socket.on('user_connected', async () => {
      try {
        let userId = decoded.id;
        console.log("🔌🔌 Socket connected for user:", userId);
      } catch (error) {
        socket.emit("error", error.message);
      }
    });

    socket.on("fetch_chats", async () => {
      try {
        const userId = decoded.id;
        const chats = await getUserChats(userId);
        const result = [];
        for (const chat of chats) {
          let otherUserId;
          if (chat.user1_id === userId) {
            otherUserId = chat.user2_id;
          } else if (chat.user2_id === userId) {
            otherUserId = chat.user1_id;
          } else {
            continue;
          }
          let query = `SELECT id, fullName, profileImages FROM tbl_users WHERE id = ?`;
          const userDetails = await db.query(query, [otherUserId]);
          if (userDetails.length > 0) {
            result.push({
              chatId: chats[0].chat_id,
              userId: otherUserId,
              fullName: userDetails[0].fullName,
              profileImage: userDetails[0].profileImages,
            });
          } else {
            console.warn("No user found for ID:", otherUserId);
          }
        }
        io.in(userId.toString()).emit("chat_list", result);
      } catch (error) {
        console.error("fetch_chats error:", error);
        socket.emit("error", error.message);
      }
    });

    socket.on("fetch_messages", async ({ chatId }) => {
      try {
        let senderId = decoded.id;
        const messages = await fetchMessagesByChatId(senderId, chatId);
        const modifiedMessages = messages.map(msg => ({ ...msg, isOwnMessage: msg.sender_id === senderId }));
        socket.emit("chat_history", modifiedMessages);
      } catch (error) {
        console.log('error', error);
        socket.emit("error", error.message);
      }
    });

    socket.on("send_message", async ({ chatId, message, messageType }) => {
      try {
        const senderId = decoded.id;
        let currentUserDetails = await fetchUserByIds(senderId)
        let fullName = currentUserDetails[0].fullName
        let profileImages = currentUserDetails[0].profileImages
        let ids = [senderId];

        // ✅ Fetch chat participants
        const fetchChatsUsers = await fetchChatById(chatId);
        if (!fetchChatsUsers || fetchChatsUsers.length === 0) {
          return socket.emit("error", "Chat not found");
        }

        const chat = fetchChatsUsers[0];
        const receiverId =
          chat.user1_id === senderId ? chat.user2_id : chat.user1_id;

        ids.push(receiverId);
        ids = [...new Set(ids)];

        // ✅ Save message
        const result = await saveMessage(chatId, senderId, message, messageType);
        const messageId = result.insertId;
        const messageDetails = await fetchMessagesById(messageId, senderId);

        // ✅ Emit to both users with isOwnMessage flag
        ids.forEach((id) => {
          const payload = {
            ...messageDetails[0],
            isOwnMessage: id === senderId, // true for sender, false for others
          };

          console.log(
            `📩 Emitting to user: ${id}, isOwnMessage: ${payload.isOwnMessage}`
          );
          io.to(id.toString()).emit("new_message", payload);

        });
        // ✅ Send push notification
        const userDetails = await fetchUserByIds(receiverId);
        let userId = receiverId;
        let usersfetchFcmToken = userDetails[0].fcmToken;
        let notificationType = NOTIFICATION_TYPE.NEW_MESSAGE;
        let notificationSend = 'new message'
        let userName = fullName;
        let notificationMessage = await createNotificationMessage({ notificationSend, userId, usersfetchFcmToken, notificationType, userName });
        notificationMessage.data.profileImages = !profileImages
          ? null
          : (profileImages.startsWith("http://") || profileImages.startsWith("https://"))
            ? profileImages
            : `${baseUrl}/uploads/${profileImages}`;

        notificationMessage.data.meta = JSON.stringify({
          senderIds: senderId,
          fullName: fullName,
          profileImages: profileImages
        });
        await sendNotification(notificationMessage);
      } catch (error) {
        console.error("❌ send_message error:", error.message);
        socket.emit("error", error.message);
      }
    });

    socket.on("mark_as_read", async ({ chatId }) => {
      try {
        const userId = decoded.id;
        await markMessageAsRead(chatId, userId);
        io.to(`chat_${chatId}`).emit("message_read", { chatId });
      } catch (error) {
        console.error("Error marking message as read:", error);
      }
    });

  });
};

module.exports = initializeSocket;



