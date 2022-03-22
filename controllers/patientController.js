/* eslint-disable max-len */
/* eslint-disable no-console */
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
const moment = require('moment');

const { DateTime } = require('luxon');
const { default: axios } = require('axios');
const { CronJob } = require('cron');
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
      hospital, patientId, getAllPatientDetails,
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
      await patient.save();

      // If request comes from patient profile page instead of appointment page get and send updated list of clinics
      if (getAllPatientDetails === true) {
        // Get patient's details to send to frontend
        const patientDetailsObj = await this.model.findOne({ _id: patientId }, { visitDetails: 1 });

        const { visitDetails } = patientDetailsObj;
        const { clinics } = visitDetails;
        return this.successHandler(res, 200, { clinics });
      }

      return this.successHandler(res, 200, { message: 'success' });
    } catch (err) {
      return this.errorHandler(res, 400, { err });
    }
  }

  // Add new department to DB
  async addDepartment(req, res) {
    const {
      hospital, patientId, department, getAllPatientDetails,
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
      await patient.save();

      // If request comes from patient profile page instead of appointment page get and send updated list of clinics
      if (getAllPatientDetails === true) {
        // Get patient's details to send to frontend
        const patientDetailsObj = await this.model.findOne({ _id: patientId }, { visitDetails: 1 });

        const { visitDetails } = patientDetailsObj;
        const { clinics } = visitDetails;
        return this.successHandler(res, 200, { clinics });
      }

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
      getAllPatientDetails,
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
      await patient.save();

      // If request comes from patient profile page instead of appointment page get and send updated list of clinics
      if (getAllPatientDetails === true) {
        // Get patient's details to send to frontend
        const patientDetailsObj = await this.model.findOne({ _id: patientId }, { visitDetails: 1 });

        const { visitDetails } = patientDetailsObj;
        const { chaperones } = visitDetails;
        return this.successHandler(res, 200, { chaperones });
      }

      return this.successHandler(res, 200, { message: 'success' });
    } catch (err) {
      return this.errorHandler(res, 400, { err });
    }
  }

  // Get data for all patients names related to user
  async allPatientsNames(req, res) {
    const { userId } = req.query;

    try {
      // Find user's document and return patients details
      const allPatientsObj = await this.userModel.findOne({ _id: userId }, { patients: 1 });

      return this.successHandler(res, 200, { allPatientsObj });
    } catch (err) {
      return this.errorHandler(res, 400, { err });
    }
  }

  // Get patient's data for patient profile page
  async getIndividualPatientData(req, res) {
    const { userId, patientId } = req.query;

    try {
    // Find patient in user document to extract relationship
      const patient = await this.userModel.findOne({ _id: userId }, { patients: { $elemMatch: { patientId } } });
      const relationship = patient.patients[0].relationship || null;

      // Get patient's details to send to frontend
      const patientDetailsObj = await this.model.findOne({ _id: patientId }, { identity: 1 });

      // Get name
      const fullName = `${patientDetailsObj.identity.name.first} ${patientDetailsObj.identity.name.last}`;

      // Calcuate patient's age
      const { dob } = patientDetailsObj.identity;
      const date = moment(dob, 'DD-MMM-YYYY').format('MM-DD-YYYY');
      const getAge = (dateString) => {
        const today = new Date();
        const birthDate = new Date(dateString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age -= 1;
        }
        return age;
      };
      const age = getAge(date);

      return this.successHandler(res, 200, { fullName, relationship, age });
    } catch (err) {
      return this.errorHandler(res, 400, { err });
    }
  }

  // Add user's relationship to patient
  async addRelationship(req, res) {
    const { relationship, userId, patientId } = req.body;

    try {
    // Find user document
      const user = await this.userModel.findOne({ _id: userId });

      // Find patients subdocument
      for (let i = 0; i < user.patients.length; i += 1) {
        if (user.patients[i].patientId.toString() === patientId.toString()) {
          user.patients[i].relationship = relationship;
          user.save();
        }
      }

      return this.successHandler(res, 200, { message: 'success' });
    } catch (err) {
      return this.errorHandler(res, 400, { err });
    }
  }

  // Get patient's visit details for patient visit details page
  async getPatientVisitDetails(req, res) {
    const { patientId } = req.query;

    try {
      // Get patient's details to send to frontend
      const patientDetailsObj = await this.model.findOne({ _id: patientId }, { visitDetails: 1, identity: 1 });

      const { visitDetails } = patientDetailsObj;
      const { chaperones, clinics } = visitDetails;

      // Get name
      const fullName = `${patientDetailsObj.identity.name.first} ${patientDetailsObj.identity.name.last}`;

      return this.successHandler(res, 200, { chaperones, clinics, fullName });
    } catch (err) {
      return this.errorHandler(res, 400, { err });
    }
  }

  // Get patient's memos and related appointments
  async getPatientMemos(req, res) {
    const { patientId } = req.query;

    try {
      // Get patient's details to send to frontend
      const patientDetailsObj = await this.model.findOne({ _id: patientId }, { appointments: 1, 'identity.name': 1 }).lean();
      const { appointments, identity } = patientDetailsObj;

      // Combine patient first and last name
      const patientName = `${identity.name.first} ${identity.name.last}`;

      // Get list of all appointment dates, hospitals, departments, chaperones
      const datesArr = [];
      const hospArr = [];
      const deptArr = [];
      const chapArr = [];

      // Loop through all appointments and find those with memos
      const appointmentArr = [];
      for (let i = 0; i < appointments.length; i += 1) {
        if (appointments[i].notes !== undefined) {
          // Convert and date so that they can be sorted
          const convertedDate = moment(appointments[i].date, 'DD-MMM-YYYY').format('YYYY-MM-DD');
          appointments[i].convertedDate = new Date(convertedDate);
          // Push appointment into new array
          appointmentArr.push(appointments[i]);

          // Store appointment dates, hospitals, departments, chaperones in arrays for use in filters
          datesArr.push(appointments[i].date);
          hospArr.push(appointments[i].hospital.name);
          deptArr.push(appointments[i].hospital.department);
          if (appointments[i].chaperone !== undefined) {
            chapArr.push(appointments[i].chaperone.name);
          }
        }
      }

      // Get list of unique appointment dates, hospitals, departments, chaperones
      const onlyUnique = (value, index, self) => self.indexOf(value) === index;
      const uniqueDates = datesArr.filter(onlyUnique);
      const uniqueHosps = hospArr.filter(onlyUnique);
      const uniqueDepts = deptArr.filter(onlyUnique);
      const uniqueChaps = chapArr.filter(onlyUnique);

      // Sort appointments/memos from latest to oldest
      appointmentArr.sort((a, b) => b.convertedDate - a.convertedDate);

      return this.successHandler(res, 200, {
        appointmentArr, patientName, uniqueChaps, uniqueDates, uniqueDepts, uniqueHosps,
      });
    } catch (err) {
      return this.errorHandler(res, 400, { err });
    }
  }

  async addMedicine(req, res) {
    console.log(`POST Request: ${process.env.BACKEND_URL}/patient/add-medicine/`);

    const {
      patientId,
      name,
      asRequiredChecked,
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
      reminderTime,
    } = req.body;
    console.log('<== add med req body ==>', req.body);

    //  reminderDateTime saved as null in db if reminderChecked is false
    let reminderDateTime = null;

    // reminderDateTime to be calculated if reminderChecked is true
    if (reminderChecked) {
    // reminderDate contains dateTime string with correct date
    // reminderTime contains dateTime string with correct time
    // reminderDateTime is the concatenation of the correct date and time
      console.log('<== reminder checked splitting date ==>');
      const dateSplit = reminderDate.toString().split('T');
      const timeSplit = reminderTime.toString().split('T');
      reminderDateTime = dateSplit[0].concat('T', timeSplit[1]);
      console.log('<== reminderDateTime ==>', reminderDateTime);
    }

    try {
      const patient = await this.model.findOne({ _id: patientId });
      patient.medication.push({
        name,
        frequency: {
          asRequiredChecked,
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
          reminderTime,
          reminderDateTime,
        },
      });
      patient.save();

      // Function to send telegram message to all contacts in patient medEmailList
      const sendMessage = () => {
        patient.medEmailList.forEach(async (contact) => {
          await axios.post(`${process.env.TELEGRAM_API}/sendMessage`, {
            chat_id: contact.email,
            text: `Hey @${contact.name}, remember to get a refill of ${name} for ${patient.identity.name.first}.
            
            The current prescription will run out in ${reminderDays} day(s).`,
          });
        });
      };

      // If reminderChecked is true, schedule message to be sent
      if (reminderChecked) {
        const messageSchedule = new Date(reminderDateTime);
        console.log('<== messageSchedule ==>', messageSchedule);
        const job = new CronJob(messageSchedule, sendMessage);
        job.start();
      }
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

  async deleteMedicine(req, res) {
    console.log(`DELETE Request: ${process.env.BACKEND_URL}/patient/delete/`);
    console.log('<== delete route req query ==>', req.query);
    const { medicineId, patientId } = req.query;
    const patient = await this.model.findOne({ _id: patientId });
    console.log('<== patient ==>', patient);

    patient.medication = patient.medication.filter((medicine) => medicine._id.toString() !== medicineId);
    console.log('<== patient.medication ==>', patient.medication);
    patient.save();
    this.successHandler(res, 200, { success: true });
  }

  async test(req, res) {
    console.log('test test test');

    const sendMessage = async () => {
      await axios.post(`${process.env.TELEGRAM_API}/sendMessage`, {
        chat_id: 154976751,
        text: 'Hey Hsiu Ping, it\'s a beautiful day!',
      });
    };

    const messageSchedule = new Date('March 21, 2022 10:22:30');
    console.log('== message schedule', messageSchedule);
    const job = new CronJob(messageSchedule, sendMessage);
    console.log('== cron job ==', job);
    job.start();
    // console.log('<== send humpty dumpty ==>', message.data);
    this.successHandler(res, 200, { success: true });
  }
}

module.exports = PatientController;
