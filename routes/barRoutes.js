// routes/barRoutes.js
const express = require('express');
const router = express.Router();
const BarController = require('../controllers/BarController');

// Base bar routes
router.get('/bars', BarController.getBars);
router.get('/allgetbars', BarController.getAllBars);
router.post('/bars', BarController.createBar);

// Search and discovery routes
router.post('/bars/search', BarController.searchBars);
router.post('/bars/searchbarandusers', BarController.searchBarsAndUsers);
router.post('/bars/liveLocation', BarController.getBarsByLiveLocation);
router.get('/bars/popular', BarController.getPopularBars);

// Specific bar routes (must come after other /bars/* routes to avoid conflicts)
router.get('/bars/:id', BarController.getBarById);
router.put('/bars/:id', BarController.updateBar);
router.delete('/bars/:id', BarController.deleteBar);

// Bar ratings and interaction routes
router.get('/bars/:barId/ratings', BarController.getBarRatings);
router.post('/bars/:barId/visit', BarController.logBarVisit);

module.exports = router;
