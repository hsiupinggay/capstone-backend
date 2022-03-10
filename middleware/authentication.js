const jwt = require('jsonwebtoken');
require('dotenv').config();

const { JWT_SALT } = process.env;

// Authentication Middleware to be imported in routers
// Receives headers sent by FE and verifies

const authToken = () => (req, res, next) => {
  console.log('<== req.headers ==>', req.headers);
  try {
    const authHeader = req.headers.authorization;
    console.log('<== authHeader ==>', authHeader);

    const token = authHeader && authHeader.split(' ')[1];
    console.log('<== token ==>', token);
    if (token == null) return res.status(401).redirect('/');
    const verify = jwt.verify(token, JWT_SALT);

    console.log('<== Token Verified ==>', verify);
    res.status(200).json({ verified: true });
    next();
  } catch (err) {
    return res.send(403).redirect('/');
  }
};

module.exports = authToken;
