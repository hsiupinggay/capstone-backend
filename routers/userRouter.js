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
  router.post('/login', controller.login.bind(controller));
  router.post('/signup', controller.signup.bind(controller));
  router.put('/profile', authToken(), controller.editProfile.bind(controller));
<<<<<<< HEAD
  router.get('/authenticate', controller.authenticate.bind(controller));
=======
  router.get('/all-family', controller.findFamily.bind(controller));

>>>>>>> 5a76a0e2d99e9bc742ec537a50f5827b381ad3cc
  return router;
};
