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
const userRouter = require('./routers/userRouter');
const patientRouter = require('./routers/patientRouter');

// Require controllers
const UserController = require('./controllers/userController');
const PatientController = require('./controllers/patientController');

// Require models
const UserModel = require('./models/userModel');
const PatientModel = require('./models/patientModel');
const familyRequestModel = require('./models/familyRequestModel');

// Initialise controllers
const userController = new UserController(UserModel);
const patientController = new PatientController(PatientModel, UserModel);

// Set up routes
app.use('/user', userRouter(userController));
app.use('/patient', patientRouter(patientController));

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
    app.listen(PORT);
    console.log(`connected to port ${PORT}`);
    console.log('connected to db');
  })
  .catch((err) => console.log(err));
