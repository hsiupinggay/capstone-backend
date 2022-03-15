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
  // When user opens add new contact popup, retrieve list of other users
  router.get('/get-contacts', controller.getContacts.bind(controller));
  // When user adds new contact, create contact request in DB
  router.post('/add-contact', controller.addContact.bind(controller));
  // When user opens contact settings, retrieve and send patient visibility
  router.get('/get-visible-patients-list', controller.findVisiblePatients.bind(controller));
  return router;
};
