/* eslint-disable no-param-reassign */
/* eslint-disable max-len */
/* eslint-disable no-console */
/*
 * ========================================================
 * ========================================================
 *
 *                       Imports
 *
 * ========================================================
 * ========================================================
 */
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const { Server } = require('socket.io');
const { createServer } = require('http');
const { default: axios } = require('axios');
const initChatsSocketController = require('./controllerSocket/initChatsSocketController');

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

// Initialise Socket.IO server
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    credentials: true,
    origin: FRONTEND_URL,
  },
});

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
const { URI } = process.env;

app.use('/user', userRouter(userController));
app.use('/patient', patientRouter(patientController));
app.use('/contacts', contactsRouter(contactsController));
app.use(URI, messageRouter(messageController));

/*
 * ========================================================
 * ========================================================
 *
 *                     Telegram bot
 *
 * ========================================================
 * ========================================================
 */
const { TELEGRAM_API, BACKEND_URL } = process.env;

const WEBHOOK_URL = BACKEND_URL.concat(URI);

// sets webhook for telegram endpoint
const initTelegramBot = async () => {
  await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`);
};

/*
 * ========================================================
 * ========================================================
 *
 *                   Socket Routes
 *
 * ========================================================
 * ========================================================
 */
const chatsSocketController = initChatsSocketController();

io.on('connection', (socket) => {
  // Request frontend to send user data after connection
  socket.emit('Send data');

  // Upon receiving data, store in collection and send messages to frontend
  socket.on('Sent data to backend', (data) => {
    data.userSocketId = socket.id;
    chatsSocketController.onlineChat(socket, data);
  });

  // Upon receiving message, store in DB and inform user and textee (if they are also in the chatroom)
  socket.on('Send message', (data) => {
    chatsSocketController.saveMessage(socket, data, io);
  });

  // On disconnect from socket, remove document from Online Chat colleciton
  socket.on('disconnect', () => {
    chatsSocketController.offlineChat(socket.id);
  });
});

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
    httpServer.listen(PORT, async () => {
      console.log(`connected to port ${PORT}`);
      console.log('connected to db');
      // call init here so that we always set webhook when connected to port
      // await initTelegramBot();
      // console.log('connected to telegram bot');
    });
  })
  .catch((err) => console.log(err));
