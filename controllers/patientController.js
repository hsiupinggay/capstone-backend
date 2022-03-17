/* eslint-disable no-underscore-dangle */
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
      const patientDetailsObj = await this.model.find({ _id: { $in: patientIdArr } }, { 'identity.name': 1, 'visitDetails.chaperones': 1, 'visitDetails.clinics': 1, 'appointments': 1, });

      return this.successHandler(res, 200, { patientDetailsObj });
    } catch (err) {
      return this.errorHandler(res, 400, { err });
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

      if (chaperone === '') {
        patient.appointments.push({
          date,
          time,
          hospital: {
            name: hospital,
            department,
          },
        });
      } else {
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
      }
      patient.save();

      return this.successHandler(res, 200, { data: patient.appointments });
    } catch (err) {
      return this.errorHandler(res, 400, { err });
    }
  }

  // Add new patient to DB
  async addPatient(req, res) {
    const {
      userId, firstName, lastName, DOB, relationship,
    } = req.body;

    try {
      const date = DateTime.fromISO(DOB).toFormat('dd-MMM-yyyy');

      // Create new patient document
      const patient = await this.model.create({
        admin: userId,
        identity: {
          name: {
            first: firstName,
            last: lastName,
          },
          dob: date,
        },
      });

      // Add patient Id to users document
      const user = await this.userModel.findOne({ _id: userId });
      user.patients.push({
        patientId: patient._id,
        name: `${firstName} ${lastName}`,
        relationship,
        admin: userId,
      });
      user.save();

      return this.successHandler(res, 200, { message: 'success' });
    } catch (err) {
      return this.errorHandler(res, 400, { err });
    }
  }

  // Add new hospital to DB
  async addHospital(req, res) {
    const {
      hospital, patientId,
    } = req.body;

    try {
      // Find patient's document
      const patient = await this.model.findOne({
        _id: patientId,
      });

      // Add hospital to patient's document
      patient.visitDetails.clinics.push({
        hospital,
      });
      patient.save();

      return this.successHandler(res, 200, { message: 'success' });
    } catch (err) {
      return this.errorHandler(res, 400, { err });
    }
  }

  // Add new department to DB
  async addDepartment(req, res) {
    const {
      hospital, patientId, department,
    } = req.body;

    try {
      // Find patient's document
      const patient = await this.model.findOne({
        _id: patientId,
      });

      // Find hospital and add department
      const clinicsArr = patient.visitDetails.clinics;
      for (let i = 0; i < clinicsArr.length; i += 1) {
        if (clinicsArr[i].hospital === hospital) {
          clinicsArr[i].departments.push(department);
        }
      }
      patient.save();

      return this.successHandler(res, 200, { message: 'success' });
    } catch (err) {
      return this.errorHandler(res, 400, { err });
    }
  }

  // Add new chaperone to DB
  async addChaperone(req, res) {
    const {
      chaperoneName,
      chaperoneId,
      patientId,
    } = req.body;

    try {
      // Find patient's document
      const patient = await this.model.findOne({
        _id: patientId,
      });

      // Add chaperone to patient's document
      if (chaperoneId === '') {
        patient.visitDetails.chaperones.push({
          name: chaperoneName,
        });
      } else {
        patient.visitDetails.chaperones.push({
          name: chaperoneName,
          chaperoneId,
        });
      }
      patient.save();

      return this.successHandler(res, 200, { message: 'success' });
    } catch (err) {
      return this.errorHandler(res, 400, { err });
    }
  }

  async addMedicine(req, res) {
    console.log(`POST Request: ${process.env.BACKEND_URL}/patient/add-medicine/`);

    const {
      patientId,
      name,
      dosage,
      dosageCounter,
      times,
      duration,
      note,
      prescriptionDate,
      prescriptionQty,
      reminderDays,
      reminderChecked,
      reminderDate,
    } = req.body;

    console.log('<== add med req body ==>', req.body);

    try {
      const patient = await this.model.findOne({ _id: patientId });
      patient.medication.push({
        name,
        frequency: {
          dosage,
          dosageCounter,
          note,
          times,
          perDuration: duration,
        },
        lastPrescribed: {
          prescriptionDate,
          prescriptionQty,
        },
        reminder: {
          reminderChecked,
          reminderDays,
          reminderDate,
        },
      });
      patient.save();

      this.successHandler(res, 200, { success: true, patient });
    } catch (error) {
      this.errorHandler(res, 400, {
        sucess: false, message: 'failed to add, try again',
      });
    }
  }

  async viewMedicineList(req, res) {
    console.log(`GET Request: ${process.env.BACKEND_URL}/patient/med-list?patientId`);
    console.log('<== req.query ==>', req.query);

    const { patientId } = req.query;
    try {
      const patient = await this.model.findOne({ _id: patientId });
      const { medication } = patient;
      this.successHandler(res, 200, { success: true, medication });
    } catch (err) {
      this.errorHandler(res, 400, { success: false, error: 'unable to find patient' });
    }
  }

  async viewMedicine(req, res) {
    console.log(`GET Request: ${process.env.BACKEND_URL}/patient/view-med?patientId?medicineId`);
    console.log(req.query);
    const { patientId, medicineId } = req.query;
    const medicine = await this.model.findOne({ _id: patientId, 'medication._id': medicineId }, {
      'medication.$': 1,
    });
    const selectedMedicine = medicine.medication[0];

    console.log('<== medicine ==>', selectedMedicine);
    this.successHandler(res, 200, {
      success: true, selectedMedicine,
    });
  }

  async editMedicine(req, res) {
    console.log(`POST Request: ${process.env.BACKEND_URL}/patient/edit-med/`);
    const {
      patientId,
      medicineId,
      name,
      dosage,
      dosageCounter,
      times,
      duration,
      note,
      prescriptionDate,
      prescriptionQty,
      reminderDays,
      reminderChecked,
      reminderDate,
    } = req.body;

    console.log('<== edit med req body ==>', req.body);

    try {
      const patient = await this.model.findOne({ _id: patientId });
      for (let i = 0; i < patient.medication.length; i += 1) {
        console.log(
          '<== found match ==>',
          patient.medication[i]._id.toString() === medicineId,
        );
        if (patient.medication[i]._id.toString() === medicineId) {
          patient.medication[i].name = name;
          patient.medication[i].frequency = {
            dosage,
            dosageCounter,
            note,
            times,
            perDuration: duration,
          };
          patient.medication[i].lastPrescribed = {
            prescriptionDate,
            prescriptionQty,
          };
          patient.medication[i].reminder = {
            reminderChecked,
            reminderDays,
            reminderDate,
          };
        } else { console.log('<== medicine not found ==>'); }
      }

      patient.save();

      this.successHandler(res, 200, { success: true });
    } catch (err) {
      console.log(err);
      this.errorHandler(res, 400, { success: false, error: 'unable to edit' });
    }
  }
}

module.exports = PatientController;
