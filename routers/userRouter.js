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
const authToken = require('../middleware/authentication');

// Set name of photo upload directory
const multerUpload = multer({ dest: './public/uploads' });
const router = express.Router();

/*
 * ========================================================
 * ========================================================
 *
 *            User router with various paths
 *
 * ========================================================
 * ========================================================
 */

module.exports = function userRouter(controller) {
  // login
  router.post('/login', controller.login.bind(controller));
  // signup
  router.post('/signup', controller.signup.bind(controller));
  // not working
  router.put('/profile', authToken(), controller.editProfile.bind(controller));
  // authenticate user
  router.get('/authenticate', controller.authenticate.bind(controller));
  router.get('/all-contacts', controller.findContacts.bind(controller));
  router.post('/photo', multerUpload.single('photo'), controller.uploadPhoto.bind(controller));
  // edit profile
  router.post('/edit', controller.editProfile.bind(controller));
  return router;
};
