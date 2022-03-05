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
 *             documents for users collection
 *
 * ========================================================
 * ========================================================
 */
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    identity: {
      name: { first: String, last: String },
      email: String,
      password: String,
      photo: String,
    },
    patients: [Schema.Types.Mixed],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('User', userSchema);
