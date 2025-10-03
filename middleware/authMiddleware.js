// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require("../models/User")
const tokenBlacklist = new Set();
// Function to generate JWT token
exports.generateAuthToken = (user) => {
  const secretKey = 'zohaibranahere'; // Replace with your secret key
  const token = jwt.sign({ id: user.id, email: user.email }, secretKey, { expiresIn: '21h' }); // Token expires in 1 hour
  return token;
};
exports.authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    if (tokenBlacklist.has(token)) {
      return res.status(401).json({ message: 'Token revoked. Please sign in again.' });
    }
    const decoded = jwt.verify(token, 'zohaibranahere');
    const user = await User.findByPk(decoded.id);
    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Unauthorized' });
  }
};

exports.tokenBlacklist = tokenBlacklist;