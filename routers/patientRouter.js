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
const multer = require('multer');

// Set name of photo upload directory
const multerUpload = multer({ dest: './public/uploads' });
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
  return router;
};
