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
  // Get data for all contacts related to user, outgoing and incoming requests & responses
  router.get('/load-page', controller.loadPage.bind(controller));
  // Remove contact request outcome from DB
  router.post('/dismiss-notification', controller.removeNotification.bind(controller));
  // When user accepts/rejects request, alter DB accordings
  router.post('/handle-request', controller.handleRequest.bind(controller));
  return router;
};
