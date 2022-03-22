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
  // Add new medicine to specific patient
  router.post('/add-medicine', controller.addMedicine.bind(controller));
  // View list of medicine of specific patient
  router.get('/med-list', controller.viewMedicineList.bind(controller));
  // View specific medicine
  router.get('/view-med', controller.viewMedicine.bind(controller));
  // Edit specific medicine
  router.post('/edit-med', controller.editMedicine.bind(controller));
  // Delete specific medicine
  router.delete('/delete', controller.deleteMedicine.bind(controller));

  router.post('/test', controller.test.bind(controller));
  return router;
};
