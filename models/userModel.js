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
      relationship: String,
    }],
    family: [{
      familyMemberId: mongoose.Schema.Types.ObjectId,
      name: String,
      photo: String,
      visibilePatients: [{
        patientId: mongoose.Schema.Types.ObjectId,
        name: String,
      }],
    }],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('User', userSchema);
