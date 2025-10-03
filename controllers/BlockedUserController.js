
// controllers/BlockedUserController.js
const BlockedUser = require('../models/BlockedUser');
const User = require('../models/User');

exports.blockUser = async (req, res) => {
  try {
    // Get the ID of the logged-in user from the request object
    const loggedInUserId = req.user.id;

    // Get the ID of the user to be blocked from the request parameters
    const { userId } = req.params;

    // Extract the reason for blocking from the request body
    const { reason } = req.body;

    // Create a new BlockedUser record with the logged-in user as the blocker
    await BlockedUser.create({ userId, blockedBy: loggedInUserId, reason });

    // Fetch details of the blocked user and the logged-in user
    const blockedUser = await User.findByPk(userId);
    const loggedInUser = await User.findByPk(loggedInUserId);

    // Optionally, you may want to implement additional actions such as removing the user from followers/following list, etc.

    res.status(201).json({
      message: 'User blocked successfully',
      blockedUser: {
        id: blockedUser.id,
        username: blockedUser.username,
        email: blockedUser.email,
        // Include any other relevant details
      },
      loggedInUser: {
        id: loggedInUser.id,
        username: loggedInUser.username,
        email: loggedInUser.email,
        // Include any other relevant details
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// controllers/BlockedUserController.js

// exports.unblockUser = async (req, res) => {
//   try {
//     // Get the ID of the logged-in user from the request object
//     const loggedInUserId = req.user.id;

//     // Get the ID of the user to be unblocked from the request parameters
//     const { userId } = req.params;

//     // Delete the BlockedUser record corresponding to the logged-in user and the user to be unblocked
//     await BlockedUser.destroy({ where: { userId, blockedBy: loggedInUserId } });

//     res.status(200).json({ message: 'User unblocked successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server Error' });
//   }
// };
// controllers/BlockedUserController.js

exports.unblockUser = async (req, res) => {
  try {
    // Get the ID of the logged-in user from the request object
    const loggedInUserId = req.user.id;

    // Get the ID of the user to be unblocked from the request parameters
    const { userId } = req.params;

    // Delete the BlockedUser record corresponding to the logged-in user and the user to be unblocked
    await BlockedUser.destroy({ where: { userId, blockedBy: loggedInUserId } });

    // Fetch details of the unblocked user and the logged-in user
    const unblockedUser = await User.findByPk(userId);
    const loggedInUser = await User.findByPk(loggedInUserId);

    res.status(200).json({
      message: 'User unblocked successfully',
      unblockedUser: {
        id: unblockedUser.id,
        username: unblockedUser.username,
        email: unblockedUser.email,
        // Include any other relevant details
      },
      loggedInUser: {
        id: loggedInUser.id,
        username: loggedInUser.username,
        email: loggedInUser.email,
        // Include any other relevant details
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
