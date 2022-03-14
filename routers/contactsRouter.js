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
  //  Get data for all contacts related to user, outgoing and incoming requests & responses
  router.get('/load-page', controller.loadPage.bind(controller));
  return router;
};
