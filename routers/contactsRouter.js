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
 *           Contacts router with various paths
 *
 * ========================================================
 * ========================================================
 */
module.exports = function contactsRouter(controller) {
  // Get contacts and patients data related to user
  router.get('/load-page', controller.loadPage.bind(controller));
  return router;
};
