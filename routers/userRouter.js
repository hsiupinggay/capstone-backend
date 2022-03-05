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
 *            User router with various paths
 *
 * ========================================================
 * ========================================================
 */

module.exports = function userRouter(controller) {
  router.get('/login', controller.login.bind(controller));

  router.post('/signup', controller.signup.bind(controller));
  return router;
};
