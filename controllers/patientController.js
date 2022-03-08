/* eslint-disable no-console */
/*
 * ========================================================
 * ========================================================
 *
 *                      Imports
 *
 * ========================================================
 * ========================================================
 */
const { DateTime } = require('luxon');
const BaseController = require('./baseController');
// require('dotenv').config();

/*
 * ========================================================
 * ========================================================
 *
 *                    Patient Controller
 *
 * ========================================================
 * ========================================================
 */
class PatientController extends BaseController {
  constructor(model, userModel) {
    super(model);
    this.userModel = userModel;
  }

  // Get data for all patients related to user
  async allPatientsList(req, res) {
    const { userId } = req.query;

    try {
      // Find user's document and return patients details
      const allPatientsObj = await this.userModel.findOne({ _id: userId }, { patients: 1 });

      // Extract patient ids from object
      const allPatientsArr = allPatientsObj.patients;
      const patientIdArr = [];
      for (let i = 0; i < allPatientsArr.length; i += 1) {
        patientIdArr.push(allPatientsArr[i].patientId);
      }

      // Get patients details to send to frontend
      const patientDetailsObj = await this.model.find({ _id: { $in: patientIdArr } }, { 'identity.name': 1, 'visitDetails.chaperones': 1, 'visitDetails.clinics': 1 });
      console.log('patientDetailsObj', patientDetailsObj);

      return res.status(200).json({ patientDetailsObj });
    } catch (err) {
      return this.errorHandler(err, res);
    }
  }

  // Add new appointment to DB
  async addAppointment(req, res) {
    const {
      patientId, dateTime, department, hospital, chaperone, chaperoneId,
    } = req.body;

    try {
      // Format date and time
      const date = DateTime.fromISO(dateTime).toFormat('dd-MMM-yyyy');
      const time = DateTime.fromISO(dateTime).toFormat('h:mm a');

      // Find patient's document
      const patient = await this.model.findOne({ _id: patientId });

      patient.appointments.push({
        date,
        time,
        hospital: {
          name: hospital,
          department,
        },
        chaperone: {
          chaperoneId,
          name: chaperone,
        },
      });
      patient.save();

      return res.status(200).json({ data: patient.appointments });
    } catch (err) {
      return this.errorHandler(err, res);
    }
  }
}

module.exports = PatientController;
