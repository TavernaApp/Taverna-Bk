// routes/crawlRoutes.js
const express = require('express');
const router = express.Router();
const CrawlController = require('../controllers/CrawlController');
const authenticateUser = require('../middleware/authenticationMiddleware');

// GET routes
router.get('/crawls', authenticateUser, CrawlController.getCrawls);
router.get('/crawls/user/:userId', authenticateUser, CrawlController.getUserCrawls);
router.get('/crawls/search', authenticateUser, CrawlController.searchCrawls);

// POST routes
router.post('/crawls', authenticateUser, CrawlController.createCrawl);

module.exports = router;
