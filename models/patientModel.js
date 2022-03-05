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

const patientSchema = new Schema(
  {
    identity: {
      name: { first: String, last: String },
      photo: String,
      dob: Date,
    },
    visit: {
      chaperones: [String],
      clinics: [{
        hospital: String,
        department: [String],
      }],
    },
    appointments: [
      {
        date: Date,
        time: String,
        hospital: {
          name: String,
          department: String,
        },
        notes: [{
          userImage: String,
          userName: String,
          date: Date,
          time: String,
          note: String,
          image: String,
        },
        ],
      },
    ],
    medication: [{
      name: String,
      frequency: { times: Number, perDuration: String, perDosage: Number },
      lastIssued: {
        date: Date,
        durationDays: Number,
      },
      emailList: [{
        name: String,
        email: String,
      }],
    }],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Patient', patientSchema);
