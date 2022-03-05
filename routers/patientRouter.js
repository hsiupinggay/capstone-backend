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
