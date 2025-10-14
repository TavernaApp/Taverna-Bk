// controllers/ReviewController.js

// TODO: Import required models
// const Review = require('../models/Review');
// const ReviewReply = require('../models/ReviewReply');
// const User = require('../models/User');
// const BarSequelize = require('../models/BarSequelize');

/**
 * Get all reviews for a specific bar
 * GET /api/reviews/:barId
 */
exports.getReviewsForBar = async (req, res) => {
  try {
    const { barId } = req.params;

    // TODO: Implement logic to fetch all reviews for the specified bar
    // - Validate that the bar exists
    // - Fetch reviews with associated user data
    // - Include review replies with user data
    // - Sort by creation date (newest first)
    // Example:
    // const bar = await BarSequelize.findByPk(barId);
    // if (!bar) {
    //   return res.status(404).json({ message: 'Bar not found' });
    // }
    // const reviews = await Review.findAll({
    //   where: { BarId: barId },
    //   include: [
    //     { model: User, attributes: ['id', 'username', 'profilePicture'] },
    //     {
    //       model: ReviewReply,
    //       include: [{ model: User, attributes: ['id', 'username', 'profilePicture'] }]
    //     }
    //   ],
    //   order: [['createdAt', 'DESC']]
    // });
    // return res.json(reviews);

    res.status(501).json({ message: 'TODO: Implement getReviewsForBar' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * Get recent reviews by a specific user
 * GET /api/reviews/user/:userId/recent
 */
exports.getUserRecentReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    // TODO: Implement logic to fetch recent reviews by the specified user
    // - Validate that the user exists
    // - Fetch user's reviews with associated bar data
    // - Limit the number of results
    // - Sort by creation date (newest first)
    // Example:
    // const user = await User.findByPk(userId);
    // if (!user) {
    //   return res.status(404).json({ message: 'User not found' });
    // }
    // const reviews = await Review.findAll({
    //   where: { UserId: userId },
    //   include: [
    //     { model: BarSequelize, attributes: ['id', 'name', 'address', 'image'] }
    //   ],
    //   order: [['createdAt', 'DESC']],
    //   limit: limit
    // });
    // return res.json(reviews);

    res.status(501).json({ message: 'TODO: Implement getUserRecentReviews' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * Create a new review
 * POST /api/reviews/
 * Requires authentication
 */
exports.createReview = async (req, res) => {
  try {
    const { barId, rating, comment } = req.body;
    const userId = req.user.id; // From authentication middleware

    // TODO: Implement logic to create a new review
    // - Validate required fields (barId, rating, comment)
    // - Validate that the bar exists
    // - Check if user already reviewed this bar (optional: prevent duplicates)
    // - Create the review with associated user and bar
    // - Return the created review with user data
    // Example:
    // if (!barId || !rating || !comment) {
    //   return res.status(400).json({ message: 'Missing required fields' });
    // }
    // const bar = await BarSequelize.findByPk(barId);
    // if (!bar) {
    //   return res.status(404).json({ message: 'Bar not found' });
    // }
    // const newReview = await Review.create({
    //   rating,
    //   comment,
    //   UserId: userId,
    //   BarId: barId
    // });
    // const reviewWithUser = await Review.findByPk(newReview.id, {
    //   include: [{ model: User, attributes: ['id', 'username', 'profilePicture'] }]
    // });
    // return res.status(201).json(reviewWithUser);

    res.status(501).json({ message: 'TODO: Implement createReview' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * Create a reply to a review
 * POST /api/reviews/:reviewId/replies
 * Requires authentication
 */
exports.createReviewReply = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { comment } = req.body;
    const userId = req.user.id; // From authentication middleware

    // TODO: Implement logic to create a reply to a review
    // - Validate that the review exists
    // - Validate required fields (comment)
    // - Create the reply with associated user and review
    // - Return the created reply with user data
    // Example:
    // const review = await Review.findByPk(reviewId);
    // if (!review) {
    //   return res.status(404).json({ message: 'Review not found' });
    // }
    // if (!comment) {
    //   return res.status(400).json({ message: 'Comment is required' });
    // }
    // const newReply = await ReviewReply.create({
    //   comment,
    //   UserId: userId,
    //   ReviewId: reviewId
    // });
    // const replyWithUser = await ReviewReply.findByPk(newReply.id, {
    //   include: [{ model: User, attributes: ['id', 'username', 'profilePicture'] }]
    // });
    // return res.status(201).json(replyWithUser);

    res.status(501).json({ message: 'TODO: Implement createReviewReply' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * Edit an existing review
 * PUT /api/reviews/:reviewId
 * Requires authentication
 */
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id; // From authentication middleware

    // TODO: Implement logic to update an existing review
    // - Validate that the review exists
    // - Verify that the user owns the review
    // - Update the review with new data
    // - Return the updated review
    // Example:
    // const review = await Review.findByPk(reviewId);
    // if (!review) {
    //   return res.status(404).json({ message: 'Review not found' });
    // }
    // if (review.UserId !== userId) {
    //   return res.status(403).json({ message: 'Unauthorized to edit this review' });
    // }
    // if (rating) review.rating = rating;
    // if (comment) review.comment = comment;
    // await review.save();
    // const updatedReview = await Review.findByPk(reviewId, {
    //   include: [{ model: User, attributes: ['id', 'username', 'profilePicture'] }]
    // });
    // return res.json(updatedReview);

    res.status(501).json({ message: 'TODO: Implement updateReview' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * Edit an existing review reply
 * PUT /api/reviews/replies/:replyId
 * Requires authentication
 */
exports.updateReviewReply = async (req, res) => {
  try {
    const { replyId } = req.params;
    const { comment } = req.body;
    const userId = req.user.id; // From authentication middleware

    // TODO: Implement logic to update an existing review reply
    // - Validate that the reply exists
    // - Verify that the user owns the reply
    // - Update the reply with new data
    // - Return the updated reply
    // Example:
    // const reply = await ReviewReply.findByPk(replyId);
    // if (!reply) {
    //   return res.status(404).json({ message: 'Reply not found' });
    // }
    // if (reply.UserId !== userId) {
    //   return res.status(403).json({ message: 'Unauthorized to edit this reply' });
    // }
    // if (comment) reply.comment = comment;
    // await reply.save();
    // const updatedReply = await ReviewReply.findByPk(replyId, {
    //   include: [{ model: User, attributes: ['id', 'username', 'profilePicture'] }]
    // });
    // return res.json(updatedReply);

    res.status(501).json({ message: 'TODO: Implement updateReviewReply' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * Delete a review
 * DELETE /api/reviews/:reviewId
 * Requires authentication
 */
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id; // From authentication middleware

    // TODO: Implement logic to delete a review
    // - Validate that the review exists
    // - Verify that the user owns the review (or is an admin)
    // - Delete all associated replies (cascade delete)
    // - Delete the review
    // - Return success message
    // Example:
    // const review = await Review.findByPk(reviewId);
    // if (!review) {
    //   return res.status(404).json({ message: 'Review not found' });
    // }
    // if (review.UserId !== userId) {
    //   return res.status(403).json({ message: 'Unauthorized to delete this review' });
    // }
    // await ReviewReply.destroy({ where: { ReviewId: reviewId } });
    // await review.destroy();
    // return res.json({ message: 'Review deleted successfully' });

    res.status(501).json({ message: 'TODO: Implement deleteReview' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * Delete a review reply
 * DELETE /api/reviews/replies/:replyId
 * Requires authentication
 */
exports.deleteReviewReply = async (req, res) => {
  try {
    const { replyId } = req.params;
    const userId = req.user.id; // From authentication middleware

    // TODO: Implement logic to delete a review reply
    // - Validate that the reply exists
    // - Verify that the user owns the reply (or is an admin)
    // - Delete the reply
    // - Return success message
    // Example:
    // const reply = await ReviewReply.findByPk(replyId);
    // if (!reply) {
    //   return res.status(404).json({ message: 'Reply not found' });
    // }
    // if (reply.UserId !== userId) {
    //   return res.status(403).json({ message: 'Unauthorized to delete this reply' });
    // }
    // await reply.destroy();
    // return res.json({ message: 'Reply deleted successfully' });

    res.status(501).json({ message: 'TODO: Implement deleteReviewReply' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};
