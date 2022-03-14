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
 *             Schema describing structure of
 *          documents for contact request collection
 *
 * ========================================================
 * ========================================================
 */
const { Schema } = mongoose;

const contactRequestSchema = new Schema(
  {
    sender: {
      senderId: mongoose.Schema.Types.ObjectId,
      firstName: String,
      lastName: String,
      photo: String,
    },
    recipient: {
      recipientId: mongoose.Schema.Types.ObjectId,
      firstName: String,
      lastName: String,
      photo: String,
    },
    hasAccepted: Boolean,
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('contact_request', contactRequestSchema, 'contactRequest');
