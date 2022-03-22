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
const messageRouter = require('./routers/messageRouter');

// Require controllers
const UserController = require('./controllers/userController');
const PatientController = require('./controllers/patientController');
const ContactsController = require('./controllers/contactsController');
const MessageController = require('./controllers/messageController');

// Require models
const UserModel = require('./models/userModel');
const PatientModel = require('./models/patientModel');
const ContactRequestModel = require('./models/contactRequestModel');

// Initialise controllers
const userController = new UserController(UserModel);
const patientController = new PatientController(PatientModel, UserModel);
const contactsController = new ContactsController(UserModel, PatientModel, ContactRequestModel);
const messageController = new MessageController(PatientModel);

// Set up routes
const { NGROK_URI } = process.env;

app.use('/user', userRouter(userController));
app.use('/patient', patientRouter(patientController));
app.use('/contacts', contactsRouter(contactsController));
app.use(NGROK_URI, messageRouter(messageController));

/*
 * ========================================================
 * ========================================================
 *
 *                     Telegram bot
 *
 * ========================================================
 * ========================================================
 */
const { TELEGRAM_API, WEBHOOK_URL } = process.env;

// sets webhook for telegram endpoint
const initTelegramBot = async () => {
  const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`);
  console.log('iniTelegramBot', res.data);
};

// set up end point where we receive updates from telegram
// app.post(NGROK_URI, async (req, res) => {
//   console.log('<== telegram bot req.body ==>', req.body);
//   res.status(200).json({ telebotRunning: true });
// });

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
      // call init here so that we always set webhook when connected to port
      await initTelegramBot();
      console.log('connected to telegram bot');
    });
  })
  .catch((err) => console.log(err));
