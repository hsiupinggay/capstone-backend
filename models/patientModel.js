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
    admin: mongoose.Schema.Types.ObjectId,
    identity: {
      name: {
        first: String,
        last: String,
      },
      photo: String,
      dob: String,
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
      date: String,
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
      notes: {
        userName: {
          first: String,
          last: String,
        },
        userImage: String,
        date: String,
        note: String,
      },
    }],
    medication: [{
      name: String,
      frequency: {
        times: Number,
        perDuration: String,
        dosage: Number,
        dosageCounter: String,
        note: String,
      },
      lastPrescribed: {
        prescriptionDate: Date,
        prescriptionQty: Number,
      },
      reminder: {
        reminderChecked: Boolean,
        reminderDays: Number,
        reminderDate: Date,
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
