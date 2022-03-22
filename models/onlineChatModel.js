/*
 * ========================================================
 * ========================================================
 *
 *                      Imports
 *
 * ========================================================
 * ========================================================
 */
const mongoose = require('mongoose');

/*
 * ========================================================
 * ========================================================
 *
 *              Schema describing structure of
 *              documents for online chat collection
 *
 * ========================================================
 * ========================================================
 */
const { Schema } = mongoose;

// Initialize new instance of Schema for online chats collection
const onlineChatSchema = new Schema(
  {
    onlineUserId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    texteeId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    userSocketId: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Create model from schema to access and alter database
module.exports = mongoose.model('online_chat', onlineChatSchema, 'onlineChat');
