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
 *          documents for family request collection
 *
 * ========================================================
 * ========================================================
 */
const { Schema } = mongoose;

const familyRequestSchema = new Schema(
  {
    sender: {
      senderId: mongoose.Schema.Types.ObjectId,
      name: String,
      email: String,
      photo: String,
    },
    recepient: {
      recepientId: mongoose.Schema.Types.ObjectId,
      name: String,
      email: String,
      photo: String,
    },
    hasAccepted: Boolean,
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('family_request', familyRequestSchema, 'familyRequest');
