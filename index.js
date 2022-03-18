/* eslint-disable no-console */
/*
 * ========================================================
 * ========================================================
 *
 *                        Imports
 *
 * ========================================================
 * ========================================================
 */
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

/*
* ========================================================
* ========================================================
*
*                    Server middleware
*
* ========================================================
* ========================================================
*/
// Initialise Express instance
const app = express();
// Set CORS headers
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({
  credentials: true,
  origin: FRONTEND_URL,
}));
// Bind Express middleware to parse JSON request bodies
app.use(express.json());
// Bind Express middleware to parse request bodies for POST requests
app.use(express.urlencoded({ extended: false }));
// Expose the files stored in the public folder
app.use(express.static('public'));

/*
 * ========================================================
 * ========================================================
 *
 *                  Routes + Controllers
 *
 * ========================================================
 * ========================================================
 */
// Require routers
const { default: axios } = require('axios');
const userRouter = require('./routers/userRouter');
const patientRouter = require('./routers/patientRouter');
const contactsRouter = require('./routers/contactsRouter');

// Require controllers
const UserController = require('./controllers/userController');
const PatientController = require('./controllers/patientController');
const ContactsController = require('./controllers/contactsController');

// Require models
const UserModel = require('./models/userModel');
const PatientModel = require('./models/patientModel');
const ContactRequestModel = require('./models/contactRequestModel');

// Initialise controllers
const userController = new UserController(UserModel);
const patientController = new PatientController(PatientModel, UserModel);
const contactsController = new ContactsController(UserModel, PatientModel, ContactRequestModel);

// Set up routes
app.use('/user', userRouter(userController));
app.use('/patient', patientRouter(patientController));
app.use('/contacts', contactsRouter(contactsController));

// initiate telegram bot
const { TELE_TOKEN, NGROK_SERVER } = process.env;
const NGROK_URI = `/webhook/${TELE_TOKEN}`;
const WEBHOOK_URL = NGROK_SERVER + NGROK_URI;
const TELEGRAM_API = `https://api.telegram.org/bot${TELE_TOKEN}`;

const initTelegramBot = async () => {
  const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`);
  console.log('iniTelegramBot', res.data);
};

/*
 * ========================================================
 * ========================================================
 *
 *        Set Express to listen on the given port
 *
 * ========================================================
 * ========================================================
 */
const uri = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3004;

// Only connect to port after connecting to db
mongoose.connect(uri)
  .then(() => {
    app.listen(PORT, async () => {
      console.log(`connected to port ${PORT}`);
      console.log('connected to db');
      await initTelegramBot();
      console.log('connected to telegram bot');
    });
  })
  .catch((err) => console.log(err));
