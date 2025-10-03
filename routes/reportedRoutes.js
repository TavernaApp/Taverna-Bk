// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const reportUser = require('../controllers/ReportUserController');
const authenticateUser = require('../middleware/authenticationMiddleware');

// Report user routes
router.post('/report/:reporterId', authenticateUser, reportUser.reportUser);
router.post('/reportBar/:userId/:barId', authenticateUser, reportUser.reportBar);

module.exports = router;
