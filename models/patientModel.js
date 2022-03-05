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
 *             documents for patients collection
 *
 * ========================================================
 * ========================================================
 */
const { Schema } = mongoose;

const patientSchema = new Schema(
  {
    identity: {
      name: {
        first: String,
        last: String,
      },
      photo: String,
      dob: Date,
    },
    visitDetails: {
      chaperones: [{
        // If not a user, then this field won't exist
        chaperoneId: mongoose.Schema.Types.ObjectId,
        name: String,
      }],
      clinics: [{
        hospital: String,
        departments: [String],
      }],
      doctors: [String],
    },
    appointments: [{
      date: Date,
      time: String,
      hospital: {
        name: String,
        department: String,
      },
      chaperone: {
        // If not a user, then this field won't exist
        chaperoneId: mongoose.Schema.Types.ObjectId,
        name: String,
      },
      notes: [{
        userImage: String,
        userName: String,
        date: Date,
        time: String,
        note: String,
        image: String,
      }],
    }],
    medication: [{
      name: String,
      frequency: {
        times: Number,
        perDuration: String,
        perDosage: Number,
      },
      lastIssued: {
        date: Date,
        durationDays: Number,
      },
      reminder: {
        daysBefore: Number,
        nextIssueReminder: Date,
      },
    }],
    medEmailList: [{
      name: String,
      email: String,
    }],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Patient', patientSchema);
