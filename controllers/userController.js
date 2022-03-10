/* eslint-disable class-methods-use-this */
/* eslint-disable consistent-return */
/* eslint-disable no-console */
/* eslint-disable no-useless-constructor */
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

    const {
      email: inputEmail,
      password: inputPassword,
    } = req.body;

    const user = await this.model.find({
      'identity.email': inputEmail,
    }).select({ identity: 1 });

    console.log('<== user ==>', user);

    // If user email not found, returns an empty array
    if (user.length === 0) {
      console.log('<== user not found ==>');

      this.errorHandler(res, 400, {
        loginSuccess: false,
        error: 'Incorrect email or password',
      });
    }

    // If user email found
    const {
      email,
      name,
      password: dbPassword,
    } = user[0].identity;
    const { _id: id } = user[0];

    try {
      // Verify password
      const verify = await argon2.verify(dbPassword, inputPassword);

      // If password is verified:
      // Sign JWT, send token with payload to FE
      // If password is incorrect:
      // Send error status

      if (verify) {
        const payload = { id, email, name };
        const token = jwt.sign(payload, JWT_SALT, { expiresIn: '10h' });

        this.successHandler(res, 200, {
          loginSuccess: true,
          token,
          payload,
        });
      } if (!verify) {
        return this.errorHandler(res, 400, {
          loginSuccess: false,
          error: 'Incorrect email or password',
        });
      }
    } catch (err) {
      this.errorHandler(res, 400, {
        loginSuccess: false,
        error: 'Incorrect email or password',
      });
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
      const hash = await argon2.hash(password);
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
      this.errorHandler(res, 400, {
        loginSuccess: false,
        error: 'Unsuccessful Signup. Please try again.',
      });
    }
    return this.successHandler(res, 200, {
      signupSuccess: true,
    });
  }

  async editProfile(req, res) {
    console.log(`PUT Request: ${BACKEND_URL}/user/profile`);
    this.successHandler(res, 200, {
      editSuccess: true,
    });
  }

  // Find family members linked to user
  async findFamily(req, res) {
    const {
      userId,
    } = req.query;

    const user = await this.model.findOne({ _id: userId });
    const familyMembers = user.family;
    return this.successHandler(res, 200, {
      data: familyMembers,
    });
  }
}

module.exports = UserController;
