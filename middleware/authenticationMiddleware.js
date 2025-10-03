const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assuming your User model is exported correctly from models/User.js

const authenticateUser = async (req, res, next) => {
  try {
    // Get the token from the request header
    const token = req.headers.authorization.split(' ')[1]; // Assuming token is passed in the format "Bearer <token>"
    
    // Verify the token
    const decoded = jwt.verify(token, "zohaibranahere"); // Use your JWT secret here
    
    // Find the user based on the decoded user ID
    const user = await User.findByPk(decoded.id); // Assuming your user ID is stored in the token as "id"
    
    // Attach the user object to the request
    req.user = user;
    
    // Call next middleware
    next();
  } catch (error) {
    // Handle authentication error
    console.error(error);
    res.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports = authenticateUser;
