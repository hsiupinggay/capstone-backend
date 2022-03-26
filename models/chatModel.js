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
 *              documents for chats collection
 *
 * ========================================================
 * ========================================================
 */
const { Schema } = mongoose;

// Initialize new instance of Schema for chats collection
const chatSchema = new Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    message: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Create model from schema to access and alter database
module.exports = mongoose.model('Chat', chatSchema);
