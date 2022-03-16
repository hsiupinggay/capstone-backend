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
      name: {
        first: String,
        last: String,
      },
      email: String,
      password: String,
      photo: String,
    },
    patients: [{
      patientId: mongoose.Schema.Types.ObjectId,
      name: String,
      relationship: String,
      admin: mongoose.Schema.Types.ObjectId,
    }],
    contacts: [{
      contactId: mongoose.Schema.Types.ObjectId,
      firstName: String,
      lastName: String,
      photo: String,
      visiblePatients: [{
        patientId: mongoose.Schema.Types.ObjectId,
        name: String,
        admin: mongoose.Schema.Types.ObjectId,
      }],
    }],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('User', userSchema);
