const jwt = require('jsonwebtoken');
require('dotenv').config();

console.log(require('crypto').randomBytes(64).toString('hex'));

const { JWT_SALT } = process.env;

const authToken = () => (req, res, next) => {
  console.log('<== req.headers ==>', req.headers);
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.status(401).redirect('/');
    jwt.verify(token, JWT_SALT);

    console.log('<== Token Verified ==>');
    next();
  } catch (err) {
    return res.send(403).redirect('/');
  }
};

module.exports = authToken;
