const User = require('../models/User');
const UserFollow  = require("../models/UserFollow")
const {generateAuthToken, tokenBlacklist}=require("../middleware/authMiddleware")
const { hashPassword, comparePasswords } = require('../utils/passwordUtils');
const cloudinary = require('../config/cloudinary');
const Rating = require('../models/Rating');
const BarSequelize = require('../models/BarSequelize');
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

// OTP and Password Reset Controllers

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // TODO: Implement OTP verification logic
    // - Validate email and OTP are provided
    // - Find the OTP record in database (requires OTP model/table)
    // - Check if OTP matches and is not expired
    // - Mark user as verified if OTP is valid
    // - Delete/invalidate the OTP after successful verification

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Placeholder response
    res.json({
      success: true,
      message: 'OTP verified successfully',
      verified: true
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // TODO: Implement OTP resend logic
    // - Validate email is provided
    // - Check if user exists with this email
    // - Generate new OTP (6-digit code)
    // - Store OTP in database with expiration time (typically 5-10 minutes)
    // - Send OTP via email using nodemailer or similar service
    // - Return success response

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Placeholder response
    res.json({
      success: true,
      message: 'OTP resent successfully',
      email: email
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // TODO: Implement forgot password logic
    // - Validate email is provided
    // - Check if user exists with this email
    // - Generate OTP for password reset
    // - Store OTP in database with expiration time
    // - Send OTP via email to user
    // - Return success response

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    // Placeholder response
    res.json({
      success: true,
      message: 'Password reset OTP sent to your email',
      email: email
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.forgotVerifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // TODO: Implement OTP verification for password reset
    // - Validate email and OTP are provided
    // - Find the OTP record in database for password reset
    // - Check if OTP matches and is not expired
    // - Generate a temporary token for password reset (valid for 15-30 minutes)
    // - Return token that can be used for password reset

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Placeholder response
    res.json({
      success: true,
      message: 'OTP verified successfully',
      resetToken: 'placeholder_reset_token',
      email: email
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword, resetToken } = req.body;

    // TODO: Implement password reset logic
    // - Validate email, newPassword, and resetToken are provided
    // - Verify resetToken is valid and not expired
    // - Find user by email
    // - Hash the new password
    // - Update user's password in database
    // - Invalidate the reset token
    // - Send confirmation email
    // - Return success response

    if (!email || !newPassword || !resetToken) {
      return res.status(400).json({ message: 'Email, new password, and reset token are required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Placeholder for actual implementation
    // const hashedPassword = await hashPassword(newPassword);
    // await User.update({ password: hashedPassword }, { where: { email } });

    // Placeholder response
    res.json({
      success: true,
      message: 'Password reset successfully',
      email: email
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Social Features Endpoints

exports.getFollowerAndFollowing = async (req, res) => {
  try {
    const { userId } = req.params;

    // TODO: Implement full logic to fetch followers and following from database
    // Query UserFollow model to get all followers (where followingId = userId)
    // Query UserFollow model to get all following (where followerId = userId)
    // Join with User model to get user details for each follower/following

    // Placeholder response
    const followers = await UserFollow.findAll({
      where: { followingId: userId },
      include: [{ model: User, as: 'follower' }]
    });

    const following = await UserFollow.findAll({
      where: { followerId: userId },
      include: [{ model: User, as: 'following' }]
    });

    res.json({
      followers: followers.map(f => f.follower || { id: f.followerId }),
      following: following.map(f => f.following || { id: f.followingId }),
      followerCount: followers.length,
      followingCount: following.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getUserProfileWithFriend = async (req, res) => {
  try {
    const { userId } = req.params;

    // TODO: Implement full logic to fetch user profile with friends data
    // Fetch user details
    // Fetch mutual friends
    // Fetch friend suggestions
    // Calculate friendship status if authenticated user is provided

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Placeholder response with mock friends data
    res.json({
      user: user.toJSON(),
      friends: [],
      mutualFriends: [],
      friendshipStatus: 'none', // Options: 'none', 'pending', 'following', 'friends'
      friendCount: 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getFollowerCount = async (req, res) => {
  try {
    const { userId } = req.params;

    // TODO: Implement full logic to count followers
    // Count all UserFollow records where followingId = userId

    const followerCount = await UserFollow.count({
      where: { followingId: userId }
    });

    res.json({
      userId,
      followerCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getFollowingCount = async (req, res) => {
  try {
    const { userId } = req.params;

    // TODO: Implement full logic to count following
    // Count all UserFollow records where followerId = userId

    const followingCount = await UserFollow.count({
      where: { followerId: userId }
    });

    res.json({
      userId,
      followingCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getUserVisitCounts = async (req, res) => {
  try {
    const { userId } = req.params;

    // TODO: Implement full logic to fetch user visit counts
    // This would require a UserVisit or UserAnalytics model to track:
    // - Profile visits
    // - Content views
    // - Last visit timestamp
    // - Unique visitors

    // Placeholder response
    res.json({
      userId,
      profileVisits: 0,
      totalViews: 0,
      uniqueVisitors: 0,
      lastVisit: null,
      visitHistory: []
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getBlockedUsers = async (req, res) => {
  try {
    // TODO: Implement full logic to fetch blocked users
    // This would require a UserBlock model to track blocked relationships
    // Get authenticated user ID from req.user
    // Query UserBlock model where blockerId = authenticated user ID
    // Join with User model to get details of blocked users

    const userId = req.user.id;

    // Placeholder response - assuming a UserBlock model would exist
    // const blockedUsers = await UserBlock.findAll({
    //   where: { blockerId: userId },
    //   include: [{ model: User, as: 'blockedUser' }]
    // });

    res.json({
      blockedUsers: [],
      count: 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Saved bars controller methods
exports.getSavedBars = async (req, res) => {
  try {
    const { userId } = req.params;

    // TODO: Implement logic to fetch saved bars from database
    // TODO: Query the SavedBars model/table with userId
    // TODO: Join with Bars table to get full bar details

    res.json({
      message: 'Get saved bars endpoint',
      userId,
      savedBars: [] // Placeholder response
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.saveBar = async (req, res) => {
  try {
    const { userId } = req.params;
    const { barId } = req.body;

    // TODO: Implement logic to save a bar
    // TODO: Validate that the bar exists
    // TODO: Check if bar is already saved by this user
    // TODO: Create SavedBar record in database

    res.status(201).json({
      message: 'Bar saved successfully',
      userId,
      barId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.removeSavedBar = async (req, res) => {
  try {
    const { userId, barId } = req.params;

    // TODO: Implement logic to remove a saved bar
    // TODO: Delete SavedBar record from database
    // TODO: Handle case where saved bar doesn't exist

    res.json({
      message: 'Saved bar removed successfully',
      userId,
      barId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// GET /api/users/timeline - Get current user's timeline (ratings)
exports.getTimeline = async (req, res) => {
  try {
    const userId = req.user.id;

    const ratings = await Rating.findAll({
      where: { UserId: userId },
      include: [
        {
          model: BarSequelize,
          attributes: ['id', 'name', 'photos', 'place_id', 'vicinity', 'geometry']
        },
        {
          model: User,
          attributes: ['id', 'username', 'profileImage']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    // Add reviewCount to each bar (placeholder - you may want to calculate actual review counts)
    const ratingsWithReviewCount = ratings.map(rating => {
      const ratingData = rating.toJSON();
      if (ratingData.Bar) {
        ratingData.Bar.reviewCount = ratingData.Bar.user_ratings_total || 0;
      }
      return ratingData;
    });

    res.json({ ratings: ratingsWithReviewCount });
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// GET /api/users/:userId/timeline - Get specific user's timeline
exports.getUserTimeline = async (req, res) => {
  try {
    const { userId } = req.params;

    const ratings = await Rating.findAll({
      where: { UserId: userId },
      include: [
        {
          model: BarSequelize,
          attributes: ['id', 'name', 'photos', 'place_id', 'vicinity', 'geometry']
        },
        {
          model: User,
          attributes: ['id', 'username', 'profileImage']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    // Add reviewCount to each bar
    const ratingsWithReviewCount = ratings.map(rating => {
      const ratingData = rating.toJSON();
      if (ratingData.Bar) {
        ratingData.Bar.reviewCount = ratingData.Bar.user_ratings_total || 0;
      }
      return ratingData;
    });

    res.json({ ratings: ratingsWithReviewCount });
  } catch (error) {
    console.error('Error fetching user timeline:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// GET /api/users/me/recent-visits - Get current user's recent bar visits (based on ratings)
exports.getRecentVisits = async (req, res) => {
  try {
    const userId = req.user.id;

    const recentVisits = await Rating.findAll({
      where: { UserId: userId },
      include: [
        {
          model: BarSequelize,
          attributes: ['id', 'name', 'photos', 'place_id', 'vicinity', 'geometry', 'user_ratings_total', 'price_level']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 20
    });

    res.json(recentVisits);
  } catch (error) {
    console.error('Error fetching recent visits:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// GET /api/users/followinguser/recent-visits - Get friends' recent visits
exports.getFollowingRecentVisits = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get users that the current user is following
    const following = await UserFollow.findAll({
      where: { followerId: userId },
      attributes: ['followingId']
    });

    const followingIds = following.map(f => f.followingId);

    if (followingIds.length === 0) {
      return res.json([]);
    }

    // Get recent visits from followed users
    const recentVisits = await Rating.findAll({
      where: { UserId: followingIds },
      include: [
        {
          model: BarSequelize,
          attributes: ['id', 'name', 'photos', 'place_id', 'vicinity', 'geometry', 'user_ratings_total', 'price_level']
        },
        {
          model: User,
          attributes: ['id', 'username', 'profileImage']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    res.json(recentVisits);
  } catch (error) {
    console.error('Error fetching following recent visits:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};