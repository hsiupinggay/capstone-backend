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
 *            patient router with various paths
 *
 * ========================================================
 * ========================================================
 */

module.exports = function patientRouter(controller) {
  // test routes
  router.get('/foo', controller.foo.bind(controller));
  router.post('/add', controller.add.bind(controller));
  return router;
};
