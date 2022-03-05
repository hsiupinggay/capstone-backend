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
 *                    User Controller
 *
 * ========================================================
 * ========================================================
 */
class UserController extends BaseController {
  constructor(model) {
    super(model);
  }

  async login(req, res) {
    console.log('GET Request: BACKEND_URL/user/login');
  }

  async signup(req, res) {
    console.log('POST Request: BACKEND_URL/user/signup');
    const {
      firstName, lastName, email, password, photo,
    } = req.body;
    console.log(req.body);
    await this.model.create({
      identity: {
        name: {
          first: firstName,
          last: lastName,
        },
        email,
        password,
        photo,
      },
    });
    return res.status(200).json({ signupSucess: true });
  }
}

module.exports = UserController;
