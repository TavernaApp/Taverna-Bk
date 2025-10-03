// routes/ratingRoutes.js
const express = require('express');
const router = express.Router();
const RatingController = require('../controllers/RatingController');

router.get('/ratings', RatingController.getAllRatings);
router.post('/ratings', RatingController.createRating);
router.put('/ratings/:id', RatingController.updateRating);
router.delete('/ratings/:id', RatingController.deleteRating);

module.exports = router;
