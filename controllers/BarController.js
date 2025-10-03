// controllers/BarController.js

const axios = require('axios');
const BarSequelize = require('../models/BarSequelize'); // Import the Bar model/schema
const Rating = require('../models/Rating');
const User = require('../models/User');

exports.getBars = async (req, res) => {
  try {
    const { pagetoken } = req.query;
    let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=37.0902,-95.7129&radius=5000000&type=bar&key=AIzaSyDxx2oXSM9zhlBb3h1UoEfBjSzTWY1yt7A`;

    if (pagetoken) {
      url += `&pagetoken=${pagetoken}`;
    }

    const response = await axios.get(url);
    const bars = response.data.results;
    const nextPageToken = response.data.next_page_token;

    // Save data to database
    for (const bar of bars) {
      await BarSequelize.findOrCreate({
        where: { reference: bar.reference },
        defaults: bar
      });
    }

    const barsWithRatings = await Promise.all(bars.map(async (bar) => {
      const dbBar = await BarSequelize.findOne({ where: { reference: bar.reference } });
      if (dbBar) {
        const ratings = await Rating.findAll({ where: { BarId: dbBar.id }, include: [User] });
        const totalRatings = ratings.length;
        const sumOfRatings = ratings.reduce((sum, rating) => sum + rating.rating, 0); // Calculate sum of all ratings
        const averageRating = totalRatings > 0 ? sumOfRatings / totalRatings : 0; // Calculate average rating
        return { ...dbBar.toJSON(), ratings, averageRating, totalRatings };
      }
      return null;
    }));

    res.json({ bars: barsWithRatings, nextPageToken });
  } catch (error) {
    console.error('Error fetching bars:', error);
    res.status(500).json({ message: 'Error fetching bars' });
  }
};

// exports.getBars = async (req, res) => {
//   try {
//     const { pagetoken } = req.query;
//     let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=37.0902,-95.7129&radius=5000000&type=bar&key=AIzaSyDxx2oXSM9zhlBb3h1UoEfBjSzTWY1yt7A`;

//     if (pagetoken) {
//       url += `&pagetoken=${pagetoken}`;
//     }

//     const response = await axios.get(url);
//     const bars = response.data.results;
//     const nextPageToken = response.data.next_page_token;

//  // Save data to database
// for (const bar of bars) {
//   // Filter out unrecognized attributes
//   const { icon_mask_base_uri, opening_hours, photos, place_id, plus_code, price_level, rating, types, ...filteredDefaults } = bar;
  
//   const [dbBar, created] = await BarSequelize.findOrCreate({
//     where: { reference: bar.reference },
//     defaults: filteredDefaults
//   });

//   if (created || dbBar) {
//     // Logic to handle when a new instance is created or existing instance is found
//     console.log('Bar saved:', dbBar.toJSON());
//   } else {
//     // Handle the case where neither a new instance was created nor an existing one was found
//     console.log('Error saving bar:', bar);
//   }
// }


//     const barsWithRatings = await Promise.all(bars.map(async (bar) => {
//       const dbBar = await BarSequelize.findOne({ where: { reference: bar.reference } });
//       if (dbBar) {
//         const ratings = await Rating.findAll({ where: { BarId: dbBar.id }, include: [User] });
//         const totalRatings = ratings.length;
//         const sumOfRatings = ratings.reduce((sum, rating) => sum + rating.rating, 0); // Calculate sum of all ratings
//         const averageRating = totalRatings > 0 ? sumOfRatings / totalRatings : 0; // Calculate average rating
//         return { ...dbBar.toJSON(), ratings, averageRating, totalRatings };
//       }
//       return null;
//     }));

//     res.json({ bars: barsWithRatings, nextPageToken });
//   } catch (error) {
//     console.error('Error fetching bars:', error);
//     res.status(500).json({ message: 'Error fetching bars' });
//   }
// };



// Get all bars

exports.getAllBars = async (req, res) => {
  try {
    const bars = await BarSequelize.findAll();
    // Fetch ratings and user information for each bar
    const barsWithRatings = await Promise.all(bars.map(async (bar) => {
      const ratings = await Rating.findAll({ where: { barId: bar.id }, include: [User] });
      const totalRatings = ratings.length;
      const sumOfRatings = ratings.reduce((sum, rating) => sum + rating.rating, 0); // Calculate sum of all ratings
      const averageRating = totalRatings > 0 ? sumOfRatings / totalRatings : 0; // Calculate average rating
      return { ...bar.toJSON(), ratings, averageRating, totalRatings };
    }));
    res.json(barsWithRatings);
  } catch (error) {
    console.error('Error fetching bars:', error);
    res.status(500).json({ message: 'Error fetching bars' });
  }
};
// Function to create a new bar
exports.createBar = async (req, res) => {
  try {
    // Extract necessary data from request body
    const { name, business_status, geometry, icon, icon_background_color, rating, reference, scope, user_ratings_total, vicinity } = req.body;

    // Create the bar in the database
    const newBar = await BarSequelize.create({
      name,
      business_status,
      geometry,
      icon,
      icon_background_color,
      rating,
      reference,
      scope,
      user_ratings_total,
      vicinity
    });

    // Send response with the newly created bar
    res.status(201).json(newBar);
  } catch (error) {
    console.error('Error creating bar:', error);
    res.status(500).json({ message: 'Error creating bar' });
  }
};
// Get a single bar by ID
exports.getBarById = async (req, res) => {
  try {
    const { id } = req.params;
    const bar = await BarSequelize.findByPk(id);
    if (bar) {
      res.json(bar);
    } else {
      res.status(404).json({ message: 'Bar not found' });
    }
  } catch (error) {
    console.error('Error fetching bar:', error);
    res.status(500).json({ message: 'Error fetching bar' });
  }
};

// Update a bar
exports.updateBar = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, business_status, geometry, icon, icon_background_color, rating, reference, scope, user_ratings_total, vicinity } = req.body;
    const [updated] = await BarSequelize.update({ name, business_status, geometry, icon, icon_background_color, rating, reference, scope, user_ratings_total, vicinity }, { where: { id } });
    if (updated) {
      const updatedBar = await BarSequelize.findByPk(id);
      res.json(updatedBar);
    } else {
      res.status(404).json({ message: 'Bar not found' });
    }
  } catch (error) {
    console.error('Error updating bar:', error);
    res.status(500).json({ message: 'Error updating bar' });
  }
};

// Delete a bar
exports.deleteBar = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await BarSequelize.destroy({ where: { id } });
    if (deleted) {
      res.json({ message: 'Bar deleted successfully' });
    } else {
      res.status(404).json({ message: 'Bar not found' });
    }
  } catch (error) {
    console.error('Error deleting bar:', error);
    res.status(500).json({ message: 'Error deleting bar' });
  }
};