/* eslint-disable consistent-return */
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

const { ARGON_SALT, JWT_SALT } = process.env;

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
    const {
      email: inputEmail,
      password: inputPassword,
    } = req.body;

    const user = await this.model.find({
      'identity.email': inputEmail,
    }).select({ identity: 1 });

    // If user email not found, returns an empty array
    if (user.length === 0) {
      return this.errorHandler(res, 400, {
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
    const { photo } = user[0].identity;

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

        return this.successHandler(res, 200, {
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
    // Get user input from body
    const {
      firstName, lastName, email, password,
    } = req.body;

    try {
      // Hash password with Argon2
      const hash = await argon2.hash(password);

      // Add user to DB
      await this.model.create({
        identity: {
          name: {
            first: firstName,
            last: lastName,
          },
          email,
          password: hash,
        },
      });
    } catch (err) {
      return this.errorHandler(res, 400, {
        loginSuccess: false,
        error: 'Unsuccessful Signup. Please try again.',
      });
    }
    return this.successHandler(res, 200, {
      signupSuccess: true,
    });
  }

  async editProfile(req, res) {
    const {
      currentEmail, currentLastName, currentFirstName, userId,
    } = req.body;
    const user = await this.model.findOne({ _id: userId });

    if (user.identity.email !== currentEmail) user.identity.email = currentEmail;
    if (user.identity.name.first !== currentFirstName) user.identity.name.first = currentFirstName;
    if (user.identity.name.last !== currentLastName) user.identity.name.last = currentLastName;

    await user.save();
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
    try {
      const authHeader = req.headers.authorization;

      const token = authHeader && authHeader.split(' ')[1];
      if (token == null) return res.status(401).redirect('/auth');
      const verify = jwt.verify(token, JWT_SALT);

      // Send decrypted user payload to front end
      const {
        id, email, name, photo,
      } = verify;
      this.successHandler(res, 200, {
        verified: true,
        id,
        email,
        name,
        photo,
      });
    } catch (err) {
      return this.errorHandler(res, 401, {
        error: 'something went wrong',
      });
    }
  }

  // Find contacts linked to user
  async findContacts(req, res) {
    const {
      userId,
    } = req.query;
    try {
      const user = await this.model.findOne({ _id: userId });
      const { contacts } = user;
      return this.successHandler(res, 200, { data: contacts });
    } catch (err) {
      return this.errorHandler(res, 400, { err });
    }
  }

  // Upload or change photo
  async uploadPhoto(req, res) {
    const { userId } = req.body;
    // Store profile pic in AWS S3 and return image link for storage in DB

    try {
      const imageLink = await handleImage(req.file);
      const user = await this.model.findOne({ _id: userId });
      user.identity.photo = imageLink;
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
