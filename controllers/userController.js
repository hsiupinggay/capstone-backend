/*
 * ========================================================
 * ========================================================
 *
 *                      Imports
 *
 * ========================================================
 * ========================================================
 */
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const BaseController = require('./baseController');
require('dotenv').config();

const { BACKEND_URL, ARGON_SALT, JWT_SALT } = process.env;

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
    console.log(`POST Request: ${BACKEND_URL}/user/login`);
    const { email: userEmail, password } = req.body;
    const hash = await argon2.hash(password, ARGON_SALT);

    const user = await this.model.find({ 'identity.email': userEmail }).select({ identity: 1 });
    console.log('<== user found ==>', user);
    try {
      const verify = await argon2.verify(user.identity.password, hash);
      if (verify) {
        const { email, name } = user.identity;
        const { _id: id } = user;
        const payload = { id, email };
        const token = jwt.sign(payload, JWT_SALT, { expiresIn: '10h' });
        res.status(200).json({
          loginSuccess: true, token, payload, id, name,
        });
      }
    } catch (err) {
      this.errorHandler(err, res);
    }
  }

  async signup(req, res) {
    console.log(`POST Request: ${BACKEND_URL}/user/signup`);

    // Get user input from body
    const {
      firstName, lastName, email, password,
    } = req.body;

    console.log('<== sign up req.body ==>', req.body);

    try {
      // Hash password with Argon2
      const hash = await argon2.hash(password, ARGON_SALT);
      console.log('<== Ar Hashed ==>', hash);

      // Add user to DB
      const newUser = await this.model.create({
        identity: {
          name: {
            first: firstName,
            last: lastName,
          },
          email,
          password: hash,
        },
      });

      console.log('<== new user ==>', newUser);
    } catch (err) {
      this.errorHandler(err, res);
    }
    return res.status(200).json({ signupSucess: true });
  }
}

module.exports = UserController;
