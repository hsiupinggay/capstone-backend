/*
 * ========================================================
 * ========================================================
 *
 *                      Imports
 *
 * ========================================================
 * ========================================================
 */
const express = require('express');

const router = express.Router();

/*
 * ========================================================
 * ========================================================
 *
 *            Patient router with various paths
 *
 * ========================================================
 * ========================================================
 */
module.exports = function patientRouter(controller) {
  // Get list of all patient data related to user
  router.get('/all-patients-list', controller.allPatientsList.bind(controller));
  // Add new appointment
  router.post('/add-appointment', controller.addAppointment.bind(controller));
  // Add new patient
  router.post('/add-patient', controller.addPatient.bind(controller));
  // Add new hospital
  router.post('/add-hospital', controller.addHospital.bind(controller));
  // Add new department
  router.post('/add-department', controller.addDepartment.bind(controller));
  // Add new chaperone
  router.post('/add-chaperone', controller.addChaperone.bind(controller));
  // Get list of all patient names related to user
  router.get('/all-patients-names', controller.allPatientsNames.bind(controller));
  // Get patient's data for patient profile page
  router.get('/patient-data', controller.getIndividualPatientData.bind(controller));
  // Add user's relationship to patient
  router.post('/add-relationship', controller.addRelationship.bind(controller));
  // Get patient's visit details for patient visit details page
  router.get('/patient-data-visit-details', controller.getPatientVisitDetails.bind(controller));
  return router;
};
