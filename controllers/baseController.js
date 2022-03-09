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

  successHandler(res, status, payload) {
    console.log('Payload', payload);
    res.status(status).json(payload);
  }

  errorHandler(res, status, err) {
    console.error('Error', err);
    res.status(status).json(err);
  }
}

module.exports = BaseController;
