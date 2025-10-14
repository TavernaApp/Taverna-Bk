// routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/ReviewController');
const { authenticateUser } = require('../middleware/authMiddleware');

// GET routes - Public access
router.get('/reviews/:barId', ReviewController.getReviewsForBar);
router.get('/reviews/user/:userId/recent', ReviewController.getUserRecentReviews);

// POST routes - Require authentication
router.post('/reviews/', authenticateUser, ReviewController.createReview);
router.post('/reviews/:reviewId/replies', authenticateUser, ReviewController.createReviewReply);

// PUT routes - Require authentication
router.put('/reviews/:reviewId', authenticateUser, ReviewController.updateReview);
router.put('/reviews/replies/:replyId', authenticateUser, ReviewController.updateReviewReply);

// DELETE routes - Require authentication
router.delete('/reviews/:reviewId', authenticateUser, ReviewController.deleteReview);
router.delete('/reviews/replies/:replyId', authenticateUser, ReviewController.deleteReviewReply);

module.exports = router;
