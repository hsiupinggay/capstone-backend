/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
/*
 * ========================================================
 * ========================================================
 *
 *                    Base Controller
 *
 * ========================================================
 * ========================================================
 */
class BaseController {
  constructor(model) {
    this.model = model;
  }

  errorHandler(err, res) {
    console.error('Error', err);
    res.send(err);
  }
}

module.exports = BaseController;
