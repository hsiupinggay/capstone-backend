/*
 * ========================================================
 * ========================================================
 *
 *                      Imports
 *
 * ========================================================
 * ========================================================
 */
const BaseController = require('./baseController');

require('dotenv').config();

/*
 * ========================================================
 * ========================================================
 *
 *                    Patient Controller
 *
 * ========================================================
 * ========================================================
 */
class PatientController extends BaseController {
  constructor(model) {
    super(model);
  }

  async foo(req, res) {
    console.log('GET Request: BACKEND_URL/patient/foo');
  }

  async add(req, res) {
    console.log('POST Request: BACKEND_URL/patient/add');

    const {
      firstName, lastName, dob, photo,
    } = req.body;

    // create new patient
    await this.model.create({
      identity: {
        name: {
          first: firstName,
          last: lastName,
        },
        photo,
        dob,
      },
    });

    res.status(200).json({ addSuccess: true });
  }
}

module.exports = PatientController;
