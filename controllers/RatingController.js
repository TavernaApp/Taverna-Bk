const Rating = require('../models/Rating');
const User = require('../models/User'); // Import the User model
const BarSequelize = require("../models/BarSequelize")
exports.getAllRatings = async (req, res) => {
  try {
    const ratings = await Rating.findAll({
      include: [
        { model: User },
        { model: BarSequelize }
      ]
    });
    res.json(ratings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.createRating = async (req, res) => {
  try {
    const { rating, comment, userId, barId } = req.body;
    
    // Check if the user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
   
    // Check if the bar exists
    const bar = await BarSequelize.findByPk(barId);
    if (!bar) {
      return res.status(404).json({ message: 'Bar not found' });
    }

    // Create the rating and include the associated user and bar objects
    const newRating = await Rating.create({ rating, comment, UserId: userId, BarId: barId }, {
      include: [
        { model: User },
        { model: BarSequelize }
      ]
    });

    res.status(201).json(newRating);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};
exports.updateRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, barId } = req.body;

    // Check if the bar exists
    const bar = await BarSequelize.findByPk(barId);
    if (!bar) {
      return res.status(404).json({ message: 'Bar not found' });
    }

    const updatedRating = await Rating.update({ rating, comment }, { where: { id } });
    res.json(updatedRating);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};
exports.deleteRating = async (req, res) => {
  try {
    const { id } = req.params;
    await Rating.destroy({ where: { id } });
    res.json({ message: 'Rating deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};
