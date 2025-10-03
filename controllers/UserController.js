const User = require('../models/User');
const UserFollow  = require("../models/UserFollow")
const {generateAuthToken, tokenBlacklist}=require("../middleware/authMiddleware")
const { hashPassword, comparePasswords } = require('../utils/passwordUtils');
const cloudinary = require('../config/cloudinary');
exports.uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming you have authentication middleware to get the user ID
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'profile_images', // Optional: folder in Cloudinary to store images
    });

    // Update the user's profileImage field in the database
    await User.update({ profileImage: result.secure_url }, { where: { id: userId } });

    // Fetch the updated user details after the profile image is updated
    const updatedUser = await User.findByPk(userId);

    // Construct the response object with both user details and image path
    const response = {
      message: 'Profile image uploaded successfully',
      user: {
        ...updatedUser.toJSON(), // Convert Sequelize instance to plain JSON object
        profileImage: result.secure_url, // Add the Cloudinary image URL
      },
    };

    // Send the response
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};
// const baseUrl = process.env.BASE_URL || 'http://localhost:3000'; // Replace with your actual base URL

// exports.uploadProfileImage = async (req, res) => {
//   try {
//     const userId = req.user.id; // Assuming you have authentication middleware to get the user ID
//     const profileImagePath = req.file.path; // Path to the uploaded image
//     // Update the user's profileImage field in the database
//     await User.update({ profileImage: profileImagePath }, { where: { id: userId } });

//     // Fetch the updated user details after the profile image is updated
//     const updatedUser = await User.findByPk(userId);

//     // Replace backslashes with forward slashes in the image path
//     const normalizedProfileImagePath = profileImagePath.replace(/\\/g, '/');

//     // Construct the response object with both user details and image path
//     const response = {
//       message: 'Profile image uploaded successfully',
//       // user: updatedUser, // User details
//       // imagePath: normalizedProfileImagePath // Normalized path to the uploaded image
//       user: {
//         ...updatedUser.toJSON(), // Convert Sequelize instance to plain JSON object
//         profileImage: normalizedProfileImagePath // Add the normalized profile image path
//       }
//     };

//     // Send the response
//     res.json(response);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server Error' });
//   }
// };
exports.getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Replace backslashes with forward slashes in the image path
    const normalizedProfileImagePath = user.profileImage.replace(/\\/g, '/');
    const fullImagePath = `/${normalizedProfileImagePath}`;

    // Construct the response object with user details and image path
    const response = {
      ...user.toJSON(), // Convert Sequelize instance to plain JSON object
      profileImage: fullImagePath // Add the full image path with base URL
    };

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { followingId } = req.body;

    // Create a new UserFollow record
    await UserFollow.create({ followerId: userId, followingId });

    res.status(201).json({ message: 'User followed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { followingId } = req.body;

    // Delete the UserFollow record
    await UserFollow.destroy({ where: { followerId: userId, followingId } });

    res.json({ message: 'User unfollowed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password } = req.body;
    const updatedUser = await User.update({ username, email, password }, { where: { id } });
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.destroy({ where: { id } });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (user) {
      const passwordMatch = await comparePasswords(password, user.password);
      if (passwordMatch) {
        const token = generateAuthToken(user);
        // Include user object along with the token in the response
        res.json({ token, user });
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await hashPassword(password);
    const newUser = await User.create({ username, email, password: hashedPassword });
    res.status(201).json(newUser);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ message: 'Email address already exists' });
    } else {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
    }
  }
};

// Define the controller method for changing passwords
exports.changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

    // Find the user by ID
    let user = await User.findByPk(id);

    // Log user data for debugging
    console.log('User found:', user);

    // Verify the old password
    console.log('Old password:', oldPassword);
    console.log('User password:', user.password);
    const passwordMatch = await comparePasswords(oldPassword, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Old password is incorrect' });
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update the user's password in the database
    await User.update({ password: hashedPassword }, { where: { id } });

    // Fetch the updated user details
    user = await User.findByPk(id);

    // Send a success response along with the updated user object
    res.status(200).json({ success: true, message: 'Password changed successfully', user });
  
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};
// controllers/UserController.js

exports.changeEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { newEmail } = req.body;

    // Find the user by ID
    let user = await User.findByPk(id);

    // Check if the new email address is already taken
    const existingUser = await User.findOne({ where: { email: newEmail } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email address is already in use' });
    }

    // Update the user's email address in the database
    await User.update({ email: newEmail }, { where: { id } });

    // Fetch the updated user details
    user = await User.findByPk(id);

    // Send a success response along with the updated user object
    res.status(200).json({ success: true, message: 'Email changed successfully', user });
  
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};
exports.signoutUser = async (req, res) => { // Signout controller
  try {
    const token = req.headers.authorization.split(' ')[1];
    tokenBlacklist.add(token); // Add the token to the blacklist
    res.json({ message: 'Successfully signed out' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};