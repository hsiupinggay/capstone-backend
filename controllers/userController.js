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
const handleImage = require('../utils/photoUploader');
const authToken = require('../middleware/authentication');
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
    // Get photo if photo field exists
    const photo = user[0].identity?.photo;

    try {
      // Verify password
      const verify = await argon2.verify(dbPassword, inputPassword);

      // If password is verified:
      // Sign JWT, send token with payload to FE
      // If password is incorrect:
      // Send error status

      if (verify) {
        const payload = {
          id, email, name, photo,
        };
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
    console.log(`PUT Request: ${BACKEND_URL}/user/edit`);
    const {
      currentEmail, currentLastName, currentFirstName, userId,
    } = req.body;
    const user = await this.model.findOne({ _id: userId });

    if (user.identity.email !== currentEmail) user.identity.email = currentEmail;
    if (user.identity.name.first !== currentFirstName) user.identity.name.first = currentFirstName;
    if (user.identity.name.last !== currentLastName) user.identity.name.last = currentLastName;

    user.save();
    const payload = {
      userId,
      email: user.identity.email,
      name: user.identity.name,
    };
    this.successHandler(res, 200, {
      success: true,
      payload,
    });
  }

  async authenticate(req, res) {
    console.log(`GET Request: ${BACKEND_URL}/user/auth`);
    console.log('<== req.headers ==>', req.headers);
    try {
      const authHeader = req.headers.authorization;
      console.log('<== authHeader ==>', authHeader);

      const token = authHeader && authHeader.split(' ')[1];
      console.log('<== token ==>', token);
      if (token == null) return res.status(401).redirect('/auth');
      const verify = jwt.verify(token, JWT_SALT);

      console.log('<== Token Verified ==>', verify);
      // send decrypted user payload to front end
      const { id, email, name } = verify;
      this.successHandler(res, 200, {
        verified: true,
        id,
        email,
        name,
      });
    } catch (err) {
      return this.errorHandler(res, 401, {
        error: 'something went wrong',
      });
    }
  }

  // Find family members linked to user
  async findFamily(req, res) {
    const {
      userId,
    } = req.query;
    try {
      const user = await this.model.findOne({ _id: userId });
      const familyMembers = user.family;
      return this.successHandler(res, 200, { data: familyMembers });
    } catch (err) {
      return this.errorHandler(res, 400, { err });
    }
  }

  // Upload or change photo
  async uploadPhoto(req, res) {
    console.log(`POST Request: ${BACKEND_URL}/user/photo`);

    const photo = req.file;
    const { userId } = req.body;
    console.log('<== photo ==>', photo);
    // Store profile pic in AWS S3 and return image link for storage in DB
    try {
      const imageLink = await handleImage(req.file);
      console.log('<== image link ==>', imageLink);
      const user = await this.model.findOne({ _id: userId });
      user.identity.photo = imageLink;
      console.log('<== user before save ==>', user);
      await user.save();
      const userPhoto = user.identity.photo;
      this.successHandler(res, 200, {
        success: true,
        userPhoto,
      });
    } catch (err) {
      this.errorHandler(res, 400, {
        success: false,
      });
    }
  }
}

module.exports = UserController;
