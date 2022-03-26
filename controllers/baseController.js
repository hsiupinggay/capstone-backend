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
    res.status(status).json(payload);
  }

  errorHandler(res, status, err) {
    res.status(status).json(err);
  }
}

module.exports = BaseController;
