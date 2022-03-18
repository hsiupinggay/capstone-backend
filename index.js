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

/*
 * ========================================================
 * ========================================================
 *
 *                    Socket Routes
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
    httpServer.listen(PORT);
    console.log(`connected to port ${PORT}`);
    console.log('connected to db');
  })
  .catch((err) => console.log(err));
