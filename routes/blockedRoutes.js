// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const blockedUserController  = require('../controllers/BlockedUserController');
const authenticateUser = require('../middleware/authenticationMiddleware');

// Blocked user routes
router.post('/block/:userId', authenticateUser, blockedUserController.blockUser);
router.delete('/unblock/:userId', authenticateUser, blockedUserController.unblockUser); // New route for unblocking a user

module.exports = router;
