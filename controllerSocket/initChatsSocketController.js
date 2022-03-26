/* eslint-disable max-len */
/* eslint-disable no-console */
/*
 * ========================================================
 * ========================================================
 *
 *                      Imports
 *
 * ========================================================
 * ========================================================
 */
// Import models
const OnlineChatModel = require('../models/onlineChatModel');
const ChatModel = require('../models/chatModel');

/*
 * ========================================================
 * ========================================================
 *
 *        Controller function for chat socket routes
 *
 * ========================================================
 * ========================================================
 */
const initChatsSocketController = () => {
  /*
  * ========================================================
  *                If user is in chat room,
  *           add details to online chat collection
  *           and retrieve all messages with textee
  * ========================================================
  */
  const onlineChat = async (socket, data) => {
    try {
    // Add user to Online Chat collection or update current document
      const onlineArchive = await OnlineChatModel.findOneAndUpdate({ onlineUserId: data.onlineUserId, texteeId: data.texteeId }, { userSocketId: data.userSocketId }, { new: true });

      socket.join(`Chat room${data.onlineUserId}`);

      if (onlineArchive === null) {
        await OnlineChatModel.create({
          onlineUserId: data.onlineUserId,
          texteeId: data.texteeId,
          userSocketId: data.userSocketId,
        });
      }

      // Retrieve all messages between users
      const messages = await ChatModel.find({
        senderId: data.onlineUserId,
        receiverId: data.texteeId,
      });

      const messagesTwo = await ChatModel.find({
        senderId: data.texteeId,
        receiverId: data.onlineUserId,
      });

      // Combine all messages
      const allMessages = [...messages, ...messagesTwo];

      // Sort messages according to time sent
      allMessages.sort((a, b) => a.createdAt - b.createdAt);

      const sendData = {
        allMessages,
      };

      // Send messages to frontend
      socket.emit('All messages', { sendData });
    } catch (err) {
      console.log(err);
    }
  };

  /*
  * ========================================================
  *                  Upon receiving message,
  *               store in DB and inform user
  *     and textee (if they are also in the chatroom)
  * ========================================================
  */
  const saveMessage = async (socket, data, io) => {
    try {
      // Add message to Chat collection
      await ChatModel.create({
        message: data.message,
        senderId: data.senderId,
        receiverId: data.receiverId,
      });

      // Retrieve updated conversation
      const messages = await ChatModel.find({
        senderId: data.senderId,
        receiverId: data.receiverId,
      });

      const messagesTwo = await ChatModel.find({
        senderId: data.receiverId,
        receiverId: data.senderId,
      });

      // Combine all messages
      const allMessages = [...messages, ...messagesTwo];

      // Sort messages according to time sent
      allMessages.sort((a, b) => a.createdAt - b.createdAt);

      // Check if textee is also viewing the same chat
      const texteeSocketId = await OnlineChatModel.findOne({ onlineUserId: data.receiverId, texteeId: data.senderId });

      // If yes, then send latest messages to textee
      if (texteeSocketId !== null) {
        socket.join([`Chat room${data.receiverId}`, `Chat room${data.senderId}`]);
        io.to(`Chat room${data.receiverId}`).emit('Latest conversation', { allMessages });
      }

      // Send messages to users frontend
      socket.emit('Latest conversation', { allMessages });
    } catch (err) {
      console.log(err);
    }
  };

  /*
  * ========================================================
  *               On disconnect from socket,
  *          remove document from Online Chat Colleciton
  * ========================================================
  */
  const offlineChat = async (id) => {
    await OnlineChatModel.deleteOne({
      userSocketId: id,
    });
  };
  return {
    onlineChat,
    saveMessage,
    offlineChat,
  };
};

module.exports = initChatsSocketController;
